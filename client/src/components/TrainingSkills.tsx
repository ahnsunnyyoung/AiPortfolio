import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Save, Edit3, Trash2, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface SkillCategory {
  id: number;
  name: string;
  timestamp: string;
}

interface Skill {
  id: number;
  name: string;
  categoryId: number;
  proficiency?: string;
  timestamp: string;
}

export default function TrainingSkills() {
  const [newCategory, setNewCategory] = useState("");
  const [newSkill, setNewSkill] = useState({
    name: "",
    categoryId: 0,
    proficiency: ""
  });
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [editingSkill, setEditingSkill] = useState<number | null>(null);
  const [editingSkillData, setEditingSkillData] = useState<any>({});
  const { toast } = useToast();

  const categoriesQuery = useQuery({
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

  const addCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("POST", "/api/skill-categories", { name });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Category Added",
        description: "New skill category has been added successfully",
      });
      setNewCategory("");
      queryClient.invalidateQueries({ queryKey: ['/api/skill-categories'] });
    },
    onError: (error: any) => {
      toast({
        title: "Add Failed",
        description: error.message || "Failed to add skill category",
        variant: "destructive"
      });
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number, name: string }) => {
      const response = await apiRequest("PUT", `/api/skill-categories/${id}`, { name });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Category Updated",
        description: "Skill category has been updated successfully",
      });
      setEditingCategory(null);
      setEditingCategoryName("");
      queryClient.invalidateQueries({ queryKey: ['/api/skill-categories'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update skill category",
        variant: "destructive"
      });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/skill-categories/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Category Deleted",
        description: "Skill category has been removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/skill-categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/skills'] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete skill category",
        variant: "destructive"
      });
    }
  });

  const addSkillMutation = useMutation({
    mutationFn: async (skill: any) => {
      const response = await apiRequest("POST", "/api/skills", skill);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Skill Added",
        description: "New skill has been added successfully",
      });
      setNewSkill({
        name: "",
        categoryId: 0,
        proficiency: ""
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
      setEditingSkill(null);
      setEditingSkillData({});
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

  const deleteSkillMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/skills/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Skill Deleted",
        description: "Skill has been removed successfully",
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

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    addCategoryMutation.mutate(newCategory);
  };

  const handleEditCategory = (category: SkillCategory) => {
    setEditingCategory(category.id);
    setEditingCategoryName(category.name);
  };

  const handleUpdateCategory = () => {
    if (!editingCategoryName.trim() || !editingCategory) return;
    updateCategoryMutation.mutate({ id: editingCategory, name: editingCategoryName });
  };

  const handleDeleteCategory = (id: number) => {
    if (window.confirm("Are you sure you want to delete this category? All skills in this category will also be deleted.")) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const handleAddSkill = () => {
    if (!newSkill.name.trim() || !newSkill.categoryId) return;
    addSkillMutation.mutate(newSkill);
  };

  const handleEditSkill = (skill: Skill) => {
    setEditingSkill(skill.id);
    setEditingSkillData({ ...skill });
  };

  const handleUpdateSkill = () => {
    if (!editingSkillData.name?.trim() || !editingSkillData.categoryId) return;
    const { timestamp, ...skillData } = editingSkillData;
    updateSkillMutation.mutate({ id: editingSkill!, skill: skillData });
  };

  const handleDeleteSkill = (id: number) => {
    if (window.confirm("Are you sure you want to delete this skill?")) {
      deleteSkillMutation.mutate(id);
    }
  };

  const categories = categoriesQuery.data?.categories || [];
  const skills = skillsQuery.data?.skills || [];

  const getSkillsByCategory = (categoryId: number) => {
    return skills.filter((skill: Skill) => skill.categoryId === categoryId);
  };

  const proficiencyLevels = [
    { value: "", label: "Not specified" },
    { value: "Beginner", label: "Beginner" },
    { value: "Intermediate", label: "Intermediate" },
    { value: "Advanced", label: "Advanced" },
    { value: "Expert", label: "Expert" }
  ];

  return (
    <div className="space-y-6">
      {/* Add New Category */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Skill Category
        </h2>

        <div className="flex gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="e.g., Programming Languages, Frontend, Backend"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddCategory}
            disabled={addCategoryMutation.isPending || !newCategory.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {/* Add New Skill */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Code className="w-5 h-5" />
          Add New Skill
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
            <input
              type="text"
              value={newSkill.name}
              onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., React, Python, Node.js"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={newSkill.categoryId}
              onChange={(e) => setNewSkill(prev => ({ ...prev, categoryId: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>Select a category</option>
              {categories.map((category: SkillCategory) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proficiency</label>
            {/* <select
              value={newSkill.proficiency}
              onChange={(e) => setNewSkill(prev => ({ ...prev, proficiency: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {proficiencyLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select> */}
          </div>
        </div>

        <button
          onClick={handleAddSkill}
          disabled={addSkillMutation.isPending || !newSkill.name.trim() || !newSkill.categoryId}
          className="w-full mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {addSkillMutation.isPending ? "Adding..." : "Add Skill"}
        </button>
      </div>

      {/* Skills by Category */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Skills by Category
        </h2>

        {categories.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No skill categories yet. Add your first category!</p>
        ) : (
          <div className="space-y-6">
            {categories.map((category: SkillCategory) => (
              <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  {editingCategory === category.id ? (
                    <div className="flex gap-2 flex-1">
                      <input
                        type="text"
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleUpdateCategory}
                        disabled={updateCategoryMutation.isPending}
                        className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingCategory(null);
                          setEditingCategoryName("");
                        }}
                        className="bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="text-blue-500 hover:bg-blue-50 p-1 rounded transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {getSkillsByCategory(category.id).map((skill: Skill) => (
                    <div key={skill.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                      {editingSkill === skill.id ? (
                        <div className="flex gap-1 flex-1">
                          <input
                            type="text"
                            value={editingSkillData.name || ""}
                            onChange={(e) => setEditingSkillData((prev: any) => ({ ...prev, name: e.target.value }))}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          {/* <select
                            value={editingSkillData.proficiency || ""}
                            onChange={(e) => setEditingSkillData((prev: any) => ({ ...prev, proficiency: e.target.value }))}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {proficiencyLevels.map(level => (
                              <option key={level.value} value={level.value}>
                                {level.label}
                              </option>
                            ))}
                          </select> */}
                          <button
                            onClick={handleUpdateSkill}
                            disabled={updateSkillMutation.isPending}
                            className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600 transition-colors disabled:opacity-50"
                          >
                            <Save className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-800">{skill.name}</span>
                            {skill.proficiency && (
                              <span className="ml-2 text-xs text-gray-600">({skill.proficiency})</span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditSkill(skill)}
                              className="text-blue-500 hover:bg-blue-50 p-1 rounded transition-colors"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteSkill(skill.id)}
                              className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  {getSkillsByCategory(category.id).length === 0 && (
                    <p className="text-gray-500 text-sm italic col-span-full">No skills in this category yet</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}