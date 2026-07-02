export function useDebounce(fn, delay) {
  let timeoutId

  function debounced(...args) {
    clearTimeout(timeoutId)

    timeoutId = setTimeout(() => {
      timeoutId = undefined
      fn.apply(this, args)
    }, delay)
  }

  debounced.cancel = () => {
    clearTimeout(timeoutId)
    timeoutId = undefined
  }

  return debounced
}
