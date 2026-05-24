checkLogin();

const API_URL = "https://be-mobile-service-203664327381.asia-southeast2.run.app/api/psikolog/profile";
const userId = localStorage.getItem("user_id");
const username = localStorage.getItem("username");

if (document.getElementById("doctorName")) {
    document.getElementById("doctorName").innerHTML = username || "Psikolog";
}

// ==============================
// LOAD PROFILE
// ==============================
async function loadProfile() {
    try {
        const response = await fetch(`${API_URL}/${userId}`);
        
        // JIKA BACKEND MENGIRIM STATUS 404 (Profil Belum Ada)
        if (!response.ok) {
            console.warn("Profil belum ada di database, buka mode input.");
            enableEditMode();
            document.getElementById("editIconBtn").style.display = "none";
            document.getElementById("cancelBtn").style.display = "none";
            return; // Hentikan fungsi di sini
        }

        const data = await response.json();
        console.log("📥 DATA DARI BACKEND:", data);

        // KUNCI UTAMA: Kita ambil dari 'data.profile' sesuai dengan respon backend-mu
        const profile = data.profile; 

        // JIKA DATA PROFIL DITEMUKAN
        if (profile && profile.nama_lengkap) {
            
            // 1. Isi form input (buat jaga-jaga kalau nanti mau diedit)
            document.getElementById("nama").value = profile.nama_lengkap || "";
            document.getElementById("spesialisasi").value = profile.spesialisasi || "";
            document.getElementById("bio").value = profile.bio || "";

            // 2. Tampilkan teks statis (Mode View)
            document.getElementById("viewNama").innerText = profile.nama_lengkap;
            document.getElementById("viewSpesialisasi").innerText = profile.spesialisasi;
            document.getElementById("viewBio").innerText = profile.bio || "-";

            // 3. Update Profil Sidebar
            if (document.getElementById("doctorName")) {
                document.getElementById("doctorName").innerHTML = profile.nama_lengkap;
            }
            if (document.getElementById("doctorSpecialist")) {
                document.getElementById("doctorSpecialist").innerHTML = profile.spesialisasi;
            }

            // 4. KUNCI KE TAMPILAN TEKS & MUNCULKAN TOMBOL EDIT
            disableEditMode();

        } else {
            // Jaga-jaga jika isinya kosong
            enableEditMode();
            document.getElementById("editIconBtn").style.display = "none";
            document.getElementById("cancelBtn").style.display = "none";
        }

    } catch (error) {
        console.error("Gagal menarik data profil:", error);
    }
}

// ==============================
// LOGIKA MODE TAMPILAN
// ==============================
function enableEditMode() {
    document.getElementById("profileViewContainer").style.display = "none";
    document.getElementById("profileEditContainer").style.display = "block";
    document.getElementById("editIconBtn").style.display = "none";

    const currentNama = document.getElementById("viewNama").innerText;
    if (currentNama && currentNama !== "-") {
        document.getElementById("cancelBtn").style.display = "inline-block";
    }
}

function disableEditMode() {
    document.getElementById("profileViewContainer").style.display = "block";
    document.getElementById("profileEditContainer").style.display = "none";
    document.getElementById("editIconBtn").style.display = "block";
}

// ==============================
// SAVE PROFILE 
// ==============================
async function saveProfile() {
    const nama = document.getElementById("nama").value.trim();
    const spesialisasi = document.getElementById("spesialisasi").value.trim();
    const bio = document.getElementById("bio").value.trim();

    if (!nama || !spesialisasi || !bio) {
        alert("Semua field wajib diisi!");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: userId,
                nama_lengkap: nama,
                spesialisasi: spesialisasi,
                bio: bio
            })
        });

        if (response.ok) {
            alert("Profile berhasil disimpan!");
            loadProfile(); // Tarik ulang data dari DB & kunci otomatis ke Mode Teks
        } else {
            alert("Gagal menyimpan profile.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Gagal koneksi ke server.");
    }
}

loadProfile();