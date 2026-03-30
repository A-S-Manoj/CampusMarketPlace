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
        const response = await fetch(`/api/products/${productId}`);
        
        if (!response.ok) {
            throw new Error("Failed to fetch product details");
        }

        const result = await response.json();
        const product = result.data || result;
        
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
    const imageSection = document.querySelector(".product-image-section");
    if (product.image_url) {
        imageSection.innerHTML = `<img id="pdImage" src="${product.image_url}" alt="${product.title}">`;
    } else {
        imageSection.innerHTML = `<div class="no-image-placeholder h-full">
                 <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                   <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                   <circle cx="8.5" cy="8.5" r="1.5"/>
                   <polyline points="21 15 16 10 5 21"/>
                 </svg>
                 <span>No Image Available</span>
               </div>`;
    }

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
