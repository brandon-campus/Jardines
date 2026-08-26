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

export function ChildrenTab() {
  const { state } = useApp();
  const navigate = useNavigate();



  return (
    <div className="px-4 pt-3 pb-28 tab-content">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[17px] font-black text-gray-700">👶 Listado</h3>
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
            </Card>
          ))}
        </div>
      )}


    </div>
  );
}
