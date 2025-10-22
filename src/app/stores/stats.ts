import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  getUserProgress,
  getTermsByCategory,
  type UserProgress,
  type CategoryProgress,
} from '@/core/features/stats'
import { useAuthStore } from './auth'
import type { Term } from '@/core/models/types'

export const useStatsStore = defineStore('stats', () => {
  const authStore = useAuthStore()

  const userProgress = ref<UserProgress | null>(null)
  const termsByCategory = ref<Record<string, Term[]>>({})
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const totalTermsStudied = computed(() => userProgress.value?.totalTermsStudied || 0)
  const averageAccuracy = computed(() => userProgress.value?.averageAccuracy || 0)
  const categoryProgress = computed(() => userProgress.value?.categoryProgress || [])
  const strongestTerms = computed(() => userProgress.value?.strongestTerms || [])
  const weakestTerms = computed(() => userProgress.value?.weakestTerms || [])

  const bestCategory = computed(() => {
    if (!userProgress.value?.categoryProgress.length) return null

    return userProgress.value.categoryProgress.reduce(
      (best, current) => {
        if (current.totalAttempts === 0) return best
        return current.accuracy > (best?.accuracy || 0) ? current : best
      },
      null as CategoryProgress | null,
    )
  })

  const needsImprovementCategory = computed(() => {
    if (!userProgress.value?.categoryProgress.length) return null

    return userProgress.value.categoryProgress
      .filter((cat) => cat.totalAttempts > 0)
      .reduce(
        (worst, current) => {
          return current.accuracy < (worst?.accuracy || 100) ? current : worst
        },
        null as CategoryProgress | null,
      )
  })

  const fetchUserProgress = async () => {
    if (!authStore.currentUser) {
      error.value = 'Usuário não autenticado'
      return
    }

    try {
      isLoading.value = true
      error.value = null

      userProgress.value = await getUserProgress(authStore.currentUser.username)
    } catch (err) {
      console.error('Erro ao buscar progresso do usuário:', err)
      error.value = 'Erro ao carregar estatísticas'
    } finally {
      isLoading.value = false
    }
  }

  const fetchTermsByCategory = async (category?: string) => {
    try {
      const terms = await getTermsByCategory(category)

      if (category) {
        termsByCategory.value[category] = terms
      } else {
        // Organizar por categoria
        const organized: Record<string, Term[]> = {}
        terms.forEach((term) => {
          if (!organized[term.category]) {
            organized[term.category] = []
          }
          organized[term.category]!.push(term)
        })
        termsByCategory.value = organized
      }

      return terms
    } catch (err) {
      console.error('Erro ao buscar termos por categoria:', err)
      throw err
    }
  }

  const refreshStats = async () => {
    await fetchUserProgress()
  }

  const clearStats = () => {
    userProgress.value = null
    termsByCategory.value = {}
    error.value = null
  }

  return {
    // State
    userProgress,
    termsByCategory,
    isLoading,
    error,

    // Getters
    totalTermsStudied,
    averageAccuracy,
    categoryProgress,
    strongestTerms,
    weakestTerms,
    bestCategory,
    needsImprovementCategory,

    // Actions
    fetchUserProgress,
    fetchTermsByCategory,
    refreshStats,
    clearStats,
  }
})
