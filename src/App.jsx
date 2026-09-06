import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedInitialData } from './db/database';
import { syncEngine } from './services/syncEngine';

import Header from './components/Header';
import StatsOverview from './components/StatsOverview';
import AnimalsList from './components/AnimalsList';
import AnimalDetail from './components/AnimalDetail';
import AnimalModal from './components/AnimalModal';
import MedicalRecordsList from './components/MedicalRecordsList';
import MedicalRecordFormModal from './components/MedicalRecordFormModal';
import CatalogManager from './components/CatalogManager';
import BackupSyncManager from './components/BackupSyncManager';

export default function App() {
  const [activeTab, setActiveTab] = useState('animals'); // 'animals' | 'records' | 'catalog' | 'backup'
  const [selectedAnimalForDetail, setSelectedAnimalForDetail] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Modals state
  const [isAnimalModalOpen, setIsAnimalModalOpen] = useState(false);
  const [animalToEdit, setAnimalToEdit] = useState(null);

  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const [preselectedAnimalId, setPreselectedAnimalId] = useState(null);

  // Live queries from IndexedDB using Dexie
  const animals = useLiveQuery(() => db.animals.toArray(), []) || [];
  const catalog = useLiveQuery(() => db.catalog.toArray(), []) || [];
  const records = useLiveQuery(() => db.records.toArray(), []) || [];

  // Seed, sync al cargar y volver a empujar/traer cuando regrese internet
  useEffect(() => {
    async function initApp() {
      await seedInitialData();
      if (navigator.onLine) {
        await syncEngine.syncWithNeon();
      }
    }
    initApp();

    const handleOnline = () => {
      setIsOnline(true);
      syncEngine.syncWithNeon();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // --- Animal Handlers ---
  const handleSaveAnimal = async (formData, editId) => {
    if (editId) {
      await db.animals.update(editId, {
        ...formData,
        updatedAt: new Date().toISOString()
      });
    } else {
      await db.animals.add({
        ...formData,
        createdAt: new Date().toISOString()
      });
    }
    syncEngine.scheduleSync();
  };

  const handleDeleteAnimal = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este bovino y su historial?')) {
      const animal = animals.find((item) => item.id === id);
      const relatedRecords = records.filter(r => r.animalId === id);
      await db.animals.delete(id);
      await Promise.all(relatedRecords.map(r => db.records.delete(r.id)));
      await syncEngine.queueDelete('animals', id, animal?.remoteId);
      await Promise.all(relatedRecords.map(r => syncEngine.queueDelete('records', r.id, r.remoteId)));
      if (selectedAnimalForDetail && selectedAnimalForDetail.id === id) {
        setSelectedAnimalForDetail(null);
      }
      syncEngine.scheduleSync();
    }
  };

  // --- Medical Record Handlers ---
  const handleSaveMedicalRecord = async (recordData, isBatch) => {
    if (isBatch && Array.isArray(recordData)) {
      await Promise.all(
        recordData.map(r => db.records.add({
          ...r,
          createdAt: new Date().toISOString(),
          createdOffline: !navigator.onLine
        }))
      );
    } else {
      await db.records.add({
        ...recordData,
        createdAt: new Date().toISOString(),
        createdOffline: !navigator.onLine
      });
    }
    syncEngine.scheduleSync();
  };

  const handleDeleteRecord = async (id) => {
    if (window.confirm('¿Deseas eliminar esta atención médica del registro?')) {
      const record = records.find((item) => item.id === id);
      await db.records.delete(id);
      await syncEngine.queueDelete('records', id, record?.remoteId);
      syncEngine.scheduleSync();
    }
  };

  // --- Catalog Handlers ---
  const handleAddCatalogItem = async (formData) => {
    await db.catalog.add({
      ...formData,
      createdAt: new Date().toISOString()
    });
    syncEngine.scheduleSync();
  };

  const handleEditCatalogItem = async (id, formData) => {
    await db.catalog.update(id, {
      ...formData,
      updatedAt: new Date().toISOString()
    });
    syncEngine.scheduleSync();
  };

  const handleDeleteCatalogItem = async (id) => {
    if (window.confirm('¿Deseas eliminar esta indicación del catálogo?')) {
      const item = catalog.find((entry) => entry.id === id);
      await db.catalog.delete(id);
      await syncEngine.queueDelete('catalog', id, item?.remoteId);
      syncEngine.scheduleSync();
    }
  };

  // --- Restore Backup Handler ---
  const handleRestoreBackup = async (parsedData) => {
    if (window.confirm('¿Estás seguro de sobrescribir tus datos locales con el respaldo importado?')) {
      const previousAnimals = await db.animals.toArray();
      const previousCatalog = await db.catalog.toArray();
      const previousRecords = await db.records.toArray();

      const nextAnimalIds = new Set((parsedData.animals || []).map((item) => item.id));
      const nextCatalogIds = new Set((parsedData.catalog || []).map((item) => item.id));
      const nextRecordIds = new Set((parsedData.records || []).map((item) => item.id));

      await db.animals.clear();
      await db.catalog.clear();
      await db.records.clear();

      if (parsedData.animals?.length) await db.animals.bulkAdd(parsedData.animals);
      if (parsedData.catalog?.length) await db.catalog.bulkAdd(parsedData.catalog);
      if (parsedData.records?.length) await db.records.bulkAdd(parsedData.records);

      await Promise.all([
        ...previousAnimals
          .filter((item) => !nextAnimalIds.has(item.id))
          .map((item) => syncEngine.queueDelete('animals', item.id, item.remoteId)),
        ...previousCatalog
          .filter((item) => !nextCatalogIds.has(item.id))
          .map((item) => syncEngine.queueDelete('catalog', item.id, item.remoteId)),
        ...previousRecords
          .filter((item) => !nextRecordIds.has(item.id))
          .map((item) => syncEngine.queueDelete('records', item.id, item.remoteId))
      ]);

      syncEngine.scheduleSync();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedAnimalForDetail(null);
        }}
        onOpenMedicalModal={() => {
          setPreselectedAnimalId(null);
          setIsMedicalModalOpen(true);
        }}
        onOpenAnimalModal={() => {
          setAnimalToEdit(null);
          setIsAnimalModalOpen(true);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Summary Bar */}
        <StatsOverview animals={animals} records={records} />

        {/* Tab Content Renderer */}
        {selectedAnimalForDetail ? (
          <AnimalDetail
            animal={selectedAnimalForDetail}
            records={records}
            onBack={() => setSelectedAnimalForDetail(null)}
            onAddMedical={(animalObj) => {
              setPreselectedAnimalId(animalObj.id);
              setIsMedicalModalOpen(true);
            }}
            onDeleteRecord={handleDeleteRecord}
          />
        ) : (
          <>
            {activeTab === 'animals' && (
              <AnimalsList
                animals={animals}
                records={records}
                onViewTimeline={(animalObj) => setSelectedAnimalForDetail(animalObj)}
                onAddMedical={(animalObj) => {
                  setPreselectedAnimalId(animalObj.id);
                  setIsMedicalModalOpen(true);
                }}
                onAddAnimal={() => {
                  setAnimalToEdit(null);
                  setIsAnimalModalOpen(true);
                }}
                onEditAnimal={(animalObj) => {
                  setAnimalToEdit(animalObj);
                  setIsAnimalModalOpen(true);
                }}
                onDeleteAnimal={handleDeleteAnimal}
              />
            )}

            {activeTab === 'records' && (
              <MedicalRecordsList
                records={records}
                animals={animals}
                onDeleteRecord={handleDeleteRecord}
                onOpenMedicalModal={() => {
                  setPreselectedAnimalId(null);
                  setIsMedicalModalOpen(true);
                }}
              />
            )}

            {activeTab === 'catalog' && (
              <CatalogManager
                catalog={catalog}
                onAddCatalogItem={handleAddCatalogItem}
                onEditCatalogItem={handleEditCatalogItem}
                onDeleteCatalogItem={handleDeleteCatalogItem}
              />
            )}

            {activeTab === 'backup' && (
              <BackupSyncManager
                animals={animals}
                catalog={catalog}
                records={records}
                onRestoreBackup={handleRestoreBackup}
                isOnline={isOnline}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <AnimalModal
        isOpen={isAnimalModalOpen}
        onClose={() => setIsAnimalModalOpen(false)}
        onSave={handleSaveAnimal}
        animalToEdit={animalToEdit}
      />

      <MedicalRecordFormModal
        isOpen={isMedicalModalOpen}
        onClose={() => setIsMedicalModalOpen(false)}
        animals={animals}
        catalog={catalog}
        onSaveRecord={handleSaveMedicalRecord}
        preselectedAnimalId={preselectedAnimalId}
      />
    </div>
  );
}
