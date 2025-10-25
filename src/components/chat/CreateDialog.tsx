import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Search } from "lucide-react";
import { useState } from "react";
import type { User } from"../chat/types/types";

interface CreateDMDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
  onCreateDM: (userId: string) => void;
}

export function CreateDMDialog({
  open,
  onOpenChange,
  users,
  onCreateDM,
}: CreateDMDialogProps) {
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Direct Message</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {filteredUsers.map((user) => (
              <Button
                key={user.id}
                variant="ghost"
                className="w-full justify-start h-auto p-3 mb-1"
                onClick={() => onCreateDM(user.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.initials}</AvatarFallback>
                    </Avatar>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-white rounded-full ${
                      user.status === 'online' ? 'bg-green-500' :
                      user.status === 'away' ? 'bg-yellow-500' :
                      'bg-gray-400'
                    }`} />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}