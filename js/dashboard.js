checkLogin();

/*
==========================
AMBIL USER LOGIN BROWSER
==========================
*/
const username = localStorage.getItem("username");
const userId = localStorage.getItem("user_id");

if (document.getElementById("doctorName")) {
    document.getElementById("doctorName").innerHTML = username || "Psikolog";
}

/*
==========================
LOAD DATA DASHBOARD
==========================
*/
async function loadDashboard() {
    try {
        // 1. FETCH PROFILE PSIKOLOG (Nama & Spesialisasi)
        try {
const profileResponse = await fetch(`https://be-mobile-service-203664327381.asia-southeast2.run.app/api/psikolog/profile/${userId}`);
            if (profileResponse.ok) {
                const profileData = await profileResponse.json();
                if (profileData) {
                    if (document.getElementById("doctorName")) {
                        document.getElementById("doctorName").innerHTML = profileData.nama_lengkap || username;
                    }
                    if (document.getElementById("doctorSpecialist")) {
                        document.getElementById("doctorSpecialist").innerHTML = profileData.spesialisasi || "Clinical Psychologist";
                    }
                    if (document.getElementById("welcomeTitle")) {
                        document.getElementById("welcomeTitle").innerHTML = `Selamat Datang, ${profileData.nama_lengkap || username} 👋`;
                    }
                    if (document.getElementById("welcomeSub")) {
                        document.getElementById("welcomeSub").innerHTML = `Spesialisasi Anda: ${profileData.spesialisasi || 'Umum'} | Kelola sesi mahasiswa secara profesional`;
                    }
                }
            }
        } catch (err) {
            console.log("Profile belum dibuat atau gagal dimuat, menggunakan data default.");
        }

        // 2. FETCH DATA STATISTIK ANTRIAN & RATING (LANGSUNG DARI DATA TABLE BOOKING_SESI)
const bookingResponse = await fetch(`https://be-mobile-service-203664327381.asia-southeast2.run.app/api/booking/psikolog/${userId}`);
        const bookings = await bookingResponse.json();

        if (bookings && Array.isArray(bookings)) {
            // Filter total sesi hari ini yang aktif (menunggu / berjalan)
            const sesiAktif = bookings.filter(b => b.status_konseling === 'menunggu' || b.status_konseling === 'berjalan').length;
            document.getElementById("totalBooking").innerHTML = sesiAktif;

            // Hitung total mahasiswa unik (tanpa duplikat)
            const totalMhs = [...new Set(bookings.map(b => b.mahasiswa_id))].length;
            document.getElementById("totalMahasiswa").innerHTML = totalMhs;

            // ==================================================================
            // KUNCI PERBAIKAN: Hitung rating rata-rata langsung dari table booking_sesi
            // ==================================================================
            let totalRating = 0;
            let ratingCount = 0;

            bookings.forEach(item => {
                // Cek jika field rating dari database ada nilainya dan di atas 0
                if (item.rating !== undefined && item.rating !== null && item.rating > 0) {
                    totalRating += parseFloat(item.rating);
                    ratingCount++;
                }
            });

            // Hitung rata-rata dan bulatkan ke 1 angka di belakang koma (misal: 4.5)
            const averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : "0.0";

            if (document.getElementById("ratingDashboard")) {
                document.getElementById("ratingDashboard").innerHTML = averageRating;
            }

            // Masukkan data ke tabel Aktivitas Sesi Terbaru
            const bookingTable = document.getElementById("bookingTable");
            if (bookingTable) {
                bookingTable.innerHTML = "";
                
                // Ambil maksimal 5 aktivitas terbaru
                bookings.slice(0, 5).forEach((item) => {
                    let badgeClass = "badge-warning";
                    if (item.status_konseling === "berjalan") badgeClass = "badge-info";
                    if (item.status_konseling === "selesai") badgeClass = "badge-success";
                    if (item.status_konseling === "dibatalkan") badgeClass = "badge-danger";

                    bookingTable.innerHTML += `
                    <tr>
                        <td>${item.username || "Anonim"}</td>
                        <td>${item.catatan_mahasiswa || "-"}</td>
                        <td>
                            <span class="badge ${badgeClass}">
                                ${item.status_konseling}
                            </span>
                        </td>
                        <td>
                            ${item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "-"}
                        </td>
                    </tr>
                    `;
                });
            }
        }

        // 3. FETCH DATA TOTAL LAPORAN YANG SUDAH DIBUAT
const laporanResponse = await fetch(`https://be-mobile-service-203664327381.asia-southeast2.run.app/api/laporan/psikolog/${userId}`);
        const laporanData = await laporanResponse.json();
        
        if (laporanData && Array.isArray(laporanData)) {
            document.getElementById("totalLaporan").innerHTML = laporanData.length;
        }

    } catch (error) {
        console.error("Gagal memuat data dashboard:", error);
    }
}

// Jalankan fungsi saat halaman dimuat
loadDashboard();