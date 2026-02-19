// ============================================================
// CrashGuide Texas - Global App Context
// ============================================================

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { randomUUID } from 'expo-crypto';
import {
  AccidentReport,
  ChatMessage,
  ChatMode,
  ChecklistItem,
  EvidenceItem,
  ContactInfo,
  LeadQualification,
  RoutingDecision,
} from '../types';
import { ACCIDENT_CHECKLIST } from '../constants/checklist';

// --- State ---

interface AppState {
  report: AccidentReport;
  chatMessages: Record<ChatMode, ChatMessage[]>;
  checklist: ChecklistItem[];
  currentMode: ChatMode;
  isLoading: boolean;
  routingDecision: RoutingDecision | null;
}

const createInitialReport = (): AccidentReport => ({
  id: randomUUID(),
  createdAt: new Date(),
  updatedAt: new Date(),
  incidentType: 'car_accident',
  incidentDate: null,
  incidentCity: '',
  incidentState: 'TX',
  incidentDescription: '',
  incidentLocation: null,
  injurySeverity: 'unknown',
  injuryDescription: '',
  medicalCareReceived: null,
  medicalCareIntent: null,
  liabilityClarity: 'unknown',
  faultDescription: '',
  policeReportFiled: null,
  commercialVehicleInvolved: false,
  rideshareInvolved: false,
  evidence: [],
  contactInfo: null,
  consentToShareWithLawyer: false,
  qualification: null,
});

const initialState: AppState = {
  report: createInitialReport(),
  chatMessages: {
    urgent: [],
    document: [],
    intake: [],
    connect: [],
  },
  checklist: ACCIDENT_CHECKLIST.map((item) => ({ ...item })),
  currentMode: 'urgent',
  isLoading: false,
  routingDecision: null,
};

// --- Actions ---

type AppAction =
  | { type: 'ADD_CHAT_MESSAGE'; payload: { mode: ChatMode; message: ChatMessage } }
  | { type: 'SET_MODE'; payload: ChatMode }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_REPORT'; payload: Partial<AccidentReport> }
  | { type: 'ADD_EVIDENCE'; payload: EvidenceItem }
  | { type: 'REMOVE_EVIDENCE'; payload: string }
  | { type: 'SET_CONTACT_INFO'; payload: ContactInfo }
  | { type: 'SET_CONSENT'; payload: boolean }
  | { type: 'SET_QUALIFICATION'; payload: LeadQualification }
  | { type: 'SET_ROUTING_DECISION'; payload: RoutingDecision }
  | { type: 'TOGGLE_CHECKLIST_ITEM'; payload: string }
  | { type: 'RESET'; payload?: undefined };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_CHAT_MESSAGE':
      return {
        ...state,
        chatMessages: {
          ...state.chatMessages,
          [action.payload.mode]: [
            ...state.chatMessages[action.payload.mode],
            action.payload.message,
          ],
        },
      };

    case 'SET_MODE':
      return { ...state, currentMode: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'UPDATE_REPORT':
      return {
        ...state,
        report: {
          ...state.report,
          ...action.payload,
          updatedAt: new Date(),
        },
      };

    case 'ADD_EVIDENCE':
      return {
        ...state,
        report: {
          ...state.report,
          evidence: [...state.report.evidence, action.payload],
          updatedAt: new Date(),
        },
      };

    case 'REMOVE_EVIDENCE':
      return {
        ...state,
        report: {
          ...state.report,
          evidence: state.report.evidence.filter((e) => e.id !== action.payload),
          updatedAt: new Date(),
        },
      };

    case 'SET_CONTACT_INFO':
      return {
        ...state,
        report: {
          ...state.report,
          contactInfo: action.payload,
          updatedAt: new Date(),
        },
      };

    case 'SET_CONSENT':
      return {
        ...state,
        report: {
          ...state.report,
          consentToShareWithLawyer: action.payload,
          updatedAt: new Date(),
        },
      };

    case 'SET_QUALIFICATION':
      return {
        ...state,
        report: {
          ...state.report,
          qualification: action.payload,
          updatedAt: new Date(),
        },
      };

    case 'SET_ROUTING_DECISION':
      return { ...state, routingDecision: action.payload };

    case 'TOGGLE_CHECKLIST_ITEM':
      return {
        ...state,
        checklist: state.checklist.map((item) =>
          item.id === action.payload
            ? { ...item, isCompleted: !item.isCompleted }
            : item,
        ),
      };

    case 'RESET':
      return {
        ...initialState,
        report: createInitialReport(),
        checklist: ACCIDENT_CHECKLIST.map((item) => ({ ...item })),
      };

    default:
      return state;
  }
}

// --- Context ---

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
