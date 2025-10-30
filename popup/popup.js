// Get DOM elements
const notepad = document.getElementById('notepad');
const clearBtn = document.getElementById('clearBtn');
const charCount = document.getElementById('charCount');
const saveStatus = document.getElementById('saveStatus');

// Storage key
const STORAGE_KEY = 'firenotes_content';

// Load saved content on startup
async function loadSavedContent() {
  try {
    const result = await browser.storage.local.get(STORAGE_KEY);
    if (result[STORAGE_KEY]) {
      notepad.value = result[STORAGE_KEY];
      updateCharCount();
    }
  } catch (error) {
    console.error('Error loading saved content:', error);
  }
}

// Save content to storage
async function saveContent() {
  try {
    saveStatus.textContent = 'Saving...';
    saveStatus.classList.add('saving');
    
    await browser.storage.local.set({
      [STORAGE_KEY]: notepad.value
    });
    
    setTimeout(() => {
      saveStatus.textContent = 'Auto-saved';
      saveStatus.classList.remove('saving');
    }, 300);
  } catch (error) {
    console.error('Error saving content:', error);
    saveStatus.textContent = 'Error saving';
    setTimeout(() => {
      saveStatus.textContent = 'Auto-saved';
    }, 2000);
  }
}

// Update character count
function updateCharCount() {
  const count = notepad.value.length;
  charCount.textContent = count.toLocaleString();
}

// Debounce function to prevent too many saves
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Debounced save function
const debouncedSave = debounce(saveContent, 500);

// Clear notes with confirmation
async function clearNotes() {
  if (notepad.value.trim() === '') {
    return;
  }
  
  if (confirm('Are you sure you want to clear all notes?')) {
    notepad.value = '';
    updateCharCount();
    await saveContent();
    clearBtn.classList.add('clearing');
    setTimeout(() => {
      clearBtn.classList.remove('clearing');
    }, 500);
  }
}

// Event listeners
notepad.addEventListener('input', () => {
  updateCharCount();
  debouncedSave();
});

clearBtn.addEventListener('click', clearNotes);

// Keyboard shortcuts
notepad.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + S to manually save
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    saveContent();
  }
  
  // Ctrl/Cmd + Shift + Delete to clear
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Delete') {
    e.preventDefault();
    clearNotes();
  }
});

// Initialize
loadSavedContent();
notepad.focus();
