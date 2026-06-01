import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { COMIDA_OPTIONS, COMIDAS_DEL_DIA } from '../../types';
import { fmtFecha, calcDuracion, animoEmoji, comidaLabel } from '../../lib/utils';

export function ParentHistoryTab() {
  const { state } = useApp();
  const kid = state.kids.find(k => k.id === state.user?.childId);

  if (!kid) return <EmptyState icon="😕" title="Niño no encontrado" />;

  const records = [...state.records.filter(r => r.nino_id === kid.id)]
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  const ccMap = Object.fromEntries(
    COMIDA_OPTIONS.map(o => [o.v, { color: o.color, bg: o.bg }])
  );

  if (records.length === 0) {
    return (
      <div className="px-4 pt-3 pb-28 tab-content">
        <EmptyState icon="📋" title="Aún no hay registros" subtitle="Los reportes del jardín irán apareciendo aquí." />
      </div>
    );
  }

  return (
    <div className="px-4 pt-3 pb-28 tab-content">
      <h3 className="text-[17px] font-black text-gray-700 mb-4">
        📅 Historial de {kid.nombre}
      </h3>
      <div className="flex flex-col gap-3">
        {records.map(r => (
          <Card key={r.id}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-black text-[14px] text-gray-800">{fmtFecha(r.fecha)}</div>
                <div className="text-[12px] text-gray-400 mt-0.5">
                  {r.hora}hs · Maestra {r.maestro}
                </div>
              </div>
              <span className="text-2xl">{animoEmoji(r.estado_animo)}</span>
            </div>

            {/* Alimentación */}
            <div className="bg-naranja-50 rounded-xl p-3 mb-3">
              <div className="text-[11px] font-black text-naranja uppercase tracking-wider mb-2">🍽️ Alimentación</div>
              {COMIDAS_DEL_DIA.map(({ key, label, icon }) => {
                const val = r[key];
                if (!val) return null;
                const cc = ccMap[val] ?? { color: '#374151', bg: '#f3f4f6' };
                return (
                  <div key={key} className="flex items-center justify-between mb-1 last:mb-0">
                    <span className="text-xs text-gray-500 font-semibold">{icon} {label}</span>
                    <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ color: cc.color, background: cc.bg }}>
                      {comidaLabel(val)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Chips */}
            <div className="flex gap-1.5 flex-wrap mb-2">
              {r.siesta_inicio && r.siesta_fin && (
                <Chip bg="#ede9fe" color="#6d28d9">
                  😴 {r.siesta_inicio}–{r.siesta_fin} ({calcDuracion(r.siesta_inicio, r.siesta_fin)})
                </Chip>
              )}
              <Chip
                bg={r.control_pis ? '#dcfce7' : '#fee2e2'}
                color={r.control_pis ? '#166534' : '#991b1b'}
              >
                💧 Pis: {r.control_pis ? 'Solo/a' : 'Ayuda'}
              </Chip>
              {r.popo !== 'no' && <Chip bg="#fef3c7" color="#92400e">💩 Popó: {r.popo}</Chip>}
              {r.temperatura && <Chip bg="#f0fdf4" color="#166534">🌡️ {r.temperatura}°C</Chip>}
            </div>

            {r.observaciones && (
              <div className="text-[13px] text-gray-500 bg-naranja-50 rounded-xl px-3 py-2 border-l-4 border-naranja-300 leading-relaxed">
                📝 {r.observaciones}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
