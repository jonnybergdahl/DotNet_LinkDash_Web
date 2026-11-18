# Agent instructions

LinkDash is built on the [Bergdahl web app template](https://github.com/jonnybergdahl/Web_Bergdahl_Template). Keep the template's shell, look and conventions below, and put LinkDash's own features inside them. Where LinkDash differs from the template, this file says so.

## Projects

| Project | Purpose |
| --- | --- |
| `src/Bergdahl.LinkDash.Web` | ASP.NET Core MVC app (.NET 10): the dashboard, the settings pages and sign-in. |
| `src/Bergdahl.LinkDash.Core` | Models, JSON file storage and the link service. |
| `src/Bergdahl.LinkDash.Tests` | NUnit unit tests and in-memory integration tests. |

Run the app with `dotnet run --project src/Bergdahl.LinkDash.Web` and the tests with `dotnet test LinkDash_DotNet_Web.slnx`.

## How LinkDash differs from the template

- **Server-rendered pages.** Each page is its own Razor view, not a `<section>` in one `index.html`. The template's hash router is left out of `js/app.js`; menu entries are ordinary links, and `_Layout.cshtml` marks the current one with `aria-current="page"` from `ViewData["Page"]` (values in `AppInfo.Pages`).
- **Real sign-in.** The template's placeholder `js/auth.js` is not used. The server enforces access with cookie authentication: the dashboard is public, the settings pages need the administrator account (see the README). The login screen is `_LoginLayout.cshtml`, which renders `<html data-auth="out">` and only the `.login` card.
- **Account menu when signed out.** The dashboard is public, so the account menu shows **Sign in** for visitors, and the user name, **Account** and **Logout** when signed in. Logout is a POST form, so it carries the antiforgery token.
- **Search.** `js/search.js` calls `HomeController.Search` (`/Home/Search?q=`) for matching pages, groups and links. Pages and groups open in the app; links open the linked site in a new tab, like on the dashboard.
- **User-picked icons.** Groups and links have icons chosen by the user from [Material Design Icons](https://pictogrammers.com/library/mdi/) (written like in Home Assistant, `mdi:home`), or a link's own favicon. These are content, not UI, and are the only exception to "Material Symbols only". Everything else in the UI uses Material Symbols.
- **Snackbar.** After a change the settings pages redirect and show a short confirmation in a `.snackbar` overlay (`TempData[SettingsController.MessageKey]`), which hides itself after a few seconds.

## Files

| Path (under `src/Bergdahl.LinkDash.Web`) | Purpose |
| --- | --- |
| `Views/Shared/_Layout.cshtml` | The shell: top bar, left menu, main area, footer. |
| `Views/Shared/_Head.cshtml` | The `<head>` shared by both layouts: title, icons, fonts, CSS and `theme.js`. |
| `Views/Shared/_LoginLayout.cshtml` | The login screen used by sign-in and create account. |
| `AppInfo.cs` | App name, repository URL and the `ViewData["Page"]` values. |
| `wwwroot/css/theme.css` | Design tokens, copied unchanged from the template. |
| `wwwroot/css/app.css` | Layout and base components, copied unchanged from the template. |
| `wwwroot/css/site.css` | LinkDash's own components (dashboard cards, link list, tables, icon picker, snackbar) and small template additions. Uses tokens only. |
| `wwwroot/js/theme.js` | Theme switching, copied unchanged from the template. |
| `wwwroot/js/app.js` | The template's menu groups, mobile drawer and dropdowns, without the hash router. |
| `wwwroot/js/search.js` | The template's top-bar search, with `search()` calling the server. |
| `wwwroot/js/site.js` | Delete confirmations, the group picker, the dashboard's masonry layout, favicons and the icon picker. |
| `wwwroot/img/app-icon.svg` | The app icon: a chain link and arrow on brand blue. |

Keep `theme.css`, `app.css` and `theme.js` identical to the template so they can be updated by copying. Put LinkDash changes in `site.css` and `site.js`.

## Layout rules

```
┌────────────────────────────────────────┐
│ topbar: icon + name . search . actions │
├──────────┬─────────────────────────────┤
│ sidebar  │ main (pages)                │
│ (menu)   │                             │
├──────────┴─────────────────────────────┤
│ footer: copyright line                 │
└────────────────────────────────────────┘
```

- **Top bar**: left, the app icon and name in `.app-title`, linking to the dashboard. Centre, the search field. Right, action icons as `<button class="icon-button">` before the theme toggle; the order at the right end is always: app icons, theme toggle, account menu. Every icon button needs an `aria-label` and a `title`.
- **Left menu**: **Dashboard**, then a **Settings** section (`<li class="nav-section">`) with **Groups** and **Links**. Entries are `<li><a class="nav-link" …><span class="icon">icon_name</span>Label</a></li>`. Keep labels short.
- **Main**: each view starts with `<section class="page">` and a `<header class="page-header">` holding an `<h1>` and an optional one-line `<p>`. Set `ViewData["Title"]` to the `<h1>` text (it becomes the tab title, `Title · LinkDash`) and `ViewData["Page"]` to the menu entry. The dashboard adds `page-wide` to use the full width.
- **Page actions**: a page's primary action (Add group, Add link) goes at the right of the page header, using `.page-header-actions`.
- **Sub pages** (add and edit forms) start their page header with `<p class="breadcrumb">Groups</p>` (or `Links`) above the `<h1>`, and keep their parent's menu entry highlighted.
- **Footer**: one centred, muted line, `LinkDash, Copyright© <year>, Jonny Bergdahl, GitHub`. Don't add anything else.
- Below 800px wide the menu becomes a drawer opened with the menu button. Don't remove that button.

### Adding a page

1. Add a controller action and a view that starts with `<section class="page">` and a page header.
2. Add a value to `AppInfo.Pages`, set it as `ViewData["Page"]` in the view, and add a menu entry in `_Layout.cshtml`.
3. If the page should be found by the search, add it to the page list in `HomeController.Search`.

## Forms

Use the template's markup:

- **Fields**: `<label class="field"><span>Label</span><input asp-for="…"><span asp-validation-for="…" class="field-error"></span></label>`. Use `@Html.DisplayNameFor` for the label text. Add `<small class="field-hint">` for help text.
- **Select**: wrap the `<select>` in `<span class="select">`.
- **Checkbox**: `<label class="check"><input type="checkbox"><span>Label</span></label>`.
- **Layout**: fields go in a `.card` with a `.form-grid`. The validation summary (`asp-validation-summary="ModelOnly"`, class `field-error`) goes first in the card.
- **Actions**: a `.form-actions` row after the card: one primary `.button` (Add or Save) first, then `.button.secondary` (Cancel).
- Every control needs a visible label. Placeholders are only for examples.

## Theme, icons and design

These come straight from the template:

- Use only the CSS variables in `theme.css` for colour. Never hard-code colours. Check every change in both light and dark.
- UI icons are Material Symbols Outlined: `<span class="icon">icon_name</span>`. Filled icons only for the active menu entry. User-picked group and link icons are the MDI exception above.
- Brand colours: grey `#838281`, blue `#0093dd`. Links, the active menu entry and accent icons use `--color-accent`; primary buttons use `--color-primary` (the logo blue).
- Clean and quiet: lots of whitespace, few borders, no gradients, shadows only for overlays (dropdowns, the drawer, the snackbar). One primary button per view.
- Group content in `.card`. Dashboard group cards all have a `.card-header` with the group's icon and name.
- Tables: `<div class="table-wrap"><table class="table">…</table></div>` inside a card, with `class="num"` on number columns.
- Use the spacing and radius tokens instead of arbitrary values. Transitions use `--transition` and respect `prefers-reduced-motion`.

## Accessibility

- Use real `<button>` and `<a>` elements. Icon-only buttons need an `aria-label`.
- Keep visible focus outlines.
- Text must meet WCAG AA contrast in both themes.
- Keep the layout usable at 375px wide with no horizontal scrolling.
