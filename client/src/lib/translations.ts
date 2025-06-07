export interface Translations {
  // Main UI
  askMe: string;
  typeMessage: string;
  sendMessage: string;
  thinking: string;
  askAbout: string;
  frontendDeveloper: string;
  aiOnline: string;
  
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
  hide: string;
  show: string;
  
  // Contact info
  email: string;
  linkedin: string;
  github: string;
  website: string;
  letsConnect: string;
  linkedinProfile: string;
  githubProfile: string;
  
  // Skills categories
  programming: string;
  frontend: string;
  backend: string;
  tools: string;
  languages: string;
  softSkills: string;
}

export const translations: Record<string, Translations> = {
  en: {
    askMe: "Ask me anything",
    typeMessage: "Type your message...",
    sendMessage: "Send message",
    thinking: "Thinking...",
    askAbout: "Ask about",
    frontendDeveloper: "Frontend Developer",
    aiOnline: "AI Online",
    
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
    hide: "Hide",
    show: "Show",
    
    email: "Email",
    linkedin: "LinkedIn",
    github: "GitHub",
    website: "Website",
    letsConnect: "Let's connect!",
    linkedinProfile: "LinkedIn Profile",
    githubProfile: "GitHub Profile",
    
    programming: "Programming",
    frontend: "Frontend",
    backend: "Backend",
    tools: "Tools",
    languages: "Languages",
    softSkills: "Soft Skills"
  },
  ko: {
    askMe: "무엇이든 물어보세요",
    typeMessage: "메시지를 입력하세요...",
    sendMessage: "메시지 보내기",
    thinking: "생각 중...",
    askAbout: "질문하기",
    frontendDeveloper: "프론트엔드 개발자",
    aiOnline: "AI 온라인",
    
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
    hide: "숨기기",
    show: "보기",
    
    email: "이메일",
    linkedin: "링크드인",
    github: "깃허브",
    website: "웹사이트",
    letsConnect: "연결해요!",
    linkedinProfile: "링크드인 프로필",
    githubProfile: "깃허브 프로필",
    
    programming: "프로그래밍",
    frontend: "프론트엔드",
    backend: "백엔드",
    tools: "도구",
    languages: "언어",
    softSkills: "소프트 스킬"
  },
  de: {
    askMe: "Fragen Sie mich alles",
    typeMessage: "Ihre Nachricht eingeben...",
    sendMessage: "Nachricht senden",
    thinking: "Denke nach...",
    askAbout: "Fragen über",
    frontendDeveloper: "Frontend-Entwickler",
    aiOnline: "KI Online",
    
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
    hide: "Verstecken",
    show: "Zeigen",
    
    email: "E-Mail",
    linkedin: "LinkedIn",
    github: "GitHub",
    website: "Website",
    letsConnect: "Lass uns verbinden!",
    linkedinProfile: "LinkedIn-Profil",
    githubProfile: "GitHub-Profil",
    
    programming: "Programmierung",
    frontend: "Frontend",
    backend: "Backend",
    tools: "Werkzeuge",
    languages: "Sprachen",
    softSkills: "Soft Skills"
  },
  nl: {
    askMe: "Vraag me alles",
    typeMessage: "Typ je bericht...",
    sendMessage: "Bericht verzenden",
    thinking: "Aan het denken...",
    askAbout: "Vraag over",
    frontendDeveloper: "Frontend Developer",
    aiOnline: "AI Online",
    
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
    hide: "Verbergen",
    show: "Tonen",
    
    email: "E-mail",
    linkedin: "LinkedIn",
    github: "GitHub",
    website: "Website",
    letsConnect: "Laten we verbinden!",
    linkedinProfile: "LinkedIn Profiel",
    githubProfile: "GitHub Profiel",
    
    programming: "Programmeren",
    frontend: "Frontend",
    backend: "Backend",
    tools: "Tools",
    languages: "Talen",
    softSkills: "Zachte Vaardigheden"
  }
};

export type Language = 'en' | 'ko' | 'de' | 'nl';

export const languages: Record<Language, { name: string; flag: string }> = {
  en: { name: 'English', flag: '🇺🇸' },
  ko: { name: '한국어', flag: '🇰🇷' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  nl: { name: 'Nederlands', flag: '🇳🇱' }
};