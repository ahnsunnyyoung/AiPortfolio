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
  },
  de: {
    askMe: "Fragen Sie mich alles",
    typeMessage: "Ihre Nachricht eingeben...",
    sendMessage: "Nachricht senden",
    thinking: "Denke nach...",
    askAbout: "Fragen über",
    
    home: "Startseite",
    about: "Über mich",
    projects: "Projekte",
    experience: "Erfahrung",
    contact: "Kontakt",
    
    projectsTitle: "Meine Projekte",
    experienceTitle: "Meine Erfahrung",
    skillsTitle: "Meine Fähigkeiten",
    contactTitle: "Kontaktinformationen",
    
    experienceYears: "Erfahrung",
    technologies: "Technologien",
    
    askMore: "Mehr erfahren",
    learnMore: "Mehr lernen",
    
    email: "E-Mail",
    linkedin: "LinkedIn",
    github: "GitHub",
    website: "Website"
  },
  nl: {
    askMe: "Vraag me alles",
    typeMessage: "Typ je bericht...",
    sendMessage: "Bericht verzenden",
    thinking: "Aan het denken...",
    askAbout: "Vraag over",
    
    home: "Home",
    about: "Over mij",
    projects: "Projecten",
    experience: "Ervaring",
    contact: "Contact",
    
    projectsTitle: "Mijn Projecten",
    experienceTitle: "Mijn Ervaring",
    skillsTitle: "Mijn Vaardigheden",
    contactTitle: "Contactinformatie",
    
    experienceYears: "ervaring",
    technologies: "Technologieën",
    
    askMore: "Meer weten",
    learnMore: "Meer leren",
    
    email: "E-mail",
    linkedin: "LinkedIn",
    github: "GitHub",
    website: "Website"
  }
};

export type Language = 'en' | 'ko' | 'de' | 'nl';

export const languages: Record<Language, { name: string; flag: string }> = {
  en: { name: 'English', flag: '🇺🇸' },
  ko: { name: '한국어', flag: '🇰🇷' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  nl: { name: 'Nederlands', flag: '🇳🇱' }
};