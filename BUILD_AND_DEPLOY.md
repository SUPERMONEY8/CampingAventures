# Build and Deploy Instructions

## 🏗️ Building the Application

### Prerequisites
1. Make sure you have Node.js installed (v18 or higher recommended)
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

### Step 1: Configure Environment Variables

Create a `.env.local` file in the root directory with your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**How to get Firebase credentials:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Click on the web app icon (</>) or add a new web app
6. Copy the configuration values

### Step 2: Build for Production

Run the build command:

```bash
npm run build
```

This will:
- Type-check the code with TypeScript
- Bundle and optimize the application
- Create a `dist/` folder with production-ready files

### Step 3: Preview Build Locally (Optional)

Test the production build locally:

```bash
npm run preview
```

This starts a local server to preview the built application.

## 🚀 Deployment Options

### Option 1: Deploy to Vercel (Recommended - Easiest)

1. **Install Vercel CLI** (if not installed):
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```
   - Follow the prompts
   - Add your environment variables when prompted
   - Your app will be live at `https://your-project.vercel.app`

3. **Add Environment Variables in Vercel Dashboard**:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add all your `VITE_FIREBASE_*` variables

### Option 2: Deploy to Netlify

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Build and Deploy**:
   ```bash
   npm run build
   netlify deploy --prod
   ```

3. **Configure Environment Variables**:
   - Go to Netlify dashboard
   - Site settings → Environment variables
   - Add all `VITE_FIREBASE_*` variables

### Option 3: Deploy to Firebase Hosting

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting**:
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Set `dist` as public directory
   - Configure as single-page app: **Yes**
   - Don't overwrite index.html: **No**

4. **Build and Deploy**:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

### Option 4: Deploy to GitHub Pages

1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json scripts**:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

4. **Configure GitHub Pages**:
   - Go to repository Settings → Pages
   - Select source: `gh-pages` branch
   - Your app will be at `https://username.github.io/repo-name`

### Option 5: Deploy to Any Static Hosting

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Upload `dist/` folder contents** to your hosting provider:
   - AWS S3 + CloudFront
   - Azure Static Web Apps
   - Google Cloud Storage
   - Any static file hosting service

## 🔧 Post-Deployment Checklist

- [ ] Verify environment variables are set correctly
- [ ] Test authentication flows (login, signup, password reset)
- [ ] Check Firebase security rules are configured
- [ ] Test on mobile devices
- [ ] Verify dark mode works
- [ ] Check all routes are accessible
- [ ] Test Google sign-in (if enabled)
- [ ] Verify error messages display correctly

## 🐛 Troubleshooting

### Build Errors

**TypeScript errors:**
```bash
npm run build
```
Fix any TypeScript errors before deploying.

**Missing dependencies:**
```bash
npm install
```

### Runtime Errors

**Firebase not initialized:**
- Check `.env.local` file exists
- Verify all environment variables are set
- Make sure variables start with `VITE_`

**Authentication not working:**
- Verify Firebase Auth is enabled in Firebase Console
- Check Firebase security rules
- Verify OAuth providers are configured (for Google sign-in)

**Routes not working:**
- For single-page apps, configure your hosting to redirect all routes to `index.html`
- Vercel and Netlify handle this automatically
- For Firebase Hosting, ensure `rewrites` are configured in `firebase.json`

## 📱 Testing Locally

Before deploying, test everything locally:

```bash
# Development server
npm run dev

# Test production build
npm run build
npm run preview
```

Visit:
- `http://localhost:5173` - Development
- `http://localhost:4173` - Production preview

## 🔐 Security Notes

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Firebase API keys are safe** - They're public by design, but protect your security rules
3. **Configure Firestore rules** - See comments in `src/services/firebase.ts`
4. **Enable Firebase Authentication** - Configure in Firebase Console

## 📊 Performance Optimization

The build process automatically:
- ✅ Minifies JavaScript and CSS
- ✅ Tree-shakes unused code
- ✅ Optimizes images
- ✅ Code splitting for better loading

## 🎯 Next Steps After Deployment

1. Set up custom domain (optional)
2. Configure Firebase Analytics
3. Set up error tracking (Sentry, etc.)
4. Configure CI/CD for automatic deployments
5. Add monitoring and logging

