import mongoose from 'mongoose';

const BrandAssetSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  logoUrl: {
    type: String,
    default: '',
  },
  brandColors: {
    type: [String],
    default: [],
  },
  fonts: {
    type: [String],
    default: [],
  },
  files: [
    {
      name: { type: String, required: true },
      url: { type: String, required: true },
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

BrandAssetSchema.index({ clientId: 1 });

const BrandAsset = mongoose.models.BrandAsset || mongoose.model('BrandAsset', BrandAssetSchema);

export default BrandAsset;
