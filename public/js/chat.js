const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");
const conversationList = document.getElementById("conversationList");
const chatUserName = document.getElementById("chatUserName");

let socket;
let currentUser = null;
let currentConversationId = null;
let activeReceiverId = null;

// Initialize chat application
async function initChat() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        // Fetch current user info
        const res = await fetch("/protected", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) {
            localStorage.removeItem("token");
            window.location.href = "login.html";
            return;
        }

        const data = await res.json();
        currentUser = data.user;

        // Initialize Socket.io
        socket = io();
        socket.emit("register", currentUser.id);

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
}

async function loadConversations() {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch("/api/chat/conversations", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to fetch conversations");

        const conversations = await res.json();
        conversationList.innerHTML = "";

        if (conversations.length === 0) {
            conversationList.innerHTML = "<div style='padding: 20px; color: #888; text-align: center'>No conversations yet.</div>";
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

            const avatarHtml = conv.other_user_pic 
                ? `<img src="http://localhost:5000${conv.other_user_pic}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`
                : conv.other_user_name.charAt(0).toUpperCase();

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
    
    // Update main header avatar
    const headerAvatar = document.querySelector(".chat-main-header .chat-sb-avatar.small");
    if (headerAvatar) {
        if (receiverPic) {
            headerAvatar.innerHTML = `<img src="http://localhost:5000${receiverPic}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            headerAvatar.style.background = "transparent";
        } else {
            headerAvatar.innerHTML = receiverName.charAt(0).toUpperCase();
            headerAvatar.style.background = "#222";
        }
    }

    chatMessages.innerHTML = ""; // Clear current messages

    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to fetch messages");

        const messages = await res.json();

        // Show welcome if no messages
        if (messages.length === 0) {
            chatMessages.innerHTML = "<div style='text-align: center; color: #666; width: 100%; margin-top: 20px;'>No messages yet. Say hi!</div>";
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
    // Remove "No messages" text if it exists
    if (chatMessages.innerHTML.includes("No messages yet")) {
        chatMessages.innerHTML = "";
    }

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
        window.location.href = "login.html";
    }
} else {
    initChat();
}