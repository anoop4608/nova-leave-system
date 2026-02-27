// ==========================================
// NOVA HRMS — FIREBASE CORE CONFIG
// ==========================================

// 🔴 STEP 1 — PASTE YOUR FIREBASE CONFIG HERE
// (from Firebase → Project Settings → Web App)

const firebaseConfig = {
  apiKey: "AIzaSyBNM3PhED3Zvc-HnOlbjtiW_8p1yIqNCks",
  authDomain: "nova-leave-system.firebaseapp.com",
  projectId: "nova-leave-system",
  storageBucket: "nova-leave-system.firebasestorage.app",
  messagingSenderId: "255794827622",
  appId: "1:255794827622:web:604df9ac7df902c50278a7"
};

// ==========================================
// 🔥 INITIALIZE FIREBASE
// ==========================================

firebase.initializeApp(firebaseConfig);

// ==========================================
// 🔥 INITIALIZE SERVICES (VERY IMPORTANT)
// ==========================================

// ✅ Firestore Database (GLOBAL)
const db = firebase.firestore();
window.db = db;

// ✅ Firebase Auth (GLOBAL)
const auth = firebase.auth();
window.auth = auth;

// ==========================================
// 🔐 ADMIN LOGIN FUNCTION
// ==========================================

window.login = async function () {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  if (!emailInput || !passwordInput) {
    alert("Login fields not found.");
    return;
  }

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  try {
    await auth.signInWithEmailAndPassword(email, password);

    // ✅ Redirect to admin dashboard
    window.location.href = "admin.html";

  } catch (error) {
    console.error("Login Error:", error);
    alert("Login Failed: " + error.message);
  }
};

// ==========================================
// 🚪 LOGOUT FUNCTION
// ==========================================

window.logout = async function () {
  try {
    await auth.signOut();
    window.location.href = "login.html";
  } catch (error) {
    console.error("Logout Error:", error);
  }
};

// ==========================================
// 🛡️ AUTH GUARD (AUTO PROTECT ADMIN)
// ==========================================

auth.onAuthStateChanged(function (user) {
  const isLoginPage = window.location.pathname.includes("login.html");

  // If not logged in and not on login page → redirect
  if (!user && !isLoginPage) {
    window.location.href = "login.html";
  }
});

// ==========================================
// 📊 UTILITY — FORMAT DATE
// ==========================================

window.formatDate = function (dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN");
};

// ==========================================
// 💰 OT CALCULATION HELPER
// ==========================================

window.calculateOTAmount = function (employee, otHours) {
  if (!employee) return 0;

  const rate = Number(employee.otRate || 0);
  const type = employee.otType || "SALARY_BASED";

  // Salary based OT
  if (type === "SALARY_BASED") {
    const basic = Number(employee.basicSalary || 0);
    const hourly = basic / 26 / 8; // 26 days, 8 hours
    return Math.round(hourly * otHours);
  }

  // Fixed rate OT
  return Math.round(rate * otHours);
};

// ==========================================
// ✅ SYSTEM READY LOG
// ==========================================

console.log("✅ Nova HR Ultimate — Firebase Connected");
