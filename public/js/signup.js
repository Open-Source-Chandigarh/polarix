document.addEventListener('DOMContentLoaded', function() {
    const sign_in_btn = document.querySelector("#sign-in-btn");
    const sign_up_btn = document.querySelector("#sign-up-btn");
    const container = document.querySelector(".container");
    const signUpForm = document.querySelector(".sign-up-form");
    const signInForm = document.querySelector(".sign-in-form");

    sign_up_btn.addEventListener("click", () => {
        container.classList.add("sign-up-mode");
    });

    sign_in_btn.addEventListener("click", () => {
        container.classList.remove("sign-up-mode");
    });

    // Handle signup form submission
    signUpForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        
        const username = this.querySelector('input[placeholder="Username"]').value.trim();
        const email = this.querySelector('input[placeholder="Email"]').value.trim();
        const password = this.querySelector('input[placeholder="Password"]').value;
        const submitBtn = this.querySelector('.btn');
        
        // Validation
        if (!username || !email || !password) {
            showError("Please fill all required fields");
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError("Please enter a valid email address");
            return;
        }
        
        // Password validation
        if (password.length < 6) {
            showError("Password must be at least 6 characters long");
            return;
        }
        
        try {
            // Show loading state
            showLoading('Creating your account...');
            showButtonLoading(submitBtn, 'Signing up...');
            
            const response = await fetch('https://polarix-back.onrender.com/api/users/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });
            
            const data = await response.json();
            console.log('Received response data:', data);
            
            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }
            
            hideLoading();
            hideButtonLoading(submitBtn);
            
            // Show success message
            let successMessage = "Signup successful! 🎉";
            if (data.emailStatus === 'sent') {
                successMessage += " A welcome email has been sent to your inbox.";
            } else if (data.emailStatus === 'failed') {
                successMessage += " However, we couldn't send the welcome email.";
            }
            
            showSuccess(successMessage);
            
            // Clear form
            this.reset();
            
            // Switch to sign-in form after a short delay
            setTimeout(() => {
                container.classList.remove("sign-up-mode");
            }, 1500);
            
        } catch (error) {
            console.error("Signup error:", error);
            hideLoading();
            hideButtonLoading(submitBtn);
            showError(error.message || 'Signup failed. Please try again.');
        }
    });
    
    // Handle login form submission
    signInForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        
        const username = this.querySelector('input[placeholder="Username"]').value.trim();
        const password = this.querySelector('input[placeholder="Password"]').value;
        const submitBtn = this.querySelector('.btn');
        
        // Validation
        if (!username || !password) {
            showError("Please fill all required fields");
            return;
        }
        
        try {
            // Show loading state
            showLoading('Logging you in...');
            showButtonLoading(submitBtn, 'Logging in...');
            
            const response = await fetch('https://polarix-back.onrender.com/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }
            
            // Save user data to localStorage
            saveUser({
                username: data.username,
                email: data.email,
                userId: data.userId,
                token: data.token
            });
            
            updateLoadingMessage('Login successful! Redirecting...');
            
            // Redirect to main dashboard after a short delay
            setTimeout(() => {
                window.location.href = "maindashboard.html";
            }, 500);
            
        } catch (error) {
            console.error("Login error:", error);
            hideLoading();
            hideButtonLoading(submitBtn);
            showError(error.message || 'Login failed. Please check your credentials and try again.');
        }
    });
    
    // Helper functions for UI feedback
    function showError(message) {
        alert('Error: ' + message);
    }
    
    function showSuccess(message) {
        alert(message);
    }
    
    function showLoading(message) {
        if (typeof window.showLoading === 'function') {
            window.showLoading(message);
        }
    }
    
    function hideLoading() {
        if (typeof window.hideLoading === 'function') {
            window.hideLoading();
        }
    }
    
    function updateLoadingMessage(message) {
        if (typeof window.updateLoadingMessage === 'function') {
            window.updateLoadingMessage(message);
        }
    }
    
    function showButtonLoading(button, text) {
        if (typeof window.showButtonLoading === 'function') {
            window.showButtonLoading(button, text);
        } else if (button) {
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            if (text) button.textContent = text;
        }
    }
    
    function hideButtonLoading(button) {
        if (typeof window.hideButtonLoading === 'function') {
            window.hideButtonLoading(button);
        } else if (button) {
            button.disabled = false;
            if (button.dataset.originalText) {
                button.textContent = button.dataset.originalText;
            }
        }
    }
    
    function saveUser(userData) {
        if (typeof window.saveUser === 'function') {
            window.saveUser(userData);
        } else {
            localStorage.setItem('user', JSON.stringify(userData));
        }
    }
});
