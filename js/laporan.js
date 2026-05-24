// Samakan base URL dengan file booking.js dan chat.js kamu
const API_URL = "https://be-mobile-service-203664327381.asia-southeast2.run.app/api/laporan";
const userId = localStorage.getItem("user_id");
const username = localStorage.getItem("username");

// Tampilkan nama psikolog di sidebar secara dinamis
if (document.getElementById("doctorName")) {
    document.getElementById("doctorName").innerHTML = username || "Psikolog";
}

// Otomatis panggil riwayat data saat halaman selesai dimuat
document.addEventListener("DOMContentLoaded", () => {
    loadRiwayatLaporan();
});

// ======================================
// FUNGSI SIMPAN LAPORAN BARU
// ======================================
async function buatLaporan() {
    const booking_id = document.getElementById("booking_id").value;
    const ringkasan_sesi = document.getElementById("ringkasan_sesi").value;
    const status_tindak_lanjut = document.getElementById("status_tindak_lanjut").value;

    // Validasi input kosong
    if (!booking_id || !ringkasan_sesi || !status_tindak_lanjut) {
        alert("Harap isi semua kolom laporan!");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                booking_id: parseInt(booking_id),
                psikolog_id: parseInt(userId), // Diambil otomatis dari psikolog yang sedang login
                ringkasan_sesi: ringkasan_sesi,
                status_tindak_lanjut: status_tindak_lanjut
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Laporan berhasil disimpan ke database!");
            
            // Reset isi Form input setelah sukses agar bersih kembali
            document.getElementById("booking_id").value = "";
            document.getElementById("ringkasan_sesi").value = "";
            document.getElementById("status_tindak_lanjut").value = "selesai";
            
            // Refresh tabel riwayat di bawahnya agar data baru langsung muncul
            loadRiwayatLaporan();
        } else {
            alert(data.error || data.message || "Gagal menyimpan laporan");
        }
    } catch (error) {
        console.error("Error saat simpan laporan:", error);
        alert("Gagal terhubung ke server backend.");
    }
}

// ======================================
// FUNGSI AMBIL & TAMPILKAN RIWAYAT LAPORAN
// ======================================
async function loadRiwayatLaporan() {
    const table = document.getElementById("laporanTable");
    if (!table) return;

    try {
        // Ambil data laporan khusus psikolog yang sedang login
        const response = await fetch(`${API_URL}/psikolog/${userId}`);
        const data = await response.json();

        table.innerHTML = ""; // Kosongkan placeholder text

        if (!data || data.length === 0) {
            table.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding:20px; color: var(--muted);">
                    Belum ada riwayat laporan yang dibuat oleh Anda.
                </td>
            </tr>`;
            return;
        }

        // Urutkan atau langsung masukkan data ke baris tabel
        data.forEach((item) => {
            // Atur warna badge berdasarkan status tindak lanjutnya
            let badgeClass = "badge-success"; // Selesai
            if (item.status_tindak_lanjut === "rujuk_klinik") {
                badgeClass = "badge-warning";
            } else if (item.status_tindak_lanjut === "sesi_lanjutan") {
                badgeClass = "badge-info";
            }

            // Rapikan format tanggal database agar enak dibaca
            const tanggal = new Date(item.created_at).toLocaleDateString('id-ID', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });

            table.innerHTML += `
            <tr>
                <td style="font-weight: bold; color: var(--muted);">#${item.id}</td>
                <td style="font-weight: 500;">#${item.booking_id}</td>
                <td style="max-width: 320px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${item.ringkasan_sesi}">
                    ${item.ringkasan_sesi}
                </td>
                <td><span class="badge ${badgeClass}">${item.status_tindak_lanjut.replace('_', ' ')}</span></td>
                <td style="font-size: 13px; color: var(--muted);">${tanggal}</td>
            </tr>`;
        });

    } catch (error) {
        console.error("Error load riwayat:", error);
        table.innerHTML = `
        <tr>
            <td colspan="5" style="text-align:center; padding:20px; color: #ef4444;">
                Gagal memuat riwayat laporan dari database.
            </td>
        </tr>`;
    }
}