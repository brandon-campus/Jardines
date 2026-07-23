import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
type Rol = 'docente' | 'familia' | 'admin';

export function LoginPage() {
  const { login, state } = useApp();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (state.user) {
      if (state.user.rol === 'superadmin') navigate('/superadmin', { replace: true });
      else if (state.user.rol === 'admin_jardin') navigate('/admin', { replace: true });
      else if (state.user.rol === 'docente') navigate('/teacher', { replace: true });
      else navigate('/parent', { replace: true });
    }
  }, [state.user, navigate]);

  const [rol, setRol] = useState<Rol>('docente');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);



  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    if (!email || !password) { setError('Completá los campos'); return; }
    setLoading(true);
    
    const user = await login(email, password);
    setLoading(false);
    if (!user) {
      setError('Usuario o contraseña incorrectos 😕');
      return;
    }
    
    if (user.rol === 'superadmin') navigate('/superadmin');
    else if (user.rol === 'admin_jardin') navigate('/admin');
    else if (user.rol === 'docente') navigate('/teacher');
    else navigate('/parent');
  };



  return (
    <AppLayout>
      <div className="min-h-screen flex md:grid md:grid-cols-2">
        {/* Left Column: Decorative Panel (Hidden on very small screens, or shown as background) */}
        <div 
          className="hidden md:flex flex-col items-center justify-center p-10 text-center"
          style={{ background: 'linear-gradient(160deg, #FF6B35 0%, #FF9A3C 45%, #FFD166 100%)' }}
        >
          {state.jardin.logo_url ? (
            <img
              src={state.jardin.logo_url}
              alt="Logo"
              className="w-40 h-40 rounded-full object-cover border-8 border-white/20 mb-6 shadow-2xl"
            />
          ) : (
            <div className="text-8xl mb-6 drop-shadow-lg">🌼</div>
          )}
          <h1 className="text-4xl font-black text-white drop-shadow-sm mb-2">{state.jardin.nombre}</h1>
          <p className="text-white/90 text-lg font-bold">Plataforma de Seguimiento Diario</p>
          <div className="mt-12 bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20 max-w-sm text-white/90">
            <p className="font-bold">✨ Conectando a familias y educadores todos los días.</p>
          </div>
        </div>

        {/* Right Column: Form Panel */}
        <div 
          className="flex-1 flex items-center justify-center p-5 md:p-10 relative"
          style={{ background: 'linear-gradient(160deg, #FF6B35 0%, #FF9A3C 45%, #FFD166 100%)' }}
        >
          {/* Apply a white background block covering the right side only on desktop */}
          <div className="hidden md:block absolute inset-0 bg-gray-50"></div>
          
          <div className="bg-white rounded-3xl p-7 w-full max-w-md shadow-[0_24px_60px_rgba(0,0,0,0.18)] md:shadow-[0_8px_30px_rgba(0,0,0,0.05)] relative z-10 border border-gray-100">
            
            {/* Mobile-only header (Desktop has the left panel) */}
            <div className="text-center mb-6 md:hidden">
              {state.jardin.logo_url ? (
                <img
                  src={state.jardin.logo_url}
                  alt="Logo"
                  className="w-20 h-20 rounded-full object-cover border-4 border-naranja-200 mx-auto mb-2"
                />
              ) : (
                <div className="text-6xl mb-2">🌼</div>
              )}
              <h1 className="text-2xl font-black text-naranja">{state.jardin.nombre}</h1>
              <p className="text-gray-400 text-[13px] mt-1">Sistema de Seguimiento Diario</p>
            </div>

            <div className="hidden md:block mb-8 text-center">
              <h2 className="text-2xl font-black text-gray-800">¡Hola de nuevo!</h2>
              <p className="text-gray-500 text-sm mt-1">Ingresá a tu cuenta para continuar</p>
            </div>

            {/* Role toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-5 gap-1">
              {(['docente', 'familia', 'admin'] as Rol[]).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setRol(r); setError(''); setEmail(''); setPassword(''); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border-0 cursor-pointer transition-all duration-200 ${
                    rol === r
                      ? 'bg-naranja text-white shadow-[0_2px_8px_rgba(255,107,53,0.35)]'
                      : 'text-gray-500 bg-transparent hover:text-gray-700'
                  }`}
                >
                  {r === 'docente' ? '👩‍🏫 Docente' : r === 'familia' ? '👨‍👩‍👧 Familia' : '⚙️ Admin'}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="flex flex-col gap-3 mb-5">
              <Input
                id="email"
                type="email"
                placeholder="Correo electrónico o usuario"
                value={email}
                error={error ? ' ' : undefined}
                onChange={e => { setEmail(e.target.value); setError(''); }}
              />
              <Input
                id="password"
                type="password"
                placeholder="Contraseña"
                value={password}
                error={error ? ' ' : undefined}
                onChange={e => { setPassword(e.target.value); setError(''); }}
              />
              {error && (
                <p className="text-red-500 text-[13px] font-bold text-center mt-1">{error}</p>
              )}
              <div className="mt-2">
                <Button type="submit" fullWidth size="lg" loading={loading}>
                  Ingresar →
                </Button>
              </div>
            </form>


          </div>
        </div>
      </div>
    </AppLayout>
  );
}
