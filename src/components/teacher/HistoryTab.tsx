import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { SalaBadge, Chip } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { COMIDA_OPTIONS, ANIMO_OPTIONS } from '../../types';
import { fmtFecha, calcDuracion, animoEmoji, comidaLabel, tempColor } from '../../lib/utils';

export function HistoryTab() {
  const { state } = useApp();
  const [filterKid, setFilterKid] = useState<string>('todos');

  const sorted = [...state.records].sort((a, b) =>
    b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora)
  );

  const filtered = filterKid === 'todos'
    ? sorted
    : sorted.filter(r => r.nino_id === filterKid);

  const kidMap = Object.fromEntries(state.kids.map(k => [k.id, k]));

  const ccMap = Object.fromEntries(
    COMIDA_OPTIONS.map(o => [o.v, { color: o.color, bg: o.bg }])
  );

  return (
    <div className="px-4 pt-3 pb-28 tab-content">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[17px] font-black text-gray-700">📅 Todos los Registros</h3>
      </div>

      {/* Filter by kid */}
      <div className="mb-4">
        <select
          value={filterKid}
          onChange={e => setFilterKid(e.target.value)}
          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:border-naranja"
        >
          <option value="todos">Todos los niños</option>
          {state.kids.map(k => (
            <option key={k.id} value={k.id}>{k.nombre} {k.apellido}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📋" title="No hay registros aún" subtitle="Los registros guardados aparecerán aquí." />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(r => {
            const kid = kidMap[r.nino_id];
            return (
              <Card key={r.id} className="animate-fade-in">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    {kid && (
                      kid.avatar && kid.avatar.startsWith('http') ? (
                        <img src={kid.avatar} alt={kid.nombre} className="w-12 h-12 rounded-full object-cover shadow-sm flex-shrink-0" />
                      ) : (
                        <span className="text-3xl w-12 h-12 bg-naranja-50 rounded-full flex items-center justify-center flex-shrink-0">
                          {kid.avatar || '👶'}
                        </span>
                      )
                    )}
                    <div>
                      {kid && (
                        <div className="font-black text-[14px] text-gray-800">
                          {kid.nombre} {kid.apellido}
                        </div>
                      )}
                      <div className="text-[12px] text-gray-400 mt-0.5">
                        📅 {fmtFecha(r.fecha)} · {r.hora}hs · 👩‍🏫 {r.maestro}
                      </div>
                    </div>
                  </div>
                  <span className="text-2xl">{animoEmoji(r.estado_animo)}</span>
                </div>

                {/* Alimentación */}
                <div className="bg-naranja-50 rounded-xl p-3 mb-3">
                  <div className="text-[11px] font-black text-naranja uppercase tracking-wider mb-2">
                    🍽️ Alimentación
                  </div>
                  <div className="flex flex-col gap-1">
                    {[
                      { key: 'desayuno', label: 'Desayuno', icon: '☀️', val: r.desayuno },
                      { key: 'almuerzo', label: 'Almuerzo', icon: '🍛', val: r.almuerzo },
                      { key: 'merienda', label: 'Merienda', icon: '🍪', val: r.merienda },
                    ].map(item => {
                      if (!item.val) return null;
                      const cc = ccMap[item.val] ?? { color: '#374151', bg: '#f3f4f6' };
                      return (
                        <div key={item.key} className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 font-semibold">{item.icon} {item.label}</span>
                          <span
                            className="text-xs font-black px-3 py-0.5 rounded-full"
                            style={{ color: cc.color, background: cc.bg }}
                          >
                            {comidaLabel(item.val)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Chips */}
                <div className="flex gap-1.5 flex-wrap mb-3">
                  {r.siesta_inicio && r.siesta_fin && (
                    <Chip bg="#ede9fe" color="#6d28d9">
                      😴 {r.siesta_inicio}–{r.siesta_fin} ({calcDuracion(r.siesta_inicio, r.siesta_fin)})
                    </Chip>
                  )}
                  <Chip
                    bg={r.control_pis ? '#dcfce7' : '#fee2e2'}
                    color={r.control_pis ? '#166534' : '#991b1b'}
                  >
                    💧 Pis: {r.control_pis ? 'Solo/a' : 'Con ayuda'}
                  </Chip>
                  {r.popo !== 'no' && (
                    <Chip bg="#fef3c7" color="#92400e">💩 Popó: {r.popo}</Chip>
                  )}

                </div>

                {/* Obs */}
                {r.observaciones && (
                  <div className="bg-naranja-50 rounded-xl px-3 py-2.5 text-[13px] text-gray-600 border-l-3 border-naranja leading-relaxed">
                    📝 {r.observaciones}
                  </div>
                )}

                {/* Foto */}
                {r.foto_url && (
                  <img
                    src={r.foto_url}
                    alt="Foto del día"
                    className="w-full rounded-xl mt-2 object-cover max-h-48"
                  />
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
