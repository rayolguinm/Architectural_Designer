/* ---------- Scroll progress ---------- */
const progress = document.getElementById("progress");
function updateProgress() {
  const h = document.documentElement;
  const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
  progress.style.width = (scrolled * 100) + "%";
}
window.addEventListener("scroll", updateProgress, { passive: true });

/* ---------- Active section tracking (drives both desktop + mobile nav) ---------- */
const sidenav = document.getElementById("sidenav");
const mobileBottomnav = document.getElementById("mobile-bottomnav");
const mobileLabel = document.getElementById("m-section-label");
const navLinks = sidenav.querySelectorAll("a");
const mobileNavLinks = mobileBottomnav.querySelectorAll("a");
const sections = [...navLinks].map(a => document.getElementById(a.dataset.target)).filter(Boolean);

/* Map section id -> human label for mobile top bar */
const sectionLabels = window.SECTION_LABELS || {};

function setActive() {
  const y = window.scrollY + window.innerHeight * 0.35;
  let active = sections[0];
  for (const s of sections) { if (s.offsetTop <= y) active = s; }
  const activeId = active.id;
  navLinks.forEach(a => a.classList.toggle("active", a.dataset.target === activeId));
  mobileNavLinks.forEach(a => a.classList.toggle("active", a.dataset.target === activeId));
  /* Update mobile top bar label */
  if (mobileLabel && sectionLabels[activeId]) {
    mobileLabel.textContent = sectionLabels[activeId];
  }
  /* Auto-scroll bottom nav so active tab stays visible on narrow screens */
  const activeMobileLink = mobileBottomnav.querySelector("a.active");
  if (activeMobileLink) {
    activeMobileLink.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }
}
window.addEventListener("scroll", setActive, { passive: true });
setActive();

/* ---------- Intersection Observer for reveals ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("is-visible"); });
}, { threshold: 0.12, rootMargin: "0px 0px -80px 0px" });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

/* ---------- Justified gallery layout ----------
   Category-based pairing: items only pair with others of the same aspect
   category (portrait / near-square / landscape). Panoramas and items that
   can't find a compatible partner take the full row as an editorial
   statement — intentional negative space, not accidental. */

function aspectCategory(ratio) {
  if (ratio > 2.2) return "panorama";        // always full-row
  if (ratio >= 1.25 && ratio <= 2.2) return "landscape";
  if (ratio >= 0.85 && ratio < 1.25) return "square";  // always full-row
  return "portrait";                          // pairs with other portraits
}

function layoutGalleries() {
  const galleries = document.querySelectorAll(".gallery");
  galleries.forEach(gallery => {
    const figures = [...gallery.querySelectorAll(".gallery-figure")];
    if (!figures.length) return;

    // Reset
    figures.forEach(f => {
      f.classList.remove("full-row");
      f.style.width = "";
      f.style.flex = "";
    });

    // Read aspects
    const items = figures.map(f => {
      const img = f.querySelector("img");
      if (!img.naturalWidth) return null;
      const ratio = img.naturalWidth / img.naturalHeight;
      return { f, ratio, cat: aspectCategory(ratio) };
    });
    if (items.some(x => x === null)) return;

    // Container width
    const cs = getComputedStyle(gallery);
    const pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const containerWidth = gallery.clientWidth - pad;
    const gap = parseFloat(cs.gap) || 28;

    // Build rows: pair consecutively only if same category AND pairable category
    const rows = [];
    let i = 0;
    while (i < items.length) {
      const a = items[i];
      const pairable = (a.cat === "landscape" || a.cat === "portrait");
      if (pairable && i + 1 < items.length) {
        const b = items[i + 1];
        if (b.cat === a.cat) {
          // Pair them
          rows.push([a, b]);
          i += 2;
          continue;
        }
      }
      // Solo full-row
      rows.push([a]);
      i += 1;
    }

    // Apply widths
    rows.forEach(row => {
      if (row.length === 1) {
        row[0].f.classList.add("full-row");
        return;
      }
      const sumAspects = row[0].ratio + row[1].ratio;
      const rowHeight = (containerWidth - gap) / sumAspects;
      row.forEach(item => {
        const w = rowHeight * item.ratio;
        item.f.style.width = w + "px";
        item.f.style.flex = "0 0 " + w + "px";
      });
    });
  });
}

// Run on image loads + on resize
function waitForImagesThenLayout() {
  const imgs = [...document.querySelectorAll(".gallery-figure img")];
  let remaining = imgs.length;
  if (!remaining) return layoutGalleries();
  imgs.forEach(img => {
    if (img.complete && img.naturalWidth) {
      if (--remaining === 0) layoutGalleries();
    } else {
      img.addEventListener("load", () => {
        if (--remaining === 0) layoutGalleries();
      });
      img.addEventListener("error", () => {
        if (--remaining === 0) layoutGalleries();
      });
    }
  });
}
waitForImagesThenLayout();

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(layoutGalleries, 120);
});

/* ---------- Lightbox ---------- */
const lb = document.getElementById("lightbox");
const lbImg = document.getElementById("lightbox-img");
const lbClose = document.getElementById("lightbox-close");
let lbItems = [];
let lbIndex = 0;

function openLightbox(imgEl) {
  lbItems = [...document.querySelectorAll(".zoomable img")];
  lbIndex = lbItems.indexOf(imgEl);
  lbImg.src = imgEl.src;
  lb.classList.add("open");
  lb.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeLightbox() {
  lb.classList.remove("open");
  lb.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
function navLightbox(dir) {
  if (!lbItems.length) return;
  lbIndex = (lbIndex + dir + lbItems.length) % lbItems.length;
  lbImg.src = lbItems[lbIndex].src;
}
document.querySelectorAll(".zoomable").forEach(el => {
  el.addEventListener("click", () => {
    const img = el.querySelector("img");
    if (img) openLightbox(img);
  });
});
lbClose.addEventListener("click", (e) => { e.stopPropagation(); closeLightbox(); });
lb.addEventListener("click", (e) => { if (e.target === lb || e.target === lbImg) closeLightbox(); });

/* ---------- Keyboard nav ---------- */
document.addEventListener("keydown", (e) => {
  if (lb.classList.contains("open")) {
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowRight") navLightbox(1);
    else if (e.key === "ArrowLeft") navLightbox(-1);
    return;
  }
  if (/^[1-9]$/.test(e.key)) {
    const target = document.getElementById("p0" + e.key);
    if (target) target.scrollIntoView({ behavior: "smooth" });
  }
  if (e.key === "Home") window.scrollTo({ top: 0, behavior: "smooth" });
  if (e.key === "End") window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
});