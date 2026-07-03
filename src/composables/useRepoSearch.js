import { ref } from 'vue'
import { searchRepos } from '../api/github'

const MAX_CACHE_ENTRIES = 20
const resultsCache = new Map()

/**
 * Builds a unique cache key for a given search request.
 * @param {string} query - Raw search query text.
 * @param {number} page - Page number.
 * @param {string} sortBy - Sort key.
 * @param {string} languageFilter - Selected language filter, or an empty string for all languages.
 * @returns {string} A key identifying this exact combination of search parameters.
 */
function buildCacheKey(query, page, sortBy, languageFilter) {
  return `query:${query}::page:${page}::sortBy:${sortBy}::languageFilter:${languageFilter}`
}

/**
 * Stores a search response in the module-level results cache, evicting the oldest
 * entry once the cache exceeds `MAX_CACHE_ENTRIES`.
 * @param {string} key - Cache key produced by `buildCacheKey`.
 * @param {object} response - The GitHub search response to cache.
 * @returns {void}
 */
function cacheResponse(key, response) {
  resultsCache.delete(key)
  resultsCache.set(key, response)

  if (resultsCache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = resultsCache.keys().next().value
    resultsCache.delete(oldestKey)
  }
}

/**
 * Manages repository search state: the query, paginated results, sort and language
 * filters, loading/error state, and an in-memory cache of recent responses.
 * @returns {object} Reactive search state and the `search`, `loadMore`, `setSortBy`,
 * and `setLanguageFilter` functions used to drive it.
 */
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

  /**
   * Builds the query string sent to the GitHub search API, appending a `language:`
   * qualifier when a language filter is active.
   * @returns {string} The final search query.
   */
  function buildSearchQuery() {
    return languageFilter.value
      ? `${query.value} language:${languageFilter.value}`
      : query.value
  }

  /**
   * Updates `results`, `page`, `totalCount`, and `hasMore` from a search response.
   * Shared by both the cache-hit and network-fetch paths in `fetchResults`.
   * @param {object} response - The GitHub search response.
   * @param {number} targetPage - The page number this response corresponds to.
   * @param {boolean} append - Whether to append to existing results or replace them.
   * @returns {void}
   */
  function applyResponse(response, targetPage, append) {
    const items = response.items ?? []

    results.value = append ? [...results.value, ...items] : items
    page.value = targetPage
    totalCount.value = response.total_count
    hasMore.value = items.length > 0 && results.value.length < response.total_count
  }

  /**
   * Fetches a page of search results, serving from the in-memory cache when available.
   * Aborts any in-flight request before starting a new network fetch.
   * @param {number} targetPage - The page number to fetch.
   * @param {boolean} [append] - Whether to append results to the existing list (used for "load more").
   * @returns {Promise<void>}
   */
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

  /**
   * Starts a new search, resetting pagination. Clears results without fetching when
   * the query is blank.
   * @param {string} searchQuery - The keyword search text.
   * @returns {Promise<void>}
   */
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

  /**
   * Fetches the next page of results and appends them to the current list, if not
   * already loading and more results are available.
   * @returns {Promise<void>}
   */
  async function loadMore() {
    if (loading.value || !hasMore.value) {
      return
    }

    await fetchResults(page.value + 1, true)
  }

  /**
   * Changes the sort order and re-runs the search from page 1, if a query is active.
   * @param {string} value - Sort key, one of 'best-match', 'stars', or 'updated'.
   * @returns {Promise<void>}
   */
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

  /**
   * Changes the language filter and re-runs the search from page 1, if a query is active.
   * @param {string} value - Language name to filter by, or an empty string for all languages.
   * @returns {Promise<void>}
   */
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
