import { Router } from 'express';
import { 
  getNotes, 
  getNote, 
  createNote, 
  updateNote, 
  deleteNote, 
  deleteMultipleNotes,
  togglePin,
  getNoteStats
} from '../controllers/notesController.js';
import { authenticate } from '../middleware/auth.js';
import { 
  createNoteValidation, 
  updateNoteValidation, 
  noteIdValidation,
  deleteMultipleNotesValidation
} from '../middleware/validation.js';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting for notes operations
const notesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many notes requests, please try again later.'
  }
});

const createNoteLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 note creations per minute
  message: {
    success: false,
    message: 'Too many note creation attempts, please try again after a minute.'
  }
});

// Apply authentication middleware to all routes
router.use(authenticate);
router.use(notesLimiter);

// Notes routes
router.get('/', getNotes);
router.get('/stats', getNoteStats);
router.get('/:id', noteIdValidation, getNote);
router.post('/', createNoteLimiter, createNoteValidation, createNote);
router.put('/:id', updateNoteValidation, updateNote);
router.patch('/:id/pin', noteIdValidation, togglePin);
router.delete('/bulk', deleteMultipleNotesValidation, deleteMultipleNotes);
router.delete('/:id', noteIdValidation, deleteNote);

export default router;
