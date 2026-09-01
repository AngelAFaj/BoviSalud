import Dexie from 'dexie';

export const db = new Dexie('GanadoMedDB');

// Definir esquemas para Dexie IndexedDB
db.version(1).stores({
  animals: '++id, tagNumber, name, category, gender, status, birthDate, nationality, createdAt',
  catalog: '++id, title, category, defaultDose, route, notes, createdAt',
  records: '++id, animalId, animalName, datetime, indicationId, indicationTitle, category, dose, notes, createdOffline',
  syncQueue: '++id, action, entity, data, timestamp'
});

// Función opcional para cargar datos de prueba si el usuario lo solicita manualmente
export async function seedInitialData() {
  // No auto-sembrar para respetar el estado real de la base de datos Neon
}
