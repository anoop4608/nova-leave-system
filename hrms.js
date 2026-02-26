// ======================================
// NOVA HRMS — SALARY ENGINE
// ======================================

// Calculate salary with OT

function calculateSalary(emp) {
  const basic = emp.basicSalary || 0;
  const otHours = emp.otHours || 0;

  let otAmount = 0;

  // 🔹 METHOD 1 — Salary Based OT
  if (emp.otType === "SALARY_BASED") {
    const hourly = basic / 26 / 8;
    otAmount = hourly * otHours;
  }

  // 🔹 METHOD 2 — RR Fixed
  if (emp.otType === "RR_FIXED") {
    otAmount = (emp.otRate || 0) * otHours;
  }

  const gross = basic + otAmount;

  return {
    basic,
    otAmount,
    gross
  };
}

// ======================================
// GENERATE PAYSLIP
// ======================================

function generatePayslip(emp) {
  const salary = calculateSalary(emp);

  return `
    Employee: ${emp.name}
    Basic: ₹${salary.basic}
    OT: ₹${salary.otAmount}
    Gross: ₹${salary.gross}
  `;
}
