/**
 * Crossword — loads JSON from data-crossword-url.
 * Supports:
 *  - New schema: { "crossword": { entries[], grid{rows,cols,cells}, instructions, ... } }
 *  - Legacy: { rows, cols, cells[], clues{across,down} }
 * DOM-safe: createElement + textContent only.
 */
(function () {
  var root = document.getElementById("crossword-root");
  if (!root) return;

  var url = root.getAttribute("data-crossword-url");
  if (!url) {
    showFatal(root, "Missing data-crossword-url on #crossword-root.");
    return;
  }

  fetch(url, { credentials: "same-origin" })
    .then(function (res) {
      if (!res.ok) throw new Error("Could not load crossword JSON (" + res.status + ").");
      return res.json();
    })
    .then(function (data) {
      var norm = normalizeModel(data);
      if (norm.error) {
        showFatal(root, norm.error);
        return;
      }
      renderPuzzle(root, norm);
    })
    .catch(function (err) {
      showFatal(root, err && err.message ? err.message : "Failed to load puzzle.");
    });

  function showFatal(el, message) {
    el.textContent = "";
    var box = document.createElement("p");
    box.className = "crossword-error";
    box.setAttribute("role", "alert");
    box.textContent = message;
    el.appendChild(box);
  }

  function normalizeModel(raw) {
    if (!raw || typeof raw !== "object") return { error: "Invalid puzzle file." };

    var cw = raw.crossword;
    if (cw && cw.grid && cw.grid.cells) {
      return {
        title: cw.title || "Crossword",
        intro: typeof cw.intro === "string" ? cw.intro : "",
        checkMode: (cw.checkAnswersMode || "case-insensitive").toLowerCase(),
        ignoreChars: Array.isArray(cw.ignoreCharacters) ? cw.ignoreCharacters : [],
        instructions: cw.instructions || {},
        entries: Array.isArray(cw.entries) ? cw.entries : [],
        rows: cw.grid.rows,
        cols: cw.grid.cols,
        cells: cw.grid.cells,
        legacy: false,
      };
    }

    if (raw.cells && Number.isFinite(raw.rows) && Number.isFinite(raw.cols)) {
      return {
        title: raw.title || "Crossword",
        intro: typeof raw.intro === "string" ? raw.intro : "",
        checkMode: "case-insensitive",
        ignoreChars: [],
        instructions: {
          checkButtonLabel: "Check answers",
          messages: {
            perfect: "You got them all right.",
            partial: "Close — you got {correct} out of {total}.",
            retry: "Nice try. Refresh and try again.",
          },
        },
        entries: [],
        rows: raw.rows,
        cols: raw.cols,
        cells: raw.cells,
        legacy: true,
        legacyClues: raw.clues || {},
      };
    }

    return {
      error:
        "Unrecognized crossword format. Use { crossword: { grid, entries } } or legacy { rows, cols, cells, clues }.",
    };
  }

  function normalizeLetter(ch, ignoreChars) {
    if (typeof ch !== "string" || ch.length === 0) return "";
    var s = ch.toUpperCase();
    var ign = ignoreChars || [];
    for (var i = 0; i < ign.length; i++) {
      s = s.split(ign[i]).join("");
    }
    s = s.replace(/[^A-Z]/g, "");
    return s.slice(0, 1);
  }

  function normalizeSolutionLetter(ch, ignoreChars) {
    return normalizeLetter(ch, ignoreChars);
  }

  function validateGrid(model) {
    if (!Number.isFinite(model.rows) || !Number.isFinite(model.cols)) return "grid must define rows and cols.";
    if (!Array.isArray(model.cells) || model.cells.length !== model.rows) return "cells row count must match rows.";
    for (var r = 0; r < model.rows; r++) {
      if (!Array.isArray(model.cells[r]) || model.cells[r].length !== model.cols) {
        return "Each cells row must have length cols.";
      }
    }
    return null;
  }

  function clueLists(model) {
    if (model.legacy) {
      var ca = (model.legacyClues.across || []).map(function (x) {
        return { number: x.number, text: x.text || "" };
      });
      var cd = (model.legacyClues.down || []).map(function (x) {
        return { number: x.number, text: x.text || "" };
      });
      return { across: ca, down: cd };
    }

    var across = model.entries
      .filter(function (e) {
        return e && e.direction === "across";
      })
      .map(function (e) {
        return { number: e.number, text: e.clue || "" };
      })
      .sort(function (a, b) {
        return a.number - b.number;
      });

    var down = model.entries
      .filter(function (e) {
        return e && e.direction === "down";
      })
      .map(function (e) {
        return { number: e.number, text: e.clue || "" };
      })
      .sort(function (a, b) {
        return a.number - b.number;
      });

    return { across: across, down: down };
  }

  function messageTemplate(tpl, correct, total) {
    var s = tpl || "";
    s = s.split("{correct}").join(String(correct));
    s = s.split("{total}").join(String(total));
    return s;
  }

  function renderPuzzle(mount, model) {
    var err = validateGrid(model);
    if (err) {
      showFatal(mount, err);
      return;
    }

    mount.textContent = "";

    var shell = document.createElement("div");
    shell.className = "crossword-shell";

    var title = document.createElement("h2");
    title.className = "crossword-title";
    title.textContent = model.title;
    shell.appendChild(title);

    if (model.intro) {
      var intro = document.createElement("p");
      intro.className = "section__lede";
      intro.style.maxWidth = "40rem";
      intro.textContent = model.intro;
      shell.appendChild(intro);
    }

    var boardWrap = document.createElement("div");
    boardWrap.className = "crossword-board-wrap";
    var table = document.createElement("table");
    table.className = "crossword-board";
    table.setAttribute("role", "grid");
    table.setAttribute("aria-label", model.title);

    var inputs = [];
    var ignoreChars = model.ignoreChars;

    for (var r = 0; r < model.rows; r++) {
      var tr = document.createElement("tr");
      for (var c = 0; c < model.cols; c++) {
        var td = document.createElement("td");
        var cell = model.cells[r][c];
        if (!cell || cell.block === true) {
          td.className = "is-block";
          td.setAttribute("aria-hidden", "true");
        } else {
          var letter = normalizeSolutionLetter(cell.letter || "", ignoreChars);
          if (!letter) {
            showFatal(mount, "Invalid letter at row " + r + ", col " + c + ".");
            return;
          }
          var input = document.createElement("input");
          input.type = "text";
          input.maxLength = 1;
          input.className = "crossword-input";
          input.setAttribute("autocomplete", "off");
          input.setAttribute("spellcheck", "false");
          input.setAttribute("inputmode", "text");
          input.setAttribute("aria-label", "Row " + (r + 1) + ", column " + (c + 1));

          input.addEventListener("input", function (ev) {
            var t = ev.target;
            var v = normalizeLetter(t.value || "", ignoreChars);
            t.value = v;
          });

          var numWrap = document.createElement("span");
          numWrap.className = "crossword-cell-nums";

          if (typeof cell.number === "number" && cell.number > 0) {
            var num = document.createElement("span");
            num.className = "crossword-cell-num";
            num.textContent = String(cell.number);
            numWrap.appendChild(num);
          } else {
            var aN = typeof cell.acrossNumber === "number" && cell.acrossNumber > 0 ? cell.acrossNumber : 0;
            var dN = typeof cell.downNumber === "number" && cell.downNumber > 0 ? cell.downNumber : 0;
            if (aN && dN && aN === dN) {
              var one = document.createElement("span");
              one.className = "crossword-cell-num";
              one.textContent = String(aN);
              numWrap.appendChild(one);
            } else {
              if (aN) {
                var na = document.createElement("span");
                na.className = "crossword-cell-num crossword-cell-num--across";
                na.textContent = String(aN);
                numWrap.appendChild(na);
              }
              if (dN) {
                var nd = document.createElement("span");
                nd.className = "crossword-cell-num crossword-cell-num--down";
                nd.textContent = String(dN);
                numWrap.appendChild(nd);
              }
            }
          }

          if (numWrap.childNodes.length) td.appendChild(numWrap);

          td.appendChild(input);
          inputs.push({ el: input, solution: letter });
        }
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }

    boardWrap.appendChild(table);

    var lists = clueLists(model);
    var cluesPanel = document.createElement("aside");
    cluesPanel.className = "crossword-clues";
    cluesPanel.setAttribute("aria-label", "Clues");

    var hAcross = document.createElement("h3");
    hAcross.textContent = "Across";
    cluesPanel.appendChild(hAcross);
    cluesPanel.appendChild(buildClueList(lists.across));

    var hDown = document.createElement("h3");
    hDown.textContent = "Down";
    cluesPanel.appendChild(hDown);
    cluesPanel.appendChild(buildClueList(lists.down));

    var actions = document.createElement("div");
    actions.className = "crossword-actions";

    var inst = model.instructions || {};
    var btnLabel = inst.checkButtonLabel || "Check answers";
    var msgs = (inst.messages || {});

    var checkBtn = document.createElement("button");
    checkBtn.type = "button";
    checkBtn.className = "btn btn--primary";
    checkBtn.textContent = btnLabel;

    var feedback = document.createElement("p");
    feedback.className = "crossword-feedback";
    feedback.setAttribute("aria-live", "polite");

    checkBtn.addEventListener("click", function () {
      var total = inputs.length;
      if (total === 0) {
        feedback.textContent = "No letter cells to check.";
        feedback.className = "crossword-feedback is-warn";
        return;
      }
      var ok = 0;
      for (var i = 0; i < inputs.length; i++) {
        var guess = normalizeLetter(inputs[i].el.value || "", ignoreChars);
        var sol = inputs[i].solution;
        if (guess && guess === sol) ok++;
      }
      feedback.className = "crossword-feedback";
      if (ok === total) {
        feedback.textContent = messageTemplate(msgs.perfect, ok, total) || "You got them all right.";
        feedback.classList.add("is-ok");
      } else if (ok > 0) {
        feedback.textContent =
          messageTemplate(msgs.partial, ok, total) || "Close — you got " + ok + " out of " + total + ".";
        feedback.classList.add("is-warn");
      } else {
        feedback.textContent = messageTemplate(msgs.retry, ok, total) || "Nice try. Refresh and try again.";
        feedback.classList.add("is-warn");
      }
    });

    actions.appendChild(checkBtn);
    cluesPanel.appendChild(actions);
    cluesPanel.appendChild(feedback);

    shell.appendChild(boardWrap);
    shell.appendChild(cluesPanel);
    mount.appendChild(shell);
  }

  function buildClueList(items) {
    var list = document.createElement("ul");
    list.style.listStyle = "none";
    list.style.paddingLeft = "0";
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var li = document.createElement("li");
      var label = document.createElement("span");
      label.textContent = typeof it.number === "number" ? it.number + ". " : "";
      var text = document.createElement("span");
      text.textContent = typeof it.text === "string" ? it.text : "";
      li.appendChild(label);
      li.appendChild(text);
      list.appendChild(li);
    }
    return list;
  }
})();
