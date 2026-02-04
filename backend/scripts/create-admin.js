const bcrypt = require('bcryptjs');

const email = process.argv[2];
const password = process.argv[3];
const name = process.argv[4] || 'Admin';

if (!email || !password) {
  console.log('Usage: node backend/scripts/create-admin.js <email> <password> [name]');
  process.exit(1);
}

bcrypt.hash(password, 10).then(hash => {
  console.log('Run this SQL in MySQL:');
  console.log(`INSERT INTO users (name, email, password_hash, role, status) VALUES ('${name.replace(/'/g, "''")}', '${email.replace(/'/g, "''")}', '${hash}', 'admin', 'active');`);
  process.exit(0);
});
