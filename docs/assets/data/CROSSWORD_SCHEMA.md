# Crossword JSON (`assets/data/crossword.json`)

The Fun Surprise page fetches this file at runtime. **No secrets** — safe to commit.

## Recommended shape (v2)

Wrap everything in `crossword`. Clues and answers live in `entries`; the **visual grid** lives in `grid` (so the layout always matches what you intend).

```json
{
  "crossword": {
    "title": "Puzzle title",
    "intro": "Optional short line above the board.",
    "checkAnswersMode": "case-insensitive",
    "ignoreCharacters": [" ", "-", "'"],
    "layoutSeed": 83,
    "instructions": {
      "checkButtonLabel": "Check Answers",
      "messages": {
        "perfect": "You got them all right.",
        "partial": "Close — you got {correct} out of {total}.",
        "retry": "Nice try. Refresh and try again."
      }
    },
    "entries": [
      { "direction": "across", "number": 1, "clue": "Clue text", "answer": "WORD" }
    ],
    "grid": {
      "rows": 5,
      "cols": 5,
      "cells": []
    }
  }
}
```

### `entries`

Each entry:

| Field | Type | Description |
|-------|------|-------------|
| `direction` | `"across"` \| `"down"` | Word orientation |
| `number` | number | Clue number (matches the number in the grid) |
| `clue` | string | Shown in the clue list |
| `answer` | string | Used only for your reference / tooling; **the board uses `grid` letters** |

Across clues are listed in ascending `number`, then down clues the same way.

### `grid.cells`

`cells` is a `rows` × `cols` matrix. Each cell is either:

- **Black:** `{ "block": true }`
- **Letter:** `{ "letter": "A" }` plus optional clue numbers:
  - **Legacy single number:** `{ "letter": "A", "number": 1 }`
  - **Preferred (two starts on one square):** `{ "letter": "P", "acrossNumber": 7, "downNumber": 7 }`
  - **One direction only:** `{ "letter": "E", "downNumber": 1 }`

Letters are compared **A–Z**, case-insensitive. `ignoreCharacters` are stripped from typed input before comparison.

### `layoutSeed` (optional)

If you used the repo’s offline helper `docs/assets/js/crossword-layout-test.mjs` (excluded from the published site) to auto-place words, record the seed here so you can regenerate the same topology later:

```bash
node docs/assets/js/crossword-layout-test.mjs writegrid 83 /tmp/grid.json
```

## Legacy shape (v1)

Still supported for older puzzles:

```json
{
  "title": "...",
  "intro": "...",
  "rows": 3,
  "cols": 3,
  "cells": [[{ "letter": "C", "number": 1 }]],
  "clues": {
    "across": [{ "number": 1, "text": "Clue" }],
    "down": [{ "number": 2, "text": "Clue" }]
  }
}
```
