import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Save, Edit3, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

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

export default function TrainingExperience() {
  const [showModal, setShowModal] = useState(false);
  const [editingExperience, setEditingExperience] = useState<number | null>(null);
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
  const { toast } = useToast();

  const experiencesQuery = useQuery({
    queryKey: ['/api/experiences'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/experiences");
      return response.json();
    }
  });

  const addMutation = useMutation({
    mutationFn: async (experience: any) => {
      const response = await apiRequest("POST", "/api/experiences", experience);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Experience Added",
        description: "New experience has been added successfully",
      });
      resetForm();
      setShowModal(false);
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

  const updateMutation = useMutation({
    mutationFn: async ({ id, experience }: { id: number, experience: any }) => {
      const response = await apiRequest("PUT", `/api/experiences/${id}`, experience);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Experience Updated",
        description: "Experience has been updated successfully",
      });
      resetForm();
      setEditingExperience(null);
      setShowModal(false);
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

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/experiences/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Experience Deleted",
        description: "Experience has been removed successfully",
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

  const resetForm = () => {
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

  const handleSubmit = () => {
    if (!experienceForm.company.trim() || !experienceForm.position.trim()) return;
    const experienceData = {
      ...experienceForm,
      responsibilities: experienceForm.responsibilities.filter(r => r.trim())
    };
    
    if (editingExperience) {
      updateMutation.mutate({ id: editingExperience, experience: experienceData });
    } else {
      addMutation.mutate(experienceData);
    }
  };

  const handleEdit = (experience: Experience) => {
    setEditingExperience(experience.id);
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
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this experience?")) {
      deleteMutation.mutate(id);
    }
  };

  const addResponsibility = () => {
    setExperienceForm(prev => ({
      ...prev,
      responsibilities: [...prev.responsibilities, ""]
    }));
  };

  const updateResponsibility = (index: number, value: string) => {
    setExperienceForm(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.map((resp, i) => i === index ? value : resp)
    }));
  };

  const removeResponsibility = (index: number) => {
    setExperienceForm(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index)
    }));
  };

  const experiences = experiencesQuery.data?.experiences || [];

  return (
    <div className="space-y-6">
      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            resetForm();
            setEditingExperience(null);
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Experience
        </button>
      </div>

      {/* Experiences List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Experiences ({experiences.length})
        </h2>
        
        <div className="space-y-4">
          {experiences.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No experiences yet. Add your first experience!</p>
          ) : (
            experiences.map((experience: Experience) => (
              <div key={experience.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{experience.position}</h3>
                    <p className="text-blue-600 font-medium">{experience.company}</p>
                    <p className="text-gray-600 text-sm">{experience.period} • {experience.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(experience)}
                      className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(experience.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {experience.description && (
                  <p className="text-gray-700 mb-2">{experience.description}</p>
                )}
                {experience.responsibilities && experience.responsibilities.length > 0 && (
                  <div className="mb-2">
                    <h4 className="font-medium text-gray-800 mb-1">Responsibilities:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {experience.responsibilities.map((resp, index) => (
                        <li key={index} className="text-gray-700 text-sm">{resp}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {experience.skills && (
                  <p className="text-gray-600 text-sm"><span className="font-medium">Skills:</span> {experience.skills}</p>
                )}
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
                  <Plus className="w-5 h-5" />
                  {editingExperience ? "Edit Experience" : "Add New Experience"}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                    setEditingExperience(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                    <input
                      type="text"
                      value={experienceForm.company}
                      onChange={(e) => setExperienceForm(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Company name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                    <input
                      type="text"
                      value={experienceForm.position}
                      onChange={(e) => setExperienceForm(prev => ({ ...prev, position: e.target.value }))}
                      placeholder="Job position"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                    <input
                      type="text"
                      value={experienceForm.period}
                      onChange={(e) => setExperienceForm(prev => ({ ...prev, period: e.target.value }))}
                      placeholder="e.g., Jan 2020 - Dec 2021"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={experienceForm.location}
                      onChange={(e) => setExperienceForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City, Country"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={experienceForm.description}
                    onChange={(e) => setExperienceForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the role"
                    className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Responsibilities</label>
                  {experienceForm.responsibilities.map((responsibility, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={responsibility}
                        onChange={(e) => updateResponsibility(index, e.target.value)}
                        placeholder="Responsibility description"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {experienceForm.responsibilities.length > 1 && (
                        <button
                          onClick={() => removeResponsibility(index)}
                          className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addResponsibility}
                    className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                  >
                    + Add Responsibility
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                    <input
                      type="text"
                      value={experienceForm.skills}
                      onChange={(e) => setExperienceForm(prev => ({ ...prev, skills: e.target.value }))}
                      placeholder="Technologies, languages, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="url"
                      value={experienceForm.website}
                      onChange={(e) => setExperienceForm(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="Company website URL"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={!experienceForm.company.trim() || !experienceForm.position.trim() || addMutation.isPending || updateMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-300 text-white py-3 px-6 rounded-lg font-medium transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {(addMutation.isPending || updateMutation.isPending) ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {editingExperience ? "Update Experience" : "Save Experience"}
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                      setEditingExperience(null);
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