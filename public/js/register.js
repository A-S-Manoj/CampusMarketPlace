document.getElementById("registerForm").addEventListener("submit", async function (e) {

    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password.length < 8) {
        showToast("Password must be at least 8 characters", "error");
        return;
    }
    if (!/[a-z]/.test(password)) {
        showToast("Password must contain a lowercase letter", "error");
        return;
    }
    if (!/[A-Z]/.test(password)) {
        showToast("Password must contain an uppercase letter", "error");
        return;
    }
    if (!/[0-9]/.test(password)) {
        showToast("Password must contain a digit", "error");
        return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        showToast("Password must contain a special character", "error");
        return;
    }

    if (password !== confirmPassword) {
        showToast("Passwords do not match", "error");
        return;
    }

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