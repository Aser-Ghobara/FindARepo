<script setup>
defineProps({
  message: {
    type: String,
    default: 'Repository not found. Check the URL or search for another repository.',
  },
})
</script>

<template>
  <div class="not-found-state" role="alert">
    <p class="not-found-message">{{ message }}</p>
    <RouterLink class="search-link" to="/">Back to search</RouterLink>
  </div>
</template>

<style scoped>
.not-found-state {
  padding: 1rem;
  border: 1px solid #d0d7de;
  border-radius: 0.5rem;
  color: #57606a;
  text-align: center;
  background: #f6f8fa;
}

.not-found-message {
  margin-top: 0;
}

.search-link {
  display: inline-block;
  padding: 0.5rem 0.75rem;
  border: 1px solid currentColor;
  border-radius: 0.375rem;
  color: inherit;
  font-weight: 600;
  text-decoration: none;
  background: #ffffff;
}

.search-link:hover {
  background: #f3f4f6;
}

.search-link:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
</style>
