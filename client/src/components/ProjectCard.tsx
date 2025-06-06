import { ExternalLink, Calendar } from "lucide-react";

interface Project {
  id: number;
  title: string;
  period: string;
  subtitle: string;
  summary: string;
  contents: string[];
  tech: string;
  img: string;
  imgAlt: string;
  moreLink?: string;
  width: string;
}

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const getInitials = (title: string) => {
    return title
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-300 max-w-sm">
      {/* Header with project logo/initials */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
          {project.img ? (
            <img 
              src={project.img} 
              alt={project.imgAlt || `${project.title} logo`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold text-gray-600">
              {getInitials(project.title)}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
            {project.title}
          </h3>
          {project.subtitle && (
            <p className="text-sm text-blue-600 font-medium mb-1">
              {project.subtitle}
            </p>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>{project.period}</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {project.summary}
      </p>

      {/* Technologies */}
      {project.tech && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">Technologies</p>
          <p className="text-sm text-gray-700 font-medium">
            {project.tech}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-400">Project</span>
        {project.moreLink && (
          <a
            href={project.moreLink}
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