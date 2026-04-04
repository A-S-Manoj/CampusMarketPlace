const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");
const conversationList = document.getElementById("conversationList");
const chatUserName = document.getElementById("chatUserName");
const chatSearchBtn = document.getElementById("chatSearchBtn");
const chatSearchContainer = document.getElementById("chatSearchContainer");
const chatSearchInput = document.getElementById("chatSearchInput");

chatSearchBtn.addEventListener("click", () => {
    chatSearchContainer.classList.toggle("active");
    if (chatSearchContainer.classList.contains("active")) {
        chatSearchInput.focus();
    } else {
        chatSearchInput.value = "";
        filterUsers("");
    }
});

chatSearchInput.addEventListener("input", (e) => {
    filterUsers(e.target.value.toLowerCase());
});

function filterUsers(query) {
    const items = conversationList.querySelectorAll(".chat-sb-item");
    items.forEach(item => {
        const nameNode = item.querySelector(".chat-sb-name");
        if (nameNode) {
            const name = nameNode.textContent.toLowerCase();
            if (name.includes(query)) {
                item.style.display = "flex";
            } else {
                item.style.display = "none";
            }
        }
    });
}

let socket;
let currentUser = null;
let currentConversationId = null;
let activeReceiverId = null;
const onlineUsers = new Set();

// Initialize chat application
async function initChat() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/login";
        return;
    }

    try {
        // Fetch current user info
        const res = await fetch("/protected", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) {
            localStorage.removeItem("token");
            window.location.href = "/login";
            return;
        }

        const data = await res.json();
        currentUser = data.user;

        // Use Global Socket
        socket = CampusSocket.getSocket();
        if (!socket) {
            // In case it's not ready yet, we can try to wait or re-init
            CampusSocket.init();
            socket = CampusSocket.getSocket();
        }

        setupSocketListeners();

        // Fetch conversations
        await loadConversations();

    } catch (err) {
        console.error("Error initializing chat:", err);
    }
}

function setupSocketListeners() {
    socket.on("receive_message", (message) => {
        // Only append if it belongs to the currently active conversation
        if (message.conversation_id === currentConversationId) {
            const type = message.sender_id === currentUser.id ? "me" : "them";
            addMessageToDOM(message.content, type, new Date(message.created_at));
        }
    });

    socket.on("user_status", (data) => {
        if (data.online) onlineUsers.add(String(data.userId));
        else onlineUsers.delete(String(data.userId));
        
        if (String(data.userId) === String(activeReceiverId)) {
            updateCurrentChatHeaderStatus();
        }
    });

    socket.on("online_users_list", (users) => {
        onlineUsers.clear();
        users.forEach(id => onlineUsers.add(String(id)));
        updateCurrentChatHeaderStatus();
    });

    socket.emit("request_online_status");
}

function updateCurrentChatHeaderStatus() {
    const statusDiv = document.getElementById("chatUserStatus");
    if (!statusDiv || !activeReceiverId) return;

    if (onlineUsers.has(String(activeReceiverId))) {
        statusDiv.style.opacity = "1";
    } else {
        statusDiv.style.opacity = "0";
    }
}

async function loadConversations() {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch("/api/chat/conversations", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to fetch conversations");

        const result = await res.json();
        const conversations = result.data || result;
        conversationList.innerHTML = "";

        if (conversations.length === 0) {
            conversationList.innerHTML = `
                <div class="chat-sb-empty">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <p>No conversations yet.<br>Contact a seller to start chatting.</p>
                </div>`;
            return;
        }

        conversations.forEach((conv, index) => {
            const item = document.createElement("div");
            item.className = `chat-sb-item ${index === 0 ? "active" : ""}`;

            // Format name with product info if available
            let displayName = conv.other_user_name;
            if (conv.product_name) {
                displayName += ` <span style='font-size: 11px; color:#aaa'>(${conv.product_name})</span>`;
            }

            const avatarSrc = conv.other_user_pic || "/assets/images/NoPfp.jpg";
            const avatarHtml = `<img src="${avatarSrc}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;

            item.innerHTML = `
                <div class="chat-sb-avatar">${avatarHtml}</div>
                <div class="chat-sb-info">
                    <span class="chat-sb-name">${displayName}</span>
                </div>
            `;

            item.addEventListener("click", () => {
                document.querySelectorAll(".chat-sb-item").forEach(el => el.classList.remove("active"));
                item.classList.add("active");
                loadMessages(conv.conversation_id, conv.other_user_id, conv.other_user_name, conv.other_user_pic);
            });

            conversationList.appendChild(item);

            // Load the first conversation by default
            if (index === 0) {
                loadMessages(conv.conversation_id, conv.other_user_id, conv.other_user_name, conv.other_user_pic);
            }
        });

    } catch (err) {
        console.error("Error loading conversations:", err);
    }
}

async function loadMessages(conversationId, receiverId, receiverName, receiverPic) {
    currentConversationId = conversationId;
    activeReceiverId = receiverId;
    chatUserName.textContent = receiverName;
    updateCurrentChatHeaderStatus();
    
    // Notify global socket client about active conversation to suppress toasts
    if (window.CampusSocket) {
        window.CampusSocket.setActiveConversation(conversationId);
    }

    // Show header and input form
    document.getElementById("chatMainHeader").style.display = "";
    document.getElementById("chatForm").style.display = "";

    // Hide the empty state
    const emptyState = document.getElementById("chatEmptyState");
    if (emptyState) emptyState.remove();

    // Update main header avatar
    const headerAvatar = document.querySelector(".chat-main-header .chat-sb-avatar.small");
    if (headerAvatar) {
        const picToUse = receiverPic || "/assets/images/NoPfp.jpg";
        headerAvatar.innerHTML = `<img src="${picToUse}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        headerAvatar.style.background = "transparent";
    }

    chatMessages.innerHTML = ""; // Clear current messages

    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to fetch messages");

        const result = await res.json();
        const messages = result.data || result;

        // Show welcome if no messages
        if (messages.length === 0) {
            chatMessages.innerHTML = `
                <div class="chat-empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <p>No messages yet. Say hi! 👋</p>
                </div>`;
            return;
        }

        messages.forEach(msg => {
            const type = msg.sender_id === currentUser.id ? "me" : "them";
            addMessageToDOM(msg.content, type, new Date(msg.created_at));
        });

    } catch (err) {
        console.error("Error loading messages:", err);
    }
}

chatForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const messageContent = chatInput.value.trim();
    if (!messageContent || !currentConversationId) return;

    // Emit via socket
    socket.emit("send_message", {
        conversationId: currentConversationId,
        senderId: currentUser.id,
        receiverId: activeReceiverId,
        content: messageContent
    });

    chatInput.value = "";
});

function addMessageToDOM(text, type, dateObj = new Date()) {
    // Remove empty state if it exists
    const emptyState = chatMessages.querySelector(".chat-empty-state");
    if (emptyState) emptyState.remove();

    const wrapper = document.createElement("div");
    wrapper.classList.add("chat-bubble-wrap", type);

    const bubble = document.createElement("div");
    bubble.classList.add("chat-bubble");

    const p = document.createElement("p");
    p.textContent = text;

    const time = document.createElement("span");
    time.classList.add("chat-time");

    time.textContent = dateObj.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    bubble.appendChild(p);
    bubble.appendChild(time);
    wrapper.appendChild(bubble);

    chatMessages.appendChild(wrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Check for deep link to start a new chat (e.g. from product page)
const urlParams = new URLSearchParams(window.location.search);
const newChatUserId = urlParams.get('userId');
const newChatProductId = urlParams.get('productId');

if (newChatUserId) {
    // Create or get conversation first, then init
    const token = localStorage.getItem("token");
    if (token) {
        fetch("/api/chat/conversations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ userId2: newChatUserId, productId: newChatProductId })
        }).then(() => {
            // Remove params from URL
            window.history.replaceState({}, document.title, window.location.pathname);
            initChat();
        }).catch(err => {
            console.error("Error creating chat:", err);
            initChat();
        });
    } else {
        window.location.href = "/login";
    }
} else {
    initChat();
}