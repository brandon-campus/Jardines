import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppLayout } from '../components/layout/AppLayout';
import { TeacherHeader } from '../components/layout/Header';
import { TeacherBottomNav } from '../components/layout/BottomNav';
import { Sidebar } from '../components/layout/Sidebar';
import { TodayTab } from '../components/teacher/TodayTab';
import { HistoryTab } from '../components/teacher/HistoryTab';
import { ChildrenTab } from '../components/teacher/ChildrenTab';
import { MessagesTab } from '../components/teacher/MessagesTab';
import { VideosTab } from '../components/teacher/VideosTab';

type Tab = 'hoy' | 'historial' | 'ninos' | 'mensajes' | 'videos';

export function TeacherPage() {
  const [activeTab, setActiveTab] = useState<Tab>('hoy');

  const renderTab = () => {
    switch (activeTab) {
      case 'hoy':       return <TodayTab />;
      case 'historial': return <HistoryTab />;
      case 'ninos':     return <ChildrenTab />;
      case 'mensajes':  return <MessagesTab />;
      case 'videos':    return <VideosTab />;
    }
  };

  return (
    <AppLayout>
      <div className="flex w-full min-h-screen">
        <Sidebar role="docente" activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative">
          <TeacherHeader />
          <div className="flex-1 md:p-6 max-w-5xl mx-auto w-full">
            {renderTab()}
          </div>
          <TeacherBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>
    </AppLayout>
  );
}
