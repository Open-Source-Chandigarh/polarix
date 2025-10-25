/**
 * UI Utility Module
 * Handles loading states, error messages, and UI feedback
 */

/**
 * Show loading overlay with optional message
 * @param {string} message - Loading message to display
 */
function showLoading(message = 'Loading...') {
    let overlay = document.getElementById('loading-overlay');
    
    if (!overlay) {
        // Create loading overlay if it doesn't exist
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-spinner-container">
                <div class="loading-spinner"></div>
                <div class="loading-text" id="loading-text">${message}</div>
            </div>
        `;
        document.body.appendChild(overlay);
    } else {
        const loadingText = document.getElementById('loading-text');
        if (loadingText) {
            loadingText.textContent = message;
        }
    }
    
    overlay.classList.add('active');
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

/**
 * Update loading message
 * @param {string} message - New loading message
 */
function updateLoadingMessage(message) {
    const loadingText = document.getElementById('loading-text');
    if (loadingText) {
        loadingText.textContent = message;
    }
}

/**
 * Show button loading state
 * @param {HTMLElement} button - Button element
 * @param {string} loadingText - Optional loading text
 */
function showButtonLoading(button, loadingText = null) {
    if (!button) return;
    
    button.disabled = true;
    button.classList.add('loading');
    
    // Store original text
    if (!button.dataset.originalText) {
        button.dataset.originalText = button.textContent;
    }
    
    if (loadingText) {
        button.textContent = loadingText;
    }
}

/**
 * Hide button loading state
 * @param {HTMLElement} button - Button element
 */
function hideButtonLoading(button) {
    if (!button) return;
    
    button.disabled = false;
    button.classList.remove('loading');
    
    // Restore original text
    if (button.dataset.originalText) {
        button.textContent = button.dataset.originalText;
    }
}

/**
 * Show error message
 * @param {string} message - Error message to display
 * @param {HTMLElement} container - Optional container element
 * @param {number} duration - Auto-hide duration in ms (0 = no auto-hide)
 */
function showError(message, container = null, duration = 5000) {
    const errorDiv = createMessageElement('error', message);
    
    if (container) {
        container.insertBefore(errorDiv, container.firstChild);
    } else {
        // Show as alert if no container specified
        alert(`Error: ${message}`);
        return;
    }
    
    if (duration > 0) {
        setTimeout(() => {
            errorDiv.remove();
        }, duration);
    }
}

/**
 * Show success message
 * @param {string} message - Success message to display
 * @param {HTMLElement} container - Optional container element
 * @param {number} duration - Auto-hide duration in ms (0 = no auto-hide)
 */
function showSuccess(message, container = null, duration = 3000) {
    const successDiv = createMessageElement('success', message);
    
    if (container) {
        container.insertBefore(successDiv, container.firstChild);
    } else {
        // Show as alert if no container specified
        alert(message);
        return;
    }
    
    if (duration > 0) {
        setTimeout(() => {
            successDiv.remove();
        }, duration);
    }
}

/**
 * Show info message
 * @param {string} message - Info message to display
 * @param {HTMLElement} container - Optional container element
 * @param {number} duration - Auto-hide duration in ms (0 = no auto-hide)
 */
function showInfo(message, container = null, duration = 4000) {
    const infoDiv = createMessageElement('info', message);
    
    if (container) {
        container.insertBefore(infoDiv, container.firstChild);
    } else {
        // Show as alert if no container specified
        alert(message);
        return;
    }
    
    if (duration > 0) {
        setTimeout(() => {
            infoDiv.remove();
        }, duration);
    }
}

/**
 * Create message element
 * @param {string} type - Message type (error, success, info)
 * @param {string} message - Message text
 * @returns {HTMLElement} Message element
 */
function createMessageElement(type, message) {
    const div = document.createElement('div');
    div.className = `${type}-message fade-in`;
    div.textContent = message;
    
    // Add close button
    const closeBtn = document.createElement('span');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = 'cursor: pointer; margin-left: auto; font-size: 20px; font-weight: bold;';
    closeBtn.onclick = () => div.remove();
    div.appendChild(closeBtn);
    
    return div;
}

/**
 * Clear all messages from container
 * @param {HTMLElement} container - Container element
 */
function clearMessages(container) {
    if (!container) return;
    
    const messages = container.querySelectorAll('.error-message, .success-message, .info-message');
    messages.forEach(msg => msg.remove());
}

/**
 * Show form loading state
 * @param {HTMLElement} form - Form element
 */
function showFormLoading(form) {
    if (!form) return;
    
    form.classList.add('form-loading');
    
    // Disable all inputs
    const inputs = form.querySelectorAll('input, select, textarea, button');
    inputs.forEach(input => {
        input.disabled = true;
    });
}

/**
 * Hide form loading state
 * @param {HTMLElement} form - Form element
 */
function hideFormLoading(form) {
    if (!form) return;
    
    form.classList.remove('form-loading');
    
    // Re-enable all inputs
    const inputs = form.querySelectorAll('input, select, textarea, button');
    inputs.forEach(input => {
        input.disabled = false;
    });
}

/**
 * Show skeleton loader in container
 * @param {HTMLElement} container - Container element
 * @param {number} count - Number of skeleton items
 */
function showSkeletonLoader(container, count = 3) {
    if (!container) return;
    
    container.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-loader skeleton-card';
        container.appendChild(skeleton);
    }
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function to limit function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
function throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Confirm action with custom message
 * @param {string} message - Confirmation message
 * @returns {Promise<boolean>} True if confirmed
 */
async function confirmAction(message) {
    return new Promise((resolve) => {
        const confirmed = confirm(message);
        resolve(confirmed);
    });
}

/**
 * Format error for display
 * @param {Error|string} error - Error object or message
 * @returns {string} Formatted error message
 */
function formatError(error) {
    if (typeof error === 'string') {
        return error;
    }
    
    if (error instanceof Error) {
        return error.message || 'An unexpected error occurred';
    }
    
    if (error && error.message) {
        return error.message;
    }
    
    return 'An unexpected error occurred';
}

// Export all functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showLoading,
        hideLoading,
        updateLoadingMessage,
        showButtonLoading,
        hideButtonLoading,
        showError,
        showSuccess,
        showInfo,
        clearMessages,
        showFormLoading,
        hideFormLoading,
        showSkeletonLoader,
        debounce,
        throttle,
        confirmAction,
        formatError
    };
}

