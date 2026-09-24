import { useCallback, useReducer, useRef } from 'react';

/**
 * Performs a shallow equality comparison between two values.
 */
export function shallowEqual(a: any, b: any): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false;
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key) || !Object.is(a[key], b[key])) {
      return false;
    }
  }
  return true;
}

const EMPTY_FUTURE: never[] = [];

interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
  lastCommitted: T;
  isDirty: boolean;
}

type UndoRedoAction<T> =
  | { type: 'UPDATE'; payload: T }
  | { type: 'COMMIT'; payload: T }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET'; payload: T };

function undoRedoReducer<T>(
  state: UndoRedoState<T>,
  action: UndoRedoAction<T>
): UndoRedoState<T> {
  switch (action.type) {
    case 'UPDATE': {
      if (shallowEqual(state.present, action.payload)) {
        return state;
      }
      const isDirty = !shallowEqual(action.payload, state.lastCommitted);
      return { ...state, present: action.payload, future: EMPTY_FUTURE, isDirty };
    }
    case 'COMMIT': {
      if (shallowEqual(state.lastCommitted, action.payload)) {
        return { ...state, present: action.payload, future: EMPTY_FUTURE, isDirty: false };
      }
      return {
        past: [...state.past, state.lastCommitted],
        present: action.payload,
        lastCommitted: action.payload,
        future: EMPTY_FUTURE,
        isDirty: false,
      };
    }
    case 'UNDO': {
      if (state.isDirty) {
        return {
          ...state,
          present: state.lastCommitted,
          future: [state.present, ...state.future],
          isDirty: false,
        };
      }
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, -1),
        present: previous,
        lastCommitted: previous,
        future: [state.present, ...state.future],
        isDirty: false,
      };
    }
    case 'REDO': {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        past: [...state.past, state.present],
        present: next,
        lastCommitted: next,
        future: state.future.slice(1),
        isDirty: false,
      };
    }
    case 'RESET': {
      return {
        past: [],
        present: action.payload,
        lastCommitted: action.payload,
        future: EMPTY_FUTURE,
        isDirty: false,
      };
    }
    default:
      return state;
  }
}

/**
 * useUndoRedo<T>
 *
 * Drop-in replacement for useState with full undo/redo history.
 * Debounces rapid keystrokes so each word/section is a history entry.
 */
export function useUndoRedo<T>(initialValue: T, debounceMs = 600) {
  const [state, dispatch] = useReducer(
    (s: UndoRedoState<T>, a: UndoRedoAction<T>) => undoRedoReducer(s, a),
    { past: [], present: initialValue, future: EMPTY_FUTURE, lastCommitted: initialValue, isDirty: false }
  );

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingValue = useRef<T>(initialValue);
  const presentRef = useRef<T>(initialValue);
  presentRef.current = state.present;

  const flush = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    dispatch({ type: 'COMMIT', payload: pendingValue.current });
  }, []);

  const set = useCallback(
    (value: T | ((prev: T) => T), immediate = false) => {
      const nextValue = typeof value === 'function'
        ? (value as (prev: T) => T)(presentRef.current)
        : value;

      // Synchronize presentRef immediately so consecutive functional updates in the same cycle read the latest value
      presentRef.current = nextValue;
      pendingValue.current = nextValue;

      if (immediate) {
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
          debounceTimer.current = null;
        }
        dispatch({ type: 'COMMIT', payload: nextValue });
      } else {
        dispatch({ type: 'UPDATE', payload: nextValue });
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(flush, debounceMs);
      }
    },
    [debounceMs, flush]
  );

  const undo = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    dispatch({ type: 'REDO' });
  }, []);

  const reset = useCallback((value: T) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    dispatch({ type: 'RESET', payload: value });
    presentRef.current = value;
    pendingValue.current = value;
  }, []);

  return {
    value: state.present,
    set,
    undo,
    redo,
    reset,
    canUndo: state.past.length > 0 || state.isDirty,
    canRedo: state.future.length > 0,
    historyLength: state.past.length,
  };
}
