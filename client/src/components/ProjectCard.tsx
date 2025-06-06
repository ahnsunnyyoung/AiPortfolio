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
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Project Image */}
      <div className="h-32 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-2xl font-bold text-gray-400">
          {project.title.split(' ').map(word => word[0]).join('').slice(0, 3)}
        </div>
      </div>
      
      {/* Project Content */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-800 leading-tight">
            {project.title}
          </h3>
          {project.moreLink && (
            <a
              href={project.moreLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 transition-colors flex-shrink-0 ml-2"
              title="View project"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
        
        <div className="text-sm text-gray-500 mb-2">
          {project.period} • {project.subtitle}
        </div>
        
        <p className="text-sm text-gray-700 mb-4 leading-relaxed">
          {project.summary}
        </p>
        
        {/* Project Details */}
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-medium text-gray-600 mb-1">Key Features:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              {project.contents.map((content, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  {content}
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
                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200"
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