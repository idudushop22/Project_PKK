//hindari serangan xss//
function escapeHTML(str){
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


let chart;
//proteksi /admin.html//
// proteksi halaman admin
if(localStorage.getItem("adminLogin") !== "true"){
  window.location.href = "login.html";
}




// ambil data dari localStorage saat halaman dibuka
let data = JSON.parse(localStorage.getItem("pesanan")) || [];
let editIndex = -1;

render();

function simpanStorage(){
  localStorage.setItem("pesanan", JSON.stringify(data));
}

function tambah(){
  const tanggal = document.getElementById("tanggal").value;
  const nama = document.getElementById("nama").value;
  const menu = document.getElementById("menu").value;
  const jumlah = document.getElementById("jumlah").value;
  const harga = document.getElementById("harga").value;

  if(!tanggal || !nama || !jumlah || !harga){
    showPopup("Isi semua data!", "error");
    return;
  }

  data.push({tanggal,nama,menu,jumlah,harga});
  simpanStorage();
  render();

  document.getElementById("nama").value="";
  document.getElementById("jumlah").value="";
  document.getElementById("harga").value="";
}

function edit(i){
  editIndex = i;
  render();
}

function simpan(i){
  const row = document.querySelectorAll("tbody tr")[i];

  data[i] = {
    tanggal: row.querySelector(".tanggal").value,
    nama: row.querySelector(".nama").value,
    menu: row.querySelector(".menu").value,
    jumlah: row.querySelector(".jumlah").value,
    harga: row.querySelector(".harga").value
  };

  editIndex = -1;
  simpanStorage();
  render();
}

function hapus(i){
  data.splice(i,1);
  simpanStorage();
  render();
}

function render(){
  const tabel = document.getElementById("tabel");
  tabel.innerHTML="";

  data.forEach((d,i)=>{
    if(editIndex === i){
      tabel.innerHTML += `
      <tr>
        <td>${i+1}</td>
        <td><input class="tanggal" type="date" value="${d.tanggal}"></td>
        <td><input class="nama" value="${d.nama}"></td>
        <td>
          <select class="menu">
            <option ${d.menu==="Nasi Goreng Biasa"?"selected":""}>Nasi Goreng Biasa</option>
            <option ${d.menu==="Nasi Goreng Sosis"?"selected":""}>Nasi Goreng Sosis</option>
            <option ${d.menu==="Mie Goreng"?"selected":""}>Mie Goreng</option>
            <option ${d.menu==="Mie Goreng + Nasi"?"selected":""}>Mie Goreng + Nasi</option>
          </select>
        </td>
        <td><input class="jumlah" type="number" value="${d.jumlah}"></td>
        <td><input class="harga" type="number" value="${d.harga}"></td>
        <td>
          <button onclick="simpan(${i})">Simpan</button>
          <button onclick="hapus(${i})">Hapus</button>
        </td>
      </tr>
      `;
    } else {
      tabel.innerHTML += `
        <tr>
          <td>${escapeHTML(d.tanggal)}</td>
          <td>${escapeHTML(d.nama)}</td>
          <td>${escapeHTML(d.menu)}</td>
          <td>${escapeHTML(d.jumlah)}</td>
          <td>${escapeHTML(d.harga)}</td>
        <td>
            <button onclick="edit(${i})">Edit</button>
            <button onclick="hapus(${i})">Hapus</button>
            <button onclick="cetakStruk(${i})">Struk</button>
        </td>

      </tr>
      `;
    }
  });
    updateGrafik(); 
}

function logout(){
  localStorage.removeItem("adminLogin");
  window.location.href = "index.html";
}


//export data//
function exportData(){
  const blob = new Blob([JSON.stringify(data)], {type:"application/json"});
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "backup-pesanan.json";
  a.click();
}

function importData(){
  const file = document.getElementById("importFile").files[0];
  if(!file) return;

  const reader = new FileReader();

  reader.onload = function(e){
    data = JSON.parse(e.target.result);
    simpanStorage();
    render();
    alert("Data berhasil diimport!");
  };

  reader.readAsText(file);
}

//struk total//
function cetakStruk(index){
  const o = data[index]; // ambil langsung dari array aktif

  const struk = `
Pataw Food
${o.tanggal}

${o.menu} x${o.jumlah}   ${o.harga}
-------------------------
TOTAL: ${o.harga}

Terima kasih sudah belanja di Pataw Food 🙏
`;

  const w = window.open("", "", "width=300,height=400");
  w.document.write("<pre>"+struk+"</pre>");
  w.print();
}

// ==== AUTO LOGOUT 15 MENIT ====
let idleTimer;
const IDLE_LIMIT = 15 * 60 * 1000; // 15 menit

function resetTimer(){
  clearTimeout(idleTimer);
  idleTimer = setTimeout(autoLogout, IDLE_LIMIT);
}

function autoLogout(){
  alert("Session habis karena tidak ada aktivitas");
  localStorage.removeItem("adminLogin");
  window.location.href = "login.html";
}

// deteksi aktivitas user
document.onload = resetTimer;
document.onmousemove = resetTimer;
document.onkeydown = resetTimer;
document.onclick = resetTimer;
document.onscroll = resetTimer;

//Grafik Penjualan//


function updateGrafik(){
  const canvas = document.getElementById("chartPenjualan");
  if(!canvas) return;

  const rekap = {};

  data.forEach(o=>{
    const tgl = o.tanggal;
    if(!rekap[tgl]) rekap[tgl] = 0;
    rekap[tgl] += parseInt(o.harga);
  });

  const labels = Object.keys(rekap);
  const values = Object.values(rekap);

  if(chart) chart.destroy();

  chart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Omzet",
        data: values
      }]
    }
  });
}

//notif tampilan isi semua data//
function showNotif(text, type){
  const n = document.getElementById("notif");
  n.textContent = text;
  n.className = "notif " + type;
  n.style.display = "block";

  setTimeout(()=>{
    n.style.display = "none";
  }, 3000);
}

function showPopup(text){
  document.getElementById("popup-text").textContent = text;
  document.getElementById("popup").style.display = "flex";
}

function closePopup(){
  document.getElementById("popup").style.display = "none";
}

