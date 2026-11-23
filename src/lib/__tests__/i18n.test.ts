import { describe, it, expect } from "vitest";
import es from "../../data/i18n/es.json";
import en from "../../data/i18n/en.json";

describe("i18n dictionaries", () => {
  it("keeps 100% key parity between es.json and en.json", () => {
    const esKeys = Object.keys(es).sort();
    const enKeys = Object.keys(en).sort();
    expect(esKeys).toEqual(enKeys);
  });

  it("has no empty translation values", () => {
    for (const [k, v] of Object.entries(es)) {
      expect(v.trim().length, `es.${k} is empty`).toBeGreaterThan(0);
    }
    for (const [k, v] of Object.entries(en)) {
      expect(v.trim().length, `en.${k} is empty`).toBeGreaterThan(0);
    }
  });
});
