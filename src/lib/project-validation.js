export const projectStatuses = ['draft', 'published', 'archived'];
export const emptyProject = { title: '', slug: '', category: '', group: 'Web & platforms', kind: 'Independent project', desc: '', img: '', stack: [], overview: '', role: '', features: [], challenges: '', outcome: '', github: '', live: '', artwork: false, featured: true, status: 'draft' };

export class ProjectError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
export function validProjectLink(value, image = false) {
  if (!value) return true;
  if (typeof value !== 'string' || value.length > 2000 || /[\s\\\u0000-\u001f]/.test(value)) return false;
  if (value.startsWith('/') && !value.startsWith('//')) return !value.startsWith('/api/admin') && !value.startsWith('/control-panel');
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password && (!image || !url.pathname.toLowerCase().endsWith('.svg')); } catch { return false; }
}
export function validateProject(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new ProjectError('Provide a project object.');
  const project = {};
  const limits = { title: 100, slug: 100, category: 100, group: 80, kind: 100, desc: 500, img: 2000, overview: 6000, role: 250, challenges: 6000, outcome: 3000, github: 2000, live: 2000 };
  for (const [field, max] of Object.entries(limits)) {
    if (input[field] !== undefined && typeof input[field] !== 'string') throw new ProjectError(`${field} must be text.`);
    project[field] = (input[field] || '').trim();
    if (project[field].length > max) throw new ProjectError(`${field} must be at most ${max} characters.`);
  }
  if (!project.title) throw new ProjectError('A project title is required.');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug)) throw new ProjectError('Use lowercase words separated by hyphens for the URL slug.');
  project.status = input.status || 'draft';
  if (!projectStatuses.includes(project.status)) throw new ProjectError('Choose draft, published, or archived.');
  for (const field of ['stack', 'features']) {
    if (!Array.isArray(input[field]) || input[field].length > 24 || input[field].some((item) => typeof item !== 'string' || item.length > 250)) throw new ProjectError(`${field} must contain up to 24 short text entries.`);
    project[field] = [...new Set(input[field].map((item) => item.trim()).filter(Boolean))];
  }
  for (const field of ['featured', 'artwork']) {
    if (input[field] !== undefined && typeof input[field] !== 'boolean') throw new ProjectError(`${field} must be true or false.`);
    project[field] = input[field] ?? field === 'featured';
  }
  for (const field of ['github', 'live', 'img']) if (!validProjectLink(project[field], field === 'img')) throw new ProjectError(`Use a safe HTTPS URL or local path for ${field}.`);
  if (project.status === 'published' && (!project.desc || !project.img || !project.overview || !project.category)) throw new ProjectError('Published projects need a category, summary, cover image, and overview.');
  return project;
}
