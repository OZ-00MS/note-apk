// This script handles the functionality of a simple note-taking application,    
        document.addEventListener('DOMContentLoaded', function() {
         // DOM Elements
        const newNoteBtn = document.getElementById('newNoteBtn');
        const searchBtn = document.getElementById('searchBtn');
        const searchContainer = document.getElementById('searchContainer');
        const searchInput = document.getElementById('searchInput');
        const newNoteForm = document.getElementById('newNoteForm');
        const noteTitle = document.getElementById('noteTitle');
        const noteContent = document.getElementById('noteContent');
        const saveBtn = document.getElementById('saveBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const notesContainer = document.getElementById('notesContainer');
        const emptyState = document.getElementById('emptyState');
        const emptyStateNewNoteBtn = document.getElementById('emptyStateNewNoteBtn');

         // State
        let editingNoteId = null;
        let notes = JSON.parse(localStorage.getItem('notes')) || [];

         // Initialize the app
        renderNotes();
        updateEmptyState();

         // Event Listeners
        newNoteBtn.addEventListener('click', showNewNoteForm);
        emptyStateNewNoteBtn.addEventListener('click', showNewNoteForm);
        searchBtn.addEventListener('click', toggleSearch);
        saveBtn.addEventListener('click', saveNote);
        cancelBtn.addEventListener('click', hideNewNoteForm);
        searchInput.addEventListener('input', searchNotes);

         // Functions
            function showNewNoteForm() {
                editingNoteId = null;
                noteTitle.value = '';
                noteContent.value = '';
                newNoteForm.classList.remove('hidden');
                newNoteForm.scrollIntoView({ behavior: 'smooth' });
                noteTitle.focus();
            }

            function hideNewNoteForm() {
                newNoteForm.classList.add('hidden');
            }

            function toggleSearch() {
                searchContainer.classList.toggle('hidden');
                if (!searchContainer.classList.contains('hidden')) {
                    searchInput.focus();
                }
                searchInput.value = '';
                renderNotes();
            }

            function searchNotes() {
                const searchTerm = searchInput.value.toLowerCase();
                const filteredNotes = notes.filter(note => 
                    note.title.toLowerCase().includes(searchTerm) || 
                    note.content.toLowerCase().includes(searchTerm)
                );
                renderNotes(filteredNotes);
            }

            function saveNote() {
                const title = noteTitle.value.trim();
                const content = noteContent.value.trim();

                if (!title && !content) {
                    alert('Please add either a title or content for the note.');
                    return;
                }

                const now = new Date();
                const timestamp = now.toISOString();
                const formattedDate = formatDate(now);

                if (editingNoteId) {
                    // Update existing note
                    const noteIndex = notes.findIndex(note => note.id === editingNoteId);
                    if (noteIndex !== -1) {
                        notes[noteIndex] = {
                            ...notes[noteIndex],
                            title,
                            content,
                            updatedAt: timestamp
                        };
                    }
                } else {
                    // Create new note
                    const newNote = {
                        id: Date.now().toString(),
                        title,
                        content,
                        createdAt: timestamp,
                        updatedAt: timestamp,
                        color: getRandomColor()
                    };
                    notes.unshift(newNote);
                }

                localStorage.setItem('notes', JSON.stringify(notes));
                hideNewNoteForm();
                renderNotes();
            }

            function renderNotes(notesToRender = notes) {
                notesContainer.innerHTML = '';

                if (notesToRender.length === 0) {
                    updateEmptyState(true);
                    return;
                }

                updateEmptyState(false);

                notesToRender.forEach(note => {
                    const truncatedContent = note.content.length > 100 
                        ? note.content.substring(0, 100) + '...' 
                        : note.content;

                    const noteElement = document.createElement('div');
                    noteElement.className = `note-card bg-white rounded-lg shadow-md p-4 overflow-hidden relative ${note.color} new-note`;
                    noteElement.innerHTML = `
                        <div class="absolute top-2 right-2 flex space-x-1">
                            <button class="edit-btn p-1 text-gray-400 hover:text-blue-600 transition" data-id="${note.id}">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h Bold 5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                            <button class="delete-btn p-1 text-gray-400 hover:text-red-600 transition" data-id="${note.id}">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                        <h3 class="text-lg font-semibold mb-2 truncate">${note.title || 'Untitled Note'}</h3>
                        <p class="text-gray-600 mb-4 whitespace-pre-line">${truncatedContent}</p>
                        <div class="text-xs text-gray-400 mt-4">Last edited: ${formatDate(new Date(note.updatedAt))}</div>
                    `;

                    notesContainer.appendChild(noteElement);
                });

                // Add event listeners to edit and delete buttons
                document.querySelectorAll('.edit-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        editNote(this.getAttribute('data-id'));
                    });
                });

                document.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        deleteNote(this.getAttribute('data-id'));
                    });
                });
            }

            function editNote(id) {
                const noteToEdit = notes.find(note => note.id === id);
                if (noteToEdit) {
                    editingNoteId = id;
                    noteTitle.value = noteToEdit.title || '';
                    noteContent.value = noteToEdit.content || '';
                    newNoteForm.classList.remove('hidden');
                    newNoteForm.scrollIntoView({ behavior: 'smooth' });
                    noteTitle.focus();
                }
            }

            function deleteNote(id) {
                if (confirm('Are you sure you want to delete this note?')) {
                    notes = notes.filter(note => note.id !== id);
                    localStorage.setItem('notes', JSON.stringify(notes));
                    renderNotes();
                    updateEmptyState();
                }
            }

            function updateEmptyState(show = notes.length === 0) {
                emptyState.classList.toggle('hidden', !show);
                if (show) {
                    notesContainer.classList.add('hidden');
                } else {
                    notesContainer.classList.remove('hidden');
                }
            }

            function formatDate(date) {
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }

            function getRandomColor() {
                const colors = [
                    'bg-blue-50 border-l-4 border-blue-500',
                    'bg-green-50 border-l-4 border-green-500',
                    'bg-purple-50 border-l-4 border-purple-500',
                    'bg-yellow-50 border-l-4 border-yellow-500',
                    'bg-pink-50 border-l-4 border-pink-500',
                    'bg-indigo-50 border-l-4 border-indigo-500'
                ];
                return colors[Math.floor(Math.random() * colors.length)];
            }
        });
