// ================= GLOBAL =================
let payrollLocked = false;

// ================= INIT =================
document.addEventListener("DOMContentLoaded", async () => {
  await loadLockStatus();
  initMonthYear();
  loadEmployees();
});

// ================= MONTH YEAR =================
function initMonthYear(){
  const m = document.getElementById("payMonth");
  const y = document.getElementById("payYear");

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  months.forEach((mo,i)=>{
    m.innerHTML += `<option value="${i+1}">${mo}</option>`;
  });

  const year = new Date().getFullYear();
  for(let i=year-2;i<=year+2;i++){
    y.innerHTML += `<option value="${i}">${i}</option>`;
  }

  m.value = new Date().getMonth()+1;
  y.value = year;
}

// ================= LOCK SYSTEM =================
async function lockPayroll(){
  await db.collection("settings").doc("payroll").set({locked:true});
  payrollLocked = true;
  alert("🔒 Payroll Locked");
  loadEmployees();
}

async function unlockPayroll(){
  await db.collection("settings").doc("payroll").set({locked:false});
  payrollLocked = false;
  alert("🔓 Payroll Unlocked");
  loadEmployees();
}

async function loadLockStatus(){
  try{
    const doc = await db.collection("settings").doc("payroll").get();
    payrollLocked = doc.exists ? doc.data().locked : false;
  }catch(e){
    payrollLocked = false;
  }
}

// ================= LOAD EMPLOYEES =================
async function loadEmployees(){
  const snap = await db.collection("employees").get();

  const attBody = document.getElementById("attendanceBody");
  const salBody = document.getElementById("salaryBody");

  attBody.innerHTML="";
  salBody.innerHTML="";

  snap.forEach(doc=>{
    const e = doc.data();
    const id = doc.id;

    const present = e.presentDays || 0;
    const sunday = e.sundayWorking || 0;
    const holiday = e.holidayWorking || 0;
    const ot = e.otHours || 0;
    const rr = e.rrHours || 0;

    // ===== Attendance Row =====
    attBody.innerHTML += `
      <tr>
        <td>${e.empId || "-"}</td>
        <td>${e.name || "-"}</td>
        <td><input id="p_${id}" value="${present}" ${payrollLocked?"disabled":""}></td>
        <td><input id="s_${id}" value="${sunday}" ${payrollLocked?"disabled":""}></td>
        <td><input id="h_${id}" value="${holiday}" ${payrollLocked?"disabled":""}></td>
        <td><input id="ot_${id}" value="${ot}" ${payrollLocked?"disabled":""}></td>
        <td><input id="rr_${id}" value="${rr}" ${payrollLocked?"disabled":""}></td>
        <td>
          <button onclick="saveAttendance('${id}')" ${payrollLocked?"disabled":""}>
            Save
          </button>
        </td>
      </tr>
    `;

    // ===== Salary Calculation =====
    const perDay = (e.basicSalary || 0) / 26;

    const salary =
      perDay * present +
      perDay * sunday +
      perDay * holiday +
      ot * (e.otRate || 0) +
      rr * (e.rrRate || 0);

    // ===== Salary Row =====
    salBody.innerHTML += `
      <tr>
        <td>${e.empId || "-"}</td>
        <td>${e.name || "-"}</td>
        <td>${e.department || "-"}</td>
        <td>₹${e.basicSalary || 0}</td>
        <td><b>₹${Math.round(salary)}</b></td>
        <td>
          <button onclick="generatePayslip('${id}')">
            Payslip
          </button>
        </td>
      </tr>
    `;
  });
}

// ================= SAVE ATTENDANCE =================
async function saveAttendance(id){
  if(payrollLocked){
    alert("Payroll Locked");
    return;
  }

  await db.collection("employees").doc(id).update({
    presentDays:Number(document.getElementById("p_"+id).value),
    sundayWorking:Number(document.getElementById("s_"+id).value),
    holidayWorking:Number(document.getElementById("h_"+id).value),
    otHours:Number(document.getElementById("ot_"+id).value),
    rrHours:Number(document.getElementById("rr_"+id).value)
  });

  alert("✅ Attendance Saved");
  loadEmployees();
}

// ================= PAYSLIP =================
async function generatePayslip(id){
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  const snap = await db.collection("employees").doc(id).get();
  const e = snap.data();

  const perDay = (e.basicSalary || 0) / 26;

  const salary =
    perDay * (e.presentDays||0) +
    perDay * (e.sundayWorking||0) +
    perDay * (e.holidayWorking||0) +
    (e.otHours||0) * (e.otRate||0) +
    (e.rrHours||0) * (e.rrRate||0);

  pdf.setFontSize(16);
  pdf.text("NOVA GRAPHICS LLP",20,20);

  pdf.setFontSize(12);
  pdf.text(`Employee: ${e.name}`,20,40);
  pdf.text(`Department: ${e.department}`,20,50);
  pdf.text(`Net Salary: ₹${Math.round(salary)}`,20,70);

  pdf.save(`Payslip_${e.empId}.pdf`);
}

// ================= EXPORT EXCEL =================
async function exportExcel(){
  const snap = await db.collection("employees").get();

  let data=[["EmpId","Name","Department","Basic","NetSalary"]];

  snap.forEach(doc=>{
    const e=doc.data();
    const perDay=(e.basicSalary||0)/26;

    const salary =
      perDay*(e.presentDays||0) +
      perDay*(e.sundayWorking||0) +
      perDay*(e.holidayWorking||0) +
      (e.otHours||0)*(e.otRate||0) +
      (e.rrHours||0)*(e.rrRate||0);

    data.push([
      e.empId,
      e.name,
      e.department,
      e.basicSalary,
      Math.round(salary)
    ]);
  });

  const ws=XLSX.utils.aoa_to_sheet(data);
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,"Salary Register");
  XLSX.writeFile(wb,"Nova_Salary_Register.xlsx");
}
