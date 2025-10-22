import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@/core/models/types'
import { getUser, createUser } from '@/core/features/user'

const LOCAL_STORAGE_KEY = 'semio-quiz-user'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!currentUser.value)

  const login = async (username: string, password: string) => {
    if (!username || !password) {
      error.value = 'Nome de usuário e senha são obrigatórios.'
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const existingUser = await getUser(username)

      if (existingUser) {
        if (existingUser.password === password) {
          currentUser.value = existingUser
          persistUser(existingUser)
        } else {
          error.value = 'Senha incorreta. Tente novamente.'
          currentUser.value = null
        }
      } else {
        const newUser = await createUser(username, password)
        currentUser.value = newUser
        persistUser(newUser)
      }
    } catch (err: unknown) {
      console.error('Erro durante o login:', err)

      // Tratamento específico para erros do Firebase
      const error_msg = err as { code?: string; message?: string }
      if (
        error_msg?.code === 'permission-denied' ||
        error_msg?.message?.includes('insufficient permissions')
      ) {
        error.value = 'Erro de permissão: Verifique as regras do Firestore no Firebase Console.'
      } else if (error_msg?.code === 'unavailable') {
        error.value = 'Serviço temporariamente indisponível. Tente novamente.'
      } else if (error_msg?.code === 'network-request-failed') {
        error.value = 'Erro de conexão. Verifique sua internet.'
      } else {
        error.value = `Erro: ${error_msg?.message || 'Ocorreu um erro inesperado. Tente mais tarde.'}`
      }

      currentUser.value = null
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    currentUser.value = null
    localStorage.removeItem(LOCAL_STORAGE_KEY)
  }

  const persistUser = (user: User) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user))
  }

  const checkSession = () => {
    try {
      const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (storedUser) {
        currentUser.value = JSON.parse(storedUser) as User
      }
    } catch (err) {
      console.error('Erro ao carregar sessão do localStorage:', err)
      localStorage.removeItem(LOCAL_STORAGE_KEY)
    }
  }

  return {
    currentUser,
    isLoading,
    error,
    isAuthenticated,
    login,
    logout,
    checkSession,
  }
})
