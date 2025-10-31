// DOM elements
const notepad = document.getElementById('notepad');
const deleteNoteBtn = document.getElementById('deleteNoteBtn');
const addNoteBtn = document.getElementById('addNoteBtn');
const charCount = document.getElementById('charCount');
const saveStatus = document.getElementById('saveStatus');
const tabsContainer = document.getElementById('tabsContainer');
const colorPickerBtn = document.getElementById('colorPickerBtn');
const colorPickerDropdown = document.getElementById('colorPickerDropdown');
// New toolbar buttons and color input
const copyBtn = document.getElementById('copyBtn');
const pastePlainBtn = document.getElementById('pastePlainBtn');
const customColorInput = document.getElementById('customColorInput');

// Storage keys (renamed to firepad_*)
const NOTES_KEY = 'firepad_notes';
const ACTIVE_NOTE_KEY = 'firepad_active_note';
const OLD_NOTES_KEY = 'firenotes_notes';
const OLD_ACTIVE_NOTE_KEY = 'firenotes_active_note';

// State
let notes = [];
let activeNoteId = null;
// Controls whether to force plain text on next paste
let forcePlainPasteOnce = false;

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

    // Migrate from old keys if needed
    if ((!notes || notes.length === 0) && !activeNoteId) {
      const legacy = await browser.storage.local.get([OLD_NOTES_KEY, OLD_ACTIVE_NOTE_KEY]);
      const oldNotes = legacy[OLD_NOTES_KEY] || [];
      const oldActive = legacy[OLD_ACTIVE_NOTE_KEY] || null;
      if (oldNotes && oldNotes.length) {
        notes = oldNotes;
        activeNoteId = oldActive || (oldNotes[0] && oldNotes[0].id) || null;
        await browser.storage.local.set({
          [NOTES_KEY]: notes,
          [ACTIVE_NOTE_KEY]: activeNoteId
        });
      }
    }
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
    // Apply color
    applyNoteColor(note);
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
    // when color === 'custom', also store customBg and customFg
    customBg: undefined,
    customFg: undefined,
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
  
  // Update custom picker swatch to current custom bg if present
  if (customColorInput && note && note.color === 'custom' && note.customBg) {
    customColorInput.value = rgbToHex(parseCssColor(note.customBg) || '#ffffff');
  }
}

function changeNoteColor(color, customBg, customFg) {
  const note = notes.find(n => n.id === activeNoteId);
  if (note) {
    note.color = color;
    if (color === 'custom') {
      if (customBg) note.customBg = customBg;
      if (customFg) note.customFg = customFg;
    }
    applyNoteColor(note);
    saveNotes();
    updateColorPickerUI();
    colorPickerDropdown.classList.remove('show');
  }
}

function applyNoteColor(note) {
  if (!note) return;
  if (note.color === 'custom') {
    notepad.setAttribute('data-color', 'custom');
    if (note.customBg) notepad.style.setProperty('--custom-note-bg', note.customBg);
    if (note.customFg) notepad.style.setProperty('--custom-note-fg', note.customFg);
  } else {
    notepad.removeAttribute('style');
    notepad.setAttribute('data-color', note.color || 'default');
  }
}

// Helpers for color conversion
function rgbToHex(color) {
  if (!color) return '#ffffff';
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.fillStyle = color;
  const computed = ctx.fillStyle; // normalized
  // computed like #rrggbb or rgba(...)
  if (computed.startsWith('#')) return computed;
  const m = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!m) return '#ffffff';
  const r = Number(m[1]).toString(16).padStart(2, '0');
  const g = Number(m[2]).toString(16).padStart(2, '0');
  const b = Number(m[3]).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

function parseCssColor(color) {
  // returns a normalized css color string via canvas
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.fillStyle = color;
  return ctx.fillStyle || color;
}

function getReadableTextColor(bg) {
  // Compute luminance and return dark or light text
  const hex = rgbToHex(bg).replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const [R, G, B] = [r, g, b].map(c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  const luminance = 0.2126 * R + 0.7152 * G + 0.0722 * B;
  return luminance > 0.5 ? '#111827' : '#ffffff';
}

// Event listeners
notepad.addEventListener('input', () => {
  updateCharCount();
  autoSave();
});

// Handle paste: if forcePlainPasteOnce set (via button), paste as plain
notepad.addEventListener('paste', (e) => {
  if (!forcePlainPasteOnce) return;
  e.preventDefault();
  const text = (e.clipboardData || window.clipboardData).getData('text/plain');
  const start = notepad.selectionStart;
  const end = notepad.selectionEnd;
  const before = notepad.value.substring(0, start);
  const after = notepad.value.substring(end);
  notepad.value = `${before}${text}${after}`;
  const cursor = start + text.length;
  notepad.selectionStart = notepad.selectionEnd = cursor;
  forcePlainPasteOnce = false;
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

// Copy to clipboard
copyBtn.addEventListener('click', async () => {
  try {
    const selection = notepad.value.substring(notepad.selectionStart, notepad.selectionEnd);
    const toCopy = selection || notepad.value;
    await navigator.clipboard.writeText(toCopy);
    flashStatus('Copied');
  } catch (err) {
    console.error('Copy failed', err);
    flashStatus('Copy failed');
  }
});

// Paste plain text on next paste
pastePlainBtn.addEventListener('click', async () => {
  // Try immediate paste if permission allows, otherwise set flag for next paste
  try {
    const text = await navigator.clipboard.readText();
    // Simulate paste of plain text at cursor
    const start = notepad.selectionStart;
    const end = notepad.selectionEnd;
    const before = notepad.value.substring(0, start);
    const after = notepad.value.substring(end);
    notepad.value = `${before}${text}${after}`;
    const cursor = start + text.length;
    notepad.selectionStart = notepad.selectionEnd = cursor;
    updateCharCount();
    autoSave();
    flashStatus('Pasted');
  } catch {
    // Fallback: set flag to intercept next paste event
    forcePlainPasteOnce = true;
    flashStatus('Paste as plain text: ready');
  }
  notepad.focus();
});

function flashStatus(text) {
  const prev = saveStatus.textContent;
  saveStatus.textContent = text;
  setTimeout(() => {
    saveStatus.textContent = prev;
  }, 800);
}

// Color picker event listeners
colorPickerBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleColorPicker();
});

// Predefined colors
document.querySelectorAll('.color-option').forEach(option => {
  option.addEventListener('click', () => {
    changeNoteColor(option.dataset.color);
  });
});

// Custom color handler
if (customColorInput) {
  customColorInput.addEventListener('input', () => {
    const bg = customColorInput.value; // hex
    const fg = getReadableTextColor(bg);
    changeNoteColor('custom', bg, fg);
  });
}

// Close color picker when clicking outside
document.addEventListener('click', (e) => {
  if (!colorPickerDropdown.contains(e.target) && !colorPickerBtn.contains(e.target)) {
    colorPickerDropdown.classList.remove('show');
  }
});

// Initialize on load
init();
