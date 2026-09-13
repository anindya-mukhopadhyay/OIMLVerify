import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { collections } from '../lib/firestoreCollections'
import { requireFirestore } from '../lib/firebase'
import type { Instrument, Report, TestObservation, TestRecord } from '../types/domain'

type CollectionName = keyof Pick<
  typeof collections,
  'instruments' | 'tests' | 'testObservations' | 'reports'
>

const readCollection = async <T extends { id: string }>(name: CollectionName, orderField = 'updatedAt') => {
  const db = requireFirestore()
  const snapshot = await getDocs(query(collection(db, collections[name]), orderBy(orderField, 'desc')))

  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as T)
}

const upsertDocument = async <T extends { id: string }>(name: CollectionName, value: T) => {
  const db = requireFirestore()
  await setDoc(doc(db, collections[name], value.id), value, { merge: true })
}

const addDocument = async <T extends { id: string }>(name: CollectionName, value: T) => {
  const db = requireFirestore()
  await addDoc(collection(db, collections[name]), value)
}

const removeDocument = async (name: CollectionName, id: string) => {
  const db = requireFirestore()
  await deleteDoc(doc(db, collections[name], id))
}

export const firestoreRepository = {
  listInstruments: () => readCollection<Instrument>('instruments'),
  saveInstrument: (instrument: Instrument) => upsertDocument('instruments', instrument),
  deleteInstrument: (id: string) => removeDocument('instruments', id),
  listTests: () => readCollection<TestRecord>('tests'),
  saveTest: (test: TestRecord) => upsertDocument('tests', test),
  updateTestStatus: async (id: string, status: TestRecord['status']) => {
    const db = requireFirestore()
    await updateDoc(doc(db, collections.tests, id), { status, updatedAt: new Date().toISOString() })
  },
  listObservations: () => readCollection<TestObservation>('testObservations', 'createdAt'),
  saveObservation: (observation: TestObservation) =>
    upsertDocument('testObservations', observation),
  listReports: () => readCollection<Report>('reports', 'generatedAt'),
  saveReport: (report: Report) => addDocument('reports', report),
}
