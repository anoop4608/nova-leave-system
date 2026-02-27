// =============================================
// 🚀 NOVA HR SUPREME — ENTERPRISE PAYROLL ENGINE
// =============================================

const COMPANY_NAME = "NOVA GRAPHICS LLP";
const WORKING_DAYS = 26;
const DAILY_HOURS = 8;

let payrollLocked = false;

// =============================================
// 🔥 AUTO LOAD PAYROLL
// =============================================
window.loadPayrollTable = async function () {
  const tbody = document.getElementById("payrollTableBody");
  if (!tbody) return;

  tbody.innerHTML = "<tr><td colspan='7'>Loading...</td></tr>";

  try {
    const empSnap = await db.collection("employees").get();
    const attSnap = await db.collection("attendance_manual").get();

    let attMap = {};
    attSnap.forEach(doc => {
      const d = doc.data();
      attMap[d.empId] = d;
    });

    let html = "";
    let departmentTotals = {};

    empSnap.forEach(doc => {
      const emp = doc.data();
      const att = attMap[emp.empId] || {};

      const salary = calculateSalary(emp, att);

      // Department summary
      if (!departmentTotals[emp.department]) {
        departmentTotals[emp.department] = 0;
      }
      departmentTotals[emp.department] += salary.netSalary;

      html += `
        <tr>
          <td>${emp.empId}</td>
          <td>${emp.name}</td>
          <td>${emp.department}</td>
          <td>₹${emp.basicSalary || 0}</td>
          <td>${salary.otHours}</td>
          <td><b>₹${salary.netSalary}</b></td>
          <td>
            <button class="btn-primary"
              onclick="generatePayslip('${emp.empId}')">
              Payslip
            </button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html || "<tr><td colspan='7'>No data</td></tr>";

    renderDepartmentSummary(departmentTotals);

  } catch (err) {
    console.error("Payroll error:", err);
    tbody.innerHTML = "<tr><td colspan='7'>Error loading payroll</td></tr>";
  }
};

// =============================================
// 🧠 SUPREME SALARY CALCULATION
// =============================================
function calculateSalary(emp, att) {
  const basic = Number(emp.basicSalary || 0);

  const present = Number(att.presentDays || 0);
  const sunday = Number(att.sundayWorking || 0);
  const holidays = Number(att.holidays || 0);
  const otHours = Number(att.otHours || 0);
  const rrHours = Number(att.rrHours || 0);

  // Attendance pay
  const perDay = basic / WORKING_DAYS;
  const payableDays = present + sunday + holidays;
  const attendancePay = perDay * payableDays;

  // OT logic
  let otAmount = 0;

  if (emp.otType === "SALARY_BASED") {
    const perHour = basic / WORKING_DAYS / DAILY_HOURS;
    otAmount = perHour * otHours;
  } else if (emp.otType === "RR_BASED") {
    otAmount = Number(emp.otRate || 0) * rrHours;
  }

  // Leave deduction auto
  const leaveDeduction = calculateLeaveDeduction(emp, att);

  const netSalary = Math.round(attendancePay + otAmount - leaveDeduction);

  return {
    otHours: otHours || rrHours || 0,
    netSalary,
    leaveDeduction
  };
}

// =============================================
// 🔻 AUTO LEAVE DEDUCTION
// =============================================
function calculateLeaveDeduction(emp, att) {
  const basic = Number(emp.basicSalary || 0);
  const present = Number(att.presentDays || 0);

  const perDay = basic / WORKING_DAYS;
  const absentDays = Math.max(0, WORKING_DAYS - present);

  return absentDays * perDay * 0.5; // half-day policy
}

// =============================================
// 📄 PREMIUM PAYSLIP
// =============================================
window.generatePayslip = async function (empId) {
  const { jsPDF } = window.jspdf;

  const empSnap = await db.collection("employees")
    .where("empId", "==", empId).get();

  if (empSnap.empty) return;

  const emp = empSnap.docs[0].data();

  const attSnap = await db.collection("attendance_manual")
    .where("empId", "==", empId).get();

  const att = attSnap.empty ? {} : attSnap.docs[0].data();
  const salary = calculateSalary(emp, att);

  const doc = new jsPDF();

  // Header
  doc.setFillColor(20, 40, 90);
  doc.rect(0, 0, 210, 20, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(COMPANY_NAME, 14, 13);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);

  doc.text(`Emp ID: ${emp.empId}`, 14, 40);
  doc.text(`Name: ${emp.name}`, 14, 48);
  doc.text(`Department: ${emp.department}`, 14, 56);

  doc.text(`Basic Salary: ₹${emp.basicSalary}`, 14, 75);
  doc.text(`OT Hours: ${salary.otHours}`, 14, 83);
  doc.text(`Leave Deduction: ₹${salary.leaveDeduction}`, 14, 91);

  doc.setFontSize(13);
  doc.text(`Net Salary: ₹${salary.netSalary}`, 14, 105);

  doc.save(`Nova_Payslip_${emp.empId}.pdf`);
};

// =============================================
// 📊 SALARY REGISTER EXCEL
// =============================================
window.exportSalaryExcel = async function () {
  const empSnap = await db.collection("employees").get();
  const attSnap = await db.collection("attendance_manual").get();

  let attMap = {};
  attSnap.forEach(d => attMap[d.data().empId] = d.data());

  let rows = [
    ["Company: NOVA GRAPHICS LLP"],
    [],
    ["Emp ID","Name","Department","Basic","OT","Net Salary"]
  ];

  empSnap.forEach(doc => {
    const emp = doc.data();
    const att = attMap[emp.empId] || {};
    const sal = calculateSalary(emp, att);

    rows.push([
      emp.empId,
      emp.name,
      emp.department,
      emp.basicSalary,
      sal.otHours,
      sal.netSalary
    ]);
  });

  let csv = rows.map(r => r.join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "Nova_Salary_Register.csv";
  a.click();
};

// =============================================
// 🏢 DEPARTMENT SUMMARY
// =============================================
function renderDepartmentSummary(totals) {
  const box = document.getElementById("deptSummary");
  if (!box) return;

  let html = "<h3>Department Salary Summary</h3>";

  Object.keys(totals).forEach(dep => {
    html += `<div>${dep}: ₹${totals[dep]}</div>`;
  });

  box.innerHTML = html;
}
