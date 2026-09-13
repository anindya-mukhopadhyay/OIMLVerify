import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { collections } from '../lib/firestoreCollections'
import { firestoreDb } from '../lib/firebase'
import type { AuditLog } from '../types/domain'

export type AuditInput = Omit<AuditLog, 'id' | 'timestamp'>

export const recordAuditEvent = async (event: AuditInput) => {
  if (!firestoreDb) {
    return {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...event,
    }
  }

  await addDoc(collection(firestoreDb, collections.auditLogs), {
    ...event,
    timestamp: serverTimestamp(),
  })

  return null
}
