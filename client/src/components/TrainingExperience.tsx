import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Save, Edit3, Trash2, Upload, X } from "lucide-react";
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
  const [newExperience, setNewExperience] = useState({
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
  const [editingExperience, setEditingExperience] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<any>({});
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
      setNewExperience({
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
      setEditingExperience(null);
      setEditingData({});
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

  const handleAddExperience = () => {
    if (!newExperience.company.trim() || !newExperience.position.trim()) return;
    const experienceData = {
      ...newExperience,
      responsibilities: newExperience.responsibilities.filter(r => r.trim())
    };
    addMutation.mutate(experienceData);
  };

  const handleEdit = (experience: Experience) => {
    setEditingExperience(experience.id);
    setEditingData({
      ...experience,
      responsibilities: experience.responsibilities || [""]
    });
  };

  const handleUpdate = () => {
    if (!editingData.company?.trim() || !editingData.position?.trim()) return;
    const experienceData = {
      ...editingData,
      responsibilities: editingData.responsibilities.filter((r: string) => r.trim())
    };
    updateMutation.mutate({ id: editingExperience!, experience: experienceData });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this experience?")) {
      deleteMutation.mutate(id);
    }
  };

  const addResponsibility = (isNew = false) => {
    if (isNew) {
      setNewExperience(prev => ({
        ...prev,
        responsibilities: [...prev.responsibilities, ""]
      }));
    } else {
      setEditingData((prev: any) => ({
        ...prev,
        responsibilities: [...(prev.responsibilities || []), ""]
      }));
    }
  };

  const removeResponsibility = (index: number, isNew = false) => {
    if (isNew) {
      setNewExperience(prev => ({
        ...prev,
        responsibilities: prev.responsibilities.filter((_, i) => i !== index)
      }));
    } else {
      setEditingData((prev: any) => ({
        ...prev,
        responsibilities: prev.responsibilities.filter((_: any, i: number) => i !== index)
      }));
    }
  };

  const experiences = experiencesQuery.data?.experiences || [];

  return (
    <div className="space-y-6">
      {/* Add New Experience */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add New Experience
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input
              type="text"
              value={newExperience.company}
              onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
              placeholder="Company name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <input
              type="text"
              value={newExperience.position}
              onChange={(e) => setNewExperience(prev => ({ ...prev, position: e.target.value }))}
              placeholder="Job position"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
            <input
              type="text"
              value={newExperience.period}
              onChange={(e) => setNewExperience(prev => ({ ...prev, period: e.target.value }))}
              placeholder="e.g., Jan 2020 - Dec 2021"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={newExperience.location}
              onChange={(e) => setNewExperience(prev => ({ ...prev, location: e.target.value }))}
              placeholder="City, Country"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={newExperience.description}
            onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Brief description of the role"
            className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Responsibilities</label>
          {newExperience.responsibilities.map((responsibility, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={responsibility}
                onChange={(e) => {
                  const newResponsibilities = [...newExperience.responsibilities];
                  newResponsibilities[index] = e.target.value;
                  setNewExperience(prev => ({ ...prev, responsibilities: newResponsibilities }));
                }}
                placeholder="Responsibility description"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {newExperience.responsibilities.length > 1 && (
                <button
                  onClick={() => removeResponsibility(index, true)}
                  className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => addResponsibility(true)}
            className="text-blue-500 hover:text-blue-600 text-sm font-medium"
          >
            + Add Responsibility
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
            <input
              type="text"
              value={newExperience.skills}
              onChange={(e) => setNewExperience(prev => ({ ...prev, skills: e.target.value }))}
              placeholder="Technologies, languages, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              type="url"
              value={newExperience.website}
              onChange={(e) => setNewExperience(prev => ({ ...prev, website: e.target.value }))}
              placeholder="Company website URL"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Logo/Image URL</label>
          <input
            type="text"
            value={newExperience.img}
            onChange={(e) => setNewExperience(prev => ({ ...prev, img: e.target.value }))}
            placeholder="Company logo or relevant image URL"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Content</label>
          <textarea
            value={newExperience.detailedContent}
            onChange={(e) => setNewExperience(prev => ({ ...prev, detailedContent: e.target.value }))}
            placeholder="Detailed description for AI responses"
            className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <button
          onClick={handleAddExperience}
          disabled={addMutation.isPending || !newExperience.company.trim() || !newExperience.position.trim()}
          className="w-full mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {addMutation.isPending ? "Adding..." : "Add Experience"}
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
                {editingExperience === experience.id ? (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={editingData.company || ""}
                        onChange={(e) => setEditingData((prev: any) => ({ ...prev, company: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Company"
                      />
                      <input
                        type="text"
                        value={editingData.position || ""}
                        onChange={(e) => setEditingData((prev: any) => ({ ...prev, position: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Position"
                      />
                      <input
                        type="text"
                        value={editingData.period || ""}
                        onChange={(e) => setEditingData((prev: any) => ({ ...prev, period: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Period"
                      />
                      <input
                        type="text"
                        value={editingData.location || ""}
                        onChange={(e) => setEditingData((prev: any) => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Location"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdate}
                        disabled={updateMutation.isPending}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingExperience(null);
                          setEditingData({});
                        }}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
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
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}