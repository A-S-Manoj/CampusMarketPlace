document.addEventListener("DOMContentLoaded", () => {
    requireAuth(); // From utils/auth.js
    loadProductDetails();
});

async function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        showError("Invalid Product ID.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/products/${productId}`);
        
        if (!response.ok) {
            throw new Error("Failed to fetch product details");
        }

        const product = await response.json();
        
        if (!product) {
            showError("Product not found.");
            return;
        }

        renderProduct(product);

    } catch (err) {
        console.error(err);
        showError("Error loading product.");
    }
}

function renderProduct(product) {
    document.getElementById("loading").classList.add("hide");
    document.getElementById("error").classList.add("hide");
    document.getElementById("productDetail").classList.remove("hide");

    // Image
    const imageUrl = product.image_url ? `http://localhost:5000${product.image_url}` : "https://via.placeholder.com/600";
    document.getElementById("pdImage").src = imageUrl;

    // Info
    document.getElementById("pdCategory").innerText = product.category || "";
    document.getElementById("pdTitle").innerText = product.title || "Untitled";
    document.getElementById("pdPrice").innerText = "₹" + (product.price || "0");
    document.getElementById("pdType").innerText = product.type || "N/A";
    document.getElementById("pdDescription").innerText = product.description || "No description provided.";

    // Action
    const contactBtn = document.getElementById("contactBtn");
    
    // Hide contact button if the user is the seller
    const token = localStorage.getItem("token");
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.id === product.seller_id) {
                contactBtn.style.display = 'none'; // Users shouldn't chat with themselves
            }
        } catch (e) {
            console.error("Error parsing token", e);
        }
    }

    contactBtn.onclick = () => {
        window.location.href = `chat.html?userId=${product.seller_id}&productId=${product.id}`;
    };
}

function showError(msg) {
    document.getElementById("loading").classList.add("hide");
    const errorEl = document.getElementById("error");
    errorEl.innerText = msg;
    errorEl.classList.remove("hide");
}
