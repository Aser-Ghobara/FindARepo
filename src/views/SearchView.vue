<script setup>
import { computed } from 'vue'
import EmptyState from '../components/EmptyState.vue'
import ErrorState from '../components/ErrorState.vue'
import LoadingState from '../components/LoadingState.vue'
import RepoList from '../components/RepoList.vue'
import SearchBar from '../components/SearchBar.vue'
import { useRepoSearch } from '../composables/useRepoSearch'

const { query, results, loading, error, hasMore, hasSearched, totalCount, search, loadMore } =
  useRepoSearch()

const isCompact = computed(
  () =>
    query.value.trim() !== '' || results.value.length > 0 || loading.value || error.value !== null,
)

function retrySearch() {
  search(query.value)
}
</script>

<template>
  <main class="search-view" :class="{ 'has-searched': isCompact }">
    <header class="search-header">
      <div class="search-copy">
        <h1>Just another way to find repositories.</h1>
      </div>

      <SearchBar class="search-form" :query="query" @update:query="search" />
    </header>

    <section v-if="hasSearched" class="search-results" aria-label="Search results">
      <EmptyState
        v-if="!loading && query.trim() === ''"
        message="Start typing to search repositories."
      />
      <LoadingState v-else-if="loading && results.length === 0" />
      <ErrorState v-else-if="error" :message="error.message" @retry="retrySearch" />
      <EmptyState v-else-if="!loading && results.length === 0 && query.trim() !== ''" />

      <RepoList
        :results="results"
        :loading="loading"
        :error="error"
        :has-more="hasMore"
        :query="query"
        :total-count="totalCount"
        @load-more="loadMore"
      />
    </section>
  </main>
</template>

<style scoped>
.search-view {
  box-sizing: border-box;
  min-height: calc(100vh - var(--space-12));
  padding: 0 var(--space-4) var(--space-12);
  color: var(--color-text);
  background: var(--color-background);
}

.search-header {
  box-sizing: border-box;
  width: min(100%, 48rem);
  padding: var(--space-8);
  margin: max(var(--space-8), calc(50vh - var(--space-12))) auto 0;
  text-align: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  transform: translateY(-50%);
  transition:
    margin 400ms ease,
    transform 400ms ease,
    padding 400ms ease;
  transition-delay: 250ms;
}

.search-view.has-searched .search-header {
  padding: var(--space-4) var(--space-6);
  margin-top: var(--space-6);
  transform: translateY(0);
  transition-delay: 0ms;
}

.search-copy h1 {
  margin: 0;
  color: var(--color-text);
  font-size: clamp(2rem, 6vw, 3rem);
  line-height: 1.1;
  transition: font-size 400ms ease;
  transition-delay: 250ms;
}

.has-searched .search-copy h1 {
  font-size: 1.5rem;
  transition-delay: 0ms;
}

.search-copy p {
  margin: var(--space-3) 0 var(--space-6);
  color: var(--color-text-muted);
}

.has-searched .search-copy p {
  margin: var(--space-1) 0 var(--space-3);
}

.search-form {
  max-width: 40rem;
  margin: 0 auto;
}

.search-results {
  width: min(100%, 75rem);
  margin: var(--space-8) auto 0;
}

@media (prefers-reduced-motion: reduce) {
  .search-header,
  .search-copy h1 {
    transition: none;
  }
}
</style>
