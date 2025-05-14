import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters long'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Delete the model if it exists to prevent OverwriteModelError
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User; 