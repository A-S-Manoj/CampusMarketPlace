function isTokenExpired(token) {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return (Date.now() / 1000) > payload.exp;
    } catch (e) {
        return true;
    }
}
function getUserId() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id;
    } catch (e) {
        return null;
    }
}

function requireAuth() {
    const token = localStorage.getItem("token");
    if (!token || isTokenExpired(token)) {
        localStorage.removeItem("token");
        window.location.href = "login.html";
    }
}

function redirectIfAuthenticated() {
    const token = localStorage.getItem("token");
    if (token && !isTokenExpired(token)) {
        window.location.href = "dashboard.html";
    } else if (token) {
        localStorage.removeItem("token");
    }
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}