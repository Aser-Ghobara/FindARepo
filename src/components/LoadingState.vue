<script setup>
defineProps({
  message: {
    type: String,
    default: 'Loading...',
  },
})
</script>

<template>
  <div class="loading-state" role="status" aria-live="polite" aria-atomic="true">
    <span class="spinner" aria-hidden="true"></span>
    <span class="visually-hidden">{{ message }}</span>
  </div>
</template>

<style scoped>
.loading-state {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 0.25rem solid #d8dee4;
  border-top-color: #0969da;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
  }
}
</style>
