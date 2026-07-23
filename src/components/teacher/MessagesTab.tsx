import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { SalaBadge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { fmtFecha } from '../../lib/utils';
import { Send } from 'lucide-react';

export function MessagesTab() {
  const { state, markMessagesRead, addMessage, showToast } = useApp();
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [activeReply, setActiveReply] = useState<string | null>(null);

  // Find salas assigned to this teacher using the DB relations
  const misSalas = state.user 
    ? state.docenteSalas.filter(ds => ds.docente_id === state.user!.id).map(ds => ds.sala)
    : [];

  const msgs = state.messages
    .filter(m => (misSalas.includes(m.sala) || m.destinatario_id === state.user?.id) && m.remitente_id !== state.user?.id)
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora));

  const kidMap = Object.fromEntries(state.kids.map(k => [k.id, k]));

  // Mark as read when tab opens (only those received)
  useEffect(() => {
    const unread = msgs.filter(m => !m.leido && m.remitente_id !== state.user?.id).map(m => m.id);
    if (unread.length > 0) markMessagesRead(unread);
  }, [msgs]);

  const handleReply = async (msgToReply: any) => {
    const txt = replyText[msgToReply.id];
    if (!txt?.trim()) return;
    if (!state.user) return;

    await addMessage({
      nino_id: msgToReply.nino_id,
      remitente_id: state.user.id,
      remitente_nombre: state.user.nombre,
      destinatario_id: msgToReply.remitente_id, // Respondemos directo al padre
      sala: msgToReply.sala,
      turno: msgToReply.turno,
      contenido: txt.trim(),
      leido: false,
    });

    showToast('✅ Respuesta enviada');
    setReplyText(prev => ({ ...prev, [msgToReply.id]: '' }));
    setActiveReply(null);
  };

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

                <div className="bg-violeta-100 rounded-xl px-3 py-2.5 text-[14px] text-gray-700 leading-relaxed border-l-4 border-violeta-400 mb-2">
                  {m.contenido}
                </div>

                {/* Reply section */}
                {activeReply === m.id ? (
                  <div className="mt-3 bg-white p-2 rounded-xl border border-gray-200">
                    <textarea
                      autoFocus
                      rows={2}
                      placeholder="Escribe tu respuesta..."
                      value={replyText[m.id] || ''}
                      onChange={e => setReplyText({ ...replyText, [m.id]: e.target.value })}
                      className="w-full text-sm font-semibold p-2 border-0 outline-none resize-none bg-transparent"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button onClick={() => setActiveReply(null)} className="px-3 py-1.5 text-xs text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancelar</button>
                      <button onClick={() => handleReply(m)} className="px-3 py-1.5 text-xs bg-violeta text-white font-bold rounded-lg flex items-center gap-1 hover:brightness-110">
                        <Send size={12} />
                        Enviar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center mt-2">
                    <button 
                      onClick={() => setActiveReply(m.id)}
                      className="text-[12px] font-bold text-violeta hover:underline"
                    >
                      ↩ Responder
                    </button>
                    <div className="text-[12px] text-green-600 font-bold">✅ Leído</div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
