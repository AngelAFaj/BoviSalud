import { neon } from '@neondatabase/serverless';

export async function handler(event, context) {
  // Configuración de encabezados CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: JSON.stringify({ message: 'OK' }) };
  }

  const databaseUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

  if (!databaseUrl) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'DATABASE_URL no configurada', 
        message: 'Por favor configura la variable de entorno DATABASE_URL en Netlify' 
      })
    };
  }

  const sql = neon(databaseUrl);

  try {
    // 1. GET: Descargar datos desde Neon PostgreSQL (Pull)
    if (event.httpMethod === 'GET') {
      const animals = await sql`SELECT id, local_id, tag_number, name, category, gender, status, birth_date, notes, nationality FROM animals ORDER BY id ASC`;
      const catalog = await sql`SELECT id, local_id, title, category, default_dose, route, notes FROM catalog ORDER BY id ASC`;
      const records = await sql`SELECT id, local_id, animal_id, animal_name, datetime, indication_id, indication_title, category, dose, notes, created_offline FROM records ORDER BY datetime DESC`;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          timestamp: new Date().toISOString(),
          data: {
            animals: animals.map(a => ({
              id: a.id,
              tagNumber: a.tag_number,
              name: a.name,
              category: a.category,
              gender: a.gender,
              status: a.status,
              birthDate: a.birth_date,
              notes: a.notes,
              nationality: a.nationality || ''
            })),
            catalog: catalog.map(c => ({
              id: c.id,
              title: c.title,
              category: c.category,
              defaultDose: c.default_dose,
              route: c.route,
              notes: c.notes
            })),
            records: records.map(r => ({
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
          }
        })
      };
    }

    // 2. POST: Subir datos desde el cliente offline hacia Neon PostgreSQL (Push)
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { newAnimals = [], newCatalog = [], newRecords = [] } = body;

      // Insertar nuevos bovinos
      for (const a of newAnimals) {
        await sql`
          INSERT INTO animals (local_id, tag_number, name, category, gender, status, birth_date, notes, nationality)
          VALUES (${a.id || null}, ${a.tagNumber || ''}, ${a.name}, ${a.category || 'Vaca'}, ${a.gender || 'Hembra'}, ${a.status || 'Sana'}, ${a.birthDate || null}, ${a.notes || ''}, ${a.nationality || ''})
        `;
      }

      // Insertar nuevos ítems del catálogo
      for (const c of newCatalog) {
        await sql`
          INSERT INTO catalog (local_id, title, category, default_dose, route, notes)
          VALUES (${c.id || null}, ${c.title}, ${c.category || 'General'}, ${c.defaultDose || ''}, ${c.route || ''}, ${c.notes || ''})
        `;
      }

      // Insertar nuevos registros médicos
      for (const r of newRecords) {
        await sql`
          INSERT INTO records (local_id, animal_id, animal_name, datetime, indication_id, indication_title, category, dose, notes, created_offline)
          VALUES (${r.animalId || null}, ${r.animalName}, ${r.datetime}, ${r.indicationId || null}, ${r.indicationTitle}, ${r.category || 'General'}, ${r.dose || ''}, ${r.notes || ''}, true)
        `;
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Sincronización con Neon exitosa',
          inserted: {
            animals: newAnimals.length,
            catalog: newCatalog.length,
            records: newRecords.length
          }
        })
      };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método no permitido' }) };
  } catch (error) {
    console.error('Error en Netlify Function Sync:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Error al conectar con Neon PostgreSQL',
        details: error.message
      })
    };
  }
}
