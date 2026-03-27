// Notes MarkDown

// Clave global para el almacenamiento en localStorage
const storageKey = 'markdown-notes';
let currentNoteId = null;

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
    // FIX: usamos deriveTitle para ser consistentes con el resto del store,
    // en lugar de un título hardcodeado cuando no se pasa uno
    const noteTitle = title || deriveTitle(content);

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

  // FIX: deleteNote ahora retorna { success, message } en lugar de un string,
  // para que el listener pueda leer result.success correctamente
  function deleteNote(noteID) {
    if (noteID === undefined || noteID === null) {
        return { success: false, message: 'ID inválido' };
    }

    // findIndex devuelve la posicion, mientras find el objeto
    const index = notes.findIndex(n => n.id === noteID);

    if (index === -1) {
        return { success: false, message: 'Nota no encontrada' };
    }

    // inicio, cantidad
    notes.splice(index, 1);

    return { success: true, message: `Nota con ID: ${noteID} eliminada exitosamente` };
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
    if (notes === undefined || notes === null) {
        console.error('Invalid data cannot be saved');
        return;
    }

    const notesJSON = JSON.stringify(notes);
    localStorage.setItem(storageKey, notesJSON);
}

/**
 * Carga las notas desde localStorage
 * @returns {Array} Array de notas o array vacio si no hay datos
 */
function loadFromStorage() {
    const notesJSON = localStorage.getItem(storageKey);

    if (notesJSON === null || notesJSON === undefined) {
        return [];
    }

    let notes = [];
    const parsedNotes = JSON.parse(notesJSON);

    if (Array.isArray(parsedNotes)) {
        notes = parsedNotes;
    }

    return notes;
}

// FIX: se agrega createPersistentNotesStore que es la función que usa initializeApp.
// Extiende createNotesStore añadiendo carga y guardado automático en localStorage
function createPersistentNotesStore() {
  let notes = loadFromStorage();

  function addNote(content, title) {
    if (content === undefined || content === null || content.trim() === '') {
      return { success: false, message: 'El contenido no puede estar vacío' };
    }

    const newNote = createNote(content, title);

    if (newNote === null) {
      return { success: false, message: 'Error al crear la nota' };
    }

    notes.push(newNote);
    saveToStorage(notes);

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
    saveToStorage(notes);

    return { success: true, note: { ...noteToUpdate } };
  }

  function deleteNote(noteID) {
    if (noteID === undefined || noteID === null) {
      return { success: false, message: 'ID inválido' };
    }

    const index = notes.findIndex(n => n.id === noteID);

    if (index === -1) {
      return { success: false, message: 'Nota no encontrada' };
    }

    notes.splice(index, 1);
    saveToStorage(notes);

    return { success: true, message: `Nota con ID: ${noteID} eliminada exitosamente` };
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
 * Muestra el editor y preview
 */
function showEditorAndPreview() {
  const editorSection = document.querySelector('#editor-section');
  const previewSection = document.querySelector('#preview-section');

  editorSection.style.display = 'flex';
  previewSection.style.display = 'flex';
}

/**
 * Oculta el editor y el preview
 */
function hideEditorAndPreview() {
  const editorSection = document.querySelector('#editor-section');
  const previewSection = document.querySelector('#preview-section');

  editorSection.style.display = 'none';
  previewSection.style.display = 'none';
}

/**
 * Renderiza la lista de notas en el DOM
 * @param {Array} notes - Array de notas a renderizar
 */
function renderNoteList(notes) {
  const noteListContainer = document.getElementById('note-list');
  
  if (!noteListContainer) return;

  // Limpiar el contenedor antes de renderizar
  noteListContainer.innerHTML = '';

  // Si la lista está vacía, mostrar mensaje de estado vacío
  if (!Array.isArray(notes) || notes.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-state';
    emptyMessage.innerHTML = '<p>No hay notas aún. ¡Crea una nueva!</p>';
    noteListContainer.appendChild(emptyMessage);
    return;
  }

  // Renderizar cada nota
  notes.forEach(function (note) {
    // Crear elemento de nota
    const noteItem = document.createElement('div');
    noteItem.className = 'note-item';
    noteItem.dataset.id = note.id;
    
    // Marcar la nota activa comparando con currentNoteId
    if (note.id === currentNoteId) {
      noteItem.classList.add('active');
    }

    // Formato de fecha
    const date = new Date(note.updatedAt);
    const dateString = date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    // Construir el contenido HTML
    noteItem.innerHTML = `
      <div class="note-item-content">
        <h3 class="note-item-title">${note.title}</h3>
        <p class="note-item-excerpt">${note.excerpt}</p>
        <span class="note-item-date">${dateString}</span>
      </div>
    `;

    noteListContainer.appendChild(noteItem);
  });
}

/**
 * Renderiza una nota en el editor de texto
 * @param {Object|null} note - Objeto nota con contenido o null para limpiar
 */
function renderNoteEditor(note) {
  // FIX: el ID se unifica con el que existe en el HTML (#editor-textarea)
  const editorTextarea = document.querySelector('#editor-textarea');
  
  // No romper si el elemento no existe en el DOM
  if (!editorTextarea) {
    return;
  }

  showEditorAndPreview();

  // Si note es null, limpiar el contenido del editor y actualizar currentNoteId
  if (note === null) {
    editorTextarea.value = '';
    currentNoteId = null;
    renderMarkdownPreview('');
    return;
  }

  // Validar que note.content sea un string antes de asignarlo
  if (typeof note.content === 'string') {
    editorTextarea.value = note.content;
  } else {
    editorTextarea.value = '';
  }

  currentNoteId = note.id;
  renderMarkdownPreview(editorTextarea.value);
}

/**
 * Renderiza markdown en HTML o texto plano en el preview
 * @param {string} content - Contenido markdown a renderizar
 */
function renderMarkdownPreview(content) {
  // FIX: el ID se unifica con el que existe en el HTML (#preview-container)
  const previewContainer = document.querySelector('#preview-container');
  
  // Validar que el elemento exista antes de usarlo
  if (!previewContainer) {
    return;
  }

  // Si content no es un string, usar un string vacío
  const markdownText = typeof content === 'string' ? content : '';

  // Convertir el markdown a HTML usando markdownit si está disponible
  if (typeof window.markdownit !== 'undefined') {
    const md = window.markdownit();
    previewContainer.innerHTML = md.render(markdownText);
    return;
  }

  // Si markdownit no está disponible, mostrar el contenido como texto plano
  previewContainer.textContent = markdownText;
}

/**
 * Muestra un mensaje de error o exito
 * @param {string} message - Mensaje a mostrar
 * @param {boolean} isError - true si es error, false si es exito
 */
function showMessage(message, isError) {
  const messageContainer = document.querySelector('#message-container');

  messageContainer.textContent = message;

  if (isError === true) {
    messageContainer.className = 'message error';
  } else {
    messageContainer.className = 'message success';
  }

  setTimeout(() => {
    messageContainer.textContent = '';
    messageContainer.className = 'message';
  }, 3000);
}

/**
 * Inicializa todos los events listeners de la aplicaciopn
 * @param {Object} store - Store de notas
 */
function initializeEventListeners(store) {
  const newNoteButton = document.querySelector('#new-note-button');

  newNoteButton.addEventListener('click', () => {
    renderNoteEditor(null);
  });

  const saveNoteButton = document.querySelector('#save-note-button');

  saveNoteButton.addEventListener('click', () => {
    const editorTextArea = document.querySelector('#editor-textarea');
    const content = editorTextArea.value;

    if (content.trim() === '') {
      showMessage('The content cannot be empty', true);
      return;
    }

    if (currentNoteId != null) {
      const result = store.updateNote(currentNoteId, {content: content});

      if (result.success === true) {
        showMessage('Note successfully updated', false);
        const notes = store.getNotesOrderedByDate();
        renderNoteList(notes);
      } else {
        showMessage(result.message, true);
      }
    } else {
      const result = store.addNote(content);

      if (result.success === true) {
        showMessage('Note created successfully', false);
        currentNoteId = result?.note?.id;
        const notes = store.getNotesOrderedByDate();
        renderNoteList(notes);
      } else {
        showMessage(result.message, true);
      }
    }
  });

  const deleteNoteButton = document.querySelector('#delete-note-button');

  deleteNoteButton.addEventListener('click', () => {
    if (currentNoteId === null) {
      showMessage('No note has been selected for deletion', true);
      // FIX: faltaba un return para cortar la ejecución cuando no hay nota seleccionada
      return;
    }

    const confirmed = confirm('Are you sure you want to delete this note?');

    if (confirmed === true) {
      const result = store.deleteNote(currentNoteId);

      if (result.success === true) {
        showMessage('Note successfully deleted', false);
        hideEditorAndPreview();
        currentNoteId = null;
        const notes = store.getNotesOrderedByDate();
        renderNoteList(notes);
      } else {
        showMessage(result.message, true);
      }
    }
  });

  // editor textarea -> preview
  const editorTextarea = document.querySelector('#editor-textarea');

  editorTextarea.addEventListener('input', () => {
    const content = editorTextarea.value;
    renderMarkdownPreview(content);
  });

  // selección desde la lista (event delegation)
  const noteListContainer = document.querySelector('#note-list');

  noteListContainer.addEventListener('click', (event) => {
    const noteItem = event.target.closest('.note-item');
    if (noteItem != null) {
      const noteId = Number(noteItem.dataset.id);
      const note = store.getNoteById(noteId);
      if (note != null) {
        renderNoteEditor(note);
        const notes = store.getNotesOrderedByDate();
        renderNoteList(notes);
      }
    }
  });
}

/**
 * Funcion principal que inicializa la aplicacion
 */
function initializeApp() {
  // FIX: se usa createPersistentNotesStore en lugar de createPersistentNoteStore (que no existía)
  const store = createPersistentNotesStore();
  // FIX: se corrige getNotesByDate -> getNotesOrderedByDate
  const notes = store.getNotesOrderedByDate();

  renderNoteList(notes); // si hay notas en local storage.
  hideEditorAndPreview();
  // FIX: se corrige initListeners -> initializeEventListeners
  initializeEventListeners(store);

  console.log('Aplicación inicializada correctamente');
  // FIX: se corrige store.count() -> store.getNotesCount()
  console.log('Total de notas cargadas:', store.getNotesCount());
}

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});