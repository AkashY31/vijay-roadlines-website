/* Vijay Roadlines — site content loader
   Loads /data/content.json, then applies a localStorage preview
   override (written by admin.html) on top, so the admin panel can
   preview edits instantly before exporting a new content.json. */
(function () {
  const PREVIEW_KEY = "vr_content_preview";

  async function loadContent() {
    let base = {};
    try {
      const res = await fetch("data/content.json", { cache: "no-store" });
      base = await res.json();
    } catch (e) {
      console.error("Could not load content.json", e);
    }
    let preview = null;
    try {
      const raw = localStorage.getItem(PREVIEW_KEY);
      if (raw) preview = JSON.parse(raw);
    } catch (e) { /* ignore corrupt preview data */ }
    return preview ? deepMerge(base, preview) : base;
  }

  function deepMerge(a, b) {
    if (Array.isArray(b)) return b;
    if (typeof b !== "object" || b === null) return b === undefined ? a : b;
    const out = { ...a };
    for (const k in b) out[k] = deepMerge(a ? a[k] : undefined, b[k]);
    return out;
  }

  function fillText(root, data) {
    root.querySelectorAll("[data-cms]").forEach((el) => {
      const path = el.getAttribute("data-cms");
      const val = getPath(data, path);
      if (val !== undefined) el.textContent = val;
    });
    root.querySelectorAll("[data-cms-html]").forEach((el) => {
      const path = el.getAttribute("data-cms-html");
      const val = getPath(data, path);
      if (val !== undefined) el.innerHTML = val;
    });
  }

  function getPath(obj, path) {
    return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
  }

  function renderRepeaters(data) {
    // why-us grid
    const whyGrid = document.querySelector("[data-repeat='why']");
    if (whyGrid && Array.isArray(data.why)) {
      whyGrid.innerHTML = data.why
        .map(
          (item) => `<div class="why-item"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p></div>`
        )
        .join("");
    }
    // process rail
    const processRail = document.querySelector("[data-repeat='process']");
    if (processRail && Array.isArray(data.process)) {
      processRail.innerHTML = data.process
        .map(
          (step, i) =>
            `<div class="process-step"><div class="num">${i + 1}</div><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.text)}</p></div>`
        )
        .join("");
    }
    // fleet capacity cards
    const fleetBody = document.querySelector("[data-repeat='fleet']");
    if (fleetBody && Array.isArray(data.fleet)) {
      fleetBody.innerHTML = data.fleet
        .map(
          (row) =>
            `<article class="fleet-card"><p class="fleet-card-range">${escapeHtml(row.range)}</p><h3>${escapeHtml(row.category)}</h3><p>${escapeHtml(row.vehicles)}</p></article>`
        )
        .join("");
    }
    // clients strip
    const clientStrip = document.querySelector("[data-repeat='clients']");
    if (clientStrip && Array.isArray(data.clients)) {
      clientStrip.innerHTML = data.clients
        .map((name) => `<span class="client-chip">${escapeHtml(name)}</span>`)
        .join("");
    }
  }

  function fillContactLinks(data) {
    document.querySelectorAll("[data-cms-tel]").forEach((el) => {
      el.setAttribute("href", "tel:" + data.site.phoneRaw);
    });
    document.querySelectorAll("[data-cms-mail]").forEach((el) => {
      el.setAttribute("href", "mailto:" + data.site.email);
    });
    document.querySelectorAll("[data-cms-wa]").forEach((el) => {
      el.setAttribute("href", "https://wa.me/" + data.site.phoneRaw);
    });
  }

  function setupWhatsAppQuote(data) {
    const button = document.querySelector("[data-whatsapp-quote]");
    const form = button && button.closest("form");
    if (!button || !form) return;

    button.addEventListener("click", () => {
      if (!form.reportValidity()) return;

      const fields = [
        ["Name", form.elements.Name.value],
        ["Phone", form.elements.Phone.value],
        ["Pickup", form.elements["Pickup location"].value],
        ["Drop-off", form.elements["Drop location"].value],
        ["Load", form.elements["Load type"].value],
        ["Details", form.elements.Details.value]
      ];
      const message = ["Hello Vijay Roadlines, I would like a freight quote:", ...fields.filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`)].join("\n");
      const url = `https://wa.me/${data.site.phoneRaw}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function markActiveNav() {
    const page = (location.pathname.split("/").pop() || "index.html");
    document.querySelectorAll("nav.main-nav a, .mobile-nav a").forEach((a) => {
      const href = a.getAttribute("href");
      if (href === page || (page === "" && href === "index.html")) {
        a.classList.add("active");
      }
    });
  }

  function setupMobileNav() {
    const toggle = document.querySelector(".menu-toggle");
    const drawer = document.querySelector(".mobile-nav");
    if (!toggle || !drawer) return;
    toggle.addEventListener("click", () => drawer.classList.toggle("open"));
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const data = await loadContent();
    fillText(document, data);
    renderRepeaters(data);
    fillContactLinks(data);
    setupWhatsAppQuote(data);
    markActiveNav();
    setupMobileNav();
    document.dispatchEvent(new CustomEvent("vr-content-ready", { detail: data }));
  });

  window.VR = { loadContent, PREVIEW_KEY };
})();
