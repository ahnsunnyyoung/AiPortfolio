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
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 w-full max-w-4xl">
      {/* Project Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-2xl font-bold text-gray-800">{project.title}</h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                {project.period}
              </span>
            </div>
            <p className="text-blue-600 font-medium text-lg mb-2">{project.subtitle}</p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>개발 기간: {project.period}</span>
              <span>•</span>
              <span>프로젝트 유형: 개인 프로젝트</span>
            </div>
          </div>
          {project.moreLink && (
            <div className="flex gap-2">
              <a
                href={project.moreLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                GitHub 보기
                <ExternalLink className="w-4 h-4" />
              </a>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                Live Demo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Project Image */}
      {project.img && (
        <div className="px-6 mb-6">
          <div className="rounded-xl overflow-hidden border border-gray-200 shadow-md">
            <img
              src={project.img}
              alt={project.imgAlt}
              className="w-full h-64 object-cover"
            />
          </div>
        </div>
      )}

      {/* Project Content */}
      <div className="px-6 pb-6">
        {/* Project Overview */}
        <div className="mb-6">
          <h4 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">📋</span>
            </div>
            프로젝트 개요
          </h4>
          <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
            <p className="text-gray-700 leading-relaxed">{project.summary}</p>
          </div>
        </div>

        {/* Key Features & Achievements */}
        {project.contents && project.contents.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">⭐</span>
              </div>
              주요 기능 및 성과
            </h4>
            <div className="bg-white/70 rounded-lg p-4 border border-green-100">
              <div className="grid gap-3">
                {project.contents.map((content, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-600 font-bold text-xs">{index + 1}</span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Technology Stack */}
        <div className="mb-6">
          <h4 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🛠️</span>
            </div>
            기술 스택
          </h4>
          <div className="bg-white/70 rounded-lg p-4 border border-purple-100">
            <div className="flex flex-wrap gap-2">
              {project.tech.split('/').map((tech, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm rounded-full font-medium shadow-sm hover:shadow-md transition-shadow"
                >
                  {tech.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Project Highlights */}
        <div className="mb-4">
          <h4 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">💡</span>
            </div>
            프로젝트 하이라이트
          </h4>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-white/70 rounded-lg p-3 border border-orange-100">
              <h5 className="font-semibold text-gray-800 mb-2">개발 목표</h5>
              <p className="text-gray-600 text-sm">사용자 친화적인 인터페이스와 효율적인 데이터 처리를 통한 최적의 사용자 경험 제공</p>
            </div>
            <div className="bg-white/70 rounded-lg p-3 border border-orange-100">
              <h5 className="font-semibold text-gray-800 mb-2">해결한 문제</h5>
              <p className="text-gray-600 text-sm">복잡한 데이터 관리와 사용자 인터랙션의 효율성 향상</p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200">
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-blue-600 mb-1">100%</div>
              <div className="text-xs text-gray-600">반응형 디자인</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-600 mb-1">Fast</div>
              <div className="text-xs text-gray-600">로딩 속도</div>
            </div>
            <div>
              <div className="text-xl font-bold text-purple-600 mb-1">Modern</div>
              <div className="text-xs text-gray-600">기술 스택</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}