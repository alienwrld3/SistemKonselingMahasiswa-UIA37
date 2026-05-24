checkLogin();

const API_URL = "https://be-mobile-service-203664327381.asia-southeast2.run.app/api/booking";
const username = localStorage.getItem("username");
const userId = localStorage.getItem("user_id");

document.getElementById("doctorName").innerHTML = username || "Psikolog";

// ======================================
// FUNGSI MENUJU CHAT
// ======================================
window.bukaChat = function(id, studentName) {
    localStorage.setItem("active_booking_id", id);
    localStorage.setItem("active_student_name", studentName);
    window.location.href = "chat.html";
};

// ======================================
// LOAD BOOKING
// ======================================
async function loadBooking(){
    try{
        const response = await fetch(`${API_URL}/psikolog/${userId}`);
        const data = await response.json();
        
        const table = document.getElementById("bookingTable");
        table.innerHTML = "";

        if(!data || data.length === 0){
            table.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center; padding:20px; color: var(--muted);">
                    Belum ada antrean masuk
                </td>
            </tr>`;
            return;
        }

        data.forEach((item)=>{
            let badgeClass = "badge-warning";
            if(item.status_konseling === "berjalan"){
                badgeClass = "badge-info";
            }
            if(item.status_konseling === "selesai"){
                badgeClass = "badge-success";
            }

            let aksiButton = "";
            if (item.status_konseling === "menunggu") {
                aksiButton = `
                    <div style="display: flex; gap: 8px; justify-content: flex-start; align-items: center;">
                        <button onclick="terimaBooking(${item.id}, '${item.username}')" class="btn-primary" style="padding: 8px 16px; font-size: 13px; border-radius: 8px;">
                            <i class="fa-solid fa-check"></i> Terima
                        </button>
                        <button onclick="tolakBooking(${item.id})" class="btn-primary" style="background-color: #ef4444; border: none; padding: 8px 16px; font-size: 13px; border-radius: 8px;">
                            <i class="fa-solid fa-xmark"></i> Tolak
                        </button>
                    </div>
                `;
            } else if (item.status_konseling === "berjalan") {
                aksiButton = `
                    <button onclick="bukaChat(${item.id}, '${item.username}')" class="btn-primary" style="background: var(--blue); border: none; padding: 8px 16px; font-size: 13px; border-radius: 8px; white-space: nowrap;">
                        <i class="fa-solid fa-comments"></i> Menuju Chat
                    </button>
                `;
            } else {
                aksiButton = `<span style="color: var(--muted); font-size: 14px;"><i class="fa-solid fa-check-circle"></i> Selesai</span>`;
            }

            // PERHATIKAN: Ada tambahan <td> baru untuk menampilkan ID
            table.innerHTML += `
            <tr>
                <td style="font-weight: bold; color: var(--muted);">#${item.id}</td>
                <td style="font-weight: 500;">${item.username || "Anonim"}</td>
                <td style="max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${item.catatan_mahasiswa || "-"}">
                    ${item.catatan_mahasiswa || "-"}
                </td>
                <td><span class="badge ${badgeClass}">${item.status_konseling}</span></td>
                <td style="white-space: nowrap;">${aksiButton}</td>
            </tr>`;
        });

    }catch(error){
        console.log(error);
    }
}

// ======================================
// TERIMA BOOKING & PINDAH KE CHAT
// ======================================
async function terimaBooking(id, studentName){
    try{
        const response = await fetch(`${API_URL}/${id}`, {
            method:"PUT",
            headers:{ "Content-Type": "application/json" },
            body: JSON.stringify({ status_konseling: "berjalan" })
        });
        const data = await response.json();
        
        if(response.ok){
            bukaChat(id, studentName); // Langsung pindah ke halaman chat
        }else{
            alert(data.error || data.message || "Gagal update booking");
        }
    }catch(error){
        console.log(error);
        alert("Gagal update status koneksi");
    }
}

// ======================================
// TOLAK BOOKING
// ======================================
async function tolakBooking(id){
    if(!confirm("Yakin ingin menolak sesi ini?")) return;
    try{
        const response = await fetch(`${API_URL}/${id}`, {
            method:"PUT",
            headers:{ "Content-Type": "application/json" },
            body: JSON.stringify({ status_konseling: "dibatalkan" })
        });
        const data = await response.json();
        
        if(response.ok){
            loadBooking(); // Refresh table setelah berhasil ditolak
        }else{
            alert(data.error || data.message || "Gagal menolak booking");
        }
    }catch(error){
        console.log(error);
        alert("Gagal koneksi ke server");
    }
}

loadBooking();