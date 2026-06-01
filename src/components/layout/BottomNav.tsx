import { ClipboardList, CalendarDays, Baby, MessageCircle, Video } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SALA_MAESTRA } from '../../types';

type TeacherTab = 'hoy' | 'historial' | 'ninos' | 'mensajes' | 'videos';
type ParentTab = 'hoy' | 'historial' | 'mensajes';

interface TeacherBottomNavProps {
  activeTab: TeacherTab;
  onTabChange: (tab: TeacherTab) => void;
}

export function TeacherBottomNav({ activeTab, onTabChange }: TeacherBottomNavProps) {
  const { state } = useApp();

  // Count unread messages for this teacher
  const getMaestroSalas = () => {
    if (!state.user) return [];
    return Object.entries(SALA_MAESTRA)
      .filter(([, v]) => v.maestro.includes(state.user!.nombre.replace('Maestra ', '')))
      .map(([k]) => k);
  };
  const misSalas = getMaestroSalas();
  const unreadCount = state.messages.filter(m => !m.leido && misSalas.includes(m.sala)).length;

  const tabs: { id: TeacherTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: 'hoy',      label: 'Hoy',      icon: ClipboardList },
    { id: 'historial',label: 'Historial',icon: CalendarDays  },
    { id: 'ninos',    label: 'Niños',    icon: Baby          },
    { id: 'mensajes', label: 'Mensajes', icon: MessageCircle },
    { id: 'videos',   label: 'Videos',   icon: Video         },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-50">
      <div className="flex">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const hasBadge = tab.id === 'mensajes' && unreadCount > 0;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 border-0 cursor-pointer transition-all duration-150 relative ${
                isActive ? 'text-naranja' : 'text-gray-400'
              }`}
              style={{ background: 'transparent' }}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? 'text-naranja' : 'text-gray-400'} />
                {hasBadge && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-bold ${isActive ? 'text-naranja' : 'text-gray-400'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-naranja rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

interface ParentBottomNavProps {
  activeTab: ParentTab;
  onTabChange: (tab: ParentTab) => void;
}

export function ParentBottomNav({ activeTab, onTabChange }: ParentBottomNavProps) {
  const tabs: { id: ParentTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: 'hoy',      label: 'Hoy',     icon: ClipboardList },
    { id: 'historial',label: 'Historial',icon: CalendarDays },
    { id: 'mensajes', label: 'Mensajes',icon: MessageCircle },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-50">
      <div className="flex">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 border-0 cursor-pointer transition-all duration-150 relative`}
              style={{ background: 'transparent' }}
            >
              <Icon size={20} className={isActive ? 'text-violeta' : 'text-gray-400'} />
              <span className={`text-[10px] font-bold ${isActive ? 'text-violeta' : 'text-gray-400'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-violeta rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
