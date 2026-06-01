import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppLayout } from '../components/layout/AppLayout';
import { TeacherHeader } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { SectionHeader } from '../components/ui/Card';
import { Input, Textarea } from '../components/ui/Input';
import { SalaBadge } from '../components/ui/Badge';
import { COMIDA_OPTIONS, ANIMO_OPTIONS, POPO_OPTIONS, COMIDAS_DEL_DIA } from '../types';
import type { ComidaOpcion, EstadoAnimo, PopoOpcion } from '../types';
import { horaActual } from '../lib/utils';
import { TODAY } from '../data/mock';

export function RecordFormPage() {
  const { kidId } = useParams<{ kidId: string }>();
  const { state, saveRecord, showToast } = useApp();
  const navigate = useNavigate();

  const kid = state.kids.find(k => k.id === kidId);
  const existing = state.records.find(r => r.nino_id === kidId && r.fecha === TODAY);

  // Initialize form from existing record
  const [desayuno, setDesayuno] = useState<ComidaOpcion | null>(existing?.desayuno ?? null);
  const [almuerzo, setAlmuerzo] = useState<ComidaOpcion | null>(existing?.almuerzo ?? null);
  const [merienda, setMerienda] = useState<ComidaOpcion | null>(existing?.merienda ?? null);
  const [popo, setPopo] = useState<PopoOpcion>(existing?.popo ?? 'no');
  const [pisSolo, setPisSolo] = useState<boolean | null>(existing?.control_pis ?? null);
  const [siestaDesde, setSiestaDesde] = useState(existing?.siesta_inicio ?? '');
  const [siestaHasta, setSiestaHasta] = useState(existing?.siesta_fin ?? '');
  const [animo, setAnimo] = useState<EstadoAnimo | null>(existing?.estado_animo ?? null);
  const [temp, setTemp] = useState(existing?.temperatura ?? '');
  const [medicacion, setMedicacion] = useState(existing?.medicacion ?? '');
  const [obs, setObs] = useState(existing?.observaciones ?? '');
  const [fotoUrl, setFotoUrl] = useState<string | null>(existing?.foto_url ?? null);
  const fotoInputRef = useRef<HTMLInputElement>(null);

  const fotoMaestro = state.user?.nombre.replace('Maestra ', '') ?? 'Docente';

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => setFotoUrl(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const calcDur = () => {
    if (!siestaDesde || !siestaHasta) return null;
    const [h1, m1] = siestaDesde.split(':').map(Number);
    const [h2, m2] = siestaHasta.split(':').map(Number);
    const t = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (t <= 0) return null;
    return `${Math.floor(t / 60)}h ${t % 60}m`;
  };

  const handleSave = () => {
    if (!kid) return;
    saveRecord({
      nino_id: kid.id,
      docente_id: state.user?.id ?? 'u1',
      fecha: TODAY,
      hora: horaActual(),
      desayuno, almuerzo, merienda,
      popo,
      control_pis: pisSolo ?? false,
      siesta_inicio: siestaDesde,
      siesta_fin: siestaHasta,
      estado_animo: animo,
      temperatura: temp,
      medicacion,
      foto_url: fotoUrl,
      observaciones: obs,
      maestro: fotoMaestro,
    });
    showToast(`✅ Registro de ${kid.nombre} guardado`);
    navigate('/teacher');
  };

  if (!kid) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="text-5xl mb-3">😕</div>
            <p className="font-bold text-gray-500">Niño no encontrado</p>
            <Button className="mt-4" onClick={() => navigate('/teacher')}>Volver</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const duracion = calcDur();

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
        <div className="flex items-center gap-4">
          <span className="text-5xl">{kid.avatar}</span>
          <div>
            <h2 className="text-xl font-black text-white">
              {kid.nombre} {kid.apellido}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <SalaBadge sala={kid.sala} />
              <span className="text-white/80 text-[12px]">
                {existing ? '✏️ Editando registro' : '📝 Nuevo registro'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 pb-12 overflow-y-auto max-w-5xl mx-auto w-full md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-12 gap-y-6">
          
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-6">
            <div>
              {/* ALIMENTACIÓN */}
              <SectionHeader icon="🍽️" title="Alimentación" />
              <div className="flex flex-col gap-3">
                {COMIDAS_DEL_DIA.map(({ key, label, icon }) => {
                  const valMap = { desayuno, almuerzo, merienda };
                  const setMap = { desayuno: setDesayuno, almuerzo: setAlmuerzo, merienda: setMerienda };
                  const val = valMap[key];
                  const setter = setMap[key];
                  return (
                    <div key={key}>
                      <div className="text-[13px] font-bold text-gray-600 mb-2">
                        {icon} {label}
                      </div>
                      <div className="flex gap-2">
                        {COMIDA_OPTIONS.map(opt => (
                          <button
                            key={opt.v}
                            onClick={() => setter(val === opt.v ? null : opt.v)}
                            className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl border-2 font-bold text-sm cursor-pointer transition-all duration-150"
                            style={
                              val === opt.v
                                ? { borderColor: opt.color, background: opt.bg, color: opt.color }
                                : { borderColor: '#e5e7eb', background: '#fff', color: '#9ca3af' }
                            }
                          >
                            <span className="text-xl">{opt.e}</span>
                            <span className="text-xs">{opt.l}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              {/* POPÓ */}
              <SectionHeader icon="💩" title="Popó" />
              <p className="text-[13px] text-gray-400 mb-2 font-semibold">¿Hizo popó?</p>
              <div className="flex gap-2">
                {POPO_OPTIONS.map(opt => (
                  <button
                    key={opt.v}
                    onClick={() => setPopo(opt.v)}
                    className="flex-1 py-3 rounded-xl border-2 font-bold text-sm cursor-pointer transition-all duration-150"
                    style={
                      popo === opt.v
                        ? { borderColor: '#f59e0b', background: '#fef3c7', color: '#92400e' }
                        : { borderColor: '#e5e7eb', background: '#fff', color: '#9ca3af' }
                    }
                  >
                    <div className="text-xl mb-0.5">{opt.e}</div>
                    <div className="text-xs">{opt.l}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              {/* PIS */}
              <p className="text-[15px] font-bold text-gray-700 mb-2 mt-2">💧 ¿Hizo pis solo/a?</p>
              <div className="flex gap-3">
                {[
                  { v: true, label: '✅ Sí, solo/a' },
                  { v: false, label: '❌ Con ayuda' },
                ].map(({ v, label }) => (
                  <button
                    key={String(v)}
                    onClick={() => setPisSolo(pisSolo === v ? null : v)}
                    className="flex-1 py-3 rounded-xl border-2 font-bold text-sm cursor-pointer transition-all duration-150"
                    style={
                      pisSolo === v
                        ? { borderColor: '#FF6B35', background: '#fff5eb', color: '#FF6B35' }
                        : { borderColor: '#e5e7eb', background: '#fff', color: '#9ca3af' }
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-6">
            <div>
              {/* SIESTA */}
              <SectionHeader icon="😴" title="Siesta" />
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    label="Desde"
                    type="time"
                    value={siestaDesde}
                    onChange={e => setSiestaDesde(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    label="Hasta"
                    type="time"
                    value={siestaHasta}
                    onChange={e => setSiestaHasta(e.target.value)}
                  />
                </div>
              </div>
              {duracion && (
                <p className="text-[13px] text-green-600 font-bold mt-2">⏱️ Duración: {duracion}</p>
              )}
            </div>

            <div>
              {/* ÁNIMO */}
              <SectionHeader icon="😊" title="Estado de Ánimo" />
              <div className="flex gap-2 flex-wrap">
                {ANIMO_OPTIONS.map(opt => (
                  <button
                    key={opt.v}
                    onClick={() => setAnimo(animo === opt.v ? null : opt.v)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 font-bold text-sm cursor-pointer transition-all duration-150"
                    style={
                      animo === opt.v
                        ? { borderColor: '#FF6B35', background: '#fff5eb', color: '#FF6B35' }
                        : { borderColor: '#e5e7eb', background: '#fff', color: '#9ca3af' }
                    }
                  >
                    <span>{opt.e}</span>
                    <span className="text-xs">{opt.l}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              {/* SALUD */}
              <SectionHeader icon="🌡️" title="Salud" />
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    label="Temperatura (°C)"
                    type="number"
                    step="0.1"
                    min="35"
                    max="42"
                    placeholder="36.5"
                    value={temp}
                    onChange={e => setTemp(e.target.value)}
                  />
                </div>
                <div className="flex-[2]">
                  <Input
                    label="Medicación"
                    placeholder="Ej: Ibuprofeno 5ml — 10:00hs"
                    value={medicacion}
                    onChange={e => setMedicacion(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              {/* FOTO */}
              <SectionHeader icon="📸" title="Foto del Día" />
              <input
                type="file"
                ref={fotoInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleFoto}
              />
              {!fotoUrl ? (
                <button
                  onClick={() => fotoInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-naranja-300 rounded-2xl py-7 px-4 text-center cursor-pointer hover:bg-naranja-50 transition-colors bg-naranja-50/50"
                >
                  <div className="text-4xl mb-2">📷</div>
                  <div className="font-black text-[15px] text-naranja mb-1">Subir foto del día</div>
                  <div className="text-[13px] text-gray-400 mb-3">PNG, JPG o WebP</div>
                  <div className="inline-flex items-center gap-2 bg-gradient-to-br from-naranja to-naranja-400 text-white rounded-xl px-4 py-2 font-bold text-sm">
                    <Camera size={14} />
                    Elegir foto
                  </div>
                </button>
              ) : (
                <div>
                  <img
                    src={fotoUrl}
                    alt="Foto del día"
                    className="w-full rounded-2xl max-h-60 object-cover border-3 border-naranja-200"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => fotoInputRef.current?.click()}
                      className="flex-1 py-2 bg-naranja text-white rounded-xl font-bold text-sm border-0 cursor-pointer hover:brightness-105 transition-all"
                    >
                      🔄 Cambiar
                    </button>
                    <button
                      onClick={() => setFotoUrl(null)}
                      className="flex-1 py-2 bg-red-50 text-red-500 border-2 border-red-200 rounded-xl font-bold text-sm cursor-pointer hover:bg-red-100 transition-colors"
                    >
                      🗑️ Quitar
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              {/* OBSERVACIONES */}
              <SectionHeader icon="📝" title="Observaciones" />
              <Textarea
                rows={4}
                placeholder="¿Cómo estuvo el día?"
                value={obs}
                onChange={e => setObs(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Button fullWidth size="lg" className="mt-8 md:mt-10 max-w-md mx-auto block" onClick={handleSave}>
          💾 Guardar Registro
        </Button>
      </div>

    </AppLayout>
  );
}
