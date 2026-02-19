// ============================================================
// CrashGuide Texas - Lead Qualification & Routing Engine
// ============================================================

import {
  AccidentReport,
  LeadQualification,
  LeadTier,
  RoutingDecision,
  PartnerFirm,
} from '../types';

// ----- Default partner firms configuration -----

const RAMOS_JAMES: PartnerFirm = {
  id: 'ramos-james',
  name: 'Ramos James Law, PLLC',
  phone: '(512) 537-3369',
  email: 'intake@ramosjames.com',
  priority: 1, // Highest priority - primary routing target
  isActive: true,
  capacityCap: null, // No cap for primary firm
  currentLeadCount: 0,
  acceptedCaseTypes: [
    'car_accident',
    'truck_accident',
    'motorcycle_accident',
    'pedestrian_accident',
    'bicycle_accident',
    'scooter_accident',
    'rideshare_accident',
  ],
  acceptedTiers: ['high', 'medium'],
};

// Partner firms pool (expandable)
const partnerFirms: PartnerFirm[] = [RAMOS_JAMES];

// ----- Lead Qualification Logic -----

export function qualifyLead(report: AccidentReport): LeadQualification {
  const reasons: string[] = [];
  const disqualifyingReasons: string[] = [];
  let score = 0;

  // 1. Texas jurisdiction check (required)
  if (report.incidentState === 'TX') {
    reasons.push('Texas jurisdiction confirmed');
    score += 10;
  } else {
    disqualifyingReasons.push('Outside Texas jurisdiction');
  }

  // 2. Injury present or medical care intent
  if (report.injurySeverity === 'severe') {
    reasons.push('Severe injuries reported');
    score += 30;
  } else if (report.injurySeverity === 'moderate') {
    reasons.push('Moderate injuries reported');
    score += 25;
  } else if (report.injurySeverity === 'minor') {
    reasons.push('Minor injuries reported');
    score += 15;
  } else if (report.injurySeverity === 'none') {
    disqualifyingReasons.push('No injuries reported');
  }

  if (report.medicalCareReceived) {
    reasons.push('Medical care received');
    score += 10;
  } else if (report.medicalCareIntent) {
    reasons.push('Intent to seek medical care');
    score += 5;
  }

  // 3. Third-party fault likely
  if (report.liabilityClarity === 'clear_other_fault') {
    reasons.push('Clear third-party fault');
    score += 20;
  } else if (report.liabilityClarity === 'shared_fault') {
    reasons.push('Shared fault - Texas comparative negligence may apply');
    score += 10;
  } else if (report.liabilityClarity === 'own_fault') {
    disqualifyingReasons.push('Self-reported own fault');
    score -= 10;
  }

  // 4. Case type bonuses
  if (report.commercialVehicleInvolved) {
    reasons.push('Commercial vehicle involved - higher value potential');
    score += 15;
  }
  if (report.rideshareInvolved) {
    reasons.push('Rideshare vehicle involved');
    score += 10;
  }
  if (report.incidentType === 'truck_accident') {
    reasons.push('Truck accident - specialized case type');
    score += 15;
  }

  // 5. Documentation quality
  if (report.policeReportFiled) {
    reasons.push('Police report filed');
    score += 5;
  }
  if (report.evidence.length > 0) {
    reasons.push(`${report.evidence.length} evidence items captured`);
    score += Math.min(report.evidence.length * 2, 10);
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // Determine tier
  const tier = determineTier(score);

  // Determine qualification
  const isQualified =
    report.incidentState === 'TX' &&
    report.injurySeverity !== 'none' &&
    report.liabilityClarity !== 'own_fault' &&
    score >= 25;

  return {
    isQualified,
    score,
    reasons,
    disqualifyingReasons,
    tier,
  };
}

function determineTier(score: number): LeadTier {
  if (score >= 65) return 'high';
  if (score >= 40) return 'medium';
  if (score >= 25) return 'low';
  return 'unqualified';
}

// ----- Routing Logic -----

export function routeLead(
  report: AccidentReport,
  qualification: LeadQualification,
): RoutingDecision | null {
  if (!qualification.isQualified) {
    return null;
  }

  // Sort firms by priority
  const eligibleFirms = partnerFirms
    .filter((firm) => {
      // Must be active
      if (!firm.isActive) return false;

      // Must accept this case type
      if (!firm.acceptedCaseTypes.includes(report.incidentType)) return false;

      // Must accept this tier
      if (!firm.acceptedTiers.includes(qualification.tier)) return false;

      // Must be under capacity cap (if set)
      if (
        firm.capacityCap !== null &&
        firm.currentLeadCount >= firm.capacityCap
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => a.priority - b.priority);

  if (eligibleFirms.length === 0) {
    return null;
  }

  const targetFirm = eligibleFirms[0];

  return {
    targetFirm: targetFirm.name,
    firmId: targetFirm.id,
    reason:
      targetFirm.id === 'ramos-james'
        ? 'Primary qualified lead routed to Ramos James'
        : `Routed to partner firm: ${targetFirm.name}`,
    leadTier: qualification.tier,
    timestamp: new Date(),
  };
}

export function getFirmContactInfo(firmId: string): PartnerFirm | undefined {
  return partnerFirms.find((f) => f.id === firmId);
}

export function getRamosJamesContact(): PartnerFirm {
  return RAMOS_JAMES;
}
