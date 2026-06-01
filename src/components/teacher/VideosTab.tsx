import { useState, useRef } from 'react';
import { Trash2, Upload, Video as VideoIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { SalaBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { EmptyState } from '../ui/EmptyState';
import { SALAS } from '../../types';
import type { Sala } from '../../types';
import { fmtFecha } from '../../lib/utils';

export function VideosTab() {
  const { state, addVideo, deleteVideo, showToast } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);

  const [titulo, setTitulo] = useState('');
  const [sala, setSala] = useState<string>('Todas');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setSelectedFile(f);
    setVideoPreviewUrl(URL.createObjectURL(f));
  };

  const cancelSelection = () => {
    setSelectedFile(null);
    setVideoPreviewUrl('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handlePublish = () => {
    if (!titulo.trim()) { showToast('⚠️ Escribí un título', 'err'); return; }
    if (!videoPreviewUrl) { showToast('⚠️ Seleccioná un video', 'err'); return; }

    addVideo({
      titulo,
      sala,
      video_url: videoPreviewUrl,
      maestra: state.user?.nombre.replace('Maestra ', '') ?? 'Docente',
    });

    showToast('✅ Video publicado');
    setTitulo(''); setSala('Todas'); cancelSelection();
  };

  const vids = [...state.videos].reverse();

  return (
    <div className="px-4 pt-3 pb-28 tab-content">
      <h3 className="text-[17px] font-black text-gray-700 mb-4">🎥 Videos del Jardín</h3>

      {/* Upload card */}
      <Card className="mb-5">
        <div className="font-black text-[14px] text-gray-700 mb-3">📤 Subir nuevo video</div>

        <div className="flex flex-col gap-3">
          <Input
            label="Título del video"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder="Ej: Actividad de arte — Sala de 2"
          />

          <Select
            label="Sala"
            value={sala}
            onChange={e => setSala(e.target.value)}
          >
            <option value="Todas">Todas las salas</option>
            {SALAS.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>

          <input
            type="file"
            ref={fileRef}
            accept="video/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          {!selectedFile ? (
            <button
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-naranja-300 rounded-2xl py-7 px-4 text-center cursor-pointer hover:bg-naranja-50 transition-colors bg-naranja-50/50"
            >
              <div className="text-4xl mb-2">🎬</div>
              <div className="font-black text-[15px] text-naranja mb-1">Tocá para elegir el video</div>
              <div className="text-[13px] text-gray-400 mb-3">MP4, MOV o WebM</div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-br from-naranja to-naranja-400 text-white rounded-xl px-4 py-2 font-bold text-sm">
                <Upload size={14} />
                Elegir video
              </div>
            </button>
          ) : (
            <div className="bg-green-50 rounded-2xl px-4 py-3 border-2 border-green-200">
              <div className="font-black text-green-700 text-sm mb-1">✅ Video seleccionado</div>
              <div className="text-xs text-gray-500 mb-3 truncate">{selectedFile.name}</div>
              <div className="flex gap-2">
                <Button onClick={handlePublish} className="flex-1" size="sm">
                  📤 Publicar
                </Button>
                <button
                  onClick={cancelSelection}
                  className="px-3 py-2 bg-red-50 text-red-500 border border-red-200 rounded-xl text-sm font-bold cursor-pointer hover:bg-red-100 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Published videos */}
      <h3 className="text-[15px] font-black text-gray-700 mb-3">
        📼 Videos publicados ({vids.length})
      </h3>

      {vids.length === 0 ? (
        <EmptyState icon="🎥" title="Aún no hay videos publicados" />
      ) : (
        <div className="flex flex-col gap-3">
          {vids.map(v => (
            <Card key={v.id}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-black text-[14px] text-gray-800 mb-1">🎬 {v.titulo}</div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {v.sala !== 'Todas' && <SalaBadge sala={v.sala as Sala} />}
                    <span className="text-xs text-gray-400">· {v.hora}hs · {fmtFecha(v.fecha)} · 👩‍🏫 {v.maestra}</span>
                  </div>
                </div>
                <button
                  onClick={() => { deleteVideo(v.id); showToast('Video eliminado'); }}
                  className="w-8 h-8 flex items-center justify-center bg-red-50 rounded-xl border-0 cursor-pointer hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={14} className="text-red-500" />
                </button>
              </div>
              <video
                src={v.video_url}
                controls
                className="w-full rounded-xl max-h-52 bg-black"
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
