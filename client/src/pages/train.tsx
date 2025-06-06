import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Brain, Plus, Trash2, Save, ArrowLeft, Code, ExternalLink, User, Briefcase, X, MessageCircle, GripVertical, Edit3, Upload } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

interface TrainingData {
  id: number;
  content: string;
  isActive: boolean;
  timestamp: string;
}

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
  img?: string;
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

interface Contact {
  id?: number;
  email: string;
  linkedin?: string;
  github?: string;
  website?: string;
  phone?: string;
}

interface SkillCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
  displayOrder: number;
}

interface Skill {
  id: number;
  name: string;
  categoryId: number;
  proficiency: string;
  displayOrder: number;
}

interface Introduction {
  id: number;
  content: string;
  img?: string;
  isActive: boolean;
  timestamp: string;
}

export default function Train() {
  const [trainingContent, setTrainingContent] = useState("");
  const [activeTab, setActiveTab] = useState<"knowledge" | "prompts" | "responses">("knowledge");
  const [responseSubTab, setResponseSubTab] = useState<"introduction" | "projects" | "experience" | "skills" | "contact">("introduction");
  const [editingKnowledge, setEditingKnowledge] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState({
    title: "",
    period: "",
    subtitle: "",
    summary: "",
    contents: [""],
    tech: "",
    img: "",
    imgAlt: "",
    moreLink: "",
    width: "47%",
    detailedContent: ""
  });
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [experienceForm, setExperienceForm] = useState({
    company: "",
    position: "",
    period: "",
    location: "",
    description: "",
    responsibilities: [""],
    skills: "",
    website: "",
    img: "",
    detailedContent: ""
  });
  const [showPromptForm, setShowPromptForm] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptExample | null>(null);
  const [promptForm, setPromptForm] = useState({
    question: "",
    responseType: "ai",
    isActive: true,
    displayOrder: 0
  });
  const [contactForm, setContactForm] = useState({
    email: "",
    linkedin: "",
    github: "",
    website: "",
    phone: ""
  });
  const [editingSkill, setEditingSkill] = useState<number | null>(null);
  const [editingSkillName, setEditingSkillName] = useState("");
  const [introductionContent, setIntroductionContent] = useState("");
  const [introductionImage, setIntroductionImage] = useState("");
  const { toast } = useToast();

  // Helper function to compress and convert file to base64
  const compressAndConvertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 800x600)
        const maxWidth = 800;
        const maxHeight = 600;
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataURL = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressedDataURL);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64 = await compressAndConvertToBase64(file);
        setIntroductionImage(base64);
        toast({
          title: "Image Uploaded",
          description: "Your photo has been uploaded and compressed successfully",
        });
      } catch (error) {
        toast({
          title: "Upload Failed",
          description: "Failed to upload image. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const trainingDataQuery = useQuery({
    queryKey: ['/api/training-data'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/training-data");
      return response.json();
    }
  });

  const projectsQuery = useQuery({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/projects");
      return response.json();
    }
  });

  const experiencesQuery = useQuery({
    queryKey: ['/api/experiences'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/experiences");
      return response.json();
    }
  });

  const promptExamplesQuery = useQuery({
    queryKey: ['/api/prompt-examples'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/prompt-examples");
      return response.json();
    }
  });

  const contactQuery = useQuery({
    queryKey: ['/api/contact'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/contact");
      return response.json();
    }
  });

  const skillCategoriesQuery = useQuery({
    queryKey: ['/api/skill-categories'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/skill-categories");
      return response.json();
    }
  });

  const skillsQuery = useQuery({
    queryKey: ['/api/skills'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/skills");
      return response.json();
    }
  });

  const introductionQuery = useQuery({
    queryKey: ['/api/introduction'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/introduction");
      return response.json();
    }
  });

  // Set introduction content when data is loaded
  if (introductionQuery.data?.introduction && introductionContent === "" && introductionImage === "") {
    setIntroductionContent(introductionQuery.data.introduction.content || "");
    setIntroductionImage(introductionQuery.data.introduction.img || "");
  }

  // Training Data Mutations
  const addTrainingMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/training-data", { content, isActive: true });
      return response.json();
    },
    onSuccess: () => {
      setTrainingContent("");
      toast({ title: "Knowledge Added", description: "Training data added successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/training-data'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add",
        description: error.message || "Failed to add training data",
        variant: "destructive"
      });
    }
  });

  const updateTrainingMutation = useMutation({
    mutationFn: async ({ id, content }: { id: number, content: string }) => {
      const response = await apiRequest("PUT", `/api/training-data/${id}`, { content, isActive: true });
      return response.json();
    },
    onSuccess: () => {
      setEditingKnowledge(null);
      setEditingContent("");
      toast({ title: "Knowledge Updated", description: "Training data updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/training-data'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update training data",
        variant: "destructive"
      });
    }
  });

  const deleteTrainingMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/training-data/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Knowledge Deleted", description: "Training data deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/training-data'] });
    }
  });

  // Project Mutations
  const addProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      const response = await apiRequest("POST", "/api/projects", projectData);
      return response.json();
    },
    onSuccess: () => {
      setShowProjectForm(false);
      setEditingProject(null);
      resetProjectForm();
      toast({ title: "Project Added", description: "Project added successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    }
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const response = await apiRequest("PUT", `/api/projects/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      setShowProjectForm(false);
      setEditingProject(null);
      resetProjectForm();
      toast({ title: "Project Updated", description: "Project updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/projects/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Project Deleted", description: "Project deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    }
  });

  // Experience Mutations
  const addExperienceMutation = useMutation({
    mutationFn: async (experienceData: any) => {
      const response = await apiRequest("POST", "/api/experiences", experienceData);
      return response.json();
    },
    onSuccess: () => {
      setShowExperienceForm(false);
      setEditingExperience(null);
      resetExperienceForm();
      toast({ title: "Experience Added", description: "Experience added successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/experiences'] });
    }
  });

  const updateExperienceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const response = await apiRequest("PUT", `/api/experiences/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      setShowExperienceForm(false);
      setEditingExperience(null);
      resetExperienceForm();
      toast({ title: "Experience Updated", description: "Experience updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/experiences'] });
    }
  });

  const deleteExperienceMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/experiences/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Experience Deleted", description: "Experience deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/experiences'] });
    }
  });

  // Contact Mutations
  const updateContactMutation = useMutation({
    mutationFn: async (contactData: any) => {
      const response = await apiRequest("PUT", "/api/contact", contactData);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Contact Updated", description: "Contact information updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/contact'] });
    }
  });

  const updateIntroductionMutation = useMutation({
    mutationFn: async ({ content, img }: { content: string, img?: string }) => {
      const response = await apiRequest("PUT", "/api/introduction", { content, img });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Introduction Updated",
        description: "Introduction has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/introduction'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update introduction",
        variant: "destructive"
      });
    }
  });

  // Helper functions
  const resetProjectForm = () => {
    setProjectForm({
      title: "",
      period: "",
      subtitle: "",
      summary: "",
      contents: [""],
      tech: "",
      img: "",
      imgAlt: "",
      moreLink: "",
      width: "47%",
      detailedContent: ""
    });
  };

  const resetExperienceForm = () => {
    setExperienceForm({
      company: "",
      position: "",
      period: "",
      location: "",
      description: "",
      responsibilities: [""],
      skills: "",
      website: "",
      img: "",
      detailedContent: ""
    });
  };

  // Handler functions
  const handleAddTrainingData = () => {
    if (!trainingContent.trim()) return;
    addTrainingMutation.mutate(trainingContent);
  };

  const handleEditTrainingData = (data: any) => {
    setEditingKnowledge(data.id);
    setEditingContent(data.content);
  };

  const handleUpdateTrainingData = () => {
    if (!editingContent.trim() || !editingKnowledge) return;
    updateTrainingMutation.mutate({ id: editingKnowledge, content: editingContent });
  };

  const handleDeleteTrainingData = (id: number) => {
    if (confirm("Are you sure you want to delete this training data?")) {
      deleteTrainingMutation.mutate(id);
    }
  };

  const handleProjectSubmit = () => {
    const projectData = {
      ...projectForm,
      contents: projectForm.contents.filter(content => content.trim() !== "")
    };

    if (editingProject) {
      updateProjectMutation.mutate({ id: editingProject.id, data: projectData });
    } else {
      addProjectMutation.mutate(projectData);
    }
  };

  const handleExperienceSubmit = () => {
    const experienceData = {
      ...experienceForm,
      responsibilities: experienceForm.responsibilities.filter(resp => resp.trim() !== "")
    };

    if (editingExperience) {
      updateExperienceMutation.mutate({ id: editingExperience.id, data: experienceData });
    } else {
      addExperienceMutation.mutate(experienceData);
    }
  };

  const handleIntroductionSubmit = () => {
    if (!introductionContent.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter introduction content",
        variant: "destructive"
      });
      return;
    }

    updateIntroductionMutation.mutate({
      content: introductionContent,
      img: introductionImage
    });
  };

  const trainingData = trainingDataQuery.data?.data || [];
  const projects = projectsQuery.data?.projects || [];
  const experiences = experiencesQuery.data?.experiences || [];
  const promptExamples = promptExamplesQuery.data?.examples || [];
  const contact = contactQuery.data?.contact;
  const skillCategories = skillCategoriesQuery.data?.categories || [];
  const skills = skillsQuery.data?.skills || [];

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
        <div className="flex space-x-1 bg-white/80 backdrop-blur-sm rounded-lg p-1 mb-4 border border-white/50">
          <button
            onClick={() => setActiveTab("knowledge")}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "knowledge"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Brain className="w-4 h-4 inline mr-2" />
            AI Knowledge
          </button>
          <button
            onClick={() => setActiveTab("prompts")}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "prompts"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <MessageCircle className="w-4 h-4 inline mr-2" />
            Prompts
          </button>
          <button
            onClick={() => setActiveTab("responses")}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "responses"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Code className="w-4 h-4 inline mr-2" />
            Responses
          </button>
        </div>

        {/* Sub Tab Navigation for Responses */}
        {activeTab === "responses" && (
          <div className="flex space-x-1 bg-white/60 backdrop-blur-sm rounded-lg p-1 mb-6 sm:mb-8 border border-white/30 overflow-x-auto">
            <button
              onClick={() => setResponseSubTab("introduction")}
              className={`flex-1 min-w-0 py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                responseSubTab === "introduction"
                  ? "bg-purple-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <User className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
              Introduction
            </button>
            <button
              onClick={() => setResponseSubTab("projects")}
              className={`flex-1 min-w-0 py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                responseSubTab === "projects"
                  ? "bg-purple-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Code className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
              Projects
            </button>
            <button
              onClick={() => setResponseSubTab("experience")}
              className={`flex-1 min-w-0 py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                responseSubTab === "experience"
                  ? "bg-purple-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
              Experience
            </button>
            <button
              onClick={() => setResponseSubTab("skills")}
              className={`flex-1 min-w-0 py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                responseSubTab === "skills"
                  ? "bg-purple-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Code className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
              Skills
            </button>
            <button
              onClick={() => setResponseSubTab("contact")}
              className={`flex-1 min-w-0 py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                responseSubTab === "contact"
                  ? "bg-purple-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <User className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
              Contact
            </button>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === "knowledge" ? (
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
            {/* Training Form */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 sm:p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New Knowledge
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Training Content
                  </label>
                  <textarea
                    value={trainingContent}
                    onChange={(e) => setTrainingContent(e.target.value)}
                    placeholder="Tell me about yourself, your skills, experiences, thoughts, or any information you want the AI to remember and share..."
                    className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Press Ctrl+Enter to save quickly
                  </p>
                </div>

                <button
                  onClick={handleAddTrainingData}
                  disabled={!trainingContent.trim() || addTrainingMutation.isPending}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-300 text-white py-3 px-6 rounded-lg font-medium transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {addTrainingMutation.isPending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {addTrainingMutation.isPending ? "Adding..." : "Add Knowledge"}
                </button>
              </div>
            </div>

            {/* Training Data List */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 sm:p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Knowledge Base ({trainingData.length})
              </h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {trainingData.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No training data yet. Add your first knowledge!</p>
                ) : (
                  trainingData.map((data: any) => (
                    <div key={data.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                      {editingKnowledge === data.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleUpdateTrainingData}
                              disabled={updateTrainingMutation.isPending}
                              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm disabled:opacity-50"
                            >
                              {updateTrainingMutation.isPending ? "Saving..." : "Save"}
                            </button>
                            <button
                              onClick={() => {
                                setEditingKnowledge(null);
                                setEditingContent("");
                              }}
                              className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-gray-600 mb-2">{data.content}</p>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{new Date(data.timestamp).toLocaleDateString()}</span>
                              <span className={data.isActive ? "text-green-600" : "text-red-600"}>
                                {data.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditTrainingData(data)}
                                className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteTrainingData(data.id)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                                disabled={deleteTrainingMutation.isPending}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : activeTab === "prompts" ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Prompt Examples ({promptExamples.length})
            </h2>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {promptExamples.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No prompt examples yet.</p>
              ) : (
                promptExamples.map((prompt: any) => (
                  <div key={prompt.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{prompt.question}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            prompt.responseType === 'projects' ? 'bg-blue-100 text-blue-700' :
                            prompt.responseType === 'experiences' ? 'bg-green-100 text-green-700' :
                            prompt.responseType === 'contacts' ? 'bg-purple-100 text-purple-700' :
                            prompt.responseType === 'skills' ? 'bg-orange-100 text-orange-700' :
                            prompt.responseType === 'introduce' ? 'bg-pink-100 text-pink-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {prompt.responseType === 'projects' ? 'Projects' :
                             prompt.responseType === 'experiences' ? 'Experiences' :
                             prompt.responseType === 'contacts' ? 'Contacts' :
                             prompt.responseType === 'skills' ? 'Skills' :
                             prompt.responseType === 'introduce' ? 'Introduction' : 'AI Response'}
                          </span>
                          <span className="text-xs text-gray-500">Order: {prompt.displayOrder}</span>
                          {!prompt.isActive && <span className="text-xs text-red-500">Inactive</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : activeTab === "responses" && responseSubTab === "introduction" ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Introduction
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Photo
                </label>
                <div className="flex items-center gap-4">
                  {introductionImage && (
                    <div className="relative">
                      <img
                        src={introductionImage}
                        alt="Profile"
                        className="w-20 h-20 rounded-lg object-cover border border-gray-300"
                      />
                      <button
                        onClick={() => setIntroductionImage("")}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <div className="flex-1 space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <div className="relative">
                      <input
                        type="text"
                        value={introductionImage}
                        onChange={(e) => setIntroductionImage(e.target.value)}
                        placeholder="Or enter image URL"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Upload a photo directly or paste an image URL
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Introduction Text
                </label>
                <textarea
                  value={introductionContent}
                  onChange={(e) => setIntroductionContent(e.target.value)}
                  placeholder="Write your introduction text that will be shown when someone asks about you..."
                  className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={updateIntroductionMutation.isPending}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This text will be used when someone asks "Tell me about yourself" or similar introduction questions
                </p>
              </div>

              <button
                onClick={handleIntroductionSubmit}
                disabled={!introductionContent.trim() || updateIntroductionMutation.isPending}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-300 text-white py-3 px-6 rounded-lg font-medium transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updateIntroductionMutation.isPending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {updateIntroductionMutation.isPending ? "Updating..." : "Update Introduction"}
              </button>

              {introductionQuery.data?.introduction && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Current Introduction Preview:</h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    {introductionQuery.data.introduction.img && (
                      <img
                        src={introductionQuery.data.introduction.img}
                        alt="Profile"
                        className="w-16 h-16 rounded-lg object-cover mb-3 border border-gray-300"
                      />
                    )}
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {introductionQuery.data.introduction.content}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "responses" && responseSubTab === "projects" ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Code className="w-5 h-5" />
                Projects ({projects.length})
              </h2>
              <button
                onClick={() => {
                  setEditingProject(null);
                  resetProjectForm();
                  setShowProjectForm(true);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                Add Project
              </button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {projects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Code className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No projects yet</p>
                  <p className="text-sm">Add your first project above</p>
                </div>
              ) : (
                projects.map((project: any) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                    <div className="flex items-start gap-3 mb-2">
                      {project.img && (
                        <img src={project.img} alt={project.imgAlt} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-800">{project.title}</h3>
                            <p className="text-sm text-gray-600">{project.period}</p>
                            <p className="text-xs text-gray-500">{project.subtitle}</p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setEditingProject(project);
                                setProjectForm({
                                  title: project.title,
                                  period: project.period,
                                  subtitle: project.subtitle,
                                  summary: project.summary,
                                  contents: project.contents,
                                  tech: project.tech,
                                  img: project.img,
                                  imgAlt: project.imgAlt,
                                  moreLink: project.moreLink || "",
                                  width: project.width,
                                  detailedContent: project.detailedContent || ""
                                });
                                setShowProjectForm(true);
                              }}
                              className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this project?")) {
                                  deleteProjectMutation.mutate(project.id);
                                }
                              }}
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{project.summary}</p>
                    <div className="flex flex-wrap gap-1">
                      {project.contents.map((content: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {content}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : activeTab === "responses" && responseSubTab === "experience" ? (
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
            {/* Experience Form */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 sm:p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                {editingExperience ? "Edit Experience" : "Add New Experience"}
              </h2>
              
              {!showExperienceForm ? (
                <button
                  onClick={() => {
                    setEditingExperience(null);
                    resetExperienceForm();
                    setShowExperienceForm(true);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4" />
                  Add Experience
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                      <input
                        type="text"
                        value={experienceForm.company}
                        onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Company name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                      <input
                        type="text"
                        value={experienceForm.position}
                        onChange={(e) => setExperienceForm({ ...experienceForm, position: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Job title"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
                      <input
                        type="text"
                        value={experienceForm.period}
                        onChange={(e) => setExperienceForm({ ...experienceForm, period: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Jan 2022 - Present"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        value={experienceForm.location}
                        onChange={(e) => setExperienceForm({ ...experienceForm, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={experienceForm.description}
                      onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
                      className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Brief description of your role"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Responsibilities</label>
                    {experienceForm.responsibilities.map((responsibility, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={responsibility}
                          onChange={(e) => {
                            const newResponsibilities = [...experienceForm.responsibilities];
                            newResponsibilities[index] = e.target.value;
                            setExperienceForm({ ...experienceForm, responsibilities: newResponsibilities });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Key responsibility"
                        />
                        <button
                          onClick={() => {
                            const newResponsibilities = experienceForm.responsibilities.filter((_, i) => i !== index);
                            setExperienceForm({ ...experienceForm, responsibilities: newResponsibilities });
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setExperienceForm({ ...experienceForm, responsibilities: [...experienceForm.responsibilities, ""] })}
                      className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Responsibility
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Skills Used</label>
                      <input
                        type="text"
                        value={experienceForm.skills}
                        onChange={(e) => setExperienceForm({ ...experienceForm, skills: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="React, Node.js, Python, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Website</label>
                      <input
                        type="text"
                        value={experienceForm.website}
                        onChange={(e) => setExperienceForm({ ...experienceForm, website: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo URL</label>
                    <input
                      type="text"
                      value={experienceForm.img}
                      onChange={(e) => setExperienceForm({ ...experienceForm, img: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleExperienceSubmit}
                      disabled={!experienceForm.company.trim() || !experienceForm.position.trim() || addExperienceMutation.isPending || updateExperienceMutation.isPending}
                      className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-300 text-white py-2 px-4 rounded-lg font-medium transition-all disabled:cursor-not-allowed"
                    >
                      {editingExperience ? "Update Experience" : "Add Experience"}
                    </button>
                    <button
                      onClick={() => {
                        setShowExperienceForm(false);
                        setEditingExperience(null);
                        resetExperienceForm();
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Experience List */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Work Experience ({experiences.length})</h3>
              
              {experiencesQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : experiences.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No experiences yet</p>
                  <p className="text-sm">Add your first experience above</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {experiences.map((experience: any) => (
                    <div key={experience.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                      <div className="flex items-start gap-3 mb-2">
                        {experience.img && (
                          <img src={experience.img} alt={experience.company} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-800">{experience.position}</h3>
                              <p className="text-sm text-gray-600">{experience.company} • {experience.period}</p>
                              <p className="text-xs text-gray-500">{experience.location}</p>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setEditingExperience(experience);
                                  setExperienceForm({
                                    company: experience.company,
                                    position: experience.position,
                                    period: experience.period,
                                    location: experience.location,
                                    description: experience.description || "",
                                    responsibilities: experience.responsibilities || [""],
                                    skills: experience.skills || "",
                                    website: experience.website || "",
                                    img: experience.img || "",
                                    detailedContent: experience.detailedContent || ""
                                  });
                                  setShowExperienceForm(true);
                                }}
                                className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this experience?")) {
                                    deleteExperienceMutation.mutate(experience.id);
                                  }
                                }}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      {experience.description && (
                        <p className="text-sm text-gray-600 mb-2">{experience.description}</p>
                      )}
                      {experience.responsibilities && experience.responsibilities.length > 0 && (
                        <div className="space-y-1">
                          {experience.responsibilities.map((resp: string, idx: number) => (
                            <p key={idx} className="text-xs text-gray-600">• {resp}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "responses" && responseSubTab === "skills" ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Code className="w-5 h-5" />
              Skills ({skills.length})
            </h2>
            
            <div className="space-y-4">
              {skillCategories.map((category: any) => {
                const categorySkills = skills.filter((skill: any) => skill.categoryId === category.id);
                return (
                  <div key={category.id} className="border border-gray-200 rounded-lg p-3">
                    <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full bg-${category.color}-500`}></span>
                      {category.name}
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {categorySkills.map((skill: any) => (
                        <span key={skill.id} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {skill.name} ({skill.proficiency})
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeTab === "responses" && responseSubTab === "contact" ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Contact Information
            </h2>
            
            {contact ? (
              <div className="space-y-3">
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-gray-800">Contact Details</h3>
                    <button
                      onClick={() => {
                        setContactForm({
                          email: contact.email,
                          linkedin: contact.linkedin || "",
                          github: contact.github || "",
                          website: contact.website || "",
                          phone: contact.phone || ""
                        });
                      }}
                      className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
                      <p className="text-sm text-gray-800">{contact.email}</p>
                    </div>
                    {contact.linkedin && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">LinkedIn</label>
                        <p className="text-sm text-gray-800">{contact.linkedin}</p>
                      </div>
                    )}
                    {contact.github && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">GitHub</label>
                        <p className="text-sm text-gray-800">{contact.github}</p>
                      </div>
                    )}
                    {contact.website && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Website</label>
                        <p className="text-sm text-gray-800">{contact.website}</p>
                      </div>
                    )}
                    {contact.phone && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</label>
                        <p className="text-sm text-gray-800">{contact.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-3">No contact information available.</p>
                <button
                  onClick={() => {
                    setContactForm({
                      email: "",
                      linkedin: "",
                      github: "",
                      website: "",
                      phone: ""
                    });
                  }}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                >
                  Add Contact Info
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Please select a tab to view content</p>
          </div>
        )}
      </div>
    </div>
  );
}