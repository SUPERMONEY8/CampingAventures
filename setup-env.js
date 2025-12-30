/**
 * Quick setup script to create .env.local file
 * Run: node setup-env.js
 */

const fs = require('fs');
const path = require('path');

const envContent = `# Firebase Configuration
# Auto-generated setup file

VITE_FIREBASE_API_KEY=AIzaSyCLQ_9RsfXuADTNzcRLUu3ihfmLflNtzL8
VITE_FIREBASE_AUTH_DOMAIN=camping-aventures.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=camping-aventures
VITE_FIREBASE_STORAGE_BUCKET=camping-aventures.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=57354850876
VITE_FIREBASE_APP_ID=1:57354850876:web:97b68a125e664310b6e939
VITE_FIREBASE_MEASUREMENT_ID=G-YMR7F4R6TZ
`;

const envPath = path.join(process.cwd(), '.env.local');

try {
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local already exists. Skipping...');
  } else {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local file created successfully!');
    console.log('📝 Firebase credentials configured.');
  }
} catch (error) {
  console.error('❌ Error creating .env.local:', error.message);
  process.exit(1);
}

