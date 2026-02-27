// ========================================
// NOVA HR ULTIMATE — PAYROLL ENGINE
// Supports:
// 1. SALARY_BASED OT
// 2. FIXED_RATE OT
// ========================================

window.calculateNetSalary = async function (emp) {
  try {
    const attendanceSnap = await db
      .collection("attendance")
      .where("empId", "==", emp.empId)
      .get();

    let totalOT = 0;
    let presentDays = 0;

    attendanceSnap.forEach(doc => {
      const data = doc.data();
      presentDays += data.present ? 1 : 0;
      totalOT += Number(data.otHours || 0);
    });

    // =============================
    // OT CALCULATION MODES
    // =============================

    let otAmount = 0;

    if (emp.otType === "SALARY_BASED") {
      const hourlyRate = emp.basicSalary / 26 / 8;
      otAmount = hourlyRate * totalOT;
    } else if (emp.otType === "FIXED_RATE") {
      otAmount = (emp.otRate || 0) * totalOT;
    }

    // =============================
    // ABSENT DEDUCTION
    // =============================

    const perDaySalary = emp.basicSalary / 26;
    const absentDays = Math.max(0, 26 - presentDays);
    const deduction = absentDays * perDaySalary;

    const netSalary =
      emp.basicSalary +
      otAmount -
      deduction;

    return {
      netSalary: Math.round(netSalary),
      totalOT,
      presentDays,
      absentDays,
      otAmount,
      deduction
    };

  } catch (error) {
    console.error("Salary calc error:", error);
    return {
      netSalary: emp.basicSalary,
      totalOT: 0,
      presentDays: 0,
      absentDays: 0,
      otAmount: 0,
      deduction: 0
    };
  }
};

// ========================================
// PAYSLIP PDF GENERATOR
// ========================================

window.generatePayslip = async function (emp) {
  try {
    const salary = await window.calculateNetSalary(emp);

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("NOVA GRAPHICS LLP", 20, 20);

    doc.setFontSize(12);
    doc.text("Employee Payslip", 20, 30);

    doc.text(`Emp ID: ${emp.empId}`, 20, 45);
    doc.text(`Name: ${emp.name}`, 20, 55);
    doc.text(`Department: ${emp.department}`, 20, 65);

    doc.text(`Basic Salary: ₹${emp.basicSalary}`, 20, 85);
    doc.text(`OT Hours: ${salary.totalOT}`, 20, 95);
    doc.text(`OT Amount: ₹${salary.otAmount}`, 20, 105);
    doc.text(`Absent Days: ${salary.absentDays}`, 20, 115);
    doc.text(`Deduction: ₹${salary.deduction}`, 20, 125);

    doc.setFontSize(14);
    doc.text(`NET SALARY: ₹${salary.netSalary}`, 20, 145);

    doc.save(`Payslip_${emp.empId}.pdf`);

  } catch (err) {
    console.error("Payslip error:", err);
    alert("Payslip generation failed");
  }
};
