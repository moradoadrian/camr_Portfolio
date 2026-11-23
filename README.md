# Portafolio — César Adrián Morado Rodríguez

Portafolio personal construido con **Astro 5**, **Tailwind CSS** y **GSAP**, diseñado con estética retro-terminal y enfocado en rendimiento, casos de estudio reales y herramientas interactivas para recruiters y clientes.

🌐 **Sitio en producción:** [camr-portfolio.vercel.app](https://camr-portfolio.vercel.app)

---

## Características principales

- **Casos de estudio detallados (`/projects/[slug]`)**: arquitectura, problema, solución, impacto y capturas optimizadas en WebP/AVIF.
- **Depurador visual de JavaScript**: ejecuta código paso a paso en un Web Worker aislado usando `acorn`, mostrando línea activa, call stack, variables y consola.
- **Analizador de vacantes (`Job Match`)**: compara descripciones de puestos en el navegador contra la experiencia del portafolio con enlaces de evidencia.
- **Terminal interactiva y paleta de comandos (`Ctrl+K` / `⌘K`)**: navegación rápida, historial de comandos, autocompletado y easter eggs.
- **Datos en build time**: estadísticas y calendario de contribuciones de GitHub + últimos Shorts de YouTube vía RSS con fallback seguro.
- **Soporte bilingüe (ES / EN)** y formulario de contacto conectado a Web3Forms con fallback a `mailto:`.

---

## Stack técnico

- [Astro 5](https://astro.build/) + `@astrojs/sitemap`
- [Tailwind CSS](https://tailwindcss.com/)
- [GSAP](https://gsap.com/) (ScrollTrigger)
- [Acorn](https://github.com/acornjs/acorn) (AST para el depurador visual)
- [Simple Icons](https://simpleicons.org/)

---

## Desarrollo local

```bash
npm install
npm run dev      # Inicia servidor local en http://localhost:4321
npm run build    # Genera build de producción en ./dist/
npm run preview  # Previsualiza el build localmente
```

## Estructura del proyecto

```text
src/
├── assets/        # Imágenes optimizadas en build time (perfil, proyectos, certificados)
├── components/    # Secciones y widgets interactivos (Hero, Projects, Debugger, JobMatch, etc.)
├── data/          # Datos estructurados (projects.ts, skills.ts)
├── layouts/       # Layout principal, SEO, JSON-LD e i18n
├── lib/           # Utilidades (images.ts, github.ts, youtube.ts, debugger.ts, tech-icons.ts)
└── pages/         # Rutas (index.astro, 404.astro, projects/[slug].astro)
```
