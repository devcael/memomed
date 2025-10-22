<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-100">
    <!-- Header -->
    <header class="bg-neutral-900 border-b border-neutral-800 px-6 py-4">
      <div class="max-w-6xl mx-auto flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-neutral-100">Revisão de Termos</h1>
          <p class="text-sm text-neutral-400">Estude os termos médicos por categoria</p>
        </div>

        <div class="flex items-center gap-4">
          <Button
            variant="outline"
            @click="goToDashboard"
            class="border-neutral-700 text-neutral-200 hover:bg-neutral-800 hover:text-neutral-100"
          >
            Dashboard
          </Button>

          <Button
            @click="goToQuiz"
            class="bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-medium"
          >
            Fazer Quiz
          </Button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-6xl mx-auto px-6 py-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div
            class="w-12 h-12 border-4 border-neutral-700 border-t-neutral-100 rounded-full animate-spin mx-auto mb-4"
          ></div>
          <p class="text-neutral-400">Carregando termos...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-900/20 border border-red-800 rounded-xl p-6 text-center">
        <p class="text-red-400 mb-4">{{ error }}</p>
        <Button @click="loadTerms" class="bg-red-600 hover:bg-red-700"> Tentar Novamente </Button>
      </div>

      <!-- Content -->
      <div v-else class="space-y-8">
        <!-- Category Filter -->
        <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-neutral-100 mb-4">Filtrar por Categoria</h2>

          <div class="flex flex-wrap gap-2">
            <button
              @click="selectedCategory = null"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                selectedCategory === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700',
              ]"
            >
              Todas ({{ filteredTerms.length }})
            </button>

            <button
              v-for="category in categories"
              :key="category.name"
              @click="selectedCategory = category.name"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                selectedCategory === category.name
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700',
              ]"
            >
              {{ category.name }} ({{ category.count }})
            </button>
          </div>
        </div>

        <!-- Search -->
        <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-neutral-100 mb-4">Buscar Termo</h2>
          <Input
            v-model="searchQuery"
            placeholder="Digite para buscar por termo ou definição..."
            class="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500"
          />
        </div>

        <!-- Study Mode Toggle -->
        <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-neutral-100">Modo de Estudo</h2>
              <p class="text-sm text-neutral-400">Escolha como visualizar os termos</p>
            </div>

            <div class="flex items-center gap-2">
              <button
                @click="showDefinitions = !showDefinitions"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  showDefinitions
                    ? 'bg-green-600 text-white'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700',
                ]"
              >
                {{ showDefinitions ? 'Ocultar' : 'Mostrar' }} Definições
              </button>
            </div>
          </div>
        </div>

        <!-- Terms Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="term in paginatedTerms"
            :key="term.id"
            class="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition-all"
          >
            <div class="space-y-4">
              <!-- Term Header -->
              <div class="flex items-start justify-between">
                <h3 class="text-xl font-bold text-neutral-100">{{ term.term }}</h3>
                <span class="text-xs px-2 py-1 bg-blue-900/20 text-blue-300 rounded-full">
                  {{ term.category }}
                </span>
              </div>

              <!-- Definition -->
              <div
                v-if="showDefinitions || visibleDefinitions.has(term.id)"
                class="bg-neutral-800 rounded-lg p-4 border-l-4 border-blue-500"
              >
                <p class="text-neutral-200">{{ term.definition }}</p>
              </div>

              <!-- Study Actions -->
              <div class="flex items-center gap-2 pt-2">
                <button
                  @click="toggleDefinition(term.id)"
                  class="flex-1 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-sm transition-all"
                >
                  {{
                    showDefinitions || visibleDefinitions.has(term.id) ? 'Ocultar' : 'Ver'
                  }}
                  Definição
                </button>

                <button
                  @click="markAsStudied(term.id)"
                  :class="[
                    'px-3 py-2 rounded-lg text-sm transition-all',
                    studiedTerms.has(term.id)
                      ? 'bg-green-700 text-green-100'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200',
                  ]"
                >
                  {{ studiedTerms.has(term.id) ? '✓ Estudado' : 'Marcar' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
            class="border-neutral-700 text-neutral-200 hover:bg-neutral-800"
          >
            Anterior
          </Button>

          <span class="px-4 py-2 text-neutral-400">
            Página {{ currentPage }} de {{ totalPages }}
          </span>

          <Button
            variant="outline"
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="border-neutral-700 text-neutral-200 hover:bg-neutral-800"
          >
            Próxima
          </Button>
        </div>

        <!-- Study Progress -->
        <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-neutral-100 mb-4">Progresso da Sessão</h2>

          <div class="space-y-4">
            <div class="flex items-center justify-between text-sm">
              <span class="text-neutral-400">Termos estudados nesta sessão</span>
              <span class="text-neutral-100"
                >{{ studiedTerms.size }} / {{ filteredTerms.length }}</span
              >
            </div>

            <div class="w-full bg-neutral-800 rounded-full h-3">
              <div
                class="bg-linear-to-r from-blue-500 to-emerald-400 h-3 rounded-full transition-all duration-500"
                :style="{ width: `${studyProgress}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { useQuizStore } from '@/app/stores/quiz'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Term } from '@/core/models/types'

const router = useRouter()
const quizStore = useQuizStore()

const isLoading = ref(false)
const error = ref<string | null>(null)
const terms = ref<Term[]>([])
const selectedCategory = ref<string | null>(null)
const searchQuery = ref('')
const showDefinitions = ref(false)
const visibleDefinitions = ref(new Set<string>())
const studiedTerms = ref(new Set<string>())
const currentPage = ref(1)
const termsPerPage = 8

const categories = computed(() => {
  const categoryMap = new Map<string, number>()

  terms.value.forEach((term) => {
    categoryMap.set(term.category, (categoryMap.get(term.category) || 0) + 1)
  })

  return Array.from(categoryMap.entries())
    .map(([name, count]) => ({
      name,
      count,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
})

const filteredTerms = computed(() => {
  let filtered = terms.value

  // Filtrar por categoria
  if (selectedCategory.value) {
    filtered = filtered.filter((term) => term.category === selectedCategory.value)
  }

  // Filtrar por busca
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (term) =>
        term.term.toLowerCase().includes(query) || term.definition.toLowerCase().includes(query),
    )
  }

  return filtered.sort((a, b) => a.term.localeCompare(b.term))
})

const totalPages = computed(() => {
  return Math.ceil(filteredTerms.value.length / termsPerPage)
})

const paginatedTerms = computed(() => {
  const start = (currentPage.value - 1) * termsPerPage
  const end = start + termsPerPage
  return filteredTerms.value.slice(start, end)
})

const studyProgress = computed(() => {
  if (filteredTerms.value.length === 0) return 0
  return Math.round((studiedTerms.value.size / filteredTerms.value.length) * 100)
})

const loadTerms = async () => {
  try {
    isLoading.value = true
    error.value = null

    await quizStore.fetchTerms()
    terms.value = quizStore.allTerms

    if (terms.value.length === 0) {
      error.value = 'Nenhum termo encontrado. Adicione termos primeiro.'
    }
  } catch (err) {
    console.error('Erro ao carregar termos:', err)
    error.value = 'Erro ao carregar termos. Tente novamente.'
  } finally {
    isLoading.value = false
  }
}

const toggleDefinition = (termId: string) => {
  if (visibleDefinitions.value.has(termId)) {
    visibleDefinitions.value.delete(termId)
  } else {
    visibleDefinitions.value.add(termId)
  }
}

const markAsStudied = (termId: string) => {
  if (studiedTerms.value.has(termId)) {
    studiedTerms.value.delete(termId)
    toast.info('Termo desmarcado como estudado')
  } else {
    studiedTerms.value.add(termId)
    toast.success('Termo marcado como estudado!')
  }
}

const goToDashboard = () => {
  router.push('/dashboard')
}

const goToQuiz = () => {
  router.push('/quiz')
}

// Resetar página quando filtros mudarem
const resetPagination = () => {
  currentPage.value = 1
}

// Watchers para resetar paginação
import { watch } from 'vue'
watch([selectedCategory, searchQuery], resetPagination)

onMounted(() => {
  loadTerms()
})
</script>
