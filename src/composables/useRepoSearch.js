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
  const hasSearched = ref(false)
  const totalCount = ref(0)
  const sortBy = ref('best-match')
  let currentController

  async function fetchResults(targetPage, append = false) {
    currentController?.abort()

    const controller = new AbortController()
    currentController = controller
    loading.value = true
    error.value = null

    try {
      const response = await searchRepos(
        query.value,
        targetPage,
        perPage.value,
        controller.signal,
        sortBy.value,
      )
      const items = response.items ?? []

      results.value = append ? [...results.value, ...items] : items
      page.value = targetPage
      totalCount.value = response.total_count
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
    totalCount.value = 0

    if (!searchQuery.trim()) {
      currentController?.abort()
      currentController = undefined
      loading.value = false
      error.value = null
      return
    }

    hasSearched.value = true
    await fetchResults(1)
  }

  async function loadMore() {
    if (loading.value || !hasMore.value) {
      return
    }

    await fetchResults(page.value + 1, true)
  }

  async function setSortBy(value) {
    sortBy.value = value

    if (!query.value.trim()) {
      return
    }

    results.value = []
    page.value = 1
    hasMore.value = false
    totalCount.value = 0
    await fetchResults(1)
  }

  return {
    query,
    results,
    page,
    perPage,
    loading,
    error,
    hasMore,
    hasSearched,
    totalCount,
    sortBy,
    search,
    loadMore,
    setSortBy,
  }
}
