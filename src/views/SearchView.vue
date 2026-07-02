<script setup>
import EmptyState from '../components/EmptyState.vue'
import ErrorState from '../components/ErrorState.vue'
import LoadingState from '../components/LoadingState.vue'
import RepoList from '../components/RepoList.vue'
import SearchBar from '../components/SearchBar.vue'
import { useRepoSearch } from '../composables/useRepoSearch'

const { query, results, loading, error, hasMore, search, loadMore } = useRepoSearch()

function retrySearch() {
  search(query.value)
}
</script>

<template>
  <div>
    <SearchBar :query="query" @update:query="search" />

    <LoadingState v-if="loading && results.length === 0" />
    <ErrorState v-else-if="error" :message="error.message" @retry="retrySearch" />
    <EmptyState v-else-if="!loading && results.length === 0 && query.trim() !== ''" />

    <RepoList
      :results="results"
      :loading="loading"
      :error="error"
      :has-more="hasMore"
      @load-more="loadMore"
    />
  </div>
</template>
