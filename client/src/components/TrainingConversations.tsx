import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Clock, Filter, ArrowUpDown, Eye, EyeOff, X, User, Bot } from "lucide-react";
import { format, differenceInMinutes, startOfDay, isToday, isYesterday } from "date-fns";

interface Conversation {
  id: number;
  question: string;
  answer: string;
  timestamp: string;
  sessionId?: string;
}

interface ConversationsResponse {
  success: boolean;
  conversations: Conversation[];
}

interface ConversationGroup {
  sessionLabel: string;
  sessionId: string | null;
  conversations: Conversation[];
  startTime: Date;
}

export default function TrainingConversations() {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [hideShowcases, setHideShowcases] = useState(true);
  const [selectedSession, setSelectedSession] = useState<ConversationGroup | null>(null);

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

  // Group conversations by session
  const groupConversationsBySession = (conversations: Conversation[]): ConversationGroup[] => {
    const sorted = [...conversations].sort((a: Conversation, b: Conversation) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    const sessionGroups = new Map<string, Conversation[]>();
    
    // Group by sessionId first
    for (const conversation of sorted) {
      const sessionId = conversation.sessionId || 'legacy';
      if (!sessionGroups.has(sessionId)) {
        sessionGroups.set(sessionId, []);
      }
      sessionGroups.get(sessionId)!.push(conversation);
    }

    // Convert to ConversationGroup array
    const groups: ConversationGroup[] = [];
    
    for (const [sessionId, conversations] of Array.from(sessionGroups.entries())) {
      if (conversations.length === 0) continue;
      
      // Sort conversations within session by timestamp
      conversations.sort((a: Conversation, b: Conversation) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return dateA - dateB; // Always chronological within session
      });
      
      const firstConversation = conversations[0];
      const convDate = new Date(firstConversation.timestamp);
      
      let sessionLabel = "";
      if (sessionId === 'legacy') {
        sessionLabel = "Legacy Conversations";
      } else if (isToday(convDate)) {
        sessionLabel = `Today - ${format(convDate, "HH:mm")}`;
      } else if (isYesterday(convDate)) {
        sessionLabel = `Yesterday - ${format(convDate, "HH:mm")}`;
      } else {
        sessionLabel = format(convDate, "MMM d, yyyy - HH:mm");
      }

      groups.push({
        sessionLabel,
        sessionId: sessionId === 'legacy' ? null : sessionId,
        conversations,
        startTime: convDate
      });
    }

    // Sort groups by start time
    return groups.sort((a, b) => {
      return sortOrder === "desc" 
        ? b.startTime.getTime() - a.startTime.getTime()
        : a.startTime.getTime() - b.startTime.getTime();
    });
  };

  const conversationGroups = groupConversationsBySession(filteredConversations);

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
              {filteredConversations.length} conversations in {conversationGroups.length} groups
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <button
            onClick={() => setHideShowcases(!hideShowcases)}
            className={`flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              hideShowcases
                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {hideShowcases ? <Eye className="w-3 h-3 sm:w-4 sm:h-4" /> : <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />}
            <span className="hidden sm:inline">{hideShowcases ? "Show All" : "Hide Showcases"}</span>
            <span className="sm:hidden">{hideShowcases ? "All" : "Filter"}</span>
          </button>
          
          <button
            onClick={toggleSortOrder}
            className="flex items-center gap-2 px-2 sm:px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs sm:text-sm font-medium text-gray-600 transition-colors"
          >
            <ArrowUpDown className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{sortOrder === "desc" ? "Oldest First" : "Newest First"}</span>
            <span className="sm:hidden">{sortOrder === "desc" ? "Old" : "New"}</span>
          </button>
        </div>
      </div>

      {conversationGroups.length === 0 ? (
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
        <div className="space-y-4 max-h-[500px] sm:max-h-[600px] overflow-y-auto">
          {conversationGroups.map((group: ConversationGroup, groupIndex: number) => (
            <div
              key={groupIndex}
              onClick={() => setSelectedSession(group)}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer hover:border-blue-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{group.sessionLabel}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{group.conversations.length} messages</span>
                      <span>•</span>
                      <span>{format(group.startTime, "MMM d, yyyy")}</span>
                    </div>
                  </div>
                </div>
                <div className="text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              
              {/* Preview of first question */}
              <div className="mt-3 text-sm text-gray-600 line-clamp-1">
                {group.conversations[0]?.question}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{selectedSession.sessionLabel}</h3>
                <p className="text-sm text-gray-500">
                  {selectedSession.conversations.length} messages • {format(selectedSession.startTime, "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedSession.conversations.map((conversation: Conversation, index: number) => (
                <div key={conversation.id} className="space-y-3">
                  {/* User Message */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-gray-800">{conversation.question}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(conversation.timestamp), "h:mm a")}
                      </p>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Bot className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-800 whitespace-pre-wrap">{conversation.answer}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}