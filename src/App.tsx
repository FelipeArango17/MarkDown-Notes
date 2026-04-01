import { useState, useEffect } from "react";
import type { Note } from "./types/note";
import {
  loadFromStorage,
  saveToStorage,
  createNote,
  deriveTitle,
  deriveExcerpt,
} from "./utils/notes";
import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";
import Preview from "./components/Preview";
import ThemeToggle from "./components/ThemeToggle";

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNoteId, setCurrentNoteId] = useState<number | null>(null);
  const [editorContent, setEditorContent] = useState<string>("");
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  function handleToggleDarkMode() {
    setIsDarkMode((prev) => !prev);
  }

  useEffect(() => {
    const saved = loadFromStorage();
    setNotes(saved);
  }, []);

  useEffect(() => {
    saveToStorage(notes);
  }, [notes]);

  const currentNote = notes.find((note) => note.id === currentNoteId) ?? null;

  function handleNewNote() {
    setCurrentNoteId(null);
    setEditorContent("");
    setIsEditorOpen(true);
  }

  function handleSelectNote(id: number) {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    setCurrentNoteId(id);
    setEditorContent(note.content);
    setIsEditorOpen(true);
  }

  function handleDeleteNote() {
    if (currentNoteId === null) return;
    const confirmed = confirm("¿Estás seguro de eliminar esta nota?");
    if (!confirmed) return;
    setNotes((prev) => prev.filter((note) => note.id !== currentNoteId));
    setCurrentNoteId(null);
    setEditorContent("");
    setIsEditorOpen(false);
  }

  function handleContentChange(content: string) {
    setEditorContent(content);
  }

  function handleSave(content: string) {
    if (content.trim() === "") return;

    if (currentNoteId !== null) {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === currentNoteId
            ? {
                ...note,
                content,
                title: deriveTitle(content),
                excerpt: deriveExcerpt(content),
                updatedAt: Date.now(),
              }
            : note,
        ),
      );
    } else {
      const newNote = createNote(content);
      if (!newNote) return;
      setNotes((prev) => [...prev, newNote]);
      setCurrentNoteId(newNote.id);
    }
  }

  return (
    <div className="container" data-theme={isDarkMode ? "dark" : "light"}>
      <header>
        <h1>Sistema de Notas Markdown</h1>
      </header>
      <div className="main-content">
        <Sidebar
          notes={notes}
          currentNoteId={currentNoteId}
          onNewNote={handleNewNote}
          onSelectNote={handleSelectNote}
          onDeleteNote={handleDeleteNote}
        />
        {isEditorOpen && (
          <>
            <Editor
              note={currentNote}
              content={editorContent}
              onSave={handleSave}
              onContentChange={handleContentChange}
            />
            <Preview content={editorContent} />
          </>
        )}
      </div>
      <ThemeToggle isDarkMode={isDarkMode} onToggle={handleToggleDarkMode} />
    </div>
  );
}

export default App;
