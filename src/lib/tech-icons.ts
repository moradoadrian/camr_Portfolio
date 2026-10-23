import {
  siAngular,
  siTypescript,
  siTailwindcss,
  siPython,
  siFastapi,
  siFirebase,
  siMysql,
  siPostgresql,
  siSupabase,
  siDotnet,
  siCapacitor,
  siMaterialdesign,
  siPwa,
  siAstro,
  siVercel,
  siNetlify,
} from "simple-icons";

// Official Simple Icons marks, same approach as Technologies.astro. Brands whose
// official hex is too dark for this site's slate cards get a light override.
function brandIcon(icon: { title: string; path: string; hex: string }, fillOverride?: string) {
  const fill = fillOverride ?? `#${icon.hex}`;
  return `<svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="${icon.path}" fill="${fill}"/></svg>`;
}

const techIcons: Record<string, string> = {
  Angular: brandIcon(siAngular, "#E23237"),
  TypeScript: brandIcon(siTypescript),
  Tailwind: brandIcon(siTailwindcss),
  Python: brandIcon(siPython),
  FastAPI: brandIcon(siFastapi),
  Firebase: brandIcon(siFirebase),
  MySQL: brandIcon(siMysql, "#4DB6E8"),
  PostgreSQL: brandIcon(siPostgresql, "#6E9FD6"),
  Supabase: brandIcon(siSupabase),
  ".NET": brandIcon(siDotnet, "#A77BFF"),
  Capacitor: brandIcon(siCapacitor),
  "Material Design": brandIcon(siMaterialdesign, "#E2E8F0"),
  PWA: brandIcon(siPwa, "#A78BFA"),
  Astro: brandIcon(siAstro),
  Vercel: brandIcon(siVercel, "#E2E8F0"),
  Netlify: brandIcon(siNetlify),
  "SHA-256": `<svg class="w-3.5 h-3.5 shrink-0 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>`,
};

export const getTechIcon = (tag: string) => {
  return techIcons[tag] || `<svg class="w-3.5 h-3.5 shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>`;
};
