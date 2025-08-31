import React, { useState, useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { notesAPI } from '../services/api';
import type { Note } from '../types';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const { user, logout } = useAuth();

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const response = await notesAPI.getNotes();
      if (response.success && response.data) {
        setNotes(response.data.notes || []);
      }
    } catch (error) {
      toast.error('Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = () => {
    setIsCreatingNote(true);
    setNewNoteTitle('');
    setNewNoteContent('');
  };

  const createNote = async () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) {
      toast.error('Please enter both title and content');
      return;
    }

    try {
      const response = await notesAPI.createNote({
        title: newNoteTitle.trim(),
        content: newNoteContent.trim(),
      });
      
      if (response.success && response.data) {
        setNotes([...notes, response.data.note]);
        toast.success('Note created successfully');
        setIsCreatingNote(false);
        setNewNoteTitle('');
        setNewNoteContent('');
      }
    } catch (error) {
      toast.error('Failed to create note');
    }
  };

  const cancelCreateNote = () => {
    setIsCreatingNote(false);
    setNewNoteTitle('');
    setNewNoteContent('');
  };

  const startEditNote = (note: Note) => {
    setEditingNote(note._id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const saveEditNote = async (noteId: string) => {
    if (!editTitle.trim() || !editContent.trim()) {
      toast.error('Please enter both title and content');
      return;
    }

    try {
      const response = await notesAPI.updateNote(noteId, {
        title: editTitle.trim(),
        content: editContent.trim(),
      });
      
      if (response.success && response.data) {
        setNotes(notes.map(note => 
          note._id === noteId ? response.data!.note : note
        ));
        toast.success('Note updated successfully');
        setEditingNote(null);
        setEditTitle('');
        setEditContent('');
      }
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const cancelEditNote = () => {
    setEditingNote(null);
    setEditTitle('');
    setEditContent('');
  };

  const deleteNote = async (noteId: string) => {
    try {
      const response = await notesAPI.deleteNote(noteId);
      
      if (response.success) {
        setNotes(notes.filter(note => note._id !== noteId));
        toast.success('Note deleted successfully');
      }
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">Dashboard</span>
            </div>
            
            {/* User menu */}
            <button
              onClick={logout}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome section */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome, {user?.name}!
          </h1>
          <p className="text-gray-600 mb-4">
            Email: {user?.email?.replace(/(.{3})(.*)(@.*)/, '$1***$3')}
          </p>
          
          <button
            onClick={handleCreateNote}
            className="btn btn-primary"
          >
            Create Note
          </button>
        </div>

        {/* Create Note Form */}
        {isCreatingNote && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Note</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="newTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="newTitle"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="input"
                  placeholder="Enter note title"
                  required
                />
              </div>
              <div>
                <label htmlFor="newContent" className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  id="newContent"
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="input min-h-[100px] resize-vertical"
                  placeholder="Enter note content"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={createNote}
                  className="btn btn-primary"
                >
                  Save Note
                </button>
                <button
                  onClick={cancelCreateNote}
                  className="btn bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading notes...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No notes yet. Create your first note!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note._id}
                  className="bg-white rounded-lg shadow-sm border p-4"
                >
                  {editingNote === note._id ? (
                    // Edit mode
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="input w-full font-medium"
                        placeholder="Note title"
                      />
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="input w-full min-h-[80px] resize-vertical text-sm"
                        placeholder="Note content"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEditNote(note._id)}
                          className="btn btn-primary text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditNote}
                          className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="flex items-start justify-between">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => startEditNote(note)}
                      >
                        <h3 className="font-medium text-gray-900 hover:text-primary-600">{note.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">{note.content}</p>
                        <p className="text-xs text-gray-400 mt-2">Click to edit</p>
                      </div>
                      
                      <button
                        onClick={() => deleteNote(note._id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors ml-2"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
