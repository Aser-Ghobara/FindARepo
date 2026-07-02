import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GitHubApiError, getContributors, getRepo, searchRepos } from './github.js'

function createMockResponse({ ok, status, headers = {}, body = null }) {
  return {
    ok,
    status,
    headers: {
      get: (key) => headers[key.toLowerCase()] ?? null,
    },
    json: vi.fn().mockResolvedValue(body),
  }
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('searchRepos', () => {
  it('returns parsed JSON on a successful response', async () => {
    const body = { items: [{ id: 1, name: 'repo-one' }], total_count: 1 }
    fetch.mockResolvedValue(createMockResponse({ ok: true, status: 200, body }))

    const result = await searchRepos('vue', 1, 10)

    expect(result).toEqual(body)
  })
})

describe('request error handling (via searchRepos/getRepo)', () => {
  it('throws a GitHubApiError with code RATE_LIMITED when 403 and rate limit exhausted', async () => {
    fetch.mockResolvedValue(
      createMockResponse({
        ok: false,
        status: 403,
        headers: { 'x-ratelimit-remaining': '0' },
      }),
    )

    await expect(searchRepos('vue', 1, 10)).rejects.toMatchObject({
      name: 'GitHubApiError',
      code: 'RATE_LIMITED',
      status: 403,
    })
    await expect(searchRepos('vue', 1, 10)).rejects.toBeInstanceOf(GitHubApiError)
  })

  it('throws a GitHubApiError with code NETWORK_ERROR when fetch itself throws', async () => {
    fetch.mockRejectedValue(new Error('fetch failed'))

    await expect(getRepo('vuejs', 'core')).rejects.toMatchObject({
      name: 'GitHubApiError',
      code: 'NETWORK_ERROR',
      status: null,
    })
  })

  it('throws a GitHubApiError with the API error message for a non-rate-limit failure (404)', async () => {
    fetch.mockResolvedValue(
      createMockResponse({
        ok: false,
        status: 404,
        body: { message: 'Not Found' },
      }),
    )

    await expect(getRepo('someowner', 'nonexistentrepo')).rejects.toMatchObject({
      name: 'GitHubApiError',
      code: 'API_ERROR',
      status: 404,
      message: 'Not Found',
    })
  })
})

describe('getContributors', () => {
  it('returns an empty array when the response body is null', async () => {
    fetch.mockResolvedValue(createMockResponse({ ok: true, status: 204, body: null }))

    const result = await getContributors('vuejs', 'core')

    expect(result).toEqual([])
  })
})
