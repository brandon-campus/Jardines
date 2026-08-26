import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { SalaBadge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { fmtFecha } from '../../lib/utils';
import { Send, ChevronDown, ChevronUp } from 'lucide-react';
import type { Mensaje } from '../../types';

export function MessagesTab() {
  const { state, markMessagesRead, addMessage, showToast } = useApp();
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [expandedConvo, setExpandedConvo] = useState<string | null>(null);

  // Find salas assigned to this teacher using the DB relations
  const misSalas = state.user 
    ? state.docenteSalas.filter(ds => ds.docente_id === state.user!.id).map(ds => ds.sala)
    : [];

  const allMsgs = state.messages
    .filter(m => misSalas.includes(m.sala) || m.destinatario_id === state.user?.id || m.remitente_id === state.user?.id)
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora)); // Sort ascending for chat

  // Group by nino_id
  const convos = allMsgs.reduce((acc, m) => {
    if (!acc[m.nino_id]) acc[m.nino_id] = [];
    acc[m.nino_id].push(m);
    return acc;
  }, {} as Record<string, Mensaje[]>);

  const activeConvos = Object.entries(convos).sort((a, b) => {
    const lastA = a[1][a[1].length - 1];
    const lastB = b[1][b[1].length - 1];
    return lastB.fecha.localeCompare(lastA.fecha) || lastB.hora.localeCompare(lastA.hora);
  });

  const kidMap = Object.fromEntries(state.kids.map(k => [k.id, k]));

  // Mark as read when tab opens (only those received)
  useEffect(() => {
    const unread = allMsgs.filter(m => !m.leido && m.remitente_id !== state.user?.id).map(m => m.id);
    if (unread.length > 0) markMessagesRead(unread);
  }, [allMsgs, state.user?.id, markMessagesRead]);

  const handleReply = async (ninoId: string, convMsgs: Mensaje[]) => {
    const txt = replyText[ninoId];
    if (!txt?.trim()) return;
    if (!state.user) return;

    // Find the last received message from a parent to get their ID
    const lastParentMsg = [...convMsgs].reverse().find(m => m.remitente_id !== state.user?.id);
    
    // Si no hay mensaje previo del padre, quizás no deberíamos poder responder o usamos fallback
    const destinatarioId = lastParentMsg?.remitente_id;
    const sala = lastParentMsg?.sala || kidMap[ninoId]?.sala || 'Maternal';
    const turno = lastParentMsg?.turno || 'Mañana';

    await addMessage({
      nino_id: ninoId,
      remitente_id: state.user.id,
      remitente_nombre: state.user.nombre,
      destinatario_id: destinatarioId,
      sala: sala,
      turno: turno,
      contenido: txt.trim(),
      leido: false,
    });

    showToast('✅ Respuesta enviada');
    setReplyText(prev => ({ ...prev, [ninoId]: '' }));
  };

  const toggleConvo = (ninoId: string) => {
    setExpandedConvo(prev => prev === ninoId ? null : ninoId);
  };

  return (
    <div className="px-4 pt-3 pb-28 tab-content">
      <div className="mb-3">
        <h3 className="text-[17px] font-black text-gray-700">💬 Mensajes de Familias</h3>
        <p className="text-[13px] text-gray-400 mt-0.5">
          Salas: <strong className="text-gray-600">{misSalas.join(', ')}</strong>
        </p>
      </div>

      {activeConvos.length === 0 ? (
        <EmptyState icon="💬" title="Sin mensajes aún" subtitle="Cuando las familias te escriban, aparecerán aquí." />
      ) : (
        <div className="flex flex-col gap-3">
          {activeConvos.map(([ninoId, msgs]) => {
            const kid = kidMap[ninoId];
            const isExpanded = expandedConvo === ninoId;
            const hasUnread = msgs.some(m => !m.leido && m.remitente_id !== state.user?.id);
            const lastMsg = msgs[msgs.length - 1];

            return (
              <Card key={ninoId} accent="#6366F1" className="p-0 overflow-hidden">
                {/* Cabecera de la conversación */}
                <div 
                  className={`p-4 flex justify-between items-center cursor-pointer transition-colors ${hasUnread ? 'bg-violeta/5' : 'hover:bg-gray-50'}`}
                  onClick={() => toggleConvo(ninoId)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{kid ? kid.avatar : '👨‍👩‍👧'}</span>
                    <div>
                      <div className="font-black text-[14px] text-gray-800">
                        {kid ? `Familia de ${kid.nombre} ${kid.apellido}` : 'Familia'}
                        {hasUnread && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-red-500"></span>}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <SalaBadge sala={kid?.sala || lastMsg.sala} />
                        <span className="text-[11px] text-gray-400 truncate max-w-[120px]">
                          {lastMsg.remitente_id === state.user?.id ? 'Tú: ' : ''}{lastMsg.contenido}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                {/* Hilo de mensajes */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50 p-4 flex flex-col gap-3">
                    {msgs.map(m => {
                      const isFromMe = m.remitente_id === state.user?.id;
                      return (
                        <div key={m.id} className={`flex flex-col ${isFromMe ? 'items-end' : 'items-start'}`}>
                          <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-[14px] shadow-sm ${
                            isFromMe ? 'bg-violeta text-white rounded-tr-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                          }`}>
                            {!isFromMe && <div className="text-[11px] font-bold text-violeta mb-0.5">{m.remitente_nombre}</div>}
                            <div className="leading-relaxed">{m.contenido}</div>
                            <div className={`text-[10px] mt-1 flex items-center gap-1 ${isFromMe ? 'text-violeta-200 justify-end' : 'text-gray-400'}`}>
                              <span>{m.hora}hs · {fmtFecha(m.fecha)}</span>
                              {isFromMe && (
                                <span className={m.leido ? 'text-white' : 'text-violeta-300'}>
                                  {m.leido ? '✓✓' : '✓'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Input de respuesta */}
                    <div className="mt-2 flex gap-2">
                      <textarea
                        rows={1}
                        placeholder="Escribe tu respuesta..."
                        value={replyText[ninoId] || ''}
                        onChange={e => setReplyText({ ...replyText, [ninoId]: e.target.value })}
                        className="flex-1 text-sm p-2.5 border border-gray-200 rounded-xl outline-none resize-none bg-white focus:border-violeta"
                      />
                      <button 
                        onClick={() => handleReply(ninoId, msgs)} 
                        className="w-10 flex-shrink-0 flex items-center justify-center bg-violeta text-white font-bold rounded-xl hover:brightness-110"
                      >
                        <Send size={16} />
                      </button>
                    </div>
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
