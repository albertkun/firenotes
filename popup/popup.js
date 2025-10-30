// DOM elements
const notepad = document.getElementById('notepad');
const deleteNoteBtn = document.getElementById('deleteNoteBtn');
const addNoteBtn = document.getElementById('addNoteBtn');
const charCount = document.getElementById('charCount');
const saveStatus = document.getElementById('saveStatus');
const tabsContainer = document.getElementById('tabsContainer');
const colorPickerBtn = document.getElementById('colorPickerBtn');
const colorPickerDropdown = document.getElementById('colorPickerDropdown');

// Storage keys
const NOTES_KEY = 'firenotes_notes';
const ACTIVE_NOTE_KEY = 'firenotes_active_note';

// State
let notes = [];
let activeNoteId = null;

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Initialize app
async function init() {
  await loadNotes();
  if (notes.length === 0) {
    createNewNote();
  } else {
    renderTabs();
    await loadActiveNote();
  }
  updateCharCount();
}

// Load notes from storage
async function loadNotes() {
  try {
    const result = await browser.storage.local.get([NOTES_KEY, ACTIVE_NOTE_KEY]);
    notes = result[NOTES_KEY] || [];
    activeNoteId = result[ACTIVE_NOTE_KEY] || null;
  } catch (error) {
    console.error('Error loading notes:', error);
    notes = [];
  }
}

// Save notes to storage
async function saveNotes() {
  try {
    await browser.storage.local.set({
      [NOTES_KEY]: notes,
      [ACTIVE_NOTE_KEY]: activeNoteId
    });
  } catch (error) {
    console.error('Error saving notes:', error);
  }
}

// Load active note
async function loadActiveNote() {
  if (!activeNoteId && notes.length > 0) {
    activeNoteId = notes[0].id;
  }
  
  const note = notes.find(n => n.id === activeNoteId);
  if (note) {
    notepad.value = note.content || '';
    notepad.setAttribute('data-color', note.color || 'default');
    updateCharCount();
    updateTabsUI();
    updateColorPickerUI();
  }
}

// Create new note
function createNewNote() {
  const newNote = {
    id: generateId(),
    content: '',
    title: `Note ${notes.length + 1}`,
    color: 'default',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  notes.push(newNote);
  activeNoteId = newNote.id;
  notepad.value = '';
  
  renderTabs();
  saveNotes();
  updateCharCount();
  notepad.focus();
}

// Delete current note
function deleteNote() {
  if (notes.length === 1) {
    // If only one note, just clear it
    notepad.value = '';
    saveCurrentNote();
    notepad.focus();
    return;
  }
  
  if (!confirm('Delete this note?')) {
    return;
  }
  
  const noteIndex = notes.findIndex(n => n.id === activeNoteId);
  if (noteIndex !== -1) {
    notes.splice(noteIndex, 1);
    
    // Switch to previous or next note
    if (notes.length > 0) {
      const newIndex = Math.max(0, noteIndex - 1);
      activeNoteId = notes[newIndex].id;
      loadActiveNote();
    } else {
      createNewNote();
    }
    
    renderTabs();
    saveNotes();
  }
}

// Switch to note
function switchToNote(noteId) {
  if (activeNoteId === noteId) return;
  
  // Save current note before switching
  saveCurrentNote();
  
  activeNoteId = noteId;
  loadActiveNote();
  saveNotes();
}

// Save current note content
function saveCurrentNote() {
  const note = notes.find(n => n.id === activeNoteId);
  if (note) {
    note.content = notepad.value;
    note.updatedAt = Date.now();
    
    // Update title based on first line of content
    const firstLine = notepad.value.split('\n')[0].trim();
    if (firstLine) {
      note.title = firstLine.substring(0, 20);
    }
  }
}

// Auto-save with debouncing
let saveTimeout = null;
async function autoSave() {
  saveCurrentNote();
  
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    try {
      saveStatus.textContent = 'Saving...';
      saveStatus.classList.add('saving');
      saveStatus.parentElement.classList.add('saving');
      
      await saveNotes();
      renderTabs(); // Update tab titles
      
      setTimeout(() => {
        saveStatus.textContent = 'Auto-saved';
        saveStatus.classList.remove('saving');
        saveStatus.parentElement.classList.remove('saving');
      }, 300);
    } catch (error) {
      console.error('Error auto-saving:', error);
      saveStatus.textContent = 'Save failed';
      saveStatus.classList.remove('saving');
      saveStatus.parentElement.classList.remove('saving');
    }
  }, 500);
}

// Update character count
function updateCharCount() {
  const count = notepad.value.length;
  charCount.textContent = count.toLocaleString();
}

// Render note tabs
function renderTabs() {
  tabsContainer.innerHTML = '';
  
  notes.forEach(note => {
    const tab = document.createElement('button');
    tab.className = 'note-tab';
    if (note.id === activeNoteId) {
      tab.classList.add('active');
    }
    
    const tabText = document.createElement('span');
    tabText.className = 'note-tab-text';
    tabText.textContent = note.title || 'New Note';
    tabText.title = note.title || 'New Note';
    
    const closeBtn = document.createElement('span');
    closeBtn.className = 'note-tab-close';
    closeBtn.innerHTML = `
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    
    tab.appendChild(tabText);
    tab.appendChild(closeBtn);
    
    // Click tab to switch
    tabText.addEventListener('click', (e) => {
      e.stopPropagation();
      switchToNote(note.id);
    });
    
    // Click close button to delete
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      activeNoteId = note.id;
      deleteNote();
    });
    
    tabsContainer.appendChild(tab);
  });
}

// Update tabs UI (active state)
function updateTabsUI() {
  const tabs = tabsContainer.querySelectorAll('.note-tab');
  tabs.forEach((tab, index) => {
    if (notes[index] && notes[index].id === activeNoteId) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
}

// Event listeners
notepad.addEventListener('input', () => {
  updateCharCount();
  autoSave();
});

deleteNoteBtn.addEventListener('click', deleteNote);
addNoteBtn.addEventListener('click', createNewNote);

// Keyboard shortcuts
notepad.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + S to manually save
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    saveCurrentNote();
    saveNotes();
  }
  
  // Ctrl/Cmd + N to create new note
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault();
    createNewNote();
  }
  
  // Ctrl/Cmd + W to close current note
  if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
    e.preventDefault();
    deleteNote();
  }
});

// Color picker functionality
function toggleColorPicker() {
  colorPickerDropdown.classList.toggle('show');
}

function updateColorPickerUI() {
  const note = notes.find(n => n.id === activeNoteId);
  const currentColor = note ? note.color || 'default' : 'default';
  
  // Update active state on color options
  const colorOptions = document.querySelectorAll('.color-option');
  colorOptions.forEach(option => {
    option.classList.toggle('active', option.dataset.color === currentColor);
  });
}

function changeNoteColor(color) {
  const note = notes.find(n => n.id === activeNoteId);
  if (note) {
    note.color = color;
    notepad.setAttribute('data-color', color);
    saveNotes();
    updateColorPickerUI();
    colorPickerDropdown.classList.remove('show');
  }
}

// Color picker event listeners
colorPickerBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleColorPicker();
});

document.querySelectorAll('.color-option').forEach(option => {
  option.addEventListener('click', () => {
    changeNoteColor(option.dataset.color);
  });
});

// Close color picker when clicking outside
document.addEventListener('click', (e) => {
  if (!colorPickerDropdown.contains(e.target) && !colorPickerBtn.contains(e.target)) {
    colorPickerDropdown.classList.remove('show');
  }
});

// Initialize on load
init();
