import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Save, Mail, Phone, Globe, Github, Linkedin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Contact {
  id: number;
  email: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  address?: string;
  timestamp: string;
}

export default function TrainingContact() {
  const [contactData, setContactData] = useState({
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    website: "",
    address: ""
  });
  const { toast } = useToast();

  const contactQuery = useQuery({
    queryKey: ['/api/contact'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/contact");
      return response.json();
    }
  });

  // Set contact data when loaded
  useEffect(() => {
    if (contactQuery.data?.contact && contactData.email === "") {
      const contact = contactQuery.data.contact;
      setContactData({
        email: contact.email || "",
        phone: contact.phone || "",
        linkedin: contact.linkedin || "",
        github: contact.github || "",
        website: contact.website || "",
        address: contact.address || ""
      });
    }
  }, [contactQuery.data, contactData.email]);

  const updateMutation = useMutation({
    mutationFn: async (contact: any) => {
      const response = await apiRequest("PUT", "/api/contact", contact);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Contact Updated",
        description: "Contact information has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contact'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update contact information",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    if (!contactData.email.trim()) {
      toast({
        title: "Email Required",
        description: "Email address is required",
        variant: "destructive"
      });
      return;
    }
    updateMutation.mutate(contactData);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Contact Information
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                value={contactData.email}
                onChange={(e) => setContactData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your.email@example.com"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="tel"
                value={contactData.phone}
                onChange={(e) => setContactData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn Profile
            </label>
            <div className="relative">
              <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="url"
                value={contactData.linkedin}
                onChange={(e) => setContactData(prev => ({ ...prev, linkedin: e.target.value }))}
                placeholder="https://linkedin.com/in/yourprofile"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GitHub Profile
            </label>
            <div className="relative">
              <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="url"
                value={contactData.github}
                onChange={(e) => setContactData(prev => ({ ...prev, github: e.target.value }))}
                placeholder="https://github.com/yourusername"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Personal Website
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="url"
                value={contactData.website}
                onChange={(e) => setContactData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://yourwebsite.com"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              value={contactData.address}
              onChange={(e) => setContactData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="City, State, Country"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={updateMutation.isPending || !contactData.email.trim()}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {updateMutation.isPending ? "Saving..." : "Save Contact Information"}
          </button>
        </div>

        {contactQuery.data?.contact && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">Current Contact Information</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Email:</span> {contactQuery.data.contact.email}</p>
              {contactQuery.data.contact.phone && (
                <p><span className="font-medium">Phone:</span> {contactQuery.data.contact.phone}</p>
              )}
              {contactQuery.data.contact.linkedin && (
                <p><span className="font-medium">LinkedIn:</span> {contactQuery.data.contact.linkedin}</p>
              )}
              {contactQuery.data.contact.github && (
                <p><span className="font-medium">GitHub:</span> {contactQuery.data.contact.github}</p>
              )}
              {contactQuery.data.contact.website && (
                <p><span className="font-medium">Website:</span> {contactQuery.data.contact.website}</p>
              )}
              {contactQuery.data.contact.address && (
                <p><span className="font-medium">Address:</span> {contactQuery.data.contact.address}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}