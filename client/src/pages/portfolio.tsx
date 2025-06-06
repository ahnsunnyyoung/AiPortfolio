import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Send, Bot, User, Sparkles, Brain, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import ProjectCard from "@/components/ProjectCard";

interface Project {
  id: number;
  title: string;
  period: string;
  subtitle: string;
  summary: string;
  contents: string[];
  tech: string;
  img: string;
  imgAlt: string;
  moreLink?: string;
  width: string;
}

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  projects?: Project[];
  isProjectResponse?: boolean;
}

export default function Portfolio() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCardExpanded, setIsCardExpanded] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(
    null,
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const askMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest("POST", "/api/ask", { question });
      return response.json();
    },
    onSuccess: (data) => {
      const aiMessage: Message = {
        id: Date.now().toString() + "-ai",
        content: data.answer,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    },
    onError: (error: any) => {
      toast({
        title: "Connection Error",
        description:
          error.message ||
          "I'm having trouble connecting right now. Please try again!",
        variant: "destructive",
      });
    },
  });

  const expandCard = () => {
    setIsCardExpanded(true);
  };

  const startConversation = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      const welcomeMessage: Message = {
        id: "welcome",
        content:
          "Hi! I'm Sunyoung's AI agent. I've been trained with her personal knowledge and experiences. Ask me anything about her background, skills, projects, or thoughts!",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || askMutation.isPending) return;

    startConversation();

    const userMessage: Message = {
      id: Date.now().toString() + "-user",
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    askMutation.mutate(inputValue);
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "What are your main skills and expertise?",
    "Tell me about your recent projects",
    "What's your development philosophy?",
    "How can I contact you for collaboration?",
  ];

  const handleQuickQuestion = (question: string) => {
    startConversation();

    const userMessage: Message = {
      id: Date.now().toString() + "-user",
      content: question,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    askMutation.mutate(question);
  };

  const handleLongPressStart = () => {
    const timer = setTimeout(() => {
      setShowPasswordModal(true);
    }, 2000); // 2 seconds long press
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handlePasswordSubmit = () => {
    if (password === "ahn9930") {
      setLocation("/train");
      setShowPasswordModal(false);
      setPassword("");
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect password",
        variant: "destructive",
      });
      setPassword("");
    }
  };

  const handlePasswordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handlePasswordSubmit();
    }
  };

  if (!isExpanded) {
    // Initial state - just logo and prompt
    return (
      <div className="min-h-screen portfolio-gradient flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo Area */}
          <div className="mb-8">
            <p className="text-lg md:text-xl text-gray-600 mb-4 font-medium">
              Frontend Developer
            </p>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-gray-800 mb-6 leading-tight text-shadow">
              Sunyoung Ahn
            </h1>
            <p className="text-lg md:text-xl text-gray-600 italic mb-8">
              Ask Sunny AI anything! It might just know me better than I do.
            </p>
          </div>

          {/* AI Agent Interface */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 mb-8">
            {/* Input with AI Agent Icon */}
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer select-none active:scale-95 transition-transform"
                onMouseDown={handleLongPressStart}
                onMouseUp={handleLongPressEnd}
                onMouseLeave={handleLongPressEnd}
                onTouchStart={handleLongPressStart}
                onTouchEnd={handleLongPressEnd}
                title="Long press for admin access"
              >
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="flex gap-3 flex-1">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about Sunyoung..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  disabled={askMutation.isPending}
                  onClick={startConversation}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || askMutation.isPending}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-300 text-white w-12 h-12 rounded-full flex items-center justify-center transition-all disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  aria-label="Send message"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Questions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  disabled={askMutation.isPending}
                  className="text-left p-3 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-sm text-gray-700 hover:text-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Admin Access
                </h3>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPassword("");
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handlePasswordKeyPress}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>

                <button
                  onClick={handlePasswordSubmit}
                  disabled={!password.trim()}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-300 text-white py-3 px-6 rounded-lg font-medium transition-all disabled:cursor-not-allowed"
                >
                  Access Training
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Expanded state - full conversation
  return (
    <div className="min-h-screen portfolio-gradient flex flex-col">
      {/* Minimized Header */}
      <div className="text-center py-4 px-6 border-b border-white/20">
        <div className="flex items-center justify-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Sunyoung Ahn</h1>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600">AI Online</span>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-6 flex flex-col">
        <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 chat-container">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message flex items-start gap-4 ${
                  message.isUser ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.isUser
                      ? "bg-blue-500"
                      : "bg-gradient-to-r from-blue-500 to-purple-500"
                  }`}
                >
                  {message.isUser ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                <div
                  className={`rounded-2xl px-6 py-4 max-w-2xl ${
                    message.isUser
                      ? "bg-blue-500 text-white rounded-tr-md"
                      : "bg-gray-50 text-gray-800 rounded-tl-md"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <div
                    className={`text-xs mt-2 opacity-70 ${message.isUser ? "text-blue-100" : "text-gray-500"}`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {askMutation.isPending && (
              <div className="chat-message flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gray-50 rounded-2xl rounded-tl-md px-6 py-4">
                  <div className="flex space-x-1">
                    <div className="typing-indicator"></div>
                    <div className="typing-indicator"></div>
                    <div className="typing-indicator"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-200/50 bg-gray-50/50">
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-500 mr-2">Ask about:</span>
                {[
                  "What are your technical skills?",
                  "Tell me about your projects",
                  "What's your development philosophy?",
                  "How can I contact you?"
                ].map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    disabled={askMutation.isPending}
                    className="px-3 py-1 text-xs bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-6 border-t border-gray-200/50 bg-white/50">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Sunyoung's AI anything..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                disabled={askMutation.isPending}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || askMutation.isPending}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-300 text-white w-12 h-12 rounded-full flex items-center justify-center transition-all disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
