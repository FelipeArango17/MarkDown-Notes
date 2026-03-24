// Notes MarkDown

// Utilidades de Texto
/**
 * Extrae el título de una nota desde su contenido
 * @param {string} content - Contenido de la nota
 * @returns {string} Título derivado del contenido
 */
function deriveTitle(content) {
  if (content === '' || content === null || content === undefined) {
    return 'Sin título';
  }

  const cleanContent = content.trim();

  if (cleanContent === '') {
    return 'Sin título';
  }

  let firstLine = '';
  let foundNewLine = false;

  for (let i = 0; i < cleanContent.length; i = i + 1) {
    const char = cleanContent[i];

    if (char === '\n') {
      foundNewLine = true;
      break;
    }

    firstLine = firstLine + char;
  }

  if (firstLine.trim() === '') {
    return 'Sin título';
  }

  if (firstLine.length > 50) {
    firstLine = firstLine.slice(0, 50) + '...';
  }

  return firstLine.trim();
}

/**
 * Extrae un resumen corto del contenido de la nota
 * @param {string} content - Contenido de la nota
 * @param {number} maxLen - Longitud máxima del resumen (opcional)
 * @returns {string} Resumen del contenido
 */
function deriveExcerpt(content, maxLen) {
  if (content === '' || content === null || content === undefined) {
    return '';
  }

  let maxLength = maxLen;
  if (maxLength === undefined || maxLength === null) {
    maxLength = 100;
  }

  const cleanContent = content.trim();

  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }

  const excerpt = cleanContent.slice(0, maxLength) + '...';

  return excerpt;
}

// Clave global para el almacenamiento en localStorage
const storageKey = 'markdown-notes';
let currentNoteId = null;

const notes = []; // Almacenamiento

function generateID() {
    const timestamp = Date.now();
    return timestamp;
}

// Funcion Auxiliar
/**
 * Busca una nota por su ID dentro del array
 * @param {number} noteID
 * @returns {Object|undefined}
 */
function findNoteByID(noteID) {
    return notes.find(n => n.id === noteID);
}

// CRUD Notes
/**
 * Crea un objeto de nota con el contenido proporcionado
 * @param {string} content - Contenido de la nota
 * @param {string} title - Título de la nota (opcional)
 * @returns {Object|null} Objeto de nota o null si hay error
 */

function createNote(content, title) {
    const trimmedContent = content.trim();

    if (trimmedContent === '') {
        return null; // No string
    }

    const noteID = generateID();
    const currentTime = Date.now();
    const noteTitle = title || 'Untitle note';

    // Se genera un resumen corto del contenido
    const noteExcerpt = content.length > 100 
    ? `${content.slice(0,100)}...`
    : trimmedContent;

    // Devolver objeto
    return {
        id: noteID,
        title: noteTitle,
        content: trimmedContent,
        excerpt: noteExcerpt,
        createdAt: currentTime,
        updatedAt: currentTime
    };
}

// Nueva funcion
function addNote(content, title) {
    
    // Se crea la nota usando la funcion base
    const note = createNote(content, title);

    // Valida contenido vacio
    if (!note) {
        return 'Error: The content cannot be empty';
    }

    // Agrega la nota al almacenamiento
    notes.push(note);
    return 'Note created successfully';
}

function updateNote(noteID, content) {
    if (!noteID) {
        return 'Error: Invalid ID'
    }

    const note = notes.find(n => n.id === noteID);

    if (!note) {
        return 'Error: note not found';
    }

    const trimmedContent = content.trim(); 

    if (!content || content.trim() === '') {
        return 'Error: The content cannot be empty';
    }

    note.content = trimmedContent;
    note.excerpt = trimmedContent.length > 100
        ? `${trimmedContent.slice(0,100)}...`
        : trimmedContent;

    note.updatedAt = Date.now();

    return 'Note updated successfully';
}

function listNotes() {
    return notes; // ahora sí devuelve datos reales
}

// Store de notas (Fase 2) 
// Uso de Closures para encapsular el estado

/**
 * Crea un store para manejar el estado de las notas
 * @returns {Object} Objeto con métodos para interactuar con las notas
 */

function createNotesStore() {
  let notes = [];

  function addNote(content, title) {
    if (content === undefined || content === null || content.trim() === '') {
      return { success: false, message: 'El contenido no puede estar vacío' };
    }

    const newNote = createNote(content, title);

    if (newNote === null) {
      return { success: false, message: 'Error al crear la nota' };
    }

    notes.push(newNote);

    return { success: true, note: newNote };
  }

  function getAllNotes() {
    const notesCopy = notes.map(function (note) {
      return { ...note };
    });
    return notesCopy;
  }

  function getNoteById(noteId) {
    const foundNote = notes.find(function (note) {
      return note.id === noteId;
    });

    if (foundNote === undefined) {
      return null;
    }

    return { ...foundNote };
  }

  function updateNote(noteId, updates) {
    if (noteId === undefined || noteId === null) {
      return { success: false, message: 'ID inválido' };
    }

    const noteToUpdate = notes.find(function (note) {
      return note.id === noteId;
    });

    if (noteToUpdate === undefined) {
      return { success: false, message: 'Nota no encontrada' };
    }

    if (updates.content !== undefined) {
      const trimmedContent = updates.content.trim();

      if (trimmedContent === '') {
        return { success: false, message: 'El contenido no puede estar vacío' };
      }

      noteToUpdate.content = updates.content;
      noteToUpdate.title = deriveTitle(updates.content);
      noteToUpdate.excerpt = deriveExcerpt(updates.content, 100);
    }

    if (updates.title !== undefined && updates.title !== '') {
      noteToUpdate.title = updates.title;
    }

    if (updates.favorite !== undefined) {
      noteToUpdate.favorite = updates.favorite;
    }

    noteToUpdate.updatedAt = Date.now();

    return { success: true, note: { ...noteToUpdate } };
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

  function searchNotes(query) {
    if (query === undefined || query === null || query.trim() === '') {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();

    const results = notes.filter(function (note) {
      const normalizedTitle = note.title.toLowerCase();
      const normalizedContent = note.content.toLowerCase();

      const matchesTitle = normalizedTitle.includes(normalizedQuery);
      const matchesContent = normalizedContent.includes(normalizedQuery);

      return matchesTitle || matchesContent;
    });

    return results.map(function (note) {
      return { ...note };
    });
  }

  function getNotesOrderedByDate() {
    const notesCopy = notes.map(function (note) {
      return { ...note };
    });

    notesCopy.sort(function (a, b) {
      return b.updatedAt - a.updatedAt;
    });

    return notesCopy;
  }

  function getFavoriteNotes() {
    const favorites = notes.filter(function (note) {
      return note.favorite === true;
    });

    return favorites.map(function (note) {
      return { ...note };
    });
  }

  function getNotesCount() {
    return notes.length;
  }

  return {
    addNote: addNote,
    getAllNotes: getAllNotes,
    getNoteById: getNoteById,
    updateNote: updateNote,
    deleteNote: deleteNote,
    searchNotes: searchNotes,
    getNotesOrderedByDate: getNotesOrderedByDate,
    getFavoriteNotes: getFavoriteNotes,
    getNotesCount: getNotesCount,
  };
}

/**
 * Guarda las notas en LocalStorage
 * @param {Array} notes - Array de notas a guardar
 */
function saveToStorage(notes) {
    // Validación para evitar guardar datos inválidos
    if (notes === undefined || notes === null) {
        console.error('Invalid data cannot be saved');
        return;
    }

    // Convertir el array de objetos a string JSON
    const notesJSON = JSON.stringify(notes);

    // Guardar en localStorage usando la clave global
    localStorage.setItem(storageKey, notesJSON);
}

/**
 * Carga las notas desde localStorage
 * @returns {Array} Array de notas o array vacio si no hay datos
 */
function loadFromStorage() {
    // Obtener los datos guardados como string
    const notesJSON = localStorage.getItem(storageKey);

    // Si no hay datos, retornar array vacío
    if (notesJSON === null || notesJSON === undefined) {
        return [];
    }

    let notes = [];

    // Convertir el string JSON a objeto (array)
    const parsedNotes = JSON.parse(notesJSON);

    // Validar que realmente sea un array
    if (Array.isArray(parsedNotes)) {
        notes = parsedNotes;
    }

    return notes;
}

// Continuacion conexion store con localStorage 

// Muestra el editor y el preview
function showEditorAndPreview() {
    const editorSection = document.querySelector('#editor-section');
    const previewSection = document.querySelector('#preview-section');

    editorSection.style.display = 'flex';
    previewSection.style.display = 'none';
}

/**
 * Renderizar la lista de notas en el DOM
 * @param {Array} notesList - Array de notas a renderizar
 */
function renderNoteList(notesList) {
  const noteListContainer = document.querySelector('#note-list');

  if (noteListContainer === null) {
    return;
  }

  // Limpiar contenedor antes de renderizar
  noteListContainer.textContent = '';

  // Estado vacío
  if (!Array.isArray(notesList) || notesList.length === 0) {
    const emptyState = document.createElement('p');
    emptyState.className = 'empty-state';
    emptyState.textContent = 'No hay notas todavía. Crea tu primera nota.';
    noteListContainer.appendChild(emptyState);
    return;
  }

  // Render de notas
  notesList.forEach(function (note) {
    const noteItem = document.createElement('article');
    noteItem.className = 'note-item';
    noteItem.dataset.noteId = String(note.id);

    // Marcar nota activa por ID
    if (currentNoteId !== null && String(note.id) === String(currentNoteId)) {
      noteItem.classList.add('active');
    }

    const titleElement = document.createElement('h3');
    titleElement.className = 'note-title';
    titleElement.textContent = note.title || deriveTitle(note.content || '');

    const excerptElement = document.createElement('p');
    excerptElement.className = 'note-excerpt';
    excerptElement.textContent = note.excerpt || deriveExcerpt(note.content || '', 100);

    const dateElement = document.createElement('small');
    dateElement.className = 'note-date';
    const dateValue = note.updatedAt || note.createdAt;
    dateElement.textContent = dateValue
      ? new Date(dateValue).toLocaleString()
      : 'Sin fecha';

    noteItem.appendChild(titleElement);
    noteItem.appendChild(excerptElement);
    noteItem.appendChild(dateElement);

    noteListContainer.appendChild(noteItem);
  });
}

/**
 * Renderizar el editor con el contenido de una nota
 * @param {Object|null} nota - Nota a renderizar o null para el editor vacio
 */
function renderNoteEditor(nota) {
  const editorTextarea =
    document.querySelector('#note-editor') ||
    document.querySelector('#note-content') ||
    document.querySelector('#editor-section textarea');

  if (editorTextarea === null) {
    return;
  }

  if (nota === null) {
    editorTextarea.value = '';
    return;
  }

  editorTextarea.value = typeof nota.content === 'string' ? nota.content : '';
}

/** 
 * Renderizar el Preview del contenido markdown
 * @param {String} content - contenido markdown a renderizar
 */
function renderMarkdownPreview(content) {
  const previewContainer =
    document.querySelector('#preview-content') ||
    document.querySelector('#markdown-preview') ||
    document.querySelector('#preview-section');

  if (previewContainer === null) {
    return;
  }

  const markdownText = typeof content === 'string' ? content : '';

  if (typeof marked !== 'undefined' && typeof marked.parse === 'function') {
    previewContainer.innerHTML = marked.parse(markdownText);
    return;
  }

  // Fallback si marked.js no está disponible
  previewContainer.textContent = markdownText;
}