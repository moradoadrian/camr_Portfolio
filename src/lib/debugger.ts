// Runs a JavaScript snippet step by step and records the active line, variables and console.
// It inserts logging calls into the code (keeping its line numbers) and evaluates the result.
// This is not a security boundary: it only runs what the visitor typed, inside a Web Worker
// (see debugger-worker.ts), and code is never loaded from a URL or from storage.
import { parse } from "acorn";

export const MAX_STEPS = 500;
const MAX_CALLS = 20_000;
const MAX_OUTPUT_LINES = 200;
const MAX_VALUE_CHARS = 200;

export interface TraceVariable {
  name: string;
  value: string;
}
export interface TraceGroup {
  label: string; // "global", "for", "block", "anonymous" or a function name
  remembered: boolean; // still alive after its scope ended: a closure
  variables: TraceVariable[];
}
export interface TraceStep {
  line: number; // 0 = the program finished
  stack: string[]; // from "program" to the running function
  groups: TraceGroup[];
  output: number; // console lines printed so far
}
export type TokenKind = "plain" | "keyword" | "function" | "number" | "string" | "comment";
export interface Segment {
  text: string;
  kind: TokenKind;
}
export type TraceResult =
  | { ok: true; steps: TraceStep[]; output: string[]; lines: Segment[][]; truncated: boolean; error?: string }
  | { ok: false; kind: "syntax"; message: string; line: number }
  | { ok: false; kind: "unsupported" };

export const PROGRAM = "program";
export const ANONYMOUS = "anonymous";

class UnsupportedError extends Error {}

// Timers and promises fire after the program ends, when the trace is already over
const ASYNC_GLOBALS = new Set(["setTimeout", "setInterval", "setImmediate", "queueMicrotask", "requestAnimationFrame", "Promise", "fetch"]);

const NO_STEP = new Set([
  "BlockStatement",
  "FunctionDeclaration",
  "ClassDeclaration",
  "ForStatement",
  "ForInStatement",
  "ForOfStatement",
  "WhileStatement",
  "DoWhileStatement",
  "LabeledStatement",
  "EmptyStatement",
]);

// Statements that always run to their end, so they can log their result
const WITH_EFFECT = new Set(["ExpressionStatement", "VariableDeclaration"]);

interface Scope {
  id: number;
  names: string[];
  label: string;
  functionId: number;
  isBlock: boolean;
}

const patternNames = (p: any, out: string[]) => {
  if (!p) return;
  if (p.type === "Identifier") out.push(p.name);
  else if (p.type === "ObjectPattern") p.properties.forEach((x: any) => patternNames(x.type === "Property" ? x.value : x, out));
  else if (p.type === "ArrayPattern") p.elements.forEach((x: any) => patternNames(x, out));
  else if (p.type === "RestElement") patternNames(p.argument, out);
  else if (p.type === "AssignmentPattern") patternNames(p.left, out);
};

const children = (n: any): any[] => {
  const out: any[] = [];
  for (const k of Object.keys(n)) {
    if (k === "loc") continue;
    const v = n[k];
    if (Array.isArray(v)) out.push(...v.filter((x) => x && typeof x.type === "string"));
    else if (v && typeof v.type === "string") out.push(v);
  }
  return out;
};

const isFunction = (n: any) => ["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"].includes(n.type);

// var climbs to its function, without entering inner functions
const deepVars = (n: any, out: string[]) => {
  if (n.type === "VariableDeclaration" && n.kind === "var") n.declarations.forEach((d: any) => patternNames(d.id, out));
  for (const c of children(n)) if (!isFunction(c)) deepVars(c, out);
};

// let and const of a block. Declared functions and classes are left out: they only fill the panel
const lexical = (statements: any[], out: string[]) => {
  for (const s of statements) {
    if (s.type === "VariableDeclaration" && s.kind !== "var") s.declarations.forEach((d: any) => patternNames(d.id, out));
  }
};

export function instrument(code: string) {
  const ast: any = parse(code, { ecmaVersion: "latest", sourceType: "script", locations: true });
  // Insertions at the same position keep the order in which they were added
  const edits: { pos: number; text: string }[] = [];
  const insert = (pos: number, text: string) => edits.push({ pos, text });
  const scopes: Scope[] = [];
  const chain: Scope[] = [];
  const functionNames = new WeakMap<object, string>();
  const functions = [PROGRAM];
  let currentFunction = 0;

  const open = (names: string[], label: string, isBlock: boolean) => {
    const scope: Scope = { id: scopes.length, names: [...new Set(names)], label, functionId: currentFunction, isBlock };
    scopes.push(scope);
    chain.push(scope);
  };

  const stepCall = (line: number, hook = "__t") => {
    const seen = new Set<string>();
    const parts: string[] = [];
    // From the innermost scope to the global one: an inner variable hides the outer one
    for (const scope of [...chain].reverse()) {
      const own = scope.names.filter((x) => !seen.has(x));
      own.forEach((x) => seen.add(x));
      if (own.length) parts.push(`${scope.id}:{${own.map((x) => `${JSON.stringify(x)}:()=>${x}`).join(",")}}`);
    }
    return `${hook}(${line},{${parts.join(",")}})`;
  };

  const statement = (n: any, single: boolean) => {
    if (NO_STEP.has(n.type) || n.directive) return visit(n);
    if (single) insert(n.start, "{");
    insert(n.start, `${stepCall(n.loc.start.line)};`);
    visit(n);
    // Log again when the line ends: the step shows its effect, and a line that called a
    // function is highlighted again when that function returns
    if (WITH_EFFECT.has(n.type)) insert(n.end, `;${stepCall(n.loc.start.line, "__d")};`);
    if (single) insert(n.end, "}");
  };

  // A loop's condition logs a step every time it is checked
  const condition = (test: any) => {
    insert(test.start, `(${stepCall(test.loc.start.line)},`);
    visit(test);
    insert(test.end, ")");
  };

  const fn = (n: any) => {
    if (n.async || n.generator) throw new UnsupportedError();
    const name = n.id?.name ?? functionNames.get(n) ?? ANONYMOUS;
    const previous = currentFunction;
    currentFunction = functions.push(name) - 1;
    const id = currentFunction;
    const names: string[] = [];
    n.params.forEach((p: any) => patternNames(p, names));
    deepVars(n.body, names);
    if (n.body.type === "BlockStatement") lexical(n.body.body, names);
    open(names, name, false);
    n.params.forEach(visit);
    const enter = `__e(${id});try{`;
    const leave = "}finally{__s();}";
    if (n.body.type === "BlockStatement") {
      insert(n.body.start + 1, enter);
      n.body.body.forEach((s: any) => statement(s, false));
      insert(n.body.end - 1, leave);
    } else {
      // Arrow with an expression: turn it into a block. Look for the arrow because the body may be in parentheses
      const arrow = code.lastIndexOf("=>", n.body.start) + 2;
      insert(arrow, `{${enter}${stepCall(n.body.loc.start.line)};return (`);
      visit(n.body);
      insert(n.end, `);${leave}}`);
    }
    chain.pop();
    currentFunction = previous;
  };

  const withScope = (names: string[], label: string, body: () => void) => {
    open(names, label, true);
    body();
    chain.pop();
  };

  const blockStatements = (block: any) => {
    const names: string[] = [];
    lexical(block.body, names);
    withScope(names, "block", () => block.body.forEach((s: any) => statement(s, false)));
  };

  const visit = (n: any): void => {
    switch (n.type) {
      case "FunctionDeclaration":
      case "FunctionExpression":
      case "ArrowFunctionExpression":
        return fn(n);
      case "BlockStatement":
        return blockStatements(n);
      case "IfStatement":
        visit(n.test);
        statement(n.consequent, true);
        if (n.alternate) statement(n.alternate, true);
        return;
      case "ForStatement": {
        const names: string[] = [];
        if (n.init?.type === "VariableDeclaration" && n.init.kind !== "var") lexical([n.init], names);
        return withScope(names, "for", () => {
          if (n.init) visit(n.init);
          if (n.test) condition(n.test);
          if (n.update) visit(n.update);
          statement(n.body, true);
        });
      }
      case "ForInStatement":
      case "ForOfStatement": {
        const names: string[] = [];
        if (n.left.type === "VariableDeclaration" && n.left.kind !== "var") lexical([n.left], names);
        return withScope(names, "for", () => {
          visit(n.right);
          // Log each turn on the loop's line, with its variable already assigned
          const step = `${stepCall(n.loc.start.line)};`;
          if (n.body.type === "BlockStatement") {
            insert(n.body.start + 1, step);
            blockStatements(n.body);
          } else {
            insert(n.body.start, `{${step}`);
            statement(n.body, false);
            insert(n.body.end, "}");
          }
        });
      }
      case "WhileStatement":
        condition(n.test);
        return statement(n.body, true);
      case "DoWhileStatement":
        statement(n.body, true);
        return condition(n.test);
      case "LabeledStatement":
        return statement(n.body, true);
      case "SwitchStatement": {
        visit(n.discriminant);
        const names: string[] = [];
        n.cases.forEach((c: any) => lexical(c.consequent, names));
        return withScope(names, "block", () =>
          n.cases.forEach((c: any) => {
            if (c.test) visit(c.test);
            c.consequent.forEach((s: any) => statement(s, false));
          })
        );
      }
      case "TryStatement":
        visit(n.block);
        if (n.handler) {
          const names: string[] = [];
          patternNames(n.handler.param, names);
          withScope(names, "block", () => visit(n.handler.body));
        }
        if (n.finalizer) visit(n.finalizer);
        return;
      default:
        if (n.type === "Identifier" && ASYNC_GLOBALS.has(n.name)) throw new UnsupportedError();
        if (n.type === "VariableDeclarator" && n.id.type === "Identifier" && n.init) functionNames.set(n.init, n.id.name);
        if (n.type === "AssignmentExpression" && n.left.type === "Identifier") functionNames.set(n.right, n.left.name);
        if (n.type === "Property" && n.key.type === "Identifier") functionNames.set(n.value, n.key.name);
        if ((n.type === "MethodDefinition" || n.type === "PropertyDefinition") && n.key.type === "Identifier" && n.value) {
          functionNames.set(n.value, n.key.name);
        }
        children(n).forEach(visit);
    }
  };

  const globals: string[] = [];
  deepVars(ast, globals);
  lexical(ast.body, globals);
  open(globals, "global", false);
  ast.body.forEach((s: any) => statement(s, false));
  insert(code.length, `\n${stepCall(0)};`);

  let result = "";
  let cursor = 0;
  edits
    .map((e, order) => ({ ...e, order }))
    .sort((a, b) => a.pos - b.pos || a.order - b.order)
    .forEach((e) => {
      result += code.slice(cursor, e.pos) + e.text;
      cursor = e.pos;
    });
  return { code: result + code.slice(cursor), scopes, functions };
}

// How a value looks in the panel. Everything is bounded: a visitor can print anything.
export function formatValue(v: unknown, depth = 0): string {
  const nested = (x: unknown) => formatValue(x, depth + 1);
  const list = (items: string[], total: number) => (total > items.length ? [...items, `… +${total - items.length}`] : items).join(", ");
  let text: string;
  if (typeof v === "string") text = JSON.stringify(v.length > 120 ? `${v.slice(0, 120)}…` : v);
  else if (typeof v === "function") text = v.name ? `ƒ ${v.name}` : "ƒ";
  else if (typeof v === "bigint") text = `${v}n`;
  else if (v === null || typeof v !== "object") text = String(v);
  else if (depth > 2) text = Array.isArray(v) ? "[…]" : "{…}";
  else if (Array.isArray(v)) text = `[${list(v.slice(0, 10).map(nested), v.length)}]`;
  else if (v instanceof Map) text = `Map(${v.size}) {${list([...v].slice(0, 6).map(([k, x]) => `${nested(k)} => ${nested(x)}`), v.size)}}`;
  else if (v instanceof Set) text = `Set(${v.size}) {${list([...v].slice(0, 10).map(nested), v.size)}}`;
  else if (v instanceof Date) text = Number.isNaN(v.getTime()) ? "Invalid Date" : v.toISOString();
  else if (v instanceof RegExp) text = RegExp.prototype.toString.call(v);
  else if (v instanceof Error) text = `${v.name}: ${v.message}`;
  else {
    const entries = Object.entries(v);
    const ctor = (v as object).constructor?.name;
    const body = `{${list(entries.slice(0, 8).map(([k, x]) => `${k}: ${nested(x)}`), entries.length)}}`;
    text = ctor && ctor !== "Object" ? `${ctor} ${body}` : body;
  }
  return text.length > MAX_VALUE_CHARS ? `${text.slice(0, MAX_VALUE_CHARS)}…` : text;
}

// Syntax colors come from the same parser that runs the code, so they never disagree with it
export function highlight(code: string): Segment[][] {
  const tokens: any[] = [];
  const comments: any[] = [];
  parse(code, { ecmaVersion: "latest", sourceType: "script", onToken: tokens, onComment: comments });

  const marks: { start: number; end: number; kind: TokenKind }[] = comments.map((c) => ({ start: c.start, end: c.end, kind: "comment" }));
  tokens.forEach((t, i) => {
    const label: string = t.type.label;
    let kind: TokenKind = "plain";
    if (t.type.keyword) kind = "keyword";
    else if (label === "num") kind = "number";
    else if (["string", "template", "`", "regexp"].includes(label)) kind = "string";
    else if (label === "name" && tokens[i + 1]?.type.label === "(") kind = "function";
    if (kind !== "plain") marks.push({ start: t.start, end: t.end, kind });
  });
  marks.sort((a, b) => a.start - b.start);

  const flat: Segment[] = [];
  let cursor = 0;
  for (const m of marks) {
    if (m.start > cursor) flat.push({ text: code.slice(cursor, m.start), kind: "plain" });
    flat.push({ text: code.slice(m.start, m.end), kind: m.kind });
    cursor = m.end;
  }
  if (cursor < code.length) flat.push({ text: code.slice(cursor), kind: "plain" });

  const lines: Segment[][] = [[]];
  for (const seg of flat) {
    seg.text.split("\n").forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ text: part, kind: seg.kind });
    });
  }
  return lines;
}

const consoleText = (v: unknown) => (typeof v === "string" ? v : formatValue(v));

const errorText = (e: unknown) => {
  try {
    return e instanceof Error ? `${e.name}: ${e.message}` : `Uncaught ${formatValue(e)}`;
  } catch {
    return "Uncaught error";
  }
};

type Readers = Record<string, Record<string, () => unknown>>;

export function trace(code: string): TraceResult {
  let lines: Segment[][];
  let program: ReturnType<typeof instrument>;
  try {
    lines = highlight(code);
    program = instrument(code);
  } catch (e: any) {
    if (e instanceof UnsupportedError) return { ok: false, kind: "unsupported" };
    return { ok: false, kind: "syntax", message: String(e?.message ?? e).replace(/\s*\(\d+:\d+\)$/, ""), line: e?.loc?.line ?? 1 };
  }

  const { scopes, functions } = program;
  const steps: TraceStep[] = [];
  const output: string[] = [];
  const callStack = [0];
  let lastDepth = 0;
  let truncated = false;
  let recording = false;
  let calls = 0;
  const budget = new Error("step budget");

  const record = (line: number, readers: Readers, isEffect = false) => {
    if (recording) return; // a getter called while reading a variable is not part of the program
    // Identical steps are dropped below, so `while (true) {}` would never fill the list: count calls too
    if (steps.length >= MAX_STEPS || ++calls > MAX_CALLS) {
      truncated = true;
      throw budget;
    }
    recording = true;
    try {
      const groups: TraceGroup[] = [];
      const current = callStack[callStack.length - 1];
      // Innermost scopes have the highest ids; numeric object keys would sort them the other way
      for (const id of Object.keys(readers).map(Number).sort((a, b) => b - a)) {
        const scope = scopes[id];
        const variables = Object.entries(readers[id]).flatMap(([name, read]) => {
          try {
            return [{ name, value: formatValue(read()) }];
          } catch {
            return []; // does not exist yet (let or const before their declaration)
          }
        });
        if (!variables.length) continue;
        // Still alive although its function ended or its block was left behind: a closure
        const remembered = !callStack.includes(scope.functionId) || (scope.isBlock && current !== scope.functionId);
        const owner = functions[scope.functionId];
        const label = remembered ? scope.label : owner === PROGRAM ? "global" : owner;
        const existing = groups.find((g) => g.label === label && g.remembered === remembered);
        if (existing) existing.variables.push(...variables);
        else groups.push({ label, remembered, variables });
      }
      const step: TraceStep = { line, stack: callStack.map((id) => functions[id]), groups, output: output.length };
      const last = steps[steps.length - 1];
      // A line that called nothing is a single step that already shows its result
      if (isEffect && last?.line === line && lastDepth === callStack.length) {
        steps[steps.length - 1] = step;
        return;
      }
      if (last && line !== 0 && JSON.stringify(last) === JSON.stringify(step)) return;
      steps.push(step);
      lastDepth = callStack.length;
    } finally {
      recording = false;
    }
  };

  const print = (...args: unknown[]) => {
    if (recording || output.length >= MAX_OUTPUT_LINES) return;
    recording = true;
    try {
      output.push(args.map(consoleText).join(" ").slice(0, 300));
    } finally {
      recording = false;
    }
  };

  // The instrumented code reaches these as globals. Indirect eval runs it as a real script,
  // so a visitor can declare any name (even `let console`) without clashing with a parameter.
  const scope = globalThis as any;
  const saved = { console: scope.console, __t: scope.__t, __d: scope.__d, __e: scope.__e, __s: scope.__s };
  Object.assign(scope, {
    console: { log: print, info: print, warn: print, error: print, debug: print },
    __t: (line: number, readers: Readers) => record(line, readers),
    __d: (line: number, readers: Readers) => record(line, readers, true),
    __e: (id: number) => callStack.push(id),
    __s: () => callStack.pop(),
  });

  let error: string | undefined;
  try {
    const run = eval;
    run(program.code);
  } catch (e) {
    if (e !== budget) error = errorText(e);
  } finally {
    Object.assign(scope, saved);
  }
  return { ok: true, steps, output, lines, truncated, error };
}
