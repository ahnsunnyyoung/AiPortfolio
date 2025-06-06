import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set page title and meta description for SEO
document.title = "Sunyoung Ahn - Frontend Developer | Portfolio";
const metaDescription = document.querySelector('meta[name="description"]') || document.createElement('meta');
metaDescription.setAttribute('name', 'description');
metaDescription.setAttribute('content', 'Sunyoung Ahn is a passionate Frontend Developer specializing in React, TypeScript, and modern web technologies. Explore her portfolio of beautiful, user-centered web applications.');
if (!document.querySelector('meta[name="description"]')) {
  document.head.appendChild(metaDescription);
}

createRoot(document.getElementById("root")!).render(<App />);
