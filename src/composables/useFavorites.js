import { ref, watch } from 'vue'

const STORAGE_KEY = 'github-favorites'

/**
 * Reads the favorites list from localStorage, tolerating a missing key, malformed JSON,
 * or a storage access failure.
 * @returns {object[]} The stored favorites, or an empty array if none exist or reading fails.
 */
function loadFavorites() {
  try {
    const storedFavorites = localStorage.getItem(STORAGE_KEY)

    if (!storedFavorites) {
      return []
    }

    const parsedFavorites = JSON.parse(storedFavorites)
    return Array.isArray(parsedFavorites) ? parsedFavorites : []
  } catch {
    return []
  }
}

const favorites = ref(loadFavorites())
const writeError = ref(false)

watch(
  favorites,
  (updatedFavorites) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFavorites))
      writeError.value = false
    } catch {
      writeError.value = true
    }
  },
  { deep: true, flush: 'sync' },
)

/**
 * Provides access to the shared favorites list, persisted to localStorage.
 * @returns {{ favorites: import('vue').Ref<object[]>, isFavorite: Function, toggleFavorite: Function, writeError: import('vue').Ref<boolean> }}
 */
export function useFavorites() {
  /**
   * Checks whether a repository is currently favorited.
   * @param {number} repoId - The repository's GitHub id.
   * @returns {boolean} True if the repository is in the favorites list.
   */
  function isFavorite(repoId) {
    return favorites.value.some((repo) => repo.id === repoId)
  }

  /**
   * Adds a repository to favorites if it isn't already favorited, otherwise removes it.
   * @param {object} repo - The repository object to add or remove.
   * @returns {void}
   */
  function toggleFavorite(repo) {
    const favoriteIndex = favorites.value.findIndex((favoriteRepo) => favoriteRepo.id === repo.id)

    if (favoriteIndex === -1) {
      favorites.value.push(repo)
      return
    }

    favorites.value.splice(favoriteIndex, 1)
  }

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    writeError,
  }
}
