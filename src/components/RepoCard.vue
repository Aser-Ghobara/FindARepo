<script setup>
import { computed } from 'vue'

const props = defineProps({
  repo: {
    type: Object,
    required: true,
  },
})

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

const repoRoute = computed(
  () =>
    `/repo/${encodeURIComponent(props.repo.owner.login)}/${encodeURIComponent(props.repo.name)}`,
)

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
    <header>
      <h2>
        <RouterLink :to="repoRoute">{{ repo.name }}</RouterLink>
      </h2>

      <div class="owner">
        <img
          :src="repo.owner.avatar_url"
          :alt="`${repo.owner.login}'s avatar`"
          width="28"
          height="28"
        />
        <span>{{ repo.owner.login }}</span>
      </div>
    </header>

    <p>{{ repo.description ?? 'No description provided' }}</p>

    <footer class="repo-meta">
      <span>
        <span aria-hidden="true">★</span>
        {{ numberFormatter.format(repo.stargazers_count) }} stars
      </span>
      <span v-if="repo.language">{{ repo.language }}</span>
      <time :datetime="repo.updated_at">Updated {{ formatRelativeTime(repo.updated_at) }}</time>
    </footer>
  </article>
</template>

<style scoped>
.repo-card {
  padding: 1rem;
  border: 1px solid #d8dee4;
  border-radius: 0.5rem;
}

.repo-card h2 {
  margin-top: 0;
}

.owner,
.repo-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.owner img {
  border-radius: 50%;
}

.repo-meta {
  flex-wrap: wrap;
  color: #57606a;
}
</style>
