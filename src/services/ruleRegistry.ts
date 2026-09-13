import type { ObservationResult } from '../types/domain'

export interface RuleContext {
  instrumentAccuracyClass: string
  appliedLoad: number
  calculatedError: number
  providedPermissibleError?: number | null
}

export interface ComplianceRule {
  id: string
  version: string
  label: string
  regulatoryBasis: string
  isOfficial: boolean
  evaluate: (context: RuleContext) => {
    permissibleError: number | null
    result: ObservationResult
    explanation: string
  }
}

const demoRule: ComplianceRule = {
  id: 'demo-manual-permissible-error',
  version: '0.1.0-demo',
  label: 'Demo manual permissible error comparison',
  regulatoryBasis:
    'Demo only. This is not an official OIML R-76 tolerance, limit, formula, or compliance decision.',
  isOfficial: false,
  evaluate: ({ calculatedError, providedPermissibleError }) => {
    if (providedPermissibleError === null || providedPermissibleError === undefined) {
      return {
        permissibleError: null,
        result: 'REVIEW',
        explanation:
          'No verified permissible error was supplied. A reviewer must apply the official rule set.',
      }
    }

    return {
      permissibleError: providedPermissibleError,
      result: Math.abs(calculatedError) <= providedPermissibleError ? 'PASS' : 'FAIL',
      explanation:
        'Demo comparison against a manually supplied permissible error. Replace with verified OIML R-76 rules before production decisions.',
    }
  },
}

const rules = [demoRule]

export const getActiveRule = () => demoRule

export const listRules = () => rules
