// Firebase config already in app.js
const db = firebase.firestore();

const TOTAL_LEAVE = 24; // annual leave

let allLeaves = [];

// AUTH GUARD
firebase.auth().onAuthStateChanged(user=>{
  if(!user){
    window.location.href = "login.html";
  }else{
    loadLeaves();
  }
});

// LOAD DATA
function loadLeaves(){
  db.collection("leaves")
    .orderBy("created","desc")
    .onSnapshot(snapshot=>{

      let html="";
      let pending=0, approved=0, rejected=0;
      let empMap={};

      snapshot.forEach(doc=>{
        const d = doc.data();
        const id = doc.id;

        allLeaves.push({...d,id});

        if(d.status==="Pending") pending++;
        if(d.status==="Approved") approved++;
        if(d.status==="Rejected") rejected++;

        if(!empMap[d.empId]) empMap[d.empId]=0;
        if(d.status==="Approved") empMap[d.empId]+=Number(d.days);

        const used = empMap[d.empId];
        const balance = TOTAL_LEAVE - used;

        html += `
        <tr>
          <td>${d.empId}</td>
          <td>${d.fromDate}</td>
          <td>${d.toDate}</td>
          <td>${d.days}</td>
          <td class="status-${d.status.toLowerCase()}">${d.status}</td>
          <td>${used}</td>
          <td>${balance}</td>
          <td>
            <button class="action-btn approve" onclick="updateStatus('${id}','Approved')">Approve</button>
            <button class="action-btn reject" onclick="updateStatus('${id}','Rejected')">Reject</button>
          </td>
        </tr>`;
      });

      leaveTable.innerHTML = html;
      pendingCount.innerText = pending;
      approvedCount.innerText = approved;
      rejectedCount.innerText = rejected;
      empCount.innerText = Object.keys(empMap).length;
    });
}

// UPDATE STATUS
function updateStatus(id,status){
  db.collection("leaves").doc(id).update({status});
}

// LOGOUT
function logout(){
  firebase.auth().signOut().then(()=>{
    window.location.href="login.html";
  });
}

// PDF
function downloadPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("Nova Graphics LLP - Leave Report",20,20);

  let y=30;
  allLeaves.forEach(l=>{
    doc.text(
      `${l.empId} | ${l.fromDate} | ${l.toDate} | ${l.status}`,
      20,y
    );
    y+=8;
  });

  doc.save("Nova_Leave_Report.pdf");
}

// SEARCH
document.getElementById("searchEmp").addEventListener("keyup",function(){
  const v=this.value.toLowerCase();
  const rows=document.querySelectorAll("#leaveTable tr");

  rows.forEach(r=>{
    r.style.display = r.innerText.toLowerCase().includes(v) ? "" : "none";
  });
});
