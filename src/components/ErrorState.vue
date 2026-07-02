<script setup>
defineProps({
  message: {
    type: String,
    required: true,
  },
})

defineEmits(['retry'])
</script>

<template>
  <div class="error-state" role="alert">
    <p class="error-message">{{ message }}</p>
    <button class="retry-button" type="button" @click="$emit('retry')">Try Again</button>
  </div>
</template>

<style scoped>
.error-state {
  padding: 1rem;
  border: 1px solid #cf222e;
  border-radius: 0.5rem;
  color: #82071e;
  text-align: center;
  background: #ffebe9;
}

.error-message {
  margin-top: 0;
}

.retry-button {
  padding: 0.5rem 0.75rem;
  border: 1px solid currentColor;
  border-radius: 0.375rem;
  color: inherit;
  font: inherit;
  cursor: pointer;
  background: #ffffff;
}

.retry-button:hover {
  background: #fff5f4;
}

.retry-button:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
</style>
