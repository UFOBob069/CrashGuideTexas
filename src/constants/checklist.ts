// ============================================================
// CrashGuide Texas - Accident Checklist Data
// ============================================================

import { ChecklistItem } from '../types';

export const ACCIDENT_CHECKLIST: ChecklistItem[] = [
  // Safety (Priority 1)
  {
    id: 'safety-1',
    title: 'Move to a safe location',
    description: 'If you can safely move, get off the road and away from traffic. Turn on your hazard lights.',
    category: 'safety',
    isCompleted: false,
    priority: 1,
  },
  {
    id: 'safety-2',
    title: 'Check for injuries',
    description: 'Check yourself and any passengers for injuries. Do not move anyone who may have a spinal injury.',
    category: 'safety',
    isCompleted: false,
    priority: 2,
  },
  {
    id: 'safety-3',
    title: 'Call 911 if needed',
    description: 'Call 911 if anyone is injured, if there is significant vehicle damage, or if the road is blocked.',
    category: 'safety',
    isCompleted: false,
    priority: 3,
  },

  // Medical (Priority 2)
  {
    id: 'medical-1',
    title: 'Seek medical attention',
    description: 'Even if you feel fine, some injuries take hours or days to appear. Visit an ER or urgent care within 72 hours.',
    category: 'medical',
    isCompleted: false,
    priority: 4,
  },
  {
    id: 'medical-2',
    title: 'Document any symptoms',
    description: 'Note any pain, dizziness, headaches, or other symptoms \u2014 even minor ones. Write down when they started.',
    category: 'medical',
    isCompleted: false,
    priority: 5,
  },

  // Documentation (Priority 3)
  {
    id: 'doc-1',
    title: 'Take photos of vehicle damage',
    description: 'Photograph all vehicles involved from multiple angles. Include close-ups of damage.',
    category: 'documentation',
    isCompleted: false,
    priority: 6,
  },
  {
    id: 'doc-2',
    title: 'Photograph the accident scene',
    description: 'Capture the overall scene, road conditions, traffic signs, skid marks, and debris.',
    category: 'documentation',
    isCompleted: false,
    priority: 7,
  },
  {
    id: 'doc-3',
    title: 'Get photos of license plates',
    description: 'Photograph the license plates of all vehicles involved in the accident.',
    category: 'documentation',
    isCompleted: false,
    priority: 8,
  },
  {
    id: 'doc-4',
    title: 'Exchange information',
    description: 'Get the other driver\'s name, phone, insurance company, policy number, and driver\'s license number.',
    category: 'documentation',
    isCompleted: false,
    priority: 9,
  },
  {
    id: 'doc-5',
    title: 'Get witness information',
    description: 'If there are witnesses, get their names and phone numbers. Their testimony can be valuable.',
    category: 'documentation',
    isCompleted: false,
    priority: 10,
  },
  {
    id: 'doc-6',
    title: 'File a police report',
    description: 'Texas law requires reporting accidents with injuries, death, or property damage over $1,000.',
    category: 'documentation',
    isCompleted: false,
    priority: 11,
  },

  // Legal (Priority 4)
  {
    id: 'legal-1',
    title: 'Do not admit fault',
    description: 'Be polite but do not apologize or admit fault. Fault determination is a legal and insurance matter.',
    category: 'legal',
    isCompleted: false,
    priority: 12,
  },
  {
    id: 'legal-2',
    title: 'Do not sign anything from the other party',
    description: 'Do not sign any documents from the other driver or their insurance company without consulting a lawyer.',
    category: 'legal',
    isCompleted: false,
    priority: 13,
  },
  {
    id: 'legal-3',
    title: 'Consider consulting a lawyer',
    description: 'If you were injured or the accident was complex, a personal injury lawyer can help protect your rights.',
    category: 'legal',
    isCompleted: false,
    priority: 14,
  },

  // Insurance (Priority 5)
  {
    id: 'insurance-1',
    title: 'Notify your insurance company',
    description: 'Report the accident to your insurance company promptly. Provide facts only \u2014 do not speculate.',
    category: 'insurance',
    isCompleted: false,
    priority: 15,
  },
  {
    id: 'insurance-2',
    title: 'Do not accept a quick settlement',
    description: 'Insurance companies may try to settle quickly for less than you deserve. Consult a lawyer first if you\'re injured.',
    category: 'insurance',
    isCompleted: false,
    priority: 16,
  },
];
