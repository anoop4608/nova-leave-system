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
// LOAD LEAVES
// ===============================
async function loadLeaves() {
  try {
    const snap = await db.collection("leaves").get();
    const tbody = document.getElementById("leaveTable");

    if (!tbody) return;

    tbody.innerHTML = "";

    let pending = 0;
    let approved = 0;
    let rejected = 0;

    snap.forEach(doc => {
      const l = doc.data();

      if (l.status === "Pending") pending++;
      if (l.status === "Approved") approved++;
      if (l.status === "Rejected") rejected++;

      tbody.innerHTML += `
        <tr>
          <td>${l.empId}</td>
          <td>${l.fromDate}</td>
          <td>${l.toDate}</td>
          <td>${l.days}</td>
          <td>${l.status}</td>
          <td>-</td>
        </tr>
      `;
    });

    // KPI update
    document.getElementById("pendingCount").innerText = pending;
    document.getElementById("approvedCount").innerText = approved;
    document.getElementById("rejectedCount").innerText = rejected;

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
