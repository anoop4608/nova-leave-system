```javascript
// ==========================================
// NOVA HR ULTIMATE — SALARY & PAYSLIP ENGINE
// ==========================================

const WORKING_DAYS = 26;
let empCache = {};

// ===============================
// LOAD EMPLOYEES INTO DROPDOWN
// ===============================
function loadPayrollEmployees() {

  const select = document.getElementById("payEmp");
  if (!select) return;

  db.collection("employees").get().then(snapshot => {

    select.innerHTML = `<option value="">Select Employee</option>`;

    snapshot.forEach(doc => {
      const e = doc.data();
      empCache[e.empId] = e;

      select.innerHTML += `
        <option value="${e.empId}">
          ${e.empId} — ${e.name}
        </option>
      `;
    });
  });
}

// ===============================
// OT RATE CALCULATOR (2 METHODS)
// ===============================
function updateOTRate() {

  const empId = document.getElementById("payEmp").value;
  const type = document.getElementById("otType").value;
  const rrInput = document.getElementById("rrRate");

  if (!empCache[empId]) return;

  const salary = empCache[empId].salary || 0;

  if (type === "SALARY_BASED") {
    const hourly = salary / WORKING_DAYS / 8;
    document.getElementById("otRate").value = hourly.toFixed(2);
    rrInput.style.display = "none";
  }

  if (type === "RR_FIXED") {
    rrInput.style.display = "block";
    document.getElementById("otRate").value = rrInput.value || 0;
  }
}

// ===============================
// GENERATE SALARY
// ===============================
function generatePayroll() {

  const empId = document.getElementById("payEmp").value;
  const month = document.getElementById("payMonth").value;
  const otHours = Number(document.getElementById("otHours").value || 0);
  const otRate = Number(document.getElementById("otRate").value || 0);

  if (!empCache[empId]) {
    alert("Select employee");
    return;
  }

  const emp = empCache[empId];
  const baseSalary = emp.salary || 0;

  // ===============================
  // ATTENDANCE AUTO COUNT
  // ===============================
  const [year, mon] = month.split("-");
  const start = `${year}-${mon}-01`;
  const end = `${year}-${mon}-31`;

  db.collection("attendance")
    .where("empId", "==", empId)
    .where("date", ">=", start)
    .where("date", "<=", end)
    .get()
    .then(snapshot => {

      let presentDays = 0;
      snapshot.forEach(d => {
        if (d.data().status === "Present") presentDays++;
      });

      const absentDays = WORKING_DAYS - presentDays;
      const perDaySalary = baseSalary / WORKING_DAYS;
      const absentDeduction = absentDays * perDaySalary;

      // OT
      const otAmount = otHours * otRate;

      const netSalary = baseSalary - absentDeduction + otAmount;

      // ===============================
      // SAVE PAYROLL
      // ===============================
      db.collection("payroll").add({
        empId,
        name: emp.name,
        month,
        baseSalary,
        presentDays,
        absentDays,
        otHours,
        otRate,
        otAmount,
        netSalary,
        created: new Date()
      });

      alert(`✅ Salary Generated

Present: ${presentDays}
Absent: ${absentDays}`);

      generatePayslipPDF({
        empId,
        name: emp.name,
        month,
        baseSalary,
        presentDays,
        absentDays,
        otAmount,
        netSalary
      });

    });
}

// ===============================
// PAYSLIP PDF (PROFESSIONAL)
// ===============================
function generatePayslipPDF(data) {

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 20;

  doc.setFontSize(18);
  doc.text("NOVA GRAPHICS LLP", 20, y);

  y += 10;
  doc.setFontSize(12);
  doc.text("Employee Salary Payslip", 20, y);

  y += 15;

  doc.text(`Employee ID : ${data.empId}`, 20, y); y += 6;
  doc.text(`Name        : ${data.name}`, 20, y); y += 6;
  doc.text(`Month       : ${data.month}`, 20, y); y += 10;

  doc.text(`Base Salary     : ₹${data.baseSalary}`, 20, y); y += 6;
  doc.text(`Present Days    : ${data.presentDays}`, 20, y); y += 6;
  doc.text(`Absent Days     : ${data.absentDays}`, 20, y); y += 6;
  doc.text(`OT Amount       : ₹${data.otAmount}`, 20, y); y += 10;

  doc.setFontSize(14);
  doc.text(`NET SALARY : ₹${data.netSalary.toFixed(2)}`, 20, y);

  doc.save(`Payslip_${data.empId}_${data.month}.pdf`);
}

// ===============================
// AUTO LOAD
// ===============================
setTimeout(loadPayrollEmployees, 1200);
```
