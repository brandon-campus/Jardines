import { useApp } from '../../context/AppContext';

export function Toast() {
  const { state } = useApp();
  if (!state.toast) return null;

  const { msg, type } = state.toast;
  const bg = type === 'err' ? '#ef4444' : '#22c55e';

  return (
    <div
      className="fixed top-4 left-1/2 z-[9999] flex items-center gap-3 px-5 py-3 rounded-2xl font-bold text-sm text-white whitespace-nowrap shadow-2xl animate-toast-in"
      style={{ background: bg, transform: 'translateX(-50%)' }}
    >
      <span>{type === 'err' ? '❌' : '✅'}</span>
      <span>{msg}</span>
    </div>
  );
}
