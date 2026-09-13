import { getActiveRule, type RuleContext } from './ruleRegistry'
import type { ObservationForm } from '../validation/schemas'

export interface CalculationOutput {
  calculatedError: number
  permissibleError: number | null
  result: 'PASS' | 'FAIL' | 'REVIEW'
  ruleId: string
  ruleVersion: string
  explanation: string
}

export const calculateIndicationError = (appliedLoad: number, indication: number) => {
  return Number((indication - appliedLoad).toFixed(6))
}

export const evaluateObservation = (
  observation: ObservationForm,
  instrumentAccuracyClass: string,
): CalculationOutput => {
  const rule = getActiveRule()
  const calculatedError = calculateIndicationError(observation.appliedLoad, observation.indication)
  const context: RuleContext = {
    instrumentAccuracyClass,
    appliedLoad: observation.appliedLoad,
    calculatedError,
    providedPermissibleError:
      observation.permissibleError === '' ? null : observation.permissibleError ?? null,
  }
  const evaluation = rule.evaluate(context)

  return {
    calculatedError,
    permissibleError: evaluation.permissibleError,
    result: evaluation.result,
    ruleId: rule.id,
    ruleVersion: rule.version,
    explanation: evaluation.explanation,
  }
}
