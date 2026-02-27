// ============================================
// NOVA HR ULTIMATE — CORE FIREBASE CONFIG
// ============================================

// 🔴 PASTE YOUR REAL FIREBASE CONFIG HERE
const firebaseConfig = {
  apiKey: "AIzaSyBNM3PhED3Zvc-HnOlbjtiW_8p1yIqNCks",
  authDomain: "nova-leave-system.firebaseapp.com",
  projectId: "nova-leave-system",
  storageBucket: "nova-leave-system.firebasestorage.app",
  messagingSenderId: "255794827622",
  appId: "1:255794827622:web:604df9ac7df902c50278a7"
};

// ✅ Initialize Firebase
firebase.initializeApp(firebaseConfig);

// ✅ Global DB reference (VERY IMPORTANT)
window.db = firebase.firestore();
window.auth = firebase.auth();

console.log("✅ Firebase Connected — Nova HR Ultimate Ready");
