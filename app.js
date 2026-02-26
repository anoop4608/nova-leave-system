```javascript
// ===============================
// NOVA HRMS — CORE CONFIG
// ===============================

const firebaseConfig = {
  apiKey: "PASTE_FROM_FIREBASE",
  authDomain: "PASTE_FROM_FIREBASE",
  projectId: "PASTE_FROM_FIREBASE",
  storageBucket: "PASTE_FROM_FIREBASE",
  messagingSenderId: "PASTE_FROM_FIREBASE",
  appId: "PASTE_FROM_FIREBASE"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

// ===============================
// LOGIN
// ===============================
function login() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  firebase.auth().signInWithEmailAndPassword(email, pass)
    .then(() => window.location.href = "admin.html")
    .catch(e => alert(e.message));
}

// ===============================
// LOGOUT
// ===============================
function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
}

// ===============================
// APPLY LEAVE
// ===============================
function applyLeave() {
  const emp = empId.value;
  const from = fromDate.value;
  const to = toDate.value;

  if (!emp || !from || !to) {
    alert("Fill all fields");
    return;
  }

  const days = (new Date(to) - new Date(from)) / 86400000 + 1;

  db.collection("leaves").add({
    empId: emp,
    fromDate: from,
    toDate: to,
    days,
    status: "Pending",
    created: new Date()
  }).then(() => {
    alert("Leave submitted ✅");
  });
}
```
