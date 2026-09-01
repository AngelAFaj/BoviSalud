import React from 'react';
import { Stethoscope, Calendar, Edit, Trash2, ChevronRight, Activity } from 'lucide-react';

export default function AnimalCard({ animal, lastRecord, onViewTimeline, onAddMedical, onEdit, onDelete }) {
  // Status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Preñada':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'En Tratamiento':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Destetada':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Vendida':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
      default:
        return 'bg-teal-500/10 text-teal-300 border-teal-500/30';
    }
  };

  const formatRecordDate = (isoStr) => {
    if (!isoStr) return null;
    const date = new Date(isoStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="glass-card rounded-2xl p-5 relative group flex flex-col justify-between border border-slate-800/80 hover:border-emerald-500/40 transition-all shadow-md">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 flex items-center justify-center font-bold text-lg text-emerald-400 shadow-inner">
              {animal.name ? animal.name.charAt(0).toUpperCase() : 'V'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {animal.name}
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  {animal.tagNumber || `#${animal.id}`}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {animal.category} • {animal.gender || 'Hembra'}
              </p>
            </div>
          </div>

          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBadge(animal.status)}`}>
            {animal.status || 'Sana'}
          </span>
        </div>

        {/* Notes if any */}
        {animal.notes && (
          <p className="text-xs text-slate-400 line-clamp-2 bg-slate-900/40 p-2 rounded-lg border border-slate-800/50 mb-3 italic">
            "{animal.notes}"
          </p>
        )}

        {/* Last Medical Activity */}
        <div className="mt-3 pt-3 border-t border-slate-800/60 text-xs">
          {lastRecord ? (
            <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800/80">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="flex items-center space-x-1 font-semibold text-emerald-400">
                  <Activity className="w-3 h-3" />
                  <span>Último registro</span>
                </span>
                <span className="text-[11px]">{formatRecordDate(lastRecord.datetime)}</span>
              </div>
              <p className="font-medium text-slate-200 text-xs">
                {lastRecord.indicationTitle} ({lastRecord.dose})
              </p>
              {lastRecord.notes && (
                <p className="text-[11px] text-slate-400 truncate">{lastRecord.notes}</p>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 italic">Sin atenciones médicas registradas</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
        <button
          onClick={() => onViewTimeline(animal)}
          className="flex-1 flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium py-2 px-3 rounded-xl border border-slate-700/60 transition-colors"
        >
          <span>Historial</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onAddMedical(animal)}
          className="flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 p-2 rounded-xl border border-emerald-500/30 transition-colors"
          title="Agregar atención médica"
        >
          <Stethoscope className="w-4 h-4" />
        </button>

        <button
          onClick={() => onEdit(animal)}
          className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 p-2 rounded-xl border border-slate-700/60 transition-colors"
          title="Editar información"
        >
          <Edit className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onDelete(animal.id)}
          className="flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 p-2 rounded-xl border border-rose-500/30 transition-colors"
          title="Eliminar registro"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
