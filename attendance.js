// ===============================
// NOVA HR ULTIMATE — ATTENDANCE
// ===============================

function markAttendance(){

  const empId = document.getElementById("attEmpId").value;

  if(!empId){
    alert("Enter Employee ID");
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  const time = new Date().toLocaleTimeString();

  db.collection("attendance").add({
    empId: empId,
    date: today,
    status: "Present",
    checkIn: time
  })
  .then(()=>{
    alert("Attendance marked ✅");
    loadTodayAttendance();
  });
}

// ===============================
// LOAD TODAY ATTENDANCE
// ===============================
function loadTodayAttendance(){

  const today = new Date().toISOString().split("T")[0];

  db.collection("attendance")
    .where("date","==",today)
    .get()
    .then(snapshot=>{

      let html="";

      snapshot.forEach(doc=>{
        const d = doc.data();

        html += `
        <tr>
          <td>${d.empId}</td>
          <td>${d.date}</td>
          <td>${d.status}</td>
          <td>${d.checkIn}</td>
        </tr>`;
      });

      document.getElementById("attendanceTable").innerHTML = html;
    });
}
