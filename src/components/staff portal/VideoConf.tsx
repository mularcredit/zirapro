import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

const VideoConferenceComponent = () => {
  const [roomName, setRoomName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const jitsiContainerRef = useRef(null);
  const navigate = useNavigate();

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (user?.email) {
          setDisplayName(user.email.split('@')[0]);
        }
      } catch (error) {
        toast.error('Failed to load user data');
        console.error('User data error:', error);
      }
    };

    fetchUserData();
  }, []);

  // Load Jitsi Meet API when meeting starts
  useEffect(() => {
    if (meetingStarted && jitsiContainerRef.current) {
      const loadJitsiScript = () => {
        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = initializeJitsiMeeting;
        script.onerror = () => {
          toast.error('Failed to load Jitsi Meet API');
          setIsLoading(false);
        };
        document.body.appendChild(script);
      };

      const initializeJitsiMeeting = () => {
        try {
          const domain = 'meet.jit.si';
          const options = {
            roomName: roomName,
            width: '100%',
            height: '100%',
            parentNode: jitsiContainerRef.current,
            userInfo: {
              displayName: displayName,
              email: '', // Add if available
            },
            configOverwrite: {
              disableSimulcast: false,
              enableWelcomePage: false,
              prejoinPageEnabled: false,
            },
            interfaceConfigOverwrite: {
              DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
              SHOW_CHROME_EXTENSION_BANNER: false,
            },
          };

          const api = new window.JitsiMeetExternalAPI(domain, options);
          
          api.addEventListener('readyToClose', () => {
            setMeetingStarted(false);
          });

          api.addEventListener('participantLeft', (event) => {
            if (event.id === api.getParticipantById(event.id).id) {
              // Handle participant leaving
            }
          });

          setIsLoading(false);
        } catch (error) {
          console.error('Jitsi initialization error:', error);
          toast.error('Failed to start Jitsi meeting');
          setIsLoading(false);
        }
      };

      setIsLoading(true);
      if (!window.JitsiMeetExternalAPI) {
        loadJitsiScript();
      } else {
        initializeJitsiMeeting();
      }

      return () => {
        // Cleanup
        const jitsiScript = document.querySelector('script[src*="external_api.js"]');
        if (jitsiScript) {
          document.body.removeChild(jitsiScript);
        }
      };
    }
  }, [meetingStarted, roomName, displayName]);

  const startMeeting = () => {
    if (!roomName.trim()) {
      toast.error('Please enter a room name');
      return;
    }

    if (!displayName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setMeetingStarted(true);
  };

  const leaveMeeting = () => {
    setMeetingStarted(false);
  };

  if (meetingStarted) {
    return (
      <div className="h-screen w-full bg-gray-900 relative">
        <div ref={jitsiContainerRef} className="h-full w-full"></div>
        <button 
          onClick={leaveMeeting}
          className="fixed bottom-4 right-4 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 z-50"
        >
          Leave Meeting
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 p-4 text-white">
          <h2 className="text-xl font-medium">Start Video Conference</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Room Name
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <button
            onClick={startMeeting}
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md text-white ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </span>
            ) : (
              'Join Meeting'
            )}
          </button>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Join</h3>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setRoomName('general-meeting')}
                className="text-sm bg-gray-100 hover:bg-gray-200 py-1 px-3 rounded"
              >
                General
              </button>
              <button 
                onClick={() => setRoomName('team-huddle')}
                className="text-sm bg-gray-100 hover:bg-gray-200 py-1 px-3 rounded"
              >
                Team Huddle
              </button>
              <button 
                onClick={() => setRoomName('support-room')}
                className="text-sm bg-gray-100 hover:bg-gray-200 py-1 px-3 rounded"
              >
                Support
              </button>
              <button 
                onClick={() => setRoomName('random-chat')}
                className="text-sm bg-gray-100 hover:bg-gray-200 py-1 px-3 rounded"
              >
                Random
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Powered by Jitsi Meet</p>
      </div>
    </div>
  );
};

export default VideoConferenceComponent;