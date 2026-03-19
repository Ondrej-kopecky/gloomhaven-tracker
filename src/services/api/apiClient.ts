const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://ongy.cz/api'
const TOKEN_KEY = 'gh_tracker_auth_token'

export interface ApiResult<T> {
  data: T | null
  error: string | null
}

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function hasToken(): boolean {
  return !!localStorage.getItem(TOKEN_KEY)
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (res.status === 401) {
      clearToken()
      return { data: null, error: 'Neautorizováno. Přihlaste se znovu.' }
    }

    if (!res.ok) {
      const text = await res.text()
      let msg = `Chyba ${res.status}`
      try {
        const json = JSON.parse(text)
        msg = json.detail ?? json.message ?? msg
      } catch {
        // use default msg
      }
      return { data: null, error: msg }
    }

    // DELETE may return 204
    if (res.status === 204) {
      return { data: null as T, error: null }
    }

    const data = (await res.json()) as T
    return { data, error: null }
  } catch {
    return { data: null, error: 'Nelze se připojit k serveru.' }
  }
}

export function apiGet<T>(path: string) {
  return request<T>('GET', path)
}

export function apiPost<T>(path: string, body?: unknown) {
  return request<T>('POST', path, body)
}

export function apiDelete(path: string) {
  return request<void>('DELETE', path)
}

/** POST as application/x-www-form-urlencoded (for OAuth2 endpoints) */
export async function apiPostForm<T>(
  path: string,
  data: Record<string, string>,
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  }
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers,
      body: new URLSearchParams(data).toString(),
    })

    if (res.status === 401) {
      clearToken()
      return { data: null, error: 'Neautorizováno. Přihlaste se znovu.' }
    }

    if (!res.ok) {
      const text = await res.text()
      let msg = `Chyba ${res.status}`
      try {
        const json = JSON.parse(text)
        msg = json.detail ?? json.message ?? msg
      } catch {
        // use default msg
      }
      return { data: null, error: msg }
    }

    const result = (await res.json()) as T
    return { data: result, error: null }
  } catch {
    return { data: null, error: 'Nelze se připojit k serveru.' }
  }
}
