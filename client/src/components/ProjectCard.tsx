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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 w-full max-w-3xl">
      {/* Project Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start gap-4">
          {/* Project Logo/Image */}
          {project.img ? (
            <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
              <img
                src={project.img}
                alt={project.imgAlt}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-gray-500 font-bold text-sm">
                {project.title.split(' ').map(word => word[0]).join('').slice(0, 2)}
              </span>
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                {project.period}
              </span>
            </div>
            <p className="text-gray-600 text-sm">{project.subtitle}</p>
          </div>
          
          {project.moreLink && (
            <a
              href={project.moreLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-gray-900 text-white text-xs rounded hover:bg-gray-800 transition-colors flex items-center gap-1"
            >
              GitHub
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Project Content */}
      <div className="p-4">
        {/* Project Overview */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Overview</h4>
          <p className="text-gray-700 text-sm leading-relaxed">{project.summary}</p>
        </div>

        {/* Technology Stack */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Technology Stack</h4>
          <div className="flex flex-wrap gap-2">
            {project.tech.split('/').map((tech, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded border"
              >
                {tech.trim()}
              </span>
            ))}
          </div>
        </div>

        {/* Key Features */}
        {project.contents && project.contents.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Key Features</h4>
            <div className="space-y-2">
              {project.contents.slice(0, 3).map((content, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-gray-600 font-medium text-xs">{index + 1}</span>
                  </span>
                  <p className="text-gray-700 text-xs leading-relaxed">{content}</p>
                </div>
              ))}
              {project.contents.length > 3 && (
                <p className="text-gray-500 text-xs">...and {project.contents.length - 3} more features</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}