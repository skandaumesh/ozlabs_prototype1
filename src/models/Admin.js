import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  role: {
    type: String,
    default: 'admin',
    enum: ['admin', 'superadmin'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

AdminSchema.index({ email: 1 });

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

export default Admin;
