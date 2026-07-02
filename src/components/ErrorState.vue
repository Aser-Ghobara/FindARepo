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
  <div role="alert">
    <p>{{ message }}</p>
    <button type="button" @click="$emit('retry')">Try Again</button>
  </div>
</template>
