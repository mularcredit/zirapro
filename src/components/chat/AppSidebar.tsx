import { Hash, MessageSquare, Plus, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "./ui/sidebar";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useState } from "react";
import { CreateChannelDialog } from "./CreateDialogChannel";
import { CreateDMDialog } from "./CreateDialog";
import { SettingsDialog } from "./SettingsDialog";
import type { Channel, User, DirectMessage } from "../chat/types/types";

interface AppSidebarProps {
  channels: Channel[];
  directMessages: DirectMessage[];
  activeChannel: Channel | DirectMessage | null;
  onChannelSelect: (channel: Channel | DirectMessage) => void;
  onChannelCreate: (name: string, isPrivate?: boolean) => void;
  onDMCreate: (userId: string) => void;
  currentUser: User | null;
  users: User[];
}

export function AppSidebar({ 
  channels = [], 
  directMessages = [], 
  activeChannel, 
  onChannelSelect, 
  onChannelCreate,
  onDMCreate,
  currentUser,
  users = [] 
}: AppSidebarProps) {
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showCreateDM, setShowCreateDM] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Safe user data with fallbacks
  const safeCurrentUser = currentUser || {
    id: 'unknown',
    name: 'User',
    avatar: '',
    initials: 'U',
    email: '',
    status: 'offline' as const
  };

  const handleAddChannel = () => {
    setShowCreateChannel(true);
  };

  const handleAddDM = () => {
    setShowCreateDM(true);
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  const handleChannelCreate = (name: string, isPrivate: boolean = false) => {
    onChannelCreate(name, isPrivate);
    setShowCreateChannel(false);
  };

  const handleDMCreate = (userId: string) => {
    onDMCreate(userId);
    setShowCreateDM(false);
  };

  // Filter users for DM creation (exclude current user safely)
  const availableUsers = users.filter(user => user.id !== safeCurrentUser.id);

  // Check if channel is active safely
  const isChannelActive = (channel: Channel | DirectMessage) => {
    return activeChannel?.id === channel.id;
  };

  return (
    <>
      <Sidebar className="border-r border-sidebar-border">
        <SidebarHeader className="border-b border-sidebar-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <img src="/solo.png"></img>
              </div>
              <div>
                <h2 className="font-semibold text-sidebar-foreground">ZiraTeams</h2>
                <p className="text-xs text-muted-foreground">smiles start here</p>
              </div>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between px-4">
              Channels
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleAddChannel}>
                <Plus className="h-4 w-4" />
              </Button>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {channels.length > 0 ? (
                  channels.map((channel) => (
                    <SidebarMenuItem key={channel.id}>
                      <SidebarMenuButton
                        onClick={() => onChannelSelect(channel)}
                        isActive={isChannelActive(channel)}
                        className="group"
                      >
                        <Hash className="h-4 w-4" />
                        <span className="flex-1">{channel.name}</span>
                        {channel.unread_count && channel.unread_count > 0 && (
                          <Badge variant="default" className="h-5 min-w-5 px-1.5 text-xs">
                            {channel.unread_count > 99 ? '99+' : channel.unread_count}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                ) : (
                  <div className="px-4 py-2">
                    <p className="text-sm text-muted-foreground">No channels yet</p>
                  </div>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between px-4">
              Direct Messages
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleAddDM}>
                <Plus className="h-4 w-4" />
              </Button>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {directMessages.length > 0 ? (
                  directMessages.map((dm) => (
                    <SidebarMenuItem key={dm.id}>
                      <SidebarMenuButton
                        onClick={() => onChannelSelect(dm)}
                        isActive={isChannelActive(dm)}
                        className="group"
                      >
                        <div className="relative">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={dm.avatar || ''} />
                            <AvatarFallback>{dm.initials || 'U'}</AvatarFallback>
                          </Avatar>
                          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-sidebar-background rounded-full ${
                            dm.status === 'online' ? 'bg-[hsl(var(--online-status))]' :
                            dm.status === 'away' ? 'bg-[hsl(var(--away-status))]' :
                            'bg-[hsl(var(--offline-status))]'
                          }`}></span>
                        </div>
                        <span className="flex-1">{dm.name || 'Unknown User'}</span>
                        {dm.unread_count && dm.unread_count > 0 && (
                          <Badge variant="default" className="h-5 min-w-5 px-1.5 text-xs">
                            {dm.unread_count > 99 ? '99+' : dm.unread_count}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                ) : (
                  <div className="px-4 py-2">
                    <p className="text-sm text-muted-foreground">No direct messages</p>
                  </div>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={safeCurrentUser.avatar || ''} />
                  <AvatarFallback>
                    {safeCurrentUser.initials || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-sidebar-background rounded-full ${
                  safeCurrentUser.status === 'online' ? 'bg-[hsl(var(--online-status))]' :
                  safeCurrentUser.status === 'away' ? 'bg-[hsl(var(--away-status))]' :
                  'bg-[hsl(var(--offline-status))]'
                }`}></span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {safeCurrentUser.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {safeCurrentUser.status === 'online' ? 'Online' : 
                   safeCurrentUser.status === 'away' ? 'Away' : 'Offline'}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={handleSettings}
              disabled={!currentUser}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <CreateChannelDialog
        open={showCreateChannel}
        onOpenChange={setShowCreateChannel}
        onCreateChannel={handleChannelCreate}
      />

      <CreateDMDialog
        open={showCreateDM}
        onOpenChange={setShowCreateDM}
        users={availableUsers}
        onCreateDM={handleDMCreate}
      />

      <SettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
        user={safeCurrentUser}
      />
    </>
  );
}