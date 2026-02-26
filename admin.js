import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBM3pHED3Zvc-Hn0LbjtiW_8p1yIqNCKs",
  authDomain: "nova-leave-system.firebaseapp.com",
  projectId: "nova-leave-system",
  storageBucket: "nova-leave-system.firebasestorage.app",
  messagingSenderId: "255794827622",
  appId: "1:255794827622:web:604df9ac7df902c50278a7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.loadLeaves = async function () {
  const tbody = document.getElementById("leaveTableBody");
  const filter = document.getElementById("filterEmp").value.trim();

  tbody.innerHTML = "";

  let q;

  if (filter) {
    q = query(collection(db, "leaves"), where("empId", "==", filter));
  } else {
    q = query(collection(db, "leaves"), orderBy("createdAt", "desc"));
  }

  const snap = await getDocs(q);

  snap.forEach(d => {
    const data = d.data();

    tbody.innerHTML += `
      <tr>
        <td>${data.empId}</td>
        <td>${data.fromDate}</td>
        <td>${data.toDate}</td>
        <td>${data.days}</td>
        <td><span class="status-${data.status.toLowerCase()}">${data.status}</span></td>
        <td>
          <button class="primary-btn" onclick="approveLeave('${d.id}')">Approve</button>
          <button class="danger-btn" onclick="rejectLeave('${d.id}')">Reject</button>
        </td>
      </tr>
    `;
  });
};

window.approveLeave = async function (id) {
  await updateDoc(doc(db, "leaves", id), { status: "Approved" });
  loadLeaves();
};

window.rejectLeave = async function (id) {
  await updateDoc(doc(db, "leaves", id), { status: "Rejected" });
  loadLeaves();
};

loadLeaves();
