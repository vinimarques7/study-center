import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import { authApi, usersApi, type AppUser, ApiError } from '@/lib/api'
import { applyUserTheme } from '@/lib/theme'

interface AuthState {
  user: AppUser | null
  token: string | null
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName: string, occupation?: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (updated: AppUser) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const TOKEN_KEY = 'sc_access_token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  })

  // On mount — try to restore session via refresh token cookie
  useEffect(() => {
    const stored = sessionStorage.getItem(TOKEN_KEY)
    if (stored) {
      usersApi
        .me(stored)
        .then(({ user }) => {
          applyUserTheme(user.themeColor)
          setState({ user, token: stored, isLoading: false })
        })
        .catch(() => {
          sessionStorage.removeItem(TOKEN_KEY)
          tryRefresh()
        })
    } else {
      tryRefresh()
    }
  }, [])

  async function tryRefresh() {
    try {
      const { accessToken, user } = await authApi.refresh()
      sessionStorage.setItem(TOKEN_KEY, accessToken)
      applyUserTheme(user.themeColor)
      setState({ user, token: accessToken, isLoading: false })
    } catch {
      setState({ user: null, token: null, isLoading: false })
    }
  }

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, user } = await authApi.login(email, password)
    sessionStorage.setItem(TOKEN_KEY, accessToken)
    applyUserTheme(user.themeColor)
    setState({ user, token: accessToken, isLoading: false })
  }, [])

  const register = useCallback(async (email: string, password: string, displayName: string, occupation?: string) => {
    const { accessToken, user } = await authApi.register(email, password, displayName, occupation)
    sessionStorage.setItem(TOKEN_KEY, accessToken)
    applyUserTheme(user.themeColor)
    setState({ user, token: accessToken, isLoading: false })
  }, [])

  const logout = useCallback(async () => {
    if (state.token) {
      await authApi.logout(state.token).catch(() => {})
    }
    sessionStorage.removeItem(TOKEN_KEY)
    applyUserTheme('#6366f1') // reset to default
    setState({ user: null, token: null, isLoading: false })
  }, [state.token])

  const updateUser = useCallback((updated: AppUser) => {
    setState((prev) => ({ ...prev, user: updated }))
    applyUserTheme(updated.themeColor)
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export { ApiError }
