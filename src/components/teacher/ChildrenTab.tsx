import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { SalaBadge, AlergiaBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { SALAS } from '../../types';
import type { Nino, Sala } from '../../types';
import { fmtFecha, calcEdad, nid } from '../../lib/utils';
import { TODAY } from '../../data/mock';

export function ChildrenTab() {
  const { state } = useApp();
  const navigate = useNavigate();

  const misSalas = state.user?.rol === 'docente' 
    ? state.docenteSalas.filter(ds => ds.docente_id === state.user!.id).map(ds => ds.sala)
    : [];

  const kidsFiltrados = state.user?.rol === 'docente'
    ? state.kids.filter(k => misSalas.includes(k.sala))
    : state.kids;

  const registered = new Set(
    state.records.filter(r => r.fecha === TODAY).map(r => r.nino_id)
  );

  const total = kidsFiltrados.length;
  const registradosCount = kidsFiltrados.filter(k => registered.has(k.id)).length;
  const pendientes = total - registradosCount;



  return (
    <div className="px-4 pt-3 pb-28 tab-content">
      <div className="mb-4">
        <h3 className="text-[17px] font-black text-gray-700">👶 Listado de Niños</h3>
        {state.user?.rol === 'docente' && (
          <p className="text-[13px] text-gray-400 mt-0.5 mb-3">
            Salas: <strong className="text-gray-600">{misSalas.join(', ')}</strong>
          </p>
        )}
        <div className="flex gap-2 mb-2">
          <div className="flex-1 bg-white border border-gray-200 rounded-xl py-2 px-1 text-center shadow-sm">
            <div className="text-xl font-black text-gray-700">{total}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase">Total</div>
          </div>
          <div className="flex-1 bg-green-50 border border-green-200 rounded-xl py-2 px-1 text-center shadow-sm">
            <div className="text-xl font-black text-green-700">{registradosCount}</div>
            <div className="text-[10px] font-bold text-green-600 uppercase">Listos</div>
          </div>
          <div className="flex-1 bg-amber-50 border border-amber-200 rounded-xl py-2 px-1 text-center shadow-sm">
            <div className="text-xl font-black text-amber-700">{pendientes}</div>
            <div className="text-[10px] font-bold text-amber-600 uppercase">Pendientes</div>
          </div>
        </div>
      </div>

      {kidsFiltrados.length === 0 ? (
        <EmptyState icon="👶" title="No hay niños aún" subtitle="Agregá el primer niño con el botón de arriba." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kidsFiltrados.map(kid => (
            <Card key={kid.id}>
              <div className="flex items-center gap-3">
                {kid.avatar && kid.avatar.startsWith('http') ? (
                  <img src={kid.avatar} alt={kid.nombre} className="w-14 h-14 rounded-full object-cover shadow-sm border border-gray-100 flex-shrink-0" />
                ) : (
                  <span className="text-4xl w-14 h-14 bg-naranja-50 rounded-full flex items-center justify-center border border-gray-100 flex-shrink-0">
                    {kid.avatar || (kid.sala === 'Maternal' ? '👶' : (kid.sexo === 'F' ? '👧' : '👦'))}
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
            </Card>
          ))}
        </div>
      )}


    </div>
  );
}
