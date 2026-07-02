import { ref } from 'vue'
import { searchRepos } from '../api/github'

export function useRepoSearch() {
  const query = ref('')
  const results = ref([])
  const page = ref(1)
  const perPage = ref(10)
  const loading = ref(false)
  const error = ref(null)
  const hasMore = ref(false)
  let currentController

  async function fetchResults(targetPage, append = false) {
    currentController?.abort()

    const controller = new AbortController()
    currentController = controller
    loading.value = true
    error.value = null

    try {
      const response = await searchRepos(query.value, targetPage, perPage.value, controller.signal)
      const items = response.items ?? []

      results.value = append ? [...results.value, ...items] : items
      page.value = targetPage
      hasMore.value = items.length > 0 && results.value.length < response.total_count
    } catch (caughtError) {
      if (caughtError.name === 'AbortError') {
        return
      }

      error.value = caughtError
    } finally {
      if (currentController === controller) {
        currentController = undefined
        loading.value = false
      }
    }
  }

  async function search(searchQuery) {
    query.value = searchQuery
    results.value = []
    page.value = 1
    hasMore.value = false

    if (!searchQuery.trim()) {
      currentController?.abort()
      currentController = undefined
      loading.value = false
      return
    }

    await fetchResults(1)
  }

  async function loadMore() {
    if (loading.value || !hasMore.value) {
      return
    }

    await fetchResults(page.value + 1, true)
  }

  return {
    query,
    results,
    page,
    perPage,
    loading,
    error,
    hasMore,
    search,
    loadMore,
  }
}
