import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { notesAPI } from '../services/api';
import type { Note } from '../types';
import toast from 'react-hot-toast';
import logoIcon from '../assets/icon.svg';

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
    <>
      {/* Desktop Design */}
      <div className="hidden lg:block min-h-screen bg-white">
        {/* Desktop Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <img src={logoIcon} alt="Logo" className="w-8 h-8" />
                <span className="text-2xl font-semibold tracking-[-0.04em] text-[#232323]">Dashboard</span>
              </div>
              
              {/* User menu */}
              <button
                onClick={logout}
                className="text-lg leading-[1.5] text-[#6C6C6C] hover:text-[#232323] font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Welcome section */}
          <div className="max-w-2xl mx-auto py-8">
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
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#367AFF] mx-auto"></div>
                  <p className="mt-2 text-[#969696]">Loading notes...</p>
                </div>
              ) : notes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#969696]">No notes yet. Create your first note!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note._id} className="relative">
                      {editingNote === note._id ? (
                        // Edit mode
                        <div className="px-4 py-6 border border-[#D9D9D9] shadow-sm rounded-[10px] space-y-4">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full text-base font-medium leading-[1.5] text-[#232323] bg-transparent border-none outline-none"
                            placeholder="Note title"
                          />
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full min-h-[80px] resize-vertical text-sm leading-[1.5] text-[#232323] bg-transparent border-none outline-none"
                            placeholder="Note content"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEditNote(note._id)}
                              className="px-4 py-2 bg-[#367AFF] rounded-[10px] text-sm font-semibold text-white"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditNote}
                              className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-[10px] text-sm font-semibold"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View mode - Mobile card style
                        <div className="px-4 py-6 border border-[#D9D9D9] shadow-sm rounded-[10px] cursor-pointer" onClick={() => startEditNote(note)}>
                          <p className="text-base font-medium leading-[1.5] text-[#232323]">{note.title}</p>
                          <p className="text-sm leading-[1.5] text-[#969696] mt-1">{note.content}</p>
                          <p className="text-xs text-[#9A9A9A] mt-2">Click to edit</p>
                        </div>
                      )}
                      
                      {/* Delete button positioned absolutely */}
                      {editingNote !== note._id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNote(note._id);
                          }}
                          className="absolute top-4 right-4 p-1 text-[#9A9A9A] hover:text-red-500 transition-colors"
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Design - matches Figma Dashboard M */}
      <div className="lg:hidden w-full min-h-screen bg-[#F5F5F5] flex flex-col">
        {/* Header with logo, title and sign out - same bg as dashboard */}
        <div className="bg-[#F5F5F5] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoIcon} alt="Logo" className="w-8 h-8" />
            <span className="text-2xl font-semibold leading-[1.1] tracking-[-0.04em] text-[#232323]">Dashboard</span>
          </div>
          <button
            onClick={logout}
            className="text-lg leading-[1.5] text-[#367AFF] font-medium underline"
          >
            Sign Out
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-6 py-8 bg-[#F5F5F5]">
          {/* Welcome Card */}
          <div className="bg-white px-6 py-8 rounded-[20px] shadow-lg mb-8">
            <h1 className="text-[32px] font-bold leading-[1.1] tracking-[-0.04em] text-[#232323] mb-1">
              Welcome, {user?.name}!
            </h1>
            <p className="text-[#232323] text-base leading-[1.5]">
              Email: {user?.email?.replace(/(.{6})(.*)(@.*)/, '$1***$3')}
            </p>
          </div>

          {/* Create Note Button */}
          <button
            onClick={handleCreateNote}
            className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-[#367AFF] rounded-[20px] text-lg font-semibold leading-[1.2] tracking-[-0.01em] text-white mb-8 hover:bg-[#2563eb] transition-colors"
          >
            Create Note
          </button>
          
          {/* Notes Title */}
          <h2 className="text-2xl font-bold leading-[1.1] tracking-[-0.04em] text-[#232323] text-left mb-6">Notes</h2>

          {/* Create Note Form */}
          {isCreatingNote && (
            <div className="bg-white px-6 py-6 rounded-[20px] shadow-lg space-y-4 mb-6">
              <h3 className="text-lg font-semibold text-[#232323]">Create New Note</h3>
              <input
                type="text"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                className="w-full text-base font-medium leading-[1.5] text-[#232323] bg-transparent border border-[#D9D9D9] rounded-[15px] px-4 py-3 outline-none"
                placeholder="Note title"
                required
              />
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="w-full min-h-[80px] resize-vertical text-sm leading-[1.5] text-[#232323] bg-transparent border border-[#D9D9D9] rounded-[15px] px-4 py-3 outline-none"
                placeholder="Note content"
                required
              />
              <div className="flex gap-2">
                <button
                  onClick={createNote}
                  className="px-4 py-2 bg-[#367AFF] rounded-[15px] text-sm font-semibold text-white"
                >
                  Save Note
                </button>
                <button
                  onClick={cancelCreateNote}
                  className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-[15px] text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Notes List */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#367AFF] mx-auto"></div>
              <p className="mt-2 text-[#969696]">Loading notes...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#969696]">No notes yet. Create your first note!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note._id} className="relative">
                  {editingNote === note._id ? (
                    // Edit mode
                    <div className="bg-white px-6 py-6 rounded-[20px] shadow-lg space-y-4">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full text-base font-medium leading-[1.5] text-[#232323] bg-transparent border-none outline-none"
                        placeholder="Note title"
                      />
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full min-h-[80px] resize-vertical text-sm leading-[1.5] text-[#232323] bg-transparent border-none outline-none"
                        placeholder="Note content"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEditNote(note._id)}
                          className="px-4 py-2 bg-[#367AFF] rounded-[15px] text-sm font-semibold text-white"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditNote}
                          className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-[15px] text-sm font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode - matches Figma note cards with shadow effect
                    <div className="bg-white px-6 py-6 rounded-[20px] shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer relative" onClick={() => startEditNote(note)}>
                      <p className="text-[18px] font-medium leading-[1.5] text-[#232323] pr-12">{note.title}</p>
                    </div>
                  )}
                  
                  {/* Delete button positioned absolutely - matches Figma */}
                  {editingNote !== note._id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note._id);
                      }}
                      className="absolute top-6 right-6 p-1 text-[#9A9A9A] hover:text-red-500 transition-colors"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Home Indicator */}
        <div className="flex justify-center py-4 bg-[#F5F5F5]">
          <div className="w-[134px] h-[5px] bg-black rounded-full"></div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
