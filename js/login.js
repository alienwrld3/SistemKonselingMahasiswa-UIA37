async function login(){

    const username =
    document.getElementById(
        "username"
    ).value;

    const password =
    document.getElementById(
        "password"
    ).value;

    if(!username || !password){

        alert(
            "Semua field wajib diisi"
        );

        return;

    }

    try{

        const response =
        await fetch(
"https://be-mobile-service-203664327381.asia-southeast2.run.app/api/auth/login",
            {
                method:"POST",

                headers:{
                    "Content-Type":
                    "application/json"
                },

                body:JSON.stringify({
                    username,
                    password
                })
            }
        );

        const data =
        await response.json();

        console.log(data);

        if(response.ok){

            // =========================
            // SIMPAN DATA LOGIN
            // =========================

            localStorage.setItem(
                "token",
                data.token || ""
            );

            localStorage.setItem(
                "username",
                data.user.username
            );

            localStorage.setItem(
                "role",
                data.user.role
            );

            localStorage.setItem(
                "user_id",
                data.user.id
            );

            console.log(
                "USER ID:",
                data.user.id
            );

            // =========================
            // REDIRECT
            // =========================

            window.location.href =
            "dashboard-admin.html";

        }else{

            alert(
                data.message ||
                "Login gagal"
            );

        }

    }catch(error){

        console.log(error);

        alert(
            "Backend belum berjalan"
        );

    }

}