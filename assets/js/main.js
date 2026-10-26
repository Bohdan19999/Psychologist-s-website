(function () {
  "use strict";

  // Reload (F5) always opens the page at the top: drop the anchor left in the URL by menu clicks,
  // and don't let the browser restore the old scroll position. A shared /#vidguky link opened in
  // a new tab is a "navigate", not a "reload", so it still scrolls to its section.
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  var navEntry = performance.getEntriesByType ? performance.getEntriesByType("navigation")[0] : null;
  var isReload = navEntry ? navEntry.type === "reload" : (performance.navigation && performance.navigation.type === 1);
  if (isReload) {
    var userScrolled = false;
    var markScrolled = function () { userScrolled = true; };
    var jumpToTop = function () {
      if (userScrolled) return;
      var root = document.documentElement;
      root.style.scrollBehavior = "auto"; // no visible smooth-scroll animation back up
      window.scrollTo(0, 0);
      root.style.scrollBehavior = "";
    };
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
    ["wheel", "touchstart", "keydown"].forEach(function (ev) {
      window.addEventListener(ev, markScrolled, { once: true, passive: true });
    });
    jumpToTop();
    window.addEventListener("load", jumpToTop);
  }

  // Mobile navigation toggle
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  var backdrop = document.querySelector(".nav-backdrop");

  function closeNav() {
    if (!nav) return;
    nav.classList.remove("is-open");
    if (backdrop) backdrop.classList.remove("is-open");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Відкрити меню");
    }
    document.body.style.overflow = "";
  }

  function openNav() {
    if (!nav) return;
    nav.classList.add("is-open");
    if (backdrop) backdrop.classList.add("is-open");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Закрити меню");
    }
    document.body.style.overflow = "hidden";
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.contains("is-open");
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });
  }
  if (backdrop) backdrop.addEventListener("click", closeNav);

  // Close mobile nav when a link is clicked (anchor links scroll the landing page)
  document.querySelectorAll(".main-nav a").forEach(function (link) {
    link.addEventListener("click", closeNav);
  });

  // Close mobile nav on escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });

  // Arriving from another page via /#anchor: web fonts swap in after the initial jump and shift
  // the layout, so re-align the target once fonts are ready (otherwise it ends up under the header).
  // Skipped on reload — the hash has already been cleared above.
  if (!isReload && location.hash.length > 1 && document.fonts && document.fonts.ready) {
    var hashTarget = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (hashTarget) {
      document.fonts.ready.then(function () { hashTarget.scrollIntoView({ block: "start" }); });
    }
  }

  // Anchor menu — highlight the section currently in view (landing page only)
  var spyLinks = Array.prototype.slice.call(document.querySelectorAll('.main-nav a[href^="#"]'));
  if (spyLinks.length && "IntersectionObserver" in window) {
    var spyMap = {};
    spyLinks.forEach(function (link) { spyMap[link.getAttribute("href").slice(1)] = link; });
    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        spyLinks.forEach(function (link) { link.classList.remove("is-active"); });
        // Hero and FAQ have no menu item — entering them clears the highlight
        if (spyMap[entry.target.id]) spyMap[entry.target.id].classList.add("is-active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main > section").forEach(function (section) {
      spyObserver.observe(section);
    });
  }

  // Service cards — an opened card spans the full row; keep it in view after the grid reflows
  document.querySelectorAll(".service-card .service-more").forEach(function (details) {
    var card = details.closest(".service-card");
    details.addEventListener("toggle", function () {
      card.classList.toggle("is-open", details.open);
      if (!details.open) return;
      var top = card.getBoundingClientRect().top;
      if (top < 80 || top > window.innerHeight * 0.6) {
        card.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Testimonials — show the first N, reveal the rest with "Показати ще"
  var testimonials = document.querySelector(".testimonials[data-visible]");
  if (testimonials) {
    var limit = parseInt(testimonials.getAttribute("data-visible"), 10) || 6;
    var items = testimonials.querySelectorAll(".testimonial");
    var moreWrap = document.querySelector(".testimonials-more-wrap");
    if (items.length > limit && moreWrap) {
      for (var i = limit; i < items.length; i++) items[i].classList.add("is-hidden");
      moreWrap.hidden = false;
      moreWrap.querySelector("button").addEventListener("click", function () {
        var firstHidden = testimonials.querySelector(".testimonial.is-hidden");
        testimonials.querySelectorAll(".testimonial.is-hidden").forEach(function (item) { item.classList.remove("is-hidden"); });
        moreWrap.hidden = true;
        if (firstHidden) {
          firstHidden.setAttribute("tabindex", "-1");
          firstHidden.focus();
        }
      });
    }
  }

  // Certificates carousel — one scrollable row with prev/next arrows and keyboard control
  var certCarousel = document.querySelector(".cert-carousel");
  if (certCarousel) {
    var certViewport = certCarousel.querySelector(".cert-viewport");
    var certSlides = Array.prototype.slice.call(certCarousel.querySelectorAll(".cert-slide"));
    var certPrev = certCarousel.querySelector(".cert-nav--prev");
    var certNext = certCarousel.querySelector(".cert-nav--next");
    var certLive = certCarousel.querySelector(".cert-status");
    var certScrollTimer = null;

    function certCurrentIndex() {
      var pos = certViewport.scrollLeft;
      var closest = 0;
      var minDiff = Infinity;
      certSlides.forEach(function (slide, i) {
        var diff = Math.abs(slide.offsetLeft - certViewport.offsetLeft - pos);
        if (diff < minDiff) { minDiff = diff; closest = i; }
      });
      return closest;
    }

    function certAnnounce(index) {
      if (!certLive) return;
      var img = certSlides[index].querySelector("img");
      certLive.textContent = "Показано сертифікат " + (index + 1) + " з " + certSlides.length + (img ? ": " + img.alt : "");
    }

    function certGoToSlide(index) {
      index = Math.max(0, Math.min(certSlides.length - 1, index));
      certSlides[index].scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
      certAnnounce(index);
    }

    if (certPrev) certPrev.addEventListener("click", function () { certGoToSlide(certCurrentIndex() - 1); });
    if (certNext) certNext.addEventListener("click", function () { certGoToSlide(certCurrentIndex() + 1); });

    certCarousel.setAttribute("tabindex", "0");
    certCarousel.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); certGoToSlide(certCurrentIndex() - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); certGoToSlide(certCurrentIndex() + 1); }
    });

    // Keep the live-region in sync with free swipe/drag scrolling too
    certViewport.addEventListener("scroll", function () {
      clearTimeout(certScrollTimer);
      certScrollTimer = setTimeout(function () { certAnnounce(certCurrentIndex()); }, 120);
    }, { passive: true });
  }

  // Certificates thumbnails — click (or Enter/Space, native to <button>) opens a full-size lightbox
  var certThumbs = Array.prototype.slice.call(document.querySelectorAll(".cert-thumb"));
  if (certThumbs.length) {
    var certLightbox = document.querySelector(".cert-lightbox");
    var certLightboxImg = certLightbox ? certLightbox.querySelector("img") : null;
    var certLightboxClose = certLightbox ? certLightbox.querySelector(".cert-lightbox-close") : null;
    var certLightboxTrigger = null;

    function openLightbox(img, trigger) {
      if (!certLightbox || !certLightboxImg) return;
      certLightboxTrigger = trigger;
      certLightboxImg.src = img.src;
      certLightboxImg.alt = img.alt;
      certLightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
      if (certLightboxClose) certLightboxClose.focus();
    }

    function closeLightbox() {
      if (!certLightbox) return;
      certLightbox.classList.remove("is-open");
      document.body.style.overflow = "";
      if (certLightboxImg) certLightboxImg.src = "";
      if (certLightboxTrigger) certLightboxTrigger.focus();
    }

    certThumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        var img = thumb.querySelector("img");
        if (img) openLightbox(img, thumb);
      });
    });

    if (certLightboxClose) certLightboxClose.addEventListener("click", closeLightbox);
    if (certLightbox) {
      certLightbox.addEventListener("click", function (e) {
        if (e.target === certLightbox) closeLightbox();
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && certLightbox && certLightbox.classList.contains("is-open")) {
        closeLightbox();
      }
    });
  }

  // Contact form — submitted to Netlify Forms via AJAX so we can show an inline success message
  var contactForm = document.querySelector("#contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var success = document.querySelector("#contact-form-success");
      var body = new URLSearchParams(new FormData(contactForm)).toString();

      fetch("/kontakty/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Form submit failed: " + res.status);
          contactForm.reset();
          if (success) {
            success.classList.add("is-visible");
            success.setAttribute("tabindex", "-1");
            success.focus();
          }
        })
        .catch(function () {
          contactForm.submit();
        });
    });
  }
})();
