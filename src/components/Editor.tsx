import type { Note } from '../types/note';

interface EditorProps {
  note: Note | null;
  content: string;
  onSave: (content: string) => void;
  onContentChange: (content: string) => void;
}

function Editor({ note, content, onSave, onContentChange }: EditorProps) {
  return (
    <main className="editor-section" id="editor-section">
      <div className="editor-header">
        <h2>Editor</h2>
        <div className="editor-actions">
          <button onClick={() => onSave(content)} className="btn btn-success">
            Guardar
          </button>
        </div>
      </div>
      <textarea
        id="editor-textarea"
        className="editor-textarea"
        placeholder="Escribe tu nota en Markdown aquí..."
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
      />
    </main>
  );
}

export default Editor;