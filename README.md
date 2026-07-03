# FindARepo

A Vue 3 app for searching GitHub repositories, viewing repository details and top contributors, and saving favorites for later.

## Tech stack

- [Vue 3](https://vuejs.org/) (Composition API) with [Vite](https://vite.dev/)
- [Vue Router](https://router.vuejs.org/) for the three routes (search, repository details, favorites)
- Native `fetch` for all GitHub API calls, no HTTP client library
- Plain CSS with a design tokens file, no CSS framework
- [Vitest](https://vitest.dev/) and [@vue/test-utils](https://test-utils.vuejs.org/) (with `jsdom`) for unit tests
- [Playwright](https://playwright.dev/) for end-to-end tests against a running dev server

## Prerequisites

You'll need [Node.js](https://nodejs.org/) (which includes npm) and [Git](https://git-scm.com/) installed. This project requires Node `>=22.22.2` (see `engines` in `package.json`); it was built and tested against Node 22.22.2, which is also pinned in `.tool-versions`.

**Optional: use mise to get the exact Node version automatically.** [mise](https://mise.jdx.dev/) reads `.tool-versions` and installs the matching Node version for you:

```sh
curl https://mise.run | sh
```

Then, from the project directory:

```sh
mise install
```

This is entirely optional, any Node 22+ install (via Homebrew, winget, nvm, apt, or the official installer below) works fine too.

**macOS (Homebrew):**

```sh
brew install node git
```

**Windows (winget):**

```sh
winget install OpenJS.NodeJS.LTS Git.Git
```

Alternatively, download the Node.js installer directly from [nodejs.org](https://nodejs.org/) and Git from [git-scm.com](https://git-scm.com/download/win).

**Linux (Debian/Ubuntu, apt):**

```sh
sudo apt update
sudo apt install nodejs npm git
```

Ubuntu/Debian's default `apt` repositories often carry an older Node version than this project requires. If `node -v` comes back below `22.22.2`, install via [NodeSource](https://github.com/nodesource/distributions), [nvm](https://github.com/nvm-sh/nvm), or mise (see above) instead.

Verify the install with `node -v`, `npm -v`, and `git --version`.

## Setup and run

```sh
git clone https://github.com/Aser-Ghobara/FindARepo.git
cd FindARepo
npm install
npm run dev
```

Runs a dev server at `http://localhost:5173` by default.

To run the unit test suite:

```sh
npm run test
```

To run the end-to-end tests (this starts the dev server for you if one isn't already running):

```sh
npm run test:e2e
```

## Key design and architectural decisions

**Vue 3 Composition API with composables.** Shared, stateful logic lives in composables rather than components: `useRepoSearch` owns search state (query, results, pagination, sort, language filter), `useFavorites` owns the favorites list and its localStorage sync, and `useDebounce` wraps a callback with a cancellable delay. This keeps components focused on rendering and lets the same logic be reused or unit tested independent of any component.

**Centralized API layer.** All GitHub API calls go through `src/api/github.js`, which wraps `fetch` in a single `request()` function. Every failure mode (network failure, rate limiting, a non-2xx response) is normalized into a `GitHubApiError` with a `code` (`NETWORK_ERROR`, `RATE_LIMITED`, `API_ERROR`) and a `status`. Call sites only ever deal with one error type instead of branching on raw `Response` objects or thrown exceptions.

**Plain CSS with a design tokens file.** Colors, spacing, radii, and shadows are defined once as CSS custom properties in `src/assets/tokens.css` and consumed by scoped component styles. No CSS framework is used, the app is small enough that a framework's abstraction cost (bundle size, learning a utility API, fighting its defaults) isn't worth it, while a tokens file still gets consistent theming and a single place to adjust the visual language.

**Request cancellation with AbortController.** Search input is debounced, but a debounce alone doesn't stop an in-flight request from a previous keystroke resolving after a later one and overwriting fresher results. `useRepoSearch` tracks the current `AbortController` and aborts the previous request before starting a new one, so only the latest request can ever update state.

**In-memory result caching.** `useRepoSearch` keeps a module-level `Map` keyed by query, page, sort, and language filter, capped at 20 entries with oldest-first eviction. Repeating a search (e.g. toggling a sort option back and forth) returns instantly from cache instead of re-hitting the API, which also helps conserve the unauthenticated rate limit.

**Top Contributors instead of Open Issues on the details page.** The repo stats grid already surfaces the open issue count as a number, so a separate open issues list would mostly repeat that data. Top contributors surface information not shown anywhere else on the page and only cost one additional API call alongside the repo fetch.

## Known limitations

- No authentication, so all requests are subject to GitHub's unauthenticated rate limit of 60 requests per hour per IP.
- Favorites are stored in `localStorage`, so they're per-browser and don't sync across devices.
- The language filter is a fixed list of common languages rather than one derived dynamically from GitHub's supported language list.

## Potential future improvements

- Authenticated requests (OAuth or a personal access token) for a much higher rate limit.
- Persisting sort and language filter preferences across sessions.
- Expanding unit test coverage from composables and the API layer to components.
- Replacing the unbounded-for-the-session in-memory cache with one that has a TTL and explicit invalidation.

## Optional features implemented

- Debounced search input (350ms, cancelled immediately on an empty query).
- Sort by best match, most stars, or recently updated.
- Filter search results by language.
- Unit tests covering `useFavorites` and the GitHub API layer.

This readme was generated by AI but reviewed by a human (me).
