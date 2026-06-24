import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const VersionSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project reference is required'],
  },
  versionNumber: {
    type: Number,
    required: true,
    default: 1,
  },
  fileUrl: {
    type: String, // Kept for backwards compatibility
  },
  fileUrls: {
    type: [String],
    validate: {
      validator: function(v) {
        // If there's an old fileUrl, it's valid even if fileUrls is empty
        if (this.fileUrl && (!v || v.length === 0)) return true;
        // Otherwise, need 1 to 5 file URLs
        return v && v.length > 0 && v.length <= 5;
      },
      message: 'You must provide 1 to 5 files per version'
    }
  },
  fileType: {
    type: String,
    enum: ['image', 'pdf'],
    required: true,
  },
  reviewToken: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4(),
  },
  status: {
    type: String,
    enum: ['pending_review', 'changes_requested', 'approved'],
    default: 'pending_review',
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

VersionSchema.index({ projectId: 1 });
VersionSchema.index({ reviewToken: 1 }, { unique: true });
VersionSchema.index({ status: 1 });

const Version = mongoose.models.Version || mongoose.model('Version', VersionSchema);

export default Version;
