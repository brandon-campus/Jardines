import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Nino, RegistroDiario } from '../types';
import { useApp } from '../context/AppContext';

export function AdminKidHistoryPage() {
  const { kidId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();
  
  const [kid, setKid] = useState<Nino | null>(null);
  const [records, setRecords] = useState<RegistroDiario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (kidId) {
      fetchData();
    }
  }, [kidId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [kidRes, recordsRes] = await Promise.all([
        supabase.from('ninos').select('*').eq('id', kidId).single(),
        supabase.from('registros_diarios').select('*').eq('nino_id', kidId).order('fecha', { ascending: false })
      ]);

      if (kidRes.error) throw kidRes.error;
      if (recordsRes.error) throw recordsRes.error;

      setKid(kidRes.data);
      setRecords(recordsRes.data);
    } catch (err: any) {
      showToast(err.message || 'Error cargando historial', 'err');
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="animate-spin text-5xl text-naranja-200">🌼</div>
      </div>
    );
  }

  if (!kid) return null;

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white px-6 py-4 shadow-sm flex items-center gap-4 z-20 shrink-0 border-b border-gray-100">
        <button 
          onClick={() => navigate('/admin')}
          className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-xl transition-colors"
        >
          ←
        </button>
        <div className="flex items-center gap-4 flex-1">
          {kid.avatar ? (
            <img src={kid.avatar} alt={kid.nombre} className="w-12 h-12 rounded-full object-cover shadow-sm" />
          ) : (
            <div className="w-12 h-12 bg-naranja-50 rounded-full flex items-center justify-center text-xl">👶</div>
          )}
          <div>
            <h1 className="font-black text-gray-800 text-lg leading-tight">{kid.nombre} {kid.apellido}</h1>
            <p className="text-sm font-bold text-gray-400">Sala {kid.sala} • Historial de Registros</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {records.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl mb-4 block opacity-50">📝</span>
              <h3 className="text-xl font-bold text-gray-800">Sin registros</h3>
              <p className="text-gray-500">Aún no hay registros diarios cargados para este niño.</p>
            </div>
          ) : (
            records.map((record) => (
              <div key={record.id} className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100">
                <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-naranja-50 text-naranja p-3 rounded-xl">📅</div>
                    <div>
                      <p className="font-black text-gray-800">{new Date(record.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <p className="text-sm text-gray-400 font-bold">Cargado por: {record.maestro || 'Docente'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Alimentación */}
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">🍽️ Alimentación</h4>
                    <ul className="space-y-2 text-sm text-gray-700 font-bold">
                      {record.desayuno && <li>Desayuno: <span className="text-naranja">{record.desayuno}</span></li>}
                      {record.almuerzo && <li>Almuerzo: <span className="text-naranja">{record.almuerzo}</span></li>}
                      {record.merienda && <li>Merienda: <span className="text-naranja">{record.merienda}</span></li>}
                    </ul>
                  </div>

                  {/* Sueño & Estado */}
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">😴 Sueño & Ánimo</h4>
                    <ul className="space-y-2 text-sm text-gray-700 font-bold">
                      {record.siesta_inicio && <li>Siesta: <span className="text-naranja">{record.siesta_inicio} a {record.siesta_fin}</span></li>}
                      {record.estado_animo && <li>Ánimo: <span className="text-naranja">{record.estado_animo}</span></li>}
                    </ul>
                  </div>

                  {/* Higiene & Salud */}
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">🧻 Salud & Higiene</h4>
                    <ul className="space-y-2 text-sm text-gray-700 font-bold">
                      {record.popo !== null && <li>Popó: <span className="text-naranja">{record.popo ? 'Sí' : 'No'}</span></li>}

                    </ul>
                  </div>
                </div>

                {/* Observaciones */}
                {record.observaciones && (
                  <div className="mt-4 bg-yellow-50 p-4 rounded-2xl border border-yellow-100">
                    <h4 className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-1">📝 Observaciones</h4>
                    <p className="text-sm text-gray-800">{record.observaciones}</p>
                  </div>
                )}
                
                {/* Foto */}
                {record.foto_url && (
                  <div className="mt-4">
                    <img src={record.foto_url} alt="Momento del día" className="w-full max-h-64 object-cover rounded-2xl shadow-sm" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
