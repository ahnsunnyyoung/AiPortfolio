import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Brain, Plus, Trash2, Save, ArrowLeft, Code, ExternalLink } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface TrainingData {
  id: number;
  content: string;
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
}

export default function Train() {
  const [trainingContent, setTrainingContent] = useState("");
  const [activeTab, setActiveTab] = useState<"knowledge" | "projects">("knowledge");
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
    width: "47%"
  });
  const { toast } = useToast();

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

  const trainMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/train", { content });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Training Successful",
        description: "Your knowledge has been added to the AI agent!",
      });
      setTrainingContent("");
      queryClient.invalidateQueries({ queryKey: ['/api/training-data'] });
    },
    onError: (error: any) => {
      toast({
        title: "Training Failed",
        description: error.message || "Failed to add training data",
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/training-data/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Knowledge Deleted",
        description: "The training data has been removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/training-data'] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete training data",
        variant: "destructive"
      });
    }
  });

  const handleTrain = () => {
    if (!trainingContent.trim()) return;
    trainMutation.mutate(trainingContent.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleTrain();
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this knowledge entry?")) {
      deleteMutation.mutate(id);
    }
  };

  const addProjectMutation = useMutation({
    mutationFn: async (project: any) => {
      const response = await apiRequest("POST", "/api/projects", project);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Project Added",
        description: "Project has been added successfully",
      });
      setShowProjectForm(false);
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
        width: "47%"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    },
    onError: (error: any) => {
      toast({
        title: "Add Failed",
        description: error.message || "Failed to add project",
        variant: "destructive"
      });
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/projects/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Project Deleted",
        description: "Project has been removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete project",
        variant: "destructive"
      });
    }
  });

  const handleProjectDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      deleteProjectMutation.mutate(id);
    }
  };

  const handleProjectSubmit = () => {
    if (!projectForm.title.trim() || !projectForm.summary.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in the title and summary fields",
        variant: "destructive"
      });
      return;
    }

    const filteredContents = projectForm.contents.filter(content => content.trim());
    if (filteredContents.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please add at least one content item",
        variant: "destructive"
      });
      return;
    }

    addProjectMutation.mutate({
      ...projectForm,
      contents: filteredContents
    });
  };

  const addContentField = () => {
    setProjectForm(prev => ({
      ...prev,
      contents: [...prev.contents, ""]
    }));
  };

  const updateContentField = (index: number, value: string) => {
    setProjectForm(prev => ({
      ...prev,
      contents: prev.contents.map((content, i) => i === index ? value : content)
    }));
  };

  const removeContentField = (index: number) => {
    setProjectForm(prev => ({
      ...prev,
      contents: prev.contents.filter((_, i) => i !== index)
    }));
  };

  const trainingData: TrainingData[] = trainingDataQuery.data?.data || [];
  const projects: Project[] = projectsQuery.data?.projects || [];

  return (
    <div className="min-h-screen portfolio-gradient">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-gray-600 hover:text-gray-800 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Train AI Agent</h1>
              <p className="text-gray-600">Add knowledge and experiences to your AI</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Training Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
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
                  onKeyPress={handleKeyPress}
                  placeholder="Tell me about yourself, your skills, experiences, thoughts, or any information you want the AI to remember and share..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={trainMutation.isPending}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Press Ctrl+Enter to save quickly
                </p>
              </div>

              <button
                onClick={handleTrain}
                disabled={!trainingContent.trim() || trainMutation.isPending}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-300 text-white py-3 px-6 rounded-lg font-medium transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {trainMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Training...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Train AI Agent
                  </>
                )}
              </button>
            </div>

            {/* Quick Examples */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Example training content:</h3>
              <div className="text-xs text-blue-700 space-y-1">
                <p>• "I specialize in React and TypeScript development with 5+ years of experience"</p>
                <p>• "I love building user-friendly interfaces and believe in clean, maintainable code"</p>
                <p>• "My latest project was an e-commerce platform built with Next.js and Stripe"</p>
                <p>• "I'm passionate about AI integration and modern web technologies"</p>
              </div>
            </div>
          </div>

          {/* Training Data List */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Current Knowledge Base
            </h2>
            
            {trainingDataQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : trainingData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No training data yet</p>
                <p className="text-sm">Start by adding some knowledge above</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {trainingData.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg p-4 border border-gray-200 group">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <p className="text-gray-800 text-sm leading-relaxed mb-2">
                          {item.content}
                        </p>
                        <div className="text-xs text-gray-500">
                          Added: {new Date(item.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deleteMutation.isPending}
                        className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete this knowledge entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>{trainingData.length}</strong> knowledge entries stored
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}