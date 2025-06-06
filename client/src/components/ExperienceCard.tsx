import { ExternalLink, MapPin, Calendar } from "lucide-react";

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
  detailedContent?: string;
}

interface ExperienceCardProps {
  experience: Experience;
}

export default function ExperienceCard({ experience }: ExperienceCardProps) {
  const getInitials = (company: string) => {
    return company
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-300 max-w-sm">
      {/* Header with company logo/initials */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold text-gray-600">
            {getInitials(experience.company)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
            {experience.position}
          </h3>
          <p className="text-sm text-blue-600 font-medium mb-1">
            {experience.company}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>{experience.period}</span>
          </div>
          {experience.location && (
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <MapPin className="w-3 h-3" />
              <span>{experience.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {experience.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {experience.description}
        </p>
      )}

      {/* Skills */}
      {experience.skills && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">Technologies</p>
          <p className="text-sm text-gray-700 font-medium">
            {experience.skills}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-400">Experience</span>
        {experience.website && (
          <a
            href={experience.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}