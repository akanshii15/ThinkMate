import { Plus, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface Conversation {
  id: number;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Props {
  isOpen: boolean;
  conversations: Conversation[];
  activeConversationId: number | null;
  onSelectConversation: (id: number) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: number) => void;
}

export default function ConversationSidebar({
  isOpen,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <Button
          onClick={onNewConversation}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No conversations yet</p>
            <p className="text-xs mt-1">Start a new chat to begin</p>
          </div>
        ) : (
          <div className="space-y-2 p-3">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-300 ease-out ${
                  activeConversationId === conversation.id
                    ? "bg-accent/20 border border-accent"
                    : "hover:bg-background border border-transparent"
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{conversation.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(conversation.updatedAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conversation.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-all duration-300 ease-out"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border p-3 text-xs text-muted-foreground text-center">
        <p>ThinkMate v1.0</p>
      </div>
    </div>
  );
}
