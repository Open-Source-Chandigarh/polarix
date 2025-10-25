/**
 * Authentication Utility Module
 * Handles token validation, storage, and authentication state management
 */

const AUTH_CONFIG = {
    TOKEN_KEY: 'user',
    API_URL: 'https://polarix-back.onrender.com/api'
};

/**
 * Get user data from localStorage
 * @returns {Object|null} User object with token or null if not found
 */
function getUser() {
    try {
        const userStr = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
        if (!userStr) return null;
        
        const user = JSON.parse(userStr);
        
        // Validate user object structure
        if (!user || !user.token) {
            console.warn('Invalid user object in localStorage');
            return null;
        }
        
        return user;
    } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        return null;
    }
}

/**
 * Save user data to localStorage
 * @param {Object} userData - User data to save
 */
function saveUser(userData) {
    try {
        if (!userData || !userData.token) {
            throw new Error('Invalid user data: token is required');
        }
        localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, JSON.stringify(userData));
    } catch (error) {
        console.error('Error saving user to localStorage:', error);
        throw error;
    }
}

/**
 * Remove user data from localStorage (logout)
 */
function removeUser() {
    try {
        localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    } catch (error) {
        console.error('Error removing user from localStorage:', error);
    }
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has valid token
 */
function isAuthenticated() {
    const user = getUser();
    return user !== null && user.token !== undefined;
}

/**
 * Validate token by making a test API call
 * @returns {Promise<boolean>} True if token is valid
 */
async function validateToken() {
    const user = getUser();
    
    if (!user || !user.token) {
        return false;
    }
    
    try {
        const response = await fetch(`${AUTH_CONFIG.API_URL}/profile/${encodeURIComponent(user.email)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${user.token}`,
                'Content-Type': 'application/json'
            }
        });
        
        // Token is valid if we get 200 or 404 (profile not found but token is valid)
        return response.status === 200 || response.status === 404;
    } catch (error) {
        console.error('Token validation error:', error);
        return false;
    }
}

/**
 * Handle logout - clear user data and redirect
 * @param {string} redirectUrl - URL to redirect after logout (default: index.html)
 */
function logout(redirectUrl = 'index.html') {
    removeUser();
    
    // Clear any other session data if needed
    sessionStorage.clear();
    
    // Redirect to specified page
    window.location.href = redirectUrl;
}

/**
 * Redirect to login page if not authenticated
 * @param {string} loginUrl - Login page URL (default: signup.html)
 * @returns {boolean} True if user is authenticated, false if redirected
 */
function requireAuth(loginUrl = 'signup.html') {
    if (!isAuthenticated()) {
        alert('Please log in to access this page.');
        window.location.href = loginUrl;
        return false;
    }
    return true;
}

/**
 * Get authorization header for API requests
 * @returns {Object} Headers object with Authorization
 */
function getAuthHeaders() {
    const user = getUser();
    
    if (!user || !user.token) {
        throw new Error('No authentication token available');
    }
    
    return {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json'
    };
}

/**
 * Handle API errors consistently
 * @param {Response} response - Fetch API response
 * @param {string} context - Context of the error for logging
 * @returns {Promise<Object>} Parsed response data
 */
async function handleApiResponse(response, context = 'API call') {
    if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
            console.error(`${context}: Authentication failed`);
            alert('Your session has expired. Please log in again.');
            logout('signup.html');
            throw new Error('Authentication failed');
        }
        
        // Try to get error message from response
        let errorMessage = `${context} failed: HTTP ${response.status}`;
        try {
            const errorData = await response.json();
            if (errorData.message) {
                errorMessage = errorData.message;
            }
        } catch (e) {
            // If response is not JSON, use default message
            const text = await response.text();
            if (text) {
                errorMessage = text;
            }
        }
        
        throw new Error(errorMessage);
    }
    
    return response.json();
}

/**
 * Make authenticated API request with error handling
 * @param {string} endpoint - API endpoint (relative to API_URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data
 */
async function authenticatedFetch(endpoint, options = {}) {
    const user = getUser();
    
    if (!user || !user.token) {
        throw new Error('Not authenticated');
    }
    
    const url = endpoint.startsWith('http') ? endpoint : `${AUTH_CONFIG.API_URL}${endpoint}`;
    
    const fetchOptions = {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(url, fetchOptions);
        return await handleApiResponse(response, `Request to ${endpoint}`);
    } catch (error) {
        console.error(`Authenticated fetch error for ${endpoint}:`, error);
        throw error;
    }
}

// Export all functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getUser,
        saveUser,
        removeUser,
        isAuthenticated,
        validateToken,
        logout,
        requireAuth,
        getAuthHeaders,
        handleApiResponse,
        authenticatedFetch,
        AUTH_CONFIG
    };
}

