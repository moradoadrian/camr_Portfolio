// Reads the channel's public RSS feed at build time (no API key needed).
// Any failure returns an empty list so the page still builds and simply hides the section.

export const YOUTUBE_URL = "https://www.youtube.com/@moradoadrian";
const CHANNEL_ID = "UCQSVO1M6wTYw6Dx34JQ5zGg";
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

export interface Short {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  published: string; // YYYY-MM-DD
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

function decode(text: string): string {
  return text.replace(/&(?:#(\d+)|#x([\da-f]+)|(\w+));/gi, (match, dec, hex, name) => {
    if (dec) return String.fromCodePoint(Number(dec));
    if (hex) return String.fromCodePoint(parseInt(hex, 16));
    return ENTITIES[name] ?? match;
  });
}

// The titles carry the hashtags YouTube needs; on the site they are just noise
export function cleanTitle(title: string): string {
  return decode(title).replace(/#[^\s#]+/g, "").replace(/\s+/g, " ").replace(/\s+\?/g, "?").trim();
}

// The feed mixes every upload. The channel also has gaming videos, and those are regular
// /watch links, so keeping only /shorts/ links leaves the programming videos.
export function parseShorts(xml: string): Short[] {
  const shorts: Short[] = [];
  for (const [, entry] of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const url = entry.match(/<link rel="alternate" href="([^"]+)"/)?.[1];
    const id = entry.match(/<yt:videoId>([^<]+)</)?.[1];
    const title = entry.match(/<title>([^<]*)</)?.[1];
    const thumbnail = entry.match(/<media:thumbnail url="([^"]+)"/)?.[1];
    const published = entry.match(/<published>([^<]+)</)?.[1];
    if (!url?.includes("/shorts/") || !id || !title || !thumbnail || !published) continue;
    shorts.push({ id, title: cleanTitle(title), url, thumbnail, published: published.slice(0, 10) });
  }
  return shorts;
}

let cache: Promise<Short[]> | undefined;

export function getLatestShorts(limit = 6): Promise<Short[]> {
  // One fetch per build (and per dev-server process)
  cache ??= (async () => {
    try {
      const res = await fetch(FEED_URL, { signal: AbortSignal.timeout(10_000) });
      if (!res.ok) throw new Error(`${FEED_URL} -> ${res.status}`);
      return parseShorts(await res.text());
    } catch (err) {
      console.warn("[youtube] could not load the feed, the videos section will be hidden:", err);
      return [];
    }
  })();
  return cache.then((shorts) => shorts.slice(0, limit));
}
