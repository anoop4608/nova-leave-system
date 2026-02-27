// ============================================
// NOVA HR ULTIMATE — ADMIN ENGINE
// ============================================

const pendingCount = document.getElementById("pendingCount");
const approvedCount = document.getElementById("approvedCount");
const rejectedCount = document.getElementById("rejectedCount");
const employeeCount = document.getElementById("employeeCount");

// ============================================
// LOAD LEAVES
// ============================================
async function loadLeaves() {
  try {
    const tbody = document.getElementById("leaveTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    let p = 0, a = 0, r = 0;

    const snapshot = await db.collection("leaves").get();

    snapshot.forEach(doc => {
      const leave = doc.data();

      if (leave.status === "Pending") p++;
      if (leave.status === "Approved") a++;
      if (leave.status === "Rejected") r++;

      const tr = document.createElement("tr");

      let actionBtns = "-";

      if (leave.status === "Pending") {
        actionBtns = `
          <button class="btn-approve" onclick="approveLeave('${doc.id}','${leave.empId}',${leave.days})">Approve</button>
          <button class="btn-reject" onclick="rejectLeave('${doc.id}')">Reject</button>
        `;
      }

      tr.innerHTML = `
        <td>${leave.empId}</td>
        <td>${leave.from}</td>
        <td>${leave.to}</td>
        <td>${leave.days}</td>
        <td>${leave.status}</td>
        <td>${actionBtns}</td>
      `;

      tbody.appendChild(tr);
    });

    pendingCount.innerText = p;
    approvedCount.innerText = a;
    rejectedCount.innerText = r;

  } catch (err) {
    console.error("Leave load error:", err);
  }
}

// ============================================
// APPROVE LEAVE + AUTO BALANCE UPDATE
// ============================================
async function approveLeave(leaveId, empId, days) {
  try {
    await db.collection("leaves").doc(leaveId).update({
      status: "Approved"
    });

    const empSnap = await db.collection("employees")
      .where("empId", "==", empId)
      .get();

    empSnap.forEach(async doc => {
      const emp = doc.data();

      const used = (emp.leaveUsed || 0) + Number(days);
      const balance = (emp.leaveBalance || 0) - Number(days);

      await db.collection("employees").doc(doc.id).update({
        leaveUsed: used,
        leaveBalance: balance
      });
    });

    alert("✅ Leave Approved & Balance Updated");

    loadLeaves();
    loadEmployees();
    loadPayrollTable();

  } catch (err) {
    console.error("Approve error:", err);
  }
}

// ============================================
// REJECT LEAVE
// ============================================
async function rejectLeave(id) {
  await db.collection("leaves").doc(id).update({
    status: "Rejected"
  });

  loadLeaves();
}

// ============================================
// LOAD EMPLOYEES MASTER
// ============================================
async function loadEmployees() {
  try {
    const tbody = document.getElementById("employeeTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    const snapshot = await db.collection("employees").get();

    let count = 0;

    snapshot.forEach(doc => {
      const emp = doc.data();
      count++;

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${emp.empId}</td>
        <td>${emp.name}</td>
        <td>${emp.department}</td>
        <td>${emp.leaveUsed || 0}</td>
        <td>${emp.leaveBalance || 0}</td>
      `;

      tbody.appendChild(tr);
    });

    if (employeeCount) employeeCount.innerText = count;

  } catch (err) {
    console.error("Employee load error:", err);
  }
}

// ============================================
// PAYROLL ENGINE
// ============================================
async function loadPayrollTable() {
  try {
    const tbody = document.getElementById("payrollTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    const snapshot = await db.collection("employees").get();

    snapshot.forEach(doc => {
      const emp = doc.data();

      const basic = Number(emp.basicSalary || 0);
      const present = Number(emp.presentDays || 0);
      const otHours = Number(emp.otHours || 0);
      const rrHours = Number(emp.rrHours || 0);
      const otRate = Number(emp.otRate || 0);

      // ✅ per day salary
      const perDay = basic / 26;

      // ✅ attendance salary
      let salary = perDay * present;

      // ✅ OT calculation (2 modes)
      let otPay = 0;

      if (emp.otType === "SALARY_BASED") {
        const hourly = basic / 26 / 8;
        otPay = hourly * otHours;
      } else {
        otPay = otRate * rrHours;
      }

      let netSalary = salary + otPay;

      // 🛡️ never negative
      netSalary = Math.max(0, Math.round(netSalary));

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${emp.empId}</td>
        <td>${emp.name}</td>
        <td>${emp.department}</td>
        <td>₹${basic}</td>
        <td>${otHours + rrHours}</td>
        <td>₹${netSalary}</td>
        <td><button class="btn-payslip" onclick="generatePayslip('${emp.empId}')">Payslip</button></td>
      `;

      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("Payroll error:", err);
  }
}

// ============================================
// PAYSLIP PDF
// ============================================
async function generatePayslip(empId) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("NOVA GRAPHICS LLP", 20, 20);

  doc.setFontSize(12);
  doc.text("Salary Payslip", 20, 30);
  doc.text("Employee ID: " + empId, 20, 45);

  doc.save("Nova_Payslip_" + empId + ".pdf");
}

// ============================================
// AUTO LOAD
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  loadLeaves();
  loadEmployees();
  loadPayrollTable();
});
