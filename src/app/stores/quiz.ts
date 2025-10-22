import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Term } from '@/core/models/types'
import { getAllTerms } from '@/core/features/terms'

const TERMS_STORAGE_KEY = 'semio-quiz-terms'

export const useQuizStore = defineStore('quiz', () => {
  const terms = ref<Term[]>([])
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const allTerms = computed(() => terms.value)

  const categories = computed(() => {
    const categorySet = new Set(terms.value.map((t) => t.category))
    return Array.from(categorySet)
  })

  const fetchTerms = async (forceRefresh: boolean = false) => {
    if (!forceRefresh) {
      try {
        const storedTerms = localStorage.getItem(TERMS_STORAGE_KEY)
        if (storedTerms) {
          terms.value = JSON.parse(storedTerms) as Term[]
          return
        }
      } catch (err) {
        console.error('Erro ao carregar termos do localStorage:', err)
        localStorage.removeItem(TERMS_STORAGE_KEY)
      }
    }

    isLoading.value = true
    error.value = null

    try {
      const fetchedTerms = await getAllTerms()
      terms.value = fetchedTerms

      localStorage.setItem(TERMS_STORAGE_KEY, JSON.stringify(fetchedTerms))
    } catch (err) {
      console.error('Erro ao buscar termos do Firestore:', err)
      error.value = 'Falha ao carregar os termos. Tente recarregar a página.'
    } finally {
      isLoading.value = false
    }
  }

  const clearTermsCache = () => {
    terms.value = []
    localStorage.removeItem(TERMS_STORAGE_KEY)
  }

  return {
    terms,
    isLoading,
    error,
    allTerms,
    categories,
    fetchTerms,
    clearTermsCache,
  }
})
