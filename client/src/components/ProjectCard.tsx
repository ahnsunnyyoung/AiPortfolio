import { ExternalLink } from "lucide-react";

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
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300 w-full">
      {/* Project Image */}
      <div className="h-24 sm:h-32 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-3 sm:p-4">
        <div className="text-lg sm:text-2xl font-bold text-gray-400">
          {project.title.split(' ').map(word => word[0]).join('').slice(0, 3)}
        </div>
      </div>
      
      {/* Project Content */}
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 leading-tight pr-2">
            {project.title}
          </h3>
          {project.moreLink && (
            <a
              href={project.moreLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 transition-colors flex-shrink-0"
              title="View project"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
        
        <div className="text-xs sm:text-sm text-gray-500 mb-2">
          {project.period} • {project.subtitle}
        </div>
        
        <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4 leading-relaxed">
          {project.summary}
        </p>
        
        {/* Project Details */}
        <div className="space-y-2 sm:space-y-3">
          <div>
            <h4 className="text-xs font-medium text-gray-600 mb-1">Key Features:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              {project.contents.map((content, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  <span className="text-xs leading-relaxed">{content}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-xs font-medium text-gray-600 mb-1">Technologies:</h4>
            <div className="flex flex-wrap gap-1">
              {project.tech.split(' / ').map((tech, index) => (
                <span
                  key={index}
                  className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}