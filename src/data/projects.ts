// Single source of truth for the portfolio projects: the home section (Projects.astro) and the
// case-study pages (/projects/[slug]) both render from here.
// Text fields hold the Spanish copy; the i18n key for a field is `proj.<key>.<field>`
// (list items use numbered keys, see `resultKey` / Impact.key).

export interface ProjectLink {
  nameKey: string;
  url: string;
}

export interface Impact {
  key: string; // i18n suffix, e.g. "metrics" or "metric2"
  text: string;
}

export interface Project {
  key: string; // also the URL slug
  title: string;
  subtitle?: string;
  domain?: string;
  url?: string; // live site
  overview: string;
  problem: string;
  challenge?: string;
  solution: string;
  architecture?: string;
  technicalChallenges?: string;
  role: string;
  impact: Impact[];
  results?: string[];
  lessons?: string;
  highlights?: { icon: string; key: string; label: string }[];
  tags: string[];
  image: string; // path inside src/assets
  // Full-page screenshot that pans on hover (otherwise a regular landscape capture)
  scroll?: boolean;
  scrollMs?: number;
  links: ProjectLink[];
  featured?: boolean;
}

export const resultKey = (p: Project, i: number) => `proj.${p.key}.result${i + 1}`;

export const projects: Project[] = [
  {
    key: "surticel",
    featured: true,
    title: "Surticel",
    subtitle: "Plataforma de pedidos B2B · Fruta y verdura",
    url: "https://surticel.com",
    domain: "surticel.com",
    overview: "Plataforma de pedidos en línea para un surtidor de fruta y verdura en Celaya. Los negocios clientes consultan el catálogo con precios y existencias actualizados, arman su pedido en minutos y dan seguimiento a la entrega hasta su puerta.",
    problem: "Los pedidos de los negocios clientes se tomaban por teléfono o mensaje, sin visibilidad de precios, existencias ni del estado de la entrega.",
    challenge: "Construir una experiencia rápida y confiable en celular para clientes que piden en plena operación, con el catálogo siempre al día y avisos del estado de cada pedido.",
    solution: "PWA instalable con catálogo por categorías, carrito, historial y seguimiento de pedidos, notificaciones Web Push y tema claro/oscuro.",
    architecture: "SPA en Angular con Tailwind CSS; Supabase como backend (autenticación y base de datos PostgreSQL) y service worker para instalación y notificaciones push.",
    role: "Full-Stack Developer — Diseño y desarrollo de la plataforma de punta a punta: interfaz, modelo de datos, autenticación y despliegue.",
    impact: [],
    results: [
      "Catálogo con precio y stock siempre actualizados",
      "Seguimiento del pedido desde la confirmación hasta la entrega",
      "App instalable (PWA) con notificaciones push",
      "Carga optimizada: imágenes AVIF y precarga del hero",
    ],
    highlights: [
      { icon: "📱", key: "pwa", label: "PWA instalable" },
      { icon: "🔔", key: "push", label: "Web Push" },
      { icon: "🌗", key: "theme", label: "Modo oscuro" },
      { icon: "🔐", key: "auth", label: "Auth Supabase" },
    ],
    tags: ["Angular", "TypeScript", "Supabase", "PostgreSQL", "Tailwind", "PWA"],
    image: "projects/surticel-full.png",
    scroll: true,
    links: [{ nameKey: "live", url: "https://surticel.com" }],
  },
  {
    key: "celebraya",
    title: "Celebra-Ya Studio",
    domain: "celebra-ya.com",
    url: "https://celebra-ya.com",
    overview: "Estudio de invitaciones digitales a la medida para bodas, XV años, bautizos y eventos especiales: sitio comercial con portafolio filtrable por tipo de evento, paquetes con precios y solicitud de cotización.",
    problem: "Las invitaciones impresas o en imagen no permiten confirmar asistencia, ubicar el evento ni controlar el acceso de los invitados.",
    solution: "Invitaciones web con cuenta regresiva, mapa a Google Maps y Waze, RSVP por WhatsApp, galería HD y pases QR individuales, más un sitio de venta con catálogo y paquetes.",
    role: "Fundador y desarrollador — Diseño, desarrollo y despliegue del sitio del estudio y de cada invitación.",
    impact: [{ key: "metrics", text: "Entregas de 48 horas a 7 días. Pases QR para eventos de hasta 250 invitados." }],
    tags: ["Astro", "Tailwind", "Vercel"],
    image: "projects/celebraya-full.jpg",
    scroll: true,
    // Long landing page (7000px): slower pan so it stays readable
    scrollMs: 12000,
    links: [
      { nameKey: "live", url: "https://celebra-ya.com" },
      { nameKey: "portafolio", url: "https://celebra-ya.com/plantillas" },
    ],
  },
  {
    key: "constancias",
    title: "Constancias de Inexistencia",
    overview: "Emisión y gestión de actas de inexistencia para la Dirección General del Registro Civil. Digitaliza trámites administrativos gubernamentales clave, agilizando el servicio al ciudadano mediante validación criptográfica y firmas digitales.",
    problem: "Los procesos de búsqueda y emisión de constancias tardaban entre 10 y 15 días hábiles debido al procesamiento manual y archivos heredados fragmentados.",
    challenge: "Diseñar un portal seguro, rápido y resiliente para la consulta y emisión automatizada de constancias de inexistencia, conectando bases de datos heredadas y garantizando la validez de los documentos.",
    solution: "Plataforma web con búsqueda indexada rápida, formularios inteligentes y un validador de integridad documental basado en hash SHA-256.",
    architecture: "Arquitectura SPA desacoplada construida en Angular 17 para el frontend con componentes de material design, interactuando mediante APIs REST seguras creadas en Python (FastAPI).",
    technicalChallenges: "Optimización de consultas indexadas en bases de datos masivas y generación segura de firmas SHA-256.",
    role: "Lead Full-Stack Developer — Responsable de la arquitectura frontend en Angular 17, diseño de la base de datos y flujos de carga segura de archivos.",
    impact: [
      { key: "metric1", text: "Reducción del tiempo de trámite de 15 días a menos de 5 minutos." },
      { key: "metric2", text: "Más de 20,000 ciudadanos atendidos y constancias generadas con éxito." },
      { key: "metric3", text: "100% de documentos validados mediante firmas hash seguras." },
    ],
    results: [
      "Formularios dinámicos integrados",
      "Integración con APIs REST de alto rendimiento",
      "Validación de documentos SHA-256",
      "Gestión documental optimizada",
      "Optimización del flujo administrativo civil",
    ],
    lessons: "La modularización estricta y el diseño offline-first de consultas reducen considerablemente la carga en la red, mientras que el hash SHA-256 previene la suplantación de identidad.",
    tags: ["Angular", "Python", "FastAPI", "Material Design", "SHA-256"],
    image: "projects/constanciasI.png",
    links: [],
  },
  {
    key: "logpath",
    title: "LogPath (midudev Hackathon)",
    overview: "Arquitectura de telemetría Edge-to-Cloud para puntos de venta (POS). Audita transacciones en tiempo real con interceptor de fallas.",
    problem: "Falta de visibilidad e imposibilidad de diagnosticar problemas en terminales de pago remotas antes de recibir quejas del cliente.",
    solution: "Agente en .NET 10 y panel web Angular 19 para monitorear eventos críticos en tiempo real y enviar alertas automáticas vía Discord Webhooks.",
    role: "Full-Stack Developer — Diseñé la interfaz del dashboard reactivo y conecté los flujos de telemetría en tiempo real.",
    impact: [{ key: "metrics", text: "Latencia de alerta de eventos < 150ms. Telemetría de red automatizada." }],
    tags: ["Angular", ".NET", "MySQL", "Tailwind"],
    image: "projects/logpath.png",
    links: [
      { nameKey: "repoFront", url: "https://github.com/moradoadrian/LogPath" },
      { nameKey: "repoAPI", url: "https://github.com/moradoadrian/logpath-api" },
    ],
  },
  {
    key: "anotaciones",
    title: "Anotaciones Judiciales",
    overview: "Plataforma digital para la Dirección General del Registro Civil para asentar y auditar anotaciones marginales y rectificaciones legales.",
    problem: "Anotaciones en actas manuales propensas a errores de transcripción, pérdida física y demoras de búsqueda en libros físicos.",
    solution: "Base de datos transaccional con control de auditoría estricto, flujos de aprobación y paneles de búsqueda rápida.",
    role: "Lead Frontend Developer — Implementé la interfaz web completa, control de accesos por roles y el sistema de impresión de sellos.",
    impact: [{ key: "metrics", text: "Más de 10,000 registros indexados y digitalizados. Control de errores al 0%." }],
    tags: ["Angular", "Tailwind", "MySQL", "Firebase"],
    image: "projects/anotacionesJ.png",
    links: [],
  },
  {
    key: "posmiche",
    title: "POS Miche LTS",
    overview: "Punto de venta y control de inventarios multiplataforma de alta velocidad para dispositivos móviles y escritorio.",
    problem: "Puntos de venta convencionales lentos, incompatibles con tabletas Android y dependientes de conectividad continua.",
    solution: "Aplicación híbrida responsiva con sincronización en segundo plano de base de datos local y Firebase.",
    role: "Mobile & Frontend Developer — Diseñé la UI móvil y la compilación híbrida utilizando Capacitor.",
    impact: [{ key: "metrics", text: "Más de 5,000 transacciones mensuales procesadas sin interrupciones." }],
    tags: ["Angular", "Firebase", "Capacitor", "Tailwind"],
    image: "projects/posMiche.png",
    links: [],
  },
  {
    key: "purplewings",
    title: "Purple Wings",
    domain: "purple-wings.netlify.app",
    url: "https://purple-wings.netlify.app/#/inicio",
    overview: "App de pedidos en línea para un negocio de alitas adobadas al carbón en Celaya, con identidad visual propia y flujo de compra pensado para celular.",
    problem: "Los pedidos llegaban por mensajes sueltos sin cantidades, total ni datos de entrega claros, lo que generaba errores y vueltas de confirmación.",
    solution: "Selector de paquetes con cálculo de total en vivo, formulario de entrega y envío del pedido ya armado por WhatsApp, más enlace y código QR para compartir.",
    role: "Frontend Developer — Diseñé la identidad visual de la app y desarrollé el flujo de pedido en Angular.",
    impact: [{ key: "metrics", text: "Pedido completo en un solo mensaje de WhatsApp, listo en ~15–20 minutos." }],
    tags: ["Angular", "TypeScript", "Netlify"],
    image: "projects/purpleW-full.png",
    scroll: true,
    links: [{ nameKey: "live", url: "https://purple-wings.netlify.app/#/inicio" }],
  },
];

export const featuredProject = projects.find((p) => p.featured)!;
export const otherProjects = projects.filter((p) => !p.featured);
