const sellBtn = document.getElementById("sellBtn");
const lendBtn = document.getElementById("lendBtn");
const flipCard = document.getElementById("flipCard");

const sellForm = document.getElementById("sellForm");
const lendForm = document.getElementById("lendForm");

let productType = "sell";

sellBtn.addEventListener("click", () => {
    productType = "sell";
    sellBtn.classList.add("active");
    lendBtn.classList.remove("active");
    flipCard.classList.remove("flip");
});

lendBtn.addEventListener("click", () => {
    productType = "lend";
    lendBtn.classList.add("active");
    sellBtn.classList.remove("active");
    flipCard.classList.add("flip");
});

const imageSell = document.getElementById("imageSell");
const previewSell = document.getElementById("previewSell");

imageSell.addEventListener("change", () => {
    const file = imageSell.files[0];
    if (file) {
        previewSell.src = URL.createObjectURL(file);
    }
});

const imageLend = document.getElementById("imageLend");
const previewLend = document.getElementById("previewLend");

imageLend.addEventListener("change", () => {
    const file = imageLend.files[0];
    if (file) {
        previewLend.src = URL.createObjectURL(file);
    }
});

async function submitProduct(e, type) {
    e.preventDefault();

    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please login to add a product.");
        window.location.href = "login.html";
        return;
    }

    const formData = new FormData();
    formData.append("type", type);

    if (type === "sell") {
        formData.append("title", document.getElementById("sellTitle").value);
        formData.append("price", document.getElementById("sellPrice").value);
        formData.append("category", document.getElementById("sellCategory").value);
        formData.append("description", document.getElementById("sellDescription").value);
        if (imageSell.files[0]) {
            formData.append("image", imageSell.files[0]);
        }
    } else {
        formData.append("title", document.getElementById("lendTitle").value);
        formData.append("price", document.getElementById("lendPrice").value);
        formData.append("category", document.getElementById("lendCategory").value);
        formData.append("description", document.getElementById("lendDescription").value);
        if (imageLend.files[0]) {
            formData.append("image", imageLend.files[0]);
        }
    }

    try {
        const response = await fetch("/api/products", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || "Failed to add product");
        }

        alert("Product added successfully!");
        window.location.href = "dashboard.html";
    } catch (error) {
        console.error("Error creating product:", error);
        alert("Error adding product. Please try again.");
    }
}

sellForm.addEventListener("submit", (e) => submitProduct(e, "sell"));
lendForm.addEventListener("submit", (e) => submitProduct(e, "lend"));
