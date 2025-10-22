<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-100">
    <!-- Header -->
    <header class="bg-neutral-900 border-b border-neutral-800 px-6 py-4">
      <div class="max-w-4xl mx-auto flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-neutral-100">Quiz Médico</h1>
          <p class="text-sm text-neutral-400">Teste seus conhecimentos</p>
        </div>

        <div class="flex items-center gap-4">
          <div class="text-right">
            <p class="text-sm text-neutral-400">{{ authStore.currentUser?.username }}</p>
            <p class="text-xs text-neutral-500">
              {{ authStore.currentUser?.stats?.correctAnswers || 0 }} acertos
            </p>
          </div>

          <Button
            variant="outline"
            @click="goToDashboard"
            class="border-neutral-700 text-neutral-200 hover:bg-neutral-800 hover:text-neutral-100"
          >
            Dashboard
          </Button>
        </div>
      </div>
    </header>

    <!-- Quiz Content -->
    <main class="max-w-4xl mx-auto px-6 py-8">
      <!-- Loading State -->
      <div v-if="quizStore.isLoading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div
            class="w-12 h-12 border-4 border-neutral-700 border-t-neutral-100 rounded-full animate-spin mx-auto mb-4"
          ></div>
          <p class="text-neutral-400">Carregando termos...</p>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="quizStore.error"
        class="bg-red-900/20 border border-red-800 rounded-xl p-6 text-center"
      >
        <p class="text-red-400 mb-4">{{ quizStore.error }}</p>
        <Button @click="quizStore.fetchTerms(true)" class="bg-red-600 hover:bg-red-700">
          Tentar Novamente
        </Button>
      </div>

      <!-- Quiz Interface -->
      <div v-else-if="gameStore.currentQuestion" class="space-y-8">
        <!-- Question Card -->
        <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-8">
          <div class="mb-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span class="text-sm text-neutral-400">
                  {{ getQuestionTypeLabel(gameStore.currentQuestion.type) }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span class="text-sm text-neutral-400">
                  {{ getModeLabel(gameStore.currentQuestion.mode) }}
                </span>
              </div>
            </div>

            <h2 class="text-2xl font-bold text-neutral-100 mb-2">
              {{ getQuestionPrompt(gameStore.currentQuestion.type) }}
            </h2>
            <div class="bg-neutral-800 rounded-lg p-4 border-l-4 border-blue-500">
              <p class="text-lg text-neutral-200">
                {{ gameStore.currentQuestion.questionText }}
              </p>
            </div>
          </div>

          <!-- Input Mode -->
          <div v-if="gameStore.currentQuestion.mode === 'input'" class="space-y-4">
            <label class="block text-sm font-medium text-neutral-300"> Sua resposta: </label>
            <Input
              v-model="userAnswer"
              :disabled="gameStore.isProcessing"
              placeholder="Digite sua resposta..."
              class="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 text-lg p-4"
              @keyup.enter="submitAnswer"
            />
          </div>

          <!-- Multiple Choice Mode -->
          <div v-else-if="gameStore.currentQuestion.options" class="space-y-3">
            <label class="block text-sm font-medium text-neutral-300 mb-4">
              Selecione a resposta correta:
            </label>
            <div class="grid gap-3">
              <button
                v-for="(option, index) in gameStore.currentQuestion.options"
                :key="index"
                @click="selectOption(option)"
                :class="[
                  'text-left p-4 rounded-lg border-2 transition-all duration-200',
                  selectedOption === option
                    ? 'border-blue-500 bg-blue-900/20 text-blue-100 transform scale-[1.02]'
                    : 'border-neutral-700 bg-neutral-800 text-neutral-200 hover:border-neutral-600 hover:bg-neutral-750 hover:transform hover:scale-[1.01]',
                ]"
                :disabled="gameStore.isProcessing"
              >
                <div class="flex items-center gap-3">
                  <div
                    :class="[
                      'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                      selectedOption === option
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-neutral-600',
                    ]"
                  >
                    <div
                      v-if="selectedOption === option"
                      class="w-2 h-2 bg-white rounded-full"
                    ></div>
                  </div>
                  <span class="text-lg">{{ option }}</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="mt-8 flex justify-center">
            <Button
              @click="submitAnswer"
              :disabled="gameStore.isProcessing || !canSubmit"
              class="px-8 py-3 text-lg font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-900"
            >
              <span v-if="!gameStore.isProcessing">Confirmar Resposta</span>
              <span v-else class="flex items-center gap-2">
                <div
                  class="w-4 h-4 border-2 border-neutral-700 border-t-transparent rounded-full animate-spin"
                ></div>
                Processando...
              </span>
            </Button>
          </div>
        </div>

        <!-- Result Display -->
        <div
          v-if="gameStore.lastResult"
          class="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
        >
          <div class="text-center">
            <div
              :class="[
                'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4',
                gameStore.lastResult.isCorrect ? 'bg-green-900/20' : 'bg-red-900/20',
              ]"
            >
              <svg
                v-if="gameStore.lastResult.isCorrect"
                class="w-8 h-8 text-green-400"
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
              <svg
                v-else
                class="w-8 h-8 text-red-400"
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

            <h3
              :class="[
                'text-2xl font-bold mb-2',
                gameStore.lastResult.isCorrect ? 'text-green-400' : 'text-red-400',
              ]"
            >
              {{ gameStore.lastResult.isCorrect ? 'Correto!' : 'Incorreto!' }}
            </h3>

            <div v-if="!gameStore.lastResult.isCorrect" class="space-y-2 mb-6">
              <p class="text-neutral-400">Sua resposta:</p>
              <p class="text-lg text-red-300 bg-red-900/20 px-4 py-2 rounded border border-red-800">
                {{ gameStore.lastResult.providedAnswer }}
              </p>
              <p class="text-neutral-400">Resposta correta:</p>
              <p
                class="text-lg text-green-300 bg-green-900/20 px-4 py-2 rounded border border-green-800"
              >
                {{ gameStore.lastResult.correctAnswer }}
              </p>
            </div>

            <Button
              @click="nextQuestion"
              class="px-6 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-medium"
            >
              Próxima Pergunta
            </Button>
          </div>
        </div>
      </div>

      <!-- No Questions State -->
      <div v-else class="text-center py-20">
        <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-8 max-w-md mx-auto">
          <h2 class="text-xl font-bold text-neutral-100 mb-4">Quiz não iniciado</h2>
          <p class="text-neutral-400 mb-6">Clique no botão abaixo para começar</p>
          <Button
            @click="startQuiz"
            class="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-medium"
          >
            Iniciar Quiz
          </Button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/app/stores/auth'
import { useQuizStore } from '@/app/stores/quiz'
import { useGameLogicStore } from '@/app/stores/game'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { QuestionType, AnswerMode } from '@/core/models/types'

const router = useRouter()
const authStore = useAuthStore()
const quizStore = useQuizStore()
const gameStore = useGameLogicStore()

const userAnswer = ref('')
const selectedOption = ref('')

const canSubmit = computed(() => {
  if (!gameStore.currentQuestion) return false

  if (gameStore.currentQuestion.mode === 'input') {
    return userAnswer.value.trim().length > 0
  } else {
    return selectedOption.value.length > 0
  }
})

const getQuestionTypeLabel = (type: QuestionType): string => {
  return type === 'definition_to_term' ? 'Definição → Termo' : 'Termo → Definição'
}

const getModeLabel = (mode: AnswerMode): string => {
  return mode === 'input' ? 'Resposta Livre' : 'Múltipla Escolha'
}

const getQuestionPrompt = (type: QuestionType): string => {
  return type === 'definition_to_term'
    ? 'Qual termo corresponde a esta definição?'
    : 'Qual é a definição deste termo?'
}

const selectOption = (option: string) => {
  selectedOption.value = option
}

const submitAnswer = async () => {
  if (!canSubmit.value) return

  const answer =
    gameStore.currentQuestion?.mode === 'input' ? userAnswer.value.trim() : selectedOption.value

  const result = await gameStore.submitAnswer(answer)

  if (result) {
    if (result.isCorrect) {
      toast.success('Resposta correta! 🎉')
    } else {
      toast.error('Resposta incorreta. Veja a correção abaixo.')
    }
  }
}

const nextQuestion = () => {
  userAnswer.value = ''
  selectedOption.value = ''

  gameStore.generateNextQuestion()
}

const startQuiz = async () => {
  if (quizStore.allTerms.length === 0) {
    await quizStore.fetchTerms()
  }

  if (quizStore.allTerms.length > 0) {
    gameStore.generateNextQuestion()
    toast.success('Quiz iniciado! Boa sorte! 🍀')
  } else {
    toast.error('Não foi possível carregar os termos. Tente novamente.')
  }
}

const goToDashboard = () => {
  router.push('/dashboard')
}

onMounted(async () => {
  if (quizStore.allTerms.length === 0) {
    await quizStore.fetchTerms()
  }
})
</script>
