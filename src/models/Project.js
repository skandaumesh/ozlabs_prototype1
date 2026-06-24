import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client reference is required'],
  },
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['website_design', 'social_media', 'graphic_design', 'other'],
    default: 'other',
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'on_hold'],
    default: 'active',
  },
  dueDate: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ProjectSchema.index({ clientId: 1 });
ProjectSchema.index({ status: 1 });

const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

export default Project;
