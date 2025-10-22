import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore'
import { db } from '../database/firebase'
import type { User, UserDocument, UserStats } from '../models/types'

const normalizeUsername = (username: string): string => {
  return username.toLowerCase().trim().replace(/\s+/g, '')
}

export const getUser = async (username: string): Promise<User | null> => {
  const docId = normalizeUsername(username)
  const userRef = doc(db, 'users', docId)
  const docSnap = await getDoc(userRef)

  if (docSnap.exists()) {
    return {
      username: docId,
      ...(docSnap.data() as UserDocument),
    }
  } else {
    return null
  }
}

export const createUser = async (username: string, password: string): Promise<User> => {
  const docId = normalizeUsername(username)
  const userRef = doc(db, 'users', docId)

  const newUserStats: UserStats = {
    totalAttempts: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
  }

  const newUserDoc: UserDocument = {
    password: password, // TODO: Lembre-se, isso não é seguro para produção!
    stats: newUserStats,
  }

  await setDoc(userRef, newUserDoc)

  return {
    username: docId,
    ...newUserDoc,
  }
}

export const updateUserGeneralStats = async (
  username: string,
  isCorrect: boolean,
): Promise<void> => {
  const docId = normalizeUsername(username)
  const userRef = doc(db, 'users', docId)

  const fieldToIncrement = isCorrect ? 'stats.correctAnswers' : 'stats.incorrectAnswers'

  await updateDoc(userRef, {
    'stats.totalAttempts': increment(1),
    [fieldToIncrement]: increment(1),
  })
}
