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
  const maestrasId = state.docenteSalas.filter(ds => ds.sala === kid?.sala).map(ds => ds.docente_id);
  const maestras = state.docentes.filter(d => maestrasId.includes(d.id));
  const maestroName = maestras.length > 0 ? maestras.map(m => m.nombre).join(' y ') : 'Las maestras';

  const msgs = state.messages
    .filter(m => m.nino_id === kid?.id)
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora));

  const handleSend = async () => {
    if (!texto.trim()) { showToast('⚠️ Escribí un mensaje', 'err'); return; }
    if (!kid || !state.user) return;

    await addMessage({
      nino_id: kid.id,
      remitente_id: state.user.id,
      remitente_nombre: state.user.nombre,
      sala: kid.sala,
      turno: 'Mañana', // Defaulting since shift depends on jardin setup, can be improved later
      contenido: texto.trim(),
      leido: false,
    });

    showToast(`✅ Mensaje enviado a ${maestroName}`);
    setTexto('');
  };

  if (!kid) return <EmptyState icon="😕" title="Niño no encontrado" />;

  return (
    <div className="px-4 pt-3 pb-28 tab-content">
      {/* Recipient info */}
      <div
        className="rounded-2xl px-4 py-4 mb-4 text-white"
        style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)' }}
      >
        <div className="text-[12px] opacity-80 mb-1">📨 Tu mensaje llega a:</div>
        <div className="font-black text-[15px]">{maestroName}</div>
        <div className="text-[13px] opacity-85 mt-0.5">
          {kid.sala}
        </div>
      </div>

      {/* Compose */}
      <Card className="mb-5">
        <div className="font-black text-[14px] text-gray-700 mb-3">✍️ Nuevo mensaje</div>
        <textarea
          value={texto}
          onChange={e => setTexto(e.target.value)}
          rows={4}
          placeholder={`Ej: ${maestroName.replace('Maestra ', '')}, quiero comunicarle que...`}
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
      <h3 className="text-[15px] font-black text-gray-700 mb-3">📬 Buzón de mensajes</h3>
      {msgs.length === 0 ? (
        <EmptyState icon="📭" title="Aún no hay mensajes" />
      ) : (
        <div className="flex flex-col gap-4">
          {msgs.map(m => {
            const isFromMe = m.remitente_id === state.user?.id;
            return (
              <div key={m.id} className={`flex flex-col ${isFromMe ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                  isFromMe ? 'bg-orange-100 text-gray-800 rounded-tr-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                }`}>
                  {!isFromMe && <div className="text-[11px] font-bold text-violet-600 mb-1">{m.remitente_nombre}</div>}
                  <div className="text-[14px] leading-relaxed">{m.contenido}</div>
                  <div className={`text-[10px] mt-1.5 flex items-center gap-1 ${isFromMe ? 'text-gray-500 justify-end' : 'text-gray-400'}`}>
                    <span>{m.hora}hs · {fmtFecha(m.fecha)}</span>
                    {isFromMe && (
                      <span style={{ color: m.leido ? '#16a34a' : '#d97706' }}>
                        {m.leido ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
