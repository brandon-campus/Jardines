import { useState } from 'react';
import { Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { SalaBadge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { SALA_MAESTRA } from '../../types';
import { fmtFecha } from '../../lib/utils';

export function ParentMessagesTab() {
  const { state, addMessage, showToast } = useApp();
  const [texto, setTexto] = useState('');

  const kid = state.kids.find(k => k.id === state.user?.childId);
  const sm = kid ? (SALA_MAESTRA[kid.sala] ?? { maestro: 'la maestra', turno: 'Mañana' }) : null;

  const msgs = state.messages
    .filter(m => m.nino_id === kid?.id)
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora));

  const handleSend = async () => {
    if (!texto.trim()) { showToast('⚠️ Escribí un mensaje', 'err'); return; }
    if (!kid || !state.user || !sm) return;

    await addMessage({
      nino_id: kid.id,
      remitente_id: state.user.id,
      remitente_nombre: state.user.nombre,
      sala: kid.sala,
      turno: sm.turno,
      contenido: texto.trim(),
      leido: false,
    });

    showToast(`✅ Mensaje enviado a ${sm.maestro}`);
    setTexto('');
  };

  if (!kid || !sm) return <EmptyState icon="😕" title="Niño no encontrado" />;

  return (
    <div className="px-4 pt-3 pb-28 tab-content">
      {/* Recipient info */}
      <div
        className="rounded-2xl px-4 py-4 mb-4 text-white"
        style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)' }}
      >
        <div className="text-[12px] opacity-80 mb-1">📨 Tu mensaje llega a:</div>
        <div className="font-black text-[15px]">{sm.maestro}</div>
        <div className="text-[13px] opacity-85 mt-0.5">
          {kid.sala} · Turno {sm.turno}
        </div>
      </div>

      {/* Compose */}
      <Card className="mb-5">
        <div className="font-black text-[14px] text-gray-700 mb-3">✍️ Nuevo mensaje</div>
        <textarea
          value={texto}
          onChange={e => setTexto(e.target.value)}
          rows={4}
          placeholder={`Ej: ${sm.maestro.replace('Maestra ', '')}, quiero comunicarle que...`}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-800 bg-white placeholder:text-gray-400 placeholder:font-normal resize-y leading-relaxed focus:outline-none focus:border-violeta focus:ring-2 focus:ring-violeta/20 transition-all mb-3"
        />
        <button
          onClick={handleSend}
          className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 cursor-pointer border-0 hover:brightness-105 transition-all"
          style={{ background: 'linear-gradient(135deg, #FF6B35, #FF8C5A)' }}
        >
          <Send size={14} />
          Enviar mensaje
        </button>
      </Card>

      {/* Sent messages */}
      <h3 className="text-[15px] font-black text-gray-700 mb-3">📬 Mensajes enviados</h3>
      {msgs.length === 0 ? (
        <EmptyState icon="📭" title="Aún no enviaste mensajes" />
      ) : (
        <div className="flex flex-col gap-3">
          {msgs.map(m => (
            <Card key={m.id} accent={m.leido ? '#22c55e' : '#f59e0b'}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
                  <SalaBadge sala={m.sala} />
                  <span>· Turno {m.turno}</span>
                  <span>· {m.hora}hs</span>
                  <span>· {fmtFecha(m.fecha)}</span>
                </div>
                <span
                  className="text-[12px] font-bold"
                  style={{ color: m.leido ? '#16a34a' : '#d97706' }}
                >
                  {m.leido ? '✅ Leído' : '🕐 Sin leer'}
                </span>
              </div>
              <div className="bg-violet-50 rounded-xl px-3 py-2.5 text-[14px] text-gray-700 leading-relaxed">
                {m.contenido}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
