document.addEventListener("DOMContentLoaded", () => {
    requireAuth();
    loadProfile();
    loadMyProducts();
});

let currentProfile = {};

async function loadProfile() {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/users/profile", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error("Failed to fetch profile");
        
        const profile = await res.json();
        currentProfile = profile;
        displayProfile(profile);
    } catch (err) {
        console.error(err);
    }
}

function displayProfile(profile) {
    document.getElementById("profileName").innerText = profile.name || "N/A";
    document.getElementById("profileUsername").innerText = profile.username || "N/A";
    document.getElementById("profileEmail").innerText = profile.email || "N/A";
    document.getElementById("profileMobile").innerText = profile.mobile_number || "Not provided";
    document.getElementById("profileType").innerText = profile.student_type || "Not provided";
    document.getElementById("profileHostel").innerText = profile.hostel || "Not provided";
    document.getElementById("profileYear").innerText = profile.year_of_study || "Not provided";
    document.getElementById("profileCourse").innerText = profile.course || "Not provided";

    if (profile.profile_pic) {
        document.getElementById("profilePicImg").src = `http://localhost:5000${profile.profile_pic}`;
    }

    // Populate edit form fields
    document.getElementById("editMobile").value = profile.mobile_number || "";
    document.getElementById("editType").value = profile.student_type || "";
    document.getElementById("editHostel").value = profile.hostel || "";
    document.getElementById("editYear").value = profile.year_of_study || "";
    document.getElementById("editCourse").value = profile.course || "";
}

function toggleEditMode() {
    const readMode = document.getElementById("profileReadMode");
    const editForm = document.getElementById("profileEditForm");
    
    if (readMode.classList.contains("hide")) {
        readMode.classList.remove("hide");
        editForm.classList.add("hide");
    } else {
        readMode.classList.add("hide");
        editForm.classList.remove("hide");
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    const formData = new FormData();
    formData.append("mobile_number", document.getElementById("editMobile").value);
    formData.append("student_type", document.getElementById("editType").value);
    formData.append("hostel", document.getElementById("editHostel").value);
    formData.append("year_of_study", document.getElementById("editYear").value);
    formData.append("course", document.getElementById("editCourse").value);
    
    const fileInput = document.getElementById("editProfilePic");
    if (fileInput.files[0]) {
        formData.append("profile_pic", fileInput.files[0]);
    }

    try {
        const res = await fetch("http://localhost:5000/api/users/profile", {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });

        if (res.ok) {
            alert("Profile updated successfully!");
            toggleEditMode();
            loadProfile(); // Reload profile
        } else {
            alert("Failed to update profile.");
        }
    } catch (err) {
        console.error(err);
    }
}

async function loadMyProducts() {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/products/my-products", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to fetch products");

        const products = await response.json();
        displayMyProducts(products);
    } catch (error) {
        console.error("Error fetching my products:", error);
    }
}

function displayMyProducts(products) {
    const container = document.getElementById("myProductContainer");
    container.innerHTML = "";

    if (products.length === 0) {
        container.innerHTML = "<p>You haven't added any products yet.</p>";
        return;
    }

    let html = "";
    products.forEach(product => {
        const imageUrl = product.image_url ? `http://localhost:5000${product.image_url}` : "https://via.placeholder.com/300";
        const statusText = product.status === "available" ? "In Stock" : "Not Available";

        // Create product card but modify the bottom section for Edit / Delete instead of Contact
        const card = `
            <div class="card">
                <div class="tilt" onclick="openProduct(${product.id})" style="cursor:pointer">
                    <div class="img">
                        <img src="${imageUrl}" alt="${product.title}">
                    </div>
                </div>

                <div class="info">
                    <div class="cat">${product.category}</div>
                    <h2 class="title" style="cursor:pointer" onclick="openProduct(${product.id})">${product.title}</h2>
                    <p class="desc">${product.description}</p>
                    <div class="bottom">
                        <div class="price">
                            <span class="new">₹${product.price}</span>
                        </div>
                    </div>
                    <div class="my-product-actions">
                        <button class="btn btn-edit-profile" onclick="openEditProductModal(${product.id}, '${product.title.replace(/'/g, "\\'")}', '${product.description.replace(/'/g, "\\'")}', ${product.price}, '${product.category}', '${product.type}')">✏️ Edit</button>
                        <button class="btn btn-delete" onclick="handleDeleteProduct(${product.id})">🗑 Delete</button>
                    </div>
                </div>
            </div>
        `;
        html += card;
    });
    container.innerHTML = html;
}

function openProduct(id) {
    window.location.href = `product.html?id=${id}`;
}

async function handleDeleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/products/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
            loadMyProducts();
        } else {
            alert("Failed to delete product.");
        }
    } catch (err) {
        console.error(err);
    }
}

function openEditProductModal(id, title, desc, price, category, type) {
    document.getElementById("editProductId").value = id;
    document.getElementById("editPTitle").value = title;
    document.getElementById("editPDesc").value = desc;
    document.getElementById("editPPrice").value = price;
    document.getElementById("editPCat").value = category;
    document.getElementById("editPType").value = type;
    
    document.getElementById("editProductModal").classList.remove("hide");
}

function closeEditModal() {
    document.getElementById("editProductModal").classList.add("hide");
}

async function handleProductUpdate(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    const id = document.getElementById("editProductId").value;
    const formData = new FormData();
    formData.append("title", document.getElementById("editPTitle").value);
    formData.append("description", document.getElementById("editPDesc").value);
    formData.append("price", document.getElementById("editPPrice").value);
    formData.append("category", document.getElementById("editPCat").value);
    formData.append("type", document.getElementById("editPType").value);
    
    const fileInput = document.getElementById("editPImage");
    if (fileInput.files[0]) {
        formData.append("image", fileInput.files[0]);
    }

    try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });

        if (res.ok) {
            closeEditModal();
            loadMyProducts();
        } else {
            alert("Failed to update product.");
        }
    } catch (err) {
        console.error(err);
    }
}
