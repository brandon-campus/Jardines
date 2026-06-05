import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../ui/Card';
import { SalaBadge, AlergiaBadge, StatusBadge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { SALAS } from '../../types';
import type { Sala } from '../../types';
import { TODAY } from '../../data/mock';

export function TodayTab() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [filtroSala, setFiltroSala] = useState<Sala | 'Todas'>('Todas');
  const [docenteSalas, setDocenteSalas] = useState<Sala[]>([]);

  useEffect(() => {
    async function fetchSalas() {
      if (state.user?.rol === 'docente') {
        const { data } = await supabase.from('docente_sala').select('sala').eq('docente_id', state.user.id);
        if (data) setDocenteSalas(data.map(d => d.sala as Sala));
      }
    }
    fetchSalas();
  }, [state.user]);

  const registered = new Set(
    state.records.filter(r => r.fecha === TODAY).map(r => r.nino_id)
  );

  const kidsDelDocente = state.user?.rol === 'docente' 
    ? state.kids.filter(k => docenteSalas.includes(k.sala))
    : state.kids;

  const kidsFiltrados = kidsDelDocente.filter(k =>
    filtroSala === 'Todas' ? true : k.sala === filtroSala
  );

  const salasDisponibles = state.user?.rol === 'docente' ? docenteSalas : SALAS;

  const kidsBySala = SALAS.reduce<Record<Sala, typeof state.kids>>((acc, sala) => {
    acc[sala] = kidsFiltrados.filter(k => k.sala === sala);
    return acc;
  }, {} as Record<Sala, typeof state.kids>);

  const salaColors: Record<Sala, string> = {
    'Maternal':   '#F59E0B',
    'Sala de 1':  '#22C55E',
    'Sala de 2':  '#3B82F6',
    'Sala de 3':  '#A855F7',
  };

  return (
    <div className="px-4 pt-3 pb-28 tab-content">
      {/* Sala filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
        {(['Todas', ...salasDisponibles] as (Sala | 'Todas')[]).map(sala => (
          <button
            key={sala}
            onClick={() => setFiltroSala(sala)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border-0 cursor-pointer transition-all duration-150 ${
              filtroSala === sala
                ? 'bg-naranja text-white shadow-[0_2px_8px_rgba(255,107,53,0.30)]'
                : 'bg-white text-gray-500 shadow-sm'
            }`}
          >
            {sala}
          </button>
        ))}
      </div>

      {/* Kids grouped by sala */}
      {SALAS.map(sala => {
        const kids = kidsBySala[sala];
        if (!kids.length) return null;
        return (
          <div key={sala} className="mb-5">
            <div className="flex items-center gap-2 mb-2.5">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: salaColors[sala] }}
              />
              <span className="text-[15px] font-bold text-gray-700">{sala}</span>
              <span className="text-xs text-gray-400">— {kids.length} {kids.length === 1 ? 'niño' : 'niños'}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {kids.map(kid => {
                const done = registered.has(kid.id);
                return (
                  <button
                    key={kid.id}
                    onClick={() => navigate(`/teacher/record/${kid.id}`)}
                    className="w-full text-left"
                  >
                    <Card
                      className={`flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow duration-150 border-l-4`}
                      style={{ borderLeftColor: done ? '#22C55E' : '#F59E0B' }}
                      padding="sm"
                    >
                      {kid.avatar && kid.avatar.startsWith('http') ? (
                        <img src={kid.avatar} alt={kid.nombre} className="w-12 h-12 rounded-full object-cover shadow-sm border border-gray-100 flex-shrink-0" />
                      ) : (
                        <span className="text-3xl w-12 h-12 bg-naranja-50 rounded-full flex items-center justify-center border border-gray-100 flex-shrink-0">
                          {kid.avatar || '👶'}
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-[14px] text-gray-800">
                          {kid.nombre} {kid.apellido}
                        </div>
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          <SalaBadge sala={kid.sala} />
                          <AlergiaBadge alergias={kid.alergias} />
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <StatusBadge done={done} />
                        <div className={`text-xs font-bold mt-0.5 ${done ? 'text-purple-300' : 'text-amber-300'}`}>
                          {done ? 'Ver →' : 'Cargar →'}
                        </div>
                      </div>
                    </Card>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {kidsFiltrados.length === 0 && (
        <EmptyState icon="👶" title="No hay niños en esta sala" />
      )}

      {/* Floating badge when reports exist */}
      {registered.size > 0 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 bg-green-500 text-white rounded-2xl px-4 py-2.5 font-bold text-[13px] shadow-[0_8px_24px_rgba(34,197,94,0.40)] whitespace-nowrap pointer-events-none">
          🔔 {registered.size} {registered.size === 1 ? 'reporte listo' : 'reportes listos'} para las familias
        </div>
      )}
    </div>
  );
}
