/* ══════════════════════════════════════════
   丁心怡 · 新媒体运营作品集
   动效引擎：滚动进度 / 滚动进入 / 数字滚动 / 卡片翻转 / 倾斜视差 / 平滑锚点
   ══════════════════════════════════════════ */

(function () {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ────────────── 1. 滚动进度条 ────────────── */
  const progressBar = document.getElementById("scrollProgress");
  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + "%";
  }

  /* ────────────── 2. 灵动岛滚动收缩 ────────────── */
  const navIsland = document.getElementById("navIsland");
  function onScrollUI() {
    if (window.scrollY > 60) navIsland.classList.add("scrolled");
    else navIsland.classList.remove("scrolled");
    updateProgress();
  }

  /* ────────────── 3. 滚动进入动画（IntersectionObserver） ────────────── */
  const revealEls = document.querySelectorAll(
    ".reveal-up, .reveal-item, .tl-item, .timeline, .stat"
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          if (entry.target.classList.contains("stat")) {
            startCountUp(entry.target);
          }
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -40px 0px" }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  /* ────────────── 4. 数字滚动（CountUp） ────────────── */
  const countUpMap = new WeakMap();

  function startCountUp(statEl) {
    if (countUpMap.has(statEl)) return;
    countUpMap.set(statEl, true);

    const valueEl = statEl.querySelector(".stat-value");
    if (!valueEl || reducedMotion) return;

    const target = parseFloat(valueEl.dataset.target || "0");
    const decimals = parseInt(valueEl.dataset.decimals || "0", 10);
    const prefix = valueEl.dataset.prefix || "";
    const suffix = valueEl.dataset.suffix || "";
    const duration = 1600;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = target * eased;
      valueEl.textContent = prefix + current.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ────────────── 5. 卡片翻转（抽卡玩法） ────────────── */
  const flipCards = document.querySelectorAll("[data-flip]");
  flipCards.forEach((card) => {
    card.addEventListener("click", () => {
      card.classList.toggle("flipped");
    });
  });

  /* ────────────── 6. 卡片倾斜视差（仅桌面 + 非减动效） ────────────── */
  if (!reducedMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const tiltCards = document.querySelectorAll(".tilt");
    tiltCards.forEach((card) => {
      // 记录 CSS 预设的基础旋转角度（来自 nth-child 错落）
      const base = (function () {
        const m = /rotate\(([-\d.]+)deg\)/.exec(getComputedStyle(card).transform);
        if (!m) return 0;
        // getComputedStyle 返回 matrix()，需要换算
        const styles = getComputedStyle(card);
        const matrix = new DOMMatrix(styles.transform);
        const radians = Math.atan2(matrix.b, matrix.a);
        return (radians * 180) / Math.PI;
      })();
      card.dataset.baseRotate = String(base);

      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `rotate(${base + x * 6}deg) translateY(-6px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = `rotate(${base}deg)`;
      });
    });
  }

  /* ────────────── 6.5 作品图 3D 倾斜视差（跟随鼠标轻微转动） ────────────── */
  if (!reducedMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".work-img-wrap").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${y * -7}deg)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ────────────── 7. 经历卡片指针跟随倾斜 ────────────── */
  if (!reducedMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".tl-card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${x * 5}deg) rotateX(${y * -5}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ────────────── 8. 作品图灯箱 ────────────── */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxClose = document.getElementById("lightboxClose");

  document.querySelectorAll(".work-img-wrap img, .project-cover img").forEach((img) => {
    img.addEventListener("click", (e) => {
      e.stopPropagation();
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxCaption.textContent = img.alt;
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
    });
  });

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
  }

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  lightboxClose.addEventListener("click", closeLightbox);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });

  /* ────────────── 初始化 ────────────── */
  window.addEventListener("scroll", onScrollUI, { passive: true });
  window.addEventListener("resize", updateProgress, { passive: true });
  onScrollUI();

  // Hero 进入视口时触发 reveal 动画（首屏立即播）
  const heroEls = document.querySelectorAll(".hero .reveal-up");
  requestAnimationFrame(() => {
    heroEls.forEach((el) => el.classList.add("in-view"));
  });
})();
