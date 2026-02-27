// ======================================
// NOVA HR — ADMIN ENGINE
// ======================================

const db = firebase.firestore();

// ================= LOGOUT =================
function logout(){
firebase.auth().signOut().then(()=>{
window.location.href = "login.html";
});
}

// ================= LOAD DASHBOARD =================
window.addEventListener("DOMContentLoaded", ()=>{
loadLeaves();
loadEmployees();
loadPayroll();
});

// ================= LOAD LEAVES =================
function loadLeaves(){
const table = document.getElementById("leaveTable");
if(!table) return;

db.collection("leaves").orderBy("created","desc").onSnapshot(snap=>{
table.innerHTML="";

```
let p=0,a=0,r=0;

snap.forEach(doc=>{
  const d=doc.data();

  if(d.status==="Pending") p++;
  if(d.status==="Approved") a++;
  if(d.status==="Rejected") r++;

  table.innerHTML += `
    <tr>
      <td>${d.empId || ""}</td>
      <td>${d.fromDate || ""}</td>
      <td>${d.toDate || ""}</td>
      <td>${d.days || 0}</td>
      <td class="status-${(d.status||"pending").toLowerCase()}">${d.status}</td>
      <td>
        <button class="action-btn btn-approve" onclick="approveLeave('${doc.id}')">Approve</button>
        <button class="action-btn btn-reject" onclick="rejectLeave('${doc.id}')">Reject</button>
      </td>
    </tr>
  `;
});

document.getElementById("pendingCount").innerText=p;
document.getElementById("approvedCount").innerText=a;
document.getElementById("rejectedCount").innerText=r;
```

});
}

// ================= LOAD EMPLOYEES =================
function loadEmployees(){
const table=document.getElementById("employeeTable");
if(!table) return;

db.collection("employees").onSnapshot(snap=>{
table.innerHTML="";
document.getElementById("employeeCount").innerText=snap.size;

```
snap.forEach(doc=>{
  const d=doc.data();

  table.innerHTML += `
    <tr>
      <td>${d.empId||""}</td>
      <td>${d.name||""}</td>
      <td>${d.department||""}</td>
      <td>${d.leaveUsed||0}</td>
      <td>${d.leaveBalance||0}</td>
    </tr>
  `;
});
```

});
}

// ================= LOAD PAYROLL =================
function loadPayroll(){
const table=document.getElementById("salaryTable");
if(!table) return;

db.collection("employees").onSnapshot(snap=>{
table.innerHTML="";

```
snap.forEach(doc=>{
  const e=doc.data();

  table.innerHTML += `
    <tr>
      <td>${e.empId}</td>
      <td>${e.name}</td>
      <td>${e.basicSalary||0}</td>
      <td>--</td>
      <td>--</td>
      <td>
        <button class="action-btn btn-pdf" onclick="generatePayslip('${doc.id}')">
          PDF
        </button>
      </td>
    </tr>
  `;
});
```

});
}

// ================= APPROVE =================
function approveLeave(id){
db.collection("leaves").doc(id).update({status:"Approved"});
}

// ================= REJECT =================
function rejectLeave(id){
db.collection("leaves").doc(id).update({status:"Rejected"});
}

// ================= PAYSLIP =================
function generatePayslip(empDocId){
alert("Payslip engine connected. Next step will auto-calc salary.");
}
