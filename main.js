const BOBOT_NILAI = {
  'A': 4.0, 'AB': 3.5, 'B': 3.0, 'BC': 2.5, 'C': 2.0, 'D': 1.0, 'E': 0.0
};

// Jalankan otomatis saat halaman dibuka
document.addEventListener('DOMContentLoaded', () => {
  cekSesiUser();
});

// 1. FUNGSI CEK SESI LOGIN / LOGOUT
function cekSesiUser() {
  const user = localStorage.getItem('currentUser');
  const loginScreen = document.getElementById('login-screen');
  const appScreen = document.getElementById('app-screen');
  const userGreeting = document.getElementById('user-greeting');

  if (user) {
    // Jika sudah login, sembunyikan layar login & tampilkan aplikasi utama
    loginScreen.classList.add('hidden');
    appScreen.classList.remove('hidden');
    userGreeting.innerText = `Halo, ${user}!`;

    // Jika tabel masih kosong, beri 1 baris input awal
    const tbody = document.getElementById('matkul-list');
    if (tbody.children.length === 0) {
      tambahBaris();
    }
  } else {
    // Jika belum login, tampilkan layar login & sembunyikan aplikasi
    loginScreen.classList.remove('hidden');
    appScreen.classList.add('hidden');
  }
}

function prosesLogin(event) {
  event.preventDefault();
  const inputNama = document.getElementById('username').value.trim();
  
  if (inputNama !== '') {
    localStorage.setItem('currentUser', inputNama);
    cekSesiUser(); // Perbarui tampilan tanpa muat ulang file
  }
}

function prosesLogout() {
  localStorage.removeItem('currentUser');
  document.getElementById('username').value = '';
  cekSesiUser(); // Kembalikan ke tampilan login
}

// 2. FUNGSI KALKULATOR IPK
function tambahBaris() {
  const tbody = document.getElementById('matkul-list');
  const tr = document.createElement('tr');

  tr.innerHTML = `
    <td><input type="text" placeholder="Nama Matkul..." class="nama-matkul"></td>
    <td><input type="number" min="1" max="6" value="3" class="sks-matkul"></td>
    <td>
      <select class="nilai-matkul">
        <option value="A">A (4.0)</option>
        <option value="AB">AB (3.5)</option>
        <option value="B">B (3.0)</option>
        <option value="BC">BC (2.5)</option>
        <option value="C">C (2.0)</option>
        <option value="D">D (1.0)</option>
        <option value="E">E (0.0)</option>
      </select>
    </td>
    <td><button type="button" onclick="hapusBaris(this)" class="btn-danger">Hapus</button></td>
  `;

  tbody.appendChild(tr);
}

function hapusBaris(btn) {
  const row = btn.closest('tr');
  row.remove();
}

function hitungIPK() {
  const sksInputs = document.querySelectorAll('.sks-matkul');
  const nilaiInputs = document.querySelectorAll('.nilai-matkul');

  let totalSKS = 0;
  let totalBobot = 0;

  for (let i = 0; i < sksInputs.length; i++) {
    const sks = parseFloat(sksInputs[i].value) || 0;
    const nilaiHuruf = nilaiInputs[i].value;
    const bobot = BOBOT_NILAI[nilaiHuruf] || 0;

    totalSKS += sks;
    totalBobot += (sks * bobot);
  }

  const ipk = totalSKS > 0 ? (totalBobot / totalSKS).toFixed(2) : '0.00';

  document.getElementById('total-sks').innerText = totalSKS;
  document.getElementById('ipk-val').innerText = ipk;
}

function resetData() {
  document.getElementById('matkul-list').innerHTML = '';
  document.getElementById('total-sks').innerText = '0';
  document.getElementById('ipk-val').innerText = '0.00';
  tambahBaris();
}
