import { useState, useEffect } from "react";
import { Brain, ArrowLeft, Code, User, Briefcase, MessageCircle, History, Lock } from "lucide-react";
import { Link, useLocation } from "wouter";
import TrainingKnowledge from "@/components/TrainingKnowledge";
import TrainingIntroduction from "@/components/TrainingIntroduction";
import TrainingProjects from "@/components/TrainingProjects";
import TrainingExperience from "@/components/TrainingExperience";
import TrainingPrompts from "@/components/TrainingPrompts";
import TrainingContact from "@/components/TrainingContact";
import TrainingSkills from "@/components/TrainingSkills";
import TrainingConversations from "@/components/TrainingConversations";

export default function Train() {
  const [activeTab, setActiveTab] = useState<"knowledge" | "prompts" | "responses" | "conversations">("knowledge");
  const [activeResponseTab, setActiveResponseTab] = useState<"introduction" | "projects" | "experience" | "skills" | "contact">("introduction");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check if user is already authenticated in this session
    const sessionAuth = sessionStorage.getItem("trainAuth");
    if (sessionAuth === "authenticated") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "ahn9930") {
      setIsAuthenticated(true);
      sessionStorage.setItem("trainAuth", "authenticated");
      setPassword("");
    } else {
      alert("비밀번호가 틀렸습니다.");
      setPassword("");
    }
  };

  const handleBackToHome = () => {
    sessionStorage.removeItem("trainAuth");
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen portfolio-gradient flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen portfolio-gradient flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/50 p-8 w-full max-w-md mx-4 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Training Access</h2>
            <p className="text-gray-600">Enter password to access training interface</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
            >
              Access Training
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleBackToHome}
              className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Portfolio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen portfolio-gradient">
      <div className="max-w-4xl mx-auto px-2 sm:px-6 py-3 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/" className="text-gray-600 hover:text-gray-800 transition-colors">
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-800">Train AI Agent</h1>
                <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Add knowledge and experiences to your AI</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleBackToHome}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-lg transition-colors"
          >
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

        {/* Main Tab Navigation */}
        <div className="flex space-x-1 bg-white/80 backdrop-blur-sm rounded-lg p-1 mb-6 sm:mb-8 border border-white/50">
          <button
            onClick={() => setActiveTab("knowledge")}
            className={`flex-1 py-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "knowledge"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Brain className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
            AI Knowledge
          </button>
          <button
            onClick={() => setActiveTab("prompts")}
            className={`flex-1 py-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "prompts"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
            Quick Questions
          </button>
          <button
            onClick={() => setActiveTab("responses")}
            className={`flex-1 py-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "responses"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Code className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
            Responses
          </button>
          <button
            onClick={() => setActiveTab("conversations")}
            className={`flex-1 py-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "conversations"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <History className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
            Conversations
          </button>
        </div>

        {/* Response Sub-tabs */}
        {activeTab === "responses" && (
          <div className="flex space-x-1 bg-gray-50/80 backdrop-blur-sm rounded-lg p-1 mb-6 border border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveResponseTab("introduction")}
              className={`flex-1 min-w-0 py-2 px-2 sm:px-3 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                activeResponseTab === "introduction"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <User className="w-3 h-3 inline mr-1" />
              Introduction
            </button>
            <button
              onClick={() => setActiveResponseTab("projects")}
              className={`flex-1 min-w-0 py-2 px-2 sm:px-3 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                activeResponseTab === "projects"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Code className="w-3 h-3 inline mr-1" />
              Projects
            </button>
            <button
              onClick={() => setActiveResponseTab("experience")}
              className={`flex-1 min-w-0 py-2 px-2 sm:px-3 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                activeResponseTab === "experience"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Briefcase className="w-3 h-3 inline mr-1" />
              Experience
            </button>
            <button
              onClick={() => setActiveResponseTab("skills")}
              className={`flex-1 min-w-0 py-2 px-2 sm:px-3 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                activeResponseTab === "skills"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Code className="w-3 h-3 inline mr-1" />
              Skills
            </button>
            <button
              onClick={() => setActiveResponseTab("contact")}
              className={`flex-1 min-w-0 py-2 px-2 sm:px-3 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                activeResponseTab === "contact"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <User className="w-3 h-3 inline mr-1" />
              Contact
            </button>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === "knowledge" && <TrainingKnowledge />}
        {activeTab === "prompts" && <TrainingPrompts />}
        {activeTab === "conversations" && <TrainingConversations />}
        {activeTab === "responses" && (
          <>
            {activeResponseTab === "introduction" && <TrainingIntroduction />}
            {activeResponseTab === "projects" && <TrainingProjects />}
            {activeResponseTab === "experience" && <TrainingExperience />}
            {activeResponseTab === "skills" && <TrainingSkills />}
            {activeResponseTab === "contact" && <TrainingContact />}
          </>
        )}
      </div>
    </div>
  );
}