<script setup>
import SearchBar from '../components/SearchBar.vue'
import { useRepoSearch } from '../composables/useRepoSearch'

const { query, results, loading, error, search } = useRepoSearch()
</script>

<template>
  <div>
    <SearchBar :query="query" @update:query="search" />

    <p>Results: {{ results.length }}</p>
    <p>Loading: {{ loading }}</p>
    <p>Error: {{ error?.message ?? 'None' }}</p>
  </div>
</template>
