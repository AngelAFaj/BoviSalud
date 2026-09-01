import React, { useState } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Tag, Search, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CatalogManager({ catalog = [], onAddCatalogItem, onEditCatalogItem, onDeleteCatalogItem }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  
  // State for Add/Edit Modal inside Catalog
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Vitaminas y Minerales',
    defaultDose: '',
    route: '',
    notes: ''
  });

  const categories = [
    'Todos',
    'Vacunación',
    'Desparasitación',
    'Vitaminas y Minerales',
    'Reproducción',
    'Síntoma / Diagnóstico',
    'Tratamiento Médico',
    'Suplementos',
    'Manejo'
  ];

  const handleOpenAdd = () => {
    setItemToEdit(null);
    setFormData({
      title: '',
      category: 'Vitaminas y Minerales',
      defaultDose: '',
      route: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setItemToEdit(item);
    setFormData({
      title: item.title || '',
      category: item.category || 'Vitaminas y Minerales',
      defaultDose: item.defaultDose || '',
      route: item.route || '',
      notes: item.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (itemToEdit) {
      onEditCatalogItem(itemToEdit.id, formData);
    } else {
      onAddCatalogItem(formData);
    }

    setIsModalOpen(false);
  };

  const filteredCatalog = catalog.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-extrabold text-white">Catálogo de Indicaciones Reutilizables</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Administra los medicamentos, dosis estándar, vacunas y síntomas predeterminados. Estas opciones aparecen automáticamente en el desplegable de registro médico para agilizar el trabajo en campo.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Indicación</span>
        </button>
      </div>

      {/* Toolbar & Filters */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar indicación o dosis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 text-slate-100 placeholder-slate-500 pl-10 pr-4 py-2 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto py-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCatalog.map((item) => (
          <div 
            key={item.id}
            className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {item.category || 'General'}
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                    title="Editar indicación"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteCatalogItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                    title="Eliminar indicación"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-white mb-1">{item.title}</h3>
              
              <div className="space-y-1 my-2 text-xs text-slate-300">
                {item.defaultDose && (
                  <p><span className="text-slate-500 font-medium">Dosis habitual:</span> {item.defaultDose}</p>
                )}
                {item.route && (
                  <p><span className="text-slate-500 font-medium">Vía:</span> {item.route}</p>
                )}
              </div>

              {item.notes && (
                <p className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/50 mt-3 italic">
                  "{item.notes}"
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center text-[11px] text-slate-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-1.5" />
              <span>Disponible en menú desplegable</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add/Edit Catalog Item */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {itemToEdit ? 'Editar Indicación' : 'Agregar Nueva Indicación'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Nombre / Título de la Indicación *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Fosfosan, Vigantol, Bovisan"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Categoría</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-950 text-slate-100 px-3 py-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Vacunación">Vacunación</option>
                  <option value="Desparasitación">Desparasitación</option>
                  <option value="Vitaminas y Minerales">Vitaminas y Minerales</option>
                  <option value="Reproducción">Reproducción</option>
                  <option value="Síntoma / Diagnóstico">Síntoma / Diagnóstico</option>
                  <option value="Tratamiento Médico">Tratamiento Médico</option>
                  <option value="Suplementos">Suplementos</option>
                  <option value="Manejo">Manejo</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Dosis Predeterminada</label>
                  <input
                    type="text"
                    placeholder="Ej. 15ml, 5ml"
                    value={formData.defaultDose}
                    onChange={(e) => setFormData({ ...formData, defaultDose: e.target.value })}
                    className="w-full bg-slate-950 text-slate-100 px-3 py-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Vía de Administración</label>
                  <input
                    type="text"
                    placeholder="Ej. Subcutánea, Oral"
                    value={formData.route}
                    onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                    className="w-full bg-slate-950 text-slate-100 px-3 py-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Notas / Descripción Predeterminada</label>
                <textarea
                  rows="3"
                  placeholder="Ej. Reconstituyente mineral con fósforo activo para preñez o debilidad..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none resize-none"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 bg-slate-800 hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 font-semibold shadow-md"
                >
                  Guardar en Catálogo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
