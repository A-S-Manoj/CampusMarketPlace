document.addEventListener("DOMContentLoaded", async () => {
    if (!requireAdmin()) return;
    
    // Initial data load
    loadStats();
    loadSupportMessages();
    loadUsers(); // Load all users initially
});

async function loadStats() {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/admin/stats", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) {
            document.getElementById("stat-total-users").textContent = result.data.totalUsers;
            document.getElementById("stat-total-products").textContent = result.data.totalProducts;
            document.getElementById("stat-pending-support").textContent = result.data.pendingSupport;
        }
    } catch (error) {
        console.error("Error loading stats:", error);
    }
}

async function searchUsers() {
    const username = document.getElementById("userSearchInput").value;
    loadUsers(username);
}

async function loadUsers(username = "") {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/admin/users/search?username=${username}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) {
            renderUsers(result.data);
        }
    } catch (error) {
        console.error("Error loading users:", error);
    }
}

function renderUsers(users) {
    const tbody = document.getElementById("usersTableBody");
    tbody.innerHTML = "";

    if (users.length === 0) {
        tbody.innerHTML = "<tr><td colspan='5' style='text-align: center; padding: 20px;'>No users found.</td></tr>";
        return;
    }

    users.forEach(user => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td style="text-transform: capitalize;">${user.role}</td>
            <td>${new Date(user.created_at).toLocaleDateString()}</td>
            <td>
                <button class="btn-delete-user" onclick="deleteUser(${user.id}, '${user.username}')">Delete User</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function deleteUser(userId, username) {
    if (!confirm(`Are you sure you want to delete user "${username}"? This will permanently remove all their listings and data.`)) {
        return;
    }

    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) {
            showToast(`User ${username} has been removed.`, "success");
            loadUsers(); 
            loadStats(); 
        } else {
            showToast(result.message || "Deletion failed", "error");
        }
    } catch (error) {
        console.error("Error deleting user:", error);
        showToast("An error occurred", "error");
    }
}

async function loadSupportMessages() {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/admin/support/messages", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) {
            renderTickets(result.data);
        }
    } catch (error) {
        console.error("Error loading support messages:", error);
    }
}

function renderTickets(tickets) {
    const container = document.getElementById("ticketsList");
    container.innerHTML = "";

    if (tickets.length === 0) {
        container.innerHTML = "<p style='text-align:center; padding: 20px; color: var(--text-muted);'>No support tickets found.</p>";
        return;
    }

    tickets.forEach(ticket => {
        const card = document.createElement("div");
        card.className = "ticket-card";
        
        const dateStr = new Date(ticket.created_at).toLocaleString();
        const statusClass = ticket.status === "resolved" ? "status-resolved" : "status-pending";
        
        card.innerHTML = `
            <div class="ticket-info">
                <div class="ticket-meta">
                    <strong>${ticket.username}</strong> (${ticket.email}) &bull; ${dateStr}
                    &bull; <span class="ticket-status ${statusClass}">${ticket.status}</span>
                </div>
                <div class="ticket-message">${ticket.message}</div>
            </div>
            <div class="ticket-actions">
                ${ticket.status === 'pending' 
                    ? `<button class="btn-resolve" onclick="updateTicketStatus(${ticket.id}, 'resolved')">Resolve Ticket</button>`
                    : `<button class="btn-reopen" onclick="updateTicketStatus(${ticket.id}, 'pending')">Reopen</button>`}
            </div>
        `;
        container.appendChild(card);
    });
}

async function updateTicketStatus(id, status) {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/admin/support/messages/${id}`, {
            method: "PUT",
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status })
        });
        const result = await response.json();
        if (result.success) {
            showToast(`Ticket ${status === 'resolved' ? 'resolved' : 'reopened'}`, "success");
            loadSupportMessages();
            loadStats();
        } else {
            showToast(result.message || "Status update failed", "error");
        }
    } catch (error) {
        console.error("Error updating ticket:", error);
    }
}
