// Randomized greedy attempts + final validation (many tries).
// Usage: node crossword-layout-test.mjs [export | seed N | writegrid N out.json]

import { writeFileSync } from "fs";

const entries = [
  { direction: "across", number: 2, answer: "NIKE" },
  { direction: "across", number: 7, answer: "PLATOSACADEMY" },
  { direction: "across", number: 8, answer: "ATHENASTABLE" },
  { direction: "across", number: 9, answer: "HADESHAREM" },
  { direction: "across", number: 10, answer: "GRIFFIN" },
  { direction: "across", number: 11, answer: "SERFOPOULA" },
  { direction: "across", number: 12, answer: "ZEUSSET" },
  { direction: "across", number: 14, answer: "HEPHEASTUS" },
  { direction: "down", number: 1, answer: "EVILHARPY" },
  { direction: "down", number: 3, answer: "MEDAL" },
  { direction: "down", number: 4, answer: "BEACH" },
  { direction: "down", number: 5, answer: "PHOEBE" },
  { direction: "down", number: 6, answer: "HERA" },
  { direction: "down", number: 7, answer: "POSEIDONS" },
  { direction: "down", number: 13, answer: "RUNNING" },
];

function norm(s) {
  return s.toUpperCase().replace(/[^A-Z]/g, "");
}

function key(r, c) {
  return r + "," + c;
}

function validateFinal(grid, starts, words) {
  const answers = words.map((w) => w.answer);
  const multiset = (arr) => {
    const m = new Map();
    for (const x of arr) m.set(x, (m.get(x) || 0) + 1);
    return m;
  };
  const expected = multiset(answers);

  let minR = Infinity,
    maxR = -Infinity,
    minC = Infinity,
    maxC = -Infinity;
  for (const k of grid.keys()) {
    const [r, c] = k.split(",").map(Number);
    minR = Math.min(minR, r);
    maxR = Math.max(maxR, r);
    minC = Math.min(minC, c);
    maxC = Math.max(maxC, c);
  }

  const found = [];

  function get(r, c) {
    return grid.get(key(r, c));
  }

  for (let r = minR; r <= maxR; r++) {
    let c = minC;
    while (c <= maxC) {
      if (!get(r, c)) {
        c++;
        continue;
      }
      if (get(r, c - 1)) {
        c++;
        continue;
      }
      let s = "";
      let cc = c;
      while (get(r, cc)) {
        s += get(r, cc);
        cc++;
      }
      if (s.length > 1) found.push(s);
      c = cc;
    }
  }

  for (let c = minC; c <= maxC; c++) {
    let r = minR;
    while (r <= maxR) {
      if (!get(r, c)) {
        r++;
        continue;
      }
      if (get(r - 1, c)) {
        r++;
        continue;
      }
      let s = "";
      let rr = r;
      while (get(rr, c)) {
        s += get(rr, c);
        rr++;
      }
      if (s.length > 1) found.push(s);
      r = rr;
    }
  }

  const got = multiset(found);
  if (expected.size !== got.size) return false;
  for (const [w, n] of expected) {
    if ((got.get(w) || 0) !== n) return false;
  }

  for (const w of words) {
    let ok = false;
    for (const [k, st] of starts) {
      const [r, c] = k.split(",").map(Number);
      const num = w.direction === "across" ? st.across : st.down;
      if (num !== w.number) continue;
      let match = true;
      const ans = w.answer;
      for (let i = 0; i < ans.length; i++) {
        const rr = w.direction === "across" ? r : r + i;
        const cc = w.direction === "across" ? c + i : c;
        if (get(rr, cc) !== ans[i]) {
          match = false;
          break;
        }
      }
      if (match) {
        ok = true;
        break;
      }
    }
    if (!ok) return false;
  }

  return true;
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(a, rand) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}

function solveAttempt(words, rand) {
  const across = words.filter((w) => w.direction === "across");
  const down = words.filter((w) => w.direction === "down");

  const grid = new Map();
  const starts = new Map();

  function get(r, c) {
    return grid.get(key(r, c));
  }
  function setCell(r, c, ch) {
    const k = key(r, c);
    const cur = grid.get(k);
    if (cur !== undefined && cur !== ch) return false;
    grid.set(k, ch);
    return true;
  }

  function markStart(r, c, dir, num) {
    const k = key(r, c);
    const o = Object.assign({}, starts.get(k) || {});
    if (dir === "across") o.across = num;
    else o.down = num;
    starts.set(k, o);
  }

  function placeAcross(w, r, c) {
    const word = w.answer;
    const len = word.length;
    if (get(r, c - 1)) return false;
    if (get(r, c + len)) return false;
    for (let i = 0; i < len; i++) {
      const ch = get(r, c + i);
      if (ch !== undefined && ch !== word[i]) return false;
    }
    for (let i = 0; i < len; i++) {
      if (!setCell(r, c + i, word[i])) return false;
    }
    markStart(r, c, "across", w.number);
    return true;
  }

  function placeDown(w, r, c) {
    const word = w.answer;
    const len = word.length;
    if (get(r - 1, c)) return false;
    if (get(r + len, c)) return false;
    for (let i = 0; i < len; i++) {
      const ch = get(r + i, c);
      if (ch !== undefined && ch !== word[i]) return false;
    }
    for (let i = 0; i < len; i++) {
      if (!setCell(r + i, c, word[i])) return false;
    }
    markStart(r, c, "down", w.number);
    return true;
  }

  function listCandidates(w) {
    const out = [];
    for (const [k, ch] of grid) {
      const [rs, cs] = k.split(",").map(Number);
      for (let i = 0; i < w.answer.length; i++) {
        if (w.answer[i] !== ch) continue;
        if (w.direction === "across") out.push([rs, cs - i]);
        else out.push([rs - i, cs]);
      }
    }
    return out;
  }

  const ac7 = across.find((x) => x.number === 7);
  const dn7 = down.find((x) => x.number === 7);
  if (!ac7 || !dn7 || ac7.answer[0] !== dn7.answer[0]) return null;

  if (!placeAcross(ac7, 0, 0)) return null;
  if (!placeDown(dn7, 0, 0)) return null;

  const rest = words.filter((w) => w !== ac7 && w !== dn7);
  shuffle(rest, rand);

  for (const w of rest) {
    const cands = listCandidates(w);
    shuffle(cands, rand);
    let placed = false;
    for (const [r, c] of cands) {
      const ok = w.direction === "across" ? placeAcross(w, r, c) : placeDown(w, r, c);
      if (ok) {
        placed = true;
        break;
      }
    }
    if (!placed) return null;
  }

  if (!validateFinal(grid, starts, words)) return null;

  let minR = Infinity,
    maxR = -Infinity,
    minC = Infinity,
    maxC = -Infinity;
  for (const k of grid.keys()) {
    const [r, c] = k.split(",").map(Number);
    minR = Math.min(minR, r);
    maxR = Math.max(maxR, r);
    minC = Math.min(minC, c);
    maxC = Math.max(maxC, c);
  }

  const rows = maxR - minR + 1;
  const cols = maxC - minC + 1;
  const cells = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const rr = r + minR;
      const cc = c + minC;
      const ch = grid.get(key(rr, cc));
      if (ch === undefined) row.push({ block: true });
      else {
        const st = starts.get(key(rr, cc)) || {};
        const cell = { letter: ch };
        if (st.across) cell.acrossNumber = st.across;
        if (st.down) cell.downNumber = st.down;
        row.push(cell);
      }
    }
    cells.push(row);
  }

  return { rows, cols, cells };
}

const words = entries.map((e) => ({
  direction: e.direction,
  number: e.number,
  answer: norm(e.answer),
}));

const mode = process.argv[2];
if (mode === "writegrid" && process.argv[3] && process.argv[4]) {
  const s = parseInt(process.argv[3], 10);
  const outPath = process.argv[4];
  const r = solveAttempt(words, mulberry32(s));
  if (!r) {
    console.error("FAIL no grid for seed", s);
    process.exit(1);
  }
  writeFileSync(outPath, JSON.stringify(r, null, 0));
  console.error("wrote", outPath, "seed", s);
  process.exit(0);
}

const fixedSeed = mode === "seed" ? parseInt(process.argv[3], 10) : NaN;
const exportSeed = mode === "export";

const t0 = Date.now();
let result = null;
let winningSeed = null;

if (Number.isFinite(fixedSeed)) {
  result = solveAttempt(words, mulberry32(fixedSeed));
  winningSeed = fixedSeed;
} else {
  const maxTries = exportSeed ? 500000 : 250000;
  for (let i = 0; i < maxTries; i++) {
    const rand = mulberry32(i + 1);
    result = solveAttempt(words, rand);
    if (result) {
      winningSeed = i + 1;
      if (exportSeed) break;
      break;
    }
  }
}

if ((exportSeed || Number.isFinite(fixedSeed)) && result) {
  console.error("winningSeed", winningSeed);
}
console.log(result ? "OK" : "FAIL", Date.now() - t0, "ms");
if (result) {
  console.log("rows", result.rows, "cols", result.cols);
  for (let r = 0; r < result.rows; r++) {
    let line = "";
    for (let c = 0; c < result.cols; c++) {
      const cell = result.cells[r][c];
      line += cell.block ? "#" : cell.letter;
    }
    console.log(line);
  }
  console.log("---JSON---");
  console.log(JSON.stringify({ rows: result.rows, cols: result.cols, cells: result.cells }));
}
