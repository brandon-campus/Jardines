import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { Jardin } from '../types';
import { uploadFile } from '../lib/storage';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useRef } from 'react';

export function SuperadminPage() {
  const { logout, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'jardines'>('dashboard');
  
  const [jardines, setJardines] = useState<Jardin[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [chartData, setChartData] = useState<number[]>([]);
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    admin_nombre: '',
    admin_email: '',
    admin_password: ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Edit states
  const [editingJardin, setEditingJardin] = useState<Jardin | null>(null);
  const [editFormData, setEditFormData] = useState({
    nombre: '',
    activo: true,
    suscripcion: ''
  });
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null);
  const editLogoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    
    // Fetch jardines
    const { data: jardinesData } = await supabase.from('jardines').select('*');
    if (jardinesData) setJardines(jardinesData as Jardin[]);

    // Fetch users count
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .in('rol', ['docente', 'familia']);
    setTotalUsers(count || 0);

    // Fetch user creation dates for chart
    const { data: profiles } = await supabase
      .from('profiles')
      .select('created_at')
      .in('rol', ['docente', 'familia']);

    if (profiles) {
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const currentMonth = new Date().getMonth();
      // Mostrar últimos 7 meses
      const startMonth = currentMonth - 6;
      
      const labels: string[] = [];
      const heights: number[] = [];
      
      // Calculate cumulative users for each of the last 7 months
      let previousCumulative = 0;
      
      for (let i = 0; i < 7; i++) {
        const m = (startMonth + i + 12) % 12;
        labels.push(monthNames[m]);
        
        // Count users created up to this month
        const usersUpToMonth = profiles.filter(p => {
          const d = new Date(p.created_at);
          // Simple logic: if same year, month <= m. If last year, include all.
          // Note: for a robust MVP we just count users created <= this month.
          return d.getTime() <= new Date(new Date().getFullYear(), m + 1, 0).getTime();
        }).length;
        
        heights.push(usersUpToMonth);
      }

      // Normalize to 10-100% (min 10% for visuals)
      const max = Math.max(...heights, 10);
      const normalized = heights.map(h => Math.max(10, Math.round((h / max) * 100)));
      
      setChartData(normalized);
      setChartLabels(labels);
    }
    
    setLoading(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'jardines', label: 'Jardines Activos', icon: '🏫' },
    { id: 'config', label: 'Configuración', icon: '⚙️' },
  ] as const;

  const handleCreateJardin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let finalLogoUrl = '';
      if (logoFile) {
        showToast('Subiendo logo...', 'ok');
        const url = await uploadFile(logoFile, 'multimedia');
        if (url) finalLogoUrl = url;
        else showToast('Fallo al subir el logo, se creará sin él', 'err');
      }

      const { data, error } = await supabase.functions.invoke('admin-actions', {
        body: {
          action: 'create-jardin',
          payload: { ...formData, logo_url: finalLogoUrl }
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      showToast('Jardín y cuenta administradora creados con éxito');
      setShowModal(false);
      fetchDashboardData(); // Recargar los datos
      setFormData({ nombre: '', admin_nombre: '', admin_email: '', admin_password: '' });
      setLogoFile(null);
    } catch (err: any) {
      showToast(err.message || 'Error al crear el jardín', 'err');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditJardin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJardin) return;
    setIsSubmitting(true);
    
    try {
      let finalLogoUrl = editingJardin.logo_url;
      if (editLogoFile) {
        showToast('Subiendo logo actualizado...', 'ok');
        const url = await uploadFile(editLogoFile, 'multimedia');
        if (url) finalLogoUrl = url;
        else showToast('Fallo al subir el nuevo logo', 'err');
      }

      const { error } = await supabase.from('jardines').update({
        nombre: editFormData.nombre,
        activo: editFormData.activo,
        suscripcion: editFormData.suscripcion,
        logo_url: finalLogoUrl
      }).eq('id', editingJardin.id);

      if (error) throw error;

      showToast('Jardín actualizado correctamente');
      setEditingJardin(null);
      fetchDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Error al actualizar el jardín', 'err');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex w-full h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-naranja rounded-xl flex items-center justify-center text-white text-xl shadow-md">🚀</div>
          <div>
            <h1 className="font-black text-gray-800 text-lg leading-none">Superadmin</h1>
            <p className="text-[10px] uppercase tracking-wider text-naranja font-bold mt-1">Control Maestro</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${
                activeTab === item.id 
                  ? 'bg-naranja-50 text-naranja border border-naranja-100' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-100">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-colors">
            <span className="text-xl">🚪</span> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white px-5 py-4 shadow-sm flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🚀</div>
            <h1 className="font-black text-gray-800">Superadmin</h1>
          </div>
          <button onClick={logout} className="text-2xl opacity-70 hover:opacity-100">🚪</button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="w-full max-w-[1600px] mx-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-black text-gray-800">
                  {activeTab === 'dashboard' ? 'Panel Principal' : 'Jardines Suscriptos'}
                </h2>
                <p className="text-gray-500 mt-1">
                  {activeTab === 'dashboard' ? 'Métricas y estadísticas de la plataforma' : 'Administra los clientes de la plataforma'}
                </p>
              </div>
              
              {activeTab !== 'config' && (
                <button 
                  onClick={() => setShowModal(true)}
                  className="bg-naranja text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-[0_4px_14px_rgba(255,107,53,0.39)] hover:bg-naranja-600 transition-all hover:scale-105 active:scale-95"
                >
                  + Agregar Jardín
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin text-4xl text-naranja-200">🌼</div>
              </div>
            ) : (
              <>
                {/* TAB: DASHBOARD */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    {/* Metric Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">🏢</div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Jardines Activos</p>
                        <p className="text-5xl font-black text-gray-800">{jardines.filter(j => j.activo).length}</p>
                        <p className="text-sm text-green-500 font-bold mt-2">↑ 2 este mes</p>
                      </div>
                      <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">💰</div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">MRR (Ingresos)</p>
                        <p className="text-5xl font-black text-green-500">${jardines.filter(j => j.activo).length * 15}K</p>
                        <p className="text-sm text-green-500 font-bold mt-2">15K por jardín activo</p>
                      </div>
                      <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">👩‍🏫</div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Usuarios Totales</p>
                        <p className="text-5xl font-black text-naranja">{totalUsers}</p>
                        <p className="text-sm text-gray-400 font-bold mt-2">Docentes y Familias</p>
                      </div>
                    </div>

                    {/* Chart mock */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                      <h3 className="text-lg font-bold text-gray-800 mb-6">Crecimiento de Usuarios</h3>
                      <div className="h-64 flex items-end gap-2 md:gap-4">
                        {chartData.map((h, i) => (
                          <div key={i} className="flex-1 bg-naranja-100 rounded-t-xl relative group hover:bg-naranja transition-colors cursor-pointer" style={{ height: `${h}%` }}>
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              {h}%
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-xs font-bold text-gray-400 mt-4">
                        {chartLabels.map((label, i) => (
                          <span key={i}>{label}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB: JARDINES */}
                {activeTab === 'jardines' && (
                  <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    {jardines.length === 0 ? (
                      <div className="text-center py-20 text-gray-400">
                        <p className="text-6xl mb-4">🌱</p>
                        <p className="font-bold text-xl">Aún no hay jardines.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                              <th className="p-4 font-bold">Jardín</th>
                              <th className="p-4 font-bold">ID / UUID</th>
                              <th className="p-4 font-bold">Estado</th>
                              <th className="p-4 font-bold text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {jardines.map(j => (
                              <tr key={j.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    {j.logo_url ? (
                                      <img src={j.logo_url} alt="Logo" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                    ) : (
                                      <div className="w-10 h-10 bg-naranja-50 rounded-full flex items-center justify-center text-lg">🌼</div>
                                    )}
                                    <div>
                                      <p className="font-bold text-gray-800">{j.nombre}</p>
                                      <p className="text-xs text-gray-400">Plan: {j.suscripcion || 'Prueba'}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <p className="text-xs font-mono text-gray-500 bg-gray-100 inline-block px-2 py-1 rounded">{j.id}</p>
                                </td>
                                <td className="p-4">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                    j.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${j.activo ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    {j.activo ? 'Activo' : 'Inactivo'}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  <button 
                                    onClick={() => {
                                      setEditingJardin(j);
                                      setEditFormData({
                                        nombre: j.nombre,
                                        activo: j.activo ?? true,
                                        suscripcion: j.suscripcion || 'prueba'
                                      });
                                      setEditLogoFile(null);
                                    }}
                                    className="text-gray-400 hover:text-naranja transition-colors p-2 bg-white border border-gray-200 rounded-lg shadow-sm"
                                  >
                                    ⚙️ Editar
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: CONFIG */}
                {activeTab === 'config' && (
                  <div className="max-w-2xl">
                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 animate-fade-in">
                      <h3 className="text-lg font-black text-gray-800 mb-6">Configuración Global</h3>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-bold text-gray-600 mb-2">Cuenta Superadmin</label>
                          <input 
                            type="text" 
                            disabled 
                            value="Activa (Privilegios Máximos)" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-green-700 font-bold opacity-90 cursor-not-allowed"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-bold text-gray-600 mb-2">Estado del Sistema</label>
                          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-green-800">Sistemas Operativos</p>
                              <p className="text-xs text-green-600 mt-0.5">Base de datos, Autenticación y Storage al 100%</p>
                            </div>
                            <span className="text-2xl drop-shadow-sm">🟢</span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                          <button 
                            disabled
                            className="w-full bg-gray-100 text-gray-400 font-bold py-3 rounded-xl cursor-not-allowed border border-gray-200"
                          >
                            Opciones Avanzadas
                          </button>
                          <p className="text-xs text-center text-gray-400 mt-3 font-bold">Las configuraciones de base de datos se manejan desde el panel de Supabase.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden bg-white border-t border-gray-100 flex justify-around p-3 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-20 shrink-0">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center gap-1 w-24 transition-all ${activeTab === item.id ? 'text-naranja scale-110' : 'text-gray-400'}`}
            >
              <span className="text-2xl drop-shadow-sm">{item.icon}</span>
              <span className="text-[11px] font-bold">{item.label}</span>
            </button>
          ))}
        </div>
      </main>

      {/* Modal Agregar Jardín */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-gray-800 text-lg">🏫 Nuevo Jardín Maternal</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
            </div>
            
            <form onSubmit={handleCreateJardin} className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
              <div>
                <h4 className="text-sm font-bold text-naranja mb-3 uppercase tracking-wider">Datos de la Institución</h4>
                <div className="space-y-3">
                  <Input 
                    label="Nombre del Jardín" 
                    required 
                    value={formData.nombre}
                    onChange={e => setFormData({...formData, nombre: e.target.value})}
                    placeholder="Ej: Rayito de Sol" 
                  />
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-2">Logo del Jardín (Opcional)</label>
                    <input 
                      type="file" 
                      ref={logoInputRef}
                      className="hidden" 
                      accept="image/*"
                      onChange={e => setLogoFile(e.target.files?.[0] || null)}
                    />
                    <div className="flex items-center gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => logoInputRef.current?.click()}
                      >
                        {logoFile ? 'Cambiar Logo' : '📂 Seleccionar Archivo'}
                      </Button>
                      <span className="text-sm text-gray-500 truncate max-w-[200px]">
                        {logoFile ? logoFile.name : 'Ningún archivo'}
                      </span>
                      {logoFile && (
                        <button type="button" onClick={() => setLogoFile(null)} className="text-red-500 hover:text-red-700 text-xl">✕</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-naranja mb-3 uppercase tracking-wider">Cuenta de la Directora</h4>
                <div className="space-y-3">
                  <Input 
                    label="Nombre Completo" 
                    required 
                    value={formData.admin_nombre}
                    onChange={e => setFormData({...formData, admin_nombre: e.target.value})}
                    placeholder="Ej: Marta Pérez" 
                  />
                  <Input 
                    label="Email de acceso" 
                    type="email" 
                    required 
                    value={formData.admin_email}
                    onChange={e => setFormData({...formData, admin_email: e.target.value})}
                    placeholder="directora@jardin.com" 
                  />
                  <Input 
                    label="Contraseña" 
                    type="password" 
                    required 
                    value={formData.admin_password}
                    onChange={e => setFormData({...formData, admin_password: e.target.value})}
                    placeholder="Mínimo 6 caracteres" 
                    minLength={6}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? 'Creando...' : 'Crear Jardín'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Jardín */}
      {editingJardin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-gray-800 text-lg">⚙️ Editar Jardín</h3>
              <button onClick={() => setEditingJardin(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
            </div>
            
            <form onSubmit={handleEditJardin} className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
              <Input 
                label="Nombre del Jardín" 
                required 
                value={editFormData.nombre}
                onChange={e => setEditFormData({...editFormData, nombre: e.target.value})}
              />

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Logo del Jardín</label>
                <input 
                  type="file" 
                  ref={editLogoInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={e => setEditLogoFile(e.target.files?.[0] || null)}
                />
                <div className="flex items-center gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => editLogoInputRef.current?.click()}
                  >
                    {editLogoFile ? 'Cambiar Nuevo Logo' : '📂 Subir Nuevo Logo'}
                  </Button>
                  <span className="text-sm text-gray-500 truncate max-w-[200px]">
                    {editLogoFile ? editLogoFile.name : (editingJardin.logo_url ? 'Manteniendo logo actual' : 'Sin logo')}
                  </span>
                  {editLogoFile && (
                    <button type="button" onClick={() => setEditLogoFile(null)} className="text-red-500 hover:text-red-700 text-xl">✕</button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Estado del Jardín</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="estado" 
                      checked={editFormData.activo} 
                      onChange={() => setEditFormData({...editFormData, activo: true})} 
                      className="w-4 h-4 text-naranja border-gray-300 focus:ring-naranja"
                    />
                    <span className="text-sm font-bold text-green-600">Activo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="estado" 
                      checked={!editFormData.activo} 
                      onChange={() => setEditFormData({...editFormData, activo: false})} 
                      className="w-4 h-4 text-naranja border-gray-300 focus:ring-naranja"
                    />
                    <span className="text-sm font-bold text-red-600">Inactivo</span>
                  </label>
                </div>
                <p className="text-xs text-gray-400 mt-1">Si marcas Inactivo, ningún usuario podrá usar la plataforma.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">Plan de Suscripción</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-naranja focus:bg-white transition-all text-sm font-bold text-gray-800"
                  value={editFormData.suscripcion}
                  onChange={e => setEditFormData({...editFormData, suscripcion: e.target.value})}
                >
                  <option value="prueba">Prueba Gratuita</option>
                  <option value="premium">Premium</option>
                </select>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setEditingJardin(null)}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
