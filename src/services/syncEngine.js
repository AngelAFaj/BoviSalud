import { db } from '../db/database';

export const syncEngine = {
  // Sincronizar datos locales con Neon Cloud (Push y Pull)
  syncWithNeon: async () => {
    if (!navigator.onLine) {
      return { success: false, reason: 'Sin conexión a internet' };
    }

    try {
      // 1. PUSH: Obtener datos locales que no hayan sido sincronizados aún
      const allLocalAnimals = await db.animals.toArray();
      const allLocalCatalog = await db.catalog.toArray();
      const allLocalRecords = await db.records.toArray();

      // Enviar a la Netlify Function
      const pushResponse = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newAnimals: allLocalAnimals,
          newCatalog: allLocalCatalog,
          newRecords: allLocalRecords
        })
      });

      if (!pushResponse.ok) {
        const errJson = await pushResponse.json().catch(() => ({}));
        throw new Error(errJson.message || `Error HTTP ${pushResponse.status}`);
      }

      // 2. PULL: Obtener los últimos datos actualizados de Neon
      const pullResponse = await fetch('/api/sync');
      if (pullResponse.ok) {
        const result = await pullResponse.json();
        if (result.success && result.data) {
          const { animals = [], catalog = [], records = [] } = result.data;

          // Consolidar en IndexedDB local sin duplicar
          if (animals.length > 0) {
            for (const a of animals) {
              const existing = await db.animals.where('name').equals(a.name).first();
              if (!existing) {
                await db.animals.add(a);
              }
            }
          }

          if (catalog.length > 0) {
            for (const c of catalog) {
              const existing = await db.catalog.where('title').equals(c.title).first();
              if (!existing) {
                await db.catalog.add(c);
              }
            }
          }

          if (records.length > 0) {
            for (const r of records) {
              const existing = await db.records.where('datetime').equals(r.datetime).and(item => item.animalName === r.animalName).first();
              if (!existing) {
                await db.records.add(r);
              }
            }
          }
        }
      }

      return { success: true, message: 'Sincronización con Neon completada con éxito' };
    } catch (error) {
      console.warn('GanadoMed: Nota de sincronización:', error.message);
      return { success: false, error: error.message };
    }
  }
};
