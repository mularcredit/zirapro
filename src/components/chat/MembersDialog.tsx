import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import type { Channel } from "../chat/types/types";

interface MembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel: Channel;
}

const mockMembers = [
  { id: "1", name: "Sarah Kim", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", initials: "SK", status: "online", role: "admin" },
  { id: "2", name: "Mike Chen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike", initials: "MC", status: "online", role: "member" },
  { id: "3", name: "Emma Johnson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma", initials: "EJ", status: "away", role: "member" },
  { id: "4", name: "Alex Rodriguez", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", initials: "AR", status: "online", role: "member" },
];

export function MembersDialog({ open, onOpenChange, channel }: MembersDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Members - {channel.name} ({mockMembers.length})
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-2">
          {mockMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>{member.initials}</AvatarFallback>
                  </Avatar>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-white rounded-full ${
                    member.status === 'online' ? 'bg-green-500' :
                    member.status === 'away' ? 'bg-yellow-500' :
                    'bg-gray-400'
                  }`} />
                </div>
                <div>
                  <div className="font-medium text-sm">{member.name}</div>
                </div>
              </div>
              <Badge variant={member.role === 'admin' ? 'default' : 'outline'}>
                {member.role}
              </Badge>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}