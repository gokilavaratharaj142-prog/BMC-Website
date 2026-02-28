/**
 * Seed admin user for BMC admin login.
 * Run: node backend/scripts/seed-admin.js
 * Or from backend/: node scripts/seed-admin.js
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bmc_secure';
if (!mongoURI.startsWith('mongodb://') && !mongoURI.startsWith('mongodb+srv://')) {
  mongoURI = 'mongodb://127.0.0.1:27017/bmc_secure';
}

const UserSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'staff'], default: 'staff' },
  status: { type: String, enum: ['active', 'disabled'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedAdmin() {
  const username = process.env.ADMIN_USER || 'admin';
  const password = process.env.ADMIN_PASS || 'change-me';
  const email = process.env.ADMIN_EMAIL || 'admin@bmc.local';

  try {
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB');

    const passwordHash = await bcrypt.hash(password, 10);

    const existing = await User.findOne({
      $or: [{ name: username }, { email }],
    });

    if (existing) {
      existing.passwordHash = passwordHash;
      existing.role = 'admin';
      existing.status = 'active';
      await existing.save();
      console.log('Updated existing admin user:', username);
    } else {
      await User.create({
        name: username,
        email,
        passwordHash,
        role: 'admin',
        status: 'active',
      });
      console.log('Created admin user:', username);
    }

    console.log('\n--- Admin Login Credentials ---');
    console.log('Username:', username, '(or email:', email + ')');
    console.log('Password:', password);
    console.log('-------------------------------\n');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedAdmin();
