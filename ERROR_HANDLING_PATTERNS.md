# Error Handling Patterns for PolariX

## Quick Reference Guide for Implementing Error Handling

This guide shows you how to add error handling and loading states to the remaining files (dashboard.js, profile.js, category.js).

## 🎯 Pattern 1: API Data Fetching

### Before (No Error Handling)
```javascript
async function fetchData() {
    const response = await fetch(API_URL + '/endpoint', {
        headers: { 'Authorization': `Bearer ${user.token}` }
    });
    const data = await response.json();
    renderData(data);
}
```

### After (With Error Handling)
```javascript
async function fetchData() {
    showLoading('Loading data...');
    
    try {
        const response = await fetch(API_URL + '/endpoint', {
            headers: { 'Authorization': `Bearer ${user.token}` }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch data: HTTP ${response.status}`);
        }
        
        const data = await response.json();
        renderData(data);
        hideLoading();
        
    } catch (error) {
        console.error('Fetch data error:', error);
        hideLoading();
        showError(formatError(error));
        
        // Optional: Show fallback UI
        renderEmptyState();
    }
}
```

## 🎯 Pattern 2: Form Submission

### Before (No Error Handling)
```javascript
saveButton.addEventListener('click', async function() {
    const data = collectFormData();
    
    const response = await fetch(API_URL + '/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(data)
    });
    
    alert('Saved!');
});
```

### After (With Error Handling)
```javascript
saveButton.addEventListener('click', async function(e) {
    e.preventDefault();
    
    const data = collectFormData();
    
    // Validate data
    if (!validateData(data)) {
        showError('Please fill all required fields');
        return;
    }
    
    showButtonLoading(saveButton, 'Saving...');
    
    try {
        const response = await fetch(API_URL + '/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Save failed');
        }
        
        const result = await response.json();
        hideButtonLoading(saveButton);
        showSuccess(result.message || 'Saved successfully!');
        
        // Optional: Refresh data
        await fetchData();
        
    } catch (error) {
        console.error('Save error:', error);
        hideButtonLoading(saveButton);
        showError(formatError(error));
    }
});
```

## 🎯 Pattern 3: Chart Rendering

### Before (No Error Handling)
```javascript
function renderChart(data) {
    const ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: data
    });
}
```

### After (With Error Handling)
```javascript
function renderChart(data) {
    try {
        const canvas = document.getElementById('myChart');
        
        if (!canvas) {
            throw new Error('Chart canvas not found');
        }
        
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
            throw new Error('Failed to get canvas context');
        }
        
        // Validate data
        if (!data || !data.labels || !data.datasets) {
            throw new Error('Invalid chart data');
        }
        
        // Destroy existing chart if it exists
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }
        
        new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true }
                }
            }
        });
        
    } catch (error) {
        console.error('Chart render error:', error);
        showError('Failed to render chart: ' + error.message);
        
        // Optional: Show fallback message
        const canvas = document.getElementById('myChart');
        if (canvas) {
            const parent = canvas.parentElement;
            parent.innerHTML = '<p class="error-message">Unable to load chart</p>';
        }
    }
}
```

## 🎯 Pattern 4: Multiple API Calls

### Before (No Error Handling)
```javascript
async function loadDashboard() {
    const transactions = await fetchTransactions();
    const profile = await fetchProfile();
    const categories = await fetchCategories();
    
    renderDashboard(transactions, profile, categories);
}
```

### After (With Error Handling)
```javascript
async function loadDashboard() {
    showLoading('Loading dashboard...');
    
    try {
        // Fetch all data in parallel
        const [transactions, profile, categories] = await Promise.all([
            fetchTransactions().catch(err => {
                console.error('Transactions fetch failed:', err);
                return []; // Return empty array as fallback
            }),
            fetchProfile().catch(err => {
                console.error('Profile fetch failed:', err);
                return null; // Return null as fallback
            }),
            fetchCategories().catch(err => {
                console.error('Categories fetch failed:', err);
                return []; // Return empty array as fallback
            })
        ]);
        
        // Check if we have at least some data
        if (!transactions.length && !profile && !categories.length) {
            throw new Error('Failed to load dashboard data');
        }
        
        renderDashboard(transactions, profile, categories);
        hideLoading();
        
        // Show warning if some data failed to load
        if (!profile) {
            showInfo('Profile data could not be loaded');
        }
        
    } catch (error) {
        console.error('Dashboard load error:', error);
        hideLoading();
        showError('Failed to load dashboard. Please refresh the page.');
    }
}
```

## 🎯 Pattern 5: Delete Operations

### Before (No Error Handling)
```javascript
async function deleteItem(id) {
    await fetch(`${API_URL}/items/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
    });
    
    alert('Deleted!');
    fetchItems();
}
```

### After (With Error Handling)
```javascript
async function deleteItem(id) {
    // Confirm action
    const confirmed = await confirmAction('Are you sure you want to delete this item?');
    
    if (!confirmed) {
        return;
    }
    
    showLoading('Deleting item...');
    
    try {
        const response = await fetch(`${API_URL}/items/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${user.token}` }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Delete failed');
        }
        
        const result = await response.json();
        hideLoading();
        showSuccess(result.message || 'Item deleted successfully!');
        
        // Refresh the list
        await fetchItems();
        
    } catch (error) {
        console.error('Delete error:', error);
        hideLoading();
        showError(formatError(error));
    }
}
```

## 🎯 Pattern 6: Input Validation

### Before (No Validation)
```javascript
function saveProfile() {
    const data = {
        firstName: document.getElementById('firstName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value
    };
    
    // Save without validation
    submitProfile(data);
}
```

### After (With Validation)
```javascript
function saveProfile() {
    const data = {
        firstName: document.getElementById('firstName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim()
    };
    
    // Validate required fields
    if (!data.firstName) {
        showError('First name is required');
        document.getElementById('firstName').focus();
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
        showError('Please enter a valid email address');
        document.getElementById('email').focus();
        return;
    }
    
    // Validate phone format (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (data.phone && !phoneRegex.test(data.phone)) {
        showError('Phone number must be 10 digits');
        document.getElementById('phone').focus();
        return;
    }
    
    // All validations passed
    submitProfile(data);
}
```

## 🎯 Pattern 7: Network Error Handling

### Comprehensive Network Error Handler
```javascript
async function handleApiCall(url, options = {}) {
    try {
        const response = await fetch(url, options);
        
        // Handle different HTTP status codes
        if (response.status === 401 || response.status === 403) {
            // Authentication failed
            showError('Session expired. Please log in again.');
            setTimeout(() => {
                logout('signup.html');
            }, 2000);
            throw new Error('Authentication failed');
        }
        
        if (response.status === 404) {
            throw new Error('Resource not found');
        }
        
        if (response.status === 500) {
            throw new Error('Server error. Please try again later.');
        }
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        
        return await response.json();
        
    } catch (error) {
        // Network error (no internet, server down, etc.)
        if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
            throw new Error('Network error. Please check your internet connection.');
        }
        
        throw error;
    }
}
```

## 📋 Implementation Checklist

For each function that makes an API call or performs async operations:

- [ ] Add try-catch block
- [ ] Show loading state before operation
- [ ] Hide loading state after completion (success or error)
- [ ] Validate input data before submission
- [ ] Check response status codes
- [ ] Handle specific error cases (401, 403, 404, 500)
- [ ] Show user-friendly error messages
- [ ] Log errors to console for debugging
- [ ] Provide fallback UI for failed operations
- [ ] Test with network disconnected
- [ ] Test with invalid data
- [ ] Test with expired token

## 🔧 Helper Functions to Use

```javascript
// From authUtils.js
- getUser()
- isAuthenticated()
- authenticatedFetch(endpoint, options)
- handleApiResponse(response, context)
- logout(redirectUrl)

// From uiUtils.js
- showLoading(message)
- hideLoading()
- updateLoadingMessage(message)
- showButtonLoading(button, text)
- hideButtonLoading(button)
- showError(message, container, duration)
- showSuccess(message, container, duration)
- showInfo(message, container, duration)
- formatError(error)
- confirmAction(message)
```

## 🎨 UI Feedback Best Practices

1. **Always show loading states** for operations > 200ms
2. **Use specific messages** ("Loading transactions..." not "Loading...")
3. **Show success feedback** for all user actions
4. **Make errors actionable** ("Please check your internet connection" not "Error")
5. **Use appropriate colors** (red for errors, green for success, blue for info)
6. **Auto-dismiss success messages** after 3 seconds
7. **Keep error messages visible** until user dismisses
8. **Disable buttons during submission** to prevent double-clicks
9. **Re-enable forms after errors** so users can retry
10. **Log all errors to console** for debugging

## 📝 Example: Complete Function with All Patterns

```javascript
async function saveTransaction() {
    const form = document.getElementById('transactionForm');
    const submitBtn = document.getElementById('saveTransactionBtn');
    
    // 1. Collect and validate data
    const data = {
        amount: parseFloat(document.getElementById('amount').value),
        date: document.getElementById('date').value,
        category: document.getElementById('category').value,
        description: document.getElementById('description').value.trim()
    };
    
    // 2. Validate
    if (!data.amount || data.amount <= 0) {
        showError('Please enter a valid amount');
        return;
    }
    
    if (!data.date) {
        showError('Please select a date');
        return;
    }
    
    if (!data.category) {
        showError('Please select a category');
        return;
    }
    
    // 3. Show loading
    showButtonLoading(submitBtn, 'Saving...');
    showFormLoading(form);
    
    try {
        // 4. Make API call
        const response = await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getUser().token}`
            },
            body: JSON.stringify(data)
        });
        
        // 5. Handle response
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save transaction');
        }
        
        const result = await response.json();
        
        // 6. Hide loading
        hideButtonLoading(submitBtn);
        hideFormLoading(form);
        
        // 7. Show success
        showSuccess(result.message || 'Transaction saved successfully!');
        
        // 8. Clear form
        form.reset();
        
        // 9. Refresh data
        await fetchTransactions();
        
    } catch (error) {
        // 10. Handle error
        console.error('Save transaction error:', error);
        hideButtonLoading(submitBtn);
        hideFormLoading(form);
        showError(formatError(error));
    }
}
```

## 🚀 Quick Start

To add error handling to any file:

1. **Add script references** to HTML:
```html
<script src="./js/authUtils.js"></script>
<script src="./js/uiUtils.js"></script>
```

2. **Wrap async operations** in try-catch:
```javascript
try {
    // Your code
} catch (error) {
    console.error('Error:', error);
    showError(formatError(error));
}
```

3. **Add loading states**:
```javascript
showLoading('Processing...');
// Your code
hideLoading();
```

4. **Validate inputs** before submission
5. **Test thoroughly** with different scenarios

That's it! You now have consistent error handling across your application.

