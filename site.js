const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.getElementById("primary-navigation");
function closeMenu() {
  if (!menuToggle || !primaryNav) return;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.textContent = "Menu";
  primaryNav.classList.remove("is-open");
}
menuToggle?.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.textContent = open ? "Close" : "Menu";
  primaryNav?.classList.toggle("is-open", open);
});
primaryNav?.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && primaryNav?.classList.contains("is-open")) {
    closeMenu();
    menuToggle.focus();
  }
});
document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = String(new Date().getFullYear());
});

// Keep the diagnostic email dialog keyboard accessible as audit.js opens it.
const emailModal = document.getElementById("email-modal");
if (emailModal) {
  let returnFocus = null;
  let wasOpen = false;
  const isOpen = () => emailModal.style.display === "flex";
  new MutationObserver(() => {
    const open = isOpen();
    if (open && !wasOpen) {
      returnFocus = document.activeElement;
      document.getElementById("email-input")?.focus();
    } else if (!open && wasOpen) {
      returnFocus?.focus();
    }
    wasOpen = open;
  }).observe(emailModal, { attributes: true, attributeFilter: ["style"] });
  emailModal.addEventListener("keydown", (event) => {
    if (!isOpen()) return;
    if (event.key === "Escape") {
      document.getElementById("close-email-modal")?.click();
      return;
    }
    if (event.key !== "Tab") return;
    const controls = [...emailModal.querySelectorAll("input, button")].filter(
      (el) => !el.disabled,
    );
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  });
}
