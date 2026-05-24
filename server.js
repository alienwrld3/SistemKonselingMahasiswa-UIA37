require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io'); 
const connectMongoDB = require('./config/mongo'); 
const Chat = require('./models/Chat'); 

const app = express();
const server = http.createServer(app); 

// Inisialisasi Socket.io dengan konfigurasi CORS
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Jalankan koneksi ke MongoDB NoSQL
connectMongoDB();

// Pemetaan Route API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/jadwal', require('./routes/jadwalRoutes'));
app.use('/api/booking', require('./routes/bookingRoutes'));
app.use('/api/laporan', require('./routes/laporanRoutes'));
app.use('/api/psikolog', require('./routes/psikologRoutes'));

// LOGIKA SOCKET.IO & INTEGRASI MONGODB (CHAT)
io.on('connection', (socket) => {
    console.log('Ada pengguna baru terhubung ke Chat:', socket.id);

    socket.on('join_room', (bookingId) => {
        socket.join(bookingId);
        console.log(`User masuk ke Kamar Konseling ID: ${bookingId}`);
    });

    socket.on('send_message', async (data) => {
        try {
            const chatBaru = new Chat({
                booking_id: data.booking_id,
                sender_id: data.sender_id,
                sender_role: data.sender_role,
                message_text: data.text 
            });

            await chatBaru.save();

            socket.to(data.booking_id.toString()).emit('receive_message', {
                sender_role: data.sender_role,
                text: data.text 
            });

        } catch (error) {
            console.error("Gagal simpan ke MongoDB:", error);
        }
    });

    socket.on('disconnect', () => {
        console.log('Pengguna keluar dari chat');
    });
});

// Root route checking
app.get('/', (req, res) => {
    res.json({ message: "Server Sistem Konseling Mahasiswa Berjalan Lancar (Database 5 Tabel & MongoDB Active)!" });
});

app.get('/api/chat/:booking_id', async (req, res) => {
    try {
        const chats = await Chat.find({ booking_id: req.params.booking_id })
                                .sort({ timestamp: 1 }); 
        res.json(chats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Jalankan Server
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Pengaman Global
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Terjadi kesalahan database (Unhandled Rejection):', reason.message || reason);
});
