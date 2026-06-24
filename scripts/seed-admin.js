import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ozl-studio';

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    // We will create the user skanda.onezerolabs@gmail.com 
    // AND the ones from .env.local
    const emails = [
      'skanda.onezerolabs@gmail.com',
      'skanda@onezerolabs.in',
      'praveen@onezerolabs.in'
    ];
    
    const password = await bcrypt.hash('admin123', 10);

    for (const email of emails) {
      const existingUser = await Admin.findOne({ email });
      if (!existingUser) {
        await Admin.create({
          name: email.split('@')[0],
          email: email,
          password: password,
          role: 'superadmin'
        });
        console.log(`Created admin user: ${email}`);
      } else {
        console.log(`Admin user already exists: ${email}`);
      }
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
