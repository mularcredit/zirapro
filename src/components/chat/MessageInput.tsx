import { useState, useRef } from "react";
import { Send, Paperclip, Smile, AtSign, Image, X } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { EmojiPicker } from "./EmojiPicker";
import { MentionPicker } from "./MentionPicker";

interface MessageInputProps {
  channelName: string;
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

interface FilePreview {
  file: File;
  url: string;
}

export function MessageInput({ channelName, onSendMessage, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && files.length === 0) || disabled) return;

    if (files.length > 0) {
      // Handle file uploads
      files.forEach(file => {
        // In real app, upload file and get URL
        console.log('Uploading file:', file.file.name);
      });
    }

    if (message.trim()) {
      onSendMessage(message);
    } else if (files.length > 0) {
      // Send message with files
      onSendMessage(`Sent ${files.length} file(s)`);
    }
    
    setMessage("");
    setFiles([]);
  };

  const handleAttachment = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newFiles = selectedFiles.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].url);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleMentionSelect = (user: { id: string; name: string }) => {
    setMessage(prev => prev + `@${user.name} `);
    setShowMentionPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-border p-4 bg-card">
      {/* File Previews */}
      {files.length > 0 && (
        <div className="flex gap-2 mb-2 flex-wrap">
          {files.map((file, index) => (
            <div key={index} className="relative group">
              {file.file.type.startsWith('image/') ? (
                <img
                  src={file.url}
                  alt={file.file.name}
                  className="h-16 w-16 object-cover rounded border"
                />
              ) : (
                <div className="h-16 w-16 border rounded flex items-center justify-center bg-muted">
                  <Paperclip className="h-6 w-6" />
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
              <div className="text-xs mt-1 max-w-16 truncate">
                {file.file.name}
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Channel is muted" : `Message #${channelName}`}
            className="min-h-[80px] pr-12 resize-none bg-background disabled:opacity-50"
            disabled={disabled}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={handleAttachment}
              disabled={disabled}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <EmojiPicker
              onEmojiSelect={handleEmojiSelect}
              open={showEmojiPicker}
              onOpenChange={setShowEmojiPicker}
            >
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                disabled={disabled}
              >
                <Smile className="h-4 w-4" />
              </Button>
            </EmojiPicker>

            <MentionPicker
              onMentionSelect={handleMentionSelect}
              open={showMentionPicker}
              onOpenChange={setShowMentionPicker}
            >
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                disabled={disabled}
              >
                <AtSign className="h-4 w-4" />
              </Button>
            </MentionPicker>
          </div>
          <Button
            type="submit"
            disabled={(!message.trim() && files.length === 0) || disabled}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}