// Knowledge base for the "Job Match" analyzer (JobMatch.astro).
// Every skill points to real evidence already shown on the site; nothing here should claim
// more than the experience, projects, certifications and studies sections do.
// Aliases are matched against a lowercase, accent-free version of the job description,
// on word boundaries, so write them without accents.

import { projects } from "./projects";

export interface Source {
  id: string;
  es: string;
  en: string;
  href: string;
}

export interface Skill {
  id: string;
  label: string;
  en?: string; // English label when it differs
  aliases: string[];
  sources: string[]; // Source ids, strongest evidence first
}

const exp = "/#experience";
const certs = "/#certifications";

export const sources: Source[] = [
  { id: "ieeg", es: "IEEG · Ingeniero de Software (2026–hoy)", en: "IEEG · Software Engineer (2026–now)", href: exp },
  { id: "civil", es: "Registro Civil · Desarrollador de Sistemas (2024–2026)", en: "Civil Registry · Systems Developer (2024–2026)", href: exp },
  { id: "mac", es: "Hospitales MAC · Soporte y Desarrollo (2020–2024)", en: "Hospitales MAC · Support & Development (2020–2024)", href: exp },
  { id: "infoexpo", es: "Infoexpo · Desarrollador FrontEnd (2018–2020)", en: "Infoexpo · Front-End Developer (2018–2020)", href: exp },
  { id: "master", es: "Maestría en Diseño de Interfaz Web (UNIR, en curso)", en: "Master's in Web UI Design (UNIR, in progress)", href: exp },
  { id: "iaplan", es: "Programa en IA para Desarrollo y DevOps (UNIR, en curso)", en: "AI for Software Dev & DevOps program (UNIR, in progress)", href: exp },
  { id: "cert-ia", es: "Certificaciones de Desarrollo con IA (BIG School)", en: "AI Development certifications (BIG School)", href: certs },
  { id: "cert-sec", es: "Certificación en Ciberseguridad y Hacking Ético", en: "Cybersecurity & Ethical Hacking certification", href: certs },
  { id: "cert-agile", es: "Certificación en Proyectos Ágiles: Design Thinking y Scrum", en: "Agile Projects certification: Design Thinking & Scrum", href: certs },
  { id: "cert-soft", es: "Diplomado en Soft Skills y Habilidades Directivas", en: "Soft Skills & Leadership diploma", href: certs },
  { id: "stack", es: "Stack técnico (sección Tecnologías)", en: "Tech stack (Technologies section)", href: "/#technologies" },
  ...projects.map((p) => ({ id: p.key, es: `Caso: ${p.title}`, en: `Case study: ${p.title}`, href: `/projects/${p.key}` })),
];

export const skills: Skill[] = [
  // Frontend
  { id: "angular", label: "Angular", aliases: ["angular"], sources: ["civil", "ieeg", "surticel", "constancias", "logpath", "anotaciones", "posmiche", "purplewings"] },
  { id: "typescript", label: "TypeScript", aliases: ["typescript", "ts"], sources: ["surticel", "purplewings", "stack"] },
  { id: "javascript", label: "JavaScript", aliases: ["javascript", "js", "ecmascript", "es6"], sources: ["stack", "infoexpo"] },
  { id: "htmlcss", label: "HTML / CSS", aliases: ["html", "html5", "css", "css3"], sources: ["infoexpo", "stack", "master"] },
  { id: "tailwind", label: "Tailwind CSS", aliases: ["tailwind", "tailwindcss", "tailwind css"], sources: ["surticel", "celebraya", "logpath", "anotaciones", "posmiche"] },
  { id: "materialdesign", label: "Material Design", aliases: ["material design", "angular material"], sources: ["constancias"] },
  { id: "responsive", label: "Diseño responsivo", en: "Responsive design", aliases: ["responsive", "responsivo", "diseno responsivo", "responsive design", "mobile first"], sources: ["infoexpo", "surticel", "posmiche"] },
  { id: "uxui", label: "UI / UX", aliases: ["ux", "ui", "ui/ux", "ux/ui", "experiencia de usuario", "user experience", "diseno de interfaces", "interfaces de usuario", "user interface"], sources: ["master", "purplewings", "infoexpo"] },
  { id: "pwa", label: "PWA", aliases: ["pwa", "progressive web app", "progressive web apps", "service worker", "service workers"], sources: ["surticel"] },
  { id: "astro", label: "Astro", aliases: ["astro"], sources: ["celebraya"] },
  { id: "architecture", label: "Arquitectura frontend", en: "Frontend architecture", aliases: ["arquitectura limpia", "clean architecture", "clean code", "arquitectura frontend", "frontend architecture", "inyeccion de dependencias", "dependency injection", "spa"], sources: ["constancias", "ieeg", "surticel"] },

  // Mobile
  { id: "flutter", label: "Flutter", aliases: ["flutter"], sources: ["ieeg"] },
  { id: "dart", label: "Dart", aliases: ["dart"], sources: ["ieeg"] },
  { id: "reactnative", label: "React Native", aliases: ["react native", "react-native"], sources: ["ieeg"] },
  { id: "mobile", label: "Desarrollo móvil", en: "Mobile development", aliases: ["mobile", "movil", "moviles", "app movil", "apps moviles", "aplicaciones moviles", "mobile apps", "android"], sources: ["ieeg", "posmiche"] },
  { id: "capacitor", label: "Capacitor (apps híbridas)", en: "Capacitor (hybrid apps)", aliases: ["capacitor", "hibrida", "hibridas", "hybrid app", "hybrid apps"], sources: ["posmiche"] },

  // Backend & data
  { id: "csharp", label: "C# / .NET", aliases: ["c#", "csharp", ".net", "dotnet", "asp.net", "net core", ".net core"], sources: ["ieeg", "logpath", "stack"] },
  { id: "python", label: "Python", aliases: ["python"], sources: ["civil", "constancias"] },
  { id: "fastapi", label: "FastAPI", aliases: ["fastapi"], sources: ["civil", "constancias"] },
  { id: "php", label: "PHP", aliases: ["php"], sources: ["infoexpo"] },
  { id: "symfony", label: "Symfony", aliases: ["symfony"], sources: ["infoexpo"] },
  { id: "node", label: "Node.js", aliases: ["node", "nodejs", "node.js"], sources: ["stack"] },
  { id: "rest", label: "APIs REST", en: "REST APIs", aliases: ["api rest", "apis rest", "rest api", "rest apis", "restful", "consumo de apis", "apis"], sources: ["civil", "constancias", "ieeg"] },
  { id: "microservices", label: "Microservicios", en: "Microservices", aliases: ["microservicios", "microservices", "microservicio"], sources: ["ieeg"] },
  { id: "sql", label: "SQL", aliases: ["sql", "bases de datos relacionales", "relational databases"], sources: ["mac", "infoexpo"] },
  { id: "postgresql", label: "PostgreSQL", aliases: ["postgresql", "postgres"], sources: ["infoexpo", "surticel"] },
  { id: "mysql", label: "MySQL", aliases: ["mysql"], sources: ["logpath", "anotaciones"] },
  { id: "oracle", label: "Oracle", aliases: ["oracle", "pl/sql", "plsql"], sources: ["mac"] },
  { id: "firebase", label: "Firebase", aliases: ["firebase", "firestore"], sources: ["posmiche", "anotaciones"] },
  { id: "supabase", label: "Supabase", aliases: ["supabase"], sources: ["surticel"] },
  { id: "realtime", label: "Tiempo real", en: "Real-time", aliases: ["tiempo real", "real-time", "real time", "realtime"], sources: ["logpath"] },

  // Tools & practices
  { id: "git", label: "Git", aliases: ["git", "github", "control de versiones", "version control"], sources: ["stack"] },
  { id: "deploy", label: "Despliegue (Vercel / Netlify)", en: "Deployment (Vercel / Netlify)", aliases: ["vercel", "netlify"], sources: ["celebraya", "purplewings"] },
  { id: "scrum", label: "Scrum / Ágil", en: "Scrum / Agile", aliases: ["scrum", "agile", "agil", "metodologias agiles", "agile methodologies", "sprint", "sprints", "daily", "dailies"], sources: ["ieeg", "cert-agile"] },
  { id: "designthinking", label: "Design Thinking", aliases: ["design thinking"], sources: ["cert-agile"] },
  { id: "docs", label: "Documentación técnica", en: "Technical documentation", aliases: ["confluence", "documentacion tecnica", "technical documentation"], sources: ["ieeg"] },
  { id: "ai", label: "IA en el desarrollo", en: "AI in development", aliases: ["ia", "ai", "inteligencia artificial", "artificial intelligence", "llm", "llms", "claude", "ia generativa", "generative ai"], sources: ["ieeg", "cert-ia", "iaplan"] },
  { id: "devops", label: "DevOps (en formación)", en: "DevOps (in training)", aliases: ["devops"], sources: ["iaplan"] },
  { id: "security", label: "Seguridad", en: "Security", aliases: ["ciberseguridad", "cybersecurity", "seguridad informatica", "security", "owasp", "sha-256", "criptografia", "cryptography"], sources: ["cert-sec", "constancias"] },

  // Domain & leadership
  { id: "lead", label: "Liderazgo técnico", en: "Technical leadership", aliases: ["liderazgo", "lider tecnico", "tech lead", "lead", "leadership", "liderar"], sources: ["constancias", "anotaciones", "cert-soft"] },
  { id: "gov", label: "Sector público / gobierno", en: "Public sector / government", aliases: ["gobierno", "gubernamental", "gubernamentales", "sector publico", "government", "public sector", "govtech"], sources: ["ieeg", "civil"] },
  { id: "health", label: "Sector salud", en: "Healthcare", aliases: ["sector salud", "healthcare", "hospital", "hospitales", "clinico", "clinical", "healthtech", "health tech", "emr", "expediente clinico"], sources: ["mac"] },
  { id: "support", label: "Soporte técnico", en: "Technical support", aliases: ["soporte tecnico", "technical support", "mesa de ayuda", "help desk", "helpdesk"], sources: ["mac"] },
];

// Common requirements that do not appear anywhere in the portfolio. They make the score honest:
// a role that asks for them is shown as a partial match instead of a perfect one.
export const gaps: { label: string; en?: string; aliases: string[] }[] = [
  { label: "React", aliases: ["react", "react.js", "reactjs"] },
  { label: "Next.js", aliases: ["next.js", "nextjs"] },
  { label: "Vue", aliases: ["vue", "vue.js", "vuejs", "nuxt"] },
  { label: "Svelte", aliases: ["svelte", "sveltekit"] },
  { label: "Redux", aliases: ["redux"] },
  { label: "GraphQL", aliases: ["graphql"] },
  { label: "Java", aliases: ["java", "spring", "spring boot"] },
  { label: "Kotlin", aliases: ["kotlin"] },
  { label: "Swift / iOS nativo", en: "Swift / native iOS", aliases: ["swift", "swiftui"] },
  { label: "Go", aliases: ["golang"] },
  { label: "Rust", aliases: ["rust"] },
  { label: "Ruby / Rails", aliases: ["ruby", "rails", "ruby on rails"] },
  { label: "Django", aliases: ["django"] },
  { label: "Laravel", aliases: ["laravel"] },
  { label: "AWS", aliases: ["aws", "amazon web services"] },
  { label: "Azure", aliases: ["azure"] },
  { label: "Google Cloud", aliases: ["gcp", "google cloud"] },
  { label: "Docker", aliases: ["docker", "contenedores", "containers"] },
  { label: "Kubernetes", aliases: ["kubernetes", "k8s"] },
  { label: "Terraform", aliases: ["terraform"] },
  { label: "CI/CD", aliases: ["ci/cd", "cicd", "jenkins", "github actions", "gitlab ci"] },
  { label: "MongoDB", aliases: ["mongodb", "mongo"] },
  { label: "Redis", aliases: ["redis"] },
  { label: "Testing automatizado", en: "Automated testing", aliases: ["jest", "cypress", "playwright", "pruebas unitarias", "unit testing", "unit tests", "testing automatizado", "tdd", "jasmine", "karma"] },
  { label: "Figma", aliases: ["figma"] },
  { label: "Sass / SCSS", aliases: ["sass", "scss"] },
];
