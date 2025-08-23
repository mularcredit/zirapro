import { useState } from 'react';

const VideoConferenceComponent= () => {
  const [meetingCode, setMeetingCode] = useState('');
  const [userName, setUserName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinMeeting = (e) => {
    e.preventDefault();
    if (!meetingCode.trim() || !userName.trim()) return;
    
    setIsLoading(true);
    // Simulate loading for a better UX
    setTimeout(() => {
      setIsJoined(true);
      setIsLoading(false);
    }, 1500);
  };

  const handleLeaveMeeting = () => {
    setIsJoined(false);
    setMeetingCode('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Video Conference
          </h1>
          <p className="text-gray-600">
            Join meetings seamlessly with Google Meet integration
          </p>
        </header>

        {!isJoined ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-md mx-auto">
            <div className="bg-blue-600 p-5 text-white">
              <h2 className="text-xl font-semibold">Join a Meeting</h2>
              <p className="text-blue-100 text-sm mt-1">
                Enter the meeting code provided by the organizer
              </p>
            </div>
            
            <form onSubmit={handleJoinMeeting} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Code
                </label>
                <input
                  type="text"
                  value={meetingCode}
                  onChange={(e) => setMeetingCode(e.target.value)}
                  placeholder="e.g. abc-defg-hij"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter the code without spaces or special characters
                </p>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center ${
                  isLoading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Joining...
                  </>
                ) : (
                  'Join Meeting'
                )}
              </button>
            </form>
            
            <div className="bg-gray-50 p-5 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Don't have a code?</h3>
              <p className="text-xs text-gray-600">
                
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden">
            <div className="flex justify-between items-center bg-gray-800 px-6 py-4">
              <h2 className="text-white font-medium">Meeting: {meetingCode}</h2>
              <button
                onClick={handleLeaveMeeting}
                className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Leave Meeting
              </button>
            </div>
            
            <div className="aspect-video bg-black">
              <iframe
                src={`https://meet.google.com/${meetingCode}`}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="camera; microphone; fullscreen; display-capture"
                title="Google Meet"
                className="min-h-[500px]"
              ></iframe>
            </div>
            
            <div className="bg-gray-800 p-4 text-center text-gray-400 text-sm">
              <p>Powered by Google Meet. By using this service, you agree to Google's Terms of Service.</p>
            </div>
          </div>
        )}
        
        <footer className="text-center mt-10 text-gray-600 text-sm">
          <p></p>
        </footer>
      </div>
    </div>
  );
};

export default VideoConferenceComponent;