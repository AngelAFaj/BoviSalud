import Dexie from 'dexie';

export const db = new Dexie('GanadoMedDB');

// Definir esquemas para Dexie IndexedDB
db.version(1).stores({
  animals: '++id, tagNumber, name, category, gender, status, birthDate, createdAt',
  catalog: '++id, title, category, defaultDose, route, notes, createdAt',
  records: '++id, animalId, animalName, datetime, indicationId, indicationTitle, category, dose, notes, createdOffline',
  syncQueue: '++id, action, entity, data, timestamp'
});

// Semilla de datos iniciales basada en las notas de campo del usuario
export async function seedInitialData() {
  const animalsCount = await db.animals.count();
  if (animalsCount === 0) {
    // 1. Carga inicial de animales del cuaderno de notas
    const initialAnimals = [
      { tagNumber: 'V-001', name: 'Bamby', category: 'Vaca', gender: 'Hembra', status: 'Preñada', birthDate: '2022-04-15', notes: 'Excelente reproductora' },
      { tagNumber: 'T-002', name: 'Baby', category: 'Ternero', gender: 'Macho', status: 'En Tratamiento', birthDate: '2025-11-20', notes: 'Hijo de Bamby' },
      { tagNumber: 'V-003', name: 'Valentina', category: 'Vaca', gender: 'Hembra', status: 'Sana', birthDate: '2021-08-10', notes: '' },
      { tagNumber: 'V-004', name: 'TunTun', category: 'Vaca', gender: 'Hembra', status: 'Preñada', birthDate: '2023-01-05', notes: '' },
      { tagNumber: 'V-005', name: 'Angelita', category: 'Vaca', gender: 'Hembra', status: 'Sana', birthDate: '2022-09-12', notes: 'Observar celos' },
      { tagNumber: 'V-006', name: 'Andreina', category: 'Vaca', gender: 'Hembra', status: 'Sana', birthDate: '2023-03-20', notes: '' },
      { tagNumber: 'V-007', name: 'Empanada', category: 'Vaca', gender: 'Hembra', status: 'Preñada', birthDate: '2021-11-01', notes: '' },
      { tagNumber: 'V-008', name: 'Morena', category: 'Vaca', gender: 'Hembra', status: 'Destetada', birthDate: '2022-06-30', notes: '' },
      { tagNumber: 'V-009', name: 'Sky', category: 'Vaca', gender: 'Hembra', status: 'Preñada', birthDate: '2022-12-14', notes: '' },
      { tagNumber: 'V-010', name: 'Sorpresa', category: 'Vaca', gender: 'Hembra', status: 'Preñada', birthDate: '2023-05-18', notes: '' },
      { tagNumber: 'V-011', name: 'Pancha', category: 'Vaca', gender: 'Hembra', status: 'Preñada', birthDate: '2020-10-04', notes: '' },
      { tagNumber: 'V-012', name: 'Chuchu', category: 'Vaca', gender: 'Hembra', status: 'Sana', birthDate: '2022-02-28', notes: '' },
      { tagNumber: 'V-013', name: 'Oregas', category: 'Vaca', gender: 'Hembra', status: 'Sana', birthDate: '2023-04-11', notes: '' },
      { tagNumber: 'V-014', name: 'Suca', category: 'Vaca', gender: 'Hembra', status: 'Sana', birthDate: '2023-07-22', notes: '' }
    ];

    const addedAnimals = await Promise.all(
      initialAnimals.map(a => db.animals.add({ ...a, createdAt: new Date().toISOString() }))
    );

    // 2. Carga inicial del catálogo de indicaciones reutilizables
    const initialCatalog = [
      { title: 'Fosfosan', category: 'Vitaminas y Minerales', defaultDose: '15ml', route: 'Subcutánea / Intramuscular', notes: 'Reconstituyente mineral y fósforo activo' },
      { title: 'Catosal', category: 'Vitaminas y Minerales', defaultDose: '10ml', route: 'Subcutánea', notes: 'Estimulante metabólico con Vitamina B12' },
      { title: 'Vigantol', category: 'Vitaminas y Minerales', defaultDose: '5ml', route: 'Intramuscular', notes: 'Vitaminas A, D3, E para desarrollo y reproducción' },
      { title: 'Bovisan Total SC', category: 'Vacunación', defaultDose: '5ml', route: 'Subcutánea', notes: 'Vacuna polivalente bovina' },
      { title: 'Radex', category: 'Desparasitación', defaultDose: '10ml', route: 'Oral / Inyectable', notes: 'Antiparasitario de amplio espectro' },
      { title: 'Livasol', category: 'Desparasitación', defaultDose: '20ml', route: 'Oral', notes: 'Desparasitante interno' },
      { title: 'Inseminación Artificial', category: 'Reproducción', defaultDose: '1 pajuela', route: 'Intrauterina', notes: 'Incluye aplicación hormonal y registro de hora' },
      { title: 'Comprobación de Preñez', category: 'Reproducción', defaultDose: 'N/A', route: 'Palpación / Eco', notes: 'Verificación de estado gestacional' },
      { title: 'Tratamiento de Sincronización', category: 'Reproducción', defaultDose: 'Según protocolo', route: 'Hormonal', notes: 'Preparación de celo sincronizado' },
      { title: 'Suero Oral / Vitaminas', category: 'Suplementos', defaultDose: '20ml', route: 'Oral', notes: 'Rehidratación y fortaleza' },
      { title: 'Ferro 100', category: 'Vitaminas y Minerales', defaultDose: '10ml', route: 'Intramuscular', notes: 'Suplemento de hierro para terneros' },
      { title: 'Frankllin Antibiótico', category: 'Tratamiento Médico', defaultDose: '10ml', route: 'Intramuscular', notes: 'Tratamiento para afecciones pulmonares' },
      { title: 'Síntoma: Vota baba gruesa', category: 'Síntoma / Diagnóstico', defaultDose: 'N/A', route: 'Observación', notes: 'Baba con centro blanco o clara' },
      { title: 'Destete Completo', category: 'Manejo', defaultDose: 'N/A', route: 'Manejo', notes: 'Separación y suplementación de destete' }
    ];

    await Promise.all(
      initialCatalog.map(c => db.catalog.add({ ...c, createdAt: new Date().toISOString() }))
    );

    // 3. Carga inicial de registros médicos de prueba (extraídos de la libreta)
    const initialRecords = [
      {
        animalId: addedAnimals[0],
        animalName: 'Bamby',
        datetime: '2026-02-05T08:30:00',
        indicationTitle: 'Inseminación Artificial',
        category: 'Reproducción',
        dose: '2 pajuelas + Hormonal',
        notes: 'Inseminada 8:30 Dr. Frankllin',
        createdOffline: true
      },
      {
        animalId: addedAnimals[1],
        animalName: 'Baby',
        datetime: '2026-02-08T09:15:00',
        indicationTitle: 'Suero Oral / Vitaminas',
        category: 'Suplementos',
        dose: '2 dosis de Livasol',
        notes: 'Empanada ternero Livasol 3 dosis',
        createdOffline: true
      },
      {
        animalId: addedAnimals[2],
        animalName: 'Valentina',
        datetime: '2026-02-08T10:00:00',
        indicationTitle: 'Síntoma: Vota baba gruesa',
        category: 'Síntoma / Diagnóstico',
        dose: 'N/A',
        notes: 'Vota baba gruesa con centro blanco',
        createdOffline: true
      },
      {
        animalId: addedAnimals[0], // Bamby
        animalName: 'Todas (Masivo)',
        datetime: '2026-02-19T07:00:00',
        indicationTitle: 'Bovisan Total SC',
        category: 'Vacunación',
        dose: '5ml SC',
        notes: 'Se vacuna a todas las vacas del lote',
        createdOffline: true
      },
      {
        animalId: addedAnimals[0],
        animalName: 'Bamby',
        datetime: '2026-02-20T08:00:00',
        indicationTitle: 'Fosfosan',
        category: 'Vitaminas y Minerales',
        dose: '15ml',
        notes: 'Y Morena 10ml complejo B',
        createdOffline: true
      },
      {
        animalId: addedAnimals[6],
        animalName: 'Empanada',
        datetime: '2026-03-07T11:20:00',
        indicationTitle: 'Comprobación de Preñez',
        category: 'Reproducción',
        dose: 'N/A',
        notes: 'Empanada, Sky, Sorpresa - Livasol 20ml comprobada preñez',
        createdOffline: true
      }
    ];

    await Promise.all(
      initialRecords.map(r => db.records.add({ ...r, createdAt: new Date().toISOString() }))
    );

    console.log('GanadoMed: Base de datos inicial sembrada con éxito.');
  }
}
