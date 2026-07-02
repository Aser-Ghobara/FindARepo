import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

function createMockLocalStorage() {
  let store = {}

  return {
    getItem: vi.fn((key) => (Object.hasOwn(store, key) ? store[key] : null)),
    setItem: vi.fn((key, value) => {
      store[key] = String(value)
    }),
    removeItem: vi.fn((key) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
}

const STORAGE_KEY = 'github-favorites'

let mockLocalStorage

beforeEach(() => {
  vi.resetModules()
  mockLocalStorage = createMockLocalStorage()
  vi.stubGlobal('localStorage', mockLocalStorage)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

async function loadUseFavorites() {
  const { useFavorites } = await import('./useFavorites.js')
  return useFavorites()
}

describe('useFavorites', () => {
  it('starts with an empty favorites list when localStorage is empty', async () => {
    const { favorites } = await loadUseFavorites()

    expect(favorites.value).toEqual([])
  })

  it('toggleFavorite adds a repo when not already favorited', async () => {
    const { favorites, toggleFavorite, isFavorite } = await loadUseFavorites()
    const repo = { id: 1, name: 'repo-one' }

    toggleFavorite(repo)

    expect(favorites.value).toEqual([repo])
    expect(isFavorite(1)).toBe(true)
  })

  it('toggleFavorite removes a repo when already favorited', async () => {
    const { favorites, toggleFavorite } = await loadUseFavorites()
    const repo = { id: 1, name: 'repo-one' }

    toggleFavorite(repo)
    toggleFavorite(repo)

    expect(favorites.value).toEqual([])
  })

  it('isFavorite correctly returns true/false', async () => {
    const { toggleFavorite, isFavorite } = await loadUseFavorites()
    const repo = { id: 1, name: 'repo-one' }

    expect(isFavorite(1)).toBe(false)

    toggleFavorite(repo)

    expect(isFavorite(1)).toBe(true)
    expect(isFavorite(2)).toBe(false)
  })

  it('persists favorites to localStorage after toggling', async () => {
    const { toggleFavorite } = await loadUseFavorites()
    const repo = { id: 1, name: 'repo-one' }

    toggleFavorite(repo)

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify([repo]))
  })

  it('defaults to an empty array when localStorage.getItem throws', async () => {
    mockLocalStorage.getItem.mockImplementationOnce(() => {
      throw new Error('access denied')
    })

    const { favorites } = await loadUseFavorites()

    expect(favorites.value).toEqual([])
  })

  it('defaults to an empty array when localStorage contains malformed JSON', async () => {
    mockLocalStorage.setItem(STORAGE_KEY, '{not valid json')

    const { favorites } = await loadUseFavorites()

    expect(favorites.value).toEqual([])
  })
})
