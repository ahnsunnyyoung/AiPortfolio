import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Save, Edit3, Trash2, GripVertical, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

interface PromptExample {
  id: number;
  question: string;
  responseType: string;
  isActive: boolean;
  displayOrder: number;
  timestamp: string;
}

export default function TrainingPrompts() {
  const [showModal, setShowModal] = useState(false);
  const [newPrompt, setNewPrompt] = useState({
    question: "",
    responseType: "ai",
    isActive: true,
    displayOrder: 0
  });
  const [editingPrompt, setEditingPrompt] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<any>({});
  const [prompts, setPrompts] = useState<PromptExample[]>([]);
  const { toast } = useToast();

  const promptsQuery = useQuery({
    queryKey: ['/api/prompt-examples'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/prompt-examples");
      return response.json();
    }
  });

  useEffect(() => {
    if (promptsQuery.data?.examples) {
      setPrompts(promptsQuery.data.examples.sort((a: PromptExample, b: PromptExample) => a.displayOrder - b.displayOrder));
    }
  }, [promptsQuery.data]);

  const addMutation = useMutation({
    mutationFn: async (prompt: any) => {
      const response = await apiRequest("POST", "/api/prompt-examples", prompt);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Prompt Added",
        description: "New prompt example has been added successfully",
      });
      setNewPrompt({
        question: "",
        responseType: "ai",
        isActive: true,
        displayOrder: 0
      });
      queryClient.invalidateQueries({ queryKey: ['/api/prompt-examples'] });
    },
    onError: (error: any) => {
      toast({
        title: "Add Failed",
        description: error.message || "Failed to add prompt example",
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, prompt }: { id: number, prompt: any }) => {
      const response = await apiRequest("PUT", `/api/prompt-examples/${id}`, prompt);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Prompt Updated",
        description: "Prompt example has been updated successfully",
      });
      setEditingPrompt(null);
      setEditingData({});
      queryClient.invalidateQueries({ queryKey: ['/api/prompt-examples'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update prompt example",
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/prompt-examples/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Prompt Deleted",
        description: "Prompt example has been removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/prompt-examples'] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete prompt example",
        variant: "destructive"
      });
    }
  });

  const handleAddPrompt = () => {
    if (!newPrompt.question.trim()) return;
    const promptData = {
      ...newPrompt,
      displayOrder: prompts.length
    };
    addMutation.mutate(promptData);
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setNewPrompt({
      question: "",
      responseType: "ai",
      isActive: true,
      displayOrder: 0
    });
  };

  const handleEdit = (prompt: PromptExample) => {
    setEditingPrompt(prompt.id);
    setEditingData({ ...prompt });
  };

  const handleUpdate = () => {
    if (!editingData.question?.trim()) return;
    updateMutation.mutate({ id: editingPrompt!, prompt: editingData });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this prompt example?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(prompts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update display order
    const updatedItems = items.map((item, index) => ({
      ...item,
      displayOrder: index
    }));

    setPrompts(updatedItems);

    // Update each item's display order in the backend
    updatedItems.forEach((item, index) => {
      if (item.displayOrder !== index) {
        updateMutation.mutate({ 
          id: item.id, 
          prompt: { ...item, displayOrder: index } 
        });
      }
    });
  };

  const responseTypes = [
    { value: "ai", label: "AI Response" },
    { value: "projects", label: "Projects" },
    { value: "experiences", label: "Experiences" },
    { value: "contacts", label: "Contacts" },
    { value: "skills", label: "Skills" },
    { value: "introduce", label: "Introduction" }
  ];

  return (
    <div className="space-y-6">
      {/* Add New Prompt */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add New Quick Question
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
            <input
              type="text"
              value={newPrompt.question}
              onChange={(e) => setNewPrompt(prev => ({ ...prev, question: e.target.value }))}
              placeholder="e.g., Tell me about your projects"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Response Type</label>
            <select
              value={newPrompt.responseType}
              onChange={(e) => setNewPrompt(prev => ({ ...prev, responseType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {responseTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={newPrompt.isActive}
              onChange={(e) => setNewPrompt(prev => ({ ...prev, isActive: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Active (show in quick questions)
            </label>
          </div>

          <button
            onClick={handleAddPrompt}
            disabled={addMutation.isPending || !newPrompt.question.trim()}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {addMutation.isPending ? "Adding..." : "Add Quick Question"}
          </button>
        </div>
      </div>

      {/* Prompts List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Quick Questions ({prompts.length})
        </h2>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="prompts">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                {prompts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No quick questions yet. Add your first one!</p>
                ) : (
                  prompts.map((prompt, index) => (
                    <Draggable key={prompt.id} draggableId={prompt.id.toString()} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow ${
                            snapshot.isDragging ? 'shadow-lg' : ''
                          }`}
                        >
                          {editingPrompt === prompt.id ? (
                            <div className="space-y-4">
                              <input
                                type="text"
                                value={editingData.question || ""}
                                onChange={(e) => setEditingData((prev: any) => ({ ...prev, question: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Question"
                              />
                              <select
                                value={editingData.responseType || "ai"}
                                onChange={(e) => setEditingData((prev: any) => ({ ...prev, responseType: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                {responseTypes.map(type => (
                                  <option key={type.value} value={type.value}>
                                    {type.label}
                                  </option>
                                ))}
                              </select>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`edit-active-${prompt.id}`}
                                  checked={editingData.isActive}
                                  onChange={(e) => setEditingData((prev: any) => ({ ...prev, isActive: e.target.checked }))}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor={`edit-active-${prompt.id}`} className="text-sm font-medium text-gray-700">
                                  Active
                                </label>
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
                                    setEditingPrompt(null);
                                    setEditingData({});
                                  }}
                                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                                >
                                  <X className="w-4 h-4" />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div {...provided.dragHandleProps} className="text-gray-400 hover:text-gray-600 cursor-grab">
                                  <GripVertical className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-medium text-gray-800">{prompt.question}</h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      prompt.isActive 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      {prompt.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    Response Type: {responseTypes.find(t => t.value === prompt.responseType)?.label}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEdit(prompt)}
                                  className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(prompt.id)}
                                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}