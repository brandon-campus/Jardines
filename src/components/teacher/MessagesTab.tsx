import { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { SalaBadge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { SALA_MAESTRA } from '../../types';
import { fmtFecha } from '../../lib/utils';

export function MessagesTab() {
  const { state, markMessagesRead } = useApp();

  // Find salas assigned to this teacher
  const misSalas = !state.user ? [] : Object.entries(SALA_MAESTRA)
    .filter(([, v]) => v.maestro.includes(state.user!.nombre.replace('Maestra ', '')))
    .map(([k]) => k);

  const msgs = state.messages
    .filter(m => misSalas.includes(m.sala))
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora));

  const kidMap = Object.fromEntries(state.kids.map(k => [k.id, k]));

  // Mark as read when tab opens
  useEffect(() => {
    const unread = msgs.filter(m => !m.leido).map(m => m.id);
    if (unread.length > 0) markMessagesRead(unread);
  }, []);

  return (
    <div className="px-4 pt-3 pb-28 tab-content">
      <div className="mb-3">
        <h3 className="text-[17px] font-black text-gray-700">💬 Mensajes de Familias</h3>
        <p className="text-[13px] text-gray-400 mt-0.5">
          Salas: <strong className="text-gray-600">{misSalas.join(', ')}</strong>
        </p>
      </div>

      {msgs.length === 0 ? (
        <EmptyState icon="💬" title="Sin mensajes aún" subtitle="Cuando las familias te escriban, aparecerán aquí." />
      ) : (
        <div className="flex flex-col gap-3">
          {msgs.map(m => {
            const kid = kidMap[m.nino_id];
            return (
              <Card key={m.id} accent="#6366F1">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{kid ? kid.avatar : '👨‍👩‍👧'}</span>
                    <div>
                      <div className="font-black text-[14px] text-gray-800">
                        {m.remitente_nombre}
                        {kid && (
                          <span className="ml-2 text-violeta text-[13px] font-semibold">
                            (padres de {kid.nombre} {kid.apellido})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <SalaBadge sala={m.sala} />
                        <span className="text-[12px] text-gray-400">· Turno {m.turno}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-gray-400 flex-shrink-0">
                    <div>{m.hora}hs</div>
                    <div>{fmtFecha(m.fecha)}</div>
                  </div>
                </div>

                <div className="bg-violeta-100 rounded-xl px-3 py-2.5 text-[14px] text-gray-700 leading-relaxed border-l-4 border-violeta-400">
                  {m.contenido}
                </div>

                <div className="mt-2 text-[12px] text-green-600 font-bold">✅ Leído</div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
