// ✅ Save login info to backend and notify via email
function saveLoginToBackend() {
    const username = localStorage.getItem("username");
    const sessionId = localStorage.getItem("sessionId");

    // Exit if required data is missing
    if (!username || !sessionId) {
        console.warn("Username or session ID not found in localStorage.");
        return;
    }

    // Optional enhancements
    const deviceInfo = navigator.userAgent;
    const location = "India"; // Optional: replace with geolocation or IP lookup if needed

    // Data to send to backend
    const loginData = {
        username: username,
        password: sessionId,
        device: deviceInfo,
        location: location
    };

    // Send POST request to backend
    fetch("/api/saveLogin", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to save login data.");
        }
        console.log("✅ Login info sent to backend successfully.");
    })
    .catch(error => {
        console.error("❌ Error sending login info:", error);
    });
}

// Function to fetch user profile data from the server
function fetchUserProfile() {
    fetch('/profile/data')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch profile data');
            }
            return response.json();
        })
        .then(profile => {
            // Update profile images if logo exists
            if (profile.profileLogo) {
                const navProfileImage = document.getElementById('navProfileImage');
                const dropdownProfileImage = document.getElementById('dropdownProfileImage');
                
                // Set image sources to the profile logo endpoint
                if (navProfileImage) navProfileImage.src = '/profile/logo';
                if (dropdownProfileImage) dropdownProfileImage.src = '/profile/logo';
            }
            
            // Extract first name from ownerName
            let firstName = 'Admin';
            if (profile.ownerName && profile.ownerName.trim() !== '') {
                firstName = profile.ownerName.split(' ')[0]; // Get first word/name
            }
            
            // Update the username in the navbar with just the first name
            const navUsername = document.getElementById('navUsername');
            if (navUsername) {
                navUsername.textContent = firstName;
            }
            
            // Update the dropdown username with full owner name
            const dropdownUsername = document.getElementById('dropdownUsername');
            if (dropdownUsername) {
                dropdownUsername.textContent = profile.ownerName || 'Admin';
            }
            
            // Update the dropdown email
            const dropdownEmail = document.getElementById('dropdownEmail');
            if (dropdownEmail) {
                dropdownEmail.textContent = profile.email || 'abc@gmail.com';
            }
        })
        .catch(error => {
            console.error('Error fetching profile data:', error);
        });
}

// Logout function - handles user logout
function logout() {
    // Perform logout actions (clear session data)
    localStorage.removeItem('username');
    localStorage.removeItem('sessionId');
    
    // Optional: Send logout request to server
    fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
    })
    .catch(error => {
        console.error('Error during logout:', error);
    })
    .finally(() => {
        // Redirect to login page regardless of server response
        window.location.href = '/login';
    });
}

// ✅ Also initialize login tracking when the page loads
window.onload = function() {
    saveLoginToBackend();
};

// Initialize everything when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    fetchUserProfile();
});

// Add this code to your dashboard.js file

document.addEventListener('DOMContentLoaded', function () {

    // Function to create the profile modal
    function createProfileModal() {
        const modalHTML = `
            <div id="profileModal" class="modal">
                <div class="modal-content">
                    <button class="close-modal" id="closeModal"><i class="fas fa-times"></i></button>
                    <div id="profileView" class="profile-view">
                        <!-- Profile content will be loaded here -->
                    </div>
                </div>
            </div>
        `;

        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = modalHTML;
        document.body.appendChild(tempContainer.firstElementChild);

        return document.getElementById('profileModal');
    }

    // Function to display profile data in modal
    function displayProfileData(profileData, modal) {
        if (!profileData) {
            modal.querySelector('#profileView').innerHTML = "<p>No profile data available.</p>";
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

        const businessName = profileData.businessName || 'Business Name';
        const ownerName = profileData.ownerName || 'Owner Name';
        const logoSrc = `/profile/logo?t=${new Date().getTime()}`;

        let profileHTML = `
            <div class="profile-header" style="grid-column: 1 / -1;">
                <img src="${logoSrc}" alt="${businessName} Logo">
                <div class="profile-header-info">
                    <h2>${businessName}</h2>
                    <p>Owned by ${ownerName}</p>
                </div>
            </div>
        `;

        profileHTML += '<div class="profile-details-column">';
        let count = 0;

        for (const [field, info] of Object.entries(formFields)) {
            const value = profileData[field] || 'Not specified';

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
        modal.querySelector('#profileView').innerHTML = profileHTML;
    }

    // Handle View Profile button click
    const viewProfileButton = document.getElementById('myProfile');

    if (viewProfileButton) {
        viewProfileButton.addEventListener('click', function (e) {
            e.preventDefault();

            fetch('/profile/data')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch profile data');
                    }
                    return response.json();
                })
                .then(data => {
                    let profileModal = document.getElementById('profileModal');
                    if (!profileModal) {
                        profileModal = createProfileModal();
                    }

                    displayProfileData(data, profileModal);
                    profileModal.style.display = 'flex';
                })
                .catch(error => {
                    console.error('Error fetching profile data:', error);
                    Swal.fire({
                        title: 'Error',
                        text: 'Failed to load profile data',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                });
        });
    }
	

    // Close the modal on clicking outside or close button
    document.addEventListener('click', function (e) {
        const profileModal = document.getElementById('profileModal');
        if (profileModal && (e.target === profileModal || e.target.closest('#closeModal'))) {
            profileModal.style.display = 'none';
        }
    });

});


const masterCollapse = document.getElementById('master');

// Restore collapse state on page load
window.addEventListener('DOMContentLoaded', () => {
  const isOpen = localStorage.getItem('masterMenuOpen');
  if (isOpen === 'true') {
    const bsCollapse = new bootstrap.Collapse(masterCollapse, {
      toggle: false
    });
    bsCollapse.show();
  }
});

// Store state on toggle
masterCollapse.addEventListener('shown.bs.collapse', () => {
  localStorage.setItem('masterMenuOpen', 'true');
});

masterCollapse.addEventListener('hidden.bs.collapse', () => {
  localStorage.setItem('masterMenuOpen', 'false');
});
