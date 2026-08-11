#!/usr/bin/env node
/**
 * Generates an animated "jet over contribution grid" SVG
 * using sifeddine-elharchaoui's REAL GitHub contribution calendar.
 * Run via GitHub Actions (jet-heatmap.yml) — updates daily.
 */

import fs from "node:fs";
import path from "node:path";

const USERNAME   = process.env.GH_USERNAME  || "sifeddine-elharchaoui";
const TOKEN      = process.env.GH_TOKEN     || process.env.GITHUB_TOKEN;
const OUTPUT     = process.env.OUTPUT_PATH  || "dist/github-jet.svg";
const COLS       = 34;
const ROWS       = 7;
const CELL       = 11;
const STEP       = 14;
const GRID_X     = 20;
const GRID_Y     = 15;
const WIDTH      = 513;
const HEIGHT     = 170;
const JET_X_START = 35;
const JET_X_END   = 478;
const LOOP_DUR    = 20;
const MAX_TARGETS = 12;
const FLASH_COLOR  = "#00ff88";
const BULLET_COLOR = "#00ffaa";
const BLAST_COLOR  = "#00cc6a";
const PAD_Y        = 128;

if (!TOKEN) { console.error("Missing GH_TOKEN / GITHUB_TOKEN env var"); process.exit(1); }

const QUERY = `
  query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          weeks {
            contributionDays {
              date contributionCount color
            }
          }
        }
      }
    }
  }
`;

async function fetchWeeks() {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: QUERY, variables: { login: USERNAME } }),
  });
  if (!res.ok) throw new Error(`GitHub API error ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data.user.contributionsCollection.contributionCalendar.weeks;
}

function buildCells(weeks) {
  const recent   = weeks.slice(-COLS);
  const padCount = COLS - recent.length;
  const padded   = Array.from({ length: padCount }, () => ({
    contributionDays: Array.from({ length: ROWS }, () => ({ contributionCount: 0, color: "#161b22", date: null })),
  })).concat(recent);

  const cells = [];
  padded.forEach((week, col) => {
    week.contributionDays.forEach((day, row) => {
      cells.push({ col, row, x: GRID_X + col * STEP, y: GRID_Y + row * STEP,
        color: day.color || "#161b22", count: day.contributionCount || 0, date: day.date });
    });
  });
  return cells;
}

function pickTargets(cells) {
  return [...cells].filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count).slice(0, MAX_TARGETS)
    .sort((a, b) => a.col - b.col || a.row - b.row);
}

function keyTimeForCol(col, direction) {
  const t = 0.02 + (col / (COLS - 1)) * 0.46;
  return direction === "forward" ? t : 1 - t;
}
const fmt = n => Number(n.toFixed(4));

function buildGrid(cells, targets) {
  const tk = new Set(targets.map(t => `${t.col}-${t.row}`));
  let svg = "";
  for (const c of cells) {
    if (!tk.has(`${c.col}-${c.row}`)) {
      svg += `<rect x="${c.x.toFixed(2)}" y="${c.y.toFixed(2)}" width="${CELL}" height="${CELL}" rx="2" ry="2" fill="${c.color}"/>\n`;
      continue;
    }
    const tF = keyTimeForCol(c.col, "forward");
    const tB = keyTimeForCol(c.col, "backward");
    const [t1, t2] = [Math.min(tF, tB), Math.max(tF, tB)];
    const dur = 0.006;
    svg += `<rect x="${c.x.toFixed(2)}" y="${c.y.toFixed(2)}" width="${CELL}" height="${CELL}" rx="2" ry="2" fill="${c.color}">` +
      `<animate attributeName="fill" dur="${LOOP_DUR}s" repeatCount="indefinite" ` +
      `keyTimes="0;${fmt(t1)};${fmt(t1+dur)};${fmt(t2)};${fmt(t2+dur)};1" ` +
      `values="${c.color};${c.color};${FLASH_COLOR};${c.color};${FLASH_COLOR};${c.color}"/></rect>\n`;
  }
  return svg;
}

function buildBulletsAndBlasts(targets) {
  let bullets = "", blasts = "";
  const dur = 0.006;
  for (const dir of ["forward", "backward"]) {
    const ordered = dir === "forward" ? targets : [...targets].reverse();
    for (const c of ordered) {
      const t      = keyTimeForCol(c.col, dir);
      const rise   = t - dur * 3;
      const arrive = t;
      const fadeEnd = t + dur;
      const cx     = fmt(c.x + CELL / 2);
      const targetY = fmt(c.y + CELL / 2);
      bullets += `<circle cx="${cx}" cy="${PAD_Y}" r="2.4" fill="${BULLET_COLOR}">` +
        `<animate attributeName="cy" dur="${LOOP_DUR}s" repeatCount="indefinite" ` +
        `keyTimes="0;${fmt(rise)};${fmt(arrive)};1" values="${PAD_Y};${PAD_Y};${targetY};${targetY}"/>` +
        `<animate attributeName="opacity" dur="${LOOP_DUR}s" repeatCount="indefinite" ` +
        `keyTimes="0;${fmt(rise)};${fmt(arrive)};${fmt(fadeEnd)};1" values="0;1;1;0;0"/></circle>\n`;
      blasts += `<circle cx="${cx}" cy="${targetY}" r="0" fill="none" stroke="${BLAST_COLOR}" stroke-width="1.6" opacity="0">` +
        `<animate attributeName="r" dur="${LOOP_DUR}s" repeatCount="indefinite" ` +
        `keyTimes="0;${fmt(arrive)};${fmt(arrive+dur*3)};1" values="0;1;9;9"/>` +
        `<animate attributeName="opacity" dur="${LOOP_DUR}s" repeatCount="indefinite" ` +
        `keyTimes="0;${fmt(arrive)};${fmt(arrive+dur*3)};1" values="0;1;1;0"/></circle>\n`;
    }
  }
  return { bullets, blasts };
}

function buildStars() {
  return [[8,20,1.2],[8,60,1.6],[8,100,2.0],[505,25,1.2],[505,70,1.6],[505,110,2.0],[30,164,1.2],[483,164,1.6]]
    .map(([x,y,dur]) => `<circle cx="${x}" cy="${y}" r="1.1" fill="#00ff8844"><animate attributeName="opacity" values="0.2;1;0.2" dur="${dur}s" repeatCount="indefinite"/></circle>`)
    .join("\n");
}

function buildJet() {
  return `<g id="jet">
  <g transform="translate(0,0)">
    <polygon points="0,-16 8,6 4,3 -4,3 -8,6" fill="#00ff88" stroke="#00cc6a" stroke-width="1"/>
    <polygon points="-8,6 -14,12 -4,7" fill="#00cc6a"/>
    <polygon points="8,6 14,12 4,7" fill="#00cc6a"/>
    <circle cx="0" cy="-6" r="2.2" fill="#afffdf"/>
    <polygon points="-3,7 3,7 0,15" fill="#ff4466">
      <animate attributeName="opacity" values="0.5;1;0.6;1" dur="0.18s" repeatCount="indefinite"/>
    </polygon>
  </g>
  <animateTransform attributeName="transform" attributeType="XML" type="translate"
    dur="${LOOP_DUR}s" repeatCount="indefinite"
    keyTimes="0;0.5;1"
    values="${JET_X_START},140;${JET_X_END},140;${JET_X_START},140"/>
</g>`;
}

function buildSvg(weeks) {
  const cells   = buildCells(weeks);
  const targets = pickTargets(cells);
  const { bullets, blasts } = buildBulletsAndBlasts(targets);
  return `<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="#0d1117"/>
${buildStars()}
<g id="grid">\n${buildGrid(cells, targets)}</g>
<g id="bullets">\n${bullets}</g>
<g id="blasts">\n${blasts}</g>
${buildJet()}
</svg>`;
}

async function main() {
  console.log(`Fetching contributions for ${USERNAME}...`);
  const weeks = await fetchWeeks();
  const svg   = buildSvg(weeks);
  const out   = path.resolve(OUTPUT);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, svg, "utf8");
  console.log(`Wrote ${out}`);
}

main().catch(err => { console.error(err); process.exit(1); });
