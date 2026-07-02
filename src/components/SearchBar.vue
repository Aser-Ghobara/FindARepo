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
  <div>
    <label for="repository-search">Search GitHub repositories</label>
    <input
      id="repository-search"
      :value="inputValue"
      type="text"
      placeholder="Search GitHub repositories..."
      @input="handleInput"
    />
  </div>
</template>
