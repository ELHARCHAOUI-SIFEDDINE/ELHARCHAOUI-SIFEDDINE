#!/usr/bin/env node
/**
 * Generates animated terminal-themed SVGs for the profile README:
 *   - dist/github-jet.svg           "jet over contribution grid"
 *   - dist/github-contrib-card.svg  contribution/streak stat panel
 *   - dist/github-profile-card.svg  stars/commits/PRs + top-language breakdown
 *   - dist/contribution-wave.svg    animated weekly contribution wave chart
 *   - dist/leetcode-card.svg        LeetCode solved/acceptance panel
 * All using ELHARCHAOUI-SIFEDDINE's REAL GitHub contribution calendar
 * and HrSaif's public LeetCode stats. Run via GitHub Actions
 * (jet-heatmap.yml) — updates daily.
 */

import fs from "node:fs";
import path from "node:path";

const USERNAME         = process.env.GH_USERNAME         || "ELHARCHAOUI-SIFEDDINE";
const TOKEN            = process.env.GH_TOKEN            || process.env.GITHUB_TOKEN;
const OUTPUT           = process.env.OUTPUT_PATH         || "dist/github-jet.svg";
const CONTRIB_OUTPUT   = process.env.CONTRIB_OUTPUT_PATH || "dist/github-contrib-card.svg";
const PROFILE_OUTPUT   = process.env.PROFILE_OUTPUT_PATH || "dist/github-profile-card.svg";
const WAVE_OUTPUT      = process.env.WAVE_OUTPUT_PATH    || "dist/contribution-wave.svg";
const LEETCODE_OUTPUT  = process.env.LEETCODE_OUTPUT_PATH || "dist/leetcode-card.svg";
const LEETCODE_USERNAME = process.env.LEETCODE_USERNAME  || "HrSaif";
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
          totalContributions
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

async function fetchContributions() {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: QUERY, variables: { login: USERNAME } }),
  });
  if (!res.ok) throw new Error(`GitHub API error ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  const calendar = json.data.user.contributionsCollection.contributionCalendar;
  return { weeks: calendar.weeks, totalContributions: calendar.totalContributions };
}

/* ------------------------------------------------------------------ */
/* Profile stats: stars, commits/PRs, top languages                    */
/* ------------------------------------------------------------------ */

const PROFILE_QUERY = `
  query($login: String!, $after: String) {
    user(login: $login) {
      contributionsCollection {
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
      }
      repositories(first: 50, after: $after, ownerAffiliation: OWNER, isFork: false, privacy: PUBLIC) {
        pageInfo { hasNextPage endCursor }
        nodes {
          stargazerCount
          languages(first: 8, orderBy: { field: SIZE, direction: DESC }) {
            edges { size node { name color } }
          }
        }
      }
    }
  }
`;

async function fetchProfileStats() {
  let after = null, stars = 0, commits = 0, prs = 0, issues = 0, page = 0;
  const langBytes = new Map(); // name -> { size, color }

  for (;;) {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { Authorization: `bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: PROFILE_QUERY, variables: { login: USERNAME, after } }),
    });
    if (!res.ok) throw new Error(`GitHub API error ${res.status}: ${await res.text()}`);
    const json = await res.json();
    if (json.errors) throw new Error(JSON.stringify(json.errors));
    const user = json.data.user;

    if (page === 0) {
      commits = user.contributionsCollection.totalCommitContributions;
      prs     = user.contributionsCollection.totalPullRequestContributions;
      issues  = user.contributionsCollection.totalIssueContributions;
    }
    for (const repo of user.repositories.nodes) {
      stars += repo.stargazerCount;
      for (const edge of repo.languages.edges) {
        const prev = langBytes.get(edge.node.name) || { size: 0, color: edge.node.color || "#8b949e" };
        prev.size += edge.size;
        langBytes.set(edge.node.name, prev);
      }
    }

    const pageInfo = user.repositories.pageInfo;
    page++;
    if (!pageInfo.hasNextPage || page >= 4) break; // cap at ~200 repos
    after = pageInfo.endCursor;
  }

  const totalBytes = [...langBytes.values()].reduce((s, l) => s + l.size, 0);
  const languages = [...langBytes.entries()]
    .sort((a, b) => b[1].size - a[1].size)
    .slice(0, 5)
    .map(([name, l]) => ({ name, color: l.color, pct: totalBytes > 0 ? (l.size / totalBytes) * 100 : 0 }));
  const otherPct = Math.max(0, 100 - languages.reduce((s, l) => s + l.pct, 0));

  return { stars, commits, prs, issues, languages, otherPct };
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

// Catmull-Rom -> cubic Bezier smoothing (tension 1/6) for a smooth wave curve
// through an arbitrary set of {x,y} points.
function smoothPath(points) {
  if (points.length < 2) return "";
  let d = `M ${fmt(points[0].x)},${fmt(points[0].y)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${fmt(cp1x)},${fmt(cp1y)} ${fmt(cp2x)},${fmt(cp2y)} ${fmt(p2.x)},${fmt(p2.y)}`;
  }
  return d;
}

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

/* ------------------------------------------------------------------ */
/* Streak / contribution stats                                         */
/* ------------------------------------------------------------------ */

const WEEKDAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function computeStreaks(weeks, totalContributions) {
  const days = weeks
    .flatMap(w => w.contributionDays)
    .filter(d => d.date)
    .sort((a, b) => a.date.localeCompare(b.date));

  let longest = 0, run = 0;
  for (const d of days) {
    if (d.contributionCount > 0) { run++; longest = Math.max(longest, run); }
    else run = 0;
  }

  // Current streak: count backward from the most recent day. If the most
  // recent day itself has no contributions yet (the day isn't over), start
  // from the day before it instead of zeroing out the streak.
  let idx = days.length - 1;
  if (idx >= 0 && days[idx].contributionCount === 0) idx--;
  let current = 0;
  while (idx >= 0 && days[idx].contributionCount > 0) { current++; idx--; }

  const weekdayTotals = [0, 0, 0, 0, 0, 0, 0];
  for (const d of days) weekdayTotals[new Date(d.date).getUTCDay()] += d.contributionCount;
  let bestIdx = 0;
  for (let i = 1; i < 7; i++) if (weekdayTotals[i] > weekdayTotals[bestIdx]) bestIdx = i;

  const total = totalContributions ?? days.reduce((s, d) => s + d.contributionCount, 0);

  return {
    total,
    current,
    longest,
    bestWeekday: WEEKDAY_ABBR[bestIdx],
    bestWeekdayCount: weekdayTotals[bestIdx],
    recentDays: days.slice(-40),
  };
}

/* ------------------------------------------------------------------ */
/* LeetCode stats                                                      */
/* ------------------------------------------------------------------ */

const LEETCODE_QUERY = `
  query getUserProfile($username: String!) {
    allQuestionsCount { difficulty count }
    matchedUser(username: $username) {
      username
      submitStatsGlobal {
        acSubmissionNum { difficulty count submissions }
        totalSubmissionNum { difficulty count submissions }
      }
    }
  }
`;

async function fetchLeetCodeStats(username) {
  const res = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (readme-stat-card-generator)",
      Referer: `https://leetcode.com/${username}/`,
    },
    body: JSON.stringify({ query: LEETCODE_QUERY, variables: { username } }),
  });
  if (!res.ok) throw new Error(`LeetCode API error ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  const user = json.data.matchedUser;
  if (!user) throw new Error(`LeetCode user not found: ${username}`);

  const ac    = Object.fromEntries(user.submitStatsGlobal.acSubmissionNum.map(x => [x.difficulty, x]));
  const total = Object.fromEntries(user.submitStatsGlobal.totalSubmissionNum.map(x => [x.difficulty, x]));
  const allQ  = Object.fromEntries(json.data.allQuestionsCount.map(x => [x.difficulty, x.count]));

  const acAll  = total.All?.submissions ? (ac.All?.submissions || 0) : 0;
  const totAll = total.All?.submissions || 0;
  const acceptance = totAll > 0 ? (acAll / totAll) * 100 : 0;

  return {
    username,
    easy:   ac.Easy?.count   || 0, easyTotal:   allQ.Easy   || 0,
    medium: ac.Medium?.count || 0, mediumTotal: allQ.Medium || 0,
    hard:   ac.Hard?.count   || 0, hardTotal:   allQ.Hard   || 0,
    solved: ac.All?.count    || 0, allTotal:    allQ.All    || 0,
    acceptance,
  };
}

/* ------------------------------------------------------------------ */
/* Shared terminal-card chrome (palette matches assets/terminal-dark)  */
/* ------------------------------------------------------------------ */

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fmtNum = n => Number(n).toLocaleString("en-US");

function titlebar({ w, id, label, dotR = 3.4, barH = 22 }) {
  const barY = barH / 2 + 3;
  const dotX = barY + 12; // first dot sits one bar-radius plus a small margin from the left edge
  return `<g id="titlebar${id}">
  <rect x="3" y="3" width="${w - 6}" height="${barH}" rx="${barH / 2}" fill="#0B1120" fill-opacity="0.85"/>
  <circle cx="${dotX}" cy="${barY}" r="${dotR}" fill="#EF4444"><animate attributeName="opacity" values="1;0.55;1" dur="4s" repeatCount="indefinite"/></circle>
  <circle cx="${dotX + 12}" cy="${barY}" r="${dotR}" fill="#F59E0B"><animate attributeName="opacity" values="1;0.55;1" dur="4s" begin="0.3s" repeatCount="indefinite"/></circle>
  <circle cx="${dotX + 24}" cy="${barY}" r="${dotR}" fill="#00ff88"><animate attributeName="opacity" values="1;0.55;1" dur="4s" begin="0.6s" repeatCount="indefinite"/></circle>
  <text x="${w / 2}" y="${barY + 3.5}" text-anchor="middle" class="term">${esc(label)}</text>
  <circle cx="${w - 58}" cy="${barY}" r="${dotR - 0.4}" fill="#00ff88"><animate attributeName="opacity" values="1;0.15;1" dur="1.1s" repeatCount="indefinite"/></circle>
  <text x="${w - 50}" y="${barY + 3}" class="scan">LIVE</text>
</g>`;
}

function borderFrame({ w, h, id, rx = 14 }) {
  return `<rect x="3" y="3" width="${w - 6}" height="${h - 6}" rx="${rx}" fill="none" stroke="url(#borderGrad${id})" stroke-width="2" opacity="0.8">
  <animate attributeName="opacity" values="0.5;0.95;0.5" dur="3.2s" repeatCount="indefinite"/>
</rect>`;
}

function scanSweep({ w, h, id }) {
  return `<rect x="0" y="-40" width="${w}" height="40" fill="url(#scanGrad${id})" opacity="0.6" style="mix-blend-mode:screen">
  <animateTransform attributeName="transform" type="translate" from="0 -40" to="0 ${h + 40}" dur="4.2s" repeatCount="indefinite"/>
</rect>`;
}

function sharedDefs(id) {
  return `<radialGradient id="bgGlow${id}" cx="30%" cy="20%" r="80%">
    <stop offset="0%" stop-color="#0B1120"/>
    <stop offset="100%" stop-color="#050816"/>
  </radialGradient>
  <linearGradient id="borderGrad${id}" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#00ff88"/>
    <stop offset="50%" stop-color="#00cc6a"/>
    <stop offset="100%" stop-color="#009944"/>
  </linearGradient>
  <linearGradient id="scanGrad${id}" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#00ff88" stop-opacity="0"/>
    <stop offset="45%" stop-color="#00ff88" stop-opacity="0.05"/>
    <stop offset="50%" stop-color="#00ffaa" stop-opacity="0.65"/>
    <stop offset="55%" stop-color="#00ff88" stop-opacity="0.05"/>
    <stop offset="100%" stop-color="#00cc6a" stop-opacity="0"/>
  </linearGradient>
  <pattern id="scanlines${id}" width="4" height="4" patternUnits="userSpaceOnUse">
    <rect width="4" height="1" fill="#00ff88" opacity="0.03"/>
  </pattern>
  <filter id="glow${id}" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur stdDeviation="2.1" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;
}

/* ------------------------------------------------------------------ */
/* Contribution / streak card                                          */
/* ------------------------------------------------------------------ */

const CC_W = 494, CC_H = 195;

function buildContribCard(streaks) {
  const { total, current, longest, bestWeekday, bestWeekdayCount, recentDays } = streaks;

  const cellSize = 8, gap = 2.5, startX = 18, startY = 165;
  const heat = recentDays.map((d, i) =>
    `<rect x="${(startX + i * (cellSize + gap)).toFixed(2)}" y="${startY}" width="${cellSize}" height="${cellSize}" rx="1.5" fill="${d.color || "#161b22"}"/>`
  ).join("\n");

  return `<svg viewBox="0 0 ${CC_W} ${CC_H}" xmlns="http://www.w3.org/2000/svg">
<defs>
  ${sharedDefs("CC")}
  <style>
    .term    { font-family: 'Courier New', Consolas, monospace; font-size: 9px; fill: #64748B; letter-spacing: 0.5px; }
    .scan    { font-family: 'Courier New', Consolas, monospace; font-size: 7.5px; fill: #00ff88; letter-spacing: 1px; }
    .title   { font-family: 'Courier New', Consolas, monospace; font-size: 10px; fill: #00ff88; letter-spacing: 2px; opacity: 0.75; }
    .label   { font-family: 'Courier New', Consolas, monospace; font-size: 9px; fill: #64748B; letter-spacing: 0.8px; }
    .key     { font-family: 'Courier New', Consolas, monospace; font-size: 12px; fill: #00ff88; font-weight: bold; }
    .value   { font-family: 'Courier New', Consolas, monospace; font-size: 13px; fill: #E5E7EB; }
    .big     { font-family: 'Courier New', Consolas, monospace; font-size: 28px; fill: #00ff88; font-weight: bold; }
    .flame   { font-family: 'Courier New', Consolas, monospace; font-size: 20px; fill: #ff4466; font-weight: bold; }
  </style>
</defs>
<rect width="${CC_W}" height="${CC_H}" rx="14" fill="url(#bgGlowCC)"/>
<rect width="${CC_W}" height="${CC_H}" rx="14" fill="url(#scanlinesCC)"/>
${titlebar({ w: CC_W, id: "CC", label: "sif@devos ~ % ./contrib.sh --live" })}
<text x="18" y="43" class="title">GITHUB.CONTRIBUTIONS</text>

<text x="18" y="76" class="big" filter="url(#glowCC)">${fmtNum(total)}</text>
<text x="18" y="90" class="label">TOTAL CONTRIBUTIONS (1Y)</text>

<g transform="translate(262,50)">
  <path d="M9 0c-1 3-4 4-4 8a5 5 0 0 0 10 0c0-2-1-3-2-4 0 2-1 3-2 2-1-1 0-3-2-6z" fill="#ff4466" filter="url(#glowCC)">
    <animate attributeName="opacity" values="0.65;1;0.65" dur="1.4s" repeatCount="indefinite"/>
  </path>
  <text x="20" y="10" class="flame">${current} DAY${current === 1 ? "" : "S"}</text>
  <text x="0" y="24" class="label">CURRENT STREAK</text>
</g>

<text x="18" y="122" class="key">LONGEST</text>
<text x="18" y="138" class="value">${longest} day${longest === 1 ? "" : "s"}</text>

<text x="262" y="122" class="key">BEST DAY</text>
<text x="262" y="138" class="value">${bestWeekday} &#183; ${fmtNum(bestWeekdayCount)}</text>

<line x1="18" y1="149" x2="476" y2="149" stroke="#1f2937" stroke-width="1"/>
<text x="18" y="161" class="label">LAST 40 DAYS</text>
<g>
${heat}
</g>

${scanSweep({ w: CC_W, h: CC_H, id: "CC" })}
${borderFrame({ w: CC_W, h: CC_H, id: "CC", rx: 12 })}
</svg>`;
}

/* ------------------------------------------------------------------ */
/* Profile card: stars / commits / PRs / top languages                 */
/* ------------------------------------------------------------------ */

const PC_W = 494, PC_H = 195;

function buildProfileCard(stats) {
  const { stars, commits, prs, languages, otherPct } = stats;

  const barX = 18, barW = 458, barY = 142, barH = 10;
  let segX = barX;
  let segs = "";
  for (const l of languages) {
    const segW = fmt((l.pct / 100) * barW);
    segs += `<rect x="${fmt(segX)}" y="${barY}" width="${segW}" height="${barH}" fill="${l.color}"/>`;
    segX += segW;
  }
  if (otherPct > 0.5) {
    const segW = fmt((otherPct / 100) * barW);
    segs += `<rect x="${fmt(segX)}" y="${barY}" width="${segW}" height="${barH}" fill="#334155"/>`;
  }

  const legend = languages.map((l, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const cx = 18 + col * 150, ty = 165 + row * 14;
    return `<circle cx="${cx}" cy="${ty - 3}" r="3" fill="${l.color}"/>` +
      `<text x="${cx + 8}" y="${ty}" class="lang">${esc(l.name)} ${l.pct.toFixed(0)}%</text>`;
  }).join("\n");

  return `<svg viewBox="0 0 ${PC_W} ${PC_H}" xmlns="http://www.w3.org/2000/svg">
<defs>
  ${sharedDefs("PC")}
  <style>
    .term    { font-family: 'Courier New', Consolas, monospace; font-size: 9px; fill: #64748B; letter-spacing: 0.5px; }
    .scan    { font-family: 'Courier New', Consolas, monospace; font-size: 7.5px; fill: #00ff88; letter-spacing: 1px; }
    .title   { font-family: 'Courier New', Consolas, monospace; font-size: 10px; fill: #00ff88; letter-spacing: 2px; opacity: 0.75; }
    .label   { font-family: 'Courier New', Consolas, monospace; font-size: 9px; fill: #64748B; letter-spacing: 0.8px; }
    .key     { font-family: 'Courier New', Consolas, monospace; font-size: 18px; fill: #00ff88; font-weight: bold; }
    .big     { font-family: 'Courier New', Consolas, monospace; font-size: 28px; fill: #00ff88; font-weight: bold; }
    .lang    { font-family: 'Courier New', Consolas, monospace; font-size: 9px; fill: #E5E7EB; }
  </style>
</defs>
<rect width="${PC_W}" height="${PC_H}" rx="14" fill="url(#bgGlowPC)"/>
<rect width="${PC_W}" height="${PC_H}" rx="14" fill="url(#scanlinesPC)"/>
${titlebar({ w: PC_W, id: "PC", label: "sif@devos ~ % ./profile.sh --stats" })}
<text x="18" y="43" class="title">GITHUB.PROFILE</text>

<text x="18" y="76" class="big" filter="url(#glowPC)">&#9733; ${fmtNum(stars)}</text>
<text x="18" y="90" class="label">STARS EARNED</text>

<text x="262" y="60" class="label">COMMITS (1Y)</text>
<text x="262" y="79" class="key">${fmtNum(commits)}</text>
<text x="262" y="100" class="label">PULL REQUESTS (1Y)</text>
<text x="262" y="119" class="key">${fmtNum(prs)}</text>

<line x1="18" y1="124" x2="476" y2="124" stroke="#1f2937" stroke-width="1"/>
<text x="18" y="136" class="label">TOP LANGUAGES</text>
<rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" rx="5" fill="#0B1120"/>
${segs}
${legend}

${scanSweep({ w: PC_W, h: PC_H, id: "PC" })}
${borderFrame({ w: PC_W, h: PC_H, id: "PC", rx: 12 })}
</svg>`;
}

/* ------------------------------------------------------------------ */
/* Contribution wave: animated weekly-total wave chart                 */
/* ------------------------------------------------------------------ */

const WV_W = 1180, WV_H = 260;

function buildContributionWave(weeks) {
  const totals = weeks.map(w => w.contributionDays.reduce((s, d) => s + (d.contributionCount || 0), 0));
  const n = totals.length;
  const max = Math.max(1, ...totals);
  const padL = 40, padR = 40, padT = 70, padB = 46;
  const plotW = WV_W - padL - padR;
  const baseline = WV_H - padB;

  const points = totals.map((c, i) => ({
    x: padL + (n > 1 ? i * (plotW / (n - 1)) : 0),
    y: baseline - (c / max) * (baseline - padT),
    c,
  }));

  const linePath = smoothPath(points);
  const last = points[n - 1];
  const areaPath = `${linePath} L ${fmt(last.x)},${baseline} L ${fmt(points[0].x)},${baseline} Z`;

  const ticks = [];
  for (let i = 0; i < n; i += 8) {
    const day = weeks[i].contributionDays.find(d => d.date);
    if (day) ticks.push({ x: points[i].x, label: new Date(day.date).toLocaleString("en-US", { month: "short", timeZone: "UTC" }) });
  }

  return `<svg viewBox="0 0 ${WV_W} ${WV_H}" xmlns="http://www.w3.org/2000/svg">
<defs>
  ${sharedDefs("WV")}
  <linearGradient id="areaFillWV" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#00ff88" stop-opacity="0.35"/>
    <stop offset="100%" stop-color="#00ff88" stop-opacity="0"/>
  </linearGradient>
  <clipPath id="waveRevealWV">
    <rect x="0" y="0" width="0" height="${WV_H}">
      <animate attributeName="width" from="0" to="${WV_W}" dur="2.4s" begin="0.3s" fill="freeze" calcMode="spline" keySplines="0.25 0.1 0.25 1"/>
    </rect>
  </clipPath>
  <style>
    .term  { font-family: 'Courier New', Consolas, monospace; font-size: 11px; fill: #64748B; letter-spacing: 0.5px; }
    .scan  { font-family: 'Courier New', Consolas, monospace; font-size: 9px; fill: #00ff88; letter-spacing: 1px; }
    .title { font-family: 'Courier New', Consolas, monospace; font-size: 12px; fill: #00ff88; letter-spacing: 2px; opacity: 0.75; }
    .tick  { font-family: 'Courier New', Consolas, monospace; font-size: 9px; fill: #475569; }
    .cur   { font-family: 'Courier New', Consolas, monospace; font-size: 11px; fill: #ff4466; font-weight: bold; }
  </style>
</defs>
<rect width="${WV_W}" height="${WV_H}" rx="16" fill="url(#bgGlowWV)"/>
<rect width="${WV_W}" height="${WV_H}" rx="16" fill="url(#scanlinesWV)"/>
${titlebar({ w: WV_W, id: "WV", label: "sif@devos ~ % ./contribution-wave.sh --live", dotR: 4.5, barH: 30 })}
<text x="30" y="60" class="title">CONTRIBUTION.WAVE &#183; 52 WEEKS</text>

<g stroke="#1f2937" stroke-width="1">
  <line x1="${padL}" y1="${padT}" x2="${WV_W - padR}" y2="${padT}" opacity="0.4"/>
  <line x1="${padL}" y1="${fmt((padT + baseline) / 2)}" x2="${WV_W - padR}" y2="${fmt((padT + baseline) / 2)}" opacity="0.4"/>
  <line x1="${padL}" y1="${baseline}" x2="${WV_W - padR}" y2="${baseline}" opacity="0.6"/>
</g>

<g clip-path="url(#waveRevealWV)">
  <path d="${areaPath}" fill="url(#areaFillWV)"/>
  <path d="${linePath}" fill="none" stroke="url(#borderGradWV)" stroke-width="2.5" filter="url(#glowWV)"/>
</g>

<circle cx="${fmt(last.x)}" cy="${fmt(last.y)}" r="4" fill="#00ff88" filter="url(#glowWV)">
  <animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite"/>
</circle>
<text x="${fmt(last.x)}" y="${fmt(last.y - 12)}" text-anchor="end" class="cur">${last.c} this wk</text>

${ticks.map(t => `<text x="${fmt(t.x)}" y="${baseline + 18}" text-anchor="middle" class="tick">${t.label}</text>`).join("\n")}

${scanSweep({ w: WV_W, h: WV_H, id: "WV" })}
${borderFrame({ w: WV_W, h: WV_H, id: "WV", rx: 16 })}
</svg>`;
}

/* ------------------------------------------------------------------ */
/* LeetCode card                                                       */
/* ------------------------------------------------------------------ */

const LC_W = 1180, LC_H = 230;
const DIFF_COLOR = { Easy: "#00ff88", Medium: "#F59E0B", Hard: "#EF4444" };

function progressRow({ label, value, target, color, y, begin }) {
  const barX = 430, barW = 500, barH = 14;
  const countX = barX + barW + 20;   // "1,234 / 5,678"
  const pctX   = 1155;               // right-aligned, clears the 1180-wide viewBox
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  const fillW = fmt((pct / 100) * barW);
  return `<text x="300" y="${y + 5}" class="key" fill="${color}">${esc(label.toUpperCase())}</text>
<rect x="${barX}" y="${y - 7}" width="${barW}" height="${barH}" rx="7" fill="#0B1120" stroke="#1f2937"/>
<rect x="${barX}" y="${y - 7}" width="0" height="${barH}" rx="7" fill="${color}">
  <animate attributeName="width" from="0" to="${fillW}" dur="1.1s" begin="${begin}s" fill="freeze" calcMode="spline" keySplines="0.25 0.1 0.25 1"/>
</rect>
<text x="${countX}" y="${y + 5}" class="value">${fmtNum(value)} / ${fmtNum(target)}</text>
<text x="${pctX}" y="${y + 5}" text-anchor="end" class="key" fill="${color}">${pct.toFixed(1)}%</text>`;
}

function buildLeetCodeCard(stats) {
  const { username, easy, easyTotal, medium, mediumTotal, hard, hardTotal, solved, allTotal, acceptance } = stats;

  const r = 50, cx = 170, cy = 128;
  const circumference = fmt(2 * Math.PI * r);
  const solvedPct = allTotal > 0 ? solved / allTotal : 0;
  const dashOffset = fmt(circumference * (1 - solvedPct));

  return `<svg viewBox="0 0 ${LC_W} ${LC_H}" xmlns="http://www.w3.org/2000/svg">
<defs>
  ${sharedDefs("LC")}
  <style>
    .term    { font-family: 'Courier New', Consolas, monospace; font-size: 11px; fill: #64748B; letter-spacing: 0.5px; }
    .scan    { font-family: 'Courier New', Consolas, monospace; font-size: 9px; fill: #00ff88; letter-spacing: 1px; }
    .title   { font-family: 'Courier New', Consolas, monospace; font-size: 12px; fill: #00ff88; letter-spacing: 2px; opacity: 0.75; }
    .label   { font-family: 'Courier New', Consolas, monospace; font-size: 10px; fill: #64748B; letter-spacing: 0.8px; }
    .key     { font-family: 'Courier New', Consolas, monospace; font-size: 13px; fill: #00ff88; font-weight: bold; }
    .value   { font-family: 'Courier New', Consolas, monospace; font-size: 13px; fill: #E5E7EB; }
    .big     { font-family: 'Courier New', Consolas, monospace; font-size: 34px; fill: #00ff88; font-weight: bold; }
    .accent  { font-family: 'Courier New', Consolas, monospace; font-size: 13px; fill: #00cc6a; font-weight: bold; }
  </style>
</defs>
<rect width="${LC_W}" height="${LC_H}" rx="16" fill="url(#bgGlowLC)"/>
<rect width="${LC_W}" height="${LC_H}" rx="16" fill="url(#scanlinesLC)"/>
${titlebar({ w: LC_W, id: "LC", label: `sif@devos ~ % ./leetcode.sh --user ${username}`, dotR: 4.5, barH: 30 })}

<text x="30" y="60" class="title">LEETCODE.STATS</text>

<g transform="translate(0,10)">
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#1f2937" stroke-width="10"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="url(#borderGradLC)" stroke-width="10" stroke-linecap="round"
    stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}" transform="rotate(-90 ${cx} ${cy})" filter="url(#glowLC)">
    <animate attributeName="stroke-dashoffset" from="${circumference}" to="${dashOffset}" dur="1.4s" begin="0.3s" fill="freeze" calcMode="spline" keySplines="0.25 0.1 0.25 1"/>
  </circle>
  <text x="${cx}" y="${cy - 4}" text-anchor="middle" class="big">${fmtNum(solved)}</text>
  <text x="${cx}" y="${cy + 16}" text-anchor="middle" class="label">SOLVED</text>
  <text x="${cx}" y="${cy + 68}" text-anchor="middle" class="key">${acceptance.toFixed(1)}% ACCEPTANCE</text>
  <text x="${cx}" y="${cy + 84}" text-anchor="middle" class="label">of ${fmtNum(allTotal)} problems</text>
</g>

<line x1="300" y1="45" x2="300" y2="205" stroke="#1f2937" stroke-width="1"/>
<text x="300" y="65" class="title">DIFFICULTY BREAKDOWN</text>

${progressRow({ label: "Easy",   value: easy,   target: easyTotal,   color: DIFF_COLOR.Easy,   y: 100, begin: 0.4 })}
${progressRow({ label: "Medium", value: medium, target: mediumTotal, color: DIFF_COLOR.Medium, y: 140, begin: 0.5 })}
${progressRow({ label: "Hard",   value: hard,   target: hardTotal,   color: DIFF_COLOR.Hard,   y: 180, begin: 0.6 })}

${scanSweep({ w: LC_W, h: LC_H, id: "LC" })}
${borderFrame({ w: LC_W, h: LC_H, id: "LC", rx: 16 })}
</svg>`;
}

/* ------------------------------------------------------------------ */

function writeOut(outPath, svg) {
  const out = path.resolve(outPath);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, svg, "utf8");
  console.log(`Wrote ${out}`);
}

async function main() {
  console.log(`Fetching contributions for ${USERNAME}...`);
  const { weeks, totalContributions } = await fetchContributions();

  writeOut(OUTPUT, buildSvg(weeks));

  const streaks = computeStreaks(weeks, totalContributions);
  writeOut(CONTRIB_OUTPUT, buildContribCard(streaks));

  writeOut(WAVE_OUTPUT, buildContributionWave(weeks));

  console.log(`Fetching profile stats (stars/commits/languages) for ${USERNAME}...`);
  try {
    const profileStats = await fetchProfileStats();
    writeOut(PROFILE_OUTPUT, buildProfileCard(profileStats));
  } catch (err) {
    console.error(`Profile stats fetch failed, leaving ${PROFILE_OUTPUT} untouched: ${err.message}`);
  }

  console.log(`Fetching LeetCode stats for ${LEETCODE_USERNAME}...`);
  try {
    const stats = await fetchLeetCodeStats(LEETCODE_USERNAME);
    writeOut(LEETCODE_OUTPUT, buildLeetCodeCard(stats));
  } catch (err) {
    console.error(`LeetCode fetch failed, leaving ${LEETCODE_OUTPUT} untouched: ${err.message}`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
