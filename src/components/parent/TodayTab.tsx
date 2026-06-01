import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { COMIDA_OPTIONS, COMIDAS_DEL_DIA } from '../../types';
import { fmtFecha, calcDuracion, animoLabel, animoEmoji, comidaLabel, tempColor } from '../../lib/utils';
import { TODAY } from '../../data/mock';

export function ParentTodayTab() {
  const { state } = useApp();
  const kid = state.kids.find(k => k.id === state.user?.childId);
  const record = state.records.find(r => r.nino_id === kid?.id && r.fecha === TODAY);

  if (!kid) return <EmptyState icon="😕" title="Niño no encontrado" />;

  if (!record) {
    return (
      <div className="px-4 pt-3 pb-28 tab-content">
        <Card className="text-center py-10">
          <div className="text-5xl mb-3">⏳</div>
          <h3 className="text-lg font-black text-gray-700 mb-2">Aún no hay reporte de hoy</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Las maestras suelen cargar los datos al mediodía.
            <br />¡Volvé más tarde! 😊
          </p>
        </Card>
      </div>
    );
  }

  const ccMap = Object.fromEntries(
    COMIDA_OPTIONS.map(o => [o.v, { color: o.color, bg: o.bg }])
  );

  return (
    <div className="px-4 pt-3 pb-28 tab-content">
      <h3 className="text-[17px] font-black text-gray-700 mb-3">📋 Reporte del {fmtFecha(TODAY)}</h3>

      {/* Ánimo hero */}
      <div
        className="rounded-3xl p-6 mb-4 text-center"
        style={{ background: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)' }}
      >
        <div className="text-6xl mb-2">{animoEmoji(record.estado_animo)}</div>
        <div className="text-xl font-black text-violet-700">{animoLabel(record.estado_animo)}</div>
        <div className="text-xs text-violet-400 mt-1">Estado de ánimo del día</div>
      </div>

      {/* Alimentación */}
      <Card className="mb-3">
        <div className="font-black text-sm text-gray-700 mb-3">🍽️ Alimentación</div>
        {COMIDAS_DEL_DIA.map(({ key, label, icon }) => {
          const val = record[key];
          if (!val) return null;
          const cc = ccMap[val] ?? { color: '#374151', bg: '#f3f4f6' };
          return (
            <div key={key} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">{icon}</span>
                <span className="text-sm font-bold text-gray-700">{label}</span>
              </div>
              <span
                className="text-xs font-black px-3 py-1 rounded-full"
                style={{ color: cc.color, background: cc.bg }}
              >
                {comidaLabel(val)}
              </span>
            </div>
          );
        })}
      </Card>

      {/* Info detallada */}
      <Card className="mb-3">
        <InfoRow
          icon="💩" label="Popó"
          val={record.popo === 'no' ? 'No hizo' : record.popo === 'poco' ? 'Poca cantidad' : 'Mucha cantidad'}
        />
        <InfoRow
          icon="💧" label="Control de pis"
          val={record.control_pis ? '¡Lo hizo solo/a! 🥳' : 'Con ayuda de la maestra'}
          color={record.control_pis ? '#16a34a' : '#dc2626'}
        />
        {record.siesta_inicio && record.siesta_fin && (
          <InfoRow
            icon="😴" label="Siesta"
            val={`${record.siesta_inicio} a ${record.siesta_fin} · ${calcDuracion(record.siesta_inicio, record.siesta_fin)}`}
          />
        )}
        {record.temperatura && (
          <InfoRow
            icon="🌡️" label="Temperatura"
            val={`${record.temperatura}°C`}
            color={tempColor(record.temperatura)}
          />
        )}
        {record.medicacion && (
          <InfoRow icon="💊" label="Medicación" val={record.medicacion} color="#dc2626" />
        )}
      </Card>

      {/* Observaciones */}
      {record.observaciones && (
        <Card className="mb-3">
          <div className="font-black text-sm text-gray-700 mb-2">💬 Comentarios de la maestra</div>
          <p className="text-sm text-gray-500 leading-relaxed">{record.observaciones}</p>
          <div className="text-xs text-gray-400 mt-2">— Maestra {record.maestro}, {record.hora}hs</div>
        </Card>
      )}

      {/* Foto */}
      {record.foto_url && (
        <Card>
          <div className="font-black text-sm text-gray-700 mb-2">📸 Foto del Día</div>
          <img
            src={record.foto_url}
            alt="Foto del día"
            className="w-full rounded-xl object-cover"
          />
          <div className="text-xs text-gray-400 text-center mt-2">
            Compartida por Maestra {record.maestro}
          </div>
        </Card>
      )}
    </div>
  );
}

function InfoRow({
  icon, label, val, color = '#1f2937'
}: { icon: string; label: string; val: string; color?: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xl flex-shrink-0">{icon}</span>
      <div className="flex-1">
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-wide">{label}</div>
        <div className="text-sm font-black" style={{ color }}>{val}</div>
      </div>
    </div>
  );
}
