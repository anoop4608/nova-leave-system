// ========================================
// NOVA HR ULTIMATE — ADMIN ENGINE (FINAL)
// ========================================

document.addEventListener("DOMContentLoaded", async () => {
  await refreshAll();
});

// ========================================
// MASTER REFRESH (VERY IMPORTANT)
// ========================================

async function refreshAll() {
  await loadKPIs();
  await loadLeaves();
  await loadEmployees();
  await loadPayroll();
}

// ========================================
// KPI LOADER
// ========================================

async function loadKPIs() {
  const leavesSnap = await db.collection("leaves").get();
  const empSnap = await db.collection("employees").get();

  let pending = 0,
    approved = 0,
    rejected = 0;

  leavesSnap.forEach(doc => {
    const s = doc.data().status;

    if (s === "Pending") pending++;
    if (s === "Approved") approved++;
    if (s === "Rejected") rejected++;
  });

  document.getElementById("pendingCount").innerText = pending;
  document.getElementById("approvedCount").innerText = approved;
  document.getElementById("rejectedCount").innerText = rejected;
  document.getElementById("totalEmployees").innerText = empSnap.size;
}

// ========================================
// LOAD LEAVES
// ========================================

async function loadLeaves() {
  const tbody = document.getElementById("leaveTable");
  if (!tbody) return;

  tbody.innerHTML = "";

  const snap = await db.collection("leaves").get();

  snap.forEach(doc => {
    const d = doc.data();

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${d.empId}</td>
      <td>${d.fromDate}</td>
      <td>${d.toDate}</td>
      <td>${d.days}</td>
      <td>${d.status}</td>
      <td>
        ${
          d.status === "Pending"
            ? `
          <button class="btn-approve"
            onclick="approveLeave('${doc.id}', '${d.empId}', ${d.days})">
            Approve
          </button>
          <button class="btn-reject"
            onclick="rejectLeave('${doc.id}')">
            Reject
          </button>
        `
            : "-"
        }
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// ========================================
// APPROVE LEAVE (ENTERPRISE)
// ========================================

window.approveLeave = async function (leaveId, empId, days) {
  try {
    // 1️⃣ update leave status
    await db.collection("leaves").doc(leaveId).update({
      status: "Approved"
    });

    // 2️⃣ update employee balance
    const empSnap = await db
      .collection("employees")
      .where("empId", "==", empId)
      .get();

    if (!empSnap.empty) {
      const ref = empSnap.docs[0].ref;
      const data = empSnap.docs[0].data();

      await ref.update({
        leaveUsed: (data.leaveUsed || 0) + days,
        leaveBalance: (data.leaveBalance || 0) - days
      });
    }

    alert("✅ Leave Approved & Balance Updated");

    // ⭐⭐⭐ CRITICAL — FULL REFRESH
    await refreshAll();

  } catch (err) {
    console.error(err);
    alert("Approval failed");
  }
};

// ========================================
// REJECT LEAVE
// ========================================

window.rejectLeave = async function (leaveId) {
  await db.collection("leaves").doc(leaveId).update({
    status: "Rejected"
  });

  await refreshAll();
};

// ========================================
// LOAD EMPLOYEES
// ========================================

async function loadEmployees() {
  const tbody = document.getElementById("employeeTable");
  if (!tbody) return;

  tbody.innerHTML = "";

  const snap = await db.collection("employees").get();

  snap.forEach(doc => {
    const d = doc.data();

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${d.empId}</td>
      <td>${d.name}</td>
      <td>${d.department}</td>
      <td>${d.leaveUsed || 0}</td>
      <td>${d.leaveBalance || 0}</td>
    `;

    tbody.appendChild(tr);
  });
}

// ========================================
// LOAD PAYROLL
// ========================================

async function loadPayroll() {
  const tbody = document.getElementById("payrollTable");
  if (!tbody) return;

  tbody.innerHTML = "";

  const snap = await db.collection("employees").get();

  for (const doc of snap.docs) {
    const emp = doc.data();

    const salary = await window.calculateNetSalary(emp);

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${emp.empId}</td>
      <td>${emp.name}</td>
      <td>₹${emp.basicSalary}</td>
      <td>${salary.totalOT}</td>
      <td><b>₹${salary.netSalary}</b></td>
      <td>
        <button class="btn-approve"
          onclick='generatePayslip(${JSON.stringify(emp)})'>
          Payslip
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  }
}
