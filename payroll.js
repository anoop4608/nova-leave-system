```javascript
// ==========================================
// NOVA HR ULTIMATE — PAYROLL ENGINE PRO
// Nova Graphics LLP
// ==========================================

// ===== Firebase already initialized in app.js =====

let employeesCache = {};

// ==========================================
// LOAD EMPLOYEES (for dropdown & cache)
// ==========================================
function loadEmployees() {
  db.collection("employees").get().then(snapshot => {
    const select = document.getElementById("salaryEmpId");
    if (!select) return;

    select.innerHTML = '<option value="">Select Employee</option>';

    snapshot.forEach(doc => {
      const e = doc.data();
      employeesCache[e.empId] = e;

      select.innerHTML += `
        <option value="${e.empId}">
          ${e.empId} — ${e.name}
        </option>
      `;
    });
  });
}

// ==========================================
// AUTO CALCULATE OT RATE
// ==========================================
function calculateOTRate() {
  const empId = document.getElementById("salaryEmpId").value;
  const otType = document.getElementById("otType").value;
  const rrRateInput = document.getElementById("rrRate");

  if (!empId || !employeesCache[empId]) return;

  const salary = employeesCache[empId].salary || 0;

  if (otType === "salary") {
    // salary / 26 days / 8 hours
    const hourly = salary / 26 / 8;
    document.getElementById("otRate").value = hourly.toFixed(2);
    rrRateInput.style.display = "none";
  }

  if (otType === "rr") {
    rrRateInput.style.display = "block";
    document.getElementById("otRate").value = rrRateInput.value || 0;
  }
}

// ==========================================
// GENERATE SALARY + OT + LEAVE
// ==========================================
function generateSalary() {
  const empId = document.getElementById("salaryEmpId").value;
  const month = document.getElementById("salaryMonth").value;
  const otHours = Number(document.getElementById("otHours").value || 0);
  const otRate = Number(document.getElementById("otRate").value || 0);
  const leaveTaken = Number(document.getElementById("leaveTaken").value || 0);

  if (!empId || !employeesCache[empId]) {
    alert("Select employee");
    return;
  }

  const emp = employeesCache[empId];
  const baseSalary = Number(emp.salary || 0);

  // ===== Leave deduction =====
  const perDaySalary = baseSalary / 26;
  const leaveDeduction = leaveTaken * perDaySalary;

  // ===== OT calculation =====
  const otAmount = otHours * otRate;

  // ===== Net salary =====
  const netSalary = baseSalary - leaveDeduction + otAmount;

  // ===== Save to Firestore =====
  db.collection("payroll").add({
    empId,
    name: emp.name,
    department: emp.department || "",
    month,
    baseSalary,
    leaveTaken,
    leaveDeduction,
    otHours,
    otRate,
    otAmount,
    netSalary,
    created: new Date()
  }).then(() => {
    alert("Salary generated ✅");
    downloadPayslip({
      empId,
      name: emp.name,
      department: emp.department || "",
      month,
      baseSalary,
      leaveTaken,
      leaveDeduction,
      otHours,
      otRate,
      otAmount,
      netSalary
    });
  });
}

// ==========================================
// PAYSLIP PDF — ULTRA ENTERPRISE
// ==========================================
function downloadPayslip(data) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 20;

  doc.setFontSize(18);
  doc.text("NOVA GRAPHICS LLP", 20, y);

  y += 8;
  doc.setFontSize(12);
  doc.text("Employee Payslip", 20, y);

  y += 15;

  doc.setFontSize(10);
  doc.text(`Employee ID: ${data.empId}`, 20, y); y += 6;
  doc.text(`Name: ${data.name}`, 20, y); y += 6;
  doc.text(`Department: ${data.department}`, 20, y); y += 6;
  doc.text(`Month: ${data.month}`, 20, y); y += 10;

  doc.text(`Base Salary: ₹${data.baseSalary}`, 20, y); y += 6;
  doc.text(`Leave Deduction: ₹${data.leaveDeduction.toFixed(2)}`, 20, y); y += 6;
  doc.text(`OT Hours: ${data.otHours}`, 20, y); y += 6;
  doc.text(`OT Amount: ₹${data.otAmount.toFixed(2)}`, 20, y); y += 10;

  doc.setFontSize(14);
  doc.text(`NET SALARY: ₹${data.netSalary.toFixed(2)}`, 20, y);

  doc.save(`Payslip_${data.empId}_${data.month}.pdf`);
}

// ==========================================
// SALARY REGISTER
// ==========================================
function downloadSalaryRegister() {
  db.collection("payroll").get().then(snapshot => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 20;

    doc.setFontSize(16);
    doc.text("NOVA GRAPHICS LLP — Salary Register", 20, y);

    y += 12;

    snapshot.forEach(d => {
      const p = d.data();

      doc.setFontSize(10);
      doc.text(
        `${p.empId} | ${p.name} | ${p.month} | ₹${p.netSalary.toFixed(0)}`,
        20,
        y
      );

      y += 7;
    });

    doc.save("Salary_Register.pdf");
  });
}

// ==========================================
// INIT
// ==========================================
setTimeout(loadEmployees, 1500);
```
