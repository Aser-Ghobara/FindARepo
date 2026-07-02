<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { useDebounce } from '../composables/useDebounce'

const props = defineProps({
  query: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:query'])
const inputValue = ref(props.query)

const emitQuery = useDebounce((value) => {
  emit('update:query', value)
}, 350)

watch(
  () => props.query,
  (value) => {
    inputValue.value = value
  },
)

function handleInput(event) {
  const value = event.target.value
  inputValue.value = value

  if (value === '') {
    emitQuery.cancel()
    emit('update:query', value)
    return
  }

  emitQuery(value)
}

onBeforeUnmount(emitQuery.cancel)
</script>

<template>
  <div class="search-bar">
    <label class="visually-hidden" for="repository-search">Search GitHub repositories</label>
    <div class="input-shell">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </svg>
      <input
        id="repository-search"
        :value="inputValue"
        type="text"
        placeholder="Search GitHub repositories..."
        @input="handleInput"
      />
    </div>
  </div>
</template>

<style scoped>
.search-bar,
.input-shell {
  width: 100%;
}

.input-shell {
  position: relative;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: var(--space-4);
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-text-muted);
  pointer-events: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  transform: translateY(-50%);
}

input {
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  min-height: 3rem;
  padding: var(--space-3) var(--space-4) var(--space-3) 2.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text);
  font: inherit;
  background: var(--color-surface);
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease;
}

input::placeholder {
  color: var(--color-text-muted);
}

input:focus {
  border-color: var(--color-accent-500);
  outline: none;
}

input:focus-visible {
  outline: 3px solid var(--color-focus-ring);
  outline-offset: 2px;
  box-shadow: 0 0 0 5px var(--color-accent-100);
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

@media (prefers-reduced-motion: reduce) {
  input {
    transition: none;
  }
}
</style>
