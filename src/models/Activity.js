import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  versionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Version',
  },
  action: {
    type: String,
    required: true,
  },
  performedBy: {
    type: String,
    required: true,
  },
  performedByType: {
    type: String,
    enum: ['admin', 'client'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ActivitySchema.index({ projectId: 1, createdAt: -1 });

const Activity = mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);

export default Activity;
