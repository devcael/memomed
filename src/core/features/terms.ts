import {
  query,
  collection,
  getDocs,
  where,
  doc,
  getDoc,
  updateDoc,
  increment,
  setDoc,
} from 'firebase/firestore'
import { db } from '../database/firebase'
import type { Term, TermDocument, UserTermStats, UserTermStatsDocument } from '../models/types'

export const getAllTerms = async (): Promise<Term[]> => {
  const q = query(collection(db, 'terms'))
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as TermDocument),
  }))
}

export const getUserTermStatsMap = async (
  userId: string, // Espera-se o 'username' normalizado
): Promise<Map<string, UserTermStats>> => {
  const statsMap = new Map<string, UserTermStats>()
  const q = query(collection(db, 'userTermStats'), where('userId', '==', userId))
  const querySnapshot = await getDocs(q)

  querySnapshot.docs.forEach((doc) => {
    const stat = {
      id: doc.id,
      ...(doc.data() as UserTermStatsDocument),
    }
    statsMap.set(stat.termId, stat)
  })

  return statsMap
}

export const updateUserTermStat = async (
  userId: string, // 'username' normalizado
  termId: string,
  termString: string, // 'term.term' desnormalizado
  isCorrect: boolean,
): Promise<void> => {
  const docId = `${userId}_${termId}` // Chave composta
  const statRef = doc(db, 'userTermStats', docId)
  const docSnap = await getDoc(statRef)

  const fieldToIncrement = isCorrect ? 'correctCount' : 'incorrectCount'

  if (docSnap.exists()) {
    // Documento existe, apenas incrementa
    await updateDoc(statRef, {
      [fieldToIncrement]: increment(1),
    })
  } else {
    // Documento não existe, cria um novo
    const newStatDoc: UserTermStatsDocument = {
      userId: userId,
      termId: termId,
      termString: termString,
      correctCount: isCorrect ? 1 : 0,
      incorrectCount: !isCorrect ? 1 : 0,
    }
    await setDoc(statRef, newStatDoc)
  }
}
