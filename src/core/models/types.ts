import type { Timestamp } from 'firebase/firestore'

export interface UserStats {
  totalAttempts: number
  correctAnswers: number
  incorrectAnswers: number
}

export interface UserDocument {
  password: string
  stats: UserStats
}

export interface User extends UserDocument {
  username: string
}

export interface TermDocument {
  term: string
  definition: string
  category: string
}

export interface Term extends TermDocument {
  id: string 
}

export interface UserTermStatsDocument {
  userId: string 
  termId: string 
  termString: string 
  correctCount: number
  incorrectCount: number
}

export interface UserTermStats extends UserTermStatsDocument {
  id: string 
}

export interface Stat {
  termId: string
  termName: string 
  hits: number
  misses: number
  lastAttempt: Timestamp
}

export type QuestionType = 'definition_to_term' | 'term_to_definition'

export type AnswerMode = 'input' | 'multiple_choice'


export interface Question {
  term: Term
  questionText: string
  correctAnswer: string
  type: QuestionType
  mode: AnswerMode
  options: string[] | null
}

export interface AnswerResult {
  question: Question
  providedAnswer: string
  correctAnswer: string
  isCorrect: boolean
}
