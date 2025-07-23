import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Send, Bot, User } from "lucide-react";
import { apiRequest } from "@/lib/api";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface AiChatProps {
  fullScreen?: boolean;
}

export default function AiChat({ fullScreen = false }: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI accounting assistant. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/v1/support/chat", { message });
      return response.json();
    },
    onSuccess: (data) => {
      const aiMessage: Message = {
        id: Date.now().toString() + "_ai",
        content: data.message,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    sendMessageMutation.mutate(input);
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!fullScreen) {
    return (
      <Card className="w-80 h-96 fixed bottom-6 right-6 z-50 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center">
            <MessageSquare className="w-4 h-4 mr-2" />
            AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex flex-col h-full">
          <ChatMessages messages={messages} isCompact />
          <ChatInput
            input={input}
            setInput={setInput}
            onSend={handleSend}
            onKeyPress={handleKeyPress}
            isLoading={sendMessageMutation.isPending}
            isCompact
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ChatMessages messages={messages} />
      <ChatInput
        input={input}
        setInput={setInput}
        onSend={handleSend}
        onKeyPress={handleKeyPress}
        isLoading={sendMessageMutation.isPending}
      />
    </div>
  );
}

function ChatMessages({ messages, isCompact = false }: { messages: Message[]; isCompact?: boolean }) {
  return (
    <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isCompact ? 'text-sm' : ''}`}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex items-start space-x-3 ${message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            message.sender === "ai" 
              ? "bg-violet-100 text-violet-600" 
              : "bg-slate-100 text-slate-600"
          }`}>
            {message.sender === "ai" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
          </div>
          <div className={`flex-1 max-w-xs ${message.sender === "user" ? "text-right" : ""}`}>
            <div className={`rounded-lg p-3 ${
              message.sender === "ai"
                ? "bg-slate-100 text-slate-800"
                : "bg-violet-600 text-white"
            }`}>
              <p className={isCompact ? "text-xs" : "text-sm"}>{message.content}</p>
            </div>
            <p className={`mt-1 text-slate-500 ${isCompact ? "text-xs" : "text-xs"}`}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ChatInput({ 
  input, 
  setInput, 
  onSend, 
  onKeyPress, 
  isLoading, 
  isCompact = false 
}: {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  isCompact?: boolean;
}) {
  return (
    <div className={`border-t border-slate-200 p-4 ${isCompact ? 'p-3' : ''}`}>
      <div className="flex space-x-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder="Type your question..."
          disabled={isLoading}
          className={isCompact ? "text-sm" : ""}
        />
        <Button 
          onClick={onSend} 
          disabled={isLoading || !input.trim()}
          size={isCompact ? "sm" : "default"}
          className="btn-violet"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
