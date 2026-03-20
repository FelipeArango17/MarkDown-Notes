// Notes MarkDown

function generateID() {
    const timestamp = Date.now();
    return timestamp;
}

// CRUD Notes

function createNote(newContent, title) {
    const trimmedContent = newContent.trim();
    if (trimmedContent === '') {
        return 'Error: The content cannot be empty'
    }

    const noteID = generateID();
    const currentTime = Date.now();
    const noteTitle = title || 'Untitle note';

    const noteExcerpt = newContent.legth > 100 
    ? `${newContent.slice(0,100)} ...`
    : trimmedContent;

    const noteInfo = `
        ID: ${noteID} | Title: ${noteTitle} | Content: ${newContent} | Excerpt: ${noteExcerpt}
        | Created: ${currentTime} | Update: ${currentTime}
    `;

    return noteInfo;
}


function updateNote(noteID, newContent) {
    if (noteID === undefined || noteID === null || noteID === "") {
        return 'Error: Invalid ID'
    }

    const updateNoteInfo = `
        ID: ${noteID} | Title: ${noteTitle} | Content: ${newContent} | Excerpt: ${noteExcerpt}
        | Created: ${currentTime} | Update: ${currentTime}
    `
    return updateNoteInfo;

}

function deleteNote(noteID) {
    if (noteID === undefined || noteID === null || noteID == '') {
        return 'Error: Invalid ID';
    }

    const message = `Note with ID: ${noteID}, was deleted successfully`;
    return message;
}

function listNotes() {
    const message = `Notes retrieved successfully`
    return message;
}

// Ejemplo 1: Crear una nota
console.log('=== CREAR NOTA ===');
const nota1 = createNote('# Mi primera nota\nEste es el contenido de mi primera nota en Markdown.');
console.log(nota1);

// Ejemplo 2: Crear nota con título personalizado
console.log('\n=== CREAR NOTA CON TÍTULO ===');
const nota2 = createNote('Contenido de la segunda nota', 'Nota Importante');
console.log(nota2);

// Ejemplo 3: Intentar crear nota vacía (validación)
console.log('\n=== VALIDACIÓN: NOTA VACÍA ===');
const notaVacia = createNote('');
console.log(notaVacia);