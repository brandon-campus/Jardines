import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { Usuario, Nino, SALAS } from '../types';
import { Input, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function AdminPage() {
  const { state, logout, showToast } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'docentes' | 'familias' | 'niños' | 'config'>('docentes');
  
  const [users, setUsers] = useState<Usuario[]>([]);
  const [docenteSalas, setDocenteSalas] = useState<Record<string, string[]>>({});
  const [kids, setKids] = useState<Nino[]>([]);
  const [loading, setLoading] = useState(true);

  // User Creation & Management Modal states
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRole, setUserRole] = useState<'docente' | 'familia'>('docente');
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    salas: [] as string[],
    child_id: ''
  });

  // Kid Modal states
  const [showKidModal, setShowKidModal] = useState(false);
  const [editingKid, setEditingKid] = useState<Nino | null>(null);
  const [kidFormData, setKidFormData] = useState({
    nombre: '',
    apellido: '',
    sala: SALAS[0],
    fecha_nacimiento: '',
    alergias: ''
  });
  const [kidAvatarFile, setKidAvatarFile] = useState<File | null>(null);
  const kidAvatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUsers();
    fetchAllKids();
  }, []);

  const fetchAllKids = async () => {
    const { data } = await supabase
      .from('ninos')
      .select('*')
      .eq('jardin_id', state.user?.jardin_id);
    if (data) setKids(data as Nino[]);
  };

  const fetchUsers = async () => {
    setLoading(true);
    // Fetch profiles that belong to the same jardin as the admin
    const { data: profilesData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('jardin_id', state.user?.jardin_id)
      .in('rol', ['docente', 'familia']);
      
    if (!error && profilesData) {
      setUsers(profilesData as any);
      
      // Fetch salas
      const { data: salasData } = await supabase
        .from('docente_sala')
        .select('*')
        .eq('jardin_id', state.user?.jardin_id);
        
      if (salasData) {
        const salasMap: Record<string, string[]> = {};
        salasData.forEach(s => {
          if (!salasMap[s.docente_id]) salasMap[s.docente_id] = [];
          salasMap[s.docente_id].push(s.sala);
        });
        setDocenteSalas(salasMap);
      }
    }
    setLoading(false);
  };

  const docentes = users.filter(u => u.rol === 'docente');
  const familias = users.filter(u => u.rol === 'familia');

  const navItems = [
    { id: 'docentes', label: 'Equipo Docente', icon: '👩‍🏫' },
    { id: 'familias', label: 'Familias Activas', icon: '👨‍👩‍👧' },
    { id: 'niños', label: 'Niños', icon: '👶' },
    { id: 'config', label: 'Configuración', icon: '⚙️' },
  ] as const;

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingUser) {
        // Only updating salas for existing docente
        if (editingUser.rol === 'docente') {
          // Delete old
          await supabase.from('docente_sala').delete().eq('docente_id', editingUser.id);
          // Insert new
          if (formData.salas.length > 0) {
            const inserts = formData.salas.map(s => ({
              docente_id: editingUser.id,
              jardin_id: state.user?.jardin_id,
              sala: s
            }));
            await supabase.from('docente_sala').insert(inserts);
          }
          showToast('Salas actualizadas con éxito');
        } else {
           // Si se quisiera editar algo de familia, iría acá
           showToast('No se puede editar este usuario por ahora');
        }
      } else {
        // Creating new user
        const payload = {
          action: 'create-user',
          payload: {
            ...formData,
            rol: userRole,
            jardin_id: state.user?.jardin_id
          }
        };

        const { data, error } = await supabase.functions.invoke('admin-actions', {
          body: payload
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error);

        showToast(`${userRole === 'docente' ? 'Docente' : 'Familia'} cread@ con éxito`);
      }

      setShowModal(false);
      fetchUsers(); // Recargar la lista
    } catch (err: any) {
      showToast(err.message || 'Error al guardar el usuario', 'err');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveKid = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let avatarUrl = editingKid?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + kidFormData.nombre;
      
      if (kidAvatarFile) {
        showToast('Subiendo foto...', 'ok');
        // We import uploadFile dynamically or ensure it's imported at the top
        const { uploadFile } = await import('../lib/storage');
        const url = await uploadFile(kidAvatarFile, 'fotos');
        if (url) avatarUrl = url;
        else showToast('Fallo al subir foto, se usará avatar por defecto', 'err');
      }

      const kidPayload = {
        jardin_id: state.user?.jardin_id,
        nombre: kidFormData.nombre,
        apellido: kidFormData.apellido,
        sala: kidFormData.sala,
        fecha_nacimiento: kidFormData.fecha_nacimiento || null,
        alergias: kidFormData.alergias || null,
        avatar: avatarUrl,
      };

      if (editingKid) {
        const { error } = await supabase.from('ninos').update(kidPayload).eq('id', editingKid.id);
        if (error) throw error;
        showToast('Niño actualizado con éxito');
      } else {
        const { error } = await supabase.from('ninos').insert([{ ...kidPayload, activo: true }]);
        if (error) throw error;
        showToast('Niño creado con éxito');
      }

      setShowKidModal(false);
      fetchAllKids();
    } catch (err: any) {
      showToast(err.message || 'Error guardando niño', 'err');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleKidActive = async (kid: Nino) => {
    try {
      const { error } = await supabase.from('ninos').update({ activo: !kid.activo }).eq('id', kid.id);
      if (error) throw error;
      showToast(`Niño ${kid.activo ? 'dado de baja' : 'reactivado'} correctamente`);
      fetchAllKids();
    } catch (err: any) {
      showToast('Error al cambiar estado: ' + err.message, 'err');
    }
  };

  return (
    <div className="flex w-full h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          {state.jardin.logo_url ? (
            <img src={state.jardin.logo_url} alt="Logo" className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-200" />
          ) : (
            <div className="w-10 h-10 bg-naranja rounded-xl flex items-center justify-center text-white text-xl shadow-md">🌼</div>
          )}
          <div>
            <h1 className="font-black text-gray-800 text-sm leading-none truncate max-w-[150px]">{state.jardin.nombre}</h1>
            <p className="text-[10px] uppercase tracking-wider text-naranja font-bold mt-1">Portal Directora</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
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
          <div className="mb-4 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">👩‍💼</div>
             <div className="truncate">
               <p className="text-xs font-bold text-gray-800 truncate">{state.user?.nombre}</p>
               <p className="text-[10px] text-gray-500 truncate">{state.user?.email}</p>
             </div>
          </div>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100">
            <span className="text-lg">🚪</span> Salir
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white px-5 py-4 shadow-sm flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-3">
            {state.jardin.logo_url ? (
              <img src={state.jardin.logo_url} alt="Logo" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="text-2xl">🌼</div>
            )}
            <h1 className="font-black text-gray-800 text-lg truncate">{state.jardin.nombre}</h1>
          </div>
          <button onClick={logout} className="text-2xl opacity-70 hover:opacity-100">🚪</button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="w-full max-w-[1600px] mx-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-black text-gray-800">
                  {activeTab === 'docentes' && 'Equipo Docente'}
                  {activeTab === 'familias' && 'Familias Registradas'}
                  {activeTab === 'niños' && 'Alumnos del Jardín'}
                  {activeTab === 'config' && 'Configuración del Jardín'}
                </h2>
                <p className="text-gray-500 mt-1">
                  {activeTab === 'docentes' && `Gestiona a las maestras y personal de tu jardín (${docentes.length} registradas)`}
                  {activeTab === 'familias' && `Gestiona el acceso de los padres a la plataforma (${familias.length} registradas)`}
                  {activeTab === 'niños' && `Administra los perfiles de los niños (${kids.length} registrados)`}
                  {activeTab === 'config' && 'Actualiza el nombre, logo e información de tu institución'}
                </p>
              </div>
              
              {activeTab !== 'config' && (
                <button 
                  onClick={() => {
                    if (activeTab === 'niños') {
                      setEditingKid(null);
                      setKidFormData({ nombre: '', apellido: '', sala: SALAS[0], fecha_nacimiento: '', alergias: '' });
                      setKidAvatarFile(null);
                      setShowKidModal(true);
                    } else {
                      setEditingUser(null);
                      setFormData({ nombre: '', email: '', password: '', salas: [], child_id: '' });
                      setUserRole(activeTab === 'docentes' ? 'docente' : 'familia');
                      setShowModal(true);
                    }
                  }}
                  className="bg-naranja text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-[0_4px_14px_rgba(255,107,53,0.39)] hover:bg-naranja-600 transition-all hover:scale-105 active:scale-95"
                >
                  + Agregar {activeTab === 'docentes' ? 'Docente' : activeTab === 'familias' ? 'Familia' : 'Niño'}
                </button>
              )}
            </div>
            
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin text-4xl text-naranja-200">🌼</div>
              </div>
            ) : (
              <>
                {(activeTab === 'docentes' || activeTab === 'familias') && (
                  <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    {(activeTab === 'docentes' ? docentes : familias).length === 0 ? (
                      <div className="text-center py-20 text-gray-400">
                        <p className="text-6xl mb-4">👻</p>
                        <p className="font-bold text-xl">No hay registros aún.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                              <th className="p-4 font-bold">Usuario</th>
                              <th className="p-4 font-bold hidden sm:table-cell">Rol</th>
                              <th className="p-4 font-bold hidden md:table-cell">ID Interno</th>
                              <th className="p-4 font-bold text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {(activeTab === 'docentes' ? docentes : familias).map(user => (
                              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm border border-gray-100 ${
                                      user.rol === 'docente' ? 'bg-orange-50' : 'bg-blue-50'
                                    }`}>
                                      {user.rol === 'docente' ? '👩‍🏫' : '👨‍👩‍👧'}
                                    </div>
                                    <div>
                                      <p className="font-bold text-gray-800">{user.nombre}</p>
                                      {/* Mock email display since we don't fetch email from auth.users currently */}
                                      <p className="text-xs text-gray-400">Registrado</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4 hidden sm:table-cell">
                                  {user.rol === 'docente' ? (
                                    <div className="flex flex-wrap gap-1">
                                      {(docenteSalas[user.id] || []).map(sala => (
                                        <span className="inline-block bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-100">
                                          {sala as string}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-700">
                                      {user.rol}
                                    </span>
                                  )}
                                </td>
                                <td className="p-4 hidden md:table-cell">
                                  <p className="text-xs font-mono text-gray-400 bg-gray-50 inline-block px-2 py-1 rounded border border-gray-100">
                                    {user.id.substring(0,8)}...
                                  </p>
                                </td>
                                <td className="p-4 text-right">
                                  <button 
                                    onClick={() => {
                                      if (user.rol === 'docente') {
                                        setEditingUser(user);
                                        setUserRole('docente');
                                        setFormData({ ...formData, salas: docenteSalas[user.id] || [] });
                                        setShowModal(true);
                                      } else {
                                        showToast('La gestión de familias estará disponible pronto');
                                      }
                                    }}
                                    className="text-gray-400 hover:text-naranja transition-colors p-2 bg-white border border-gray-200 rounded-lg shadow-sm font-bold text-xs flex items-center gap-1 ml-auto"
                                  >
                                    <span>⚙️</span> <span className="hidden sm:inline">Gestionar</span>
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

                {activeTab === 'niños' && (
                  <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    {kids.length === 0 ? (
                      <div className="text-center py-20 text-gray-400">
                        <p className="text-6xl mb-4">👶</p>
                        <p className="font-bold text-xl">No hay niños registrados aún.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                              <th className="p-4 font-bold">Alumno</th>
                              <th className="p-4 font-bold hidden sm:table-cell">Sala</th>
                              <th className="p-4 font-bold hidden md:table-cell">Familia Asignada</th>
                              <th className="p-4 font-bold">Estado</th>
                              <th className="p-4 font-bold text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {kids.map(kid => {
                              const kidFamily = users.find(u => u.id === kid.familia_id);
                              return (
                                <tr key={kid.id} className={`hover:bg-gray-50/50 transition-colors ${!kid.activo ? 'opacity-50' : ''}`}>
                                  <td className="p-4">
                                    <div className="flex items-center gap-3">
                                      {kid.avatar ? (
                                        <img src={kid.avatar} alt={kid.nombre} className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-100" />
                                      ) : (
                                        <div className="w-10 h-10 bg-naranja-50 rounded-full flex items-center justify-center text-lg shadow-sm border border-gray-100">
                                          👶
                                        </div>
                                      )}
                                      <div>
                                        <p className="font-bold text-gray-800">{kid.nombre} {kid.apellido}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-4 hidden sm:table-cell">
                                    <span className="inline-block bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border border-purple-100">
                                      {kid.sala}
                                    </span>
                                  </td>
                                  <td className="p-4 hidden md:table-cell">
                                    {kidFamily ? (
                                      <span className="text-xs font-bold text-gray-600">{kidFamily.nombre}</span>
                                    ) : (
                                      <span className="text-xs font-bold text-red-400">Sin asignar</span>
                                    )}
                                  </td>
                                  <td className="p-4">
                                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${kid.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                      {kid.activo ? 'Activo' : 'Baja'}
                                    </span>
                                  </td>
                                  <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                      <button 
                                        onClick={() => navigate(`/admin/kid/${kid.id}`)}
                                        className="text-blue-500 hover:text-blue-700 transition-colors p-2 bg-blue-50 border border-blue-100 rounded-lg shadow-sm font-bold text-xs"
                                        title="Ver Historial"
                                      >
                                        📅
                                      </button>
                                      <button 
                                        onClick={() => {
                                          setEditingKid(kid);
                                          setKidFormData({
                                            nombre: kid.nombre, apellido: kid.apellido, sala: kid.sala,
                                            fecha_nacimiento: kid.fecha_nacimiento || '', alergias: kid.alergias || ''
                                          });
                                          setKidAvatarFile(null);
                                          setShowKidModal(true);
                                        }}
                                        className="text-gray-500 hover:text-gray-700 transition-colors p-2 bg-white border border-gray-200 rounded-lg shadow-sm font-bold text-xs"
                                        title="Editar"
                                      >
                                        ✏️
                                      </button>
                                      <button 
                                        onClick={() => toggleKidActive(kid)}
                                        className={`transition-colors p-2 border rounded-lg shadow-sm font-bold text-xs ${kid.activo ? 'text-red-500 hover:text-red-700 bg-red-50 border-red-100' : 'text-green-500 hover:text-green-700 bg-green-50 border-green-100'}`}
                                        title={kid.activo ? "Dar de Baja" : "Reactivar"}
                                      >
                                        {kid.activo ? '⛔' : '✅'}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'config' && (
                  <div className="max-w-2xl">
                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                      <h3 className="text-lg font-black text-gray-800 mb-6">Información Institucional</h3>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-bold text-gray-600 mb-2">Nombre del Jardín</label>
                          <input 
                            type="text" 
                            disabled 
                            value={state.jardin.nombre} 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-bold opacity-70 cursor-not-allowed"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-bold text-gray-600 mb-2">Suscripción Actual</label>
                          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-green-800">Plan Premium</p>
                              <p className="text-xs text-green-600 mt-0.5">Todas las funciones habilitadas</p>
                            </div>
                            <span className="text-2xl">✨</span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                          <button 
                            disabled
                            className="w-full bg-gray-200 text-gray-400 font-bold py-3 rounded-xl cursor-not-allowed"
                          >
                            Guardar Cambios
                          </button>
                          <p className="text-xs text-center text-gray-400 mt-3">La edición estará disponible pronto.</p>
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
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 w-24 transition-all ${activeTab === item.id ? 'text-naranja scale-110' : 'text-gray-400'}`}
            >
              <span className="text-2xl drop-shadow-sm">{item.icon}</span>
              <span className="text-[11px] font-bold truncate w-full text-center">{item.label}</span>
            </button>
          ))}
        </div>
      </main>

      {/* Modal Agregar/Editar Usuario */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-gray-800 text-lg">
                {editingUser 
                  ? (userRole === 'docente' ? '⚙️ Gestionar Docente' : '⚙️ Gestionar Familia')
                  : (userRole === 'docente' ? '👩‍🏫 Nueva Docente' : '👨‍👩‍👧 Nueva Familia')
                }
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
            </div>
            
            <form onSubmit={handleSaveUser} className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
              {!editingUser && (
                <>
                  <Input 
                    label="Nombre Completo" 
                    required 
                    value={formData.nombre}
                    onChange={e => setFormData({...formData, nombre: e.target.value})}
                    placeholder="Ej: María Gómez" 
                  />
                  
                  <Input 
                    label="Correo Electrónico" 
                    type="email" 
                    required 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="maria@jardin.com" 
                  />
                  
                  <Input 
                    label="Contraseña Temporal" 
                    type="text" 
                    required 
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    placeholder="min. 6 caracteres" 
                  />
                </>
              )}
              
              {editingUser && (
                <div className="mb-2">
                   <p className="text-sm text-gray-500">Editando a:</p>
                   <p className="text-xl font-bold text-gray-800">{editingUser.nombre}</p>
                </div>
              )}

              {userRole === 'docente' && (
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Salas Asignadas</label>
                  <div className="flex flex-wrap gap-2">
                    {SALAS.map(sala => (
                      <button
                        key={sala}
                        type="button"
                        onClick={() => {
                          const salas = formData.salas.includes(sala)
                            ? formData.salas.filter(s => s !== sala)
                            : [...formData.salas, sala];
                          setFormData({...formData, salas});
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold border-2 transition-colors ${
                          formData.salas.includes(sala)
                            ? 'bg-naranja-50 border-naranja text-naranja'
                            : 'bg-white border-gray-200 text-gray-400'
                        }`}
                      >
                        {sala}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {userRole === 'familia' && (
                <Select
                  label="Asignar Niño/a (Opcional)"
                  value={formData.child_id}
                  onChange={e => setFormData({...formData, child_id: e.target.value})}
                >
                  <option value="">Seleccione un niño...</option>
                  {state.kids.filter(k => !k.familia_id).map(k => (
                    <option key={k.id} value={k.id}>{k.nombre} {k.apellido} ({k.sala})</option>
                  ))}
                </Select>
              )}

              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : (editingUser ? 'Guardar Cambios' : 'Crear Usuario')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Agregar/Editar Niño */}
      {showKidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-gray-800 text-lg">
                {editingKid ? '✏️ Editar Niño' : '👶 Alta de Niño'}
              </h3>
              <button onClick={() => setShowKidModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
            </div>
            
            <form onSubmit={handleSaveKid} className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
              <div className="flex flex-col items-center gap-3 mb-2">
                <input 
                  type="file" 
                  ref={kidAvatarInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={e => setKidAvatarFile(e.target.files?.[0] || null)}
                />
                <div 
                  className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-naranja hover:bg-orange-50 transition-colors overflow-hidden"
                  onClick={() => kidAvatarInputRef.current?.click()}
                >
                  {kidAvatarFile ? (
                    <img src={URL.createObjectURL(kidAvatarFile)} alt="Preview" className="w-full h-full object-cover" />
                  ) : editingKid?.avatar ? (
                    <img src={editingKid.avatar} alt="Current" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">📷</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 font-bold text-center">Toca para {editingKid ? 'cambiar' : 'subir'} foto</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Nombre" 
                  required 
                  value={kidFormData.nombre}
                  onChange={e => setKidFormData({...kidFormData, nombre: e.target.value})}
                  placeholder="Nombre" 
                />
                <Input 
                  label="Apellido" 
                  required 
                  value={kidFormData.apellido}
                  onChange={e => setKidFormData({...kidFormData, apellido: e.target.value})}
                  placeholder="Apellido" 
                />
              </div>

              <Select 
                label="Sala Asignada" 
                value={kidFormData.sala}
                onChange={e => setKidFormData({...kidFormData, sala: e.target.value as any})}
              >
                {SALAS.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>

              <Input 
                label="Fecha de Nacimiento (Opcional)" 
                type="date"
                value={kidFormData.fecha_nacimiento}
                onChange={e => setKidFormData({...kidFormData, fecha_nacimiento: e.target.value})}
              />

              <Input 
                label="Alergias o Cuidados (Opcional)" 
                value={kidFormData.alergias}
                onChange={e => setKidFormData({...kidFormData, alergias: e.target.value})}
                placeholder="Ej: Alérgico a la lactosa" 
              />

              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowKidModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Guardar Niño'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
