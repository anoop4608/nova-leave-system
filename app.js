// 🔥 Nova Graphics LLP — Production Firebase Config

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
const db = firebase.firestore();

// 🚀 Apply Leave Function
function applyLeave(){

  const emp = document.getElementById("empId").value;
  const from = document.getElementById("fromDate").value;
  const to = document.getElementById("toDate").value;

  if(!emp || !from || !to){
    alert("Please fill all fields");
    return;
  }

  const days = (new Date(to) - new Date(from)) / (1000*60*60*24) + 1;

  db.collection("leaves").add({
    empId: emp,
    fromDate: from,
    toDate: to,
    days: days,
    status: "Pending",
    created: new Date()
  })
  .then(() => {
    alert("✅ Leave submitted to cloud");
    document.getElementById("empId").value="";
  })
  .catch((error) => {
    console.error("Error:", error);
    alert("❌ Error submitting leave");
  });
}
