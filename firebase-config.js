/* ============================================
   FIREBASE CONFIGURATION — Spark Plan (Free)
   
   Uses Firestore ONLY (no Storage needed).
   Images stored as base64 directly in Firestore.
   
   Replace the config below with YOUR Firebase config.
   See FIREBASE_SETUP.md for instructions.
   ============================================ */

const firebaseConfig = {
  apiKey: "AIzaSyDkjo_fOT9v1W1GN57GaHNyJPw4eOCCy2E",
  authDomain: "tresure-hunt-bday.firebaseapp.com",
  projectId: "tresure-hunt-bday",
  storageBucket: "tresure-hunt-bday.firebasestorage.app",
  messagingSenderId: "788696548847",
  appId: "1:788696548847:web:03eb2a450011664e0ba21a"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ── Admin PIN (change this!) ──
const ADMIN_PIN = "1234";

// ── Step IDs ──
const STEPS = ['step1', 'step2', 'step3', 'step4', 'final'];

// ── Initialize Firestore documents ──
async function initializeHunt() {
  const batch = db.batch();
  batch.set(db.collection('steps').doc('step1'), {
    status: 'waiting', imageData: '', uploadedAt: null, approvedAt: null
  });
  for (let i = 2; i <= 4; i++) {
    batch.set(db.collection('steps').doc('step' + i), {
      status: 'locked', imageData: '', uploadedAt: null, approvedAt: null
    });
  }
  batch.set(db.collection('steps').doc('final'), {
    status: 'locked', imageData: '', uploadedAt: null, approvedAt: null
  });
  await batch.commit();
}

// ── Get current active step ──
async function getCurrentStep() {
  for (const stepId of STEPS) {
    const doc = await db.collection('steps').doc(stepId).get();
    if (!doc.exists) return 'step1';
    if (doc.data().status !== 'approved') return stepId;
  }
  return 'final';
}

// ── Toast notification ──
function showToast(message, duration) {
  duration = duration || 3000;
  var toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(function () { toast.classList.remove('visible'); }, duration);
}

// ── Compress image to base64 (keeps it under ~150KB) ──
function compressImageToBase64(file, maxWidth) {
  maxWidth = maxWidth || 600;
  return new Promise(function (resolve) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var canvas = document.createElement('canvas');
        var width = img.width;
        var height = img.height;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        var base64 = canvas.toDataURL('image/jpeg', 0.5);
        resolve(base64);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
