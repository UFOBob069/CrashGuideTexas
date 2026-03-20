// ============================================================
// CrashGuide Texas - Auto-save to Firestore
// ============================================================

import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { createAccident, updateAccident } from '../services/accidentService';

export function useAutoSave() {
  const { state, dispatch } = useApp();
  const { user } = useAuth();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        dispatch({ type: 'SET_SAVING', payload: true });

        if (state.currentAccidentId) {
          await updateAccident(
            user.uid,
            state.currentAccidentId,
            state.report,
            state.checklist,
          );
        } else {
          const id = await createAccident(user.uid, state.report, state.checklist);
          dispatch({ type: 'SET_CURRENT_ACCIDENT_ID', payload: id });
        }
      } catch (e) {
        console.warn('Auto-save failed:', e);
      } finally {
        dispatch({ type: 'SET_SAVING', payload: false });
      }
    }, 2000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state.report, state.checklist, user]);
}
