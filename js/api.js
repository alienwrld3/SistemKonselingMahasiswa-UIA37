const BASE_URL = "https://be-mobile-service-203664327381.asia-southeast2.run.app/api";

async function request(endpoint, method = "GET", data = null){

    const token = localStorage.getItem("token");

    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    };

    if(data){
        options.body = JSON.stringify(data);
    }

    const response = await fetch(BASE_URL + endpoint, options);
    return response.json();
}                                                                                                                                                                                                                                                                                                                   