import React from 'react';
import { Layers, HeartPulse, Sparkles, AlertCircle } from 'lucide-react';

export default function StatsOverview({ animals = [], records = [] }) {
  const totalAnimals = animals.length;
  const vacasCount = animals.filter(a => a.category === 'Vaca').length;
  const ternerosCount = animals.filter(a => a.category === 'Ternero' || a.category === 'Ternera').length;
  const preñadasCount = animals.filter(a => a.status === 'Preñada').length;
  const enTratamientoCount = animals.filter(a => a.status === 'En Tratamiento').length;
  const totalRecords = records.length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* Total Bovinos */}
      <div className="glass-card rounded-2xl p-4 flex items-center space-x-3 border border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-slate-400 font-medium">Total Bovinos</p>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-xl sm:text-2xl font-bold text-white">{totalAnimals}</span>
            <span className="text-xs text-slate-400">({vacasCount} V, {ternerosCount} T)</span>
          </div>
        </div>
      </div>

      {/* Preñadas */}
      <div className="glass-card rounded-2xl p-4 flex items-center space-x-3 border border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-slate-400 font-medium">Vacas Preñadas</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-400">{preñadasCount}</p>
        </div>
      </div>

      {/* En Tratamiento */}
      <div className="glass-card rounded-2xl p-4 flex items-center space-x-3 border border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-slate-400 font-medium">En Tratamiento</p>
          <p className="text-xl sm:text-2xl font-bold text-amber-400">{enTratamientoCount}</p>
        </div>
      </div>

      {/* Historial Médico Total */}
      <div className="glass-card rounded-2xl p-4 flex items-center space-x-3 border border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
          <HeartPulse className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-slate-400 font-medium">Registros Médicos</p>
          <p className="text-xl sm:text-2xl font-bold text-purple-400">{totalRecords}</p>
        </div>
      </div>
    </div>
  );
}
