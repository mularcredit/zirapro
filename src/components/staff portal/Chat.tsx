// ChatComponent.tsx
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';

const ChatComponent = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentChannel, setCurrentChannel] = useState('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('channel', currentChannel)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(data || []);
      }
    };

    fetchMessages();

    // Set up real-time subscription
    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `channel=eq.${currentChannel}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [currentChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from('messages')
        .insert([{
          content: newMessage,
          sender_id: user.id,
          sender_email: user.email,
          channel: currentChannel,
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Error sending message:', error);
      } else {
        setNewMessage('');
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="flex border-b border-gray-200 p-4">
        <h2 className="text-lg font-medium">Staff Chat</h2>
        <div className="ml-auto flex space-x-2">
          <select 
            value={currentChannel}
            onChange={(e) => setCurrentChannel(e.target.value)}
            className="text-sm border rounded p-1"
          >
            <option value="general">General</option>
            <option value="support">Support</option>
            <option value="random">Random</option>
          </select>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              {message.sender_email?.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">
                {message.sender_email}
                <span className="ml-2 text-xs text-gray-500">
                  {new Date(message.created_at).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-sm text-gray-700 mt-1">
                {message.content}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border rounded-l-md p-2 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-r-md hover:bg-green-700"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;