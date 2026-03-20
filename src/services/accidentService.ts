// ============================================================
// CrashGuide Texas - Firestore Accident Service
// ============================================================

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import {
  AccidentReport,
  AccidentSummary,
  ChecklistItem,
  ChatMessage,
  ChatMode,
} from '../types';
import { ACCIDENT_CHECKLIST } from '../constants/checklist';

// ── Serialization helpers ──────────────────────────────────

function reportToDoc(report: AccidentReport, checklist: ChecklistItem[]) {
  return {
    ...report,
    createdAt: Timestamp.fromDate(new Date(report.createdAt)),
    updatedAt: Timestamp.fromDate(new Date()),
    incidentDate: report.incidentDate
      ? Timestamp.fromDate(new Date(report.incidentDate))
      : null,
    // Store evidence timestamps as Timestamps
    evidence: report.evidence.map((e) => ({
      ...e,
      timestamp: Timestamp.fromDate(new Date(e.timestamp)),
    })),
    checklistCompleted: checklist.filter((i) => i.isCompleted).map((i) => i.id),
  };
}

function docToReport(data: any, id: string): AccidentReport {
  return {
    ...data,
    id,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
    incidentDate: data.incidentDate?.toDate?.() ?? null,
    evidence: (data.evidence ?? []).map((e: any) => ({
      ...e,
      timestamp: e.timestamp?.toDate?.() ?? new Date(),
    })),
    otherDriverInfo: data.otherDriverInfo ?? null,
    contactInfo: data.contactInfo ?? null,
    qualification: data.qualification ?? null,
  };
}

function docToChecklist(completedIds: string[]): ChecklistItem[] {
  const set = new Set(completedIds ?? []);
  return ACCIDENT_CHECKLIST.map((item) => ({
    ...item,
    isCompleted: set.has(item.id),
  }));
}

function makeTitle(report: AccidentReport): string {
  const type = report.incidentType.replace(/_/g, ' ');
  const city = report.incidentCity;
  return city ? `${type} — ${city}, TX` : `${type} — Texas`;
}

// ── CRUD ──────────────────────────────────────────────────

export async function createAccident(
  userId: string,
  report: AccidentReport,
  checklist: ChecklistItem[],
): Promise<string> {
  const accRef = doc(collection(db, 'users', userId, 'accidents'));
  const id = accRef.id;
  await setDoc(accRef, { ...reportToDoc({ ...report, id }, checklist), id });
  return id;
}

export async function updateAccident(
  userId: string,
  accidentId: string,
  report: AccidentReport,
  checklist: ChecklistItem[],
): Promise<void> {
  const accRef = doc(db, 'users', userId, 'accidents', accidentId);
  await setDoc(accRef, reportToDoc(report, checklist), { merge: true });
}

export async function getAccident(
  userId: string,
  accidentId: string,
): Promise<{ report: AccidentReport; checklist: ChecklistItem[] } | null> {
  const snap = await getDoc(doc(db, 'users', userId, 'accidents', accidentId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    report: docToReport(data, snap.id),
    checklist: docToChecklist(data.checklistCompleted ?? []),
  };
}

export async function getAccidentList(userId: string): Promise<AccidentSummary[]> {
  const q = query(
    collection(db, 'users', userId, 'accidents'),
    orderBy('updatedAt', 'desc'),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    const report = docToReport(data, d.id);
    return {
      id: d.id,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      title: makeTitle(report),
      incidentType: report.incidentType,
      incidentCity: report.incidentCity,
      incidentDate: report.incidentDate,
      injurySeverity: report.injurySeverity,
      evidenceCount: report.evidence.length,
    };
  });
}

// ── Chat messages ─────────────────────────────────────────

export async function saveMessage(
  userId: string,
  accidentId: string,
  message: ChatMessage,
): Promise<void> {
  const msgRef = doc(
    db,
    'users', userId,
    'accidents', accidentId,
    'messages', message.id,
  );
  await setDoc(msgRef, {
    ...message,
    timestamp: Timestamp.fromDate(new Date(message.timestamp)),
  });
}

export async function getMessages(
  userId: string,
  accidentId: string,
): Promise<Record<ChatMode, ChatMessage[]>> {
  const q = query(
    collection(db, 'users', userId, 'accidents', accidentId, 'messages'),
    orderBy('timestamp', 'asc'),
  );
  const snapshot = await getDocs(q);
  const messages: Record<ChatMode, ChatMessage[]> = {
    urgent: [], document: [], intake: [], connect: [],
  };
  snapshot.docs.forEach((d) => {
    const data = d.data();
    const msg: ChatMessage = {
      ...data,
      timestamp: data.timestamp?.toDate?.() ?? new Date(),
    } as ChatMessage;
    if (messages[msg.mode]) messages[msg.mode].push(msg);
  });
  return messages;
}

// ── Delete accident ───────────────────────────────────────

export async function deleteAccident(userId: string, accidentId: string): Promise<void> {
  const accidentRef = doc(db, 'users', userId, 'accidents', accidentId);
  await deleteDoc(accidentRef);
}

// ── Photo upload ──────────────────────────────────────────

export async function uploadEvidencePhoto(
  userId: string,
  accidentId: string,
  evidenceId: string,
  localUri: string,
): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();
  const storageRef = ref(
    storage,
    `users/${userId}/accidents/${accidentId}/evidence/${evidenceId}`,
  );
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}
