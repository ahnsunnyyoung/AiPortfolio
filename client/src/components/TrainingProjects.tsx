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

  const handleProjectDelete = (id: number) => {
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
    <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
      {/* Projects Form */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Code className="w-5 h-5" />
            {editingProject ? "Edit Project" : "Add New Project"}
          </h2>
          {showProjectForm && (
            <button
              onClick={resetProjectForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {!showProjectForm ? (
          <button
            onClick={() => setShowProjectForm(true)}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Project
          </button>
        ) : (
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
                  placeholder="March 2022 - June 2022"
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
                placeholder="Brief project description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Summary *</label>
              <textarea
                value={projectForm.summary}
                onChange={(e) => setProjectForm(prev => ({ ...prev, summary: e.target.value }))}
                className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Brief project summary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contents *</label>
              {projectForm.contents.map((content, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={content}
                    onChange={(e) => updateContentField(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Content item ${index + 1}`}
                  />
                  {projectForm.contents.length > 1 && (
                    <button
                      onClick={() => removeContentField(index)}
                      className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addContentField}
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                + Add Content Item
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technology</label>
                <input
                  type="text"
                  value={projectForm.tech}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, tech: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="React, Node.js, MongoDB"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                <select
                  value={projectForm.width}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, width: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="47%">Half Width (47%)</option>
                  <option value="100%">Full Width (100%)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={projectForm.img}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, img: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              {projectForm.img && (
                <div className="mt-2">
                  <img
                    src={projectForm.img}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">More Link</label>
                <input
                  type="text"
                  value={projectForm.moreLink}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, moreLink: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://project-demo.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Content</label>
              <textarea
                value={projectForm.detailedContent}
                onChange={(e) => setProjectForm(prev => ({ ...prev, detailedContent: e.target.value }))}
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Detailed project description that will be shown in Ask More responses..."
              />
            </div>

            <div className="flex gap-3">
              {editingProject && (
                <button
                  onClick={resetProjectForm}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleProjectSubmit}
                disabled={addProjectMutation.isPending || updateProjectMutation.isPending}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {(addProjectMutation.isPending || updateProjectMutation.isPending) ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {editingProject ? "Update Project" : "Save Project"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Projects List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Projects ({projects.length})
        </h2>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {projects.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No projects yet. Add your first project!</p>
          ) : (
            projects.map((project: Project) => (
              <div key={project.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 truncate">{project.title}</h4>
                    <p className="text-sm text-gray-600 truncate">{project.subtitle}</p>
                    <p className="text-xs text-gray-500 mt-1">{project.period}</p>
                    {project.img && (
                      <img
                        src={project.img}
                        alt={project.imgAlt}
                        className="w-12 h-12 object-cover rounded mt-2 border border-gray-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleProjectEdit(project)}
                      className="p-1 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleProjectDelete(project.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
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
  );
}