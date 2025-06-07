import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Clock, Filter, ArrowUpDown, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";

interface Conversation {
  id: number;
  question: string;
  answer: string;
  timestamp: string;
}

interface ConversationsResponse {
  success: boolean;
  conversations: Conversation[];
}

export default function TrainingConversations() {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [hideShowcases, setHideShowcases] = useState(true);

  const conversationsQuery = useQuery<ConversationsResponse>({
    queryKey: ["/api/conversations"],
  });

  const conversations = conversationsQuery.data?.conversations || [];

  // Filter out showcase responses if hideShowcases is enabled
  const filteredConversations = conversations.filter((conv: Conversation) => {
    if (!hideShowcases) return true;
    
    const showcaseKeywords = [
      "PROJECT_SHOWCASE",
      "SKILLS_SHOWCASE", 
      "EXPERIENCE_SHOWCASE",
      "CONTACT_SHOWCASE",
      "INTRODUCTION_SHOWCASE",
      "Here are my projects:",
      "Here's how you can contact me:",
      "다음은 저의 기술적 역량",
      "Here are my work experiences:",
      "저의 업무 경험을 소개해드리겠습니다"
    ];
    
    return !showcaseKeywords.some(keyword => 
      conv.answer.includes(keyword)
    );
  });

  // Sort conversations by timestamp
  const sortedConversations = [...filteredConversations].sort((a: Conversation, b: Conversation) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "desc" ? "asc" : "desc");
  };

  if (conversationsQuery.isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Conversation History</h3>
            <p className="text-sm text-gray-600">
              {sortedConversations.length} conversations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setHideShowcases(!hideShowcases)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              hideShowcases
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {hideShowcases ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {hideShowcases ? "Hiding Showcases" : "Show All"}
          </button>
          
          <button
            onClick={toggleSortOrder}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-600 transition-colors"
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortOrder === "desc" ? "Newest First" : "Oldest First"}
          </button>
        </div>
      </div>

      {sortedConversations.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-500 mb-2">No Conversations Yet</h4>
          <p className="text-gray-400">
            {hideShowcases 
              ? "No non-showcase conversations found. Try showing all conversations."
              : "Start chatting with your AI to see conversations here."
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
          {sortedConversations.map((conversation: Conversation) => (
            <div
              key={conversation.id}
              className="bg-white rounded-lg border border-gray-100 p-3 hover:shadow-sm transition-shadow"
            >
              <div className="mb-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {format(new Date(conversation.timestamp), "MMM d 'at' h:mm a")}
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <div className="text-xs font-medium text-blue-600 mb-1">QUESTION</div>
                  <p className="text-xs text-gray-800 bg-blue-50 rounded p-2 border border-blue-100 line-clamp-2">
                    {conversation.question}
                  </p>
                </div>
                
                <div>
                  <div className="text-xs font-medium text-green-600 mb-1">ANSWER</div>
                  <p className="text-xs text-gray-700 bg-green-50 rounded p-2 border border-green-100 max-h-20 overflow-y-auto line-clamp-3">
                    {conversation.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}