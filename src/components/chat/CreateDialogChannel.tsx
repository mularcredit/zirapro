import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Hash, Lock } from "lucide-react";

interface CreateChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateChannel: (name: string, isPrivate: boolean) => void;
}

export function CreateChannelDialog({
  open,
  onOpenChange,
  onCreateChannel,
}: CreateChannelDialogProps) {
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Channel name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onCreateChannel(name.trim(), isPrivate);
      setName("");
      setIsPrivate(false);
    } catch (err) {
      setError(err.message || "Failed to create channel");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setName("");
      setIsPrivate(false);
      setError("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Channel</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="channel-name">Channel Name</Label>
            <div className="relative">
              {isPrivate ? (
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              ) : (
                <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              )}
              <Input
                id="channel-name"
                placeholder="channel-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                className="pl-10"
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="private-channel" className="flex flex-col space-y-1">
              <span>Private Channel</span>
              <span className="font-normal text-sm text-muted-foreground">
                Only invited members can join
              </span>
            </Label>
            <Switch
              id="private-channel"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
              disabled={loading}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || loading}>
              {loading ? "Creating..." : "Create Channel"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}