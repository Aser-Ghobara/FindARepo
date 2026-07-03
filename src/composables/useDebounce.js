/**
 * Wraps a function so calls are delayed until `delay` ms have passed without another call.
 * @param {Function} fn - Function to debounce.
 * @param {number} delay - Delay in milliseconds.
 * @returns {Function & { cancel: Function }} The debounced function, with a `cancel` method to discard any pending call.
 */
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
