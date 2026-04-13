/* socketClient.js */
(function() {
    let socket = null;
    let activeConversationId = null;

    function initSocket() {
        // Need to identify the current user to register
        const token = localStorage.getItem("token");
        if (!token) return;

        // Simple helper to get userId from JWT if needed, or if stored
        let userId = null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            userId = payload.id;
        } catch (e) {
            console.error("Error parsing token for socket registration");
            return;
        }

        if (typeof io !== 'undefined') {
            socket = io();
            
            socket.on('connect', () => {
                socket.emit('register', userId);
                console.log('Socket connected and registered for user:', userId);
            });

            socket.on('receive_message', (message) => {
                // If we are on the chat page and this is the active conversation, 
                // we don't show a toast/notification (chat.js handles UI).
                if (window.location.pathname.includes('chat') && 
                    activeConversationId == message.conversation_id) {
                    return;
                }

                if (typeof window.addLiveNotification === 'function') {
                    window.addLiveNotification({
                        message: `New message from User ${message.sender_id}: "${truncateContent(message.content)}"`,
                        type: 'message',
                        link: `/chat?id=${message.sender_id}`
                    });
                }
            });

            socket.on('trade_request_received', (tradeRequest) => {
                if (typeof window.addLiveNotification === 'function') {
                    window.addLiveNotification({
                        message: `Someone sent you a trade request for "${tradeRequest.product_title}"`,
                        type: 'trade',
                        link: `/profile`
                    });
                }
            });

            socket.on('trade_request_updated', (tradeRequest) => {
                if (typeof window.addLiveNotification === 'function') {
                    const statusMsg = tradeRequest.status === 'accepted' ? 'accepted' : 'rejected';
                    window.addLiveNotification({
                        message: `Your trade request for "${tradeRequest.product_title}" was ${statusMsg}`,
                        type: 'trade',
                        link: `/profile`
                    });
                }
            });

            socket.on('message_error', (data) => {
                if (typeof showToast === 'function') {
                    showToast(data.error || 'Message error', 'error');
                }
            });
        }
    }

    function truncateContent(content) {
        if (!content) return '';
        return content.length > 30 ? content.substring(0, 27) + '...' : content;
    }

    // Expose globally
    window.CampusSocket = {
        getSocket: () => socket,
        setActiveConversation: (id) => { activeConversationId = id; },
        init: initSocket
    };

    // Auto-init if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSocket);
    } else {
        initSocket();
    }
})();
