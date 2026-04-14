# Firebase Setup Guide — Treasure Hunt

Follow these steps to set up Firebase for the treasure hunt app.
**Only Firestore is needed** — images are stored as base64, so no paid plan required!

---

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter a project name: `treasure-hunt`
4. **Disable** Google Analytics (not needed)
5. Click **Create Project**

---

## Step 2: Register a Web App

1. In your project dashboard, click the **Web icon** (`</>`)
2. Enter a nickname: `treasure-hunt-web`
3. Click **Register app**
4. You'll see a config object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "treasure-hunt-xxxxx.firebaseapp.com",
  projectId: "treasure-hunt-xxxxx",
  storageBucket: "treasure-hunt-xxxxx.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

5. **Copy this config** and paste it into `firebase-config.js`, replacing the placeholder values

---

## Step 3: Enable Firestore Database

1. In the sidebar, click **"Firestore Database"**
2. Click **"Create database"**
3. Choose **Start in test mode**
4. Select a location closest to you (e.g., `asia-south1` for India)
5. Click **Enable**

### Security Rules

Go to **Firestore → Rules** and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /steps/{stepId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

> Note: These are permissive rules for a one-time personal use. They expire in 30 days.

---

## Step 4: Initialize the Hunt

1. Open `admin.html` in your browser
2. Enter the PIN (default: `1234`)
3. Click **"Initialize Hunt"**
4. This creates all the Firestore documents

---

## Step 5: Test It

1. Open `index.html` in a browser — it should redirect to Step 1
2. Open `admin.html` in another tab/device
3. Walk through the flow:
   - Click "I'm here" → upload a photo → submit
   - Switch to admin → see the photo → click "Approve"
   - Switch back → clue should reveal in real-time

---

## Important: Use a Local Server

Firebase requires HTTP, not `file://`. Use one of these:

```bash
# Python
python -m http.server 8080

# Node.js
npx serve .
```

Then open `http://localhost:8080`

---

## (Optional) Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Set public directory to "." 
# Don't configure as single-page app
firebase deploy --only hosting
```

Your app will be live at: `https://your-project.web.app`

---

## File Structure

```
treasure-hunt/
├── index.html          ← Smart redirect to current step
├── step1.html          ← Step 1 page
├── step2.html          ← Step 2 page
├── step3.html          ← Step 3 page
├── step4.html          ← Step 4 page
├── final.html          ← Final celebration
├── admin.html          ← Admin dashboard (PIN protected)
├── styles.css          ← Design system
├── firebase-config.js  ← Firebase init (edit this!)
├── animations.js       ← GSAP animations
├── app.js              ← Step page logic
└── admin.js            ← Admin dashboard logic
```

## Customizing Clues

Edit the clue text in `app.js` — look for the `stepContent` object:

```javascript
var stepContent = {
  step1: {
    clue: 'Your clue for Step 2 here',
    ...
  },
  step2: {
    clue: 'Your clue for Step 3 here',
    ...
  },
  // etc.
};
```

## Changing the Admin PIN

Edit `firebase-config.js`:

```javascript
const ADMIN_PIN = "1234";  // Change this!
```
