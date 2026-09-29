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
