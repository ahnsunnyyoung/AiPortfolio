export interface Translations {
  // Main UI
  askMe: string;
  typeMessage: string;
  sendMessage: string;
  thinking: string;
  askAbout: string;
  
  // Navigation
  home: string;
  about: string;
  projects: string;
  experience: string;
  contact: string;
  
  // Chat responses
  projectsTitle: string;
  experienceTitle: string;
  skillsTitle: string;
  contactTitle: string;
  
  // Personal card
  experienceYears: string;
  technologies: string;
  
  // Buttons
  askMore: string;
  learnMore: string;
  
  // Contact info
  email: string;
  linkedin: string;
  github: string;
  website: string;
}

export const translations: Record<string, Translations> = {
  en: {
    askMe: "Ask me anything",
    typeMessage: "Type your message...",
    sendMessage: "Send message",
    thinking: "Thinking...",
    askAbout: "Ask about",
    
    home: "Home",
    about: "About",
    projects: "Projects",
    experience: "Experience", 
    contact: "Contact",
    
    projectsTitle: "My Projects",
    experienceTitle: "My Experience",
    skillsTitle: "My Skills",
    contactTitle: "Contact Information",
    
    experienceYears: "experience",
    technologies: "Technologies",
    
    askMore: "Ask more",
    learnMore: "Learn more",
    
    email: "Email",
    linkedin: "LinkedIn",
    github: "GitHub",
    website: "Website"
  },
  ko: {
    askMe: "무엇이든 물어보세요",
    typeMessage: "메시지를 입력하세요...",
    sendMessage: "메시지 보내기",
    thinking: "생각 중...",
    askAbout: "질문하기",
    
    home: "홈",
    about: "소개",
    projects: "프로젝트",
    experience: "경험",
    contact: "연락처",
    
    projectsTitle: "내 프로젝트",
    experienceTitle: "내 경험",
    skillsTitle: "내 기술",
    contactTitle: "연락처 정보",
    
    experienceYears: "경험",
    technologies: "기술",
    
    askMore: "더 알아보기",
    learnMore: "자세히 보기",
    
    email: "이메일",
    linkedin: "링크드인",
    github: "깃허브",
    website: "웹사이트"
  }
};

export type Language = 'en' | 'ko' | 'ja' | 'zh' | 'es' | 'fr' | 'de';

export const languages: Record<Language, { name: string; flag: string }> = {
  en: { name: 'English', flag: '🇺🇸' },
  ko: { name: '한국어', flag: '🇰🇷' },
  ja: { name: '日本語', flag: '🇯🇵' },
  zh: { name: '中文', flag: '🇨🇳' },
  es: { name: 'Español', flag: '🇪🇸' },
  fr: { name: 'Français', flag: '🇫🇷' },
  de: { name: 'Deutsch', flag: '🇩🇪' }
};