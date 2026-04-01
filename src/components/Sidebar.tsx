import type { Note } from '../types/note';

interface SidebarProps {
  notes: Note[];
  currentNoteId: number | null;
  onNewNote: () => void;
  onSelectNote: (id: number) => void;
  onDeleteNote: () => void;
}

function Sidebar({ notes, currentNoteId, onNewNote, onSelectNote, onDeleteNote }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Mis Notas</h2>
        <button onClick={onNewNote} className="btn btn-primary">Nueva Nota</button>
        <button onClick={onDeleteNote} className="btn btn-danger">Eliminar</button>
      </div>

      <div id="note-list" className="note-list">
        {notes.length === 0 ? (
          <div className="empty-state">
            <p>No hay notas aún. ¡Crea una nueva!</p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className={`note-item ${note.id === currentNoteId ? 'active' : ''}`}
              onClick={() => onSelectNote(note.id)}
            >
              <div className="note-item-content">
                <h3 className="note-item-title">{note.title}</h3>
                <p className="note-item-excerpt">{note.excerpt}</p>
                <span className="note-item-date">
                  {new Date(note.updatedAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

export default Sidebar;