# Note Taking App

A full-stack note-taking application with OTP-based authentication, note management, and modern UI components.

## Tech Stack

### Frontend
- React.js with TypeScript
- React Router for navigation
- Axios for API communication
- Modern responsive UI design
- Context-based state management
- Toast notifications for user feedback

### Backend
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- JWT authentication
- Email OTP verification (Nodemailer)
- Rate limiting for security
- Comprehensive input validation

## Features

### Authentication System
- **OTP-Only Authentication** - No passwords required, secure email-based login
- **Email Verification** - Email OTP verification for account activation
- **Date of Birth Capture** - User profile includes date of birth during registration
- **Rate Limiting** - 30-second cooldown between OTP requests to prevent spam
- **JWT Session Management** - Secure token-based authentication
- **Resend OTP Functionality** - Users can request new OTP codes when needed

### Note Management
- **Manual Note Creation** - Users can create notes with custom titles and details
- **Note Editing** - Full CRUD operations for note management
- **Real-time UI Updates** - Instant feedback for all operations
- **User-specific Notes** - Notes are private to each authenticated user

### Security & Validation
- **Input Validation** - Comprehensive validation for all user inputs
- **Error Handling** - Proper error messages with toast notifications
- **CORS Configuration** - Secure cross-origin resource sharing
- **Helmet Security** - HTTP security headers
- **Rate Limiting** - Protection against abuse and spam

## API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user with OTP verification
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "dateOfBirth": "1990-01-15"
}
```

#### POST `/api/auth/verify-otp`
Verify registration OTP
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

#### POST `/api/auth/login`
Initiate login process (sends OTP to email)
```json
{
  "email": "john@example.com"
}
```

#### POST `/api/auth/verify-login-otp`
Verify login OTP
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

#### POST `/api/auth/resend-otp`
Resend OTP (with 30-second rate limiting)
```json
{
  "email": "john@example.com"
}
```

#### GET `/api/auth/me`
Get current authenticated user details
*Requires Authorization: Bearer {token}*

### Notes Endpoints

#### GET `/api/notes`
Get all notes for authenticated user
*Requires Authorization: Bearer {token}*

#### POST `/api/notes`
Create a new note
```json
{
  "title": "My Note Title",
  "content": "Note content here"
}
```
*Requires Authorization: Bearer {token}*

#### PUT `/api/notes/:id`
Update an existing note
```json
{
  "title": "Updated Title",
  "content": "Updated content"
}
```
*Requires Authorization: Bearer {token}*

#### DELETE `/api/notes/:id`
Delete a note
*Requires Authorization: Bearer {token}*

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB account and connection string
- Gmail account for email service (App Password required)

### Backend Setup
1. Navigate to backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   EMAIL_USER=your_gmail_address
   EMAIL_PASS=your_gmail_app_password
   FRONTEND_URL=http://localhost:3000
   ```
4. Start development server: `npm run dev`
5. Server runs on http://localhost:5000

### Frontend Setup (React)
1. Navigate to frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start development server: `npm start`
4. Frontend runs on http://localhost:3000

**Note**: The frontend provides a functional but basic UI for testing the API endpoints. It includes:
- Registration and login forms
- OTP verification pages
- Dashboard with note management
- Toast notifications for user feedback

## Environment Variables

Required environment variables in `backend/.env`:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token generation
- `EMAIL_USER` - Gmail address for sending OTPs
- `EMAIL_PASS` - Gmail app password
- `FRONTEND_URL` - Frontend URL for CORS configuration
- `PORT` - Server port (default: 5000)

## Implementation Status

✅ **Completed Features**
- [x] Project structure setup
- [x] Backend dependencies and configuration
- [x] MongoDB connection and User model
- [x] OTP-only authentication system
- [x] Email verification with Nodemailer
- [x] Date of birth capture during registration
- [x] JWT token-based session management
- [x] Rate limiting (30-second cooldown for OTP requests)
- [x] Comprehensive input validation
- [x] Notes CRUD API endpoints
- [x] Frontend React application setup
- [x] Authentication context and flows
- [x] Dashboard with note management
- [x] Toast notifications and error handling
- [x] Responsive UI components
- [x] API integration and testing

🔄 **Future Enhancements**
- [ ] Advanced note features (categories, tags)
- [ ] Rich text editor for notes
- [ ] File attachments
- [ ] Search and filter functionality
- [ ] Export/import notes
- [ ] Mobile app version
- [ ] Production deployment

