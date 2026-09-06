function emptyToNull(value) {
  if (value === '' || value === undefined) return null;
  return value;
}

export function mapAnimalsFromDb(rows) {
  return rows.map((a) => ({
    id: a.id,
    remoteId: a.id,
    tagNumber: a.tag_number,
    name: a.name,
    category: a.category,
    gender: a.gender,
    status: a.status,
    birthDate: a.birth_date,
    notes: a.notes,
    nationality: a.nationality || ''
  }));
}

export function mapCatalogFromDb(rows) {
  return rows.map((c) => ({
    id: c.id,
    remoteId: c.id,
    title: c.title,
    category: c.category,
    defaultDose: c.default_dose,
    route: c.route,
    notes: c.notes
  }));
}

export function mapRecordsFromDb(rows) {
  return rows.map((r) => ({
    id: r.id,
    remoteId: r.id,
    animalId: r.animal_id,
    animalName: r.animal_name,
    datetime: r.datetime,
    indicationId: r.indication_id,
    indicationTitle: r.indication_title,
    category: r.category,
    dose: r.dose,
    notes: r.notes,
    createdOffline: r.created_offline
  }));
}

export async function ensureSchema(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS animals (
      id SERIAL PRIMARY KEY,
      local_id INT,
      tag_number VARCHAR(50),
      name VARCHAR(100),
      category VARCHAR(50),
      gender VARCHAR(20),
      status VARCHAR(50),
      birth_date DATE,
      notes TEXT,
      nationality TEXT
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS catalog (
      id SERIAL PRIMARY KEY,
      local_id INT,
      title VARCHAR(150),
      category VARCHAR(50),
      default_dose VARCHAR(100),
      route VARCHAR(100),
      notes TEXT
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS records (
      id SERIAL PRIMARY KEY,
      local_id INT,
      animal_id INT,
      animal_name VARCHAR(100),
      datetime TIMESTAMP WITH TIME ZONE,
      indication_id INT,
      indication_title VARCHAR(150),
      category VARCHAR(50),
      dose VARCHAR(100),
      notes TEXT,
      created_offline BOOLEAN
    )
  `;
  await sql`ALTER TABLE animals ADD COLUMN IF NOT EXISTS nationality TEXT`;
  await sql`ALTER TABLE animals ADD COLUMN IF NOT EXISTS local_id INT`;
  await sql`ALTER TABLE catalog ADD COLUMN IF NOT EXISTS local_id INT`;
  await sql`ALTER TABLE records ADD COLUMN IF NOT EXISTS local_id INT`;
}

export async function pullAll(sql) {
  const animals = await sql`
    SELECT id, local_id, tag_number, name, category, gender, status, birth_date, notes, nationality
    FROM animals
    ORDER BY id ASC
  `;
  const catalog = await sql`
    SELECT id, local_id, title, category, default_dose, route, notes
    FROM catalog
    ORDER BY id ASC
  `;
  const records = await sql`
    SELECT id, local_id, animal_id, animal_name, datetime, indication_id, indication_title, category, dose, notes, created_offline
    FROM records
    ORDER BY datetime DESC
  `;

  return {
    animals: mapAnimalsFromDb(animals),
    catalog: mapCatalogFromDb(catalog),
    records: mapRecordsFromDb(records)
  };
}

function toNumericId(value) {
  if (value === null || value === undefined || value === '') return null;
  const numericId = Number(value);
  return Number.isNaN(numericId) ? null : numericId;
}

async function findExistingId(sql, table, item) {
  const remoteId = toNumericId(item?.remoteId);
  const clientId = toNumericId(item?.id);

  if (table === 'animals') {
    if (remoteId !== null) {
      const byRemote = await sql`SELECT id FROM animals WHERE id = ${remoteId} LIMIT 1`;
      if (byRemote.length) return byRemote[0].id;
    }
    if (clientId !== null) {
      const byLocal = await sql`SELECT id FROM animals WHERE local_id = ${clientId} LIMIT 1`;
      if (byLocal.length) return byLocal[0].id;
    }
  } else if (table === 'catalog') {
    if (remoteId !== null) {
      const byRemote = await sql`SELECT id FROM catalog WHERE id = ${remoteId} LIMIT 1`;
      if (byRemote.length) return byRemote[0].id;
    }
    if (clientId !== null) {
      const byLocal = await sql`SELECT id FROM catalog WHERE local_id = ${clientId} LIMIT 1`;
      if (byLocal.length) return byLocal[0].id;
    }
  } else if (table === 'records') {
    if (remoteId !== null) {
      const byRemote = await sql`SELECT id FROM records WHERE id = ${remoteId} LIMIT 1`;
      if (byRemote.length) return byRemote[0].id;
    }
    if (clientId !== null) {
      const byLocal = await sql`SELECT id FROM records WHERE local_id = ${clientId} LIMIT 1`;
      if (byLocal.length) return byLocal[0].id;
    }
  }

  return null;
}

async function resolveAnimalId(sql, animalId) {
  const numericId = toNumericId(animalId);
  if (numericId === null) return null;

  const byLocal = await sql`SELECT id FROM animals WHERE local_id = ${numericId} LIMIT 1`;
  if (byLocal.length) return byLocal[0].id;

  const byId = await sql`SELECT id FROM animals WHERE id = ${numericId} LIMIT 1`;
  return byId[0]?.id ?? null;
}

async function upsertAnimal(sql, animal) {
  const clientId = toNumericId(animal.id);
  const existingId = await findExistingId(sql, 'animals', animal);
  const payload = {
    localId: clientId,
    tagNumber: animal.tagNumber || '',
    name: animal.name || '',
    category: animal.category || 'Vaca',
    gender: animal.gender || 'Hembra',
    status: animal.status || 'Sana',
    birthDate: emptyToNull(animal.birthDate),
    notes: animal.notes || '',
    nationality: animal.nationality || ''
  };

  if (existingId) {
    await sql`
      UPDATE animals
      SET local_id = ${payload.localId},
          tag_number = ${payload.tagNumber},
          name = ${payload.name},
          category = ${payload.category},
          gender = ${payload.gender},
          status = ${payload.status},
          birth_date = ${payload.birthDate},
          notes = ${payload.notes},
          nationality = ${payload.nationality}
      WHERE id = ${existingId}
    `;
    return existingId;
  }

  const inserted = await sql`
    INSERT INTO animals (local_id, tag_number, name, category, gender, status, birth_date, notes, nationality)
    VALUES (
      ${payload.localId},
      ${payload.tagNumber},
      ${payload.name},
      ${payload.category},
      ${payload.gender},
      ${payload.status},
      ${payload.birthDate},
      ${payload.notes},
      ${payload.nationality}
    )
    RETURNING id
  `;
  return inserted[0].id;
}

async function upsertCatalogItem(sql, item) {
  const clientId = toNumericId(item.id);
  const existingId = await findExistingId(sql, 'catalog', item);
  const payload = {
    localId: clientId,
    title: item.title || '',
    category: item.category || 'General',
    defaultDose: item.defaultDose || '',
    route: item.route || '',
    notes: item.notes || ''
  };

  if (existingId) {
    await sql`
      UPDATE catalog
      SET local_id = ${payload.localId},
          title = ${payload.title},
          category = ${payload.category},
          default_dose = ${payload.defaultDose},
          route = ${payload.route},
          notes = ${payload.notes}
      WHERE id = ${existingId}
    `;
    return existingId;
  }

  const inserted = await sql`
    INSERT INTO catalog (local_id, title, category, default_dose, route, notes)
    VALUES (
      ${payload.localId},
      ${payload.title},
      ${payload.category},
      ${payload.defaultDose},
      ${payload.route},
      ${payload.notes}
    )
    RETURNING id
  `;
  return inserted[0].id;
}

async function upsertRecord(sql, record) {
  const clientId = toNumericId(record.id);
  const existingId = await findExistingId(sql, 'records', record);
  const neonAnimalId = await resolveAnimalId(sql, record.animalId);

  const payload = {
    localId: clientId,
    animalId: neonAnimalId || emptyToNull(record.animalId),
    animalName: record.animalName || '',
    datetime: emptyToNull(record.datetime) || new Date().toISOString(),
    indicationId: emptyToNull(record.indicationId),
    indicationTitle: record.indicationTitle || '',
    category: record.category || 'General',
    dose: record.dose || '',
    notes: record.notes || '',
    createdOffline: record.createdOffline !== false
  };

  if (existingId) {
    await sql`
      UPDATE records
      SET local_id = ${payload.localId},
          animal_id = ${payload.animalId},
          animal_name = ${payload.animalName},
          datetime = ${payload.datetime},
          indication_id = ${payload.indicationId},
          indication_title = ${payload.indicationTitle},
          category = ${payload.category},
          dose = ${payload.dose},
          notes = ${payload.notes},
          created_offline = ${payload.createdOffline}
      WHERE id = ${existingId}
    `;
    return existingId;
  }

  const inserted = await sql`
    INSERT INTO records (
      local_id, animal_id, animal_name, datetime, indication_id,
      indication_title, category, dose, notes, created_offline
    )
    VALUES (
      ${payload.localId},
      ${payload.animalId},
      ${payload.animalName},
      ${payload.datetime},
      ${payload.indicationId},
      ${payload.indicationTitle},
      ${payload.category},
      ${payload.dose},
      ${payload.notes},
      ${payload.createdOffline}
    )
    RETURNING id
  `;
  return inserted[0].id;
}

function normalizeDeleteRef(ref) {
  if (ref && typeof ref === 'object') {
    return { id: toNumericId(ref.id), remoteId: toNumericId(ref.remoteId) };
  }
  return { id: toNumericId(ref), remoteId: null };
}

async function deleteByRef(sql, table, ref) {
  const { id, remoteId } = normalizeDeleteRef(ref);
  if (id === null && remoteId === null) return;

  if (table === 'animals') {
    if (remoteId !== null) {
      await sql`
        DELETE FROM records
        WHERE animal_id IN (SELECT id FROM animals WHERE id = ${remoteId} OR local_id = ${id})
           OR animal_id = ${remoteId}
           OR animal_id = ${id}
      `;
      await sql`DELETE FROM animals WHERE id = ${remoteId} OR local_id = ${id}`;
      return;
    }
    if (id !== null) {
      await sql`DELETE FROM records WHERE animal_id IN (SELECT id FROM animals WHERE local_id = ${id}) OR animal_id = ${id}`;
      await sql`DELETE FROM animals WHERE local_id = ${id}`;
    }
    return;
  }

  if (table === 'catalog') {
    if (remoteId !== null) {
      await sql`DELETE FROM catalog WHERE id = ${remoteId} OR local_id = ${id}`;
      return;
    }
    if (id !== null) {
      await sql`DELETE FROM catalog WHERE local_id = ${id}`;
    }
    return;
  }

  if (table === 'records') {
    if (remoteId !== null) {
      await sql`DELETE FROM records WHERE id = ${remoteId} OR local_id = ${id}`;
      return;
    }
    if (id !== null) {
      await sql`DELETE FROM records WHERE local_id = ${id}`;
    }
  }
}

function uniqueDeleteRefs(refs = []) {
  const seen = new Set();
  const result = [];
  for (const ref of refs) {
    const normalized = normalizeDeleteRef(ref);
    if (normalized.id === null && normalized.remoteId === null) continue;
    const key = `${normalized.id}:${normalized.remoteId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
  }
  return result;
}

export async function pushAll(sql, payload = {}) {
  const animals = payload.animals || payload.newAnimals || [];
  const catalog = payload.catalog || payload.newCatalog || [];
  const records = payload.records || payload.newRecords || [];
  const deleted = payload.deleted || {};

  const deletedAnimals = uniqueDeleteRefs(deleted.animals);
  const deletedCatalog = uniqueDeleteRefs(deleted.catalog);
  const deletedRecords = uniqueDeleteRefs(deleted.records);

  for (const ref of deletedAnimals) {
    await deleteByRef(sql, 'animals', ref);
  }
  for (const ref of deletedCatalog) {
    await deleteByRef(sql, 'catalog', ref);
  }
  for (const ref of deletedRecords) {
    await deleteByRef(sql, 'records', ref);
  }

  for (const animal of animals) {
    await upsertAnimal(sql, animal);
  }
  for (const item of catalog) {
    await upsertCatalogItem(sql, item);
  }
  for (const record of records) {
    await upsertRecord(sql, record);
  }

  return {
    upserted: {
      animals: animals.length,
      catalog: catalog.length,
      records: records.length
    },
    deleted: {
      animals: deletedAnimals.length,
      catalog: deletedCatalog.length,
      records: deletedRecords.length
    }
  };
}
