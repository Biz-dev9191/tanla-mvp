import { CustomerProfile, BusinessEvent, BusinessObjective, GuardrailEvaluation } from '../types';

export interface DeterministicCheckResult {
  passed: boolean;
  action: 'PROCEED' | 'BLOCK' | 'SUPPRESS' | 'REQUIRE_HUMAN_APPROVAL';
  reason?: string;
  ruleCode?: string;
}

export function runDeterministicPreChecks(
  customer: CustomerProfile,
  event: BusinessEvent,
  objective: BusinessObjective
): DeterministicCheckResult {
  // Check 1: Mandatory Consent Check
  const isPromotional = event.eventType === 'promotional_opportunity' || objective.primary === 'increase_conversion';
  if (isPromotional && !customer.consent.promotional) {
    return {
      passed: false,
      action: 'BLOCK',
      ruleCode: 'POL-CONS-001',
      reason: 'Blocked by Policy POL-CONS-001: Customer has not provided explicit promotional opt-in consent.',
    };
  }

  if (!isPromotional && !customer.consent.transactional) {
    return {
      passed: false,
      action: 'BLOCK',
      ruleCode: 'POL-CONS-001',
      reason: 'Blocked by Policy POL-CONS-001: Customer has opted out of transactional notifications.',
    };
  }

  // Check 2: Fatigue & Frequency Suppression
  const recent24hTx = customer.recentCommunicationCount24h.transactional || 0;
  const recent24hPromo = customer.recentCommunicationCount24h.promotional || 0;

  if (isPromotional && recent24hPromo >= 2) {
    return {
      passed: false,
      action: 'SUPPRESS',
      ruleCode: 'POL-FAT-001',
      reason: `Suppressed by Policy POL-FAT-001: Customer has received ${recent24hPromo} promotional messages in the last 24 hours (Limit: 2).`,
    };
  }

  // Routine non-critical transactional suppression if fatigue saturated
  if (
    !isPromotional &&
    recent24hTx >= 3 &&
    (event.eventType === 'service_disruption' && event.resolutionStatus === 'None Required')
  ) {
    return {
      passed: false,
      action: 'SUPPRESS',
      ruleCode: 'POL-FAT-001',
      reason: `Suppressed by Policy POL-FAT-001: Routine non-critical notice suppressed because customer has already received ${recent24hTx} transactional updates today.`,
    };
  }

  // Check 3: Human Approval Gate for Financial Commitments / Disputes
  if (
    event.eventType === 'customer_complaint' &&
    event.resolutionStatus === 'Pending Approval' &&
    event.amount &&
    event.amount.toLowerCase().includes('credit')
  ) {
    return {
      passed: true,
      action: 'REQUIRE_HUMAN_APPROVAL',
      ruleCode: 'POL-FIN-001',
      reason: 'Human supervisor approval required by Policy POL-FIN-001 for monetary compensation/credit vouchers above $0.00.',
    };
  }

  return {
    passed: true,
    action: 'PROCEED',
  };
}

export function redactSensitiveData(text: string): string {
  // Mask 16-digit credit cards
  let sanitized = text.replace(/\b(?:\d[ -]*?){13,16}\b/g, (match) => {
    const digits = match.replace(/\D/g, '');
    if (digits.length >= 12) {
      return `**** **** **** ${digits.slice(-4)}`;
    }
    return match;
  });

  // Mask plain passwords
  sanitized = sanitized.replace(/(password\s*[:=]\s*)(\S+)/gi, '$1[PROTECTED]');
  return sanitized;
}
