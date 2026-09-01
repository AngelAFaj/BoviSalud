import { neon } from '@neondatabase/serverless';
import { db } from '../db/database';

export const syncEngine = {
  // Sincronizar datos locales con Neon Cloud (Reemplazo / Espejo exacto de Neon)
  syncWithNeon: async () => {
    if (!navigator.onLine) {
      return { success: false, reason: 'Sin conexión a internet' };
    }

    const viteDbUrl = import.meta.env.VITE_DATABASE_URL;

    try {
      let pullData = null;

      // 1. Intentar obtener datos mediante Netlify Function `/api/sync`
      try {
        const pullResponse = await fetch('/api/sync');
        if (pullResponse.ok) {
          const result = await pullResponse.json();
          if (result.success && result.data) {
            pullData = result.data;
          }
        }
      } catch (apiErr) {
        console.log('GanadoMed: /api/sync no disponible en dev local, intentando conexión directa con Neon SDK...');
      }

      // 2. Si /api/sync no respondió (ej. desarrollo local) y tenemos VITE_DATABASE_URL, usar Neon SDK directo
      if (!pullData && viteDbUrl) {
        const sql = neon(viteDbUrl);

        const dbAnimals = await sql`SELECT id, local_id, tag_number, name, category, gender, status, birth_date, notes FROM animals ORDER BY id ASC`;
        const dbCatalog = await sql`SELECT id, local_id, title, category, default_dose, route, notes FROM catalog ORDER BY id ASC`;
        const dbRecords = await sql`SELECT id, local_id, animal_id, animal_name, datetime, indication_id, indication_title, category, dose, notes, created_offline FROM records ORDER BY datetime DESC`;

        pullData = {
          animals: dbAnimals.map(a => ({
            id: a.id,
            tagNumber: a.tag_number,
            name: a.name,
            category: a.category,
            gender: a.gender,
            status: a.status,
            birthDate: a.birth_date,
            notes: a.notes
          })),
          catalog: dbCatalog.map(c => ({
            id: c.id,
            title: c.title,
            category: c.category,
            defaultDose: c.default_dose,
            route: c.route,
            notes: c.notes
          })),
          records: dbRecords.map(r => ({
            id: r.id,
            animalId: r.animal_id,
            animalName: r.animal_name,
            datetime: r.datetime,
            indicationId: r.indication_id,
            indicationTitle: r.indication_title,
            category: r.category,
            dose: r.dose,
            notes: r.notes,
            createdOffline: r.created_offline
          }))
        };
      }

      // 3. Reflejar el estado EXACTO de la base de datos Neon en IndexedDB local
      if (pullData) {
        const { animals = [], catalog = [], records = [] } = pullData;

        await db.animals.clear();
        await db.catalog.clear();
        await db.records.clear();

        if (animals.length > 0) await db.animals.bulkAdd(animals);
        if (catalog.length > 0) await db.catalog.bulkAdd(catalog);
        if (records.length > 0) await db.records.bulkAdd(records);

        return { 
          success: true, 
          message: `Sincronizado con Neon BDD (${animals.length} animales, ${catalog.length} catálogo, ${records.length} registros)` 
        };
      }

      return { success: false, reason: 'No se pudo conectar a Neon BDD' };
    } catch (error) {
      console.warn('GanadoMed error sync:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Limpiar completamente el almacenamiento local
  clearLocalData: async () => {
    await db.animals.clear();
    await db.catalog.clear();
    await db.records.clear();
  }
};
