document.getElementById("registerForm").addEventListener("submit", async function (e) {

    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, username, password })
    });

    const data = await response.json();
    if (response.ok) {
        showToast("Registration successful!", "success");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);
    } else {
        showToast(data.message || "Registration failed", "error");
    }

});