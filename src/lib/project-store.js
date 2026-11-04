import { randomUUID } from 'node:crypto';
import { getDb, ensureSchema } from './db.js';
import { projects as seeds } from './projects.js';
import { ProjectError, validateProject } from './project-validation.js';

let initialized;
async function ensureProjects() {
  if (!initialized) initialized = (async () => {
    await ensureSchema();
    const client = await getDb().connect();
    try {
      await client.query('BEGIN');
      await client.query(`CREATE TABLE IF NOT EXISTS portfolio_projects (
        id UUID PRIMARY KEY, slug VARCHAR(100) UNIQUE NOT NULL,
        status VARCHAR(20) NOT NULL CHECK (status IN ('draft','published','archived')),
        sort_order INTEGER NOT NULL DEFAULT 0, content JSONB NOT NULL,
        revision INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      ); CREATE TABLE IF NOT EXISTS portfolio_content_meta (key TEXT PRIMARY KEY);
      CREATE TABLE IF NOT EXISTS portfolio_assets (id UUID PRIMARY KEY, bytes BYTEA NOT NULL, mime_type TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`);
      const claim = await client.query("INSERT INTO portfolio_content_meta(key) VALUES ('projects-seeded-v1') ON CONFLICT DO NOTHING RETURNING key");
      if (claim.rowCount) for (const [order, seed] of seeds.entries()) {
        const project = validateProject({ ...seed, status: 'published', github: seed.github || '', live: seed.live || '' });
        await client.query('INSERT INTO portfolio_projects(id,slug,status,sort_order,content) VALUES($1,$2,$3,$4,$5) ON CONFLICT(slug) DO NOTHING', [randomUUID(), project.slug, project.status, order, project]);
      }
      const labsClaim = await client.query("INSERT INTO portfolio_content_meta(key) VALUES ('project-labs-v2') ON CONFLICT DO NOTHING RETURNING key");
      if (labsClaim.rowCount) for (const seed of seeds.filter(project => ['fallback-atlas','scope-lens'].includes(project.slug))) {
        const project = validateProject({ ...seed, status: 'published' });
        await client.query('INSERT INTO portfolio_projects(id,slug,status,sort_order,content) VALUES($1,$2,$3,(SELECT COALESCE(MAX(sort_order),-1)+1 FROM portfolio_projects),$4) ON CONFLICT(slug) DO NOTHING', [randomUUID(),project.slug,project.status,project]);
      }
      await client.query('COMMIT');
    } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
  })().catch((error) => { initialized = undefined; throw error; });
  return initialized;
}
function fromRow(row) { return { ...row.content, id: row.id, slug: row.slug, status: row.status, position: row.sort_order, revision: row.revision, createdAt: row.created_at, updatedAt: row.updated_at }; }
export async function listProjects(admin = false) {
  if (!process.env.DATABASE_URL && !admin) return seeds.map((project, position) => ({ ...project, status: 'published', position }));
  await ensureProjects();
  const result = await getDb().query(`SELECT * FROM portfolio_projects ${admin ? '' : "WHERE status = 'published'"} ORDER BY sort_order, created_at`);
  return result.rows.map(fromRow);
}
export async function publicProjects() {
  try { return await listProjects(); } catch { console.warn('Published projects are temporarily unavailable.'); return []; }
}
export async function findProject(slug, admin = false) { return (await listProjects(admin)).find((project) => project.slug === slug); }
export async function createProject(input) {
  const project = validateProject(input); await ensureProjects();
  const result = await getDb().query('INSERT INTO portfolio_projects(id,slug,status,sort_order,content) VALUES($1,$2,$3,(SELECT COALESCE(MAX(sort_order),-1)+1 FROM portfolio_projects),$4) RETURNING *', [randomUUID(), project.slug, project.status, project]);
  return fromRow(result.rows[0]);
}
export async function updateProject(id, input, revision) {
  if (typeof id !== 'string' || !/^[0-9a-f-]{36}$/i.test(id)) throw new ProjectError('Invalid project identifier.');
  if (!Number.isInteger(revision) || revision < 1) throw new ProjectError('Reload this project before saving.');
  const project = validateProject(input); await ensureProjects();
  const result = await getDb().query('UPDATE portfolio_projects SET slug=$2,status=$3,content=$4,revision=revision+1,updated_at=NOW() WHERE id=$1 AND revision=$5 RETURNING *', [id, project.slug, project.status, project, revision]);
  if (!result.rowCount) throw new ProjectError('This project changed in another session. Refresh the list and reopen it before saving.', 409);
  return fromRow(result.rows[0]);
}
export async function deleteProject(id, revision) {
  if (typeof id !== 'string' || !/^[0-9a-f-]{36}$/i.test(id)) throw new ProjectError('Invalid project identifier.');
  await ensureProjects();
  const result = await getDb().query("DELETE FROM portfolio_projects WHERE id=$1 AND status='archived' AND revision=$2 RETURNING id", [id, revision]);
  if (!result.rowCount) throw new ProjectError('Only archived projects can be permanently deleted. Refresh the project and try again.', 409);
}
export async function reorderProjects(ids) {
  if (!Array.isArray(ids) || ids.length > 500 || new Set(ids).size !== ids.length || ids.some((id) => typeof id !== 'string' || !/^[0-9a-f-]{36}$/i.test(id))) throw new ProjectError('Provide a valid project order.');
  await ensureProjects();
  const client = await getDb().connect();
  try {
    await client.query('BEGIN');
    const current = await client.query('SELECT id FROM portfolio_projects ORDER BY sort_order FOR UPDATE');
    if (current.rowCount !== ids.length || current.rows.some((row) => !ids.includes(row.id))) throw new ProjectError('The project list changed. Refresh before reordering.', 409);
    for (const [order, id] of ids.entries()) await client.query('UPDATE portfolio_projects SET sort_order=$2,revision=revision+1,updated_at=NOW() WHERE id=$1', [id, order]);
    await client.query('COMMIT');
  } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
}
export async function storeAsset(bytes) {
  await ensureProjects(); const id = randomUUID();
  await getDb().query("INSERT INTO portfolio_assets(id,bytes,mime_type) VALUES($1,$2,'image/webp')", [id, bytes]);
  return `/api/project-images/${id}`;
}
export async function readAsset(id) { await ensureProjects(); return (await getDb().query("SELECT bytes,mime_type,EXISTS(SELECT 1 FROM portfolio_projects WHERE status='published' AND content->>'img'=$2) AS published FROM portfolio_assets WHERE id=$1", [id,`/api/project-images/${id}`])).rows[0]; }
