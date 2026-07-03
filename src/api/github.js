const API_BASE_URL = 'https://api.github.com'

const REQUEST_HEADERS = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
}

/**
 * Error thrown by all GitHub API calls in this module, normalizing network failures,
 * rate limiting, and non-2xx responses into a single shape.
 * @param {string} message - Human-readable error message.
 * @param {string} code - Machine-readable error code.
 * @param {number|null} status - HTTP status code, or null for network-level failures.
 * @param {number|null} [resetAt] - Unix timestamp in milliseconds when the rate limit resets, if known.
 */
export class GitHubApiError extends Error {
  constructor(message, code, status, resetAt = null) {
    super(message)
    this.name = 'GitHubApiError'
    this.code = code
    this.status = status
    this.resetAt = resetAt
  }
}

async function request(path, signal) {
  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: REQUEST_HEADERS,
      signal,
    })
  } catch (caughtError) {
    if (caughtError.name === 'AbortError') {
      throw caughtError
    }

    throw new GitHubApiError('Network error, check your connection.', 'NETWORK_ERROR', null)
  }

  if (!response.ok) {
    if (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0') {
      const resetHeader = response.headers.get('x-ratelimit-reset')
      const resetAt = resetHeader ? Number(resetHeader) * 1000 : null

      throw new GitHubApiError(
        'GitHub API rate limit exceeded. Try again in a few minutes.',
        'RATE_LIMITED',
        response.status,
        resetAt,
      )
    }

    const body = await response.json().catch(() => null)
    const message = body?.message ?? `GitHub API request failed with status ${response.status}`

    throw new GitHubApiError(message, 'API_ERROR', response.status)
  }

  return response.status === 204 ? null : response.json()
}

const SORT_PARAMS = {
  stars: { sort: 'stars', order: 'desc' },
  updated: { sort: 'updated', order: 'desc' },
}

/**
 * Searches GitHub repositories by keyword, with optional sorting.
 * @param {string} query - Search query, may include GitHub search qualifiers (e.g. 'language:Vue').
 * @param {number} page - Page number to fetch, 1-indexed.
 * @param {number} perPage - Number of results per page.
 * @param {AbortSignal} [signal] - Signal used to cancel the request.
 * @param {string} [sort] - Sort key, one of 'stars', 'updated', or 'best-match' (default).
 * @returns {Promise<object>} The parsed GitHub search response, including `items` and `total_count`.
 */
export function searchRepos(query, page, perPage, signal, sort) {
  const params = new URLSearchParams({
    q: query,
    page: String(page),
    per_page: String(perPage),
  })

  const sortParams = SORT_PARAMS[sort]
  if (sortParams) {
    params.set('sort', sortParams.sort)
    params.set('order', sortParams.order)
  }

  return request(`/search/repositories?${params}`, signal)
}

/**
 * Fetches a single repository's details.
 * @param {string} owner - Repository owner's username or organization.
 * @param {string} name - Repository name.
 * @returns {Promise<object>} The parsed repository object.
 */
export function getRepo(owner, name) {
  return request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`)
}

/**
 * Fetches a repository's contributors.
 * @param {string} owner - Repository owner's username or organization.
 * @param {string} name - Repository name.
 * @returns {Promise<object[]>} The list of contributors, or an empty array if none are returned.
 */
export async function getContributors(owner, name) {
  const contributors = await request(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/contributors`,
  )

  return contributors ?? []
}
