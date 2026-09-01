import React, { useState } from 'react';
import { Calendar, Search, Filter, Stethoscope, Clock, Trash2, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function MedicalRecordsList({ records = [], animals = [], onDeleteRecord, onOpenMedicalModal }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');

  const categories = [
    'Todos',
    'Vacunación',
    'Desparasitación',
    'Vitaminas y Minerales',
    'Reproducción',
    'Síntoma / Diagnóstico',
    'Tratamiento Médico',
    'Suplementos'
  ];

  const formatDateTime = (isoStr) => {
    if (!isoStr) return { date: '', time: '' };
    const d = new Date(isoStr);
    return {
      date: d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const filteredRecords = records
    .filter(r => {
      const matchesSearch = 
        r.animalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.indicationTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.notes && r.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = categoryFilter === 'Todos' || r.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

  // Export medical records to Excel file
  const handleExportExcel = () => {
    const dataToExport = filteredRecords.map(r => ({
      'Bovino': r.animalName,
      'Fecha y Hora': r.datetime ? r.datetime.replace('T', ' ') : '',
      'Indicación': r.indicationTitle,
      'Categoría': r.category || 'General',
      'Dosis': r.dose || '',
      'Observaciones': r.notes || '',
      'Modo Offline': r.createdOffline ? 'Sí' : 'No'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Historial Medico');

    const fileName = `Historial_Ganadero_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-extrabold text-white">Historial Clínico de Campo</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Registro continuo de vacunas, dosis, atenciones de celo, inseminaciones y medicamentos aplicados al ganado.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Exportar Excel</span>
          </button>
          
          <button
            onClick={onOpenMedicalModal}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all"
          >
            <Stethoscope className="w-4 h-4" />
            <span>+ Nueva Atención</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por animal, tratamiento o nota..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 text-slate-100 placeholder-slate-500 pl-10 pr-4 py-2 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto py-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Records Table / List */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {filteredRecords.length > 0 ? (
          <div className="divide-y divide-slate-800/80">
            {filteredRecords.map((record) => {
              const { date, time } = formatDateTime(record.datetime);
              return (
                <div key={record.id} className="p-4 sm:p-5 hover:bg-slate-900/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-extrabold text-base text-white">{record.animalName}</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {record.category || 'General'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                      <span className="font-bold text-emerald-300">{record.indicationTitle}</span>
                      {record.dose && <span className="text-slate-400">Dosis: <strong className="text-slate-200">{record.dose}</strong></span>}
                    </div>

                    {record.notes && (
                      <p className="text-xs text-slate-400 italic bg-slate-950/40 p-2 rounded-lg border border-slate-800/40 max-w-2xl">
                        "{record.notes}"
                      </p>
                    )}
                  </div>

                  {/* Date, Time & Delete */}
                  <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                    <div className="text-left sm:text-right text-xs">
                      <div className="flex items-center space-x-1 font-semibold text-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{date}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-[11px] text-slate-400 justify-start sm:justify-end mt-0.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{time}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteRecord(record.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                      title="Eliminar este registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 text-xs italic">
            No se encontraron atenciones médicas que coincidan con la búsqueda.
          </div>
        )}
      </div>
    </div>
  );
}
