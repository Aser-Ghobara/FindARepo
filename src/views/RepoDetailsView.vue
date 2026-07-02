<script setup>
import { computed, onMounted, ref } from 'vue'
import ErrorState from '../components/ErrorState.vue'
import LoadingState from '../components/LoadingState.vue'
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

const repo = ref(null)
const contributors = ref([])
const loading = ref(false)
const error = ref(null)

const { isFavorite, toggleFavorite } = useFavorites()
const isFavorited = computed(() => (repo.value ? isFavorite(repo.value.id) : false))

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
    <RouterLink class="back-link" to="/">← Back to search results</RouterLink>

    <LoadingState v-if="loading" message="Loading repository details..." />
    <ErrorState v-else-if="error" :message="error.message" @retry="loadDetails" />

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
              <span aria-hidden="true">{{ isFavorited ? '★' : '☆' }}</span>
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

      <p v-if="repo.homepage">
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
  max-width: 60rem;
  padding: 1rem;
  margin: 0 auto;
}

.back-link {
  display: inline-block;
  margin-bottom: 1.5rem;
}

.title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1rem;
  margin-bottom: 0.75rem;
}

.title-row h1 {
  margin: 0;
}

.favorite-button {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d8dee4;
  border-radius: 0.375rem;
  color: #24292f;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  background: #f6f8fa;
}

.favorite-button:hover,
.favorite-button.is-favorite {
  border-color: #bf8700;
  color: #7d4e00;
  background: #fff8c5;
}

.favorite-button:focus-visible {
  outline: 2px solid #0969da;
  outline-offset: 2px;
}

.owner-link {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.owner-link img,
.contributors img {
  border-radius: 50%;
}

.description {
  line-height: 1.6;
}

.repo-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
  gap: 0.75rem;
}

.repo-stats div {
  padding: 0.75rem;
  border: 1px solid #d8dee4;
  border-radius: 0.375rem;
}

.repo-stats dt {
  color: #57606a;
  font-size: 0.875rem;
}

.repo-stats dd {
  margin: 0.25rem 0 0;
  font-weight: 600;
}

.topics,
.contributors {
  padding: 0;
  list-style: none;
}

.topics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.topics li {
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  color: #0969da;
  background: #ddf4ff;
}

.contributors {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 14rem), 1fr));
  gap: 0.75rem;
}

.contributors li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #d8dee4;
  border-radius: 0.375rem;
}

.contributors div {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.contributors span {
  color: #57606a;
  font-size: 0.875rem;
}
</style>
