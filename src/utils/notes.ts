// Utilidades 

import type { Note } from '../types/note';

export function deriveTitle(content: string): string {
  if (!content || content.trim() === '') return 'Sin título';

  const cleanContent = content.trim();
  let firstLine = '';

  for (let i = 0; i < cleanContent.length; i++) {
    if (cleanContent[i] === '\n') break;
    firstLine += cleanContent[i];
  }

  if (firstLine.trim() === '') return 'Sin título';
  if (firstLine.length > 50) return firstLine.slice(0, 50) + '...';

  return firstLine.trim();
}

export function deriveExcerpt(content: string, maxLen: number = 100): string {
  if (!content || content.trim() === '') return '';
  const clean = content.trim();
  return clean.length <= maxLen ? clean : clean.slice(0, maxLen) + '...';
}

export function generateID(): number {
  return Date.now();
}

export function createNote(content: string, title?: string): Note | null {
  const trimmed = content.trim();
  if (trimmed === '') return null;

  const now = Date.now();
  return {
    id: generateID(),
    title: title || deriveTitle(content),
    content: trimmed,
    excerpt: deriveExcerpt(content),
    createdAt: now,
    updatedAt: now,
    favorite: false,
  };
}

export function saveToStorage(notes: Note[]): void {
  if (!notes) return;
  localStorage.setItem('markdown-notes', JSON.stringify(notes));
}

export function loadFromStorage(): Note[] {
  const data = localStorage.getItem('markdown-notes');
  if (!data) return [];
  const parsed = JSON.parse(data);
  return Array.isArray(parsed) ? parsed : [];
}