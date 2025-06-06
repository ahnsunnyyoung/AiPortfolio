import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Brain, Plus, Trash2, Save, ArrowLeft, Code, ExternalLink, User, Briefcase, X, MessageCircle, GripVertical, Edit3 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

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

export default function Train() {
  const [trainingContent, setTrainingContent] = useState("");
  const [activeTab, setActiveTab] = useState<"knowledge" | "projects" | "experience" | "prompts" | "contact" | "skills">("knowledge");
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
      resetProjectForm();
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

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, project }: { id: number, project: any }) => {
      const response = await apiRequest("PUT", `/api/projects/${id}`, project);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Project Updated",
        description: "Project has been updated successfully",
      });
      resetProjectForm();
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update project",
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

  const resetProjectForm = () => {
    setShowProjectForm(false);
    setEditingProject(null);
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

  const handleProjectEdit = (project: Project) => {
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

    if (editingProject) {
      updateProjectMutation.mutate({ 
        id: editingProject.id, 
        project: { ...projectForm, contents: filteredContents }
      });
    } else {
      addProjectMutation.mutate({
        ...projectForm,
        contents: filteredContents
      });
    }
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

  // Experience mutations and handlers
  const addExperienceMutation = useMutation({
    mutationFn: async (experience: any) => {
      const response = await apiRequest("POST", "/api/experiences", experience);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Experience Added",
        description: "Experience has been added successfully",
      });
      resetExperienceForm();
      queryClient.invalidateQueries({ queryKey: ['/api/experiences'] });
    },
    onError: (error: any) => {
      toast({
        title: "Add Failed",
        description: error.message || "Failed to add experience",
        variant: "destructive"
      });
    }
  });

  const updateExperienceMutation = useMutation({
    mutationFn: async ({ id, experience }: { id: number, experience: any }) => {
      const response = await apiRequest("PUT", `/api/experiences/${id}`, experience);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Experience Updated",
        description: "Experience has been updated successfully",
      });
      resetExperienceForm();
      queryClient.invalidateQueries({ queryKey: ['/api/experiences'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update experience",
        variant: "destructive"
      });
    }
  });

  const deleteExperienceMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/experiences/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Experience Deleted",
        description: "Experience has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/experiences'] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete experience",
        variant: "destructive"
      });
    }
  });

  const addPromptExampleMutation = useMutation({
    mutationFn: async (promptData: any) => {
      const response = await apiRequest("POST", "/api/prompt-examples", promptData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Prompt Example Added",
        description: "Prompt example has been added successfully",
      });
      resetPromptForm();
      queryClient.invalidateQueries({ queryKey: ['/api/prompt-examples'] });
      queryClient.invalidateQueries({ queryKey: ['/api/prompt-examples/active'] });
    },
    onError: (error: any) => {
      toast({
        title: "Add Failed",
        description: error.message || "Failed to add prompt example",
        variant: "destructive"
      });
    }
  });

  const updatePromptExampleMutation = useMutation({
    mutationFn: async ({ id, prompt }: { id: number, prompt: any }) => {
      const response = await apiRequest("PUT", `/api/prompt-examples/${id}`, prompt);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Prompt Example Updated",
        description: "Prompt example has been updated successfully",
      });
      resetPromptForm();
      queryClient.invalidateQueries({ queryKey: ['/api/prompt-examples'] });
      queryClient.invalidateQueries({ queryKey: ['/api/prompt-examples/active'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update prompt example",
        variant: "destructive"
      });
    }
  });

  const deletePromptExampleMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/prompt-examples/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Prompt Example Deleted",
        description: "Prompt example has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/prompt-examples'] });
      queryClient.invalidateQueries({ queryKey: ['/api/prompt-examples/active'] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete prompt example",
        variant: "destructive"
      });
    }
  });

  const addSkillMutation = useMutation({
    mutationFn: async (skillData: any) => {
      const response = await apiRequest("POST", "/api/skills", skillData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Skill Added",
        description: "Skill has been added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/skills'] });
    },
    onError: (error: any) => {
      toast({
        title: "Add Failed",
        description: error.message || "Failed to add skill",
        variant: "destructive"
      });
    }
  });

  const deleteSkillMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/skills/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Skill Deleted",
        description: "Skill has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/skills'] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete skill",
        variant: "destructive"
      });
    }
  });

  const updateSkillMutation = useMutation({
    mutationFn: async ({ id, skill }: { id: number, skill: any }) => {
      const response = await apiRequest("PUT", `/api/skills/${id}`, skill);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Skill Updated",
        description: "Skill has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/skills'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update skill",
        variant: "destructive"
      });
    }
  });

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const skills = skillsQuery.data?.skills || [];
    const categoryId = parseInt(result.droppableId);
    const categorySkills = skills.filter((skill: Skill) => skill.categoryId === categoryId);
    
    const [reorderedItem] = categorySkills.splice(result.source.index, 1);
    categorySkills.splice(result.destination.index, 0, reorderedItem);

    // Update display orders
    categorySkills.forEach((skill: Skill, index: number) => {
      updateSkillMutation.mutate({
        id: skill.id,
        skill: { ...skill, displayOrder: index }
      });
    });
  };

  const handleSkillEdit = (skill: Skill) => {
    setEditingSkill(skill.id);
    setEditingSkillName(skill.name);
  };

  const handleSkillSave = () => {
    if (editingSkill && editingSkillName.trim()) {
      const skills = skillsQuery.data?.skills || [];
      const skill = skills.find((s: Skill) => s.id === editingSkill);
      if (skill) {
        updateSkillMutation.mutate({
          id: editingSkill,
          skill: { ...skill, name: editingSkillName.trim() }
        });
      }
    }
    setEditingSkill(null);
    setEditingSkillName("");
  };

  const handleSkillCancel = () => {
    setEditingSkill(null);
    setEditingSkillName("");
  };

  const resetPromptForm = () => {
    setShowPromptForm(false);
    setEditingPrompt(null);
    setPromptForm({
      question: "",
      responseType: "ai",
      isActive: true,
      displayOrder: 0
    });
  };

  const resetExperienceForm = () => {
    setShowExperienceForm(false);
    setEditingExperience(null);
    setExperienceForm({
      company: "",
      position: "",
      period: "",
      location: "",
      description: "",
      responsibilities: [""],
      skills: "",
      website: "",
      detailedContent: ""
    });
  };

  const handleExperienceEdit = (experience: Experience) => {
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
      detailedContent: experience.detailedContent || ""
    });
    setShowExperienceForm(true);
  };

  const handleExperienceDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this experience?")) {
      deleteExperienceMutation.mutate(id);
    }
  };

  const handleExperienceSubmit = () => {
    if (!experienceForm.company.trim() || !experienceForm.position.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in the company and position fields",
        variant: "destructive"
      });
      return;
    }

    const filteredResponsibilities = experienceForm.responsibilities.filter(resp => resp.trim());
    if (filteredResponsibilities.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please add at least one responsibility",
        variant: "destructive"
      });
      return;
    }

    if (editingExperience) {
      updateExperienceMutation.mutate({ 
        id: editingExperience.id, 
        experience: { ...experienceForm, responsibilities: filteredResponsibilities }
      });
    } else {
      addExperienceMutation.mutate({
        ...experienceForm,
        responsibilities: filteredResponsibilities
      });
    }
  };

  const addResponsibilityField = () => {
    setExperienceForm(prev => ({
      ...prev,
      responsibilities: [...prev.responsibilities, ""]
    }));
  };

  const updateResponsibilityField = (index: number, value: string) => {
    setExperienceForm(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.map((resp, i) => i === index ? value : resp)
    }));
  };

  const removeResponsibilityField = (index: number) => {
    setExperienceForm(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index)
    }));
  };

  const handlePromptEdit = (prompt: PromptExample) => {
    setEditingPrompt(prompt);
    setPromptForm({
      question: prompt.question,
      responseType: prompt.responseType,
      isActive: prompt.isActive,
      displayOrder: prompt.displayOrder
    });
    setShowPromptForm(true);
  };

  const handlePromptSubmit = () => {
    if (!promptForm.question.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in the question field",
        variant: "destructive"
      });
      return;
    }

    if (editingPrompt) {
      updatePromptExampleMutation.mutate({ 
        id: editingPrompt.id, 
        prompt: promptForm
      });
    } else {
      addPromptExampleMutation.mutate(promptForm);
    }
  };

  const handlePromptDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this prompt example?")) {
      deletePromptExampleMutation.mutate(id);
    }
  };

  const trainingData: TrainingData[] = trainingDataQuery.data?.data || [];
  const projects: Project[] = projectsQuery.data?.projects || [];
  const experiences: Experience[] = experiencesQuery.data?.experiences || [];
  const promptExamples: PromptExample[] = promptExamplesQuery.data?.examples || [];

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

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white/80 backdrop-blur-sm rounded-lg p-1 mb-6 sm:mb-8 border border-white/50 overflow-x-auto">
          <button
            onClick={() => setActiveTab("knowledge")}
            className={`flex-1 min-w-0 py-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "knowledge"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Brain className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
            AI Knowledge
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`flex-1 min-w-0 py-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "projects"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Code className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
            Projects
          </button>
          <button
            onClick={() => setActiveTab("experience")}
            className={`flex-1 min-w-0 py-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "experience"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
            Experience
          </button>
          <button
            onClick={() => setActiveTab("prompts")}
            className={`flex-1 min-w-0 py-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "prompts"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
            Prompts
          </button>
          <button
            onClick={() => setActiveTab("contact")}
            className={`flex-1 min-w-0 py-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "contact"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <User className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
            Contact
          </button>
          <button
            onClick={() => setActiveTab("skills")}
            className={`flex-1 min-w-0 py-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "skills"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Code className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
            Skills
          </button>
        </div>

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
        ) : activeTab === "projects" ? (
          // Projects Tab
          <div className="space-y-8">
            {/* Projects Header with Add Button */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <Code className="w-5 h-5 sm:w-6 sm:h-6" />
                Project Management
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

            {/* Projects List */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Projects</h3>
              
              {projectsQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Code className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No projects yet</p>
                  <p className="text-sm">Add your first project above</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {projects.map((project) => (
                    <div key={project.id} className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 group relative">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1">
                        <button
                          onClick={() => handleProjectEdit(project)}
                          disabled={updateProjectMutation.isPending}
                          className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-all disabled:opacity-50"
                          title="Edit project"
                        >
                          <Brain className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => handleProjectDelete(project.id)}
                          disabled={deleteProjectMutation.isPending}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all disabled:opacity-50"
                          title="Delete project"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                      
                      <h4 className="font-semibold text-gray-800 mb-2 pr-8 text-sm sm:text-base">{project.title}</h4>
                      <p className="text-xs text-gray-500 mb-2">{project.period}</p>
                      <p className="text-xs sm:text-sm text-gray-700 mb-3 line-clamp-2">{project.summary}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {project.tech.split(' / ').slice(0, 2).map((tech, index) => (
                          <span
                            key={index}
                            className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.tech.split(' / ').length > 2 && (
                          <span className="text-xs text-gray-500">+{project.tech.split(' / ').length - 2}</span>
                        )}
                      </div>
                      
                      {project.moreLink && (
                        <a
                          href={project.moreLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs sm:text-sm"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong>{projects.length}</strong> projects stored
                </p>
              </div>
            </div>

            {/* Project Form Modal */}
            {showProjectForm && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {editingProject ? "Edit Project" : "Add New Project"}
                      </h3>
                      <button
                        onClick={() => setShowProjectForm(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Project Title *
                          </label>
                          <input
                            type="text"
                            value={projectForm.title}
                            onChange={(e) => setProjectForm(prev => ({...prev, title: e.target.value}))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter project title"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Period
                          </label>
                          <input
                            type="text"
                            value={projectForm.period}
                            onChange={(e) => setProjectForm(prev => ({...prev, period: e.target.value}))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., March 2022 - June 2022"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subtitle
                        </label>
                        <input
                          type="text"
                          value={projectForm.subtitle}
                          onChange={(e) => setProjectForm(prev => ({...prev, subtitle: e.target.value}))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Individual, Team (Frontend Developer)"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Summary *
                        </label>
                        <textarea
                          value={projectForm.summary}
                          onChange={(e) => setProjectForm(prev => ({...prev, summary: e.target.value}))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          rows={3}
                          placeholder="Brief description of the project"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Key Features
                        </label>
                        {projectForm.contents.map((content, index) => (
                          <div key={index} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={content}
                              onChange={(e) => updateContentField(index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Describe a key feature or achievement"
                            />
                            {projectForm.contents.length > 1 && (
                              <button
                                onClick={() => removeContentField(index)}
                                className="text-red-500 hover:text-red-700 p-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={addContentField}
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Add Feature
                        </button>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Technologies
                          </label>
                          <input
                            type="text"
                            value={projectForm.tech}
                            onChange={(e) => setProjectForm(prev => ({...prev, tech: e.target.value}))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="React / TypeScript / Node.js"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Project Link
                          </label>
                          <input
                            type="url"
                            value={projectForm.moreLink}
                            onChange={(e) => setProjectForm(prev => ({...prev, moreLink: e.target.value}))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://github.com/..."
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Detailed Content (for "Ask more" responses)
                        </label>
                        <textarea
                          value={projectForm.detailedContent}
                          onChange={(e) => setProjectForm(prev => ({...prev, detailedContent: e.target.value}))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={4}
                          placeholder="Enter detailed information that will be shown when users click 'Ask more' for this project..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          This content will appear as a predefined response when users click "Ask more" instead of using AI generation.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                      <button
                        onClick={() => setShowProjectForm(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleProjectSubmit}
                        disabled={addProjectMutation.isPending}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {addProjectMutation.isPending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Adding...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Add Project
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === "experience" ? (
          <div className="space-y-6">
            {/* Experience Header */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Work Experience</h2>
                  <p className="text-sm sm:text-base text-gray-600">Manage your professional experience and career history</p>
                </div>
                <button
                  onClick={() => {
                    setEditingExperience(null);
                    resetExperienceForm();
                    setShowExperienceForm(true);
                  }}
                  disabled={addExperienceMutation.isPending}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-50 text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4" />
                  Add Experience
                </button>
              </div>
            </div>

            {/* Experience List */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Your Experience</h3>
              
              {experiencesQuery.isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading experiences...</p>
                </div>
              ) : experiences.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No experiences yet</p>
                  <p className="text-sm">Add your first experience above</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {experiences.map((experience) => (
                    <div key={experience.id} className="bg-white rounded-lg p-4 border border-gray-200 group relative">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1">
                        <button
                          onClick={() => handleExperienceEdit(experience)}
                          disabled={updateExperienceMutation.isPending}
                          className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-all disabled:opacity-50"
                          title="Edit experience"
                        >
                          <Brain className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExperienceDelete(experience.id)}
                          disabled={deleteExperienceMutation.isPending}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all disabled:opacity-50"
                          title="Delete experience"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="pr-12">
                        <h4 className="font-semibold text-gray-800 text-base sm:text-lg">{experience.position}</h4>
                        <p className="text-blue-600 font-medium text-sm sm:text-base">{experience.company}</p>
                        <p className="text-gray-500 text-xs sm:text-sm mb-2">{experience.period} • {experience.location}</p>
                        {experience.description && (
                          <p className="text-gray-700 text-sm mb-3">{experience.description}</p>
                        )}
                        {experience.website && (
                          <p className="text-sm mb-3">
                            <a href={experience.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {experience.website}
                            </a>
                          </p>
                        )}
                        
                        {experience.responsibilities && experience.responsibilities.length > 0 && (
                          <div className="mb-3">
                            <h5 className="font-medium text-gray-800 text-sm mb-1">Key Responsibilities:</h5>
                            <ul className="list-disc list-inside space-y-1">
                              {experience.responsibilities.slice(0, 3).map((resp, index) => (
                                <li key={index} className="text-gray-600 text-xs sm:text-sm">{resp}</li>
                              ))}
                              {experience.responsibilities.length > 3 && (
                                <li className="text-gray-500 text-xs">+{experience.responsibilities.length - 3} more</li>
                              )}
                            </ul>
                          </div>
                        )}
                        
                        {experience.skills && (
                          <div className="flex flex-wrap gap-1">
                            {experience.skills.split(' / ').slice(0, 4).map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200"
                              >
                                {skill}
                              </span>
                            ))}
                            {experience.skills.split(' / ').length > 4 && (
                              <span className="text-xs text-gray-500">+{experience.skills.split(' / ').length - 4}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong>{experiences.length}</strong> experiences stored
                </p>
              </div>
            </div>

            {/* Experience Form Modal */}
            {showExperienceForm && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {editingExperience ? "Edit Experience" : "Add New Experience"}
                      </h3>
                      <button
                        onClick={() => setShowExperienceForm(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company *
                          </label>
                          <input
                            type="text"
                            value={experienceForm.company}
                            onChange={(e) => setExperienceForm(prev => ({...prev, company: e.target.value}))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter company name"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Position *
                          </label>
                          <input
                            type="text"
                            value={experienceForm.position}
                            onChange={(e) => setExperienceForm(prev => ({...prev, position: e.target.value}))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter position title"
                          />
                        </div>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Period
                          </label>
                          <input
                            type="text"
                            value={experienceForm.period}
                            onChange={(e) => setExperienceForm(prev => ({...prev, period: e.target.value}))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 2023 - Present"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location
                          </label>
                          <input
                            type="text"
                            value={experienceForm.location}
                            onChange={(e) => setExperienceForm(prev => ({...prev, location: e.target.value}))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Seoul, South Korea"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={experienceForm.description}
                          onChange={(e) => setExperienceForm(prev => ({...prev, description: e.target.value}))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          rows={3}
                          placeholder="Brief description of your role and responsibilities"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Key Responsibilities
                        </label>
                        {experienceForm.responsibilities.map((resp, index) => (
                          <div key={index} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={resp}
                              onChange={(e) => updateResponsibilityField(index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Describe a key responsibility or achievement"
                            />
                            {experienceForm.responsibilities.length > 1 && (
                              <button
                                onClick={() => removeResponsibilityField(index)}
                                className="text-red-500 hover:text-red-700 p-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={addResponsibilityField}
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Add Responsibility
                        </button>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Skills & Technologies
                          </label>
                          <input
                            type="text"
                            value={experienceForm.skills}
                            onChange={(e) => setExperienceForm(prev => ({...prev, skills: e.target.value}))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="React / TypeScript / Node.js"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company Website
                          </label>
                          <input
                            type="url"
                            value={experienceForm.website}
                            onChange={(e) => setExperienceForm(prev => ({...prev, website: e.target.value}))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://company.com"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Detailed Content (for "Ask more" responses)
                        </label>
                        <textarea
                          value={experienceForm.detailedContent}
                          onChange={(e) => setExperienceForm(prev => ({...prev, detailedContent: e.target.value}))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={4}
                          placeholder="Enter detailed information that will be shown when users click 'Ask more' for this experience..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          This content will appear as a predefined response when users click "Ask more" instead of using AI generation.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => setShowExperienceForm(false)}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleExperienceSubmit}
                          disabled={addExperienceMutation.isPending || updateExperienceMutation.isPending}
                          className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {(addExperienceMutation.isPending || updateExperienceMutation.isPending) ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          {editingExperience ? "Update Experience" : "Save Experience"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
        ) : activeTab === "prompts" ? (
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
            {/* Add Prompt Form */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 sm:p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                {editingPrompt ? "Edit Prompt Example" : "Add New Prompt Example"}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question *
                  </label>
                  <input
                    type="text"
                    value={promptForm.question}
                    onChange={(e) => setPromptForm(prev => ({...prev, question: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter the example question"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Response Type
                  </label>
                  <select
                    value={promptForm.responseType}
                    onChange={(e) => setPromptForm(prev => ({...prev, responseType: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ai">AI Response</option>
                    <option value="projects">Show Projects</option>
                    <option value="experiences">Show Experiences</option>
                    <option value="contacts">Show Contacts</option>
                    <option value="skills">Show Skills</option>
                  </select>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={promptForm.displayOrder}
                      onChange={(e) => setPromptForm(prev => ({...prev, displayOrder: parseInt(e.target.value) || 0}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Order (0-100)"
                      min="0"
                    />
                  </div>
                  
                  <div className="flex items-center pt-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={promptForm.isActive}
                        onChange={(e) => setPromptForm(prev => ({...prev, isActive: e.target.checked}))}
                        className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  {editingPrompt && (
                    <button
                      onClick={resetPromptForm}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={handlePromptSubmit}
                    disabled={addPromptExampleMutation.isPending || updatePromptExampleMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {(addPromptExampleMutation.isPending || updatePromptExampleMutation.isPending) ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {editingPrompt ? "Update Prompt" : "Save Prompt"}
                  </button>
                </div>
              </div>
            </div>

            {/* Prompt Examples List */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 sm:p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Prompt Examples ({promptExamples.length})
              </h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {promptExamples.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No prompt examples yet. Add your first one!</p>
                ) : (
                  promptExamples.map((prompt) => (
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
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {prompt.responseType === 'projects' ? 'Projects' :
                               prompt.responseType === 'experiences' ? 'Experiences' :
                               prompt.responseType === 'contacts' ? 'Contacts' :
                               prompt.responseType === 'skills' ? 'Skills' : 'AI Response'}
                            </span>
                            <span className="text-xs text-gray-500">Order: {prompt.displayOrder}</span>
                            {!prompt.isActive && <span className="text-xs text-red-500">Inactive</span>}
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => handlePromptEdit(prompt)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit prompt"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePromptDelete(prompt.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete prompt"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : activeTab === "contact" ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Contact Information
            </h2>
            
            {contactQuery.isLoading ? (
              <div className="text-center py-8">Loading contact information...</div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={contactForm.email || contactQuery.data?.contact?.email || ""}
                    onChange={(e) => setContactForm(prev => ({...prev, email: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                  <input
                    type="url"
                    value={contactQuery.data?.contact?.linkedin || ""}
                    onChange={(e) => setContactForm(prev => ({...prev, linkedin: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                  <input
                    type="url"
                    value={contactQuery.data?.contact?.github || ""}
                    onChange={(e) => setContactForm(prev => ({...prev, github: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://github.com/yourusername"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={contactQuery.data?.contact?.website || ""}
                    onChange={(e) => setContactForm(prev => ({...prev, website: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={contactQuery.data?.contact?.phone || ""}
                    onChange={(e) => setContactForm(prev => ({...prev, phone: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                
                <button
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Update Contact Information
                </button>
              </div>
            )}
          </div>
        ) : activeTab === "skills" ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Code className="w-5 h-5" />
              Skills Management
            </h2>
            
            {skillsQuery.isLoading || skillCategoriesQuery.isLoading ? (
              <div className="text-center py-8">Loading skills...</div>
            ) : (
              <div className="space-y-6">
                {skillCategoriesQuery.data?.categories?.map((category: SkillCategory) => (
                  <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full bg-${category.color}-500`}></span>
                      {category.name}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {skillsQuery.data?.skills
                        ?.filter((skill: Skill) => skill.categoryId === category.id)
                        ?.map((skill: Skill) => (
                          <span
                            key={skill.id}
                            className={`px-3 py-1 bg-${category.color}-50 text-${category.color}-700 text-sm rounded-full border border-${category.color}-200 flex items-center gap-2`}
                          >
                            {skill.name}
                            <button
                              onClick={() => deleteSkillMutation.mutate(skill.id)}
                              disabled={deleteSkillMutation.isPending}
                              className="text-red-500 hover:text-red-700 disabled:opacity-50"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={() => {
                    const skillName = prompt("Enter skill name:");
                    const categoryId = prompt("Enter category ID (1-6):");
                    if (skillName && categoryId) {
                      addSkillMutation.mutate({
                        name: skillName.trim(),
                        categoryId: parseInt(categoryId),
                        proficiency: "Intermediate",
                        displayOrder: 0
                      });
                    }
                  }}
                  disabled={addSkillMutation.isPending}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  {addSkillMutation.isPending ? "Adding..." : "Add New Skill"}
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}