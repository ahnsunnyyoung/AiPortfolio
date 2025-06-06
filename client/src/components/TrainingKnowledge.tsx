import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, Save, Trash2, Edit3 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TrainingData {
  id: number;
  content: string;
  isActive: boolean;
  timestamp: string;
}

export default function TrainingKnowledge() {
  const [trainingContent, setTrainingContent] = useState("");
  const [editingKnowledge, setEditingKnowledge] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const { toast } = useToast();

  const trainingDataQuery = useQuery({
    queryKey: ['/api/training-data'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/training-data");
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
        description: "Training data has been removed successfully",
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

  const updateMutation = useMutation({
    mutationFn: async ({ id, content }: { id: number, content: string }) => {
      const response = await apiRequest("PUT", `/api/training-data/${id}`, { content });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Knowledge Updated",
        description: "Training data has been updated successfully",
      });
      setEditingKnowledge(null);
      setEditingContent("");
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

  const handleTrain = () => {
    if (!trainingContent.trim()) return;
    trainMutation.mutate(trainingContent);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleTrain();
    }
  };

  const handleEdit = (item: TrainingData) => {
    setEditingKnowledge(item.id);
    setEditingContent(item.content);
  };

  const handleUpdate = () => {
    if (!editingContent.trim() || !editingKnowledge) return;
    updateMutation.mutate({ id: editingKnowledge, content: editingContent });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this training data?")) {
      deleteMutation.mutate(id);
    }
  };

  const trainingData = trainingDataQuery.data?.data || [];

  return (
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
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Save className="w-5 h-5" />
            )}
            {trainMutation.isPending ? "Training..." : "Train AI"}
          </button>
        </div>
      </div>

      {/* Training Data List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Training Data ({trainingData.length})
        </h2>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {trainingData.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No training data yet. Add your first knowledge!</p>
          ) : (
            trainingData.map((item: TrainingData) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                {editingKnowledge === item.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdate}
                        disabled={updateMutation.isPending}
                        className="flex-1 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {updateMutation.isPending ? "Updating..." : "Update"}
                      </button>
                      <button
                        onClick={() => {
                          setEditingKnowledge(null);
                          setEditingContent("");
                        }}
                        className="flex-1 bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start gap-3">
                      <p className="text-sm text-gray-700 flex-1 leading-relaxed">
                        {item.content}
                      </p>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}