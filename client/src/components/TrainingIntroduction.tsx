import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { User, Save } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Introduction {
  id: number;
  content: string;
  img?: string;
  isActive: boolean;
  timestamp: string;
}

export default function TrainingIntroduction() {
  const [introductionContent, setIntroductionContent] = useState("");
  const [introductionImage, setIntroductionImage] = useState("");
  const { toast } = useToast();

  const introductionQuery = useQuery({
    queryKey: ['/api/introduction'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/introduction");
      return response.json();
    }
  });

  // Set introduction content when data is loaded
  useEffect(() => {
    if (introductionQuery.data?.introduction && introductionContent === "" && introductionImage === "") {
      setIntroductionContent(introductionQuery.data.introduction.content || "");
      setIntroductionImage(introductionQuery.data.introduction.img || "");
    }
  }, [introductionQuery.data, introductionContent, introductionImage]);

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

  return (
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
            <div className="flex-1">
              <input
                type="text"
                value={introductionImage}
                onChange={(e) => setIntroductionImage(e.target.value)}
                placeholder="Enter image URL or upload to a service like Imgur"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload your photo to an image hosting service and paste the URL here
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
  );
}