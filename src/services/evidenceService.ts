import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { requireStorage } from '../lib/firebase'
import type { AttachmentKind } from '../types/domain'

export interface EvidenceUploadInput {
  file: File
  testId: string
  observationId?: string
  kind: AttachmentKind
}

export const buildEvidenceStoragePath = ({
  file,
  testId,
  observationId,
  kind,
}: EvidenceUploadInput) => {
  const cleanName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')
  const scope = observationId ? `observations/${observationId}` : 'test'

  return `tests/${testId}/${scope}/${kind}/${Date.now()}-${cleanName}`
}

export const uploadEvidence = async (input: EvidenceUploadInput) => {
  const storage = requireStorage()
  const storagePath = buildEvidenceStoragePath(input)
  const storageRef = ref(storage, storagePath)

  await uploadBytes(storageRef, input.file, {
    contentType: input.file.type,
    customMetadata: {
      testId: input.testId,
      observationId: input.observationId ?? '',
      kind: input.kind,
    },
  })

  const downloadUrl = await getDownloadURL(storageRef)

  return { storagePath, downloadUrl }
}
