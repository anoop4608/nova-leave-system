// 🔴 IMPORTANT: Replace with your Firebase config later
const firebaseConfig = {
  apiKey: "PASTE_FROM_FIREBASE",
  authDomain: "PASTE_FROM_FIREBASE",
  projectId: "PASTE_FROM_FIREBASE"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function applyLeave(){
  const emp = document.getElementById("empId").value;
  const from = document.getElementById("fromDate").value;
  const to = document.getElementById("toDate").value;

  const days =
    (new Date(to) - new Date(from)) / (1000*60*60*24) + 1;

  db.collection("leaves").add({
    empId: emp,
    fromDate: from,
    toDate: to,
    days: days,
    status: "Pending",
    created: new Date()
  });

  alert("Leave submitted to cloud ✅");
}