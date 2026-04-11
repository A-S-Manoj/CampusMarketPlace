/* notifications.js */
(function() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);

    window.showToast = function(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Add icon based on type
        let icon = '🔔';
        if (type === 'success') icon = '✅';
        if (type === 'error') icon = '❌';
        if (type === 'info') icon = 'ℹ️';

        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
        `;

        container.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 100);

        // Remove after duration
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500); // Wait for transition
        }, duration);
    };

    window.showConfirm = function(message, title = "Confirm Action") {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.id = 'dialog-overlay';
            
            overlay.innerHTML = `
                <div class="custom-dialog">
                    <div class="dialog-content">
                        <h2>${title}</h2>
                        <div class="dialog-message">${message}</div>
                        <div class="dialog-actions">
                            <button class="dialog-btn cancel" id="dialog-cancel">Cancel</button>
                            <button class="dialog-btn confirm" id="dialog-confirm">Confirm</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            // Trigger animation
            setTimeout(() => overlay.classList.add('show'), 10);

            const cleanup = (result) => {
                overlay.classList.remove('show');
                setTimeout(() => {
                    overlay.remove();
                    resolve(result);
                }, 300);
            };

            document.getElementById('dialog-confirm').onclick = () => cleanup(true);
            document.getElementById('dialog-cancel').onclick = () => cleanup(false);
            
            // Close on overlay click (cancel)
            overlay.onclick = (e) => {
                if (e.target === overlay) cleanup(false);
            };
        });
    };

    window.showAlert = function(message, title = "Notice") {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.id = 'dialog-overlay';
            
            overlay.innerHTML = `
                <div class="custom-dialog">
                    <div class="dialog-content">
                        <h2>${title}</h2>
                        <div class="dialog-message">${message}</div>
                        <div class="dialog-actions">
                            <button class="dialog-btn confirm" id="dialog-ok">OK</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            // Trigger animation
            setTimeout(() => overlay.classList.add('show'), 10);

            const cleanup = () => {
                overlay.classList.remove('show');
                setTimeout(() => {
                    overlay.remove();
                    resolve();
                }, 300);
            };

            document.getElementById('dialog-ok').onclick = cleanup;
            
            // Close on overlay click
            overlay.onclick = (e) => {
                if (e.target === overlay) cleanup();
            };
        });
    };
})();
