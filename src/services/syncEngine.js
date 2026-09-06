import { neon } from '@neondatabase/serverless';
import { db } from '../db/database';
import { ensureSchema, pullAll, pushAll } from './neonRepository';

const SYNC_DEBOUNCE_MS = 700;

let debounceTimer = null;
let syncInFlight = null;
let resyncAfterCurrent = false;

async function collectDeletedIds() {
  const queued = await db.syncQueue.toArray();
  const deleted = { animals: [], catalog: [], records: [] };

  for (const item of queued) {
    if (item.action !== 'delete') continue;
    if (!deleted[item.entity]) continue;
    const id = item.data?.id ?? item.data;
    const remoteId = item.data?.remoteId ?? null;
    deleted[item.entity].push({ id, remoteId });
  }

  return deleted;
}

async function buildPushPayload() {
  const [animals, catalog, records, deleted] = await Promise.all([
    db.animals.toArray(),
    db.catalog.toArray(),
    db.records.toArray(),
    collectDeletedIds()
  ]);

  return { animals, catalog, records, deleted };
}

function hasPendingWork(payload) {
  return (
    payload.animals.length > 0 ||
    payload.catalog.length > 0 ||
    payload.records.length > 0 ||
    (payload.deleted.animals?.length || 0) > 0 ||
    (payload.deleted.catalog?.length || 0) > 0 ||
    (payload.deleted.records?.length || 0) > 0
  );
}

async function postViaApi(payload) {
  const response = await fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.success) {
    throw new Error(result.message || result.error || result.details || `Error HTTP ${response.status} al subir datos`);
  }
  return result;
}

async function pullViaApi() {
  const response = await fetch('/api/sync');
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || result.error || result.details || `Error HTTP ${response.status} al descargar datos`);
  }
  return result.data;
}

async function syncViaDirectSdk(payload, shouldPush) {
  const viteDbUrl = import.meta.env.VITE_DATABASE_URL;
  if (!viteDbUrl) return null;

  const sql = neon(viteDbUrl);
  await ensureSchema(sql);
  if (shouldPush) {
    await pushAll(sql, payload);
  }
  return pullAll(sql);
}

async function applyRemoteSnapshot(pullData) {
  const { animals = [], catalog = [], records = [] } = pullData;

  await db.transaction('rw', db.animals, db.catalog, db.records, db.syncQueue, async () => {
    await db.animals.clear();
    await db.catalog.clear();
    await db.records.clear();
    await db.syncQueue.clear();

    if (animals.length > 0) await db.animals.bulkAdd(animals);
    if (catalog.length > 0) await db.catalog.bulkAdd(catalog);
    if (records.length > 0) await db.records.bulkAdd(records);
  });

  return {
    success: true,
    message: `Sincronizado con Neon (${animals.length} animales, ${catalog.length} catálogo, ${records.length} registros)`
  };
}

async function runSync() {
  if (!navigator.onLine) {
    return { success: false, reason: 'Sin conexión a internet. Los cambios quedan guardados en este dispositivo.' };
  }

  const payload = await buildPushPayload();
  const shouldPush = hasPendingWork(payload);
  let pullData = null;
  let usedApi = false;

  try {
    if (shouldPush) {
      await postViaApi(payload);
    }
    pullData = await pullViaApi();
    usedApi = true;
  } catch (apiError) {
    console.warn('GanadoMed: /api/sync no disponible, intentando SDK directo:', apiError.message);
    try {
      pullData = await syncViaDirectSdk(payload, shouldPush);
    } catch (sdkError) {
      return {
        success: false,
        error: sdkError.message || apiError.message,
        reason: 'No se pudo conectar a Neon. Los datos locales se conservaron.'
      };
    }
  }

  if (!pullData) {
    return {
      success: false,
      reason: usedApi
        ? 'Neon no devolvió datos. Se conservan los cambios locales.'
        : 'No se pudo conectar a Neon. Configura DATABASE_URL en Netlify o VITE_DATABASE_URL en local.'
    };
  }

  const remoteCount = (pullData.animals?.length || 0) + (pullData.catalog?.length || 0) + (pullData.records?.length || 0);
  const localCount = payload.animals.length + payload.catalog.length + payload.records.length;

  if (shouldPush && remoteCount === 0 && localCount > 0) {
    return {
      success: false,
      reason: 'Neon respondió vacío después de subir datos. Se conservan los datos locales para no perderlos.'
    };
  }

  return applyRemoteSnapshot(pullData);
}

export const syncEngine = {
  queueDelete: async (entity, id, remoteId = null) => {
    if (!id && id !== 0) return;
    await db.syncQueue.add({
      action: 'delete',
      entity,
      data: { id, remoteId },
      timestamp: Date.now()
    });
  },

  scheduleSync: (delayMs = SYNC_DEBOUNCE_MS) => {
    if (!navigator.onLine) return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      syncEngine.syncWithNeon();
    }, delayMs);
  },

  syncWithNeon: async () => {
    if (syncInFlight) {
      resyncAfterCurrent = true;
      return syncInFlight;
    }

    syncInFlight = (async () => {
      try {
        return await runSync();
      } catch (error) {
        console.warn('GanadoMed error sync:', error.message);
        return { success: false, error: error.message, reason: 'Error al sincronizar. Los datos locales se conservaron.' };
      } finally {
        syncInFlight = null;
        if (resyncAfterCurrent) {
          resyncAfterCurrent = false;
          syncEngine.scheduleSync(300);
        }
      }
    })();

    return syncInFlight;
  },

  clearLocalData: async () => {
    await db.animals.clear();
    await db.catalog.clear();
    await db.records.clear();
    await db.syncQueue.clear();
  }
};
