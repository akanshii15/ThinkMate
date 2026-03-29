import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Mic, MicOff, Plus, Trash2 } from "lucide-react";
import { Streamdown } from "streamdown";
import StructuredResponseRenderer from "@/components/StructuredResponseRenderer";
import ConversationSidebar from "@/components/ConversationSidebar";
import VoiceInputButton from "@/components/VoiceInputButton";
import { useLocation } from "wouter";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  structuredData?: any;
  createdAt: Date;
}

export default function Chat() {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // tRPC mutations and queries
  const createConversationMutation = trpc.chat.createConversation.useMutation();
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  const getConversationQuery = trpc.chat.getConversation.useQuery(
    { conversationId: conversationId! },
    { enabled: !!conversationId }
  );
  const listConversationsQuery = trpc.chat.listConversations.useQuery();

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation when selected
  useEffect(() => {
    if (getConversationQuery.data) {
      setMessages(
        getConversationQuery.data.messages.map((msg: any) => ({
          ...msg,
          createdAt: new Date(msg.createdAt),
          structuredData: msg.structuredData ? JSON.parse(msg.structuredData) : null,
        }))
      );
    }
  }, [getConversationQuery.data]);

  // Create new conversation
  

const [, navigate] = useLocation();

const handleNewConversation = async () => {
  console.info("[Chat] New Conversation clicked");

  try {
    const result = await createConversationMutation.mutateAsync({
      title: "New Conversation",
    });

    console.info("[Chat] createConversation result", result);

    if (!result?.id) {
      console.warn("Create conversation returned no id", result);
      return;
    }

    setConversationId(result.id);
    setMessages([]);
    setInputValue("");
    inputRef.current?.focus();
    listConversationsQuery.refetch();

    // 🚀 MAIN FIX
    navigate(`/chat?id=${result.id}`);

  } catch (error) {
    console.error("Failed to create conversation:", error);
  }
};

  // Send message
  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputValue.trim();

    if (!messageText || !conversationId) return;

    setInputValue("");
    setIsLoading(true);

    try {
      const result = await sendMessageMutation.mutateAsync({
        conversationId,
        message: messageText,
        useStructuredAnalysis: true,
      });

      // Add user message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "user",
          content: messageText,
          createdAt: new Date(),
        },
      ]);

      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: result.aiResponse,
          structuredData: result.structuredData,
          createdAt: new Date(),
        },
      ]);

      // Refresh conversations list
      listConversationsQuery.refetch();
    } catch (error) {
      console.error("Failed to send message:", error);
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "assistant",
          content: "Sorry, I encountered an error processing your request. Please try again.",
          createdAt: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // Handle voice input
  const handleVoiceInput = (transcript: string) => {
    setInputValue(transcript);
    setTimeout(() => handleSendMessage(transcript), 100);
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle delete conversation
  const deleteConversationMutation = trpc.chat.deleteConversation.useMutation();
  const handleDeleteConversation = async (id: number) => {
    try {
      await deleteConversationMutation.mutateAsync({ conversationId: id });
      if (conversationId === id) {
        setConversationId(null);
        setMessages([]);
      }
      listConversationsQuery.refetch();
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-4">ThinkMate</h1>
          <p className="text-muted-foreground">Please log in to continue</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <ConversationSidebar
        isOpen={isSidebarOpen}
        conversations={listConversationsQuery.data || []}
        activeConversationId={conversationId}
        onSelectConversation={setConversationId}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border px-6 py-4 flex items-center justify-between bg-card">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-background rounded-lg transition-all duration-300 ease-out"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">ThinkMate</h1>
              <p className="text-xs text-muted-foreground">AI Decision Assistant</p>
            </div>
          </div>
          {conversationId && (
            <Button
              onClick={handleNewConversation}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </Button>
          )}
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-4">
          {!conversationId ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                  Welcome to ThinkMate
                </h2>
                <p className="text-muted-foreground max-w-md">
                  Your AI-powered decision-making assistant. Start a new conversation to
                  explore your options and make better choices.
                </p>
              </div>
              <Button
                onClick={handleNewConversation}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Start New Conversation
              </Button>
            </div>
          ) : (
            <>
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`chat-bubble ${
                      message.role === "user"
                        ? "chat-bubble-user"
                        : "chat-bubble-assistant"
                    }`}
                  >
                    {message.role === "assistant" && message.structuredData ? (
                      <StructuredResponseRenderer data={message.structuredData} />
                    ) : (
                      <div className="markdown-content">
                        <Streamdown>{message.content}</Streamdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="chat-bubble chat-bubble-assistant">
                    <div className="typing-indicator">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        {conversationId && (
          <div className="border-t border-border px-6 py-4 bg-card">
            <div className="flex gap-3">
              <div className="flex-1 flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your decision..."
                  disabled={isLoading}
                  className="focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                />
                <VoiceInputButton
                  onTranscript={handleVoiceInput}
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputValue.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
