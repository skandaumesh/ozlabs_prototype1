import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const ContentFieldSchema = new mongoose.Schema({
  key: { 
    type: String, 
    required: [true, 'Field key is required (e.g., hero_title)'] 
  },
  label: { 
    type: String, 
    required: [true, 'Field label is required (e.g., Hero Title)'] 
  },
  type: { 
    type: String, 
    enum: ['text', 'textarea', 'image'], 
    default: 'text' 
  },
  value: { 
    type: mongoose.Schema.Types.Mixed, 
    default: '' 
  },
});

const WebsiteContentSchema = new mongoose.Schema({
  clientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Client', 
    required: true, 
    unique: true 
  },
  apiKey: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => uuidv4(),
  },
  vercelWebhookUrl: {
    type: String,
    default: ''
  },
  fields: [ContentFieldSchema]
}, { timestamps: true });

// Prevent duplicate models during hot-reloads
const WebsiteContent = mongoose.models.WebsiteContent || mongoose.model('WebsiteContent', WebsiteContentSchema);

export default WebsiteContent;
