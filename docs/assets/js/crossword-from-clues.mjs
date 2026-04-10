/**
 * Build a v2 crossword grid from across/down clue lists (answers only).
 * Randomized greedy placement + validation (ported from crossword-layout-test.mjs).
 * Usage: node crossword-from-clues.mjs <path-to-ai-friendly.json> [out.json]
 */

import { readFileSync, writeFileSync } from "fs";

function norm(s) {
  return String(s || "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
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

  /** All (across, down, ia, id) where A[ia] === D[id] */
  const pairs = [];
  for (const a of across) {
    for (const d of down) {
      for (let ia = 0; ia < a.answer.length; ia++) {
        for (let id = 0; id < d.answer.length; id++) {
          if (a.answer[ia] === d.answer[id]) pairs.push({ a, d, ia, id });
        }
      }
    }
  }
  if (!pairs.length) return null;
  shuffle(pairs, rand);

  for (const { a, d, ia, id } of pairs) {
    grid.clear();
    starts.clear();

    if (!placeDown(d, 0, 0)) continue;
    if (!placeAcross(a, id, -ia)) continue;

    const rest = words.filter((w) => w !== a && w !== d);
    shuffle(rest, rand);

    let failed = false;
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
      if (!placed) {
        failed = true;
        break;
      }
    }
    if (failed) continue;

    if (!validateFinal(grid, starts, words)) continue;

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

  return null;
}

function main() {
  const inPath = process.argv[2];
  const outPath = process.argv[3];
  if (!inPath) {
    console.error("Usage: node crossword-from-clues.mjs <ai-friendly.json> [out.json]");
    process.exit(1);
  }

  const raw = JSON.parse(readFileSync(inPath, "utf8"));
  const acrossList = Array.isArray(raw.across) ? raw.across : [];
  const downList = Array.isArray(raw.down) ? raw.down : [];

  const words = [];
  for (const e of acrossList) {
    words.push({
      direction: "across",
      number: e.number,
      answer: norm(e.answer),
    });
  }
  for (const e of downList) {
    words.push({
      direction: "down",
      number: e.number,
      answer: norm(e.answer),
    });
  }

  const entries = [];
  for (const e of acrossList) {
    entries.push({
      direction: "across",
      number: e.number,
      clue: e.clue || "",
      answer: norm(e.answer),
    });
  }
  for (const e of downList) {
    entries.push({
      direction: "down",
      number: e.number,
      clue: e.clue || "",
      answer: norm(e.answer),
    });
  }

  let result = null;
  let winningSeed = null;
  const maxTries = 500000;
  const t0 = Date.now();
  for (let i = 0; i < maxTries; i++) {
    const rand = mulberry32(i + 1);
    result = solveAttempt(words, rand);
    if (result) {
      winningSeed = i + 1;
      break;
    }
  }

  if (!result) {
    console.error("FAIL: no layout found in", maxTries, "tries", Date.now() - t0, "ms");
    process.exit(1);
  }

  console.error("OK seed", winningSeed, "rows", result.rows, "cols", result.cols, Date.now() - t0, "ms");

  const title = raw.title || "Crossword";
  const out = {
    ...raw,
    crossword: {
      title,
      checkAnswersMode: "case-insensitive",
      ignoreCharacters: [" ", "-", "'"],
      intro:
        typeof raw.intro === "string"
          ? raw.intro
          : "Fill in the grid using the clues. May the Force be with you.",
      instructions: {
        checkButtonLabel: "Check answers",
        messages: {
          perfect: "Great work, Jedi. You solved it!",
          partial: "Nice try — you got {correct} out of {total}.",
          retry: "Not quite. Use the Force and try again.",
        },
      },
      entries,
      grid: {
        rows: result.rows,
        cols: result.cols,
        cells: result.cells,
      },
    },
  };

  const json = JSON.stringify(out, null, 2);
  if (outPath) {
    writeFileSync(outPath, json);
    console.error("wrote", outPath);
  } else {
    process.stdout.write(json);
  }
}

main();
