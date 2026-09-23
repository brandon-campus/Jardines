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
import { COMIDA_OPTIONS, ANIMO_OPTIONS, POPO_OPTIONS, COMIDAS_DEL_DIA, COMO_OPTIONS } from '../types';
import type { ComidaOpcion, EstadoAnimo, PopoOpcion, ComoOpcion, TomaMamadera } from '../types';
import { horaActual } from '../lib/utils';
import { uploadFile } from '../lib/storage';
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
  
  const [tomasMamadera, setTomasMamadera] = useState<TomaMamadera[]>(Array.isArray(existing?.mamadera) ? existing.mamadera : []);
  const [nuevaHoraMamadera, setNuevaHoraMamadera] = useState('');
  const [nuevoMlMamadera, setNuevoMlMamadera] = useState('');

  const handleAddMamadera = () => {
    if (!nuevaHoraMamadera || !nuevoMlMamadera) return;
    setTomasMamadera([...tomasMamadera, { hora: nuevaHoraMamadera, ml: Number(nuevoMlMamadera) }]);
    setNuevaHoraMamadera('');
    setNuevoMlMamadera('');
  };

  const handleRemoveMamadera = (idx: number) => {
    setTomasMamadera(tomasMamadera.filter((_, i) => i !== idx));
  };

  const [popo, setPopo] = useState<PopoOpcion>(existing?.popo ?? 'no');
  const [popoComo, setPopoComo] = useState<ComoOpcion | null>(existing?.popo_como ?? null);
  const [pis, setPis] = useState<boolean | null>(existing?.control_pis ?? null);
  const [pisComo, setPisComo] = useState<ComoOpcion | null>(existing?.pis_como ?? null);
  const [siestaDesde, setSiestaDesde] = useState(existing?.siesta_inicio ?? '');
  const [siestaHasta, setSiestaHasta] = useState(existing?.siesta_fin ?? '');
  const [animo, setAnimo] = useState<EstadoAnimo | null>(existing?.estado_animo ?? null);
  const [temp, setTemp] = useState(existing?.temperatura ?? '');
  const [medicacion, setMedicacion] = useState(existing?.medicacion ?? '');
  const [obs, setObs] = useState(existing?.observaciones ?? '');
  const [fotoUrl, setFotoUrl] = useState<string | null>(existing?.foto_url ?? null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fotoInputRef = useRef<HTMLInputElement>(null);

  const fotoMaestro = state.user?.nombre.replace('Maestra ', '') ?? 'Docente';

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFotoFile(f);
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

  const handleSave = async () => {
    if (!kid) return;
    setIsSaving(true);
    
    let finalFotoUrl = fotoUrl;
    if (fotoFile) {
      showToast('Subiendo foto...', 'ok');
      const uploadedUrl = await uploadFile(fotoFile, 'fotos');
      if (uploadedUrl) {
        finalFotoUrl = uploadedUrl;
      } else {
        showToast('Error al subir la foto', 'err');
      }
    }

    await saveRecord({
      nino_id: kid.id,
      docente_id: state.user?.id ?? 'u1',
      fecha: TODAY,
      hora: horaActual(),
      desayuno, almuerzo, merienda,
      mamadera: tomasMamadera,
      popo,
      popo_como: popoComo,
      control_pis: pis ?? false,
      pis_como: pisComo,
      siesta_inicio: siestaDesde,
      siesta_fin: siestaHasta,
      estado_animo: animo,
      temperatura: temp,
      medicacion,
      foto_url: finalFotoUrl,
      observaciones: obs,
      maestro: fotoMaestro,
    });
    setIsSaving(false);
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
          {kid.avatar && kid.avatar.startsWith('http') ? (
            <img src={kid.avatar} alt={kid.nombre} className="w-16 h-16 rounded-full object-cover shadow-sm border-2 border-white/20 flex-shrink-0 bg-white" />
          ) : (
            <span className="text-5xl w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 border border-white/10">
              {kid.avatar || '👶'}
            </span>
          )}
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
                  const val = valMap[key as keyof typeof valMap];
                  const setter = setMap[key as keyof typeof setMap];
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

            {/* MAMADERA */}
            <div>
              <SectionHeader icon="🍼" title="Mamadera de hoy" />
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
                <div className="flex gap-3 mb-4 items-end">
                  <div className="flex-1">
                    <label className="text-[11px] text-gray-400 font-bold ml-1 mb-1 block uppercase tracking-wide">Hora</label>
                    <Input
                      type="time"
                      value={nuevaHoraMamadera}
                      onChange={e => setNuevaHoraMamadera(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[11px] text-gray-400 font-bold ml-1 mb-1 block uppercase tracking-wide">ml</label>
                    <Input
                      type="number"
                      placeholder="ml"
                      value={nuevoMlMamadera}
                      onChange={e => setNuevoMlMamadera(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={handleAddMamadera}
                    disabled={!nuevaHoraMamadera || !nuevoMlMamadera}
                    className="w-12 h-[46px] bg-[#7c3aed] text-white rounded-xl flex items-center justify-center font-bold text-2xl hover:bg-violet-700 disabled:opacity-50 transition-colors flex-shrink-0"
                  >
                    +
                  </button>
                </div>

                {tomasMamadera.length > 0 && (
                  <div className="flex flex-col gap-1 mb-5">
                    {tomasMamadera.map((t, i) => (
                      <div key={i} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                        <span className="text-gray-500 text-[15px]">Hora {t.hora}</span>
                        <div className="flex items-center gap-6">
                          <span className="font-black text-gray-800 text-[16px]">{t.ml} ml</span>
                          <button onClick={() => handleRemoveMamadera(i)} className="text-gray-300 hover:text-gray-400 transition-colors pb-0.5">
                            <X size={20} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-[#f5f3ff] text-violet-800 rounded-2xl px-4 py-3.5 flex justify-between items-center font-medium text-[15px]">
                  <span className="text-gray-700">Total</span>
                  <span className="text-[#7c3aed] font-black text-lg">
                    {tomasMamadera.reduce((acc, curr) => acc + Number(curr.ml), 0)} ml <span className="font-normal text-gray-600 text-[15px]">· {tomasMamadera.length} tomas</span>
                  </span>
                </div>
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
                    onClick={() => {
                      setPopo(opt.v);
                      if (opt.v === 'no') setPopoComo(null);
                    }}
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
              {popo !== 'no' && (
                <div className="mt-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-[13px] text-gray-500 mb-2 font-semibold">¿Cómo lo hizo?</p>
                  <div className="flex gap-2">
                    {COMO_OPTIONS.map(opt => (
                      <button
                        key={opt.v}
                        onClick={() => setPopoComo(opt.v)}
                        className="flex-1 py-2 rounded-lg border-2 font-bold text-xs cursor-pointer transition-all duration-150"
                        style={
                          popoComo === opt.v
                            ? { borderColor: '#f59e0b', background: '#fef3c7', color: '#92400e' }
                            : { borderColor: '#e5e7eb', background: '#fff', color: '#9ca3af' }
                        }
                      >
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              {/* PIS */}
              <SectionHeader icon="💧" title="Pis" />
              <p className="text-[13px] text-gray-400 mb-2 font-semibold">¿Hizo pis?</p>
              <div className="flex gap-3">
                {[
                  { v: true, label: '✅ Sí' },
                  { v: false, label: '🚫 No' },
                ].map(({ v, label }) => (
                  <button
                    key={String(v)}
                    onClick={() => {
                      setPis(pis === v ? null : v);
                      if (v === false) setPisComo(null);
                    }}
                    className="flex-1 py-3 rounded-xl border-2 font-bold text-sm cursor-pointer transition-all duration-150"
                    style={
                      pis === v
                        ? { borderColor: '#FF6B35', background: '#fff5eb', color: '#FF6B35' }
                        : { borderColor: '#e5e7eb', background: '#fff', color: '#9ca3af' }
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
              {pis && (
                <div className="mt-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-[13px] text-gray-500 mb-2 font-semibold">¿Cómo lo hizo?</p>
                  <div className="flex gap-2">
                    {COMO_OPTIONS.map(opt => (
                      <button
                        key={opt.v}
                        onClick={() => setPisComo(opt.v)}
                        className="flex-1 py-2 rounded-lg border-2 font-bold text-xs cursor-pointer transition-all duration-150"
                        style={
                          pisComo === opt.v
                            ? { borderColor: '#FF6B35', background: '#fff5eb', color: '#FF6B35' }
                            : { borderColor: '#e5e7eb', background: '#fff', color: '#9ca3af' }
                        }
                      >
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
                      onClick={() => {
                        setFotoUrl(null);
                        setFotoFile(null);
                      }}
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

        <Button fullWidth size="lg" className="mt-8 md:mt-10 max-w-md mx-auto block" onClick={handleSave} disabled={isSaving}>
          {isSaving ? '⏳ Guardando...' : '💾 Guardar Registro'}
        </Button>
      </div>

    </AppLayout>
  );
}
