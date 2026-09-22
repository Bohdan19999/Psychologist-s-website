(function () {
  "use strict";

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

  // Close mobile nav when a link is clicked (not the dropdown toggle)
  document.querySelectorAll(".main-nav a").forEach(function (link) {
    link.addEventListener("click", closeNav);
  });

  // Services dropdown — click/tap toggle (works alongside CSS :hover on desktop)
  var dropdownToggle = document.querySelector(".dropdown-toggle");
  var dropdownParent = document.querySelector(".has-dropdown");

  function closeDropdown() {
    if (!dropdownParent) return;
    dropdownParent.classList.remove("is-expanded");
    if (dropdownToggle) dropdownToggle.setAttribute("aria-expanded", "false");
  }

  if (dropdownToggle && dropdownParent) {
    dropdownToggle.addEventListener("click", function () {
      var expanded = dropdownParent.classList.toggle("is-expanded");
      dropdownToggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    });

    // Close when focus leaves the dropdown entirely (e.g. Tab past the last item)
    dropdownParent.addEventListener("focusout", function (e) {
      if (!dropdownParent.contains(e.relatedTarget)) closeDropdown();
    });
  }

  // Close dropdown on click/tap outside it
  document.addEventListener("click", function (e) {
    if (dropdownParent && !dropdownParent.contains(e.target)) closeDropdown();
  });

  // Close mobile nav and dropdown on escape
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    closeNav();
    var wasExpanded = dropdownParent && dropdownParent.classList.contains("is-expanded");
    closeDropdown();
    if (wasExpanded && dropdownToggle) dropdownToggle.focus();
  });

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
        .then(function () {
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
