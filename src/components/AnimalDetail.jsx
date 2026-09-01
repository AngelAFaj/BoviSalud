import React from 'react';
import { ArrowLeft, Stethoscope, Calendar, Clock, Plus, Trash2, Tag, Activity, FileText } from 'lucide-react';

export default function AnimalDetail({ animal, records = [], onBack, onAddMedical, onDeleteRecord }) {
  if (!animal) return null;

  // Filter records for this animal
  const animalRecords = records
    .filter(r => r.animalId === animal.id || r.animalName === animal.name)
    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

  const formatDateTime = (isoStr) => {
    if (!isoStr) return { date: '', time: '' };
    const d = new Date(isoStr);
    return {
      date: d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors text-xs font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a la Lista de Bovinos</span>
      </button>

      {/* Animal Summary Profile Header */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-emerald-950/60">
            {animal.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-black text-white">{animal.name}</h1>
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-800 text-emerald-400 border border-slate-700">
                {animal.tagNumber || `#${animal.id}`}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {animal.status || 'Sana'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Categoría: <span className="text-slate-200 font-semibold">{animal.category}</span> • Sexo: <span className="text-slate-200 font-semibold">{animal.gender}</span>
              {animal.birthDate && ` • Nacimiento: ${animal.birthDate}`}
            </p>
          </div>
        </div>

        <button
          onClick={() => onAddMedical(animal)}
          className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Registrar Atención Médica</span>
        </button>
      </div>

      {/* Notes / Pedigree */}
      {animal.notes && (
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 text-xs">
          <p className="text-slate-400 font-semibold mb-1">Observaciones / Antecedentes:</p>
          <p className="text-slate-200 italic">"{animal.notes}"</p>
        </div>
      )}

      {/* Medical History Timeline */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Historial Clínico Médico</h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {animalRecords.length} atenciones registradas
          </span>
        </div>

        {animalRecords.length > 0 ? (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
            {animalRecords.map((record) => {
              const { date, time } = formatDateTime(record.datetime);
              return (
                <div key={record.id} className="relative group">
                  {/* Timeline dot */}
                  <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-slate-950"></div>

                  {/* Card Content */}
                  <div className="glass-card p-4 rounded-2xl border border-slate-800/80 hover:border-emerald-500/30 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {record.category || 'Tratamiento'}
                          </span>
                          <h4 className="text-base font-bold text-white">{record.indicationTitle}</h4>
                        </div>

                        {record.dose && (
                          <p className="text-xs font-semibold text-slate-300 mt-1">
                            Dosis / Aplicación: <span className="text-emerald-400">{record.dose}</span>
                          </p>
                        )}
                      </div>

                      {/* Date & Time pill */}
                      <div className="flex flex-col items-end text-xs text-slate-400">
                        <div className="flex items-center space-x-1 font-semibold text-slate-200">
                          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{date}</span>
                        </div>
                        {time && (
                          <div className="flex items-center space-x-1 text-[11px] text-slate-400 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{time}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {record.notes && (
                      <p className="text-xs text-slate-300 mt-3 pt-2.5 border-t border-slate-800/60 italic bg-slate-950/40 p-2.5 rounded-xl">
                        "{record.notes}"
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{record.createdOffline ? '💾 Guardado localmente (Offline)' : '☁️ Sincronizado'}</span>
                      <button
                        onClick={() => onDeleteRecord(record.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-xs italic">
            No hay registros médicos cargados para este bovino todavía.
          </div>
        )}
      </div>
    </div>
  );
}
