import { z } from 'zod'

export const roleSchema = z.enum(['Admin', 'Tester', 'Reviewer', 'Viewer'])
export const testStatusSchema = z.enum(['Draft', 'In Progress', 'Review', 'Approved', 'Failed'])
export const observationResultSchema = z.enum(['PASS', 'FAIL', 'REVIEW'])

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
})

export const instrumentSchema = z.object({
  manufacturer: z.string().min(2, 'Manufacturer is required.'),
  model: z.string().min(1, 'Model is required.'),
  serialNumber: z.string().min(1, 'Serial number is required.'),
  instrumentType: z.string().min(1, 'Instrument type is required.'),
  accuracyClass: z.string().min(1, 'Accuracy class is required.'),
  maxCapacity: z.coerce.number().positive('Maximum capacity must be positive.'),
  minCapacity: z.coerce.number().nonnegative('Minimum capacity cannot be negative.'),
  verificationScaleInterval: z.coerce
    .number()
    .positive('Verification scale interval must be positive.'),
  technicalSpecifications: z.string().min(1, 'Technical specifications are required.'),
  notes: z.string().optional().default(''),
})

export const testSchema = z.object({
  testId: z.string().min(3, 'Test ID is required.'),
  instrumentId: z.string().min(1, 'Select an instrument.'),
  testDate: z.string().min(1, 'Test date is required.'),
  tester: z.string().min(2, 'Tester is required.'),
  laboratory: z.string().min(2, 'Laboratory is required.'),
  environmentalConditions: z.string().min(2, 'Environmental conditions are required.'),
  temperature: z.coerce.number(),
  humidity: z.coerce.number().min(0).max(100),
  referenceEquipment: z.string().min(2, 'Reference equipment is required.'),
  notes: z.string().optional().default(''),
  status: testStatusSchema,
})

export const observationSchema = z.object({
  procedureName: z.string().min(2, 'Procedure name is required.'),
  testConditions: z.string().min(2, 'Test conditions are required.'),
  appliedLoad: z.coerce.number().nonnegative('Applied load cannot be negative.'),
  indication: z.coerce.number().nonnegative('Indication cannot be negative.'),
  permissibleError: z.coerce.number().nonnegative().optional().or(z.literal('')),
  notes: z.string().optional().default(''),
})

export type LoginForm = z.output<typeof loginSchema>
export type InstrumentInput = z.input<typeof instrumentSchema>
export type InstrumentForm = z.output<typeof instrumentSchema>
export type TestInput = z.input<typeof testSchema>
export type TestForm = z.output<typeof testSchema>
export type ObservationInput = z.input<typeof observationSchema>
export type ObservationForm = z.output<typeof observationSchema>
