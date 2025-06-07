import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Code, Plus, Save, Trash2, Edit3, X, Upload } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

export default function TrainingProjects() {
  const [showModal, setShowModal] = useState(false);
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
  const { toast } = useToast();

  const projectsQuery = useQuery({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/projects");
      return response.json();
    }
  });

  const addProjectMutation = useMutation({
    mutationFn: async (project: any) => {
      const response = await apiRequest("POST", "/api/projects", project);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Project Added",
        description: "New project has been added successfully",
      });
      resetForm();
      setShowModal(false);
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
      resetForm();
      setEditingProject(null);
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

  const resetForm = () => {
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

  const handleSubmit = () => {
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

    const projectData = {
      ...projectForm,
      contents: filteredContents
    };

    if (editingProject) {
      updateProjectMutation.mutate({ id: editingProject.id, project: projectData });
    } else {
      addProjectMutation.mutate(projectData);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setProjectForm({
      title: project.title,
      period: project.period,
      subtitle: project.subtitle,
      summary: project.summary,
      contents: project.contents.length ? project.contents : [""],
      tech: project.tech,
      img: project.img,
      imgAlt: project.imgAlt,
      moreLink: project.moreLink || "",
      width: project.width,
      detailedContent: project.detailedContent || ""
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      deleteProjectMutation.mutate(id);
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

  const projects = projectsQuery.data?.projects || [];

  return (
    <div className="space-y-6">
      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            resetForm();
            setEditingProject(null);
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Project
        </button>
      </div>

      {/* Projects List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Projects ({projects.length})
        </h2>
        
        <div className="space-y-4">
          {projects.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No projects yet. Add your first project!</p>
          ) : (
            projects.map((project: Project) => (
              <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{project.title}</h3>
                    <p className="text-blue-600 font-medium">{project.subtitle}</p>
                    <p className="text-gray-600 text-sm">{project.period}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(project)}
                      className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 mb-2">{project.summary}</p>
                {project.contents && project.contents.length > 0 && (
                  <div className="mb-2">
                    <h4 className="font-medium text-gray-800 mb-1">Key Features:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {project.contents.map((content, index) => (
                        <li key={index} className="text-gray-700 text-sm">{content}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-gray-600 text-sm"><span className="font-medium">Tech:</span> {project.tech}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  {editingProject ? "Edit Project" : "Add New Project"}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                    setEditingProject(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={projectForm.title}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Project Title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                    <input
                      type="text"
                      value={projectForm.period}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, period: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., March 2022 - June 2022"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={projectForm.subtitle}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, subtitle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Individual, Team (Frontend Developer)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Summary *</label>
                  <textarea
                    value={projectForm.summary}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, summary: e.target.value }))}
                    className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Brief project description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contents</label>
                  {projectForm.contents.map((content, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={content}
                        onChange={(e) => updateContentField(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Project feature or detail"
                      />
                      {projectForm.contents.length > 1 && (
                        <button
                          onClick={() => removeContentField(index)}
                          className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addContentField}
                    className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                  >
                    + Add Content
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Technologies</label>
                    <input
                      type="text"
                      value={projectForm.tech}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, tech: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., React / Javascript / AWS EC2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">More Link</label>
                    <input
                      type="url"
                      value={projectForm.moreLink}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, moreLink: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="GitHub or project URL"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input
                      type="text"
                      value={projectForm.img}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, img: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Project logo or screenshot URL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image Alt Text</label>
                    <input
                      type="text"
                      value={projectForm.imgAlt}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, imgAlt: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Alt text for image"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Content</label>
                  <textarea
                    value={projectForm.detailedContent}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, detailedContent: e.target.value }))}
                    className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Detailed description for AI responses"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={!projectForm.title.trim() || !projectForm.summary.trim() || addProjectMutation.isPending || updateProjectMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-300 text-white py-3 px-6 rounded-lg font-medium transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {(addProjectMutation.isPending || updateProjectMutation.isPending) ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {editingProject ? "Update Project" : "Save Project"}
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                      setEditingProject(null);
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}