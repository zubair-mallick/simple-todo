import { Response } from 'express';
import { validationResult } from 'express-validator';
import { Note } from '../models/Note.js';
import { AuthRequest } from '../middleware/auth.js';

// Get all notes for user
export const getNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { page = 1, limit = 10, search, pinned, tags } = req.query;

    // Build query
    const query: any = { userId };

    // Search functionality
    if (search) {
      query.$text = { $search: search as string };
    }

    // Filter by pinned status
    if (pinned !== undefined) {
      query.isPinned = pinned === 'true';
    }

    // Filter by tags
    if (tags) {
      const tagArray = (tags as string).split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Calculate pagination
    const pageNumber = Math.max(1, parseInt(page as string));
    const limitNumber = Math.max(1, Math.min(100, parseInt(limit as string))); // Max 100 notes per page
    const skip = (pageNumber - 1) * limitNumber;

    // Get notes with pagination
    const notes = await Note.find(query)
      .sort({ isPinned: -1, updatedAt: -1 }) // Pinned notes first, then by update time
      .skip(skip)
      .limit(limitNumber)
      .lean();

    // Get total count for pagination
    const totalNotes = await Note.countDocuments(query);
    const totalPages = Math.ceil(totalNotes / limitNumber);

    res.status(200).json({
      success: true,
      data: {
        notes,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalNotes,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1
        }
      }
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get single note
export const getNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const note = await Note.findOne({ _id: id, userId });

    if (!note) {
      res.status(404).json({
        success: false,
        message: 'Note not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { note }
    });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new note
export const createNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
      return;
    }

    const userId = req.user?.userId;
    const { title, content, tags, isPinned, color } = req.body;

    const note = new Note({
      title,
      content,
      userId,
      tags: tags || [],
      isPinned: isPinned || false,
      color: color || '#ffffff'
    });

    await note.save();

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: { note }
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update note
export const updateNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
      return;
    }

    const userId = req.user?.userId;
    const { id } = req.params;
    const { title, content, tags, isPinned, color } = req.body;

    const note = await Note.findOneAndUpdate(
      { _id: id, userId },
      {
        title,
        content,
        tags,
        isPinned,
        color
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!note) {
      res.status(404).json({
        success: false,
        message: 'Note not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: { note }
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete note
export const deleteNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const note = await Note.findOneAndDelete({ _id: id, userId });

    if (!note) {
      res.status(404).json({
        success: false,
        message: 'Note not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete multiple notes
export const deleteMultipleNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
      return;
    }

    const userId = req.user?.userId;
    const { noteIds } = req.body;

    if (!Array.isArray(noteIds) || noteIds.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Note IDs array is required'
      });
      return;
    }

    const result = await Note.deleteMany({
      _id: { $in: noteIds },
      userId
    });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} notes deleted successfully`,
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    console.error('Delete multiple notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Toggle pin status
export const togglePin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const note = await Note.findOne({ _id: id, userId });

    if (!note) {
      res.status(404).json({
        success: false,
        message: 'Note not found'
      });
      return;
    }

    note.isPinned = !note.isPinned;
    await note.save();

    res.status(200).json({
      success: true,
      message: `Note ${note.isPinned ? 'pinned' : 'unpinned'} successfully`,
      data: { note }
    });
  } catch (error) {
    console.error('Toggle pin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user's note statistics
export const getNoteStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const stats = await Note.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalNotes: { $sum: 1 },
          pinnedNotes: {
            $sum: { $cond: [{ $eq: ['$isPinned', true] }, 1, 0] }
          },
          recentNotes: {
            $sum: {
              $cond: [
                {
                  $gte: [
                    '$createdAt',
                    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const noteStats = stats[0] || {
      totalNotes: 0,
      pinnedNotes: 0,
      recentNotes: 0
    };

    // Get most used tags
    const tagStats = await Note.aggregate([
      { $match: { userId: userId } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...noteStats,
        topTags: tagStats.map(tag => ({
          name: tag._id,
          count: tag.count
        }))
      }
    });
  } catch (error) {
    console.error('Get note stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
