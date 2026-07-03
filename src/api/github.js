const API_BASE_URL = 'https://api.github.com'

const REQUEST_HEADERS = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
}

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

export function getRepo(owner, name) {
  return request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`)
}

export async function getContributors(owner, name) {
  const contributors = await request(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/contributors`,
  )

  return contributors ?? []
}
