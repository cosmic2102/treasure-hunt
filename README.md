# 🌸 Treasure Hunt — Setup Guide
## No Firebase Storage needed — 100% free tier ✅

Images are compressed in-browser (canvas → JPEG ~80-120KB) and stored as
base64 directly in Firestore. **No paid plan required.**

---

## File Structure

```
treasure-hunt/
├── index.html          ← Landing page (share this URL with her)
├── styles.css          ← Shared design system
├── step1–4/index.html  ← Her 4 step pages
├── final/index.html    ← Final reveal page (floating hearts)
└── admin/index.html    ← Your private control panel
```

---

## Step 1 — Create a Firebase Project

1. Go to **https://console.firebase.google.com**
2. Click **"Add project"** → name it → Create
3. Stay on the **Spark (free)** plan — no upgrade needed

---

## Step 2 — Enable Firestore Only

1. Click **"Firestore Database"** in the sidebar
2. Click **"Create database"** → **"Start in test mode"**
3. Choose your region → Enable

> ✅ That's all. No Storage needed.

---

## Step 3 — Get Your Firebase Config

1. **Project Settings** (⚙️ gear icon) → scroll to **"Your apps"**
2. Click **"</> Web"** → register the app
3. Copy the `firebaseConfig` object:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",  // fine to leave, unused
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## Step 4 — Paste Config into All HTML Files

Replace the placeholder block in every file:

| File | Location of config |
|---|---|
| `step1/index.html` | bottom `<script type="module">` |
| `step2/index.html` | same |
| `step3/index.html` | same |
| `step4/index.html` | same |
| `final/index.html` | same |
| `admin/index.html` | same |

---

## Step 5 — Set Admin Password

In `admin/index.html`, find and change:

```js
const ADMIN_PASSWORD = "treasure2024";  // ← change this
```

---

## Step 6 — Deploy (free options)

### Netlify Drop (easiest — 30 seconds)
1. Go to **https://app.netlify.com/drop**
2. Drag the `treasure-hunt/` folder onto the page
3. You get a live `https://xxxxx.netlify.app` URL instantly

### Firebase Hosting
```bash
npm i -g firebase-tools
firebase login
firebase init hosting   # public dir = .  |  SPA = No
firebase deploy
```

### Local testing (never use file://)
```bash
python3 -m http.server 8080
# or
npx serve .
```

---

## How the image flow works (no Storage)

```
Her phone
  ↓  picks photo
  ↓  canvas.toDataURL("image/jpeg", 0.70) at max 720px
  ↓  ~80-120 KB base64 string
  ↓  setDoc → Firestore (steps/step1)
Your admin
  ↓  onSnapshot fires instantly
  ↓  <img src="data:image/jpeg;base64,…"> renders the photo
  ↓  you type clue → click Approve
Her phone
  ↓  onSnapshot fires
  ↓  clue animates in ✨
```

> **Firestore free limit:** 1 GB storage, 50k reads/day, 20k writes/day.
> One treasure hunt uses ≈ 4 writes (submissions) + 4 writes (approvals) = well within limits.

---

## Firestore Security Rules (optional, tighten after the hunt)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /steps/{stepId} {
      allow read, write: if true;
    }
  }
}
```

---

## Customise

| What | Where |
|---|---|
| Messages & personality lines | `<h1>`, `<p class="subtext">`, `personality-line` in each step |
| Clues | Typed live in admin before approving |
| Final location text | Bottom of admin dashboard |
| Admin password | `ADMIN_PASSWORD` in admin/index.html |
| Image quality/size | `compressToBase64(file, maxW=720, q=0.70)` — lower q = smaller |

---

*Made with love. Good luck 🌸*
