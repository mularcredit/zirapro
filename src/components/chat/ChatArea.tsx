import { Hash, MoreVertical, Search, Users, Pin, Bell, BellOff } from "lucide-react";
import { Button } from "./ui/button";
import { SidebarTrigger } from "./ui/sidebar";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useState } from "react";
import { SearchDialog } from "./SearchDialog";
import { MembersDialog } from "./MembersDialog";
import type { Channel, DirectMessage, Message } from "../chat/types/types";

interface ChatAreaProps {
  channel: Channel | DirectMessage;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onToggleMute: (channelId: string) => void;
  isMuted?: boolean;
}

export function ChatArea({ channel, messages, onSendMessage, onToggleMute, isMuted = false }: ChatAreaProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  const handleSearch = () => {
    setShowSearch(true);
  };

  const handleShowUsers = () => {
    setShowMembers(true);
  };

  const handleToggleMute = () => {
    onToggleMute(channel.id);
  };

  const handleMoreOptions = () => {
    // Could implement more options like channel settings, pinned messages, etc.
    alert('More options functionality');
  };

  return (
    <>
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              {channel.type === 'channel' ? (
                <Hash className="h-5 w-5 text-muted-foreground" />
              ) : (
                <div className="relative">
                  <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs font-medium">{channel.initials}</span>
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 border border-card rounded-full ${
                    channel.status === 'online' ? 'bg-[hsl(var(--online-status))]' :
                    channel.status === 'away' ? 'bg-[hsl(var(--away-status))]' :
                    'bg-[hsl(var(--offline-status))]'
                  }`}></span>
                </div>
              )}
              <h1 className="font-semibold text-foreground">
                {channel.type === 'channel' ? channel.name : channel.name}
              </h1>
              {channel.type === 'channel' && (
                <span className="text-xs text-muted-foreground">
                  {channel.memberCount} members
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleToggleMute}>
              {isMuted ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
            {channel.type === 'channel' && (
              <Button variant="ghost" size="icon" onClick={handleShowUsers}>
                <Users className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={handleMoreOptions}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Messages */}
        <MessageList messages={messages} channel={channel} />

        {/* Input */}
        <MessageInput 
          channelName={channel.name} 
          onSendMessage={onSendMessage}
          disabled={isMuted}
        />
      </div>

      <SearchDialog
        open={showSearch}
        onOpenChange={setShowSearch}
        channel={channel}
        messages={messages}
      />

      {channel.type === 'channel' && (
        <MembersDialog
          open={showMembers}
          onOpenChange={setShowMembers}
          channel={channel}
        />
      )}
    </>
  );
}