import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { Jardin, Usuario, Nino, RegistroDiario, Mensaje, Video, Notificacion } from '../types';
import { supabase } from '../lib/supabase';
import { nid, horaActual } from '../lib/utils';
import { TODAY } from '../data/mock'; // We still use TODAY from mock for consistency in frontend matching

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
  notificaciones: Notificacion[];
  toast: { msg: string; type: 'ok' | 'err' } | null;
  loading: boolean;
}

const initialState: AppState = {
  jardin: { id: '', nombre: 'Jardín Maternal', logo_url: null },
  user: null,
  kids: [],
  records: [],
  messages: [],
  videos: [],
  notificaciones: [],
  toast: null,
  loading: true,
};

// ============================================================
// ACTIONS
// ============================================================
type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN'; payload: Usuario }
  | { type: 'LOGOUT' }
  | { type: 'SET_JARDIN'; payload: Partial<Jardin> }
  | { type: 'SET_KIDS'; payload: Nino[] }
  | { type: 'SET_RECORDS'; payload: RegistroDiario[] }
  | { type: 'SET_MESSAGES'; payload: Mensaje[] }
  | { type: 'SET_VIDEOS'; payload: Video[] }
  | { type: 'SET_NOTIFICACIONES'; payload: Notificacion[] }
  | { type: 'ADD_KID'; payload: Nino }
  | { type: 'REMOVE_KID'; payload: string }
  | { type: 'UPDATE_KID'; payload: Nino }
  | { type: 'SAVE_RECORD'; payload: RegistroDiario }
  | { type: 'ADD_MESSAGE'; payload: Mensaje }
  | { type: 'MARK_MESSAGES_READ'; payload: string[] }
  | { type: 'ADD_VIDEO'; payload: Video }
  | { type: 'DELETE_VIDEO'; payload: string }
  | { type: 'ADD_NOTIFICACION'; payload: Notificacion }
  | { type: 'MARK_NOTIFICACIONES_READ'; payload: string[] }
  | { type: 'SHOW_TOAST'; payload: { msg: string; type: 'ok' | 'err' } }
  | { type: 'HIDE_TOAST' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOGIN':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...state, user: null };
    case 'SET_JARDIN':
      return { ...state, jardin: { ...state.jardin, ...action.payload } };
    case 'SET_KIDS':
      return { ...state, kids: action.payload };
    case 'SET_RECORDS':
      return { ...state, records: action.payload };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
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
    case 'SET_VIDEOS':
      return { ...state, videos: action.payload };
    case 'ADD_VIDEO':
      return { ...state, videos: [action.payload, ...state.videos] };
    case 'DELETE_VIDEO':
      return { ...state, videos: state.videos.filter(v => v.id !== action.payload) };
    case 'SET_NOTIFICACIONES':
      return { ...state, notificaciones: action.payload };
    case 'ADD_NOTIFICACION':
      return { ...state, notificaciones: [action.payload, ...state.notificaciones] };
    case 'MARK_NOTIFICACIONES_READ':
      return {
        ...state,
        notificaciones: state.notificaciones.map(n => action.payload.includes(n.id) ? { ...n, leida: true } : n)
      };
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
  login: (email: string, password: string) => Promise<Usuario | null>;
  logout: () => void;
  updateJardin: (data: Partial<Jardin>) => void;
  addKid: (kid: Omit<Nino, 'id' | 'activo' | 'jardin_id'>) => Promise<void>;
  removeKid: (id: string) => Promise<void>;
  saveRecord: (record: Omit<RegistroDiario, 'id' | 'jardin_id'>) => Promise<void>;
  getRecordForKidToday: (kidId: string) => RegistroDiario | undefined;
  addMessage: (msg: Omit<Mensaje, 'id' | 'fecha' | 'hora' | 'jardin_id'>) => Promise<void>;
  markMessagesRead: (ids: string[]) => void;
  addVideo: (video: Omit<Video, 'id' | 'fecha' | 'created_at' | 'jardin_id' | 'docente_id'>) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
  markNotificacionesRead: (ids: string[]) => Promise<void>;
  showToast: (msg: string, type?: 'ok' | 'err') => void;
  fetchData: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    const [jardinRes, kidsRes, recordsRes, msgsRes, videosRes, notifRes] = await Promise.all([
      supabase.from('jardines').select('*').maybeSingle(),
      supabase.from('ninos').select('*').eq('activo', true),
      supabase.from('registros_diarios').select('*'),
      supabase.from('mensajes').select('*'),
      supabase.from('videos').select('*'),
      supabase.from('notificaciones').select('*')
    ]);

    if (jardinRes.data) dispatch({ type: 'SET_JARDIN', payload: jardinRes.data });
    if (kidsRes.data) dispatch({ type: 'SET_KIDS', payload: kidsRes.data });
    if (recordsRes.data) dispatch({ type: 'SET_RECORDS', payload: recordsRes.data });
    if (msgsRes.data) dispatch({ type: 'SET_MESSAGES', payload: msgsRes.data });
    if (videosRes.data) dispatch({ type: 'SET_VIDEOS', payload: videosRes.data });
    if (notifRes.data) dispatch({ type: 'SET_NOTIFICACIONES', payload: notifRes.data });
    
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

  useEffect(() => {
    // 1. Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id, session.user.email!);
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user.id, session.user.email!);
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string, email: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (data && !error) {
      const user: Usuario = {
        id: data.id,
        jardin_id: data.jardin_id,
        email: email,
        password: '', // we don't store password in state anymore
        rol: data.rol as any,
        nombre: data.nombre,
        childId: data.child_id
      };
      dispatch({ type: 'LOGIN', payload: user });
      fetchData(); // Load app data once logged in
    } else {
      // If profile is missing (e.g. database was reset but local session remained)
      await supabase.auth.signOut();
      dispatch({ type: 'LOGOUT' });
    }
  };

  const login = useCallback(async (email: string, password: string): Promise<Usuario | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error || !data.user) {
      console.error("Login error:", error?.message);
      return null;
    }

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
    if (!profile) {
      await supabase.auth.signOut();
      return null;
    }

    return {
      id: profile.id,
      jardin_id: profile.jardin_id,
      email,
      password: '',
      rol: profile.rol as any,
      nombre: profile.nombre,
      childId: profile.child_id
    };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const updateJardin = useCallback((data: Partial<Jardin>) =>
    dispatch({ type: 'SET_JARDIN', payload: data }), []);

  const addKid = useCallback(async (kid: Omit<Nino, 'id' | 'activo' | 'jardin_id'>) => {
    const { data, error } = await supabase.from('ninos').insert([{ ...kid, activo: true, jardin_id: state.user?.jardin_id }]).select().single();
    if (!error && data) {
      dispatch({ type: 'ADD_KID', payload: data });
    }
  }, []);

  const removeKid = useCallback(async (id: string) => {
    const { error } = await supabase.from('ninos').update({ activo: false }).eq('id', id);
    if (!error) {
      dispatch({ type: 'REMOVE_KID', payload: id });
    }
  }, []);

  const saveRecord = useCallback(async (record: Omit<RegistroDiario, 'id' | 'jardin_id'>) => {
    const existing = state.records.find(r => r.nino_id === record.nino_id && r.fecha === record.fecha);
    
    if (existing) {
      const { data, error } = await supabase.from('registros_diarios').update(record).eq('id', existing.id).select().single();
      if (!error && data) dispatch({ type: 'SAVE_RECORD', payload: data });
    } else {
      const payload = { ...record, jardin_id: state.user?.jardin_id };
      const { data, error } = await supabase.from('registros_diarios').insert([payload]).select().single();
      if (!error && data) {
        dispatch({ type: 'SAVE_RECORD', payload: data });
        // Create auto-notification for the parents
        const kid = state.kids.find(k => k.id === data.nino_id);
        if (kid && kid.familia_id) {
          const notif = {
            jardin_id: state.user?.jardin_id,
            usuario_id: kid.familia_id,
            titulo: 'Nuevo reporte diario',
            mensaje: `La maestra ha cargado el reporte de hoy para ${kid.nombre}.`,
            tipo: 'registro',
            referencia_id: data.id
          };
          const { data: notifData } = await supabase.from('notificaciones').insert([notif]).select().single();
          if (notifData) dispatch({ type: 'ADD_NOTIFICACION', payload: notifData });
        }
      }
    }
  }, [state.records, state.user]);

  const getRecordForKidToday = useCallback((kidId: string) =>
    state.records.find(r => r.nino_id === kidId && r.fecha === TODAY), [state.records]);

  const addMessage = useCallback(async (msg: Omit<Mensaje, 'id' | 'fecha' | 'hora' | 'jardin_id'>) => {
    const payload = { ...msg, fecha: TODAY, hora: horaActual(), leido: false, jardin_id: state.user?.jardin_id };
    const { data, error } = await supabase.from('mensajes').insert([payload]).select().single();
    if (!error && data) {
      dispatch({ type: 'ADD_MESSAGE', payload: data });
      // Notificacion
      if (data.destinatario_id) {
        const notif = {
          jardin_id: state.user?.jardin_id,
          usuario_id: data.destinatario_id,
          titulo: 'Nuevo mensaje',
          mensaje: `Tienes un nuevo mensaje de ${data.remitente_nombre}.`,
          tipo: 'mensaje',
          referencia_id: data.id
        };
        const { data: notifData } = await supabase.from('notificaciones').insert([notif]).select().single();
        if (notifData) dispatch({ type: 'ADD_NOTIFICACION', payload: notifData });
      }
    }
  }, []);

  const markMessagesRead = useCallback(async (ids: string[]) => {
    await supabase.from('mensajes').update({ leido: true }).in('id', ids);
    dispatch({ type: 'MARK_MESSAGES_READ', payload: ids });
  }, []);

  const addVideo = useCallback(async (video: Omit<Video, 'id' | 'fecha' | 'created_at' | 'jardin_id' | 'docente_id'>) => {
    const payload = {
      ...video,
      jardin_id: state.user?.jardin_id,
      docente_id: state.user?.id,
    };
    const { data, error } = await supabase.from('videos').insert([payload]).select().single();
    if (!error && data) dispatch({ type: 'ADD_VIDEO', payload: data });
  }, [state.user]);

  const deleteVideo = useCallback(async (id: string) => {
    const { error } = await supabase.from('videos').delete().eq('id', id);
    if (!error) dispatch({ type: 'DELETE_VIDEO', payload: id });
  }, []);

  const markNotificacionesRead = useCallback(async (ids: string[]) => {
    await supabase.from('notificaciones').update({ leida: true }).in('id', ids);
    dispatch({ type: 'MARK_NOTIFICACIONES_READ', payload: ids });
  }, []);

  const showToast = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    dispatch({ type: 'SHOW_TOAST', payload: { msg, type } });
    setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3200);
  }, []);

  return (
    <AppContext.Provider value={{
      state, login, logout, updateJardin,
      addKid, removeKid, saveRecord, getRecordForKidToday,
      addMessage, markMessagesRead, addVideo, deleteVideo, markNotificacionesRead, showToast, fetchData
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
