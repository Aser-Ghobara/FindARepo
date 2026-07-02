<script setup>
import RepoCard from './RepoCard.vue'

defineProps({
  results: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
  error: {
    type: Object,
    default: null,
  },
  hasMore: {
    type: Boolean,
    required: true,
  },
})

defineEmits(['load-more'])
</script>

<template>
  <div v-if="results.length > 0" class="repo-grid">
    <RepoCard v-for="repo in results" :key="repo.id" :repo="repo" />
  </div>

  <div v-if="(loading && results.length > 0) || (hasMore && !loading)" class="repo-list-actions">
    <span v-if="loading" role="status">Loading more...</span>
    <button v-else type="button" @click="$emit('load-more')">Load More</button>
  </div>
</template>

<style scoped>
.repo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
  gap: 1rem;
}

.repo-list-actions {
  margin-top: 1rem;
  text-align: center;
}
</style>
