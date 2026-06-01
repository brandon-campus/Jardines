import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { Jardin, Usuario, Nino, RegistroDiario, Mensaje, Video } from '../types';
import {
  mockJardin, mockUsers, mockNinos, mockRegistros, mockMensajes, TODAY
} from '../data/mock';
import { nid, horaActual } from '../lib/utils';

// ============================================================
// STATE
// ============================================================
interface AppState {
  jardin: Jardin;
  user: Usuario | null;
  kids: Nino[];
  records: RegistroDiario[];
  messages: Mensaje[];
  videos: Video[];
  toast: { msg: string; type: 'ok' | 'err' } | null;
}

const initialState: AppState = {
  jardin: mockJardin,
  user: null,
  kids: mockNinos,
  records: mockRegistros,
  messages: mockMensajes,
  videos: [],
  toast: null,
};

// ============================================================
// ACTIONS
// ============================================================
type Action =
  | { type: 'LOGIN'; payload: Usuario }
  | { type: 'LOGOUT' }
  | { type: 'SET_JARDIN'; payload: Partial<Jardin> }
  | { type: 'ADD_KID'; payload: Nino }
  | { type: 'REMOVE_KID'; payload: string }
  | { type: 'UPDATE_KID'; payload: Nino }
  | { type: 'SAVE_RECORD'; payload: RegistroDiario }
  | { type: 'ADD_MESSAGE'; payload: Mensaje }
  | { type: 'MARK_MESSAGES_READ'; payload: string[] } // array of message ids
  | { type: 'ADD_VIDEO'; payload: Video }
  | { type: 'DELETE_VIDEO'; payload: string }
  | { type: 'SHOW_TOAST'; payload: { msg: string; type: 'ok' | 'err' } }
  | { type: 'HIDE_TOAST' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...state, user: null };
    case 'SET_JARDIN':
      return { ...state, jardin: { ...state.jardin, ...action.payload } };
    case 'ADD_KID':
      return { ...state, kids: [...state.kids, action.payload] };
    case 'REMOVE_KID':
      return { ...state, kids: state.kids.filter(k => k.id !== action.payload) };
    case 'UPDATE_KID':
      return { ...state, kids: state.kids.map(k => k.id === action.payload.id ? action.payload : k) };
    case 'SAVE_RECORD': {
      const existing = state.records.findIndex(
        r => r.nino_id === action.payload.nino_id && r.fecha === action.payload.fecha
      );
      if (existing >= 0) {
        const updated = [...state.records];
        updated[existing] = action.payload;
        return { ...state, records: updated };
      }
      return { ...state, records: [...state.records, action.payload] };
    }
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'MARK_MESSAGES_READ':
      return {
        ...state,
        messages: state.messages.map(m =>
          action.payload.includes(m.id) ? { ...m, leido: true } : m
        ),
      };
    case 'ADD_VIDEO':
      return { ...state, videos: [...state.videos, action.payload] };
    case 'DELETE_VIDEO':
      return { ...state, videos: state.videos.filter(v => v.id !== action.payload) };
    case 'SHOW_TOAST':
      return { ...state, toast: action.payload };
    case 'HIDE_TOAST':
      return { ...state, toast: null };
    default:
      return state;
  }
}

// ============================================================
// CONTEXT
// ============================================================
interface AppContextValue {
  state: AppState;
  // Auth
  login: (email: string, password: string, rol: 'docente' | 'familia') => boolean;
  logout: () => void;
  // Jardín
  updateJardin: (data: Partial<Jardin>) => void;
  // Kids
  addKid: (kid: Omit<Nino, 'id' | 'activo'>) => void;
  removeKid: (id: string) => void;
  // Records
  saveRecord: (record: Omit<RegistroDiario, 'id'>) => void;
  getRecordForKidToday: (kidId: string) => RegistroDiario | undefined;
  // Messages
  addMessage: (msg: Omit<Mensaje, 'id' | 'fecha' | 'hora'>) => void;
  markMessagesRead: (ids: string[]) => void;
  // Videos
  addVideo: (video: Omit<Video, 'id' | 'fecha' | 'hora'>) => void;
  deleteVideo: (id: string) => void;
  // Toast
  showToast: (msg: string, type?: 'ok' | 'err') => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const login = useCallback((email: string, password: string, rol: 'docente' | 'familia'): boolean => {
    const found = mockUsers.find(u => u.email === email && u.password === password && u.rol === rol);
    if (!found) return false;
    dispatch({ type: 'LOGIN', payload: found });
    return true;
  }, []);

  const logout = useCallback(() => dispatch({ type: 'LOGOUT' }), []);

  const updateJardin = useCallback((data: Partial<Jardin>) =>
    dispatch({ type: 'SET_JARDIN', payload: data }), []);

  const addKid = useCallback((kid: Omit<Nino, 'id' | 'activo'>) =>
    dispatch({ type: 'ADD_KID', payload: { ...kid, id: nid(), activo: true } }), []);

  const removeKid = useCallback((id: string) =>
    dispatch({ type: 'REMOVE_KID', payload: id }), []);

  const saveRecord = useCallback((record: Omit<RegistroDiario, 'id'>) =>
    dispatch({ type: 'SAVE_RECORD', payload: { ...record, id: nid() } }), []);

  const getRecordForKidToday = useCallback((kidId: string) =>
    state.records.find(r => r.nino_id === kidId && r.fecha === TODAY), [state.records]);

  const addMessage = useCallback((msg: Omit<Mensaje, 'id' | 'fecha' | 'hora'>) =>
    dispatch({
      type: 'ADD_MESSAGE',
      payload: { ...msg, id: nid(), fecha: TODAY, hora: horaActual() },
    }), []);

  const markMessagesRead = useCallback((ids: string[]) =>
    dispatch({ type: 'MARK_MESSAGES_READ', payload: ids }), []);

  const addVideo = useCallback((video: Omit<Video, 'id' | 'fecha' | 'hora'>) =>
    dispatch({
      type: 'ADD_VIDEO',
      payload: { ...video, id: nid(), fecha: TODAY, hora: horaActual() },
    }), []);

  const deleteVideo = useCallback((id: string) =>
    dispatch({ type: 'DELETE_VIDEO', payload: id }), []);

  const showToast = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    dispatch({ type: 'SHOW_TOAST', payload: { msg, type } });
    setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3200);
  }, []);

  return (
    <AppContext.Provider value={{
      state, login, logout, updateJardin,
      addKid, removeKid, saveRecord, getRecordForKidToday,
      addMessage, markMessagesRead, addVideo, deleteVideo, showToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
