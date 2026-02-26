// ======================================
// NOVA ADMIN DASHBOARD PRO
// ======================================

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ===============================
// LOAD LEAVES
// ===============================

function loadLeaves() {
  const table = document.getElementById("leaveTable");
  if (!table) return;

  db.collection("leaves")
    .orderBy("created", "desc")
    .onSnapshot(snapshot => {
      table.innerHTML = "";

      snapshot.forEach(doc => {
        const d = doc.data();

        table.innerHTML += `
          <tr>
            <td>${d.empId}</td>
            <td>${d.fromDate}</td>
            <td>${d.toDate}</td>
            <td>${d.days}</td>
            <td>${d.status}</td>
            <td>
              <button onclick="approveLeave('${doc.id}')">Approve</button>
              <button onclick="rejectLeave('${doc.id}')">Reject</button>
            </td>
          </tr>
        `;
      });
    });
}

// ===============================
// APPROVE / REJECT
// ===============================

function approveLeave(id) {
  db.collection("leaves").doc(id).update({ status: "Approved" });
}

function rejectLeave(id) {
  db.collection("leaves").doc(id).update({ status: "Rejected" });
}

// ===============================
// AUTO LOAD
// ===============================

window.onload = loadLeaves;
