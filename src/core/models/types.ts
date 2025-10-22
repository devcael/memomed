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
  id: string // ID do documento do Firestore
}

export interface UserTermStatsDocument {
  userId: string // Corresponde a User.username
  termId: string // Corresponde a Term.id
  termString: string // Nome do termo desnormalizado para facilitar
  correctCount: number
  incorrectCount: number
}

export interface UserTermStats extends UserTermStatsDocument {
  id: string // ID composto: {userId}_{termId}
}

export interface Stat {
  termId: string
  termName: string // Denormalizado para facilitar a exibição
  hits: number
  misses: number
  lastAttempt: Timestamp
}

// --- Novos Tipos de Lógica de Jogo ---

/**
 * Define o tipo de pergunta
 * 'definition_to_term': Mostra a definição, pede o termo.
 * 'term_to_definition': Mostra o termo, pede a definição.
 */
export type QuestionType = 'definition_to_term' | 'term_to_definition'

/**
 * Define como a resposta será coletada
 * 'input': Campo de texto livre.
 * 'multiple_choice': 4 botões de opção.
 */
export type AnswerMode = 'input' | 'multiple_choice'

/**
 * A estrutura de uma única pergunta gerada para o usuário.
 */
export interface Question {
  /** O objeto Termo completo que esta pergunta está testando. */
  term: Term
  /** O texto da pergunta (ex: "Qual a definição de 'Febre'?") */
  questionText: string
  /** A resposta textual exata e correta. */
  correctAnswer: string
  /** O tipo de pergunta (Def -> Termo ou Termo -> Def). */
  type: QuestionType
  /** O modo de resposta (Input ou Múltipla Escolha). */
  mode: AnswerMode
  /** Lista de opções, se mode === 'multiple_choice'. */
  options: string[] | null
}

/**
 * O resultado de uma resposta processada.
 */
export interface AnswerResult {
  /** A pergunta original que foi respondida. */
  question: Question
  /** A resposta que o usuário forneceu. */
  providedAnswer: string
  /** A resposta correta que era esperada. */
  correctAnswer: string
  /** Se o usuário acertou ou não. */
  isCorrect: boolean
}
