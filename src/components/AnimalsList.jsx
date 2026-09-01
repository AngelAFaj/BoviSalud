import React, { useState } from 'react';
import AnimalCard from './AnimalCard';
import { Search, Plus, Filter, RefreshCw } from 'lucide-react';

export default function AnimalsList({ 
  animals = [], 
  records = [], 
  onViewTimeline, 
  onAddMedical, 
  onAddAnimal, 
  onEditAnimal, 
  onDeleteAnimal 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // Map last medical record for each animal
  const getLastRecordForAnimal = (animalId) => {
    const animalRecords = records.filter(r => r.animalId === animalId);
    if (!animalRecords.length) return null;
    return animalRecords.sort((a, b) => new Date(b.datetime) - new Date(a.datetime))[0];
  };

  // Filter animals logic
  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = 
      animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (animal.tagNumber && animal.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = 
      categoryFilter === 'Todos' || 
      (categoryFilter === 'Terneros' ? (animal.category === 'Ternero' || animal.category === 'Ternera') : animal.category === categoryFilter);

    const matchesStatus = 
      statusFilter === 'Todos' || animal.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Controls & Search Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre o pajuela..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/90 text-slate-100 placeholder-slate-500 pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none text-sm transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Tabs */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            {['Todos', 'Vaca', 'Terneros', 'Toro'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  categoryFilter === cat
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 text-slate-200 text-xs font-medium px-3 py-2 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none"
          >
            <option value="Todos">Todos los Estados</option>
            <option value="Sana">Sana</option>
            <option value="Preñada">Preñada</option>
            <option value="En Tratamiento">En Tratamiento</option>
            <option value="Destetada">Destetada</option>
            <option value="Vendida">Vendida</option>
          </select>

          {/* Add Animal Button */}
          <button
            onClick={onAddAnimal}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs px-3.5 py-2 rounded-xl border border-slate-700/80 transition-colors ml-auto md:ml-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Bovino</span>
          </button>
        </div>
      </div>

      {/* Animal Cards Grid */}
      {filteredAnimals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAnimals.map((animal) => (
            <AnimalCard
              key={animal.id}
              animal={animal}
              lastRecord={getLastRecordForAnimal(animal.id)}
              onViewTimeline={onViewTimeline}
              onAddMedical={onAddMedical}
              onEdit={onEditAnimal}
              onDelete={onDeleteAnimal}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800 my-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto mb-4 border border-slate-800 text-slate-500">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-300">No se encontraron bovinos</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Prueba ajustando los filtros de búsqueda o registra un nuevo animal en la base de datos local.
          </p>
          <button
            onClick={onAddAnimal}
            className="mt-4 inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-4 py-2 rounded-xl shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Primer Bovino</span>
          </button>
        </div>
      )}
    </div>
  );
}
