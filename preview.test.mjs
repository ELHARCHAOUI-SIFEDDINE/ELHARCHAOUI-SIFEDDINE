// Run locally to test: node preview.test.mjs
// Generates dist/preview*.svg without needing a GitHub token or network access.

process.env.GH_USERNAME         = "ELHARCHAOUI-SIFEDDINE";
process.env.GH_TOKEN            = "fake-token-for-preview";
process.env.OUTPUT_PATH         = "dist/preview.svg";
process.env.CONTRIB_OUTPUT_PATH = "dist/preview-contrib-card.svg";
process.env.PROFILE_OUTPUT_PATH = "dist/preview-profile-card.svg";
process.env.WAVE_OUTPUT_PATH    = "dist/preview-contribution-wave.svg";
process.env.LEETCODE_OUTPUT_PATH = "dist/preview-leetcode-card.svg";
process.env.LEETCODE_USERNAME   = "HrSaif";

const COLORS = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];

function mockWeeks() {
  const weeks = [];
  const today = new Date("2026-08-11T00:00:00Z");
  for (let w = 0; w < 53; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const offsetDays = (52 - w) * 7 + (6 - d);
      const date = new Date(today.getTime() - offsetDays * 86400000);
      const seed  = (w * 7 + d) % 13;
      // keep the most recent ~9 days non-zero so the current-streak math has something to chew on
      const isRecent = offsetDays < 9;
      const count = isRecent ? (seed % 5) + 1 : seed === 0 ? 12 : seed < 3 ? 4 : seed < 7 ? 1 : 0;
      const level = count === 0 ? 0 : count < 2 ? 1 : count < 5 ? 2 : count < 10 ? 3 : 4;
      days.push({ date: date.toISOString().slice(0, 10), contributionCount: count, color: COLORS[level] });
    }
    weeks.push({ contributionDays: days });
  }
  return weeks;
}

const mockedWeeks = mockWeeks();
const totalContributions = mockedWeeks.flatMap(w => w.contributionDays).reduce((s, d) => s + d.contributionCount, 0);

const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opts) => {
  if (typeof url === "string" && url.includes("leetcode.com/graphql")) {
    return {
      ok: true,
      json: async () => ({
        data: {
          allQuestionsCount: [
            { difficulty: "All", count: 3400 },
            { difficulty: "Easy", count: 850 },
            { difficulty: "Medium", count: 1750 },
            { difficulty: "Hard", count: 800 },
          ],
          matchedUser: {
            username: "HrSaif",
            submitStatsGlobal: {
              acSubmissionNum: [
                { difficulty: "All", count: 312, submissions: 540 },
                { difficulty: "Easy", count: 150, submissions: 190 },
                { difficulty: "Medium", count: 130, submissions: 260 },
                { difficulty: "Hard", count: 32, submissions: 90 },
              ],
              totalSubmissionNum: [
                { difficulty: "All", count: 540, submissions: 700 },
                { difficulty: "Easy", count: 190, submissions: 220 },
                { difficulty: "Medium", count: 260, submissions: 320 },
                { difficulty: "Hard", count: 90, submissions: 160 },
              ],
            },
          },
        },
      }),
    };
  }
  // GitHub GraphQL: distinguish the profile-stats query from the contributions query
  const body = typeof opts?.body === "string" ? opts.body : "";
  if (body.includes("repositories(")) {
    return {
      ok: true,
      json: async () => ({
        data: {
          user: {
            contributionsCollection: {
              totalCommitContributions: 482,
              totalPullRequestContributions: 61,
              totalIssueContributions: 19,
            },
            repositories: {
              pageInfo: { hasNextPage: false, endCursor: null },
              nodes: [
                { stargazerCount: 14, languages: { edges: [
                  { size: 82000, node: { name: "Java", color: "#b07219" } },
                  { size: 21000, node: { name: "Dockerfile", color: "#384d54" } },
                ] } },
                { stargazerCount: 3, languages: { edges: [
                  { size: 40000, node: { name: "TypeScript", color: "#3178c6" } },
                  { size: 12000, node: { name: "CSS", color: "#563d7c" } },
                ] } },
                { stargazerCount: 0, languages: { edges: [
                  { size: 15000, node: { name: "JavaScript", color: "#f1e05a" } },
                ] } },
              ],
            },
          },
        },
      }),
    };
  }
  // GitHub GraphQL (contributions)
  return {
    ok: true,
    json: async () => ({
      data: {
        user: {
          contributionsCollection: {
            contributionCalendar: { totalContributions, weeks: mockedWeeks },
          },
        },
      },
    }),
  };
};

await import("./generate.mjs");

globalThis.fetch = realFetch;
