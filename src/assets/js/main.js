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
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  function openNav() {
    if (!nav) return;
    nav.classList.add("is-open");
    if (backdrop) backdrop.classList.add("is-open");
    if (toggle) toggle.setAttribute("aria-expanded", "true");
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

  // Mobile services dropdown accordion
  var dropdownToggle = document.querySelector(".dropdown-toggle");
  var dropdownParent = document.querySelector(".has-dropdown");
  if (dropdownToggle && dropdownParent) {
    dropdownToggle.addEventListener("click", function () {
      var expanded = dropdownParent.classList.toggle("is-expanded");
      dropdownToggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    });
  }

  // Close mobile nav on escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });

  // Contact form stub — no backend yet
  var contactForm = document.querySelector("#contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      // TODO: підключити форму до Telegram-бота або email-сервісу
      var success = document.querySelector("#contact-form-success");
      contactForm.reset();
      if (success) {
        success.classList.add("is-visible");
        success.setAttribute("tabindex", "-1");
        success.focus();
      }
    });
  }
})();
