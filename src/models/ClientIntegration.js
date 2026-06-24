import mongoose from 'mongoose';

const ClientIntegrationSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  platform: {
    type: String,
    enum: ['instagram', 'google_analytics', 'facebook'],
    required: true,
  },
  accessToken: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    default: '',
  },
  accountId: {
    type: String,
    default: '',
  },
  pageId: {
    type: String,
    default: '',
  },
  tokenExpiresAt: {
    type: Date,
    default: null,
  },
  connectedAt: {
    type: Date,
    default: Date.now,
  },
});

ClientIntegrationSchema.index({ clientId: 1, platform: 1 }, { unique: true });

const ClientIntegration = mongoose.models.ClientIntegration || mongoose.model('ClientIntegration', ClientIntegrationSchema);

export default ClientIntegration;
