import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../database/firebase'
import type { UserTermStats } from '../models/types'

export interface UserProgress {
  totalTermsStudied: number
  averageAccuracy: number
  categoryProgress: CategoryProgress[]
  recentActivity: TermActivity[]
  strongestTerms: UserTermStats[]
  weakestTerms: UserTermStats[]
}

export interface CategoryProgress {
  category: string
  totalTerms: number
  studiedTerms: number
  accuracy: number
  correctAnswers: number
  totalAttempts: number
}

export interface TermActivity {
  termId: string
  termString: string
  category: string
  isCorrect: boolean
  timestamp: Date
}

export const getUserProgress = async (userId: string): Promise<UserProgress> => {
  try {
    const statsQuery = query(collection(db, 'userTermStats'), where('userId', '==', userId))
    const statsSnapshot = await getDocs(statsQuery)

    const userStats: UserTermStats[] = statsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as UserTermStats,
    )

    const categoryMap = new Map<
      string,
      {
        totalTerms: number
        correctAnswers: number
        totalAttempts: number
      }
    >()

    const termsQuery = query(collection(db, 'terms'))
    const termsSnapshot = await getDocs(termsQuery)
    const allTerms = termsSnapshot.docs.map((doc) => ({
      id: doc.id,
      term: doc.data().term || '',
      definition: doc.data().definition || '',
      category: doc.data().category || '',
    }))

    allTerms.forEach((term) => {
      if (!categoryMap.has(term.category)) {
        categoryMap.set(term.category, {
          totalTerms: 0,
          correctAnswers: 0,
          totalAttempts: 0,
        })
      }
      const category = categoryMap.get(term.category)!
      category.totalTerms++
    })

    userStats.forEach((stat) => {
      const term = allTerms.find((t) => t.id === stat.termId)
      if (term && categoryMap.has(term.category)) {
        const category = categoryMap.get(term.category)!
        category.correctAnswers += stat.correctCount
        category.totalAttempts += stat.correctCount + stat.incorrectCount
      }
    })

    const categoryProgress: CategoryProgress[] = Array.from(categoryMap.entries()).map(
      ([categoryName, data]) => ({
        category: categoryName,
        totalTerms: data.totalTerms,
        studiedTerms: userStats.filter((stat) => {
          const term = allTerms.find((t) => t.id === stat.termId)
          return term?.category === categoryName
        }).length,
        accuracy:
          data.totalAttempts > 0 ? Math.round((data.correctAnswers / data.totalAttempts) * 100) : 0,
        correctAnswers: data.correctAnswers,
        totalAttempts: data.totalAttempts,
      }),
    )

    const totalCorrectAnswers = userStats.reduce((sum, stat) => sum + stat.correctCount, 0)
    const totalAttempts = userStats.reduce(
      (sum, stat) => sum + stat.correctCount + stat.incorrectCount,
      0,
    )
    const averageAccuracy =
      totalAttempts > 0 ? Math.round((totalCorrectAnswers / totalAttempts) * 100) : 0

    const termsWithStats = userStats
      .filter((stat) => stat.correctCount + stat.incorrectCount >= 3) // Mínimo 3 tentativas
      .map((stat) => ({
        ...stat,
        accuracy: Math.round((stat.correctCount / (stat.correctCount + stat.incorrectCount)) * 100),
      }))

    const strongestTerms = termsWithStats.sort((a, b) => b.accuracy - a.accuracy).slice(0, 5)

    const weakestTerms = termsWithStats.sort((a, b) => a.accuracy - b.accuracy).slice(0, 5)

    return {
      totalTermsStudied: userStats.length,
      averageAccuracy,
      categoryProgress,
      recentActivity: [], //  TODO: Implementar se necessário
      strongestTerms,
      weakestTerms,
    }
  } catch (error) {
    console.error('Erro ao buscar progresso do usuário:', error)
    throw error
  }
}

export const getTermsByCategory = async (category?: string) => {
  try {
    let termsQuery = query(collection(db, 'terms'))

    if (category) {
      termsQuery = query(collection(db, 'terms'), where('category', '==', category))
    }

    const snapshot = await getDocs(termsQuery)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      term: doc.data().term || '',
      definition: doc.data().definition || '',
      category: doc.data().category || '',
    }))
  } catch (error) {
    console.error('Erro ao buscar termos por categoria:', error)
    throw error
  }
}
