<script setup>
import { computed } from 'vue'
import EmptyState from '../components/EmptyState.vue'
import ErrorState from '../components/ErrorState.vue'
import LoadingState from '../components/LoadingState.vue'
import RepoList from '../components/RepoList.vue'
import SearchBar from '../components/SearchBar.vue'
import { useRepoSearch } from '../composables/useRepoSearch'

const {
  query,
  results,
  loading,
  error,
  hasMore,
  hasSearched,
  totalCount,
  search,
  loadMore,
  setSortBy,
} = useRepoSearch()

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
    <div class="search-stage">
      <header class="search-header">
        <div class="search-copy">
          <h1>Just another way to find repositories.</h1>
        </div>

        <SearchBar class="search-form" :query="query" @update:query="search" />
        <p v-if="hasSearched && !isCompact" class="search-prompt">
          Start typing to search repositories.
        </p>
      </header>
    </div>

    <section v-if="hasSearched && isCompact" class="search-results" aria-label="Search results">
      <LoadingState v-if="loading && results.length === 0" />
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
        @sort-change="setSortBy"
      />
    </section>
  </main>
</template>

<style scoped>
.search-view {
  position: relative;
  box-sizing: border-box;
  min-height: calc(100vh - 4.5rem - 1px);
  min-height: calc(100dvh - 4.5rem - 1px);
  padding: 0 var(--space-4);
  color: var(--color-text);
  background: var(--color-background);
}

.search-stage {
  display: grid;
  min-height: calc(100vh - 4.5rem - 1px);
  min-height: calc(100dvh - 4.5rem - 1px);
  place-items: center;
  transition: min-height 400ms ease;
  transition-delay: 250ms;
}

.search-view.has-searched .search-stage {
  min-height: 0;
  padding-top: var(--space-6);
  transition-delay: 0ms;
}

.search-header {
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  width: min(100%, 60rem);
  padding: var(--space-8);
  margin: 0 auto;
  text-align: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-card);
  box-shadow: none;
  transition: padding 400ms ease;
  transition-delay: 250ms;
}

.search-view.has-searched .search-header {
  padding: var(--space-4) var(--space-6);
  transition-delay: 0ms;
}

.search-copy h1 {
  max-width: 48rem;
  margin: 0 auto var(--space-6);
  color: var(--color-text);
  font-size: clamp(2rem, 6vw, 3rem);
  letter-spacing: -0.045em;
  line-height: 1.1;
  transition: font-size 400ms ease;
  transition-delay: 250ms;
}

.has-searched .search-copy h1 {
  margin-bottom: var(--space-2);
  font-size: 1.5rem;
  transition-delay: 0ms;
}

.search-copy p {
  margin: var(--space-3) 0 var(--space-6);
  color: var(--color-text-muted);
  font-size: 1.05rem;
}

.has-searched .search-copy p {
  margin: var(--space-1) 0 var(--space-3);
}

.search-form {
  max-width: 48rem;
  margin: 0 auto;
}

.search-prompt {
  margin: var(--space-4) 0 0;
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.search-results {
  position: relative;
  z-index: 1;
  width: min(100%, 75rem);
  padding-bottom: var(--space-12);
  margin: var(--space-8) auto 0;
}

@media (max-width: 40rem) {
  .search-view {
    min-height: calc(100vh - 4rem - 1px);
    min-height: calc(100dvh - 4rem - 1px);
    padding-inline: var(--space-3);
  }

  .search-stage {
    min-height: calc(100vh - 4rem - 1px);
    min-height: calc(100dvh - 4rem - 1px);
  }

  .search-header {
    padding: var(--space-6) var(--space-3);
  }

  .search-view.has-searched .search-header {
    padding: var(--space-4);
  }

  .search-copy p {
    font-size: 0.95rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .search-stage,
  .search-header,
  .search-copy h1 {
    transition: none;
  }
}
</style>
