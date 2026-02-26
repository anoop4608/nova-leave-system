// =====================================
// NOVA HR ULTIMATE — ADMIN CONTROLLER
// =====================================

// 🔥 Firebase already initialized from app.js
const db = firebase.firestore();

// ===============================
// 🚪 LOGOUT
// ===============================
function logout() {
  window.location.href = "login.html";
}

// ===============================
// 📊 LOAD LEAVES REALTIME
// ===============================
function loadLeaves() {

  // 🔢 KPI counters
  let pending = 0;
  let approved = 0;
  let rejected = 0;

  db.collection("leaves")
    .orderBy("created", "desc")
    .onSnapshot(snapshot => {

      const table = document.getElementById("leaveTable");
      table.innerHTML = "";

      // reset counters each refresh
      pending = 0;
      approved = 0;
      rejected = 0;

      snapshot.forEach(doc => {
        const d = doc.data();

        // ===============================
        // 🎯 COUNT STATUS
        // ===============================
        if (d.status === "Pending") pending++;
        if (d.status === "Approved") approved++;
        if (d.status === "Rejected") rejected++;

        // ===============================
        // 🧾 TABLE ROW
        // ===============================
        const row = `
          <tr>
            <td>${d.empId || "-"}</td>
            <td>${d.fromDate || "-"}</td>
            <td>${d.toDate || "-"}</td>
            <td>${d.days || 0}</td>
            <td><b>${d.status || "Pending"}</b></td>
            <td>
              <button class="btn btn-approve"
                onclick="updateStatus('${doc.id}','Approved')">
                Approve
              </button>

              <button class="btn btn-reject"
                onclick="updateStatus('${doc.id}','Rejected')">
                Reject
              </button>
            </td>
          </tr>
        `;

        table.innerHTML += row;
      });

      // ===============================
      // 📊 UPDATE KPI UI
      // ===============================
      document.getElementById("pendingCount").innerText = pending;
      document.getElementById("approvedCount").innerText = approved;
      document.getElementById("rejectedCount").innerText = rejected;

    }, err => {
      console.error("Realtime error:", err);
      alert("Error loading leave data");
    });
}

// ===============================
// ✅ UPDATE STATUS
// ===============================
function updateStatus(id, status) {
  db.collection("leaves")
    .doc(id)
    .update({
      status: status,
      actionTime: new Date()
    })
    .then(() => {
      console.log("Status updated");
    })
    .catch(err => {
      console.error(err);
      alert("Failed to update status");
    });
}

// ===============================
// 🚀 AUTO START
// ===============================
window.onload = () => {
  loadLeaves();
};
