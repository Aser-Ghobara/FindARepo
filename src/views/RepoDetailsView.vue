<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import ErrorState from '../components/ErrorState.vue'
import LoadingState from '../components/LoadingState.vue'
import NotFoundState from '../components/NotFoundState.vue'
import { getContributors, getRepo } from '../api/github'
import { useFavorites } from '../composables/useFavorites'

const props = defineProps({
  owner: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
})

const route = useRoute()
const repo = ref(null)
const contributors = ref([])
const loading = ref(false)
const error = ref(null)

const { isFavorite, toggleFavorite } = useFavorites()
const isNotFound = computed(() => error.value?.status === 404)
const isFavorited = computed(() => (repo.value ? isFavorite(repo.value.id) : false))
const cameFromFavorites = computed(() => route.query.from === 'favorites')
const backRoute = computed(() => (cameFromFavorites.value ? '/favorites' : '/'))
const backLabel = computed(() =>
  cameFromFavorites.value ? 'Back to favorites' : 'Back to search results',
)

const numberFormatter = new Intl.NumberFormat('en-US')
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
})

function formatNumber(value) {
  return numberFormatter.format(value ?? 0)
}

function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Unknown' : dateFormatter.format(date)
}

function toggleRepoFavorite() {
  if (repo.value) {
    toggleFavorite(repo.value)
  }
}

async function loadDetails() {
  loading.value = true
  error.value = null

  try {
    const [repoData, contributorData] = await Promise.all([
      getRepo(props.owner, props.name),
      getContributors(props.owner, props.name),
    ])

    repo.value = repoData
    contributors.value = contributorData
  } catch (caughtError) {
    error.value =
      caughtError instanceof Error ? caughtError : new Error('Unable to load repository details.')
  } finally {
    loading.value = false
  }
}

onMounted(loadDetails)
</script>

<template>
  <main class="repo-details">
    <RouterLink class="back-link" :to="backRoute">← {{ backLabel }}</RouterLink>

    <LoadingState v-if="loading" message="Loading repository details..." />
    <NotFoundState v-else-if="isNotFound" />
    <ErrorState
      v-else-if="error"
      :message="error.message"
      :reset-at="error.resetAt"
      @retry="loadDetails"
    />

    <article v-else-if="repo" aria-labelledby="repository-title">
      <header class="repo-header">
        <div>
          <div class="title-row">
            <h1 id="repository-title">{{ repo.name }}</h1>
            <button
              class="favorite-button"
              :class="{ 'is-favorite': isFavorited }"
              type="button"
              :aria-pressed="isFavorited"
              @click="toggleRepoFavorite"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
                />
              </svg>
              {{ isFavorited ? 'Favorited' : 'Add to Favorites' }}
            </button>
          </div>
          <a
            class="owner-link"
            :href="repo.owner.html_url"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              :src="repo.owner.avatar_url"
              :alt="`${repo.owner.login}'s avatar`"
              width="48"
              height="48"
            />
            <span>{{ repo.owner.login }}</span>
          </a>
        </div>
      </header>

      <p class="description">{{ repo.description ?? 'No description provided.' }}</p>

      <dl class="repo-stats">
        <div>
          <dt>Stars</dt>
          <dd>{{ formatNumber(repo.stargazers_count) }}</dd>
        </div>
        <div>
          <dt>Forks</dt>
          <dd>{{ formatNumber(repo.forks_count) }}</dd>
        </div>
        <div>
          <dt>Open issues</dt>
          <dd>{{ formatNumber(repo.open_issues_count) }}</dd>
        </div>
        <div>
          <dt>Primary language</dt>
          <dd>{{ repo.language ?? 'Not specified' }}</dd>
        </div>
        <div v-if="repo.license">
          <dt>License</dt>
          <dd>{{ repo.license.name }}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>
            <time :datetime="repo.created_at">{{ formatDate(repo.created_at) }}</time>
          </dd>
        </div>
        <div>
          <dt>Last updated</dt>
          <dd>
            <time :datetime="repo.updated_at">{{ formatDate(repo.updated_at) }}</time>
          </dd>
        </div>
      </dl>

      <p v-if="repo.homepage" class="homepage-link">
        <a :href="repo.homepage" target="_blank" rel="noopener noreferrer">
          Visit project homepage
        </a>
      </p>

      <section v-if="repo.topics?.length" aria-labelledby="topics-title">
        <h2 id="topics-title">Topics</h2>
        <ul class="topics">
          <li v-for="topic in repo.topics" :key="topic">{{ topic }}</li>
        </ul>
      </section>

      <section aria-labelledby="contributors-title">
        <h2 id="contributors-title">Top Contributors</h2>

        <ul v-if="contributors.length > 0" class="contributors">
          <li v-for="contributor in contributors" :key="contributor.id">
            <img
              :src="contributor.avatar_url"
              :alt="`${contributor.login}'s avatar`"
              width="40"
              height="40"
            />
            <div>
              <a :href="contributor.html_url" target="_blank" rel="noopener noreferrer">
                {{ contributor.login }}
              </a>
              <span>{{ formatNumber(contributor.contributions) }} contributions</span>
            </div>
          </li>
        </ul>

        <p v-else>No contributors found.</p>
      </section>
    </article>
  </main>
</template>

<style scoped>
.repo-details {
  box-sizing: border-box;
  min-height: 100vh;
  max-width: 60rem;
  padding: var(--space-6) var(--space-4) var(--space-12);
  margin: 0 auto;
  color: var(--color-text);
  background: var(--color-background);
}

.back-link {
  display: inline-block;
  margin-bottom: var(--space-6);
  color: var(--color-accent-600);
  font-weight: 600;
  text-decoration: none;
}

.back-link:hover {
  color: var(--color-accent-700);
  text-decoration: underline;
}

.back-link:focus-visible,
.owner-link:focus-visible,
.homepage-link a:focus-visible,
.contributors a:focus-visible {
  border-radius: var(--radius-sm);
  outline: 3px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.repo-header {
  padding: var(--space-6);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}

.title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3) var(--space-4);
  margin-bottom: var(--space-3);
}

.title-row h1 {
  min-width: 0;
  margin: 0;
  font-size: clamp(1.75rem, 5vw, 2.5rem);
  overflow-wrap: anywhere;
}

.favorite-button {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text-muted);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  background: var(--color-surface);
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
  border-color: var(--color-accent-500);
  color: var(--color-accent-600);
  background: var(--color-accent-50);
}

.favorite-button.is-favorite {
  border-color: var(--color-accent-500);
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

.owner-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  max-width: 100%;
  color: var(--color-accent-600);
  font-weight: 600;
  text-decoration: none;
  overflow-wrap: anywhere;
}

.owner-link img,
.contributors img {
  flex: 0 0 auto;
  border-radius: var(--radius-full);
}

.description {
  margin: var(--space-6) 0;
  color: var(--color-text-muted);
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.repo-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 8.5rem), 1fr));
  gap: var(--space-3);
  margin: 0;
}

.repo-stats div {
  min-width: 0;
  padding: var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: 0 1px 2px rgb(15 23 42 / 5%);
}

.repo-stats dt {
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.repo-stats dd {
  margin: var(--space-1) 0 0;
  color: var(--color-text);
  font-size: 1.125rem;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.homepage-link {
  margin: var(--space-6) 0;
}

.homepage-link a {
  color: var(--color-accent-600);
  font-weight: 600;
}

.repo-details section {
  margin-top: var(--space-8);
}

.repo-details section h2 {
  margin: 0 0 var(--space-4);
  font-size: 1.25rem;
}

.topics,
.contributors {
  margin: 0;
  padding: 0;
  list-style: none;
}

.topics {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.topics li {
  max-width: 100%;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  color: var(--color-accent-700);
  font-size: 0.875rem;
  font-weight: 600;
  background: var(--color-accent-100);
  overflow-wrap: anywhere;
}

.contributors {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 15rem), 1fr));
  gap: var(--space-3);
}

.contributors li {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
}

.contributors div {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: var(--space-1);
}

.contributors a {
  color: var(--color-accent-600);
  font-weight: 600;
  overflow-wrap: anywhere;
}

.contributors span {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  overflow-wrap: anywhere;
}

@media (max-width: 30rem) {
  .repo-details {
    padding: var(--space-4) var(--space-3) var(--space-8);
  }

  .repo-header {
    padding: var(--space-4);
  }

  .title-row {
    align-items: flex-start;
  }

  .favorite-button {
    width: 100%;
    justify-content: center;
  }

  .repo-stats,
  .contributors {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
