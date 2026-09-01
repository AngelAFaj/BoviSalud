import React, { useState, useEffect } from 'react';
import { X, Save, Clock, Stethoscope, ChevronDown, CheckSquare, Square, Layers } from 'lucide-react';

export default function MedicalRecordFormModal({ 
  isOpen, 
  onClose, 
  animals = [], 
  catalog = [], 
  onSaveRecord, 
  preselectedAnimalId = null 
}) {
  const [isMultipleMode, setIsMultipleMode] = useState(false);
  const [selectedAnimalId, setSelectedAnimalId] = useState('');
  const [selectedAnimalIds, setSelectedAnimalIds] = useState([]);
  
  // Date and Time auto-captured from system
  const getCurrentSystemDateTime = () => {
    const now = new Date();
    // Format YYYY-MM-DDTHH:mm
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [datetime, setDatetime] = useState(getCurrentSystemDateTime());
  const [selectedCatalogId, setSelectedCatalogId] = useState('');
  const [indicationTitle, setIndicationTitle] = useState('');
  const [category, setCategory] = useState('Tratamiento Médico');
  const [dose, setDose] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDatetime(getCurrentSystemDateTime());
      if (preselectedAnimalId) {
        setSelectedAnimalId(preselectedAnimalId);
        setIsMultipleMode(false);
      } else if (animals.length > 0) {
        setSelectedAnimalId(animals[0].id);
      }
    }
  }, [isOpen, preselectedAnimalId, animals]);

  // When an item from the catalog dropdown is selected
  const handleCatalogSelect = (e) => {
    const catalogId = e.target.value;
    setSelectedCatalogId(catalogId);

    if (catalogId) {
      const item = catalog.find(c => c.id === parseInt(catalogId) || c.id === catalogId);
      if (item) {
        setIndicationTitle(item.title);
        setCategory(item.category || 'Tratamiento Médico');
        setDose(item.defaultDose || '');
        if (item.notes && !notes) {
          setNotes(item.notes);
        }
      }
    }
  };

  const toggleSelectAllAnimals = () => {
    if (selectedAnimalIds.length === animals.length) {
      setSelectedAnimalIds([]);
    } else {
      setSelectedAnimalIds(animals.map(a => a.id));
    }
  };

  const toggleAnimalSelection = (id) => {
    if (selectedAnimalIds.includes(id)) {
      setSelectedAnimalIds(selectedAnimalIds.filter(aId => aId !== id));
    } else {
      setSelectedAnimalIds([...selectedAnimalIds, id]);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!indicationTitle.trim()) return;

    if (isMultipleMode) {
      if (selectedAnimalIds.length === 0) return;
      
      // Save for each selected animal
      const recordsToSave = selectedAnimalIds.map(id => {
        const animalObj = animals.find(a => a.id === id);
        return {
          animalId: id,
          animalName: animalObj ? animalObj.name : 'Desconocido',
          datetime,
          indicationId: selectedCatalogId || null,
          indicationTitle,
          category,
          dose,
          notes,
          createdOffline: !navigator.onLine
        };
      });

      onSaveRecord(recordsToSave, true);
    } else {
      if (!selectedAnimalId) return;
      const animalObj = animals.find(a => a.id === parseInt(selectedAnimalId) || a.id === selectedAnimalId);

      const singleRecord = {
        animalId: animalObj ? animalObj.id : selectedAnimalId,
        animalName: animalObj ? animalObj.name : 'Desconocido',
        datetime,
        indicationId: selectedCatalogId || null,
        indicationTitle,
        category,
        dose,
        notes,
        createdOffline: !navigator.onLine
      };

      onSaveRecord(singleRecord, false);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Nuevo Registro Médico</h3>
              <p className="text-xs text-slate-400">Captura de atención con fecha y hora del sistema</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          {/* Mode Switcher: Individual vs Multiple */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setIsMultipleMode(false)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                !isMultipleMode
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Atención Individual
            </button>
            <button
              type="button"
              onClick={() => setIsMultipleMode(true)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                isMultipleMode
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Aplicación Masiva (Varios Bovinos)
            </button>
          </div>

          {/* Animal Selector */}
          {!isMultipleMode ? (
            <div>
              <label className="block font-medium text-slate-300 mb-1">Seleccionar Bovino *</label>
              <select
                value={selectedAnimalId}
                onChange={(e) => setSelectedAnimalId(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none text-sm font-medium"
              >
                {animals.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.category} - {a.tagNumber || `#${a.id}`}) [{a.status}]
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-medium text-slate-300">
                  Seleccionar Animales ({selectedAnimalIds.length} seleccionados)
                </label>
                <button
                  type="button"
                  onClick={toggleSelectAllAnimals}
                  className="text-xs text-emerald-400 hover:underline font-medium"
                >
                  {selectedAnimalIds.length === animals.length ? 'Desmarcar todos' : 'Marcar todos ("A todas")'}
                </button>
              </div>
              <div className="max-h-36 overflow-y-auto bg-slate-950 p-2 rounded-xl border border-slate-800 space-y-1">
                {animals.map((a) => {
                  const isChecked = selectedAnimalIds.includes(a.id);
                  return (
                    <div
                      key={a.id}
                      onClick={() => toggleAnimalSelection(a.id)}
                      className={`flex items-center space-x-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                        isChecked ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40' : 'hover:bg-slate-900 text-slate-300'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600 shrink-0" />
                      )}
                      <span className="font-medium text-xs">{a.name}</span>
                      <span className="text-[11px] text-slate-500">({a.category})</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* System Fecha y Hora */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center space-x-3">
            <Clock className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Fecha y Hora (Tomadas Automáticamente del Sistema)
              </label>
              <input
                type="datetime-local"
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
                className="w-full bg-transparent text-slate-100 font-semibold focus:outline-none text-sm mt-0.5"
              />
            </div>
          </div>

          {/* Selector de Catálogo de Indicaciones Reutilizables */}
          <div className="bg-emerald-950/20 p-3.5 rounded-2xl border border-emerald-800/30 space-y-3">
            <div>
              <label className="block font-medium text-emerald-300 mb-1">
                📋 Seleccionar Indicación del Catálogo (Desplegable)
              </label>
              <select
                value={selectedCatalogId}
                onChange={handleCatalogSelect}
                className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-emerald-700/50 focus:border-emerald-400 focus:outline-none font-medium"
              >
                <option value="">-- Seleccionar o escribir personalizadamente --</option>
                {catalog.map((item) => (
                  <option key={item.id} value={item.id}>
                    [{item.category}] {item.title} - Dosis: {item.defaultDose || 'N/A'}
                  </option>
                ))}
              </select>
            </div>

            {/* Titulo / Indicación libre */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Nombre / Título de Indicación *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Fosfosan, Inseminación, Bovisan"
                  value={indicationTitle}
                  onChange={(e) => setIndicationTitle(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3 py-2 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3 py-2 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Tratamiento Médico">Tratamiento Médico</option>
                  <option value="Vacunación">Vacunación</option>
                  <option value="Desparasitación">Desparasitación</option>
                  <option value="Vitaminas y Minerales">Vitaminas y Minerales</option>
                  <option value="Reproducción">Reproducción</option>
                  <option value="Síntoma / Diagnóstico">Síntoma / Diagnóstico</option>
                  <option value="Suplementos">Suplementos</option>
                  <option value="Manejo">Manejo</option>
                </select>
              </div>
            </div>

            {/* Dosis */}
            <div>
              <label className="block font-medium text-slate-300 mb-1">Dosis / Aplicación</label>
              <input
                type="text"
                placeholder="Ej. 15ml SC, 2 dosis, 1 pajuela"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 px-3 py-2 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Notas Adicionales */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">Notas / Indicaciones del Veterinario</label>
            <textarea
              rows="3"
              placeholder="Ej. Se puso para sincronizar 6:00 AM, aplicar refuerzo en 15 días..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none resize-none"
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-semibold shadow-lg shadow-emerald-950/50 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Registro</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
