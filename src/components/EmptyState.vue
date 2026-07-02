<script setup>
defineProps({
  message: {
    type: String,
    default: 'No repositories found. Try a different search.',
  },
})
</script>

<template>
  <div class="empty-state">
    <p>{{ message }}</p>
  </div>
</template>

<style scoped>
.empty-state {
  padding: 3rem 1rem;
  color: #57606a;
  text-align: center;
}

.empty-state p {
  margin: 0;
}
</style>
