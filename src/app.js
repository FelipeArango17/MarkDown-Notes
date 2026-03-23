// Notes MarkDown
const notes = []; // Almacenamiento

function generateID() {
    const timestamp = Date.now();
    return timestamp;
}

// CRUD Notes

function createNote(newContent, title) {
    const trimmedContent = newContent.trim();

    if (trimmedContent === '') {
        return null; // No string
    }

    const noteID = generateID();
    const currentTime = Date.now();
    const noteTitle = title || 'Untitle note';

    const noteExcerpt = newContent.legth > 100 
    ? `${newContent.slice(0,100)} ...`
    : trimmedContent;

    // Devolver objeto
    return {
        id: noteID,
        title: title,
        content: trimmedContent,
        excerpt: noteExcerpt,
        createAt: currentTime,
        updateAt: currentTime
    };
}

// Nueva funcion
function addNote(content, title) {
    
    const note = createNote(content, title);
    if (!note) {
        return 'Error: The content cannot be empty';
    }

    notes.push(note);
    return 'Note created successfully';
}

function updateNote(noteID, newContent) {
    if (!noteID) {
        return 'Error: Invalid ID'
    }

    const note = note.find(n => n.id === noteID);

    if (!note) {
        return 'Error: note not found';
    }

    const trimmedContent = newContent.trim(); 

    if (trimmedContent === '') {
        return 'Error: The content cannot be empty';
    }

    note.content = trimmedContent;
    note.excerpt = trimmedContent.length > 100
        ? `${trimmedContent.slice(0,100)}...`
        : trimmedContent;

    note.updatedAt = Date.now();

    return 'Note updated successfully';
}

function deleteNote(noteID) {
    if (!noteID) {
        return 'Error: Invalid ID';
    }

    // findIndex devuelve la posicion, mientras find el objeto
    const index = notes.findIndex(n => n.id === noteID);

    if (index === -1) {
        return 'Error: Note not found';
    }

    // inicio, cantidad
    notes.splice(index, 1);

    return `Note with ID: ${noteID} was deleted successfully`;
}

function listNotes() {
    return notes; // ahora sí devuelve datos reales
}