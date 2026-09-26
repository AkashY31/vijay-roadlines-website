/* Vijay Roadlines — admin panel logic.
   NOTE: this password gate is client-side only. It's enough to stop a
   casual visitor from finding the editor, but it is not real security —
   don't rely on it to protect anything sensitive. Change ADMIN_PASSWORD
   below before you deploy. */
(function () {
  const ADMIN_PASSWORD = "vijay2026";
  const PREVIEW_KEY = window.VR ? window.VR.PREVIEW_KEY : "vr_content_preview";

  let data = null;

  // ---------- gate ----------
  const gate = document.getElementById("gate");
  const panel = document.getElementById("panel");
  const pwInput = document.getElementById("pw");
  const err = document.getElementById("err");

  document.getElementById("unlock").addEventListener("click", tryUnlock);
  pwInput.addEventListener("keydown", (e) => { if (e.key === "Enter") tryUnlock(); });

  function tryUnlock() {
    if (pwInput.value === ADMIN_PASSWORD) {
      gate.style.display = "none";
      panel.style.display = "block";
      init();
    } else {
      err.textContent = "Incorrect password.";
    }
  }

  // ---------- load + merge ----------
  async function init() {
    const base = await fetch("data/content.json", { cache: "no-store" }).then((r) => r.json());
    let preview = null;
    try {
      const raw = localStorage.getItem(PREVIEW_KEY);
      if (raw) preview = JSON.parse(raw);
    } catch (e) { /* ignore */ }
    data = preview ? deepMerge(base, preview) : JSON.parse(JSON.stringify(base));
    populateFields();
    renderWhy();
    renderProcess();
    renderFleet();
    document.getElementById("clients-text").value = (data.clients || []).join("\n");
  }

  function deepMerge(a, b) {
    if (Array.isArray(b)) return b;
    if (typeof b !== "object" || b === null) return b === undefined ? a : b;
    const out = { ...a };
    for (const k in b) out[k] = deepMerge(a ? a[k] : undefined, b[k]);
    return out;
  }

  function getPath(obj, path) {
    return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
  }
  function setPath(obj, path, val) {
    const parts = path.split(".");
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      cur[parts[i]] = cur[parts[i]] || {};
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = val;
  }

  function populateFields() {
    document.querySelectorAll("[data-path]").forEach((el) => {
      const val = getPath(data, el.getAttribute("data-path"));
      el.value = val === undefined ? "" : val;
    });
  }

  function readFields() {
    document.querySelectorAll("[data-path]").forEach((el) => {
      setPath(data, el.getAttribute("data-path"), el.value);
    });
    data.clients = document.getElementById("clients-text").value
      .split("\n").map((s) => s.trim()).filter(Boolean);
  }

  // ---------- repeaters ----------
  function renderWhy() {
    const list = document.getElementById("why-list");
    list.innerHTML = "";
    (data.why || []).forEach((item, i) => {
      const div = document.createElement("div");
      div.className = "repeat-item";
      div.innerHTML = `
        <button class="remove" data-idx="${i}" data-kind="why">Remove</button>
        <div class="field"><label>Title</label><input class="why-title" data-i="${i}" value="${escAttr(item.title)}"></div>
        <div class="field"><label>Text</label><textarea class="why-text" data-i="${i}">${escHtml(item.text)}</textarea></div>
      `;
      list.appendChild(div);
    });
    list.querySelectorAll(".remove").forEach((b) => b.addEventListener("click", () => {
      data.why.splice(+b.dataset.idx, 1); renderWhy();
    }));
  }
  document.getElementById("add-why").addEventListener("click", () => {
    if (!data) return;
    data.why = data.why || [];
    data.why.push({ title: "New reason", text: "Describe it here." });
    renderWhy();
  });

  function renderProcess() {
    const list = document.getElementById("process-list");
    list.innerHTML = "";
    (data.process || []).forEach((item, i) => {
      const div = document.createElement("div");
      div.className = "repeat-item";
      div.innerHTML = `
        <button class="remove" data-idx="${i}">Remove</button>
        <div class="field"><label>Step title</label><input class="proc-title" data-i="${i}" value="${escAttr(item.title)}"></div>
        <div class="field"><label>Step text</label><textarea class="proc-text" data-i="${i}">${escHtml(item.text)}</textarea></div>
      `;
      list.appendChild(div);
    });
    list.querySelectorAll(".remove").forEach((b) => b.addEventListener("click", () => {
      data.process.splice(+b.dataset.idx, 1); renderProcess();
    }));
  }
  document.getElementById("add-process").addEventListener("click", () => {
    data.process = data.process || [];
    data.process.push({ title: "New step", text: "Describe it here." });
    renderProcess();
  });

  function renderFleet() {
    const list = document.getElementById("fleet-list");
    list.innerHTML = "";
    (data.fleet || []).forEach((row, i) => {
      const div = document.createElement("div");
      div.className = "repeat-item";
      div.innerHTML = `
        <button class="remove" data-idx="${i}">Remove</button>
        <div class="row3">
          <div class="field"><label>Category</label><input class="fleet-cat" data-i="${i}" value="${escAttr(row.category)}"></div>
          <div class="field"><label>Capacity range</label><input class="fleet-range" data-i="${i}" value="${escAttr(row.range)}"></div>
          <div class="field"><label>Vehicles</label><input class="fleet-vehicles" data-i="${i}" value="${escAttr(row.vehicles)}"></div>
        </div>
      `;
      list.appendChild(div);
    });
    list.querySelectorAll(".remove").forEach((b) => b.addEventListener("click", () => {
      data.fleet.splice(+b.dataset.idx, 1); renderFleet();
    }));
  }
  document.getElementById("add-fleet").addEventListener("click", () => {
    data.fleet = data.fleet || [];
    data.fleet.push({ category: "New category", range: "0 – 0 Tons", vehicles: "List vehicles" });
    renderFleet();
  });

  function escHtml(s) { return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function escAttr(s) { return escHtml(s).replace(/"/g, "&quot;"); }

  function syncRepeatersFromInputs() {
    document.querySelectorAll(".why-title").forEach((el) => data.why[+el.dataset.i].title = el.value);
    document.querySelectorAll(".why-text").forEach((el) => data.why[+el.dataset.i].text = el.value);
    document.querySelectorAll(".proc-title").forEach((el) => data.process[+el.dataset.i].title = el.value);
    document.querySelectorAll(".proc-text").forEach((el) => data.process[+el.dataset.i].text = el.value);
    document.querySelectorAll(".fleet-cat").forEach((el) => data.fleet[+el.dataset.i].category = el.value);
    document.querySelectorAll(".fleet-range").forEach((el) => data.fleet[+el.dataset.i].range = el.value);
    document.querySelectorAll(".fleet-vehicles").forEach((el) => data.fleet[+el.dataset.i].vehicles = el.value);
  }

  // ---------- save / reset / download ----------
  document.getElementById("save-btn").addEventListener("click", () => {
    readFields();
    syncRepeatersFromInputs();
    localStorage.setItem(PREVIEW_KEY, JSON.stringify(data));
    flash("Saved. Open the site in this browser to preview.");
  });

  document.getElementById("reset-btn").addEventListener("click", () => {
    localStorage.removeItem(PREVIEW_KEY);
    flash("Preview cleared — site will show the published content.json again.");
    init();
  });

  document.getElementById("download-btn").addEventListener("click", () => {
    readFields();
    syncRepeatersFromInputs();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "content.json";
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    flash("Downloaded. Replace /data/content.json with this file and redeploy.");
  });

  function flash(msg) {
    const el = document.getElementById("status");
    el.textContent = msg;
    setTimeout(() => { el.textContent = ""; }, 4000);
  }
})();
