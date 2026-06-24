import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  versionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Version',
    required: [true, 'Version reference is required'],
  },
  x: {
    type: Number,
    min: 0,
    max: 100,
  },
  y: {
    type: Number,
    min: 0,
    max: 100,
  },
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true,
  },
  imageIndex: {
    type: Number,
    default: 0,
  },
  authorName: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
  },
  authorType: {
    type: String,
    enum: ['admin', 'client'],
    required: true,
  },
  status: {
    type: String,
    enum: ['open', 'resolved'],
    default: 'open',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

CommentSchema.index({ versionId: 1 });
CommentSchema.index({ status: 1 });

const Comment = mongoose.models.Comment || mongoose.model('Comment', CommentSchema);

export default Comment;
