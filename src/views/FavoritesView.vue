<script setup>
import EmptyState from '../components/EmptyState.vue'
import RepoList from '../components/RepoList.vue'
import { useFavorites } from '../composables/useFavorites'

const { favorites } = useFavorites()
</script>

<template>
  <main class="favorites-view">
    <h1>Favorites</h1>

    <EmptyState
      v-if="favorites.length === 0"
      message="No favorites yet. Click on the heart icon to save one here."
    />
    <RepoList
      v-else
      :results="favorites"
      :loading="false"
      :error="null"
      :has-more="false"
      source="favorites"
    />
  </main>
</template>

<style scoped>
.favorites-view {
  max-width: 75rem;
  padding: 1rem;
  margin: 0 auto;
}
</style>
