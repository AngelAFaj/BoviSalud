import React, { useState, useEffect } from 'react';
import { X, Save, Tag } from 'lucide-react';

export default function AnimalModal({ isOpen, onClose, onSave, animalToEdit = null }) {
  const [formData, setFormData] = useState({
    name: '',
    tagNumber: '',
    category: 'Vaca',
    gender: 'Hembra',
    status: 'Sana',
    birthDate: '',
    notes: ''
  });

  useEffect(() => {
    if (animalToEdit) {
      setFormData({
        name: animalToEdit.name || '',
        tagNumber: animalToEdit.tagNumber || '',
        category: animalToEdit.category || 'Vaca',
        gender: animalToEdit.gender || 'Hembra',
        status: animalToEdit.status || 'Sana',
        birthDate: animalToEdit.birthDate || '',
        notes: animalToEdit.notes || ''
      });
    } else {
      setFormData({
        name: '',
        tagNumber: '',
        category: 'Vaca',
        gender: 'Hembra',
        status: 'Sana',
        birthDate: '',
        notes: ''
      });
    }
  }, [animalToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData, animalToEdit ? animalToEdit.id : null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[92vh] flex flex-col my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Tag className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">
              {animalToEdit ? 'Editar Bovino' : 'Registrar Nuevo Bovino'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Nombre o Apodo *</label>
              <input
                type="text"
                required
                placeholder="Ej. Bamby, Valentina"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none text-base sm:text-sm"
              />
            </div>

            {/* Pajuela */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Pajuela</label>
              <input
                type="text"
                placeholder="Ej. P-102, Toro Holstein #405"
                value={formData.tagNumber}
                onChange={(e) => setFormData({ ...formData, tagNumber: e.target.value })}
                className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none text-base sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Categoría */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Tipo / Categoría</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-950 text-slate-100 px-3 py-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none text-base sm:text-sm"
              >
                <option value="Vaca">Vaca</option>
                <option value="Ternero">Ternero</option>
                <option value="Ternera">Ternera</option>
                <option value="Toro">Toro</option>
              </select>
            </div>

            {/* Género */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Sexo</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full bg-slate-950 text-slate-100 px-3 py-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none text-base sm:text-sm"
              >
                <option value="Hembra">Hembra</option>
                <option value="Macho">Macho</option>
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Estado de Salud</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 text-slate-100 px-3 py-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none text-base sm:text-sm"
              >
                <option value="Sana">Sana</option>
                <option value="Preñada">Preñada</option>
                <option value="En Tratamiento">En Tratamiento</option>
                <option value="Destetada">Destetada</option>
                <option value="Vendida">Vendida</option>
              </select>
            </div>
          </div>

          {/* Fecha Nacimiento */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Fecha Aprox. de Nacimiento</label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none text-base sm:text-sm"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Observaciones / Pedigrí</label>
            <textarea
              rows="3"
              placeholder="Ej. Madre: Valentina, cría de segundo parto, dócil..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none resize-none text-base sm:text-sm"
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 font-medium transition-colors text-xs sm:text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 font-semibold shadow-lg shadow-emerald-950/50 transition-colors text-xs sm:text-sm"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Bovino</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
