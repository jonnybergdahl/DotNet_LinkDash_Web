// Search in the top bar, from the Bergdahl web app template. search() asks the server
// (HomeController.Search, URL in data-search-url) for matching pages, groups and links.
//
// Keys: Ctrl/⌘ K or "/" focuses the field, arrow keys move through results,
// Enter opens the selected one, Escape closes.
// On phones the field is hidden behind a search icon and covers the top bar when opened.

(function () {
  const root = document.querySelector("[data-search]");
  if (!root) return;

  const topbar = root.closest(".topbar");
  const input = root.querySelector("[data-search-input]");
  const results = root.querySelector("[data-search-results]");
  const shortcut = root.querySelector("[data-search-shortcut]");
  const openButton = document.querySelector("[data-search-open]");
  const closeButton = root.querySelector("[data-search-close]");
  const DELAY_MS = 150;

  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  if (shortcut) shortcut.textContent = isMac ? "⌘ K" : "Ctrl K";

  let items = [];
  let selected = -1;
  let timer = 0;
  let request = null;

  // Returns [{ title, subtitle, icon, url, external }].
  async function search(query) {
    request?.abort();
    request = new AbortController();
    const url = `${root.dataset.searchUrl}?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, { signal: request.signal, headers: { Accept: "application/json" } });
    return response.ok ? response.json() : [];
  }

  async function render() {
    const query = input.value.trim();
    if (!query) {
      request?.abort();
      items = [];
      results.replaceChildren();
      setOpen(false);
      return;
    }

    try {
      items = await search(query);
    } catch (e) {
      if (e.name === "AbortError") return; // a newer search replaced this one
      items = [];
    }
    if (input.value.trim() !== query) return;

    selected = items.length ? 0 : -1;
    results.replaceChildren();

    if (!items.length) {
      const empty = document.createElement("li");
      empty.className = "search-empty";
      empty.textContent = `No results for “${query}”`;
      results.append(empty);
    }

    items.forEach((item, i) => {
      const li = document.createElement("li");
      li.className = "search-result";
      li.id = `search-result-${i}`;
      li.setAttribute("role", "option");
      li.innerHTML = '<span class="icon"></span><span><span></span><small></small></span>';
      li.querySelector(".icon").textContent = item.icon;
      li.querySelector("span:last-child > span").textContent = item.title;
      li.querySelector("small").textContent = item.subtitle;
      li.addEventListener("mousedown", (e) => e.preventDefault()); // keep focus in the field
      li.addEventListener("click", () => go(item));
      results.append(li);
    });

    setOpen(document.activeElement === input);
    highlight();
  }

  function scheduleRender() {
    clearTimeout(timer);
    timer = setTimeout(render, DELAY_MS);
  }

  function highlight() {
    [...results.querySelectorAll(".search-result")].forEach((li, i) => {
      li.setAttribute("aria-selected", String(i === selected));
      if (i === selected) li.scrollIntoView({ block: "nearest" });
    });
    if (selected >= 0) input.setAttribute("aria-activedescendant", `search-result-${selected}`);
    else input.removeAttribute("aria-activedescendant");
  }

  function setOpen(open) {
    results.hidden = !open;
    input.setAttribute("aria-expanded", String(open));
  }

  // Links open the linked site in a new tab, like on the dashboard; pages and groups open here.
  function go(item) {
    close();
    if (item.external) {
      window.open(item.url, "_blank", "noopener,noreferrer");
    } else {
      location.href = item.url;
    }
  }

  function close() {
    clearTimeout(timer);
    request?.abort();
    input.value = "";
    items = [];
    setOpen(false);
    topbar.classList.remove("search-active");
    input.blur();
  }

  input.addEventListener("input", scheduleRender);
  input.addEventListener("focus", () => input.value && render());
  input.addEventListener("blur", () => setOpen(false));

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!items.length) return;
      e.preventDefault();
      selected = (selected + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
      highlight();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (items[selected]) go(items[selected]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close();
    }
  });

  function openSearch() {
    topbar.classList.add("search-active");
    input.focus();
    input.select();
  }

  openButton?.addEventListener("click", openSearch);
  closeButton?.addEventListener("click", close);

  // Ctrl/⌘ K anywhere, or "/" when not typing in another field
  document.addEventListener("keydown", (e) => {
    const typing = e.target.closest?.("input, textarea, select, [contenteditable]");
    if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
      e.preventDefault();
      openSearch();
    }
  });
})();
