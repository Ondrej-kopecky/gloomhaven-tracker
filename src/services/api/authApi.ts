import { apiGet, apiPost, apiPostForm } from './apiClient'

export interface AuthUser {
  id: number
  email: string
  username: string
  is_verified: boolean
  created_at: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

export function register(email: string, username: string, password: string) {
  return apiPost<{ message: string }>('/auth/register', { email, username, password })
}

export function verify(email: string, code: string) {
  return apiPost<{ message: string }>('/auth/verify', { email, code })
}

export function resendCode(email: string) {
  return apiPost<{ message: string }>('/auth/resend-code', { email })
}

export function login(username: string, password: string) {
  return apiPostForm<LoginResponse>('/auth/login', { username, password })
}

export function forgotPassword(email: string) {
  return apiPost<{ message: string }>('/auth/forgot-password', { email })
}

export function resetPassword(email: string, code: string, newPassword: string) {
  return apiPost<{ message: string }>('/auth/reset-password', { email, code, new_password: newPassword })
}

export function getMe() {
  return apiGet<AuthUser>('/auth/me')
}
