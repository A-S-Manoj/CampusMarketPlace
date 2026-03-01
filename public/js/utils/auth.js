function requireAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
    }
}

function redirectIfAuthenticated() {
    const token = localStorage.getItem("token");
    if (token) {
        window.location.href = "dashboard.html";
    }
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}