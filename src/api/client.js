/**
 * Thin fetch wrapper for the PULSE API.
 *
 * In dev the frontend is served by Vite and `/api/*` is proxied to the server
 * (see vite.config.js), so the default base is relative. Point
 * `VITE_API_BASE_URL` at the deployed API for production builds.
 */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

/** Error carrying the HTTP status so callers can branch on it. */
export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * Sends a JSON request and returns the parsed body.
 *
 * The API reports failures as `{ name, message }`; the message is surfaced
 * verbatim so UI copy stays in sync with the backend.
 */
export async function request(path, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Could not reach the PULSE API. Check that the server is running.', 0)
  }

  const text = await response.text()
  let payload
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = undefined
    }
  }

  if (!response.ok) {
    const fallback = `Request failed (${response.status}).`
    throw new ApiError(payload?.message || fallback, response.status)
  }

  return payload
}
