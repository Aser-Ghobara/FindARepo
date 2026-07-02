import { ref, watch } from 'vue'

const STORAGE_KEY = 'github-favorites'

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

export function useFavorites() {
  function isFavorite(repoId) {
    return favorites.value.some((repo) => repo.id === repoId)
  }

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
