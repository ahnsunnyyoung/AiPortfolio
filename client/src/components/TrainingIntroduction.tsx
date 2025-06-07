import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { User, Save } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Introduction {
  id: number;
  content: string;
  img?: string;
  name?: string;
  title?: string;
  location?: string;
  experience?: string;
  technologies?: string;
  isActive: boolean;
  timestamp: string;
}

export default function TrainingIntroduction() {
  const [introductionContent, setIntroductionContent] = useState("");
  const [introductionImage, setIntroductionImage] = useState("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [technologies, setTechnologies] = useState("");
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
    if (introductionQuery.data?.introduction) {
      const intro = introductionQuery.data.introduction;
      if (introductionContent === "") setIntroductionContent(intro.content || "");
      if (introductionImage === "") setIntroductionImage(intro.img || "");
      if (name === "") setName(intro.name || "");
      if (title === "") setTitle(intro.title || "");
      if (location === "") setLocation(intro.location || "");
      if (experience === "") setExperience(intro.experience || "");
      if (technologies === "") setTechnologies(intro.technologies || "");
    }
  }, [introductionQuery.data, introductionContent, introductionImage, name, title, location, experience, technologies]);

  const updateIntroductionMutation = useMutation({
    mutationFn: async (data: { content: string, img?: string, name?: string, title?: string, location?: string, experience?: string, technologies?: string }) => {
      const response = await apiRequest("PUT", "/api/introduction", data);
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setIntroductionImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

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
      img: introductionImage,
      name,
      title,
      location,
      experience,
      technologies
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
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={introductionImage}
                  onChange={(e) => setIntroductionImage(e.target.value)}
                  placeholder="Or enter image URL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sunyoung Ahn (Sunny)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Frontend Developer"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Dublin, Ireland"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience
            </label>
            <input
              type="text"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="e.g., 5+ years"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Technologies
          </label>
          <input
            type="text"
            value={technologies}
            onChange={(e) => setTechnologies(e.target.value)}
            placeholder="e.g., React, Flutter, Firebase, Google Cloud"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
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
            <h3 className="text-sm font-medium text-gray-700 mb-3">Chat Preview:</h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              {/* Personal Card Preview */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
                <div className="flex items-start gap-4">
                  {introductionQuery.data.introduction.img && (
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex-shrink-0 overflow-hidden">
                      <img
                        src={introductionQuery.data.introduction.img}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                      {introductionQuery.data.introduction.name || "Your Name"}
                    </h3>
                    <p className="text-blue-600 font-medium text-sm mt-1">
                      {introductionQuery.data.introduction.title || "Your Title"}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-600">
                      {introductionQuery.data.introduction.location && (
                        <span className="flex items-center gap-1">
                          📍 {introductionQuery.data.introduction.location}
                        </span>
                      )}
                      {introductionQuery.data.introduction.experience && (
                        <span className="flex items-center gap-1">
                          💼 {introductionQuery.data.introduction.experience}
                        </span>
                      )}
                    </div>
                    {introductionQuery.data.introduction.technologies && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {introductionQuery.data.introduction.technologies.split(',').map((tech, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                              {tech.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Introduction Text */}
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