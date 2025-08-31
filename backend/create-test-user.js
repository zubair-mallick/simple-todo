import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

// Load environment variables
config();

// Connect to MongoDB
await mongoose.connect(process.env.MONGODB_URI);

// User schema (simplified)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  authProvider: String,
  isVerified: Boolean,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Create test user
try {
  // Delete existing test user if any
  await User.deleteOne({ email: 'testuser@example.com' });
  
  // Hash password
  const hashedPassword = await bcrypt.hash('Password123', 12);
  
  // Create new test user
  const testUser = new User({
    name: 'Test User',
    email: 'testuser@example.com',
    password: hashedPassword,
    authProvider: 'email',
    isVerified: true // Skip email verification
  });
  
  await testUser.save();
  console.log('✅ Test user created successfully!');
  console.log('Email: testuser@example.com');
  console.log('Password: Password123');
  
} catch (error) {
  console.error('❌ Error creating test user:', error);
} finally {
  await mongoose.connection.close();
  process.exit(0);
}
