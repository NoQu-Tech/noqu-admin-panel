// config/firebase-admin.js

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const filePath = path.resolve(__dirname, './serviceAccountKey.json');

if (!fs.existsSync(filePath)) {
  console.error('❌ serviceAccountKey.json not found at:', filePath);
  process.exit(1);
}

const serviceAccount = require(filePath);

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.error('❌ Firebase Admin init failed:', error.message);
  process.exit(1);
}

module.exports = {
  admin, // export admin explicitly
  auth: admin.auth(), // export auth instance
  firestore: admin.firestore(),
};
