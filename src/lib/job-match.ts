// Pure keyword-matching engine for JobMatch.astro (extracted so it can be unit-tested).

export interface MatchSkill {
  id: string;
  label: string;
  en?: string;
  aliases: string[];
  sources: string[];
}

export interface MatchGap {
  label: string;
  en?: string;
  aliases: string[];
}

export interface MatchResult<S extends MatchSkill = MatchSkill, G extends MatchGap = MatchGap> {
  hits: S[];
  misses: G[];
  score: number;
}

// Lowercase + strip accents so "Diseño móvil" matches "diseno movil"
export const normalizeText = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function createJobMatcher<S extends MatchSkill, G extends MatchGap>(skills: S[], gaps: G[]) {
  // Longest aliases first, and each match is blanked out, so "react native" is not also read as "react"
  const entries = [
    ...skills.flatMap((s, i) => s.aliases.map((a) => ({ alias: a, kind: "skill" as const, index: i }))),
    ...gaps.flatMap((g, i) => g.aliases.map((a) => ({ alias: a, kind: "gap" as const, index: i }))),
  ]
    .sort((a, b) => b.alias.length - a.alias.length)
    .map((e) => ({ ...e, re: new RegExp(`(?<![a-z0-9])${escapeRe(e.alias)}(?![a-z0-9])`, "g") }));

  return function analyze(text: string): MatchResult<S, G> {
    let haystack = ` ${normalizeText(text)} `;
    const hitIdx = new Set<number>();
    const missIdx = new Set<number>();

    for (const e of entries) {
      e.re.lastIndex = 0;
      if (!e.re.test(haystack)) continue;
      (e.kind === "skill" ? hitIdx : missIdx).add(e.index);
      haystack = haystack.replace(e.re, (m) => " ".repeat(m.length));
    }

    const hits = [...hitIdx].sort((a, b) => a - b).map((i) => skills[i]);
    const misses = [...missIdx].sort((a, b) => a - b).map((i) => gaps[i]);
    const total = hits.length + misses.length;
    const score = total > 0 ? Math.round((hits.length / total) * 100) : 0;

    return { hits, misses, score };
  };
}
