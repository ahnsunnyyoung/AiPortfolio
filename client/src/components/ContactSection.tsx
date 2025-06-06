import { Mail, Linkedin, Github, Calendar } from "lucide-react";

export default function ContactSection() {
  return (
    <section id="contact" className="py-20 px-6 glass-effect section-fade-in">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          Let's Work Together
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-orange-500 mx-auto mb-8"></div>
        
        <p className="text-xl text-gray-700 mb-12 max-w-2xl mx-auto leading-relaxed">
          I'm always open to discussing new opportunities, interesting projects, or just having a chat about web development and design.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <a
            href="mailto:sunyoung@example.com"
            className="flex items-center gap-3 glass-effect hover:bg-white/40 px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-gray-800 font-medium"
          >
            <Mail className="w-5 h-5" />
            <span>Send Email</span>
          </a>
          
          <div className="flex gap-4">
            <a
              href="https://linkedin.com"
              className="w-12 h-12 glass-effect hover:bg-white/40 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
              aria-label="LinkedIn Profile"
            >
              <Linkedin className="w-5 h-5 text-blue-600" />
            </a>
            <a
              href="https://github.com"
              className="w-12 h-12 glass-effect hover:bg-white/40 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
              aria-label="GitHub Profile"
            >
              <Github className="w-5 h-5 text-gray-800" />
            </a>
          </div>
          
          <button className="flex items-center gap-3 bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <Calendar className="w-5 h-5" />
            <span>Schedule Chat</span>
          </button>
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-gray-600">
            <span className="font-medium">Timezone:</span> Available for global collaboration
          </p>
        </div>
      </div>
    </section>
  );
}
