<script setup>
import { computed } from 'vue'
import { useFavorites } from '../composables/useFavorites'

const props = defineProps({
  repo: {
    type: Object,
    required: true,
  },
  source: {
    type: String,
    default: 'search',
  },
})

const { isFavorite, toggleFavorite } = useFavorites()
const isFavorited = computed(() => isFavorite(props.repo.id))

const numberFormatter = new Intl.NumberFormat('en-US')
const relativeTimeFormatter = new Intl.RelativeTimeFormat('en', {
  numeric: 'auto',
})

const relativeTimeUnits = [
  ['year', 365 * 24 * 60 * 60 * 1000],
  ['month', 30 * 24 * 60 * 60 * 1000],
  ['week', 7 * 24 * 60 * 60 * 1000],
  ['day', 24 * 60 * 60 * 1000],
  ['hour', 60 * 60 * 1000],
  ['minute', 60 * 1000],
  ['second', 1000],
]

const languageColors = {
  JavaScript: '#d4a72c',
  TypeScript: '#3178c6',
  Python: '#2f855a',
  Java: '#d97706',
  Go: '#00add8',
  Rust: '#b7410e',
  HTML: '#e34c26',
  CSS: '#7c3aed',
  'C++': '#f34b7d',
  Ruby: '#cc342d',
}

const repoRoute = computed(() => {
  const path = `/repo/${encodeURIComponent(props.repo.owner.login)}/${encodeURIComponent(props.repo.name)}`

  return props.source === 'favorites'
    ? {
        path,
        query: { from: 'favorites' },
      }
    : path
})

const languageColor = computed(
  () => languageColors[props.repo.language] ?? 'var(--color-text-muted)',
)

/**
 * Formats a date as a human-readable relative time.
 * @param {string} date - An ISO date string.
 * @returns {string} The relative time, or 'Unknown' if the date can't be parsed.
 */
function formatRelativeTime(date) {
  const timestamp = Date.parse(date)

  if (Number.isNaN(timestamp)) {
    return 'Unknown'
  }

  const difference = timestamp - Date.now()
  const absoluteDifference = Math.abs(difference)
  const [unit, milliseconds] =
    relativeTimeUnits.find(([, unitMilliseconds]) => absoluteDifference >= unitMilliseconds) ??
    relativeTimeUnits.at(-1)

  return relativeTimeFormatter.format(Math.round(difference / milliseconds), unit)
}
</script>

<template>
  <article class="repo-card">
    <header class="repo-header">
      <img
        class="owner-avatar"
        :src="repo.owner.avatar_url"
        :alt="`${repo.owner.login}'s avatar`"
        width="36"
        height="36"
      />

      <h2 class="repo-title">
        <RouterLink :to="repoRoute">{{ repo.owner.login }}/{{ repo.name }}</RouterLink>
      </h2>

      <button
        class="favorite-button"
        :class="{ 'is-favorite': isFavorited }"
        type="button"
        :aria-label="
          isFavorited ? `Remove ${repo.name} from favorites` : `Add ${repo.name} to favorites`
        "
        :aria-pressed="isFavorited"
        @click.stop="toggleFavorite(repo)"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
          />
        </svg>
      </button>
    </header>

    <p class="description">{{ repo.description ?? 'No description provided' }}</p>

    <footer class="repo-meta">
      <span v-if="repo.language" class="meta-item">
        <span
          class="language-dot"
          :style="{ backgroundColor: languageColor }"
          aria-hidden="true"
        ></span>
        {{ repo.language }}
      </span>
      <span
        class="meta-item"
        :aria-label="`${numberFormatter.format(repo.stargazers_count)} stars`"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="m12 2.75 2.78 5.63 6.22.9-4.5 4.39 1.06 6.2L12 16.94l-5.56 2.93 1.06-6.2L3 9.28l6.22-.9L12 2.75Z"
          />
        </svg>
        {{ numberFormatter.format(repo.stargazers_count) }}
      </span>
      <time :datetime="repo.updated_at">Updated {{ formatRelativeTime(repo.updated_at) }}</time>
    </footer>
  </article>
</template>

<style scoped>
.repo-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  height: 100%;
  padding: var(--space-4);
  overflow: hidden;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}

.repo-header {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  min-width: 0;
  align-items: center;
  gap: var(--space-3);
}

.owner-avatar {
  border-radius: var(--radius-md);
}

.repo-title {
  min-width: 0;
  margin: 0;
  font-size: 1rem;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.repo-title a {
  color: var(--color-text);
  text-decoration: none;
}

.repo-title a:hover {
  color: var(--color-accent-600);
}

.repo-title a:focus-visible {
  border-radius: var(--radius-sm);
  outline: 3px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.favorite-button {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  border: 0;
  border-radius: var(--radius-full);
  color: var(--color-text-muted);
  cursor: pointer;
  background: transparent;
  place-items: center;
}

.favorite-button svg {
  width: 1.35rem;
  height: 1.35rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.favorite-button:hover {
  color: var(--color-accent-600);
  background: var(--color-accent-50);
}

.favorite-button.is-favorite {
  color: var(--color-accent-500);
  background: var(--color-accent-50);
}

.favorite-button.is-favorite svg {
  fill: currentColor;
}

.favorite-button:focus-visible {
  outline: 3px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.description {
  flex: 1;
  max-width: 100%;
  margin: var(--space-4) 0;
  color: var(--color-text-muted);
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.repo-meta {
  display: flex;
  flex-wrap: wrap;
  min-width: 0;
  align-items: center;
  gap: var(--space-2) var(--space-4);
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.meta-item {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  gap: var(--space-1);
  overflow-wrap: anywhere;
}

.meta-item svg {
  width: 1rem;
  height: 1rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linejoin: round;
}

.language-dot {
  flex: 0 0 auto;
  width: 0.625rem;
  height: 0.625rem;
  border-radius: var(--radius-full);
}

.repo-meta time {
  max-width: 100%;
  overflow-wrap: anywhere;
}

@media (max-width: 30rem) {
  .repo-card {
    padding: var(--space-3);
  }

  .repo-header {
    gap: var(--space-2);
  }

  .repo-meta {
    gap: var(--space-2) var(--space-3);
    align-items: flex-start;
  }
}
</style>
