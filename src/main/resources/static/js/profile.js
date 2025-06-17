// DOM Elements
const logoUpload = document.getElementById('logoUpload');
const logoPreview = document.getElementById('logoPreview');
const profileForm = document.getElementById('profileForm');
const notification = document.getElementById('notification');
const viewProfileBtn = document.getElementById('viewProfileBtn');
const profileModal = document.getElementById('profileModal');
const closeModal = document.getElementById('closeModal');
const profileView = document.getElementById('profileView');
const editProfileBtn = document.getElementById('editProfileBtn');

// Business Name Edit Elements
const businessNameDisplay = document.getElementById('businessNameDisplay');
const editBusinessNameBtn = document.getElementById('editBusinessNameBtn');
const businessNameEditContainer = document.getElementById('businessNameEditContainer');
const businessNameInput = document.getElementById('businessNameInput');
const saveBusinessNameBtn = document.getElementById('saveBusinessNameBtn');
const cancelBusinessNameBtn = document.getElementById('cancelBusinessNameBtn');

// Load profile data on page load
document.addEventListener('DOMContentLoaded', function() {
    fetchProfileData();
});

// Fetch profile data from backend
function fetchProfileData() {
    fetch('/profile/data')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch profile data');
            }
            return response.json();
        })
        .then(data => {
            populateFormFields(data);
        })
        .catch(error => {
            console.error('Error fetching profile data:', error);
            showNotification('Error loading profile data', 'error');
        });
}

// Populate form fields with fetched data
function populateFormFields(data) {
    if (!data) return;
    
    // Set form values
    const formFields = [
        'ownerName', 'email', 'contactNumber', 
        'address', 'country', 'description'
    ];
    
    formFields.forEach(field => {
        const value = data[field];
        if (value) {
            document.getElementById(field).value = value;
        }
    });
    
    // Set business name
    if (data.businessName) {
        businessNameDisplay.textContent = data.businessName;
    }
    
    // Set profile logo if exists
    if (data.id) {
        logoPreview.src = `/profile/logo?t=${new Date().getTime()}`; // Add timestamp to prevent caching
    }
}

// Business Name Edit Functionality
editBusinessNameBtn.addEventListener('click', function() {
    // Hide display, show edit form
    businessNameDisplay.style.display = 'none';
    editBusinessNameBtn.style.display = 'none';
    businessNameEditContainer.style.display = 'flex';
    
    // Pre-fill with current name
    businessNameInput.value = businessNameDisplay.textContent;
    businessNameInput.focus();
});

saveBusinessNameBtn.addEventListener('click', function() {
    const newBusinessName = businessNameInput.value.trim();
    if (newBusinessName) {
        // Update business name in backend
        updateBusinessName(newBusinessName);
    }
    toggleBusinessNameEdit(false);
});

cancelBusinessNameBtn.addEventListener('click', function() {
    toggleBusinessNameEdit(false);
});

function toggleBusinessNameEdit(showEdit) {
    if (showEdit) {
        businessNameDisplay.style.display = 'none';
        editBusinessNameBtn.style.display = 'none';
        businessNameEditContainer.style.display = 'flex';
    } else {
        businessNameDisplay.style.display = 'block';
        editBusinessNameBtn.style.display = 'block';
        businessNameEditContainer.style.display = 'none';
    }
}

// Update business name in backend
function updateBusinessName(businessName) {
    // Create form data
    const formData = new FormData();
    formData.append('businessName', businessName);
    
    // Send request to backend
    fetch('/profile/update/business-name', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            businessNameDisplay.textContent = businessName;
            showNotification(data.message);
        } else {
            showNotification(data.message, 'error');
        }
    })
    .catch(error => {
        showNotification('Error updating business name', 'error');
        console.error('Error:', error);
    });
}

// Logo Upload Preview
logoUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            logoPreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Save form data
profileForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Create form data from form
    const formData = new FormData(profileForm);
    
    // Add business name to form data
    formData.append('businessName', businessNameDisplay.textContent);
    
    // Send data to backend
    fetch('/profile/save', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showSweetAlert('Success', data.message, 'success');
        } else {
            showSweetAlert('Error', data.message, 'error');
        }
    })
    .catch(error => {
        showSweetAlert('Error', 'Failed to save profile', 'error');
        console.error('Error:', error);
    });
});

// Edit Profile button functionality
editProfileBtn.addEventListener('click', function() {
    fetchProfileData();
    showNotification('Profile ready for editing');
});

// Show notification
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.classList.add('show');
    
    // Add color based on type
    if (type === 'error') {
        notification.classList.add('error');
    } else {
        notification.classList.remove('error');
    }
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Show SweetAlert notification
function showSweetAlert(title, message, icon) {
    Swal.fire({
        title: title,
        text: message,
        icon: icon,
        confirmButtonText: 'OK'
    });
}

// View Profile Button - Open Modal
viewProfileBtn.addEventListener('click', function() {
    fetchProfileForDisplay();
    profileModal.style.display = 'flex';
});

// Close Modal
closeModal.addEventListener('click', function() {
    profileModal.style.display = 'none';
});

// Close modal when clicking outside content
window.addEventListener('click', function(e) {
    if (e.target === profileModal) {
        profileModal.style.display = 'none';
    }
});

// Fetch profile data for display modal
function fetchProfileForDisplay() {
    fetch('/profile/data')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch profile data');
            }
            return response.json();
        })
        .then(data => {
            displayProfileData(data);
        })
        .catch(error => {
            console.error('Error fetching profile data:', error);
            showNotification('Error loading profile data', 'error');
        });
}

// Display profile data in modal
function displayProfileData(profileData) {
    if (!profileData) {
        profileView.innerHTML = "<p>No profile data available.</p>";
        return;
    }
    
    const formFields = {
        'ownerName': { icon: 'user', label: 'Owner Name' },
        'email': { icon: 'envelope', label: 'Email' },
        'contactNumber': { icon: 'phone', label: 'Contact Number' },
        'address': { icon: 'map-marker-alt', label: 'Address' },
        'country': { icon: 'globe', label: 'Country' },
        'description': { icon: 'info-circle', label: 'Business Description' }
    };
    
    // Create header with logo and business name
    const businessName = profileData.businessName || 'Business Name';
    const ownerName = profileData.ownerName || 'Owner Name';
    const logoSrc = `/profile/logo?t=${new Date().getTime()}`; // Add timestamp to prevent caching
    
    let profileHTML = `
        <div class="profile-header" style="grid-column: 1 / -1;">
            <img src="${logoSrc}" alt="${businessName} Logo">
            <div class="profile-header-info">
                <h2>${businessName}</h2>
                <p>Owned by ${ownerName}</p>
            </div>
        </div>
    `;
    
    // First column
    profileHTML += '<div class="profile-details-column">';
    let count = 0;
    
    for (const [field, info] of Object.entries(formFields)) {
        const value = profileData[field] || 'Not specified';
        
        // Split columns after 3 items
        if (count === 3) {
            profileHTML += '</div><div class="profile-details-column">';
        }
        
        profileHTML += `
            <div class="profile-detail">
                <h3><i class="fas fa-${info.icon}"></i> ${info.label}</h3>
                <p>${value}</p>
            </div>
        `;
        
        count++;
    }
    
    profileHTML += '</div>';
    
    // Set the HTML content
    profileView.innerHTML = profileHTML;
}

function goBack() {
    window.history.back();
}