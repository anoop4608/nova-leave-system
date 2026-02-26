// =====================================
// NOVA HR — EMPLOYEE MASTER
// =====================================

const db = firebase.firestore();

// ===============================
// ➕ ADD EMPLOYEE
// ===============================
function addEmployee() {

  const empId = document.getElementById("empId").value.trim();
  const name = document.getElementById("empName").value.trim();
  const dept = document.getElementById("department").value.trim();
  const annualLeave = Number(document.getElementById("annualLeave").value);

  if (!empId || !name) {
    alert("Enter Employee ID and Name");
    return;
  }

  db.collection("employees")
    .doc(empId)
    .set({
      empId: empId,
      name: name,
      department: dept,
      joiningDate: new Date().toISOString().slice(0,10),
      annualLeave: annualLeave,
      usedLeave: 0,
      created: new Date()
    })
    .then(() => {
      alert("✅ Employee Added");
      document.getElementById("empId").value = "";
      document.getElementById("empName").value = "";
      document.getElementById("department").value = "";
    })
    .catch(err => {
      console.error(err);
      alert("Error adding employee");
    });
}

// ===============================
// 📊 LOAD EMPLOYEES
// ===============================
function loadEmployees() {

  db.collection("employees")
    .orderBy("created", "desc")
    .onSnapshot(snapshot => {

      const table = document.getElementById("employeeTable");
      table.innerHTML = "";

      snapshot.forEach(doc => {
        const d = doc.data();

        const balance = (d.annualLeave || 0) - (d.usedLeave || 0);

        const row = `
          <tr>
            <td>${d.empId}</td>
            <td>${d.name}</td>
            <td>${d.department || "-"}</td>
            <td>${d.annualLeave || 0}</td>
            <td>${d.usedLeave || 0}</td>
            <td><b>${balance}</b></td>
          </tr>
        `;

        table.innerHTML += row;
      });

    });
}

// ===============================
// 🚀 AUTO START
// ===============================
window.onload = () => {
  loadEmployees();
};
