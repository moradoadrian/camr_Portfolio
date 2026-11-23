import { describe, it, expect } from "vitest";
import { createJobMatcher, normalizeText } from "../job-match";
import { skills, gaps } from "../../data/skills";

describe("job-match engine", () => {
  const analyze = createJobMatcher(skills, gaps);

  it("normalizes accents and case", () => {
    expect(normalizeText("Diseño Móvil y Programación")).toBe("diseno movil y programacion");
  });

  it("matches React Native without falsely matching React gap", () => {
    const res = analyze("Buscamos dev con experiencia en React Native y Flutter.");
    const hitLabels = res.hits.map((h) => h.label);
    const missLabels = res.misses.map((m) => m.label);

    expect(hitLabels).toContain("React Native");
    expect(hitLabels).toContain("Flutter");
    expect(missLabels).not.toContain("React");
    expect(res.score).toBe(100);
  });

  it("separates hits and gaps and calculates match percentage", () => {
    const res = analyze("Requisitos: Angular, TypeScript, AWS y Kubernetes.");
    expect(res.hits.map((h) => h.label)).toEqual(expect.arrayContaining(["Angular", "TypeScript"]));
    expect(res.misses.map((m) => m.label)).toEqual(expect.arrayContaining(["AWS", "Kubernetes"]));
    expect(res.score).toBeGreaterThan(0);
    expect(res.score).toBeLessThan(100);
  });

  it("returns empty results and 0 score for unrecognized text", () => {
    const res = analyze("Buscamos pastelero con experiencia en panadería artesanal.");
    expect(res.hits).toHaveLength(0);
    expect(res.misses).toHaveLength(0);
    expect(res.score).toBe(0);
  });
});
