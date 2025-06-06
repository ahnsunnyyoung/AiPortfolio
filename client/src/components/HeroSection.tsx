import { MessageCircle, ArrowDown } from "lucide-react";

interface HeroSectionProps {
  onOpenChat?: () => void;
}

export default function HeroSection({ onOpenChat }: HeroSectionProps) {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="text-center max-w-4xl mx-auto">
        <div className="animate-in fade-in-50 duration-1000">
          <p className="text-lg md:text-xl text-gray-600 mb-4 font-medium">
            Frontend Developer
          </p>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-gray-800 mb-6 leading-tight text-shadow">
            Sunyoung Ahn
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 italic mb-12">
            "Shine brightly like the sunshine"
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onOpenChat}
              className="group flex items-center gap-3 glass-effect hover:bg-white/40 px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-gray-800">Ask me anything with AI</span>
              <MessageCircle className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
            </button>
            
            <a
              href="#about"
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              <span>Explore Portfolio</span>
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </a>
          </div>
        </div>
        
        {/* Latest Update Badge */}
        <div className="mt-16">
          <span className="glass-effect px-4 py-2 rounded-full text-sm text-gray-600">
            Latest update 28/May/2025
          </span>
        </div>
      </div>
    </section>
  );
}
