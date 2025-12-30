# 🏕️ Camping Adventures App

A modern camping adventure application with authentication, trip management, and gamification features.

## 🚀 Quick Start

### 1. Setup Environment Variables

**Option A: Use the setup script**
```bash
node setup-env.js
```

**Option B: Create manually**
Create `.env.local` file in the root directory:

```env
VITE_FIREBASE_API_KEY=AIzaSyCLQ_9RsfXuADTNzcRLUu3ihfmLflNtzL8
VITE_FIREBASE_AUTH_DOMAIN=camping-aventures.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=camping-aventures
VITE_FIREBASE_STORAGE_BUCKET=camping-aventures.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=57354850876
VITE_FIREBASE_APP_ID=1:57354850876:web:97b68a125e664310b6e939
VITE_FIREBASE_MEASUREMENT_ID=G-YMR7F4R6TZ
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Visit: `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

### 5. Deploy

See `QUICK_START.md` or `DEPLOY_NOW.md` for detailed deployment instructions.

**Quick Deploy with Vercel:**
```bash
npm install -g vercel
vercel
```

## 📁 Project Structure

```
src/
├── components/       # React components
├── contexts/         # React contexts (Auth)
├── hooks/            # Custom hooks
├── pages/            # Page components
│   └── auth/         # Authentication pages
├── services/         # Firebase services
├── types/            # TypeScript types
└── utils/            # Utility functions
```

## 🎯 Features

- ✅ User Authentication (Email/Password, Google)
- ✅ Protected Routes
- ✅ Form Validation (Zod)
- ✅ Responsive Design
- ✅ Dark Mode Support
- ✅ Modern UI with Glassmorphism

## 🔗 Links

- **GitHub Repo**: https://github.com/SUPERMONEY8/CampingAventures.git
- **Firebase Project**: camping-aventures

## 📚 Documentation

- `QUICK_START.md` - Quick deployment guide
- `DEPLOY_NOW.md` - Detailed deployment instructions
- `BUILD_AND_DEPLOY.md` - Complete build and deploy guide
- `FRONTEND_SUMMARY.md` - What has been built

## 🛠️ Tech Stack

- React 19
- TypeScript
- Vite
- Firebase (Auth, Firestore, Storage)
- Tailwind CSS
- Framer Motion
- React Hook Form
- Zod

## 📝 License

Private project
