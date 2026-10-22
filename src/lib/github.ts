// Fetches public GitHub data at build time (no token needed).
// Any failure returns null so the page still builds and simply hides the stats.

export const GITHUB_USER = "moradoadrian";

export interface ContributionDay {
  date: string;
  level: number; // 0-4, GitHub's own intensity bucket
  count: number;
}

export interface GitHubData {
  publicRepos: number;
  followers: number;
  memberSince: number;
  totalStars: number;
  contributionsLastYear: number;
  topLanguages: { name: string; count: number }[];
  recentRepos: { name: string; url: string; language: string | null; pushedAt: string; description: string | null }[];
  weeks: ContributionDay[][];
}

const HEADERS = { "User-Agent": "camr-portfolio-build", Accept: "application/vnd.github+json" };

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json() as Promise<T>;
}

// The REST API has no contribution calendar without auth, so read the same public
// HTML fragment github.com renders on profiles.
async function getContributions(): Promise<{ total: number; weeks: ContributionDay[][] }> {
  const res = await fetch(`https://github.com/users/${GITHUB_USER}/contributions`, { headers: { "User-Agent": HEADERS["User-Agent"] } });
  if (!res.ok) throw new Error(`contributions -> ${res.status}`);
  const html = await res.text();

  const counts = new Map<string, number>();
  for (const m of html.matchAll(/<tool-tip[^>]*for="(contribution-day-component-\d+-\d+)"[^>]*>(\d+|No) contributions?/g)) {
    counts.set(m[1], m[2] === "No" ? 0 : Number(m[2]));
  }

  // Cell ids are contribution-day-component-{weekday}-{week}
  const weeks: ContributionDay[][] = [];
  for (const m of html.matchAll(/data-date="([\d-]+)"\s+id="(contribution-day-component-(\d+)-(\d+))"\s+data-level="(\d)"/g)) {
    const [, date, id, weekday, week] = m;
    (weeks[Number(week)] ??= [])[Number(weekday)] = { date, level: Number(m[5]), count: counts.get(id) ?? 0 };
  }

  const totalMatch = html.match(/([\d,]+)\s+contributions?\s+in the last year/);
  const total = totalMatch ? Number(totalMatch[1].replace(/,/g, "")) : [...counts.values()].reduce((a, b) => a + b, 0);
  return { total, weeks: weeks.filter(Boolean) };
}

let cache: Promise<GitHubData | null> | undefined;

export function getGitHubData(): Promise<GitHubData | null> {
  // One fetch per build (and per dev-server process) keeps us far under the 60 req/h anonymous limit
  cache ??= (async () => {
    try {
      const [user, repos, contributions] = await Promise.all([
        getJson<{ public_repos: number; followers: number; created_at: string }>(`https://api.github.com/users/${GITHUB_USER}`),
        getJson<{ name: string; html_url: string; language: string | null; pushed_at: string; description: string | null; fork: boolean; stargazers_count: number }[]>(
          `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`
        ),
        getContributions(),
      ]);

      const own = repos.filter((r) => !r.fork);
      const langCount = new Map<string, number>();
      for (const r of own) if (r.language) langCount.set(r.language, (langCount.get(r.language) ?? 0) + 1);

      return {
        publicRepos: user.public_repos,
        followers: user.followers,
        memberSince: new Date(user.created_at).getFullYear(),
        totalStars: own.reduce((sum, r) => sum + r.stargazers_count, 0),
        contributionsLastYear: contributions.total,
        topLanguages: [...langCount].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count })),
        recentRepos: own.slice(0, 4).map((r) => ({
          name: r.name,
          url: r.html_url,
          language: r.language,
          pushedAt: r.pushed_at,
          description: r.description,
        })),
        weeks: contributions.weeks,
      };
    } catch (err) {
      console.warn("[github] could not load data, stats will be hidden:", err);
      return null;
    }
  })();
  return cache;
}
