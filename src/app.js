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
  // Seleccionar el textarea del editor usando querySelector
  const editorTextarea = document.querySelector('#noteEditor');
  
  // No romper si el elemento no existe en el DOM
  if (!editorTextarea) {
    return;
  }

  // Si note es null, limpiar el contenido del editor
  if (note === null) {
    editorTextarea.value = '';
    return;
  }

  // Validar que note.content sea un string antes de asignarlo
  if (typeof note.content === 'string') {
    editorTextarea.value = note.content;
  } else {
    editorTextarea.value = '';
  }
}

/**
 * Renderiza markdown en HTML o texto plano en el preview
 * @param {string} content - Contenido markdown a renderizar
 */
function renderMarkdownPreview(content) {
  // Seleccionar el contenedor del preview usando querySelector
  const previewContainer = document.querySelector('#markdownPreview');
  
  // Validar que el elemento exista antes de usarlo
  if (!previewContainer) {
    return;
  }

  // Si content no es un string, usar un string vacío
  const markdownText = typeof content === 'string' ? content : '';

  // Convertir el markdown a HTML usando marked.parse si está disponible
  if (typeof marked !== 'undefined' && typeof marked.parse === 'function') {
    previewContainer.innerHTML = marked.parse(markdownText);
    return;
  }

  // Si marked no está disponible, mostrar el contenido como texto plano
  previewContainer.textContent = markdownText;
}

// Nota de ejemplo
const testNote = {
    id: 1,
    title: "Nota de prueba",
    content: "# Hola Mundo\nEste es un **Markdown** de prueba.",
    excerpt: "Hola Mundo...",
    createdAt: Date.now(),
    updatedAt: Date.now()
};

// Cargar nota de prueba al editor
document.getElementById('loadNoteBtn').addEventListener('click', () => {
    renderNoteEditor(testNote);
    renderMarkdownPreview(testNote.content);
});

// Actualizar preview al escribir
document.getElementById('noteEditor').addEventListener('input', (e) => {
    renderMarkdownPreview(e.target.value);
});

// Guardar nota en localStorage
document.getElementById('saveNoteBtn').addEventListener('click', () => {
    const content = document.getElementById('noteEditor').value;
    const note = { ...testNote, content, updatedAt: Date.now() };
    saveToStorage([note]); // Guardar en LocalStorage
    alert('Nota guardada!');
});

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
    renderEditor(null);
  });

  const saveNoteButton = document.querySelector('#save-note-button');

  saveNoteButton.addEventListener('click', () => {
    const editorTextArea = document.querySelector('#editor-textarea');
    const content = editorTextArea.value;

    if (content.trim() === '') {
      showMessage('The content cannot be empty', true);
      return
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
  })
}