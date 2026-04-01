// Definir la interfaz para una nota
export interface Note {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  createdAt: number;
  updatedAt: number;
  favorite: boolean;
}

declare global {
  interface Window {
    markdownit: () => { render: (content: string) => string };
  }
}