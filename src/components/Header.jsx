import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  PlusCircle, 
  Database, 
  BookOpen, 
  Stethoscope, 
  FileSpreadsheet,
  Download,
  Calendar,
  Layers
} from 'lucide-react';

export default function Header({ activeTab, setActiveTab, onOpenMedicalModal, onOpenAnimalModal }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Offline Status */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-950/50">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  GanadoMed
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Offline-First
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Control Ganadero e Historial Médico</p>
            </div>
          </div>

          {/* Network Indicator & Quick Action */}
          <div className="flex items-center space-x-3">
            {/* Status Badge */}
            <div 
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                isOnline 
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50' 
                  : 'bg-amber-950/70 text-amber-300 border-amber-800/60 animate-pulse'
              }`}
              title={isOnline ? "Conectado a Internet" : "Sin Internet - Los datos se guardan localmente"}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden xs:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sin Red (Offline)</span>
                </>
              )}
            </div>

            {/* Quick Medical Entry Button */}
            <button
              onClick={onOpenMedicalModal}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow-md shadow-emerald-900/30 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Registro Médico</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/40">
          <button
            onClick={() => setActiveTab('animals')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'animals'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Ganado (Vacas / Terneros)</span>
          </button>

          <button
            onClick={() => setActiveTab('records')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'records'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Historial Clínico</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'catalog'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Catálogo de Indicaciones</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'backup'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Respaldos & Offline</span>
          </button>
        </div>
      </div>
    </header>
  );
}
