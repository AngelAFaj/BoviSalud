import React from 'react';
import { Stethoscope, Edit, Trash2, ChevronRight, Activity, Syringe, Globe } from 'lucide-react';

export default function AnimalCard({ animal, lastRecord, onViewTimeline, onAddMedical, onEdit, onDelete }) {
  // Status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Preñada':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'En Tratamiento':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Destetada':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'Vendida':
        return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
      default:
        return 'bg-teal-500/15 text-teal-300 border-teal-500/30';
    }
  };

  const formatRecordDate = (isoStr) => {
    if (!isoStr) return null;
    const date = new Date(isoStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 relative group flex flex-col justify-between border border-slate-800 hover:border-emerald-500/40 transition-all shadow-md">
      <div className="space-y-3">
        {/* Top Header: Avatar + Name + Status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-950/80 to-slate-900 border border-emerald-800/40 flex items-center justify-center font-black text-lg text-emerald-400 shadow-inner shrink-0">
              {animal.name ? animal.name.charAt(0).toUpperCase() : 'V'}
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                {animal.name}
              </h3>
              <p className="text-xs text-slate-400 font-medium truncate">
                {animal.category} • {animal.gender || 'Hembra'}
              </p>
            </div>
          </div>

          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${getStatusBadge(animal.status)}`}>
            {animal.status || 'Sana'}
          </span>
        </div>

        {/* Pajuela & Nacionalidad Badges */}
        {(animal.tagNumber || animal.nationality) && (
          <div className="flex flex-wrap items-center gap-2">
            {animal.tagNumber && (
              <div className="flex items-center space-x-1.5 text-xs text-emerald-300 bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-emerald-800/40">
                <Syringe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold text-slate-300">Pajuela:</span>
                <span className="font-bold text-emerald-300">{animal.tagNumber}</span>
              </div>
            )}
            {animal.nationality && (
              <div className="flex items-center space-x-1.5 text-xs text-blue-300 bg-blue-950/40 px-2.5 py-1 rounded-xl border border-blue-800/40">
                <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="font-semibold text-slate-300">Nacionalidad:</span>
                <span className="font-bold text-blue-300">{animal.nationality}</span>
              </div>
            )}
          </div>
        )}

        {/* Notes if any */}
        {animal.notes && (
          <p className="text-xs text-slate-400 line-clamp-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60 italic">
            "{animal.notes}"
          </p>
        )}

        {/* Last Medical Activity */}
        <div className="pt-2 border-t border-slate-800/60 text-xs">
          {lastRecord ? (
            <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center space-x-1 font-semibold text-emerald-400 text-xs">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Último registro</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{formatRecordDate(lastRecord.datetime)}</span>
              </div>
              <p className="font-medium text-slate-200 text-xs">
                {lastRecord.indicationTitle} {lastRecord.dose ? `(${lastRecord.dose})` : ''}
              </p>
              {lastRecord.notes && (
                <p className="text-[11px] text-slate-400 truncate italic">"{lastRecord.notes}"</p>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 italic py-1">Sin atenciones médicas registradas</p>
          )}
        </div>
      </div>

      {/* Action Buttons - Mobile touch friendly */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
        <button
          onClick={() => onViewTimeline(animal)}
          className="flex-1 flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 hover:text-white text-xs font-semibold py-2.5 px-3 rounded-xl border border-slate-700/60 transition-colors"
        >
          <span>Historial</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => onAddMedical(animal)}
          className="flex items-center justify-center bg-emerald-500/15 hover:bg-emerald-500/25 active:bg-emerald-600/30 text-emerald-400 p-2.5 rounded-xl border border-emerald-500/30 transition-colors"
          title="Agregar atención médica"
        >
          <Stethoscope className="w-4 h-4" />
        </button>

        <button
          onClick={() => onEdit(animal)}
          className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-300 p-2.5 rounded-xl border border-slate-700/60 transition-colors"
          title="Editar información"
        >
          <Edit className="w-4 h-4" />
        </button>

        <button
          onClick={() => onDelete(animal.id)}
          className="flex items-center justify-center bg-rose-500/15 hover:bg-rose-500/25 active:bg-rose-600/30 text-rose-400 p-2.5 rounded-xl border border-rose-500/30 transition-colors"
          title="Eliminar registro"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
