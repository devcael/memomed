import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useQuizStore } from './quiz'
import { useAuthStore } from './auth'
import { useSettingsStore } from './settings'
import { updateUserGeneralStats } from '@/core/features/user'
import { updateUserTermStat } from '@/core/features/terms'
import type { AnswerMode, AnswerResult, Question, QuestionType, Term } from '@/core/models/types'

const getRandomItem = <T>(arr: T[]): T => {
  if (arr.length === 0) {
    throw new Error('Array cannot be empty')
  }
  return arr[Math.floor(Math.random() * arr.length)]!
}

const shuffleArray = <T>(arr: T[]): T[] => {
  const newArr = [...arr]
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = newArr[i]!
    newArr[i] = newArr[j]!
    newArr[j] = temp
  }
  return newArr
}

const normalizeString = (str: string): string => {
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export const useGameLogicStore = defineStore('gameLogic', () => {
  const quizStore = useQuizStore()
  const authStore = useAuthStore()
  const settingsStore = useSettingsStore()

  const currentQuestion = ref<Question | null>(null)
  const lastResult = ref<AnswerResult | null>(null)
  const isProcessing = ref<boolean>(false)

  const generateNextQuestion = () => {
    if (quizStore.allTerms.length === 0) {
      console.error('Nenhum termo carregado para gerar pergunta.')
      return
    }
    lastResult.value = null
    isProcessing.value = false

    const correctTerm = getRandomItem(quizStore.allTerms)

    const type: QuestionType = Math.random() < 0.5 ? 'definition_to_term' : 'term_to_definition'

    // Se o modo de input estiver habilitado, escolhe aleatoriamente, senão sempre múltipla escolha
    const mode: AnswerMode = settingsStore.enableInputMode
      ? Math.random() < 0.5
        ? 'input'
        : 'multiple_choice'
      : 'multiple_choice'

    let questionText = ''
    let correctAnswer = ''
    let options: string[] | null = null

    if (type === 'definition_to_term') {
      questionText = correctTerm.definition
      correctAnswer = correctTerm.term

      if (mode === 'multiple_choice') {
        options = generateOptions(quizStore.allTerms, correctTerm, 'term')
      }
    } else {
      questionText = correctTerm.term
      correctAnswer = correctTerm.definition

      if (mode === 'multiple_choice') {
        options = generateOptions(quizStore.allTerms, correctTerm, 'definition')
      }
    }

    currentQuestion.value = {
      term: correctTerm,
      questionText,
      correctAnswer,
      type,
      mode,
      options,
    }
  }

  const generateOptions = (
    allTerms: Term[],
    correctTerm: Term,
    field: 'term' | 'definition',
  ): string[] => {
    const options: string[] = [correctTerm[field]]
    const wrongTerms = allTerms.filter((t) => t.id !== correctTerm.id)

    while (options.length < 4 && wrongTerms.length > 0) {
      const wrongOptionTerm = getRandomItem(wrongTerms)
      wrongTerms.splice(wrongTerms.indexOf(wrongOptionTerm), 1)

      const wrongOption = wrongOptionTerm[field]
      if (!options.includes(wrongOption)) {
        options.push(wrongOption)
      }
    }

    while (options.length < 4) {
      options.push(`Opção Inválida ${options.length}`)
    }

    return shuffleArray(options)
  }

  const submitAnswer = async (providedAnswer: string) => {
    if (!currentQuestion.value || !authStore.currentUser) {
      console.error('Nenhuma pergunta ou usuário para processar resposta.')
      return
    }

    isProcessing.value = true
    const { term, correctAnswer } = currentQuestion.value
    const userId = authStore.currentUser.username

    const isCorrect = normalizeString(providedAnswer) === normalizeString(correctAnswer)

    try {
      await updateUserGeneralStats(userId, isCorrect)
      await updateUserTermStat(userId, term.id, term.term, isCorrect)
    } catch (err) {
      console.error('Falha ao salvar estatística:', err)
    }

    lastResult.value = {
      question: currentQuestion.value,
      providedAnswer,
      correctAnswer,
      isCorrect,
    }

    isProcessing.value = false
    return lastResult.value
  }

  return {
    currentQuestion,
    lastResult,
    isProcessing,
    generateNextQuestion,
    submitAnswer,
  }
})
