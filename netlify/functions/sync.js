import { neon } from '@neondatabase/serverless';
import { ensureSchema, pullAll, pushAll } from '../../src/services/neonRepository.js';

let schemaReady = false;

function json(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Content-Type': 'application/json',
      ...extraHeaders
    },
    body: JSON.stringify(body)
  };
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return json(200, { message: 'OK' });
  }

  const databaseUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

  if (!databaseUrl) {
    return json(500, {
      error: 'DATABASE_URL no configurada',
      message: 'Configura la variable de entorno DATABASE_URL en Netlify con la cadena de Neon.'
    });
  }

  const sql = neon(databaseUrl);

  try {
    if (!schemaReady) {
      await ensureSchema(sql);
      schemaReady = true;
    }

    if (event.httpMethod === 'GET') {
      const data = await pullAll(sql);
      return json(200, {
        success: true,
        timestamp: new Date().toISOString(),
        data
      });
    }

    if (event.httpMethod === 'POST') {
      let payload = {};
      try {
        payload = JSON.parse(event.body || '{}');
      } catch {
        return json(400, { error: 'JSON inválido', message: 'El cuerpo de la petición no es JSON válido.' });
      }

      const inserted = await pushAll(sql, payload);
      return json(200, {
        success: true,
        message: 'Sincronización con Neon exitosa',
        inserted: inserted.upserted,
        deleted: inserted.deleted
      });
    }

    return json(405, { error: 'Método no permitido' });
  } catch (error) {
    console.error('Error en Netlify Function Sync:', error);
    schemaReady = false;
    return json(500, {
      error: 'Error al conectar con Neon PostgreSQL',
      details: error.message
    });
  }
}
