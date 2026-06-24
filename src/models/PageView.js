import mongoose from 'mongoose';

const PageViewSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  sessionId: {
    type: String,
    required: true,
  },
  hostname: {
    type: String,
    default: '',
  },
  pathname: {
    type: String,
    default: '/',
  },
  referrer: {
    type: String,
    default: 'direct',
  },
  browser: {
    type: String,
    default: 'Unknown',
  },
  os: {
    type: String,
    default: 'Unknown',
  },
  device: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet'],
    default: 'desktop',
  },
  country: {
    type: String,
    default: 'Unknown',
  },
  screenWidth: {
    type: Number,
    default: 0,
  },
  language: {
    type: String,
    default: '',
  },
  duration: {
    type: Number,
    default: 0,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for fast dashboard queries by client and time range
PageViewSchema.index({ clientId: 1, timestamp: -1 });
// Index for unique visitor counting
PageViewSchema.index({ clientId: 1, sessionId: 1 });
// TTL index — auto-delete data older than 1 year to save storage
PageViewSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

const PageView = mongoose.models.PageView || mongoose.model('PageView', PageViewSchema);

export default PageView;
