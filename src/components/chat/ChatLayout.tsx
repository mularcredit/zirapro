import { useState, useEffect } from "react";
import { SidebarProvider } from "./ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ChatArea } from "./ChatArea";
import { chatService } from "./services/chatServices";
import { supabase } from "../../lib/supabase";

export function ChatLayout() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('maker');
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Use the SAME pattern as PayrollDashboard
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log("🔐 ChatLayout: Fetching user profile...");
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        console.log("🔐 ChatLayout: Supabase auth response:", { user, userError });

        if (userError || !user) {
          console.warn('User not authenticated in ChatLayout');
          setAuthLoading(false);
          return;
        }

        setCurrentUser(user);

        // Try to get user profile, default to maker if not found
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.warn('No user profile found in ChatLayout, defaulting to maker role');
          setUserRole('maker');
        } else {
          setUserRole(profile.role || 'maker');
        }
      } catch (error) {
        console.error('Error fetching user profile in ChatLayout:', error);
        setUserRole('maker');
      } finally {
        setAuthLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Load channels when user is available
  useEffect(() => {
    if (currentUser && !authLoading) {
      console.log("✅ ChatLayout: User available, loading channels...", currentUser);
      loadUserChannels();
    } else if (!authLoading && !currentUser) {
      console.log("❌ ChatLayout: No user found after auth loading completed");
      setLoading(false);
    }
  }, [currentUser, authLoading]);

  const loadUserChannels = async () => {
    try {
      console.log("📡 ChatLayout: Loading user channels for user ID:", currentUser?.id);
      setError(null);
      const userChannels = await chatService.getUserChannels(currentUser.id);
      console.log("✅ ChatLayout: Loaded channels:", userChannels);
      
      setChannels(userChannels);
      
      if (userChannels.length > 0) {
        setActiveChannel(userChannels[0]);
        await loadMessages(userChannels[0].id);
      } else {
        console.log("ℹ️ ChatLayout: No channels found for user");
      }
    } catch (error) {
      console.error('❌ ChatLayout: Error loading channels:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (channelId: string) => {
    try {
      console.log("📡 ChatLayout: Loading messages for channel:", channelId);
      const channelMessages = await chatService.getChannelMessages(channelId);
      console.log("✅ ChatLayout: Loaded messages:", channelMessages);
      setMessages(channelMessages);
    } catch (error) {
      console.error('❌ ChatLayout: Error loading messages:', error);
      setError(error.message);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!activeChannel || !content.trim() || !currentUser) {
      console.log("❌ ChatLayout: Cannot send message - missing requirements");
      return;
    }
    
    try {
      console.log("📤 ChatLayout: Sending message:", content);
      const newMessage = await chatService.sendMessage(activeChannel.id, currentUser.id, content);
      console.log("✅ ChatLayout: Message sent:", newMessage);
      
      if (newMessage) {
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (error) {
      console.error('❌ ChatLayout: Error sending message:', error);
      setError(error.message);
    }
  };

  const handleChannelCreate = async (name: string, isPrivate: boolean = false) => {
    if (!currentUser) {
      console.error('❌ ChatLayout: Cannot create channel: No user found');
      setError('You must be logged in to create a channel');
      return;
    }

    try {
      console.log("🆕 ChatLayout: Creating channel:", name, "for user:", currentUser.id);
      const newChannel = await chatService.createChannel(name, currentUser.id, isPrivate);
      console.log("✅ ChatLayout: Created channel:", newChannel);
      setChannels(prev => [...prev, newChannel]);
      setActiveChannel(newChannel);
      setMessages([]);
    } catch (error) {
      console.error('❌ ChatLayout: Error creating channel:', error);
      setError(error.message);
    }
  };

  const handleChannelSelect = async (channel) => {
    console.log("🎯 ChatLayout: Channel selected:", channel);
    setActiveChannel(channel);
    await loadMessages(channel.id);
    
    if (currentUser) {
      try {
        await chatService.markMessagesAsRead(channel.id, currentUser.id);
      } catch (error) {
        console.error('❌ ChatLayout: Error marking messages as read:', error);
      }
    }
  };

  const handleDMCreate = async (userId: string) => {
    console.log("💬 ChatLayout: Create DM with user:", userId);
    setError('Direct message functionality coming soon!');
  };

  // Real-time messages subscription
  useEffect(() => {
    if (!activeChannel) return;

    console.log("🔔 ChatLayout: Setting up real-time subscription for channel:", activeChannel.id);
    const subscription = chatService.subscribeToMessages(activeChannel.id, (newMessage) => {
      console.log("📨 ChatLayout: New real-time message:", newMessage);
      
      if (newMessage.author) {
        setMessages(prev => [...prev, newMessage]);
      } else {
        loadMessages(activeChannel.id);
      }
    });

    return () => {
      console.log("🧹 ChatLayout: Cleaning up subscription");
      if (subscription) {
        chatService.unsubscribe(subscription);
      }
    };
  }, [activeChannel?.id]);

  // Get safe user data for the sidebar - matches PayrollDashboard pattern
  const getSafeUserData = () => {
    if (!currentUser) return null;

    return {
      id: currentUser.id,
      name: currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'User',
      avatar: currentUser.user_metadata?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.id}`,
      initials: currentUser.user_metadata?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U',
      email: currentUser.email,
      status: 'online' as const
    };
  };

  // Update the loading states
  if (authLoading) {
    return (
      <div className="flex min-h-screen w-full bg-background items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen w-full bg-background items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    console.log("🚫 ChatLayout: Rendering sign-in message because currentUser is:", currentUser);
    return (
      <div className="flex min-h-screen w-full bg-background items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in</h2>
          <p className="text-muted-foreground mb-4">You need to be signed in to use the chat.</p>
          <div className="mt-4 p-4 bg-muted rounded-lg text-left max-w-md">
            <p className="text-sm font-semibold mb-2">Debug info:</p>
            <p className="text-xs">Current User: {currentUser ? 'Exists' : 'None'}</p>
            <p className="text-xs">Auth Loading: {authLoading ? 'Yes' : 'No'}</p>
            <p className="text-xs">Chat Loading: {loading ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen w-full bg-background items-center justify-center">
        <div className="text-center text-destructive max-w-md">
          <h3 className="text-lg font-semibold mb-2">Error</h3>
          <p className="mb-4">{error}</p>
          <button 
            onClick={loadUserChannels}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar 
          channels={channels}
          directMessages={[]}
          activeChannel={activeChannel}
          onChannelSelect={handleChannelSelect}
          onChannelCreate={handleChannelCreate}
          onDMCreate={handleDMCreate}
          currentUser={getSafeUserData()}
          users={[]}
        />
        {activeChannel ? (
          <ChatArea 
            channel={activeChannel}
            messages={messages}
            onSendMessage={handleSendMessage}
            onToggleMute={(channelId) => {
              console.log("🔇 ChatLayout: Toggle mute for channel:", channelId);
            }}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <h3 className="text-lg font-semibold mb-2">Welcome to Team Chat</h3>
              <p className="mb-4">Create your first channel to get started</p>
              <button 
                onClick={() => handleChannelCreate('general')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Create General Channel
              </button>
            </div>
          </div>
        )}
      </div>
    </SidebarProvider>
  );
}