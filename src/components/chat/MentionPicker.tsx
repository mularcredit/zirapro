import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

const mockUsers = [
  { id: "1", name: "Sarah Kim", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", initials: "SK" },
  { id: "2", name: "Mike Chen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike", initials: "MC" },
  { id: "3", name: "Emma Johnson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma", initials: "EJ" },
  { id: "4", name: "Alex Rodriguez", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", initials: "AR" },
];

interface MentionPickerProps {
  onMentionSelect: (user: { id: string; name: string }) => void;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MentionPicker({ onMentionSelect, children, open, onOpenChange }: MentionPickerProps) {
  const [search, setSearch] = useState("");

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="max-h-60 overflow-y-auto">
          {filteredUsers.map((user) => (
            <Button
              key={user.id}
              variant="ghost"
              className="w-full justify-start h-auto p-2"
              onClick={() => onMentionSelect(user)}
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{user.name}</span>
              </div>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}