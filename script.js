/* ============ Saran S · Portfolio interactions ============ */

/* --- Reel data (order matters). Put the real view count in `views`
   (e.g. "120K"). Likes are intentionally hidden; only views are shown. --- */
const REELS = [
  { code: "DYPZT2Hpd9j", views: "" },
  { code: "DGQO33HJyvn", views: "" },
  { code: "DFXlVRxJcDQ", views: "" },
  { code: "DZhg0bIveXK", views: "" },
  { code: "DXUCWBVj9ql", views: "" },
  { code: "DWtYjA_j6qe", views: "" },
];

const IG = (code) => `https://www.instagram.com/reel/${code}/`;

const eyeSVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>';
const heartSVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>';

/* --- Build reel grid (lazy: embeds load only when scrolled into view) --- */
const grid = document.getElementById("reelGrid");
const igIcon =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>';

REELS.forEach((r, i) => {
  // Only the view count is shown (likes are hidden). Falls back to the reel
  // number until a view count is provided.
  const metaHTML = r.views
    ? `<div class="reel-meta"><span class="m views">${eyeSVG}${r.views} views</span></div>`
    : `<div class="reel-num">Reel ${String(i + 1).padStart(2, "0")}</div>`;

  const cell = document.createElement("div");
  cell.className = "reel reveal";
  cell.dataset.code = r.code;
  cell.innerHTML = `
    <a class="embed-box placeholder" href="${IG(r.code)}" target="_blank" rel="noopener" aria-label="Watch reel ${i + 1} on Instagram">
      <span class="ph-num">Reel ${String(i + 1).padStart(2, "0")}</span>
      <span class="ph-play">${igIcon}</span>
      <span class="ph-cta">Watch on Instagram</span>
    </a>
    ${metaHTML}`;
  grid.appendChild(cell);
});

/* Give the embed iframe a height that fits Instagram's reel card
   (square media + header + engagement chrome ≈ width + 315). This is
   deterministic and needs no embed.js postMessage handshake, so every
   reel — including the first — renders identically. */
function sizeFrame(ifr) {
  const box = ifr.parentElement;
  const w = box.clientWidth;
  ifr.style.height = w + 315 + "px"; // full IG card height (internal)
  // Crop the box to header + video so Instagram's likes/comment footer
  // (which we can't restyle inside the cross-origin iframe) is hidden.
  box.style.height = Math.round(w * 1.22) + "px";
}
addEventListener("resize", () => document.querySelectorAll(".ig-frame").forEach(sizeFrame));

/* Lazy-load the Instagram embed for a single reel card (direct iframe) */
function loadEmbed(cell) {
  if (cell.dataset.loaded) return;
  cell.dataset.loaded = "1";
  const code = cell.dataset.code;
  const box = cell.querySelector(".embed-box");
  box.classList.remove("placeholder");
  box.removeAttribute("href");
  const ifr = document.createElement("iframe");
  ifr.className = "ig-frame";
  ifr.src = `https://www.instagram.com/reel/${code}/embed/`;
  ifr.title = `Instagram reel — ${code}`;
  ifr.loading = "lazy";
  ifr.setAttribute("scrolling", "no");
  ifr.setAttribute("allowtransparency", "true");
  ifr.setAttribute("frameborder", "0");
  box.innerHTML = "";
  box.appendChild(ifr);
  sizeFrame(ifr);
}

const embedIO = new IntersectionObserver(
  (entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        loadEmbed(en.target);
        embedIO.unobserve(en.target);
      }
    });
  },
  { rootMargin: "400px 0px" }
);
document.querySelectorAll(".reel").forEach((c) => embedIO.observe(c));

/* --- Long-form feature: local video avoids YouTube Error 153 on file:// --- */
document.querySelectorAll(".yt-poster").forEach((poster) => {
  poster.addEventListener("click", () => {
    const video = document.createElement("video");
    video.className = "feature-video";
    video.src = poster.dataset.videoSrc;
    video.poster = poster.querySelector("img").src;
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.setAttribute("aria-label", "Doctor Towels website video");
    poster.replaceWith(video);

    // The click is a user gesture, so browsers allow playback with sound.
    video.play().catch(() => video.controls = true);
  });
});

/* --- Build ordered link list under long-form --- */
const linkList = document.getElementById("linkList");
REELS.forEach((r) => {
  const li = document.createElement("li");
  li.innerHTML = `<a href="${IG(r.code)}" target="_blank" rel="noopener">${IG(
    r.code
  )}</a>`;
  linkList.appendChild(li);
});

/* --- Nav: scrolled state + mobile menu --- */
const nav = document.getElementById("nav");
const navLinks = document.getElementById("navLinks");
const burger = document.getElementById("hamburger");
addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 30));
burger.addEventListener("click", () => navLinks.classList.toggle("open"));
navLinks.addEventListener("click", (e) => {
  if (e.target.tagName === "A") navLinks.classList.remove("open");
});

/* --- Scroll reveal --- */
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        io.unobserve(en.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

/* Safety net: never leave content invisible if IntersectionObserver is
   delayed or paused (e.g. page opened in a background tab). */
function revealAll() {
  document.querySelectorAll(".reveal:not(.in)").forEach((el) => el.classList.add("in"));
}
addEventListener("load", () => setTimeout(revealAll, 2500));
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") revealAll();
});

/* --- Count-up hero stats --- */
function runCount(el) {
  const target = +el.dataset.count;
  const dur = 1300;
  const start = performance.now();
  (function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(eased * target) + (p === 1 ? "+" : "");
    if (p < 1) requestAnimationFrame(tick);
  })(start);
}
const countIO = new IntersectionObserver(
  (entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        runCount(en.target);
        countIO.unobserve(en.target);
      }
    });
  },
  { threshold: 0.6 }
);
document.querySelectorAll("[data-count]").forEach((el) => countIO.observe(el));

/* --- Year --- */
document.getElementById("year").textContent = new Date().getFullYear();
