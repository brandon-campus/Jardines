import { useApp } from '../../context/AppContext';
import { EmptyState } from '../ui/EmptyState';
import { Card } from '../ui/Card';
import { fmtFecha } from '../../lib/utils';
import { SalaBadge } from '../ui/Badge';

export function ParentVideosTab() {
  const { state } = useApp();
  const kid = state.kids.find(k => k.id === state.user?.childId);

  if (!kid) return <EmptyState icon="😕" title="Niño no encontrado" />;

  // Filtrar videos de la sala del niño o los marcados para "Todas"
  const videos = [...state.videos]
    .filter(v => v.sala === 'Todas' || v.sala === kid.sala)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  if (videos.length === 0) {
    return (
      <div className="px-4 pt-3 pb-28 tab-content">
        <EmptyState 
          icon="📹" 
          title="Sin videos" 
          subtitle="Aún no hay videos compartidos para la sala." 
        />
      </div>
    );
  }

  return (
    <div className="px-4 pt-3 pb-28 tab-content">
      <div className="mb-4">
        <h3 className="text-[17px] font-black text-gray-700">📹 Galería de Videos</h3>
        <p className="text-sm text-gray-400 font-semibold mt-1">Momentos compartidos por el jardín</p>
      </div>

      <div className="flex flex-col gap-4">
        {videos.map(v => (
          <Card key={v.id} className="p-0 overflow-hidden bg-white shadow-sm border border-gray-100">
            {/* Video Player */}
            <div className="aspect-video w-full bg-black">
              <video 
                src={v.video_url} 
                controls 
                controlsList="nodownload"
                className="w-full h-full object-contain"
                preload="metadata"
              />
            </div>

            {/* Video Info */}
            <div className="p-4">
              <h4 className="font-black text-gray-800 text-base leading-tight mb-1">{v.titulo}</h4>
              <div className="flex items-center gap-2 mt-2">
                {v.sala !== 'Todas' && <SalaBadge sala={v.sala as any} />}
                <span className="text-xs text-gray-400 font-bold">
                  {fmtFecha(v.fecha)}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
