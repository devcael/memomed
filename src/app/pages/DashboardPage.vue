<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-100">
    <!-- Header -->
    <header class="bg-neutral-900 border-b border-neutral-800 px-6 py-4">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-neutral-100">Memo Med</h1>
          <p class="text-sm text-neutral-400">Dashboard de Estudos</p>
        </div>

        <div class="flex items-center gap-4">
          <div class="text-right">
            <p class="text-sm text-neutral-400">Bem-vindo,</p>
            <p class="font-medium text-neutral-100">{{ authStore.currentUser?.username }}</p>
          </div>

          <Button
            variant="outline"
            @click="handleLogout"
            class="border-neutral-700 text-neutral-200 hover:bg-neutral-800 hover:text-neutral-100"
          >
            Sair
          </Button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-6 py-8">
      <!-- Loading State -->
      <div v-if="statsStore.isLoading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div
            class="w-12 h-12 border-4 border-neutral-700 border-t-neutral-100 rounded-full animate-spin mx-auto mb-4"
          ></div>
          <p class="text-neutral-400">Carregando estatísticas...</p>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="statsStore.error"
        class="bg-red-900/20 border border-red-800 rounded-xl p-6 text-center mb-8"
      >
        <p class="text-red-400 mb-4">{{ statsStore.error }}</p>
        <Button @click="statsStore.fetchUserProgress()" class="bg-red-600 hover:bg-red-700">
          Tentar Novamente
        </Button>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-neutral-400">Total de Tentativas</p>
                <p class="text-2xl font-bold text-neutral-100">
                  {{ totalAttempts }}
                </p>
              </div>
              <div class="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center">
                <svg
                  class="w-6 h-6 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-neutral-400">Respostas Corretas</p>
                <p class="text-2xl font-bold text-green-400">
                  {{ totalCorrectAnswers }}
                </p>
              </div>
              <div class="w-12 h-12 bg-green-900/20 rounded-lg flex items-center justify-center">
                <svg
                  class="w-6 h-6 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-neutral-400">Respostas Incorretas</p>
                <p class="text-2xl font-bold text-red-400">
                  {{ totalIncorrectAnswers }}
                </p>
              </div>
              <div class="w-12 h-12 bg-red-900/20 rounded-lg flex items-center justify-center">
                <svg
                  class="w-6 h-6 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Progress Chart -->
        <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-8">
          <h2 class="text-xl font-semibold text-neutral-100 mb-4">Seu Progresso</h2>

          <div class="space-y-4">
            <div class="flex items-center justify-between text-sm">
              <span class="text-neutral-400">Taxa de Acerto</span>
              <span class="text-neutral-100">{{ accuracyRate }}%</span>
            </div>

            <div class="w-full bg-neutral-800 rounded-full h-3">
              <div
                class="bg-linear-to-r from-green-500 to-emerald-400 h-3 rounded-full transition-all duration-500"
                :style="{ width: `${accuracyRate}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Category Progress -->
        <div
          v-if="statsStore.userProgress"
          class="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-8"
        >
          <h2 class="text-xl font-semibold text-neutral-100 mb-6">Progresso por Categoria</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="category in statsStore.categoryProgress"
              :key="category.category"
              class="bg-neutral-800 rounded-lg p-4"
            >
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-medium text-neutral-200">{{ category.category }}</h3>
                <span class="text-sm text-neutral-400">{{ category.accuracy }}%</span>
              </div>

              <div class="text-xs text-neutral-500 mb-2">
                {{ category.studiedTerms }}/{{ category.totalTerms }} termos estudados
              </div>

              <div class="w-full bg-neutral-700 rounded-full h-2">
                <div
                  class="bg-linear-to-r from-blue-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                  :style="{ width: `${category.accuracy}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 class="text-lg font-semibold text-neutral-100 mb-2">Iniciar Quiz</h3>
            <p class="text-neutral-400 mb-4">
              Comece um novo quiz para testar seus conhecimentos médicos
            </p>
            <Button
              @click="goToQuiz"
              class="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-medium"
            >
              Começar Quiz
            </Button>
          </div>

          <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 class="text-lg font-semibold text-neutral-100 mb-2">Revisar Termos</h3>
            <p class="text-neutral-400 mb-4">Revise os termos médicos e suas definições</p>
            <Button
              @click="goToReview"
              variant="outline"
              class="w-full border-neutral-700 text-neutral-200 hover:bg-neutral-800 hover:text-neutral-100"
            >
              Revisar Termos
            </Button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/app/stores/auth'
import { useStatsStore } from '@/app/stores/stats'
import { Button } from '@/components/ui/button'

const router = useRouter()
const authStore = useAuthStore()
const statsStore = useStatsStore()

const accuracyRate = computed(() => {
  return statsStore.averageAccuracy
})

const totalAttempts = computed(() => {
  if (!statsStore.userProgress) return 0
  return statsStore.categoryProgress.reduce((total, cat) => total + cat.totalAttempts, 0)
})

const totalCorrectAnswers = computed(() => {
  if (!statsStore.userProgress) return 0
  return statsStore.categoryProgress.reduce((total, cat) => total + cat.correctAnswers, 0)
})

const totalIncorrectAnswers = computed(() => {
  const total = totalAttempts.value
  const correct = totalCorrectAnswers.value
  return total - correct
})

const handleLogout = () => {
  authStore.logout()
  toast.success('Logout realizado com sucesso!')
  router.push('/login')
}

const goToQuiz = () => {
  router.push('/quiz')
}

const goToReview = () => {
  router.push('/review')
}

onMounted(() => {
  statsStore.fetchUserProgress()
})
</script>
