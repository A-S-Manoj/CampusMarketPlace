const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

const reqs = {
    length: document.getElementById("req-length"),
    lower: document.getElementById("req-lower"),
    upper: document.getElementById("req-upper"),
    digit: document.getElementById("req-digit"),
    special: document.getElementById("req-special")
};

function updateReq(el, isValid) {
    if (isValid) {
        el.classList.add("valid");
        el.querySelector("i").innerText = "✔";
    } else {
        el.classList.remove("valid");
        el.querySelector("i").innerText = "✖";
    }
}

passwordInput.addEventListener("input", function () {
    const val = passwordInput.value;
    updateReq(reqs.length, val.length >= 8);
    updateReq(reqs.lower, /[a-z]/.test(val));
    updateReq(reqs.upper, /[A-Z]/.test(val));
    updateReq(reqs.digit, /[0-9]/.test(val));
    updateReq(reqs.special, /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val));
    
    // Check if confirm password still matches
    if (confirmPasswordInput.value) {
        if (confirmPasswordInput.value === val) {
            confirmPasswordInput.style.borderBottom = "2px solid #4df3a9";
        } else {
            confirmPasswordInput.style.borderBottom = "2px solid #ff4b4b";
        }
    }
});

confirmPasswordInput.addEventListener("input", function () {
    if (confirmPasswordInput.value === passwordInput.value) {
        confirmPasswordInput.style.borderBottom = "2px solid #4df3a9";
    } else {
        confirmPasswordInput.style.borderBottom = "2px solid #ff4b4b";
    }
});

const emailInput = document.getElementById("email");
emailInput.addEventListener("input", function () {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(emailInput.value)) {
        emailInput.style.borderBottom = "2px solid #4df3a9";
    } else {
        emailInput.style.borderBottom = "2px solid #ff4b4b";
    }
});

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