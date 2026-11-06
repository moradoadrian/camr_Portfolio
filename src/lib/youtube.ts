// Reads the channel's public RSS feed at build time (no API key needed).
// Any failure falls back to a saved list so the page still builds with videos in it.

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

// Hard-coded rather than read from the feed, so the player stays up when the feed is down
const FEATURED_ID = "J_JxIvZd1CY";
export const FEATURED_SHORT = {
  id: FEATURED_ID,
  title: "API explicada fácil",
  url: `https://www.youtube.com/shorts/${FEATURED_ID}`,
  thumbnail: `https://i.ytimg.com/vi/${FEATURED_ID}/maxresdefault.jpg`,
};

const savedShort = (id: string, title: string, published: string): Short => ({
  id,
  title,
  url: `https://www.youtube.com/shorts/${id}`,
  thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  published,
});

// Used when the feed fails, so the grid survives a build during a YouTube outage.
// Saved by hand on 2026-11-06: videos uploaded later only show up through the feed.
const SAVED_SHORTS: Short[] = [
  savedShort(FEATURED_ID, "API explicada fácil", "2026-11-06"),
  savedShort("_zCHfgWdc0k", "React, Vue o Angular cual aprender primero?", "2026-11-06"),
  savedShort("8e6WVUXytQs", "Contar hacia atrás con un ciclo for", "2026-11-06"),
  savedShort("sxmSOX7jqE0", "Por que tu for da una vuelta de mas o de menos?", "2026-11-05"),
  savedShort("szEslk7au_8", "Que pasa en cada vuelta de un ciclo for?", "2026-11-05"),
  savedShort("cb3qC5klHHU", "El ciclo for en Javascript explicado fácil", "2026-11-05"),
];

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
      const shorts = parseShorts(await res.text());
      if (shorts.length === 0) throw new Error(`${FEED_URL} -> no shorts found`);
      return shorts;
    } catch (err) {
      console.warn("[youtube] could not load the feed, using the saved list of shorts:", err);
      return SAVED_SHORTS;
    }
  })();
  return cache.then((shorts) => shorts.slice(0, limit));
}
