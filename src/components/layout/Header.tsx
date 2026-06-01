import { useNavigate } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface TeacherHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export function TeacherHeader({ title, subtitle, showBack, onBack }: TeacherHeaderProps) {
  const { state, logout } = useApp();
  const navigate = useNavigate();
  const { jardin, user, records, kids } = state;

  const TODAY = new Date().toISOString().split('T')[0];
  const registered = new Set(records.filter(r => r.fecha === TODAY).map(r => r.nino_id)).size;
  const total = kids.length;
  const pending = total - registered;

  const handleLogout = () => { logout(); navigate('/login'); };

  if (showBack) {
    return (
      <div className="bg-gradient-to-br from-naranja to-naranja-400 px-4 pt-4 pb-6 rounded-b-3xl shadow-[0_8px_24px_rgba(255,107,53,0.30)]">
        <button
          onClick={onBack || (() => navigate('/teacher'))}
          className="mb-3 px-4 py-2 bg-white/20 text-white rounded-xl text-sm font-bold border-0 cursor-pointer hover:bg-white/30 transition-colors"
        >
          ← Volver
        </button>
        {title && (
          <h2 className="text-xl font-black text-white">{title}</h2>
        )}
        {subtitle && (
          <p className="text-sm text-white/80 mt-1">{subtitle}</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-naranja to-naranja-400 px-4 pt-4 pb-5 rounded-b-3xl md:rounded-none shadow-[0_8px_24px_rgba(255,107,53,0.30)] md:shadow-md">
      {/* Top row */}
      <div className="flex items-center gap-3 mb-3">
        {/* Logo / Avatar */}
        {jardin.logo_url ? (
          <img
            src={jardin.logo_url}
            alt="Logo"
            className="w-11 h-11 rounded-full object-cover border-[3px] border-white/40 flex-shrink-0"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-white/25 border-[3px] border-white/40 flex items-center justify-center text-xl flex-shrink-0">
            🌼
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-black text-base text-white leading-tight truncate">{jardin.nombre}</div>
          <div className="text-[11px] text-white/75">Sistema de Seguimiento Diario</div>
        </div>
        <button
          onClick={() => navigate('/config')}
          className="w-9 h-9 flex items-center justify-center bg-white/20 rounded-xl hover:bg-white/30 transition-colors border-0 cursor-pointer"
        >
          <Settings size={16} className="text-white" />
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors border-0 cursor-pointer text-white text-xs font-bold"
        >
          <LogOut size={14} />
          Salir
        </button>
      </div>

      {/* Welcome */}
      <p className="text-[13px] text-white/80 mb-0.5">
        👋 Bienvenida, {user?.nombre}
      </p>
      <p className="text-[11px] text-white/65">
        🗓️ {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>

      {/* Stats */}
      <div className="flex gap-2 mt-3">
        {[
          { label: '👶 Total', value: total },
          { label: '✅ Registrados', value: registered },
          { label: '⏳ Pendientes', value: pending },
        ].map(stat => (
          <div
            key={stat.label}
            className="flex-1 bg-white/18 rounded-xl py-2 px-1 text-center"
          >
            <div className="text-xl font-black text-white">{stat.value}</div>
            <div className="text-[10px] text-white/85">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ParentHeaderProps {
  kidName?: string;
  kidAvatar?: string;
  sala?: string;
  alergias?: string;
  hasTodayReport?: boolean;
  reportTime?: string;
  reportMaestro?: string;
  animoEmoji?: string;
}

export function ParentHeader({
  kidName, kidAvatar, sala, alergias,
  hasTodayReport, reportTime, reportMaestro, animoEmoji,
}: ParentHeaderProps) {
  const { state, logout } = useApp();
  const navigate = useNavigate();
  const { jardin, user } = state;

  return (
    <div className="bg-gradient-to-br from-violeta to-violeta-light px-4 pt-4 pb-5 rounded-b-3xl md:rounded-none shadow-[0_8px_24px_rgba(124,58,237,0.30)] md:shadow-md">
      {/* Garden name */}
      <div className="flex items-center gap-2 mb-3 opacity-90">
        {jardin.logo_url ? (
          <img src={jardin.logo_url} alt="" className="w-7 h-7 rounded-full object-cover" />
        ) : (
          <span className="text-lg">🌼</span>
        )}
        <span className="font-bold text-sm text-white">{jardin.nombre}</span>
      </div>

      {/* Kid info */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[13px] text-white/80 mb-1">👋 ¡Hola, {user?.nombre}!</p>
          <h1 className="text-xl font-black text-white">
            {kidAvatar} {kidName}
          </h1>
          <div className="flex gap-2 mt-2 flex-wrap">
            {sala && (
              <span className="px-2.5 py-0.5 bg-white/20 text-white text-xs font-bold rounded-full">
                {sala}
              </span>
            )}
            {alergias && alergias !== 'Ninguna' && (
              <span className="px-2.5 py-0.5 bg-red-400/30 text-white text-xs font-bold rounded-full">
                ⚠️ {alergias}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="flex items-center gap-1.5 px-3 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors border-0 cursor-pointer text-white text-xs font-bold"
        >
          <LogOut size={14} />
          Salir
        </button>
      </div>

      {/* Report banner */}
      {hasTodayReport && (
        <div className="mt-3 bg-white/15 rounded-2xl px-3 py-2.5 flex items-center gap-3">
          <span className="text-2xl">{animoEmoji}</span>
          <div>
            <div className="font-black text-sm text-white">🎉 Reporte de hoy disponible</div>
            <div className="text-[11px] text-white/80">
              Cargado a las {reportTime}hs · Maestra {reportMaestro}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
