// App shell behaviour, from the Bergdahl web app template: menu groups, the mobile navigation drawer and dropdown menus.
//
// LinkDash renders each page on the server, so the template's hash router is left out: menu entries are
// ordinary links and the layout marks the current one with aria-current="page".

(function () {
  const app = document.querySelector(".app");
  if (!app) return;

  const menuToggle = document.querySelector("[data-menu-toggle]");
  const scrim = document.querySelector(".scrim");
  const navGroups = [...document.querySelectorAll("[data-nav-group]")];

  // ---------- Menu groups ----------
  // <li data-nav-group><button class="nav-group-toggle" aria-expanded aria-controls="id">…</button><ul id="id" hidden>…</ul></li>

  function setGroupOpen(group, open) {
    const toggle = group.querySelector(".nav-group-toggle");
    document.getElementById(toggle.getAttribute("aria-controls")).hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
  }

  for (const group of navGroups) {
    group.querySelector(".nav-group-toggle").addEventListener("click", (e) => {
      setGroupOpen(group, e.currentTarget.getAttribute("aria-expanded") !== "true");
    });
    // Highlight the group of the current page and make sure it is open.
    if (group.querySelector("[aria-current='page']")) {
      group.classList.add("has-active");
      setGroupOpen(group, true);
    }
  }

  // ---------- Mobile drawer ----------

  function setNavOpen(open) {
    app.classList.toggle("nav-open", open);
    menuToggle?.setAttribute("aria-expanded", String(open));
  }

  menuToggle?.addEventListener("click", () => setNavOpen(!app.classList.contains("nav-open")));
  scrim?.addEventListener("click", () => setNavOpen(false));

  // ---------- Dropdown menus ----------
  // Markup: <div data-dropdown><button data-dropdown-toggle>…</button><div class="dropdown-menu" hidden>…</div></div>

  function closeDropdowns(except) {
    for (const dropdown of document.querySelectorAll("[data-dropdown]")) {
      if (dropdown === except) continue;
      dropdown.querySelector(".dropdown-menu").hidden = true;
      dropdown.querySelector("[data-dropdown-toggle]").setAttribute("aria-expanded", "false");
    }
  }

  function menuItems(dropdown) {
    return [...dropdown.querySelectorAll("[role='menuitem']")];
  }

  document.addEventListener("click", (e) => {
    const toggle = e.target.closest("[data-dropdown-toggle]");
    if (toggle) {
      const dropdown = toggle.closest("[data-dropdown]");
      const menu = dropdown.querySelector(".dropdown-menu");
      const open = menu.hidden;
      closeDropdowns(dropdown);
      menu.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      if (open && e.detail === 0) menuItems(dropdown)[0]?.focus(); // opened from the keyboard
      return;
    }
    // Clicking outside, or on an item, closes the menu.
    closeDropdowns(e.target.closest(".dropdown-menu") && !e.target.closest("[role='menuitem']")
      ? e.target.closest("[data-dropdown]")
      : null);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const open = document.querySelector("[data-dropdown] .dropdown-menu:not([hidden])");
      if (open) {
        closeDropdowns();
        open.closest("[data-dropdown]").querySelector("[data-dropdown-toggle]").focus();
      } else {
        setNavOpen(false);
      }
      return;
    }

    // Arrow keys move between items in an open menu.
    const dropdown = e.target.closest?.("[data-dropdown]");
    if (!dropdown || dropdown.querySelector(".dropdown-menu").hidden) return;
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = menuItems(dropdown);
    const step = e.key === "ArrowDown" ? 1 : -1;
    const index = items.indexOf(document.activeElement);
    items[(index + step + items.length) % items.length]?.focus();
  });
})();
