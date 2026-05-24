function checkLogin(){

    const token =
    localStorage.getItem(
        "token"
    );

    if(!token){

        window.location.href =
        "login.html";

    }

}

function logout(){

    const confirmLogout =
    confirm(
        "Yakin ingin logout?"
    );

    if(!confirmLogout) return;

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "username"
    );

    localStorage.removeItem(
        "role"
    );

    window.location.href =
    "login.html";

}