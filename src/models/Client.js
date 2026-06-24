import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const ClientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
  },
  password: {
    type: String,
    // Not strictly required immediately to allow backwards compatibility
    // with existing clients, but will be required for portal login.
  },
  address: {
    line1: { type: String, default: '' },
    line2: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
  },
  clientPortalToken: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4(),
  },
  billingProfile: {
    retainerAmount: {
      type: Number,
      default: 0,
    },
    billingDate: {
      type: Number,
      default: 1,
      min: 1,
      max: 28,
    },
    autoInvoice: {
      type: Boolean,
      default: false,
    },
  },
  socialProfile: {
    instagramUrl: { type: String, default: '' },
    websiteUrl: { type: String, default: '' },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ClientSchema.index({ email: 1 });
ClientSchema.index({ company: 1 });
ClientSchema.index({ clientPortalToken: 1 }, { unique: true });

const Client = mongoose.models.Client || mongoose.model('Client', ClientSchema);

export default Client;
