import { describe, it, expect } from "vitest";
import { trace } from "../debugger";

describe("visual JS debugger (trace)", () => {
  it("traces a synchronous loop and captures console output", () => {
    const res = trace(`
      let total = 0;
      for (let i = 1; i <= 3; i++) {
        total += i;
      }
      console.log(total);
    `);

    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.output).toEqual(["6"]);
    expect(res.steps.length).toBeGreaterThan(3);
    expect(res.truncated).toBe(false);
  });

  it("reports syntax errors with line number", () => {
    const res = trace("const x = ;");
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.kind).toBe("syntax");
    if (res.kind === "syntax") expect(res.line).toBe(1);
  });

  it("rejects unsupported async constructs", () => {
    const res = trace("async function run() { return 1; } run();");
    expect(res).toEqual({ ok: false, kind: "unsupported" });
  });

  it("truncates infinite loops safely within step budget", () => {
    const res = trace("let i = 0; while (true) { i++; }");
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.truncated).toBe(true);
  });
});
