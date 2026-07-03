<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  resetAt: {
    type: Number,
    default: null,
  },
})

defineEmits(['retry'])

const now = ref(Date.now())
let intervalId

onMounted(() => {
  if (props.resetAt) {
    intervalId = setInterval(() => {
      now.value = Date.now()

      if (now.value >= props.resetAt) {
        clearInterval(intervalId)
      }
    }, 1000)
  }
})

onBeforeUnmount(() => {
  clearInterval(intervalId)
})

const isExpired = computed(() => props.resetAt !== null && now.value >= props.resetAt)

const countdownText = computed(() => {
  if (props.resetAt === null) {
    return ''
  }

  const remainingMs = Math.max(0, props.resetAt - now.value)
  const totalSeconds = Math.ceil(remainingMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${String(seconds).padStart(2, '0')}`
})

const isCountingDown = computed(() => props.resetAt !== null && !isExpired.value)
const justExpired = computed(() => props.resetAt !== null && isExpired.value)
</script>

<template>
  <div class="error-state" role="alert">
    <p class="error-message">{{ message }}</p>
    <p v-if="resetAt !== null" class="countdown">
      {{ isExpired ? 'You can try again now.' : `Rate limit resets in ${countdownText}` }}
    </p>
    <button
      class="retry-button"
      :class="{ 'is-ready': justExpired }"
      type="button"
      :disabled="isCountingDown"
      @click="$emit('retry')"
    >
      Try Again
    </button>
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

.countdown {
  margin: 0 0 1rem;
  font-weight: 600;
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

.retry-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.retry-button.is-ready {
  color: #ffffff;
  background: #cf222e;
}

.retry-button.is-ready:hover {
  background: #a40e26;
}
</style>
