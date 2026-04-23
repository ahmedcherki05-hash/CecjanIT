(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // =========================
  // Config (easy to edit)
  // =========================
  const BRAND = {
    name: "CecjanIT",
    email: "ahmedcherki05@gmail.com",
  };

  // =========================
  // Header elevation on scroll
  // =========================
  const header = $(".site-header");
  const updateHeader = () => {
    const elevated = window.scrollY > 8;
    header?.classList.toggle("is-elevated", elevated);
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  // =========================
  // Mobile nav toggle + close
  // =========================
  const navToggle = $(".nav-toggle");
  const navMenu = $("#navMenu");

  const setMenuOpen = (open) => {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute("aria-expanded", String(open));
    navMenu.classList.toggle("is-open", open);
  };

  navToggle?.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    setMenuOpen(!isOpen);
  });

  // Close menu on link click (mobile)
  $$(".nav-link, .nav-cta", navMenu || document).forEach((a) => {
    a.addEventListener("click", () => setMenuOpen(false));
  });

  // Close menu on outside click (mobile)
  document.addEventListener("click", (e) => {
    if (!navToggle || !navMenu) return;
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    if (!isOpen) return;
    const target = e.target;
    if (!(target instanceof Node)) return;
    const clickedInside = navMenu.contains(target) || navToggle.contains(target);
    if (!clickedInside) setMenuOpen(false);
  });

  // =========================
  // Scroll reveal animations
  // =========================
  const revealEls = $$(".reveal");
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { root: null, threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    // Fallback: show everything
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // =========================
  // Footer year
  // =========================
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // =========================
  // Lead form: validation + mailto
  // =========================
  const form = $("#leadForm");
  const success = $(".form-success", form || document);

  const getField = (name) => $(`#${name}`, form || document);
  const getError = (name) => $(`[data-error-for="${name}"]`, form || document);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const setError = (name, msg) => {
    const err = getError(name);
    const input = getField(name);
    if (err) err.textContent = msg || "";
    input?.setAttribute("aria-invalid", msg ? "true" : "false");
  };

  const getValues = () => {
    const name = (getField("name")?.value || "").trim();
    const email = (getField("email")?.value || "").trim();
    const message = (getField("message")?.value || "").trim();
    return { name, email, message };
  };

  const validate = () => {
    const { name, email, message } = getValues();
    let ok = true;

    if (name.length < 2) {
      setError("name", "Please enter your name.");
      ok = false;
    } else setError("name", "");

    if (!validateEmail(email)) {
      setError("email", "Please enter a valid email address.");
      ok = false;
    } else setError("email", "");

    if (message.length < 10) {
      setError("message", "Please add a short message (at least 10 characters).");
      ok = false;
    } else setError("message", "");

    return ok;
  };

  const buildMailto = ({ name, email, message }) => {
    const subject = encodeURIComponent(`New lead — ${BRAND.name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\n---\nSent from ${BRAND.name} landing page.`
    );
    return `mailto:${BRAND.email}?subject=${subject}&body=${body}`;
  };

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (success) success.hidden = true;

    if (!validate()) return;

    const values = getValues();

    // Open user's email client with a filled draft (no backend required)
    window.location.href = buildMailto(values);

    if (success) success.hidden = false;
    form.reset();
  });
})();

