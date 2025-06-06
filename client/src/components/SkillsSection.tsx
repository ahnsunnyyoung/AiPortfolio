import { Code, Palette, Settings } from "lucide-react";

export default function SkillsSection() {
  const skillCategories = [
    {
      icon: Code,
      title: "Frontend Development",
      color: "blue",
      skills: [
        { name: "React.js", level: 90 },
        { name: "JavaScript/TypeScript", level: 95 },
        { name: "Next.js", level: 85 },
        { name: "HTML/CSS", level: 95 },
      ]
    },
    {
      icon: Palette,
      title: "Styling & Design",
      color: "purple",
      skills: [
        { name: "Tailwind CSS", level: 95 },
        { name: "Sass/SCSS", level: 85 },
        { name: "Figma", level: 80 },
        { name: "Responsive Design", level: 90 },
      ]
    },
    {
      icon: Settings,
      title: "Tools & Others",
      color: "green",
      skills: [
        { name: "Git/GitHub", level: 85 },
        { name: "Webpack", level: 75 },
        { name: "Node.js", level: 70 },
        { name: "AI Integration", level: 80 },
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: "bg-blue-100",
        text: "text-blue-600",
        progress: "bg-blue-500"
      },
      purple: {
        bg: "bg-purple-100", 
        text: "text-purple-600",
        progress: "bg-purple-500"
      },
      green: {
        bg: "bg-green-100",
        text: "text-green-600", 
        progress: "bg-green-500"
      }
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <section id="skills" className="py-20 px-6 glass-effect section-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Skills & Technologies
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto"></div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skillCategories.map((category, index) => {
            const IconComponent = category.icon;
            const colorClasses = getColorClasses(category.color);
            
            return (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-xl transition-shadow hover-lift"
              >
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 ${colorClasses.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className={`w-8 h-8 ${colorClasses.text}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {category.title}
                  </h3>
                </div>
                
                <div className="space-y-4">
                  {category.skills.map((skill, skillIndex) => (
                    <div key={skillIndex} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm font-medium">
                          {skill.name}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {skill.level}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colorClasses.progress} rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: `${skill.level}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
