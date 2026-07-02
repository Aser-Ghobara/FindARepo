import { ref } from 'vue'
import { searchRepos } from '../api/github'

const MAX_CACHE_ENTRIES = 20
const resultsCache = new Map()

function buildCacheKey(query, page, sortBy, languageFilter) {
  return `query:${query}::page:${page}::sortBy:${sortBy}::languageFilter:${languageFilter}`
}

function cacheResponse(key, response) {
  resultsCache.delete(key)
  resultsCache.set(key, response)

  if (resultsCache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = resultsCache.keys().next().value
    resultsCache.delete(oldestKey)
  }
}

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
  const languageFilter = ref('')
  let currentController

  function buildSearchQuery() {
    return languageFilter.value
      ? `${query.value} language:${languageFilter.value}`
      : query.value
  }

  function applyResponse(response, targetPage, append) {
    const items = response.items ?? []

    results.value = append ? [...results.value, ...items] : items
    page.value = targetPage
    totalCount.value = response.total_count
    hasMore.value = items.length > 0 && results.value.length < response.total_count
  }

  async function fetchResults(targetPage, append = false) {
    const cacheKey = buildCacheKey(query.value, targetPage, sortBy.value, languageFilter.value)
    const cachedResponse = resultsCache.get(cacheKey)

    if (cachedResponse) {
      error.value = null
      applyResponse(cachedResponse, targetPage, append)
      return
    }

    currentController?.abort()

    const controller = new AbortController()
    currentController = controller
    loading.value = true
    error.value = null

    try {
      const response = await searchRepos(
        buildSearchQuery(),
        targetPage,
        perPage.value,
        controller.signal,
        sortBy.value,
      )

      cacheResponse(cacheKey, response)
      applyResponse(response, targetPage, append)
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

  async function setLanguageFilter(value) {
    languageFilter.value = value

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
    languageFilter,
    search,
    loadMore,
    setSortBy,
    setLanguageFilter,
  }
}
