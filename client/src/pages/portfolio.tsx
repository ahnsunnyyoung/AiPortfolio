import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Brain,
  X,
  Mail,
  Linkedin,
  Github,
  Code,
  Monitor,
  Server,
  Wrench,
  Globe,
  Users,
  ExternalLink,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useLanguage } from "@/hooks/useLanguage";
import ProjectCard from "@/components/ProjectCard";
import ExperienceCard from "@/components/ExperienceCard";
import LanguageSelector from "@/components/LanguageSelector";

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
  detailedContent?: string;
}

interface Experience {
  id: number;
  company: string;
  position: string;
  period: string;
  location: string;
  description?: string;
  responsibilities?: string[];
  skills?: string;
  website?: string;
  detailedContent?: string;
}

interface PromptExample {
  id: number;
  question: string;
  responseType: string;
  isActive: boolean;
  displayOrder: number;
  timestamp: string;
}

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  projects?: Project[];
  experiences?: Experience[];
  contacts?: {
    email: string;
    linkedin: string;
    github: string;
  };
  skills?: {
    programming: string[];
    frontend: string[];
    backend: string[];
    tools: string[];
    languages: string[];
    "soft skills": string[];
  };
  isProjectResponse?: boolean;
  isExperienceResponse?: boolean;
  isContactResponse?: boolean;
  isSkillsResponse?: boolean;
  isIntroductionResponse?: boolean;
}

export default function Portfolio() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCardExpanded, setIsCardExpanded] = useState(false);

  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [recentlyAskedQuestions, setRecentlyAskedQuestions] = useState<
    string[]
  >([]);
  const [isAskAboutExpanded, setIsAskAboutExpanded] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [isDisplayingResponse, setIsDisplayingResponse] = useState(false);
  const [cachedPromptExamples, setCachedPromptExamples] = useState<PromptExample[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const welcomeMessageShown = useRef(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();

  // Fetch active prompt examples
  const { data: promptExamplesData } = useQuery({
    queryKey: ["/api/prompt-examples/active", language],
    queryFn: () =>
      apiRequest(
        "GET",
        `/api/prompt-examples/active?language=${language}`,
      ).then((res) => res.json()),
  });

  // Fetch introduction data for personal card
  const { data: introductionData } = useQuery({
    queryKey: ["/api/introduction"],
    queryFn: () =>
      apiRequest("GET", "/api/introduction").then((res) => res.json()),
  });

  const promptExamples = promptExamplesData?.examples || [];
  const introduction = introductionData?.introduction;

  // Cache prompt examples when conversation starts to prevent mid-chat updates
  useEffect(() => {
    if (promptExamples.length > 0 && cachedPromptExamples.length === 0) {
      setCachedPromptExamples(promptExamples);
    }
    // Only update cache if conversation is not active (no messages)
    if (promptExamples.length > 0 && messages.length === 0) {
      setCachedPromptExamples(promptExamples);
    }
  }, [promptExamples, cachedPromptExamples.length, messages.length]);

  // Handle click outside to close chat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isExpanded &&
        chatContainerRef.current &&
        !chatContainerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
        // Don't clear messages and inputValue to preserve conversation history
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  const askMutation = useMutation({
    mutationFn: async ({
      question,
      promptExampleId,
    }: {
      question: string;
      promptExampleId?: number;
    }) => {
      // Build session history from current messages (excluding special response types)
      const sessionHistory: Array<{question: string, answer: string}> = [];
      const filteredMessages = messages.filter(msg => 
        !msg.isProjectResponse && !msg.isExperienceResponse && 
        !msg.isContactResponse && !msg.isSkillsResponse && !msg.isIntroductionResponse
      );
      
      for (let i = 0; i < filteredMessages.length - 1; i++) {
        const currentMsg = filteredMessages[i];
        const nextMsg = filteredMessages[i + 1];
        
        if (currentMsg.isUser && !nextMsg.isUser) {
          sessionHistory.push({
            question: currentMsg.content,
            answer: nextMsg.content
          });
        }
      }
      
      // Keep only last 5 conversation pairs
      const recentHistory = sessionHistory.slice(-5);

      const response = await apiRequest("POST", "/api/ask", {
        question,
        promptExampleId,
        language,
        sessionHistory: recentHistory,
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Start thinking animation and block interactions
      setIsThinking(true);
      setIsDisplayingResponse(true);

      // Add a thinking delay to make the AI feel more natural
      setTimeout(() => {
        const aiMessage: Message = {
          id: Date.now().toString() + "-ai",
          content: data.answer,
          isUser: false,
          timestamp: new Date(),
          projects: data.projects,
          experiences: data.experiences,
          contacts: data.contacts,
          skills: data.skills,
          isProjectResponse: data.isProjectResponse,
          isExperienceResponse: data.isExperienceResponse,
          isContactResponse: data.isContactResponse,
          isSkillsResponse: data.isSkillsResponse,
          isIntroductionResponse: data.isIntroductionResponse,
        };
        setMessages((prev) => [...prev, aiMessage]);
        setIsThinking(false);
        
        // Allow interactions after response is fully displayed
        setTimeout(() => {
          setIsDisplayingResponse(false);
        }, 500); // Additional delay to ensure UI is fully rendered
      }, 800); // 0.8 second thinking delay
    },
    onError: (error: any) => {
      setIsThinking(false);
      setIsDisplayingResponse(false);
      
      // Handle rate limiting errors
      if (error.status === 429 || (error.message && error.message.includes("429"))) {
        toast({
          title: "AI Usage Limit Reached",
          description: "You've reached the AI usage limit. Please wait a few minutes before asking again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connection Error",
          description:
            error.message ||
            "I'm having trouble connecting right now. Please try again!",
          variant: "destructive",
        });
      }
    },
  });

  const expandCard = () => {
    setIsCardExpanded(true);
  };

  const startConversation = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      // Only add welcome message if there are no existing messages
      if (messages.length === 0) {
        const welcomeMessage: Message = {
          id: "welcome",
          content: t.aiIntroduction,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || askMutation.isPending || isDisplayingResponse) return;

    startConversation();

    const userMessage: Message = {
      id: Date.now().toString() + "-user",
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Add to recently asked questions if it matches a quick question
    if (
      promptExamples.some(
        (example: PromptExample) => example.question === inputValue,
      )
    ) {
      setRecentlyAskedQuestions((prev) => [...prev, inputValue]);
      setTimeout(() => {
        setRecentlyAskedQuestions((prev) =>
          prev.filter((q) => q !== inputValue),
        );
      }, 10000);
    }

    askMutation.mutate({ question: inputValue });
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Sort prompt examples - recently asked questions go to the end
  // Use cached examples during active chat to prevent disruptive updates
  const examplesSource = isExpanded && cachedPromptExamples.length > 0 ? cachedPromptExamples : promptExamples;
  const quickQuestions = examplesSource
    .sort((a: PromptExample, b: PromptExample) => {
      const aRecentlyAsked = recentlyAskedQuestions.includes(a.question);
      const bRecentlyAsked = recentlyAskedQuestions.includes(b.question);
      
      if (aRecentlyAsked && !bRecentlyAsked) return 1; // a goes after b
      if (!aRecentlyAsked && bRecentlyAsked) return -1; // a goes before b
      
      // If both or neither are recently asked, maintain original order
      return a.displayOrder - b.displayOrder;
    })
    .slice(0, 4);

  const handleQuickQuestion = (promptExample: PromptExample) => {
    // Prevent multiple rapid clicks
    if (askMutation.isPending || isDisplayingResponse) return;
    
    const question = promptExample.question;
    startConversation();

    const userMessage: Message = {
      id: Date.now().toString() + "-user",
      content: question,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Add to recently asked questions and remove after 10 seconds
    setRecentlyAskedQuestions((prev) => [...prev, question]);
    setTimeout(() => {
      setRecentlyAskedQuestions((prev) => prev.filter((q) => q !== question));
    }, 10000);

    askMutation.mutate({ question, promptExampleId: promptExample.id });
  };

  const handleLongPressStart = () => {
    const timer = setTimeout(() => {
      setLocation("/train");
    }, 2000); // 2 seconds long press
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  if (!isExpanded) {
    // Initial state - just logo and prompt
    return (
      <div className="h-screen portfolio-gradient flex flex-col items-center justify-center px-3 sm:px-6 overflow-hidden relative">
        {/* Language Selector - Top Right */}
        <div className="absolute top-4 right-4 z-10">
          <LanguageSelector />
        </div>

        <div className="text-center max-w-4xl mx-auto w-full">
          {/* Logo Area */}
          <div className="mb-6 sm:mb-8">
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-3 sm:mb-4 font-medium">
              {t.frontendDeveloper}
            </p>
            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-bold text-gray-800 mb-4 sm:mb-6 leading-tight text-shadow">
              Sunyoung Ahn
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 italic mb-6 sm:mb-8 px-2">
              {t.askMe}
            </p>
          </div>

          {/* AI Agent Interface */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 sm:p-8 mb-6 sm:mb-8">
            {/* Input with AI Agent Icon */}
            <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer select-none active:scale-95 transition-transform"
                onMouseDown={handleLongPressStart}
                onMouseUp={handleLongPressEnd}
                onMouseLeave={handleLongPressEnd}
                onTouchStart={handleLongPressStart}
                onTouchEnd={handleLongPressEnd}
                title="Long press for admin access"
              >
                <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex gap-2 sm:gap-3 flex-1">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t.askMeAbout}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  disabled={askMutation.isPending || isDisplayingResponse}
                  onClick={startConversation}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || askMutation.isPending || isDisplayingResponse}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-300 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Quick Questions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickQuestions.map(
                (promptExample: PromptExample, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(promptExample)}
                    disabled={askMutation.isPending || isDisplayingResponse}
                    className="text-left p-3 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-sm text-gray-700 hover:text-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {promptExample.question}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>


      </div>
    );
  }

  // Expanded state - full conversation
  return (
    <div className="h-screen portfolio-gradient flex flex-col overflow-hidden relative">
      {/* Language Selector - Top Right - Hidden on mobile when chat expanded */}
      <div className="absolute top-4 right-4 z-20 hidden sm:block">
        <LanguageSelector />
      </div>

      {/* Header */}
      <div className="text-center py-2 sm:py-4 px-4 sm:px-6 border-b-0 sm:border-b sm:border-white/20 flex-shrink-0 bg-white/80 sm:bg-transparent backdrop-blur-sm">
        <div className="flex items-center justify-between sm:justify-center gap-3">
          {/* Back button for mobile */}
          <button
            onClick={() => setIsExpanded(false)}
            className="sm:hidden flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Back to main view"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-800">Sunyoung Ahn</h1>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600">{t.aiOnline}</span>
            </div>
          </div>
          
          {/* Placeholder to center content on mobile */}
          <div className="sm:hidden w-8 h-8"></div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 w-full sm:max-w-4xl sm:mx-auto px-0 sm:px-6 py-0 sm:py-6 flex flex-col min-h-0">
        <div
          ref={chatContainerRef}
          className="flex-1 bg-white/80 backdrop-blur-sm rounded-none sm:rounded-2xl shadow-none sm:shadow-lg border-0 sm:border border-white/50 overflow-hidden flex flex-col min-h-0"
        >
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 chat-container">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message flex items-start gap-2 sm:gap-4 ${
                  message.isUser ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.isUser
                      ? "bg-blue-500"
                      : "bg-gradient-to-r from-blue-500 to-purple-500"
                  }`}
                >
                  {message.isUser ? (
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  )}
                </div>
                <div
                  className={`rounded-2xl px-3 sm:px-6 py-3 sm:py-4 ${
                    message.isProjectResponse || message.isExperienceResponse
                      ? "max-w-5xl"
                      : "max-w-2xl"
                  } ${
                    message.isUser
                      ? "bg-blue-500 text-white rounded-tr-md"
                      : "bg-gray-50 text-gray-800 rounded-tl-md"
                  }`}
                >
                  {/* Project List Display */}
                  {message.isProjectResponse && message.projects && (
                    <div className="space-y-4">
                      {/* Introduction text first only for multiple projects (list view) */}
                      {message.projects.length > 1 && (
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      )}
                      {message.projects.map((project) => (
                        <div key={project.id}>
                          {/* Basic Project Info (for initial list view) */}
                          {message.projects && message.projects.length > 1 && (
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                              <div className="flex justify-between items-start gap-3">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 text-lg">
                                    {project.title}
                                  </h4>
                                  <p className="text-gray-600 text-sm mb-1">
                                    {project.period}
                                  </p>
                                  <p className="text-gray-700 text-sm">
                                    {project.summary}
                                  </p>
                                </div>
                                <button
                                  onClick={async () => {
                                    const originalContent = `Tell me more details about the ${project.title} project`;
                                    
                                    // Translate the user message if not English
                                    let translatedContent = originalContent;
                                    if (language !== 'en') {
                                      try {
                                        const response = await fetch('/api/translate', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({
                                            text: originalContent,
                                            targetLanguage: language,
                                            context: 'user_question'
                                          })
                                        });
                                        const data = await response.json();
                                        if (data.success) {
                                          translatedContent = data.translatedText;
                                        }
                                      } catch (error) {
                                        console.error('Translation failed:', error);
                                      }
                                    }

                                    const userMessage: Message = {
                                      id: Date.now().toString(),
                                      content: translatedContent,
                                      isUser: true,
                                      timestamp: new Date(),
                                    };

                                    setMessages((prev) => [
                                      ...prev,
                                      userMessage,
                                    ]);
                                    setRecentlyAskedQuestions((prev) => [
                                      ...prev,
                                      userMessage.content,
                                    ]);
                                    setTimeout(() => {
                                      setRecentlyAskedQuestions((prev) =>
                                        prev.filter(
                                          (q) => q !== userMessage.content,
                                        ),
                                      );
                                    }, 10000);

                                    // Start thinking animation
                                    setIsThinking(true);

                                    // Add thinking delay for "Ask more" responses too
                                    setTimeout(() => {
                                      const aiMessage: Message = {
                                        id: (Date.now() + 1).toString(),
                                        content:
                                          project.detailedContent ||
                                          `More details about ${project.title} will be available soon.`,
                                        isUser: false,
                                        timestamp: new Date(),
                                        projects: [project],
                                        isProjectResponse: true,
                                      };
                                      setMessages((prev) => [
                                        ...prev,
                                        aiMessage,
                                      ]);
                                      setIsThinking(false);
                                    }, 800);
                                  }}
                                  disabled={askMutation.isPending || isDisplayingResponse}
                                  className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {t.askMore}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Detailed Project Card (for "Ask more" responses) */}
                          {message.projects &&
                            message.projects.length === 1 && (
                              <div className="space-y-4">
                                <div className="mt-6">
                                  <ProjectCard project={project} />
                                </div>
                                {/* Content appears after the detailed card for single project responses */}
                                <p className="text-sm leading-relaxed mt-4">{message.content}</p>
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Experience List Display */}
                  {message.isExperienceResponse && message.experiences && (
                    <div className="space-y-4">
                      {/* Introduction text first only for multiple experiences (list view) */}
                      {message.experiences.length > 1 && (
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      )}
                      {message.experiences.map((experience) => (
                        <div key={experience.id}>
                          {/* Basic Experience Info (for initial list view) */}
                          {message.experiences &&
                            message.experiences.length > 1 && (
                              <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <div className="flex justify-between items-start gap-3">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800 text-lg">
                                      {experience.position}
                                    </h4>
                                    <p className="text-blue-600 font-medium text-sm">
                                      {experience.company}
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                      {experience.period} •{" "}
                                      {experience.location}
                                    </p>
                                  </div>
                                  <button
                                    onClick={async () => {
                                      const originalContent = `Tell me more details about the ${experience.position} role at ${experience.company}`;
                                      
                                      // Translate the user message if not English
                                      let translatedContent = originalContent;
                                      if (language !== 'en') {
                                        try {
                                          const response = await fetch('/api/translate', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                              text: originalContent,
                                              targetLanguage: language,
                                              context: 'user_question'
                                            })
                                          });
                                          const data = await response.json();
                                          if (data.success) {
                                            translatedContent = data.translatedText;
                                          }
                                        } catch (error) {
                                          console.error('Translation failed:', error);
                                        }
                                      }

                                      const userMessage: Message = {
                                        id: Date.now().toString(),
                                        content: translatedContent,
                                        isUser: true,
                                        timestamp: new Date(),
                                      };

                                      setMessages((prev) => [
                                        ...prev,
                                        userMessage,
                                      ]);
                                      setRecentlyAskedQuestions((prev) => [
                                        ...prev,
                                        userMessage.content,
                                      ]);
                                      setTimeout(() => {
                                        setRecentlyAskedQuestions((prev) =>
                                          prev.filter(
                                            (q) => q !== userMessage.content,
                                          ),
                                        );
                                      }, 10000);

                                      // Start thinking animation
                                      setIsThinking(true);

                                      // Add thinking delay for experience "Ask more" responses
                                      setTimeout(() => {
                                        const aiMessage: Message = {
                                          id: (Date.now() + 1).toString(),
                                          content:
                                            experience.detailedContent ||
                                            `More details about the ${experience.position} role at ${experience.company} will be available soon.`,
                                          isUser: false,
                                          timestamp: new Date(),
                                          experiences: [experience],
                                          isExperienceResponse: true,
                                        };
                                        setMessages((prev) => [
                                          ...prev,
                                          aiMessage,
                                        ]);
                                        setIsThinking(false);
                                      }, 800);
                                    }}
                                    disabled={askMutation.isPending || isDisplayingResponse}
                                    className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {t.askMore}
                                  </button>
                                </div>
                              </div>
                            )}

                          {/* Detailed Experience Card (for "Ask more" responses) */}
                          {message.experiences &&
                            message.experiences.length === 1 && (
                              <div className="space-y-4">
                                <div className="mt-6">
                                  <ExperienceCard experience={experience} />
                                </div>
                                {/* Content appears after the detailed card for single experience responses */}
                                <p className="text-sm leading-relaxed mt-4">{message.content}</p>
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Personal Information Card for Introduction */}
                  {message.isIntroductionResponse && (
                    <div className="space-y-4 w-full">
                      {/* Personal card first */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 sm:p-6 w-full">
                        <div className="flex items-start gap-2 sm:gap-4">
                          <div className="flex-shrink-0">
                            {introduction?.img ? (
                              <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 sm:border-3 border-white shadow-lg">
                                <img
                                  src={introduction.img}
                                  alt="Profile"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center border-2 sm:border-3 border-white shadow-lg">
                                <User className="w-6 h-6 sm:w-10 sm:h-10 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                              <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                                {introduction?.name || "Sunyoung Ahn"}
                              </h3>
                              <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 text-xs sm:text-sm rounded-full font-medium self-start">
                                {introduction?.title || "Frontend Developer"}
                              </span>
                            </div>
                            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                              {introduction?.location && (
                                <div className="flex items-center gap-2">
                                  <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                                  <span className="truncate">{introduction.location}</span>
                                </div>
                              )}
                              {introduction?.experience && (
                                <div className="flex items-center gap-2">
                                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                                  <span className="truncate">
                                    {introduction.experience} experience
                                  </span>
                                </div>
                              )}
                              {introduction?.technologies && (
                                <div className="flex items-start gap-2">
                                  <Code className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                  <div className="flex flex-wrap gap-1 min-w-0">
                                    {introduction.technologies
                                      .split(",")
                                      .map((tech: string, index: number) => (
                                        <span 
                                          key={index}
                                          className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                                        >
                                          {tech.trim()}
                                        </span>
                                      ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Introduction text after card */}
                      <p className="text-sm leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  )}

                  {/* Text content (only for non-special responses) */}
                  {message.isUser ? (
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  ) : (
                    !message.isProjectResponse && !message.isExperienceResponse && !message.isContactResponse && !message.isSkillsResponse && !message.isIntroductionResponse && (
                      <p className="leading-relaxed whitespace-pre-wrap mt-4">
                        {message.content}
                      </p>
                    )
                  )}

                  {/* Contact Information Display */}
                  {message.isContactResponse && message.contacts && (
                    <div className="space-y-4">
                      {/* Introduction text first */}
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <Mail className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 text-lg">
                              {t.contactTitle}
                            </h4>
                            <p className="text-purple-600 text-sm">
                              {t.letsConnect}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-100">
                            <Mail className="w-5 h-5 text-purple-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {t.email}
                              </p>
                              <a
                                href={`mailto:${message.contacts.email}`}
                                className="text-purple-600 hover:text-purple-700 hover:underline text-sm"
                              >
                                {message.contacts.email}
                              </a>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-100">
                            <Linkedin className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {t.linkedin}
                              </p>
                              <a
                                href={message.contacts.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 hover:underline text-sm"
                              >
                                LinkedIn Profile
                              </a>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-100">
                            <Github className="w-5 h-5 text-gray-700" />
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                GitHub
                              </p>
                              <a
                                href={message.contacts.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-700 hover:text-gray-800 hover:underline text-sm"
                              >
                                GitHub Profile
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Skills Display */}
                  {message.isSkillsResponse && message.skills && (
                    <div className="space-y-4">
                      {/* Introduction text first */}
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                            <Code className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 text-lg">
                              Technical Skills & Expertise
                            </h4>
                            <p className="text-orange-600 text-sm">
                              My technical capabilities
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="bg-white rounded-lg border border-orange-100 p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Code className="w-4 h-4 text-orange-600" />
                              <h5 className="font-semibold text-gray-800">
                                Programming Languages
                              </h5>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {message.skills?.programming?.map(
                                (skill, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-orange-50 text-orange-700 text-sm rounded-full border border-orange-200"
                                  >
                                    {skill}
                                  </span>
                                ),
                              ) || []}
                            </div>
                          </div>

                          <div className="bg-white rounded-lg border border-orange-100 p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Monitor className="w-4 h-4 text-blue-600" />
                              <h5 className="font-semibold text-gray-800">
                                Frontend
                              </h5>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {message.skills?.frontend?.map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200"
                                >
                                  {skill}
                                </span>
                              )) || []}
                            </div>
                          </div>

                          <div className="bg-white rounded-lg border border-orange-100 p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Server className="w-4 h-4 text-green-600" />
                              <h5 className="font-semibold text-gray-800">
                                Backend & Database
                              </h5>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {message.skills?.backend?.map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-green-50 text-green-700 text-sm rounded-full border border-green-200"
                                >
                                  {skill}
                                </span>
                              )) || []}
                            </div>
                          </div>

                          <div className="bg-white rounded-lg border border-orange-100 p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Wrench className="w-4 h-4 text-purple-600" />
                              <h5 className="font-semibold text-gray-800">
                                Tools & Platforms
                              </h5>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {message.skills?.tools?.map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-purple-50 text-purple-700 text-sm rounded-full border border-purple-200"
                                >
                                  {skill}
                                </span>
                              )) || []}
                            </div>
                          </div>

                          <div className="bg-white rounded-lg border border-orange-100 p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Globe className="w-4 h-4 text-indigo-600" />
                              <h5 className="font-semibold text-gray-800">
                                Languages
                              </h5>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {message.skills?.languages?.map(
                                (skill, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full border border-indigo-200"
                                  >
                                    {skill}
                                  </span>
                                ),
                              ) || []}
                            </div>
                          </div>

                          <div className="bg-white rounded-lg border border-orange-100 p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Users className="w-4 h-4 text-pink-600" />
                              <h5 className="font-semibold text-gray-800">
                                Soft Skills
                              </h5>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {message.skills?.["soft skills"]?.map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-pink-50 text-pink-700 text-sm rounded-full border border-pink-200"
                                >
                                  {skill}
                                </span>
                              )) || []}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

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

            {/* Thinking/Typing Indicator */}
            {(askMutation.isPending || isThinking) && (
              <div className="chat-message flex items-start gap-2 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="bg-gray-50 rounded-2xl rounded-tl-md px-3 sm:px-6 py-3 sm:py-4">
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
            <div className="border-t border-gray-200/50 bg-gray-50/50">
              <div className="px-3 sm:px-6 py-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">{t.askAbout}:</span>
                <button
                  onClick={() => setIsAskAboutExpanded(!isAskAboutExpanded)}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {isAskAboutExpanded ? t.hide : t.show}
                </button>
              </div>
              {isAskAboutExpanded && (
                <div className="px-3 sm:px-6 pb-3">
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {quickQuestions.map(
                      (promptExample: PromptExample, index: number) => (
                        <button
                          key={index}
                          onClick={() => handleQuickQuestion(promptExample)}
                          disabled={askMutation.isPending || isDisplayingResponse}
                          className="px-2 sm:px-3 py-1 text-xs bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {promptExample.question}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 sm:p-6 border-t border-gray-200/50 bg-white/50">
            <div className="flex gap-2 sm:gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t.typeMessage}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm sm:text-base"
                disabled={askMutation.isPending || isDisplayingResponse}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || askMutation.isPending || isDisplayingResponse}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-300 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                aria-label={t.sendMessage}
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
