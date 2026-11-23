// Single source of truth for personal info, links, CV, and navigation.
// Used across Hero, Navbar, Contact, Footer, CommandPalette, Terminal, and Layout JSON-LD.

export const PROFILE = {
  name: "César Adrián Morado Rodríguez",
  shortName: "César Adrián Morado",
  handle: "moradoadrian",
  tiktokHandle: "devmorado",
  role: "Software Engineer",
  email: "moradoadrian@gmail.com",
  phone: "+524614210058",
  whatsappUrl: "https://wa.me/524614210058",
  cvUrl: "/Ing-Cesar-Adrian-Morado-Rodriguez-2026.pdf",
  siteUrl: "https://camr-portfolio.vercel.app",
  location: {
    es: "Guanajuato, México",
    en: "Guanajuato, Mexico",
    region: "Guanajuato",
    country: "MX",
  },
  socials: {
    github: "https://github.com/moradoadrian",
    linkedin: "https://www.linkedin.com/in/moradoadrian/",
    youtube: "https://www.youtube.com/@moradoadrian",
    tiktok: "https://www.tiktok.com/@devmorado",
  },
} as const;

export const NAV_LINKS = [
  { key: "home", name: "Inicio", href: "/#top" },
  { key: "projects", name: "Proyectos", href: "/#projects" },
  { key: "experience", name: "Experiencia", href: "/#experience" },
  { key: "about", name: "Sobre Mí", href: "/#about" },
  { key: "certifications", name: "Certificaciones", href: "/#certifications" },
  { key: "contact", name: "Contacto", href: "/#contact" },
] as const;
