import { User } from "lucide-react";

export default function AboutSection() {
  return (
    <section id="about" className="py-20 px-6 section-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            About Me
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto"></div>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              I'm a passionate frontend developer who loves creating beautiful, intuitive user experiences. 
              With a keen eye for design and a deep understanding of modern web technologies, I bridge 
              the gap between design and functionality.
            </p>
            <p className="text-gray-600 leading-relaxed">
              My journey in web development started with curiosity and has evolved into a career dedicated 
              to crafting pixel-perfect interfaces that not only look great but also provide exceptional 
              user experiences across all devices.
            </p>
            
            <div className="grid grid-cols-2 gap-6 pt-6">
              <div className="text-center glass-effect rounded-lg p-4">
                <div className="text-3xl font-bold text-gray-800">3+</div>
                <div className="text-sm text-gray-600">Years Experience</div>
              </div>
              <div className="text-center glass-effect rounded-lg p-4">
                <div className="text-3xl font-bold text-gray-800">50+</div>
                <div className="text-sm text-gray-600">Projects Completed</div>
              </div>
            </div>
            
            <div className="flex space-x-4 pt-4">
              <a
                href="https://github.com"
                className="text-gray-600 hover:text-gray-800 text-2xl transition-colors duration-200"
                aria-label="GitHub Profile"
              >
                <i className="fab fa-github"></i>
              </a>
              <a
                href="https://linkedin.com"
                className="text-gray-600 hover:text-gray-800 text-2xl transition-colors duration-200"
                aria-label="LinkedIn Profile"
              >
                <i className="fab fa-linkedin"></i>
              </a>
              <a
                href="mailto:sunyoung@example.com"
                className="text-gray-600 hover:text-gray-800 text-2xl transition-colors duration-200"
                aria-label="Email Contact"
              >
                <i className="fas fa-envelope"></i>
              </a>
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="w-80 h-80 glass-effect rounded-full shadow-xl flex items-center justify-center">
              <User className="w-24 h-24 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
