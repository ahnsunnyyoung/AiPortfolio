import { useState } from "react";
import { Brain, ArrowLeft, Code, User, Briefcase, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import TrainingKnowledge from "@/components/TrainingKnowledge";
import TrainingIntroduction from "@/components/TrainingIntroduction";
import TrainingProjects from "@/components/TrainingProjects";
import TrainingExperience from "@/components/TrainingExperience";
import TrainingPrompts from "@/components/TrainingPrompts";
import TrainingContact from "@/components/TrainingContact";
import TrainingSkills from "@/components/TrainingSkills";

export default function Train() {
  const [activeTab, setActiveTab] = useState<"knowledge" | "prompts" | "responses">("knowledge");
  const [activeResponseTab, setActiveResponseTab] = useState<"introduction" | "projects" | "experience" | "skills" | "contact">("introduction");

  return (
    <div className="min-h-screen portfolio-gradient">
      <div className="max-w-4xl mx-auto px-2 sm:px-6 py-3 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8">
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