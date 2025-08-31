// Main JavaScript for School Management System

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all interactive features
    initFlashMessages();
    initThemeToggle();
    initFormValidation();
    initFeeCalculator();
    initAttendanceFeatures();
});

// Flash Messages
function initFlashMessages() {
    const closeButtons = document.querySelectorAll('.close-flash');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.parentElement.style.display = 'none';
        });
    });
    
    // Auto-hide flash messages after 5 seconds
    const flashMessages = document.querySelectorAll('.flash-message');
    flashMessages.forEach(message => {
        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => {
                message.style.display = 'none';
            }, 300);
        }, 5000);
    });
}

// Theme Toggle
function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        const sunIcon = themeToggle.querySelector('.fa-sun');
        const moonIcon = themeToggle.querySelector('.fa-moon');
        
        sunIcon.addEventListener('click', function() {
            // Switch to light theme (future feature)
            console.log('Light theme selected');
            sunIcon.classList.add('active');
            moonIcon.classList.remove('active');
        });
        
        moonIcon.addEventListener('click', function() {
            // Switch to dark theme
            console.log('Dark theme selected');
            moonIcon.classList.add('active');
            sunIcon.classList.remove('active');
        });
    }
}

// Form Validation
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
                showError('Please fill in all required fields correctly.');
            }
        });
    });
}

function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            field.style.borderColor = '#4b5563';
        }
    });
    
    return isValid;
}

// Fee Calculator Functions
function initFeeCalculator() {
    const totalAmountField = document.getElementById('total_amount');
    const percentageField = document.getElementById('percentage_paid');
    
    if (totalAmountField && percentageField) {
        totalAmountField.addEventListener('change', calculateAmount);
        percentageField.addEventListener('input', calculateAmount);
        
        // Initialize calculation
        calculateAmount();
    }
}

function calculateAmount() {
    const totalAmount = parseFloat(document.getElementById('total_amount').value) || 0;
    const percentage = parseFloat(document.getElementById('percentage_paid').value) || 0;
    const amountPaying = (totalAmount * percentage) / 100;
    const schoolShare = (amountPaying * 35) / 100;
    const remainingAmount = totalAmount - amountPaying;
    
    // Update display field
    const amountDisplay = document.getElementById('amount_display');
    if (amountDisplay) {
        amountDisplay.value = `₹${amountPaying.toFixed(2)}`;
    }
    
    // Update summary if it exists
    updateSummary(totalAmount, percentage, amountPaying, schoolShare, remainingAmount);
}

function updateSummary(total, percentage, amount, schoolShare, remaining) {
    const summaryElements = {
        'summary_total': `₹${total.toFixed(2)}`,
        'summary_percentage': `${percentage}%`,
        'summary_amount': `₹${amount.toFixed(2)}`,
        'school_share': `₹${schoolShare.toFixed(2)}`,
        'remaining_amount': `₹${remaining.toFixed(2)}`
    };
    
    Object.keys(summaryElements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = summaryElements[id];
        }
    });
}

function setPercentage(percent) {
    const percentageField = document.getElementById('percentage_paid');
    if (percentageField) {
        percentageField.value = percent;
        calculateAmount();
        
        // Highlight the selected button temporarily
        event.target.style.backgroundColor = '#3b82f6';
        setTimeout(() => {
            event.target.style.backgroundColor = '';
        }, 200);
    }
}

// Attendance Functions
function initAttendanceFeatures() {
    // Initialize attendance controls if they exist
    const markAllPresentBtn = document.querySelector('button[onclick="markAllPresent()"]');
    const markAllAbsentBtn = document.querySelector('button[onclick="markAllAbsent()"]');
    
    if (markAllPresentBtn) {
        markAllPresentBtn.addEventListener('click', markAllPresent);
    }
    
    if (markAllAbsentBtn) {
        markAllAbsentBtn.addEventListener('click', markAllAbsent);
    }
}

function markAllPresent() {
    const presentRadios = document.querySelectorAll('input[type="radio"][value="present"]');
    presentRadios.forEach(radio => {
        radio.checked = true;
    });
    showSuccess('All students marked as present');
}

function markAllAbsent() {
    const absentRadios = document.querySelectorAll('input[type="radio"][value="absent"]');
    absentRadios.forEach(radio => {
        radio.checked = true;
    });
    showSuccess('All students marked as absent');
}

// Utility Functions
function showSuccess(message) {
    showFlashMessage(message, 'success');
}

function showError(message) {
    showFlashMessage(message, 'error');
}

function showFlashMessage(message, type) {
    // Create flash message element
    const flashContainer = document.querySelector('.flash-messages') || createFlashContainer();
    
    const flashMessage = document.createElement('div');
    flashMessage.className = `flash-message flash-${type}`;
    flashMessage.innerHTML = `
        ${message}
        <button class="close-flash">&times;</button>
    `;
    
    flashContainer.appendChild(flashMessage);
    
    // Add close functionality
    flashMessage.querySelector('.close-flash').addEventListener('click', function() {
        flashMessage.style.display = 'none';
    });
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        flashMessage.style.opacity = '0';
        setTimeout(() => {
            flashMessage.remove();
        }, 300);
    }, 3000);
}

function createFlashContainer() {
    const container = document.createElement('div');
    container.className = 'flash-messages';
    const contentArea = document.querySelector('.content-area');
    contentArea.insertBefore(container, contentArea.firstChild);
    return container;
}

// Student Photo Preview
function previewPhoto(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            let preview = document.getElementById('photo-preview');
            if (!preview) {
                preview = document.createElement('img');
                preview.id = 'photo-preview';
                preview.style.maxWidth = '200px';
                preview.style.maxHeight = '200px';
                preview.style.marginTop = '10px';
                preview.style.borderRadius = '8px';
                input.parentNode.appendChild(preview);
            }
            preview.src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Add photo preview to file inputs
document.addEventListener('DOMContentLoaded', function() {
    const photoInput = document.getElementById('photo');
    if (photoInput) {
        photoInput.addEventListener('change', function() {
            previewPhoto(this);
        });
    }
});

// Search and Filter Functions
function searchStudents() {
    const searchInput = document.getElementById('student-search');
    const studentRows = document.querySelectorAll('.student-row');
    
    if (searchInput && studentRows.length > 0) {
        const searchTerm = searchInput.value.toLowerCase();
        
        studentRows.forEach(row => {
            const studentName = row.querySelector('.student-name').textContent.toLowerCase();
            const rollNumber = row.querySelector('.roll-number').textContent.toLowerCase();
            
            if (studentName.includes(searchTerm) || rollNumber.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
}

// Confirm Delete Actions
function confirmDelete(itemName) {
    return confirm(`Are you sure you want to delete ${itemName}? This action cannot be undone.`);
}

// Print Functions
function printAttendance() {
    window.print();
}

function printStudentProfile() {
    window.print();
}

// Export Functions
function exportToCSV() {
    // Future implementation for CSV export
    showSuccess('CSV export feature will be implemented');
}

function exportToExcel() {
    // Future implementation for Excel export
    showSuccess('Excel export feature will be implemented');
}

// Navigation Helper
function goBack() {
    window.history.back();
}

// Keyboard Shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl + S to save forms
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        const submitButton = document.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.click();
        }
    }
    
    // Escape to close modals or go back
    if (e.key === 'Escape') {
        const modal = document.querySelector('.modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
});

// Auto-save draft functionality (future feature)
function autoSaveDraft() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                // Save draft to localStorage
                const formData = new FormData(form);
                const draftData = {};
                for (let [key, value] of formData.entries()) {
                    draftData[key] = value;
                }
                localStorage.setItem('form-draft', JSON.stringify(draftData));
            });
        });
    });
}

// Load saved draft (future feature)
function loadDraft() {
    const draft = localStorage.getItem('form-draft');
    if (draft) {
        const draftData = JSON.parse(draft);
        Object.keys(draftData).forEach(key => {
            const field = document.querySelector(`[name="${key}"]`);
            if (field) {
                field.value = draftData[key];
            }
        });
    }
}

// Clear draft after successful submission
function clearDraft() {
    localStorage.removeItem('form-draft');
}

// Initialize tooltips (if needed)
function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            showTooltip(this, this.getAttribute('data-tooltip'));
        });
        
        element.addEventListener('mouseleave', function() {
            hideTooltip();
        });
    });
}

function showTooltip(element, text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    tooltip.style.position = 'absolute';
    tooltip.style.backgroundColor = '#1a1a1a';
    tooltip.style.color = '#e5e5e5';
    tooltip.style.padding = '8px 12px';
    tooltip.style.borderRadius = '6px';
    tooltip.style.fontSize = '0.8rem';
    tooltip.style.zIndex = '1000';
    tooltip.style.border = '1px solid #333';
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + 'px';
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';
}

function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Date formatting helper
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Number formatting helper
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

// Validation helpers
function validatePhone(phone) {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePincode(pincode) {
    const pincodeRegex = /^\d{6}$/;
    return pincodeRegex.test(pincode);
}

// Age calculation
function calculateAge(dob) {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

// Local storage helpers
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function getFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
    }
}

// Print functionality
function printPage() {
    window.print();
}

// Confirmation dialogs
function confirmAction(message) {
    return confirm(message);
}

// Loading state management
function showLoading(element) {
    element.disabled = true;
    element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
}

function hideLoading(element, originalText) {
    element.disabled = false;
    element.innerHTML = originalText;
}

// Image loading error handler
function handleImageError(img) {
    img.style.display = 'none';
    const placeholder = img.nextElementSibling || document.createElement('div');
    placeholder.className = 'no-photo';
    placeholder.innerHTML = '<i class="fas fa-user"></i>';
    if (!img.nextElementSibling) {
        img.parentNode.appendChild(placeholder);
    }
}

// Add image error handlers to all student photos
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[src*="students"]');
    images.forEach(img => {
        img.addEventListener('error', function() {
            handleImageError(this);
        });
    });
});

// Enhanced search functionality
function enhancedSearch() {
    const searchInput = document.getElementById('enhanced-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const searchType = document.getElementById('search-type').value;
            
            filterResults(searchTerm, searchType);
        });
    }
}

function filterResults(searchTerm, searchType) {
    const rows = document.querySelectorAll('.student-row');
    
    rows.forEach(row => {
        let searchField;
        switch (searchType) {
            case 'name':
                searchField = row.querySelector('.student-name');
                break;
            case 'roll':
                searchField = row.querySelector('.roll-number');
                break;
            case 'phone':
                searchField = row.querySelector('.phone-number');
                break;
            default:
                searchField = row;
        }
        
        const text = searchField ? searchField.textContent.toLowerCase() : '';
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Bulk operations
function selectAllStudents() {
    const checkboxes = document.querySelectorAll('.student-checkbox');
    const selectAll = document.getElementById('select-all');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });
    
    updateBulkActions();
}

function updateBulkActions() {
    const checkedBoxes = document.querySelectorAll('.student-checkbox:checked');
    const bulkActions = document.querySelector('.bulk-actions');
    
    if (bulkActions) {
        bulkActions.style.display = checkedBoxes.length > 0 ? 'block' : 'none';
    }
}

// Fee calculation with installments
function calculateInstallments() {
    const totalFee = parseFloat(document.getElementById('total_fee').value) || 0;
    const installments = parseInt(document.getElementById('installments').value) || 1;
    const installmentAmount = totalFee / installments;
    
    const installmentDisplay = document.getElementById('installment_amount');
    if (installmentDisplay) {
        installmentDisplay.textContent = `₹${installmentAmount.toFixed(2)} per installment`;
    }
}

// Dynamic form fields
function addFormField(container, fieldTemplate) {
    const newField = fieldTemplate.cloneNode(true);
    const inputs = newField.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.value = '';
        input.name = input.name.replace(/\d+/, Date.now());
    });
    
    container.appendChild(newField);
}

function removeFormField(button) {
    const fieldContainer = button.closest('.dynamic-field');
    if (fieldContainer) {
        fieldContainer.remove();
    }
}

// Statistics refresh
function refreshStats() {
    fetch('/api/stats')
        .then(response => response.json())
        .then(data => {
            updateStatCards(data);
        })
        .catch(error => {
            console.error('Error refreshing stats:', error);
        });
}

function updateStatCards(stats) {
    Object.keys(stats).forEach(key => {
        const statValue = document.querySelector(`[data-stat="${key}"] .stat-value`);
        if (statValue) {
            statValue.textContent = stats[key];
        }
    });
}

// File upload validation
function validateFileUpload(input) {
    const file = input.files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    
    if (file) {
        if (file.size > maxSize) {
            showError('File size must be less than 5MB');
            input.value = '';
            return false;
        }
        
        if (!allowedTypes.includes(file.type)) {
            showError('Only JPEG, PNG, and GIF files are allowed');
            input.value = '';
            return false;
        }
    }
    
    return true;
}

// Initialize enhanced features
document.addEventListener('DOMContentLoaded', function() {
    // Add file upload validation
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        input.addEventListener('change', function() {
            validateFileUpload(this);
        });
    });
    
    // Initialize enhanced search if present
    enhancedSearch();
    
    // Initialize tooltips
    initTooltips();
    
    // Set today's date as default for date inputs
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    dateInputs.forEach(input => {
        if (!input.value && input.name.includes('date')) {
            input.value = today;
        }
    });
});
