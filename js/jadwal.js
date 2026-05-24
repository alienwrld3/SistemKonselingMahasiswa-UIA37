checkLogin();

const API_URL =
"https://be-mobile-service-203664327381.asia-southeast2.run.app/api/jadwal";

const username =
localStorage.getItem("username");

document.getElementById(
    "doctorName"
).innerHTML =
username || "Psikolog";


// ======================================
// LOAD JADWAL
// ======================================

async function loadJadwal(){

    try{

        // ==============================
        // AMBIL USER ID LOGIN
        // ==============================

        const userId =
        localStorage.getItem("user_id");

        // ==============================
        // FETCH JADWAL PSIKOLOG
        // ==============================

        const response =
        await fetch(

            `${API_URL}/psikolog/${userId}`

        );

        const data =
        await response.json();

        console.log(
            "DATA JADWAL:",
            data
        );

        const table =
        document.getElementById(
            "jadwalTable"
        );

        table.innerHTML = "";

        // ==============================
        // KALAU BELUM ADA JADWAL
        // ==============================

        if(data.length === 0){

            table.innerHTML = `

            <tr>

                <td colspan="4"
                style="
                text-align:center;
                padding:20px;
                ">

                    Belum ada jadwal

                </td>

            </tr>

            `;

            return;

        }

        // ==============================
        // LOOP DATA
        // ==============================

        data.forEach((jadwal) => {

            table.innerHTML += `

            <tr>

                <td>
                    ${jadwal.tanggal}
                </td>

                <td>
                    ${jadwal.jam_mulai}
                    -
                    ${jadwal.jam_selesai}
                </td>

                <td>
                    ${jadwal.status || "tersedia"}
                </td>

                <td>

                    <button
                    onclick="hapusJadwal(${jadwal.id})"
                    class="btn-danger">

                        Hapus

                    </button>

                </td>

            </tr>

            `;

        });

    }catch(error){

        console.log(error);

        alert(
            "Gagal load jadwal"
        );

    }

}



// ======================================
// TAMBAH JADWAL
// ======================================

async function tambahJadwal(){

    const tanggal =
    document.getElementById(
        "tanggal"
    ).value;

    const jam_mulai =
    document.getElementById(
        "jam_mulai"
    ).value;

    const jam_selesai =
    document.getElementById(
        "jam_selesai"
    ).value;

    // ==============================
    // AMBIL USER ID LOGIN
    // ==============================

    const userId =
    localStorage.getItem(
        "user_id"
    );

    // ==============================
    // VALIDASI
    // ==============================

    if(
        !tanggal ||
        !jam_mulai ||
        !jam_selesai
    ){

        alert(
            "Semua field wajib diisi"
        );

        return;

    }

    try{

        const response =
        await fetch(API_URL, {

            method: "POST",

            headers: {

                "Content-Type":
                "application/json"

            },

            body: JSON.stringify({

                psikolog_id:
                userId,

                tanggal:
                tanggal,

                jam_mulai:
                jam_mulai,

                jam_selesai:
                jam_selesai

            })

        });

        const data =
        await response.json();

        console.log(
            "RESPONSE:",
            data
        );

        // ==============================
        // SUCCESS
        // ==============================

        if(response.ok){

            alert(
                "Jadwal berhasil ditambah"
            );

            // reload tabel
            loadJadwal();

            // reset form
            document.getElementById(
                "tanggal"
            ).value = "";

            document.getElementById(
                "jam_mulai"
            ).value = "";

            document.getElementById(
                "jam_selesai"
            ).value = "";

        }else{

            alert(

                data.message ||

                data.error ||

                "Gagal tambah jadwal"

            );

        }

    }catch(error){

        console.log(error);

        alert(
            "Backend error"
        );

    }

}



// ======================================
// HAPUS JADWAL
// ======================================

async function hapusJadwal(id){

    const yakin =
    confirm(
        "Hapus jadwal ini?"
    );

    if(!yakin){

        return;

    }

    try{

        const response =
        await fetch(

            `${API_URL}/${id}`,

            {
                method:"DELETE"
            }

        );

        const data =
        await response.json();

        console.log(data);

        if(response.ok){

            alert(
                "Jadwal berhasil dihapus"
            );

            loadJadwal();

        }else{

            alert(

                data.message ||

                "Gagal hapus jadwal"

            );

        }

    }catch(error){

        console.log(error);

        alert(
            "Backend error"
        );

    }

}



// ======================================
// AUTO LOAD
// ======================================

loadJadwal();