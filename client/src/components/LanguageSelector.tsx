import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import type { Language } from "@/lib/translations";

export default function LanguageSelector() {
  const { language, setLanguage, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm rounded-lg border border-white/50 hover:bg-white/90 transition-all duration-200 shadow-sm"
      >
        <span className="text-xl">{availableLanguages[language].flag}</span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-2 bg-white rounded-lg border border-gray-200 shadow-lg z-20 min-w-[160px] overflow-hidden">
            {Object.entries(availableLanguages).map(([lang, config]) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang as Language)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  language === lang ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <span className="text-lg">{config.flag}</span>
                <span className="text-sm font-medium">{config.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}