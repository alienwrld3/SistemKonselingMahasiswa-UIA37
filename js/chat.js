checkLogin();

/*
==========================
KONEKSI SOCKET
==========================
*/
const socket = io('https://be-mobile-service-203664327381.asia-southeast2.run.app'); 

/*
==========================
AMBIL DATA LOCAL STORAGE
==========================
*/
const bookingId = localStorage.getItem("active_booking_id");
const psikologId = localStorage.getItem("user_id");
const studentName = localStorage.getItem("active_student_name");

// Keamanan: Jika psikolog buka halaman chat tanpa pilih antrean
if (!bookingId) {
    alert("Silakan pilih mahasiswa dari antrean terlebih dahulu!");
    window.location.href = "booking.html";
}

/*
==========================
TAMPILKAN NAMA MAHASISWA
==========================
*/
const activeStudentEl = document.getElementById("activeStudent");

// Perbaikan: Cek apakah nama ada, jika tidak, kasih teks fallback
if (activeStudentEl) {
    if (studentName) {
        activeStudentEl.innerHTML = `<i class="fa-solid fa-user"></i> &nbsp; ${studentName}`;
        activeStudentEl.style.background = "linear-gradient(135deg, #2563eb, #4f46e5)"; // Warna asli
    } else {
        activeStudentEl.innerText = "Data Mahasiswa Tidak Ditemukan";
        activeStudentEl.style.background = "#e2e8f0"; // Warna abu-abu kalau error
        activeStudentEl.style.color = "#475569";
    }
}

/*
==========================
ELEMENT HTML
==========================
*/
const messages = document.getElementById("messages");
const input = document.getElementById("messageInput");

/*
==========================
AUTO SCROLL
==========================
*/
function scrollBottom() {
    messages.scrollTop = messages.scrollHeight;
}

/*
==========================
LOGIKA SOCKET.IO 
==========================
*/
socket.on('connect', () => {
    console.log('Psikolog terhubung ke Server Chat!');
    socket.emit('join_room', bookingId);
});

socket.on('receive_message', (data) => {
    if (data.sender_role === 'mahasiswa') {
        messages.innerHTML += `
        <div class="message message-user">
            ${data.text}
        </div>
        `;
        scrollBottom();
    }
});

// Listener apabila ada perintah untuk menutup sesi
socket.on('session_ended', () => {
    alert("Sesi konseling ini telah berakhir.");
    kunciRoomChat();
});

/*
==========================
SEND MESSAGE 
==========================
*/
function sendMessage() {
    const message = input.value.trim();
    if (message === "") return;

    messages.innerHTML += `
    <div class="message message-admin">
        ${message}
    </div>
    `;

    socket.emit('send_message', {
        booking_id: bookingId,
        sender_id: psikologId,
        sender_role: 'psikolog',
        text: message
    });

    input.value = "";
    scrollBottom();
}

async function loadChatHistory() {
    try {
        const response = await fetch(`https://be-mobile-service-203664327381.asia-southeast2.run.app/api/chat/${bookingId}`);
        const history = await response.json();

        messages.innerHTML = ""; // Kosongkan layar dulu

        history.forEach((msg) => {
            const isMe = msg.sender_role === 'psikolog';
            messages.innerHTML += `
            <div class="message ${isMe ? 'message-admin' : 'message-user'}">
                ${msg.message_text}
            </div>
            `;
        });
        scrollBottom();
    } catch (err) {
        console.error("Gagal load history:", err);
    }

}


/*
==========================
MENGAKHIRI & MENGUNCI SESI
==========================
*/
// Fungsi baru untuk mengunci UI room chat secara keseluruhan
function kunciRoomChat() {
    // 1. Matikan input pesan dan tombol kirim
    if (input) input.disabled = true;
    const sendBtn = document.querySelector('.chat-input button');
    if (sendBtn) sendBtn.disabled = true;

    // 2. Hapus id booking dari local storage supaya tidak bisa masuk lagi kalau ganti halaman
    localStorage.removeItem("active_booking_id");
    localStorage.removeItem("active_student_name");
    
    // 3. Tinggalkan room socket
    socket.emit('leave_room', bookingId);
}

async function akhiriSesi() {
    if (!confirm("Apakah Anda yakin ingin mengakhiri sesi ini?")) return;

    try {
        const response = await fetch(`https://be-mobile-service-203664327381.asia-southeast2.run.app/api/booking/${bookingId}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status_konseling: "selesai" })
            }
        );

        if (response.ok) {
            // Emit socket untuk mengabari mahasiswa bahwa chat ditutup
            socket.emit('end_session', bookingId);

            // Kunci UI dan hapus session 
            kunciRoomChat();

            alert("Sesi telah selesai dan room chat berhasil ditutup.");
            window.location.href = "booking.html";
        } else {
            alert("Gagal mengakhiri sesi.");
        }
    } catch (err) {
        console.error(err);
    }
}

input.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        sendMessage();
    }
});

loadChatHistory();