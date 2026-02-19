// ============================================================
// CrashGuide Texas - Type Definitions
// ============================================================

// --- Chat & Assistant Types ---

export type ChatMode = 'urgent' | 'document' | 'intake' | 'connect';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  mode: ChatMode;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  suggestedActions?: SuggestedAction[];
  extractedData?: Partial<AccidentReport>;
  modeTransition?: ChatMode;
}

export interface SuggestedAction {
  label: string;
  action: 'call_911' | 'take_photo' | 'switch_mode' | 'call_lawyer' | 'open_checklist';
  data?: string;
}

// --- Accident Report / Lead Packet ---

export interface AccidentReport {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  // Incident details
  incidentType: IncidentType;
  incidentDate: Date | null;
  incidentCity: string;
  incidentState: string; // always 'TX' for MVP
  incidentDescription: string;
  incidentLocation: GeoLocation | null;

  // Injury & medical
  injurySeverity: InjurySeverity;
  injuryDescription: string;
  medicalCareReceived: boolean | null;
  medicalCareIntent: boolean | null;

  // Liability
  liabilityClarity: LiabilityClarity;
  faultDescription: string;

  // Flags
  policeReportFiled: boolean | null;
  commercialVehicleInvolved: boolean;
  rideshareInvolved: boolean;

  // Evidence
  evidence: EvidenceItem[];

  // Contact
  contactInfo: ContactInfo | null;

  // Consent
  consentToShareWithLawyer: boolean;

  // Qualification
  qualification: LeadQualification | null;
}

export type IncidentType =
  | 'car_accident'
  | 'pedestrian_accident'
  | 'bicycle_accident'
  | 'scooter_accident'
  | 'rideshare_accident'
  | 'truck_accident'
  | 'motorcycle_accident'
  | 'other';

export type InjurySeverity =
  | 'none'
  | 'minor'
  | 'moderate'
  | 'severe'
  | 'unknown';

export type LiabilityClarity =
  | 'clear_other_fault'
  | 'shared_fault'
  | 'own_fault'
  | 'unclear'
  | 'unknown';

// --- Evidence ---

export interface EvidenceItem {
  id: string;
  type: EvidenceType;
  uri: string;
  timestamp: Date;
  location: GeoLocation | null;
  description: string;
}

export type EvidenceType =
  | 'vehicle_damage'
  | 'license_plate'
  | 'scene'
  | 'injury'
  | 'document'
  | 'other';

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

// --- Contact Info ---

export interface ContactInfo {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  preferredContact: 'phone' | 'email' | 'text';
}

// --- Lead Qualification & Routing ---

export interface LeadQualification {
  isQualified: boolean;
  score: number; // 0-100
  reasons: string[];
  disqualifyingReasons: string[];
  tier: LeadTier;
}

export type LeadTier = 'high' | 'medium' | 'low' | 'unqualified';

export interface RoutingDecision {
  targetFirm: string;
  firmId: string;
  reason: string;
  leadTier: LeadTier;
  timestamp: Date;
}

export interface PartnerFirm {
  id: string;
  name: string;
  phone: string;
  email: string;
  priority: number;
  isActive: boolean;
  capacityCap: number | null;
  currentLeadCount: number;
  acceptedCaseTypes: IncidentType[];
  acceptedTiers: LeadTier[];
}

// --- Checklist ---

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: ChecklistCategory;
  isCompleted: boolean;
  priority: number;
}

export type ChecklistCategory = 'safety' | 'medical' | 'documentation' | 'legal' | 'insurance';

// --- Navigation ---

export type RootStackParamList = {
  Home: undefined;
  Chat: { mode: ChatMode };
  Document: undefined;
  Checklist: undefined;
  ConnectLawyer: { report?: AccidentReport };
  ContactForm: undefined;
  Privacy: undefined;
};
