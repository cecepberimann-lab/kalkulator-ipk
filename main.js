let semesterCount = 0;

// Bobot Nilai Standar Perguruan Tinggi
const gradeValues = {
  "A": 4.00,
  "A-": 3.75,
  "B+": 3.25,
  "B": 3.00,
  "B-": 2.75,
  "C+": 2.25,
  "C": 2.00,
  "D": 1.00,
  "E": 0.00
};

// Fungsi Menambah Semester
function addSemester(savedData = null) {
  semesterCount++;
  const container = document.getElementById('semester-container');

  const semCard = document.createElement('div');
  semCard.className = 'semester-card';
  semCard.id = `semester-${semesterCount}`;

  semCard.innerHTML = `
    <div class="semester-header">
      <div class="semester-title">
        <i class="fa-solid fa-book-open text-primary"></i> Semester ${semesterCount}
      </div>
      <div style="display: flex; align-items: center; gap: 1rem;">
        <div class="semester-ips">IPS: <span id="ips-${semesterCount}">0.00</span></div>
        <button class="btn btn-danger" onclick="removeSemester(${semesterCount})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
    <div class="course-list" id="course-list-${semesterCount}">
      <!-- Daftar Matakuliah -->
    </div>
    <button class="btn btn-secondary" style="margin-top: 1rem; width: 100%; justify-content: center;" onclick="addCourse(${semesterCount})">
      <i class="fa-solid fa-plus"></i> Tambah Matakuliah
    </button>
  `;

  container.appendChild(semCard);

  if (savedData && savedData.courses) {
    savedData.courses.forEach(course => {
      addCourse(semesterCount, course.name, course.sks, course.grade);
    });
  } else {
    // Default 3 matkul jika baru
    addCourse(semesterCount);
    addCourse(semesterCount);
    addCourse(semesterCount);
  }

  calculateIPK();
}

// Fungsi Menghapus Semester
function removeSemester(semId) {
  const card = document.getElementById(`semester-${semId}`);
  if (card) {
    card.remove();
    calculateIPK();
    saveToLocalStorage();
  }
}

// Fungsi Menambah Matakuliah
function addCourse(semId, name = '', sks = 3, grade = '4.00') {
  const courseList = document.getElementById(`course-list-${semId}`);

  const row = document.createElement('div');
  row.className = 'course-row';

  let optionsHtml = '';
  for (const [gText, val] of Object.entries(gradeValues)) {
    const selected = (val.toFixed(2) === parseFloat(grade).toFixed(2)) ? 'selected' : '';
    optionsHtml += `<option value="${val}" ${selected}>${gText} (${val.toFixed(2)})</option>`;
  }

  row.innerHTML = `
    <input type="text" placeholder="Nama Mata Kuliah" class="course-name" value="${name}" oninput="saveToLocalStorage()" />
    <input type="number" placeholder="SKS" min="1" max="6" value="${sks}" class="course-sks" oninput="calculateIPK(); saveToLocalStorage();" />
    <select class="course-grade" onchange="calculateIPK(); saveToLocalStorage();">
      ${optionsHtml}
    </select>
    <button class="btn btn-danger" style="padding: 0.5rem;" onclick="removeCourse(this)">
      <i class="fa-solid fa-xmark"></i>
    </button>
  `;

  courseList.appendChild(row);
  calculateIPK();
}

// Fungsi Menghapus Baris Matakuliah
function removeCourse(button) {
  const row = button.parentElement;
  row.remove();
  calculateIPK();
  saveToLocalStorage();
}

// Fungsi Utama Menghitung IPS & IPK
function calculateIPK() {
  const semesters = document.querySelectorAll('.semester-card');
  
  let grandTotalMutu = 0;
  let grandTotalSks = 0;
  let grandTotalMatkul = 0;

  semesters.forEach(sem => {
    const semId = sem.id.split('-')[1];
    const rows = sem.querySelectorAll('.course-row');
    
    let semTotalMutu = 0;
    let semTotalSks = 0;

    rows.forEach(row => {
      const sksInput = row.querySelector('.course-sks');
      const gradeSelect = row.querySelector('.course-grade');

      const sks = parseFloat(sksInput.value) || 0;
      const gradeVal = parseFloat(gradeSelect.value) || 0;

      if (sks > 0) {
        semTotalMutu += sks * gradeVal;
        semTotalSks += sks;
        grandTotalMatkul++;
      }
    });

    const ips = semTotalSks > 0 ? (semTotalMutu / semTotalSks) : 0;
    const ipsElem = document.getElementById(`ips-${semId}`);
    if (ipsElem) ipsElem.innerText = ips.toFixed(2);

    grandTotalMutu += semTotalMutu;
    grandTotalSks += semTotalSks;
  });

  const finalIPK = grandTotalSks > 0 ? (grandTotalMutu / grandTotalSks) : 0;

  document.getElementById('total-ipk').innerText = finalIPK.toFixed(2);
  document.getElementById('total-sks').innerText = grandTotalSks;
  document.getElementById('total-matkul').innerText = grandTotalMatkul;

  updatePredikat(finalIPK, grandTotalSks);
}

// Menentukan Predikat Kelulusan
function updatePredikat(ipk, totalSks) {
  const badge = document.getElementById('predikat-badge');

  if (totalSks === 0) {
    badge.className = "badge badge-good";
    badge.innerText = "Belum Ada Data";
    return;
  }

  if (ipk >= 3.51) {
    badge.className = "badge badge-cumlaude";
    badge.innerText = "Dengan Pujian (Cum Laude)";
  } else if (ipk >= 3.00) {
    badge.className = "badge badge-good";
    badge.innerText = "Sangat Memuaskan";
  } else if (ipk >= 2.75) {
    badge.className = "badge badge-warning";
    badge.innerText = "Memuaskan";
  } else {
    badge.className = "badge badge-warning";
    badge.innerText = "Cukup";
  }
}

// Fitur localStorage
function saveToLocalStorage() {
  const semestersData = [];
  document.querySelectorAll('.semester-card').forEach(sem => {
    const courses = [];
    sem.querySelectorAll('.course-row').forEach(row => {
      courses.push({
        name: row.querySelector('.course-name').value,
        sks: row.querySelector('.course-sks').value,
        grade: row.querySelector('.course-grade').value
      });
    });
    semestersData.push({ courses });
  });
  localStorage.setItem('kalkulator_ipk_data', JSON.stringify(semestersData));
}

function loadFromLocalStorage() {
  const data = localStorage.getItem('kalkulator_ipk_data');
  if (data) {
    const semestersData = JSON.parse(data);
    if (semestersData.length > 0) {
      semesterCount = 0;
      document.getElementById('semester-container').innerHTML = '';
      semestersData.forEach(semData => {
        addSemester(semData);
      });
      return true;
    }
  }
  return false;
}

// Ekspor Ringkasan ke Clipboard
function exportSummary() {
  const ipk = document.getElementById('total-ipk').innerText;
  const sks = document.getElementById('total-sks').innerText;
  const matkul = document.getElementById('total-matkul').innerText;
  const badge = document.getElementById('predikat-badge').innerText;

  const text = `=== RINGKASAN AKADEMIK ===\nIPK Kumulatif: ${ipk}\nTotal SKS Lulus: ${sks}\nTotal Matakuliah: ${matkul}\nPredikat: ${badge}`;
  
  navigator.clipboard.writeText(text).then(() => {
    alert("Ringkasan IPK berhasil disalin ke clipboard!");
  }).catch(err => {
    alert("Gagal menyalin ringkasan.");
  });
}

// Reset Semua Data
function resetAll() {
  if (confirm("Apakah Anda yakin ingin menghapus seluruh data?")) {
    localStorage.removeItem('kalkulator_ipk_data');
    document.getElementById('semester-container').innerHTML = '';
    semesterCount = 0;
    addSemester();
  }
}

// Inisialisasi awal saat halaman dimuat
window.onload = () => {
  const loaded = loadFromLocalStorage();
  if (!loaded) {
    addSemester();
  }
};