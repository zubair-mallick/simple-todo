import { body, param } from 'express-validator';

// Auth validation rules
export const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email cannot exceed 100 characters'),
  
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];

export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const otpValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers')
];

export const emailValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail()
];

// Notes validation rules
export const createNoteValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title is required and cannot exceed 100 characters'),
  
  body('content')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Content is required and cannot exceed 5000 characters'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags && Array.isArray(tags)) {
        if (tags.length > 10) {
          throw new Error('Cannot have more than 10 tags');
        }
        for (const tag of tags) {
          if (typeof tag !== 'string' || tag.trim().length === 0 || tag.length > 20) {
            throw new Error('Each tag must be a non-empty string with maximum 20 characters');
          }
        }
      }
      return true;
    }),
  
  body('isPinned')
    .optional()
    .isBoolean()
    .withMessage('isPinned must be a boolean'),
  
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color code')
];

export const updateNoteValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid note ID'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title cannot be empty and cannot exceed 100 characters'),
  
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Content cannot be empty and cannot exceed 5000 characters'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags && Array.isArray(tags)) {
        if (tags.length > 10) {
          throw new Error('Cannot have more than 10 tags');
        }
        for (const tag of tags) {
          if (typeof tag !== 'string' || tag.trim().length === 0 || tag.length > 20) {
            throw new Error('Each tag must be a non-empty string with maximum 20 characters');
          }
        }
      }
      return true;
    }),
  
  body('isPinned')
    .optional()
    .isBoolean()
    .withMessage('isPinned must be a boolean'),
  
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color code')
];

export const noteIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid note ID')
];

export const deleteMultipleNotesValidation = [
  body('noteIds')
    .isArray({ min: 1, max: 50 })
    .withMessage('noteIds must be an array with 1-50 items')
    .custom((noteIds) => {
      for (const id of noteIds) {
        if (typeof id !== 'string' || !id.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error('All note IDs must be valid MongoDB ObjectIds');
        }
      }
      return true;
    })
];

// Query validation
export const notesQueryValidation = [
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  body('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query cannot be empty and cannot exceed 100 characters'),
  
  body('pinned')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Pinned must be true or false'),
  
  body('tags')
    .optional()
    .custom((tags) => {
      if (typeof tags === 'string') {
        const tagArray = tags.split(',').map(tag => tag.trim());
        if (tagArray.length > 10) {
          throw new Error('Cannot filter by more than 10 tags');
        }
        for (const tag of tagArray) {
          if (tag.length === 0 || tag.length > 20) {
            throw new Error('Each tag must be non-empty and cannot exceed 20 characters');
          }
        }
      }
      return true;
    })
];
