import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ClipboardList, CalendarDays, Baby, MessageCircle, Video, Settings, LogOut 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SALA_MAESTRA } from '../../types';

interface SidebarProps {
  role: 'docente' | 'familia';
  activeTab: string;
  onTabChange: (tab: any) => void;
}

export function Sidebar({ role, activeTab, onTabChange }: SidebarProps) {
  const { state, logout } = useApp();
  const navigate = useNavigate();

  // Common styles
  const isTeacher = role === 'docente';
  const colorClass = isTeacher ? 'text-naranja' : 'text-violeta';
  const bgActive = isTeacher ? 'bg-naranja-50' : 'bg-violeta-50';

  // Badges logic (for teacher messages)
  const getMaestroSalas = () => {
    if (!state.user || role !== 'docente') return [];
    return Object.entries(SALA_MAESTRA)
      .filter(([, v]) => v.maestro.includes(state.user!.nombre.replace('Maestra ', '')))
      .map(([k]) => k);
  };
  const misSalas = getMaestroSalas();
  const unreadCount = isTeacher 
    ? state.messages.filter(m => !m.leido && misSalas.includes(m.sala)).length
    : 0;

  const teacherTabs: { id: string; label: string; icon: any; badge?: number }[] = [
    { id: 'hoy',      label: 'Hoy',      icon: ClipboardList },
    { id: 'historial',label: 'Historial',icon: CalendarDays  },
    { id: 'ninos',    label: 'Niños',    icon: Baby          },
    { id: 'mensajes', label: 'Mensajes', icon: MessageCircle, badge: unreadCount },
    { id: 'videos',   label: 'Videos',   icon: Video         },
  ];

  const parentTabs: { id: string; label: string; icon: any; badge?: number }[] = [
    { id: 'hoy',      label: 'Hoy',     icon: ClipboardList },
    { id: 'historial',label: 'Historial',icon: CalendarDays },
    { id: 'mensajes', label: 'Mensajes',icon: MessageCircle },
    { id: 'videos',   label: 'Videos',  icon: Video         },
  ];

  const tabs = isTeacher ? teacherTabs : parentTabs;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0 shadow-sm z-40">
      {/* Brand / Logo */}
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        {state.jardin.logo_url ? (
          <img src={state.jardin.logo_url} alt="Logo" className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">🌼</div>
        )}
        <div>
          <h2 className="font-black text-gray-800 text-sm leading-tight">{state.jardin.nombre}</h2>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{role}</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">Menú Principal</div>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer border-0 w-full text-left font-bold ${
                isActive 
                  ? `${bgActive} ${colorClass}` 
                  : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <Icon size={20} className={isActive ? colorClass : 'text-gray-400'} />
              <span className="flex-1 text-sm">{tab.label}</span>
              {!!tab.badge && tab.badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer (User Profile & Actions) */}
      <div className="p-4 border-t border-gray-100">
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-xs text-gray-500 mb-1">Conectado como</p>
          <p className="text-sm font-black text-gray-800 mb-4">{state.user?.nombre}</p>
          
          <div className="flex gap-2">
            {isTeacher && (
              <button 
                onClick={() => navigate('/config')}
                className="flex-1 py-2 bg-white border border-gray-200 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <Settings size={14} /> Ajustes
              </button>
            )}
            <button 
              onClick={() => { logout(); navigate('/login'); }}
              className="flex-1 py-2 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-red-600 hover:bg-red-100 cursor-pointer"
            >
              <LogOut size={14} /> Salir
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
