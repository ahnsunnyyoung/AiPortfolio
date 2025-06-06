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
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 w-full max-w-3xl">
      {/* Project Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-gray-800">{project.title}</h3>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                {project.period}
              </span>
            </div>
            <p className="text-blue-600 font-medium text-sm mb-1">{project.subtitle}</p>
          </div>
          {project.moreLink && (
            <a
              href={project.moreLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors flex items-center gap-1"
            >
              GitHub
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Project Image */}
      {project.img && (
        <div className="px-4 mb-3">
          <div className="rounded-lg overflow-hidden border border-gray-200">
            <img
              src={project.img}
              alt={project.imgAlt}
              className="w-full h-40 object-cover"
            />
          </div>
        </div>
      )}

      {/* Project Content */}
      <div className="px-4 pb-4">
        {/* Project Overview */}
        <div className="mb-3">
          <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
            <span className="text-blue-500">📋</span>
            Overview
          </h4>
          <p className="text-gray-700 text-sm leading-relaxed">{project.summary}</p>
        </div>

        {/* Technology Stack */}
        <div className="mb-3">
          <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
            <span className="text-purple-500">🛠️</span>
            Tech Stack
          </h4>
          <div className="flex flex-wrap gap-1">
            {project.tech.split('/').map((tech, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs rounded-full font-medium"
              >
                {tech.trim()}
              </span>
            ))}
          </div>
        </div>

        {/* Key Features */}
        {project.contents && project.contents.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <span className="text-green-500">⭐</span>
              Key Features
            </h4>
            <div className="space-y-1">
              {project.contents.slice(0, 3).map((content, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 font-bold text-xs">{index + 1}</span>
                  </div>
                  <p className="text-gray-700 text-xs leading-relaxed">{content}</p>
                </div>
              ))}
              {project.contents.length > 3 && (
                <p className="text-gray-500 text-xs italic">...and {project.contents.length - 3} more features</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}