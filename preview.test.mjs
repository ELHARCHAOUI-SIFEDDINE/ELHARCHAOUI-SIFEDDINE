// Run locally to test: node preview.test.mjs
// Generates dist/preview.svg without needing a GitHub token

process.env.GH_USERNAME  = "sifeddine-elharchaoui";
process.env.GH_TOKEN     = "fake-token-for-preview";
process.env.OUTPUT_PATH  = "dist/preview.svg";

const COLORS = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];

function mockWeeks() {
  const weeks = [];
  for (let w = 0; w < 34; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const seed  = (w * 7 + d) % 13;
      const count = seed === 0 ? 12 : seed < 3 ? 4 : seed < 7 ? 1 : 0;
      const level = count === 0 ? 0 : count < 2 ? 1 : count < 5 ? 2 : count < 10 ? 3 : 4;
      days.push({ date: `2026-W${w}-${d}`, contributionCount: count, color: COLORS[level] });
    }
    weeks.push({ contributionDays: days });
  }
  return weeks;
}

globalThis.fetch = async () => ({
  ok: true,
  json: async () => ({
    data: { user: { contributionsCollection: { contributionCalendar: { weeks: mockWeeks() } } } },
  }),
});

await import("./generate.mjs");
