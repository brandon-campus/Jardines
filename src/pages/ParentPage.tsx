import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppLayout } from '../components/layout/AppLayout';
import { ParentHeader } from '../components/layout/Header';
import { ParentBottomNav } from '../components/layout/BottomNav';
import { Sidebar } from '../components/layout/Sidebar';
import { ParentTodayTab } from '../components/parent/TodayTab';
import { ParentHistoryTab } from '../components/parent/HistoryTab';
import { ParentMessagesTab } from '../components/parent/MessagesTab';
import { animoEmoji } from '../lib/utils';
import { TODAY } from '../data/mock';

type Tab = 'hoy' | 'historial' | 'mensajes';

export function ParentPage() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('hoy');

  const kid = state.kids.find(k => k.id === state.user?.childId);
  const todayRecord = state.records.find(
    r => r.nino_id === kid?.id && r.fecha === TODAY
  );

  const renderTab = () => {
    switch (activeTab) {
      case 'hoy':       return <ParentTodayTab />;
      case 'historial': return <ParentHistoryTab />;
      case 'mensajes':  return <ParentMessagesTab />;
    }
  };

  return (
    <AppLayout>
      <div className="flex w-full min-h-screen">
        <Sidebar role="familia" activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative">
          <ParentHeader
            kidName={kid ? `${kid.nombre} ${kid.apellido}` : ''}
            kidAvatar={kid?.avatar}
            sala={kid?.sala}
            alergias={kid?.alergias}
            hasTodayReport={!!todayRecord}
            reportTime={todayRecord?.hora}
            reportMaestro={todayRecord?.maestro}
            animoEmoji={animoEmoji(todayRecord?.estado_animo ?? null)}
          />
          <div className="flex-1 md:p-6 max-w-5xl mx-auto w-full">
            {renderTab()}
          </div>
          <ParentBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>
    </AppLayout>
  );
}
