import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../ui/EmptyState';
import { fmtFecha } from '../../lib/utils';

export function ParentMessagesTab() {
  const { state, addMessage, markMessagesRead, showToast } = useApp();
  const [texto, setTexto] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const kid = state.kids.find(k => k.id === state.user?.childId);
  const maestrasId = state.docenteSalas.filter(ds => ds.sala === kid?.sala).map(ds => ds.docente_id);
  const maestras = state.docentes.filter(d => maestrasId.includes(d.id));
  const maestroName = maestras.length > 0 ? maestras.map(m => m.nombre).join(' y ') : 'Las maestras';

  const msgs = state.messages
    .filter(m => m.nino_id === kid?.id)
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora));

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      window.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
    // Mark unread messages from teacher as read
    const unread = msgs.filter(m => !m.leido && m.remitente_id !== state.user?.id).map(m => m.id);
    if (unread.length > 0) markMessagesRead(unread);
  }, [msgs, state.user?.id, markMessagesRead]);

  const handleSend = async () => {
    if (!texto.trim()) { showToast('⚠️ Escribí un mensaje', 'err'); return; }
    if (!kid || !state.user) return;

    await addMessage({
      nino_id: kid.id,
      remitente_id: state.user.id,
      remitente_nombre: state.user.nombre,
      destinatario_id: maestrasId.length > 0 ? maestrasId[0] : undefined,
      sala: kid.sala,
      turno: 'Mañana', // Defaulting since shift depends on jardin setup, can be improved later
      contenido: texto.trim(),
      leido: false,
    });

    setTexto('');
  };

  if (!kid) return <EmptyState icon="😕" title="Niño no encontrado" />;

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] relative" ref={scrollRef}>
      {/* Recipient info Header */}
      <div className="px-4 pt-3 pb-2 sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10">
        <div
          className="rounded-2xl px-4 py-3 text-white shadow-sm flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)' }}
        >
          <div>
            <div className="font-black text-[15px]">{maestroName}</div>
            <div className="text-[12px] opacity-90 mt-0.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
              {kid.sala}
            </div>
          </div>
          <div className="text-3xl opacity-90">👩‍🏫</div>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 px-4 pb-28 pt-2">
        {msgs.length === 0 ? (
          <EmptyState icon="💬" title="Envía un mensaje" subtitle={`Comunícate con ${maestroName} por cualquier duda.`} />
        ) : (
          <div className="flex flex-col gap-4">
            {msgs.map(m => {
              const isFromMe = m.remitente_id === state.user?.id;
              return (
                <div key={m.id} className={`flex flex-col ${isFromMe ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-[14px] shadow-sm ${
                    isFromMe ? 'bg-orange-100 text-gray-800 rounded-tr-sm' : 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm'
                  }`}>
                    {!isFromMe && <div className="text-[11px] font-bold text-violet-600 mb-0.5">{m.remitente_nombre}</div>}
                    <div className="leading-relaxed">{m.contenido}</div>
                    <div className={`text-[10px] mt-1 flex items-center gap-1 ${isFromMe ? 'text-gray-500 justify-end' : 'text-gray-400'}`}>
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

      {/* Input Area */}
      <div className="fixed bottom-[70px] left-0 right-0 md:left-64 bg-white border-t border-gray-100 p-3 z-20 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
        <div className="flex gap-2 items-end max-w-lg mx-auto">
          <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            rows={Math.min(4, texto.split('\n').length || 1)}
            placeholder="Mensaje..."
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-2xl text-[14px] bg-gray-50 resize-none focus:outline-none focus:border-violeta focus:ring-1 focus:ring-violeta transition-all"
            style={{ minHeight: '44px' }}
          />
          <button
            onClick={handleSend}
            disabled={!texto.trim()}
            className="w-11 h-11 flex-shrink-0 flex justify-center items-center rounded-full text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #FF6B35, #FF8C5A)' }}
          >
            <Send size={18} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
