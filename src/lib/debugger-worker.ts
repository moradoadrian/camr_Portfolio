// Web Worker that traces the visitor's code away from the page: it has no DOM, and the page
// terminates it if the code never ends. One worker per run, so no state survives between runs.
import { trace } from "./debugger";

const post = self.postMessage.bind(self);

// A snippet in this panel has no reason to reach the network or the site's storage
for (const name of [
  "fetch", "XMLHttpRequest", "WebSocket", "WebTransport", "EventSource", "RTCPeerConnection",
  "importScripts", "Worker", "SharedWorker", "BroadcastChannel", "indexedDB", "caches", "cookieStore",
  "postMessage", "close", "onmessage",
]) {
  try {
    Object.defineProperty(self, name, { value: undefined, configurable: false, writable: false });
  } catch {
    // Not every worker scope lets every name be redefined
  }
}

self.addEventListener(
  "message",
  (event: MessageEvent<string>) => {
    post({ type: "started" }); // the page's timeout starts here, not while the worker downloads
    post({ type: "result", result: trace(event.data) });
  },
  { once: true }
);

post({ type: "ready" });
