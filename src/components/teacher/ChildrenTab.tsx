import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { SalaBadge, AlergiaBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { Modal, ConfirmModal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';
import { SALAS } from '../../types';
import type { Nino, Sala } from '../../types';
import { fmtFecha, calcEdad, nid } from '../../lib/utils';

const AVATARS = ['👶', '👧', '👦'];

export function ChildrenTab() {
  const { state, addKid, removeKid, showToast } = useApp();
  const navigate = useNavigate();

  const [showAdd, setShowAdd] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<Nino | null>(null);

  // Form state
  const [avatar, setAvatar] = useState('👶');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [sala, setSala] = useState<Sala>('Maternal');
  const [dob, setDob] = useState('');
  const [alergias, setAlergias] = useState('Ninguna');

  const resetForm = () => {
    setAvatar('👶'); setNombre(''); setApellido('');
    setSala('Maternal'); setDob(''); setAlergias('Ninguna');
  };

  const handleSave = async () => {
    if (!nombre.trim() || !apellido.trim()) {
      showToast('⚠️ El nombre y apellido son obligatorios', 'err');
      return;
    }
    await addKid({ nombre, apellido, sala, avatar, fecha_nacimiento: dob, alergias, familia_id: null });
    showToast(`✅ ${nombre} ${apellido} agregado al jardín`);
    resetForm();
    setShowAdd(false);
  };

  return (
    <div className="px-4 pt-3 pb-28 tab-content">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[17px] font-black text-gray-700">👶 Listado</h3>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> Agregar
        </Button>
      </div>

      {state.kids.length === 0 ? (
        <EmptyState icon="👶" title="No hay niños aún" subtitle="Agregá el primer niño con el botón de arriba." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.kids.map(kid => (
            <Card key={kid.id}>
              <div className="flex items-center gap-3">
                {kid.avatar && kid.avatar.startsWith('http') ? (
                  <img src={kid.avatar} alt={kid.nombre} className="w-14 h-14 rounded-full object-cover shadow-sm border border-gray-100 flex-shrink-0" />
                ) : (
                  <span className="text-4xl w-14 h-14 bg-naranja-50 rounded-full flex items-center justify-center border border-gray-100 flex-shrink-0">
                    {kid.avatar || '👶'}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-black text-[15px] text-gray-800">
                    {kid.nombre} {kid.apellido}
                  </div>
                  <div className="flex gap-1.5 mt-1 flex-wrap">
                    <SalaBadge sala={kid.sala} />
                    <AlergiaBadge alergias={kid.alergias} />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {kid.fecha_nacimiento && (
                    <>
                      <div className="text-[11px] text-gray-400">Edad</div>
                      <div className="text-sm font-black text-gray-700">
                        {calcEdad(kid.fecha_nacimiento)}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => setConfirmRemove(kid)}
                className="w-full mt-3 py-2.5 border-2 border-red-200 rounded-xl bg-red-50 text-red-500 font-black text-[13px] cursor-pointer hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={14} />
                Quitar a {kid.nombre} del jardín
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* Add kid modal */}
      <Modal open={showAdd} onClose={() => { setShowAdd(false); resetForm(); }} title="Agregar Niño/a">
        <div className="flex flex-col gap-4">
          {/* Avatar selector */}
          <div className="flex gap-2">
            {AVATARS.map(av => (
              <button
                key={av}
                onClick={() => setAvatar(av)}
                className={`flex-1 py-3 text-3xl rounded-xl border-2 cursor-pointer transition-all ${
                  avatar === av
                    ? 'border-naranja bg-naranja-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {av}
              </button>
            ))}
          </div>

          <Input label="Nombre *" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" />
          <Input label="Apellido *" value={apellido} onChange={e => setApellido(e.target.value)} placeholder="Apellido" />

          <Select label="Sala" value={sala} onChange={e => setSala(e.target.value as Sala)}>
            {SALAS.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>

          <Input
            label="Fecha de Nacimiento"
            type="date"
            value={dob}
            onChange={e => setDob(e.target.value)}
          />
          <Input
            label="Alergias"
            value={alergias}
            onChange={e => setAlergias(e.target.value)}
            placeholder="Ninguna"
          />

          <div className="flex gap-3 mt-2">
            <Button variant="ghost" onClick={() => { setShowAdd(false); resetForm(); }} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1">
              ✅ Guardar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm remove */}
      <ConfirmModal
        open={!!confirmRemove}
        onClose={() => setConfirmRemove(null)}
        onConfirm={async () => {
          if (confirmRemove) {
            await removeKid(confirmRemove.id);
            showToast(`${confirmRemove.nombre} fue quitado del jardín`);
          }
        }}
        title={`¿Quitar a ${confirmRemove?.nombre}?`}
        description="No aparecerá más en la app ni en los registros."
        confirmLabel="🚫 Sí, quitar"
      />
    </div>
  );
}
