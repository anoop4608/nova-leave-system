// ===============================
// NOVA HR ULTIMATE — ADMIN ENGINE
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  loadEmployees();
  loadLeaves();
});

// ===============================
// LOAD EMPLOYEES
// ===============================
async function loadEmployees() {
  try {
    const snap = await db.collection("employees").get();

    const tbody = document.getElementById("employeeTable");
    const salaryBody = document.getElementById("salaryTable");

    if (!tbody) return;

    tbody.innerHTML = "";
    salaryBody.innerHTML = "";

    let totalEmployees = 0;

    snap.forEach(doc => {
      const e = doc.data();
      totalEmployees++;

      // ===== Employee Master =====
      tbody.innerHTML += `
        <tr>
          <td>${e.empId || ""}</td>
          <td>${e.name || ""}</td>
          <td>${e.department || ""}</td>
          <td>${e.leaveUsed || 0}</td>
          <td>${e.leaveBalance || 0}</td>
        </tr>
      `;

      // ===== Salary Calculation =====
      const basic = e.basicSalary || 0;
      const otHours = e.otHours || 0;

      let hourlyRate = 0;

      if (e.otType === "SALARY_BASED") {
        hourlyRate = basic / 26 / 8;
      } else {
        hourlyRate = e.otRate || 0;
      }

      const otAmount = otHours * hourlyRate;
      const netSalary = basic + otAmount;

      salaryBody.innerHTML += `
        <tr>
          <td>${e.empId}</td>
          <td>${e.name}</td>
          <td>₹${basic}</td>
          <td>${otHours}</td>
          <td><b>₹${netSalary.toFixed(0)}</b></td>
          <td>
            <button class="btn" onclick="generatePayslip('${doc.id}')">
              PDF
            </button>
          </td>
        </tr>
      `;
    });

    // KPI
    const totalBox = document.getElementById("totalEmployees");
    if (totalBox) totalBox.innerText = totalEmployees;

  } catch (err) {
    console.error("Employee load error:", err);
  }
}

// ===============================
// LOAD LEAVES — HR AUTOMATION
// ===============================
async function loadLeaves() {
  try {
    const snapshot = await db.collection("leaves").get();
    const tbody = document.getElementById("leaveTable");

    if (!tbody) return;

    tbody.innerHTML = "";

    let pending = 0, approved = 0, rejected = 0;

    snapshot.forEach(doc => {
      const data = doc.data();

      if (data.status === "Pending") pending++;
      if (data.status === "Approved") approved++;
      if (data.status === "Rejected") rejected++;

      const row = `
        <tr>
          <td>${data.empId || ""}</td>
          <td>${data.fromDate || ""}</td>
          <td>${data.toDate || ""}</td>
          <td>${data.days || 0}</td>
          <td>
            <span class="status-${(data.status || "").toLowerCase()}">
              ${data.status || ""}
            </span>
          </td>
          <td>
            ${data.status === "Pending" ? `
              <button class="btn-approve" onclick="approveLeave('${doc.id}', '${data.empId}', ${data.days})">Approve</button>
              <button class="btn-reject" onclick="rejectLeave('${doc.id}')">Reject</button>
            ` : "-"}
          </td>
        </tr>
      `;

      tbody.innerHTML += row;
    });

    // KPI update
    document.getElementById("pendingCount").textContent = pending;
    document.getElementById("approvedCount").textContent = approved;
    document.getElementById("rejectedCount").textContent = rejected;

  } catch (err) {
    console.error("Leave load error:", err);
  }
}
// ===============================
// PAYSLIP PDF
// ===============================
async function generatePayslip(docId) {
  const docSnap = await db.collection("employees").doc(docId).get();
  const e = docSnap.data();

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  const basic = e.basicSalary || 0;
  const otHours = e.otHours || 0;

  let hourlyRate =
    e.otType === "SALARY_BASED"
      ? basic / 26 / 8
      : e.otRate || 0;

  const otAmount = otHours * hourlyRate;
  const netSalary = basic + otAmount;

  pdf.setFontSize(16);
  pdf.text("NOVA GRAPHICS LLP", 20, 20);

  pdf.setFontSize(12);
  pdf.text(`Employee: ${e.name}`, 20, 40);
  pdf.text(`Emp ID: ${e.empId}`, 20, 50);
  pdf.text(`Department: ${e.department}`, 20, 60);

  pdf.text(`Basic Salary: ₹${basic}`, 20, 80);
  pdf.text(`OT Hours: ${otHours}`, 20, 90);
  pdf.text(`Net Salary: ₹${netSalary.toFixed(0)}`, 20, 110);

  pdf.save(`Payslip_${e.empId}.pdf`);
}

// ===============================
// LOGOUT
// ===============================
function logout() {
  window.location.href = "login.html";
}
// ===============================
// APPROVE LEAVE + AUTO BALANCE CUT
// ===============================
async function approveLeave(leaveId, empId, days) {
  try {
    // 1. update leave status
    await db.collection("leaves").doc(leaveId).update({
      status: "Approved"
    });

    // 2. get employee
    const empSnap = await db.collection("employees")
      .where("empId", "==", empId)
      .get();

    if (!empSnap.empty) {
      const empDoc = empSnap.docs[0];
      const empData = empDoc.data();

      const newUsed = (empData.leaveUsed || 0) + Number(days);
      const newBalance = (empData.leaveBalance || 0) - Number(days);

      await db.collection("employees").doc(empDoc.id).update({
        leaveUsed: newUsed,
        leaveBalance: newBalance
      });
    }

    alert("✅ Leave Approved & Balance Updated");

    loadLeaves();
    loadEmployees();

  } catch (err) {
    console.error(err);
    alert("❌ Approval failed");
  }
}

// ===============================
// REJECT LEAVE
// ===============================
async function rejectLeave(leaveId) {
  try {
    await db.collection("leaves").doc(leaveId).update({
      status: "Rejected"
    });

    alert("❌ Leave Rejected");
    loadLeaves();

  } catch (err) {
    console.error(err);
  }
}
