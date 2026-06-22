import { customAlphabet } from 'nanoid';

const suffix = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 6);

/** Builds a URL-friendly, collision-resistant slug from a title. */
export function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
  return `${base || 'vehicle'}-${suffix()}`;
}
