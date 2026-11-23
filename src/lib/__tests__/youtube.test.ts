import { describe, it, expect } from "vitest";
import { cleanTitle, parseShorts } from "../youtube";

describe("youtube utilities", () => {
  it("strips hashtags and decodes HTML entities in titles", () => {
    expect(cleanTitle("API explicada f&aacute;cil #programming #js")).toBe("API explicada f&aacute;cil");
    expect(cleanTitle("React &amp; Angular &#39;2026&#39; #webdev #shorts ?")).toBe("React & Angular '2026'?");
  });

  it("parses only /shorts/ entries from an Atom RSS XML feed", () => {
    const sampleXml = `
      <feed>
        <entry>
          <yt:videoId>abc123</yt:videoId>
          <title>Ciclo for en JS #javascript</title>
          <link rel="alternate" href="https://www.youtube.com/shorts/abc123"/>
          <media:thumbnail url="https://i.ytimg.com/vi/abc123/hqdefault.jpg"/>
          <published>2026-11-06T18:00:00+00:00</published>
        </entry>
        <entry>
          <yt:videoId>gaming99</yt:videoId>
          <title>Gameplay regular video</title>
          <link rel="alternate" href="https://www.youtube.com/watch?v=gaming99"/>
          <media:thumbnail url="https://i.ytimg.com/vi/gaming99/hqdefault.jpg"/>
          <published>2026-11-05T18:00:00+00:00</published>
        </entry>
      </feed>
    `;

    const shorts = parseShorts(sampleXml);
    expect(shorts).toHaveLength(1);
    expect(shorts[0]).toEqual({
      id: "abc123",
      title: "Ciclo for en JS",
      url: "https://www.youtube.com/shorts/abc123",
      thumbnail: "https://i.ytimg.com/vi/abc123/hqdefault.jpg",
      published: "2026-11-06",
    });
  });
});
