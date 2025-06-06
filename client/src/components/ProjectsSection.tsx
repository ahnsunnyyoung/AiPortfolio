import { ExternalLink, Github, BarChart, ShoppingCart, CheckSquare } from "lucide-react";

export default function ProjectsSection() {
  const projects = [
    {
      title: "Analytics Dashboard",
      description: "A comprehensive analytics dashboard built with React and D3.js, featuring real-time data visualization and interactive charts for business insights.",
      icon: BarChart,
      gradient: "from-blue-500 to-purple-600",
      tags: ["React", "D3.js", "TypeScript", "Real-time"],
      demoUrl: "#",
      codeUrl: "#"
    },
    {
      title: "E-commerce Platform", 
      description: "Modern e-commerce solution with AI-powered recommendations, built with Next.js and Stripe integration for seamless shopping experiences.",
      icon: ShoppingCart,
      gradient: "from-green-500 to-blue-500",
      tags: ["Next.js", "Stripe", "AI", "E-commerce"],
      demoUrl: "#",
      codeUrl: "#"
    },
    {
      title: "Task Management App",
      description: "Collaborative productivity application with drag-and-drop functionality, team collaboration features, and intuitive project management tools.",
      icon: CheckSquare,
      gradient: "from-purple-500 to-pink-500",
      tags: ["React", "Redux", "Node.js", "Collaboration"],
      demoUrl: "#",
      codeUrl: "#"
    }
  ];

  return (
    <section id="projects" className="py-20 px-6 section-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Featured Projects
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto"></div>
        </div>
        
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {projects.map((project, index) => {
            const IconComponent = project.icon;
            
            return (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 group hover-lift"
              >
                {/* Project Preview */}
                <div className={`h-48 bg-gradient-to-br ${project.gradient} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <IconComponent className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex gap-3">
                    <a
                      href={project.demoUrl}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Live Demo
                    </a>
                    <a
                      href={project.codeUrl}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
                    >
                      <Github className="w-4 h-4" />
                      Code
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
