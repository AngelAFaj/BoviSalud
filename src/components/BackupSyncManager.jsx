import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  RefreshCw, 
  CheckCircle2, 
  Wifi, 
  WifiOff, 
  Smartphone, 
  Server, 
  Cloud,
  Code,
  Trash2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { syncEngine } from '../services/syncEngine';

export default function BackupSyncManager({ 
  animals = [], 
  catalog = [], 
  records = [], 
  onRestoreBackup, 
  isOnline 
}) {
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | syncing | success | error
  const [syncMsg, setSyncMsg] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [showSqlSchema, setShowSqlSchema] = useState(false);

  // Clear local IndexedDB cache manually
  const handleClearLocal = async () => {
    if (window.confirm('¿Deseas borrar toda la información almacenada localmente en el navegador para resincronizar con Neon?')) {
      await syncEngine.clearLocalData();
      setSyncMsg('Almacenamiento local limpiado.');
      setSyncStatus('success');
    }
  };

  // Trigger manual sync with Neon Cloud
  const handleNeonSync = async () => {
    setSyncStatus('syncing');
    setSyncMsg('Conectando con Neon PostgreSQL en Netlify...');
    
    const result = await syncEngine.syncWithNeon();
    if (result.success) {
      setSyncStatus('success');
      setSyncMsg(result.message);
    } else {
      setSyncStatus('error');
      setSyncMsg(result.error || result.reason || 'No se pudo conectar a Neon');
    }

    setTimeout(() => {
      if (syncStatus !== 'error') setSyncStatus('idle');
    }, 4000);
  };

  // Export full JSON Backup
  const handleExportJSON = () => {
    const fullData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      animals,
      catalog,
      records
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Backup_GanadoMed_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON Backup file
  const handleImportJSON = (e) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed.animals && parsed.catalog && parsed.records) {
            onRestoreBackup(parsed);
            setUploadMessage('¡Respaldo importado correctamente con éxito!');
          } else {
            setUploadMessage('Error: El archivo no contiene la estructura adecuada.');
          }
        } catch (err) {
          setUploadMessage('Error al leer el archivo de respaldo JSON.');
        }
      };
    }
  };

  // Export Excel Workbook
  const handleExportExcelWorkbook = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Animals
    const animalsData = animals.map(a => ({
      'Arete / Código': a.tagNumber || `#${a.id}`,
      'Nombre': a.name,
      'Categoría': a.category,
      'Sexo': a.gender,
      'Estado': a.status,
      'Fecha Nacimiento': a.birthDate || '',
      'Notas': a.notes || ''
    }));
    const wsAnimals = XLSX.utils.json_to_sheet(animalsData);
    XLSX.utils.book_append_sheet(wb, wsAnimals, 'Ganado');

    // Sheet 2: Medical Records
    const recordsData = records.map(r => ({
      'Bovino': r.animalName,
      'Fecha y Hora': r.datetime ? r.datetime.replace('T', ' ') : '',
      'Indicación': r.indicationTitle,
      'Categoría': r.category || 'General',
      'Dosis': r.dose || '',
      'Notas': r.notes || ''
    }));
    const wsRecords = XLSX.utils.json_to_sheet(recordsData);
    XLSX.utils.book_append_sheet(wb, wsRecords, 'Historial Medico');

    // Sheet 3: Catalog
    const catalogData = catalog.map(c => ({
      'Indicación': c.title,
      'Categoría': c.category,
      'Dosis Predeterminada': c.defaultDose,
      'Vía': c.route,
      'Notas': c.notes
    }));
    const wsCatalog = XLSX.utils.json_to_sheet(catalogData);
    XLSX.utils.book_append_sheet(wb, wsCatalog, 'Catálogo Indicaciones');

    XLSX.writeFile(wb, `Reporte_Completo_Ganadero_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Cloud & Network Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xl ${
            isOnline 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
          }`}>
            {isOnline ? <Cloud className="w-7 h-7" /> : <WifiOff className="w-7 h-7" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-white">Sincronización Netlify & Neon PostgreSQL</h2>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                isOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                {isOnline ? '🟢 Conectado a la Nube' : '🟠 Modo Fuera de Línea'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              El CRUD funciona siempre en este dispositivo. Sin internet los cambios se quedan locales; al volver la señal se <strong>empuja</strong> lo pendiente a Neon y luego se <strong>trae</strong> el estado de la nube. También puedes forzar la sincronización con el botón.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleNeonSync}
            disabled={syncStatus === 'syncing'}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
            <span>{syncStatus === 'syncing' ? 'Sincronizando...' : 'Sincronizar con Neon Cloud'}</span>
          </button>

          <button
            onClick={handleClearLocal}
            title="Limpiar datos locales del navegador"
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-700/50 font-semibold text-xs px-3 py-2.5 rounded-xl transition-all"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Limpiar Datos Locales</span>
          </button>
        </div>
      </div>

      {syncMsg && (
        <div className={`p-4 rounded-xl text-xs flex items-center space-x-2 border ${
          syncStatus === 'error' 
            ? 'bg-amber-950/60 border-amber-800/80 text-amber-300' 
            : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncMsg}</span>
        </div>
      )}

      {/* Grid of Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Exportar Respaldo JSON y Excel */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 mb-3">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Exportar Copia de Seguridad</h3>
            <p className="text-xs text-slate-400">
              Genera un archivo completo con todos tus bovinos, catálogo e historial médico para guardar en un pendrive o enviar por WhatsApp.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <button
              onClick={handleExportJSON}
              className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-md transition-colors"
            >
              <Database className="w-4 h-4" />
              <span>Descargar Respaldo (.JSON Completo)</span>
            </button>

            <button
              onClick={handleExportExcelWorkbook}
              className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-2.5 px-4 rounded-xl border border-slate-700 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Descargar Libro de Excel (.XLSX)</span>
            </button>
          </div>
        </div>

        {/* Card 2: Importar / Restaurar Respaldo JSON */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Restaurar o Cargar Respaldo</h3>
            <p className="text-xs text-slate-400">
              Importa un archivo de respaldo `.JSON` previo para cargar o actualizar la información en este dispositivo.
            </p>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <label className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-md cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>Seleccionar Archivo .JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>

            {uploadMessage && (
              <p className="text-xs text-center font-medium text-emerald-400 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                {uploadMessage}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Guide Card: Neon SQL setup & Netlify Configuration */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Server className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">Configuración de Neon PostgreSQL & Netlify</h3>
          </div>
          <button
            onClick={() => setShowSqlSchema(!showSqlSchema)}
            className="flex items-center space-x-1 text-xs text-emerald-400 hover:underline font-semibold"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showSqlSchema ? 'Ocultar Script SQL' : 'Ver Script SQL para Neon'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          1. Crea una base de datos en <a href="https://neon.tech" target="_blank" rel="noreferrer" className="text-emerald-400 underline">Neon.tech</a>.<br />
          2. En el panel de Netlify, agrega la variable de entorno: <code className="bg-slate-900 px-2 py-0.5 rounded text-emerald-300 font-mono">DATABASE_URL</code> con tu conexión de Neon y vuelve a publicar el sitio.<br />
          3. La función de sync crea las tablas si no existen. El script SQL de abajo es opcional, por si quieres revisarlas en Neon.
        </p>

        {showSqlSchema && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto text-[11px] font-mono text-emerald-400 space-y-1">
            <p className="text-slate-500">// Script SQL para Neon PostgreSQL (schema_neon.sql):</p>
            <pre className="text-slate-300">{`CREATE TABLE IF NOT EXISTS animals (
  id SERIAL PRIMARY KEY, local_id INT, tag_number VARCHAR(50), name VARCHAR(100),
  category VARCHAR(50), gender VARCHAR(20), status VARCHAR(50), birth_date DATE,
  notes TEXT, nationality TEXT
);

CREATE TABLE IF NOT EXISTS catalog (
  id SERIAL PRIMARY KEY, local_id INT, title VARCHAR(150), category VARCHAR(50),
  default_dose VARCHAR(100), route VARCHAR(100), notes TEXT
);

CREATE TABLE IF NOT EXISTS records (
  id SERIAL PRIMARY KEY, local_id INT, animal_id INT, animal_name VARCHAR(100),
  datetime TIMESTAMP WITH TIME ZONE, indication_id INT, indication_title VARCHAR(150),
  category VARCHAR(50), dose VARCHAR(100), notes TEXT, created_offline BOOLEAN
);`}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
