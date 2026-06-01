import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export function ConfigPage() {
  const { state, updateJardin, showToast } = useApp();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState(state.jardin.nombre);
  const [logoUrl, setLogoUrl] = useState<string | null>(state.jardin.logo_url);
  const logoRef = useRef<HTMLInputElement>(null);

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => setLogoUrl(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleSave = () => {
    if (!nombre.trim()) { showToast('⚠️ El nombre es obligatorio', 'err'); return; }
    updateJardin({ nombre, logo_url: logoUrl });
    showToast('✅ Cambios guardados');
    navigate('/teacher');
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="bg-gradient-to-br from-naranja to-naranja-400 px-4 pt-4 pb-6 rounded-b-3xl shadow-[0_8px_24px_rgba(255,107,53,0.30)]">
        <button
          onClick={() => navigate('/teacher')}
          className="mb-3 px-4 py-2 bg-white/20 text-white rounded-xl text-sm font-bold border-0 cursor-pointer hover:bg-white/30 transition-colors"
        >
          ← Volver
        </button>
        <h2 className="text-xl font-black text-white">⚙️ Mi Jardín</h2>
        <p className="text-white/75 text-sm mt-0.5">Configuración del jardín</p>
      </div>

      <div className="px-4 py-5 flex flex-col gap-5">
        {/* Preview card */}
        <div
          className="rounded-3xl p-6 text-center"
          style={{ background: 'linear-gradient(135deg, #FF6B35, #FF9A3C)' }}
        >
          <div
            className="w-20 h-20 rounded-full bg-white/20 border-4 border-dashed border-white/50 flex items-center justify-center text-4xl mx-auto mb-3 overflow-hidden"
          >
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover rounded-full" />
            ) : '🌼'}
          </div>
          <div className="text-xl font-black text-white">{nombre || 'Jardín Maternal'}</div>
          <div className="text-white/70 text-xs mt-1">Vista previa</div>
        </div>

        {/* Nombre */}
        <Card>
          <div className="font-black text-sm text-gray-700 mb-3">🏫 Nombre del Jardín</div>
          <Input
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Ej: Jardín Safari"
          />
        </Card>

        {/* Logo */}
        <Card>
          <div className="font-black text-sm text-gray-700 mb-3">🖼️ Logo del Jardín</div>
          <input
            type="file"
            ref={logoRef}
            accept="image/*"
            className="hidden"
            onChange={handleLogo}
          />

          {!logoUrl ? (
            <button
              onClick={() => logoRef.current?.click()}
              className="w-full border-2 border-dashed border-naranja-300 rounded-2xl py-7 px-4 text-center cursor-pointer hover:bg-naranja-50 transition-colors bg-naranja-50/50"
            >
              <div className="text-4xl mb-2">📷</div>
              <div className="font-black text-[15px] text-naranja mb-1">Tocá para subir el logo</div>
              <div className="text-[13px] text-gray-400 mb-3">PNG, JPG o SVG</div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-br from-naranja to-naranja-400 text-white rounded-xl px-4 py-2 font-bold text-sm">
                <Upload size={14} />
                Elegir imagen
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4 border-2 border-gray-100">
              <img
                src={logoUrl}
                alt="Logo"
                className="w-16 h-16 rounded-xl object-cover border-3 border-naranja-200 flex-shrink-0"
              />
              <div className="flex-1">
                <div className="font-black text-green-700 text-sm mb-2">✅ Logo cargado</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => logoRef.current?.click()}
                    className="px-3 py-1.5 bg-naranja text-white rounded-xl text-xs font-bold border-0 cursor-pointer hover:brightness-105 transition-all"
                  >
                    🔄 Cambiar
                  </button>
                  <button
                    onClick={() => setLogoUrl(null)}
                    className="px-3 py-1.5 bg-red-50 text-red-500 border border-red-200 rounded-xl text-xs font-bold cursor-pointer hover:bg-red-100 transition-colors"
                  >
                    🗑️ Quitar
                  </button>
                </div>
              </div>
            </div>
          )}
        </Card>

        <Button fullWidth size="lg" onClick={handleSave}>
          <Save size={16} />
          Guardar Cambios
        </Button>
      </div>
    </AppLayout>
  );
}
