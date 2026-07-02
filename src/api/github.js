const API_BASE_URL = 'https://api.github.com'

const REQUEST_HEADERS = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
}

export class GitHubApiError extends Error {
  constructor(message, code, status) {
    super(message)
    this.name = 'GitHubApiError'
    this.code = code
    this.status = status
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
      throw new GitHubApiError(
        'GitHub API rate limit exceeded. Try again in a few minutes.',
        'RATE_LIMITED',
        response.status,
      )
    }

    const body = await response.json().catch(() => null)
    const message = body?.message ?? `GitHub API request failed with status ${response.status}`

    throw new GitHubApiError(message, 'API_ERROR', response.status)
  }

  return response.status === 204 ? null : response.json()
}

export function searchRepos(query, page, perPage, signal) {
  const params = new URLSearchParams({
    q: query,
    page: String(page),
    per_page: String(perPage),
  })

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
