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
- **Dual Authentication Methods** - Support for both OTP-based and Google OAuth authentication
- **OTP Authentication** - No passwords required, secure email-based login
- **Google OAuth Integration** - Firebase-powered Google sign-in/sign-up
- **Smart Authentication Flow** - Automatically detects user's preferred authentication method
- **Email Verification** - Email OTP verification for account activation
- **Date of Birth Capture** - User profile includes date of birth during registration
- **Rate Limiting** - 30-second cooldown between OTP requests to prevent spam
- **JWT Session Management** - Secure token-based authentication
- **Resend OTP Functionality** - Users can request new OTP codes when needed
- **Account Linking** - Link OTP accounts with Google accounts seamlessly

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

#### POST `/api/auth/google`
Authenticate with Google (Firebase ID token)
```json
{
  "idToken": "firebase_id_token_here"
}
```

#### POST `/api/auth/check-auth-method`
Check authentication method for an email
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
- Firebase project for Google Authentication

### Firebase Setup
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and add Google as a sign-in method
3. Go to Project Settings > Service Accounts
4. Generate a new private key and download the JSON file
5. Add your domain to authorized domains in Authentication settings

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
   
   # Firebase Configuration
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
   ```
4. Start development server: `npm run dev`
5. Server runs on http://localhost:5000

### Frontend Setup (React)
1. Navigate to frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure:
   ```env
   VITE_API_URL=http://localhost:5000/api
   
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   ```
4. Start development server: `npm start` or `npm run dev`
5. Frontend runs on http://localhost:3000

**Note**: The frontend provides a functional but basic UI for testing the API endpoints. It includes:
- Registration and login forms
- OTP verification pages
- Dashboard with note management
- Toast notifications for user feedback

## Environment Variables

### Backend (`backend/.env`):
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token generation
- `EMAIL_USER` - Gmail address for sending OTPs
- `EMAIL_PASS` - Gmail app password
- `FRONTEND_URL` - Frontend URL for CORS configuration
- `PORT` - Server port (default: 5000)
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_SERVICE_ACCOUNT_KEY` - Firebase service account key (JSON as string)

### Frontend (`frontend/.env`):
- `VITE_API_URL` - Backend API URL
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID

## Implementation Status

✅ **Completed Features**
- [x] Project structure setup
- [x] Backend dependencies and configuration
- [x] MongoDB connection and User model with multi-auth support
- [x] **Dual Authentication System**: OTP-based + Google OAuth authentication
- [x] **Firebase Integration**: Complete Firebase setup for Google authentication
- [x] **Smart Authentication Flow**: Email-based auth method detection
- [x] **Enhanced Button States**: Loading indicators and countdown timers
- [x] **Rate Limiting UI**: 30-second countdown with visual feedback
- [x] Email verification with Nodemailer
- [x] Date of birth capture during registration
- [x] JWT token-based session management
- [x] Comprehensive input validation and error handling
- [x] **Google Sign-In Components**: Reusable authentication components
- [x] **Smart Login Page**: Intelligent auth method detection
- [x] **Enhanced UX**: Proper loading states, disabled buttons, countdown timers
- [x] Notes CRUD API endpoints with user authentication
- [x] Frontend React application with TypeScript
- [x] Enhanced authentication context with dual auth support
- [x] Dashboard with note management functionality
- [x] Toast notifications and comprehensive error handling
- [x] Responsive UI components with Tailwind CSS
- [x] **Account Linking**: Seamlessly link OTP and Google accounts
- [x] **Production-Ready**: Complete authentication flow with security features

🔄 **Future Enhancements**
- [ ] Advanced note features (categories, tags)
- [ ] Rich text editor for notes
- [ ] File attachments
- [ ] Search and filter functionality
- [ ] Export/import notes
- [ ] Mobile app version
- [ ] Production deployment

