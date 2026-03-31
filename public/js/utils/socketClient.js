/* socketClient.js */
(function() {
    let socket = null;
    let activeConversationId = null;

    function initSocket() {
        const userId = typeof getUserId === 'function' ? getUserId() : null;
        if (!userId) return;

        // io() is expected to be available globally from /socket.io/socket.io.js
        if (typeof io !== 'undefined') {
            socket = io();
            
            socket.on('connect', () => {
                socket.emit('register', userId);
                console.log('Socket connected and registered for user:', userId);
            });

            socket.on('receive_message', (message) => {
                // If we are on the chat page and this is the active conversation, 
                // we don't show a toast (chat.js will handle the UI update).
                if (window.location.pathname.includes('chat.html') && 
                    activeConversationId === message.conversation_id) {
                    return;
                }

                // Show toast for new message
                if (typeof showToast === 'function') {
                    showToast(`New message from ${message.sender_name || 'someone'}: "${truncateContent(message.content)}"`, 'info');
                }
                
                // Play a subtle sound if desired (optional)
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
