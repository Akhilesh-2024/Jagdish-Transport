// Global variables
let parties = [];
let editingId = null;

// DOM loaded event
document.addEventListener('DOMContentLoaded', function() {
    console.log("Party Master DOM fully loaded");
    
    // Initialize party data from backend
    fetchPartyData();
    
    // Set up form submission handler
    document.getElementById('partyMasterForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addParty();
    });
    
    // Set up search filtering for party table
    const partySearchInput = document.getElementById('partySearchInput');
    if (partySearchInput) {
        partySearchInput.addEventListener('input', function() {
            filterPartyTable(this.value);
        });
    }
    
    // Check if empty state element should be shown initially
    checkEmptyState();
});

// Fetch party data from backend
function fetchPartyData() {
    console.log("Fetching party data from backend...");
    
    fetch('/party-master/all')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch party data: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Party data received:", data);
            parties = data;
            
            // Sort parties alphabetically by company name
            parties.sort((a, b) => a.companyName.localeCompare(b.companyName));
            
            // Render party table
            renderPartyTable();
            
            // Check empty state
            checkEmptyState();
        })
        .catch(error => {
            console.error("Error fetching party data:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load party data from server',
                confirmButtonColor: '#3085d6'
            });
        });
}

// Filter party table based on search input
function filterPartyTable(searchTerm) {
    searchTerm = searchTerm.toLowerCase();
    const tableRows = document.querySelectorAll('#partyTable tbody tr');
    
    tableRows.forEach(row => {
        const partyName = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const gstNo = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
        const address = row.querySelector('td:nth-child(4)').textContent.toLowerCase();
        
        // Check if any of the fields match the search term
        if (partyName.includes(searchTerm) || 
            gstNo.includes(searchTerm) || 
            address.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Check if empty state should be shown
function checkEmptyState() {
    const emptyState = document.getElementById('emptyState');
    const tableSection = document.querySelector('.table-section');
    
    if (!emptyState || !tableSection) {
        console.error("Empty state or table section elements not found!");
        return;
    }
    
    if (parties.length === 0) {
        emptyState.style.display = 'flex';
        tableSection.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        tableSection.style.display = 'block';
    }
}

// Validate GST Number
function validateGST(gstNo) {
    // No validation - always return valid
    return {
        valid: true,
        message: 'GST number is valid'
    };
}

// Add new party with backend synchronization
function addParty() {
    const companyNameInput = document.getElementById('companyName');
    const gstNoInput = document.getElementById('gstNo');
    const addressInput = document.getElementById('address');
    
    // Get values
    const companyName = companyNameInput.value.trim();
    const gstNo = gstNoInput.value.trim().toUpperCase();
    const address = addressInput.value.trim();
    
    // Validate inputs
    if (!companyName) {
        Swal.fire({
            icon: 'warning',
            title: 'Validation Error',
            text: 'Please enter a party name',
            confirmButtonColor: '#3085d6'
        });
        return;
    }
    
    // GST number is optional - no validation needed
    
    if (!address) {
        Swal.fire({
            icon: 'warning',
            title: 'Validation Error',
            text: 'Please enter an address',
            confirmButtonColor: '#3085d6'
        });
        return;
    }
    
    // Create party object for backend
    const newParty = {
        companyName: companyName,
        gstNo: gstNo || '', // Send empty string if not provided
        address: address
    };
    
    // Send POST request to backend
    fetch('/party-master/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newParty)
    })
    .then(async response => {
        if (!response.ok) {
            // Try to get the error message from the response
            const errorText = await response.text();
            throw new Error(errorText || `Failed to save party: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Party saved successfully:', data);
        
        // Add to parties array
        parties.push(data);
        
        // Render party table
        renderPartyTable();
        
        // Check empty state
        checkEmptyState();
        
        // Reset form
        resetForm();
        
        // Show success notification
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Party added successfully',
            timer: 2000,
            showConfirmButton: false
        });
    })
    .catch(error => {
        console.error('Error saving party:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error saving party: ' + error.message,
            confirmButtonColor: '#3085d6'
        });
        
        // Log more details for debugging
        console.log('Party data that failed:', newParty);
    });
}

// Reset form
function resetForm() {
    document.getElementById('companyName').value = '';
    document.getElementById('gstNo').value = '';
    document.getElementById('address').value = '';
}

// Render party table
function renderPartyTable() {
    const tableBody = document.querySelector('#partyTable tbody');
    
    if (!tableBody) {
        console.error("Table body element not found!");
        return;
    }
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add rows for each party with serial numbers
    parties.forEach((party, index) => {
        const row = document.createElement('tr');
        row.dataset.id = party.id;
        
        if (editingId === party.id) {
            // Editing mode
            row.innerHTML = `
                <td>${index + 1}</td>
                <td><input type="text" class="edit-input" id="edit-companyName-${party.id}" value="${party.companyName}"></td>
                <td><input type="text" class="edit-input" id="edit-gstNo-${party.id}" value="${party.gstNo}"></td>
                <td><input type="text" class="edit-input" id="edit-address-${party.id}" value="${party.address}"></td>
                <td class="actions">
                    <button class="btn-icon btn-save action-btn" onclick="saveEdit(${party.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                    </button>
                    <button class="btn-icon btn-cancel action-btn" onclick="cancelEdit()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </td>
            `;
        } else {
            // Normal mode
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${party.companyName}</td>
                <td>${party.gstNo}</td>
                <td>${party.address}</td>
                <td class="actions">
                    <button class="btn-icon btn-edit action-btn" onclick="enableEdit(${party.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon btn-delete action-btn" onclick="confirmDelete(${party.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </td>
            `;
        }
        
        tableBody.appendChild(row);
    });
}

// Enable edit mode
function enableEdit(id) {
    editingId = id;
    renderPartyTable();
    
    // Focus the company name input after rendering
    setTimeout(() => {
        const companyNameInput = document.getElementById(`edit-companyName-${id}`);
        if (companyNameInput) {
            companyNameInput.focus();
        }
    }, 10);
}

// Save edited party with backend sync
function saveEdit(id) {
    // Get edited values
    const companyNameInput = document.getElementById(`edit-companyName-${id}`);
    const gstNoInput = document.getElementById(`edit-gstNo-${id}`);
    const addressInput = document.getElementById(`edit-address-${id}`);
    
    if (!companyNameInput || !gstNoInput || !addressInput) {
        console.error("One or more edit form elements not found");
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error updating party',
            confirmButtonColor: '#3085d6'
        });
        return;
    }
    
    const companyName = companyNameInput.value.trim();
    const gstNo = gstNoInput.value.trim().toUpperCase();
    const address = addressInput.value.trim();
    
    // Validate inputs
    if (!companyName) {
        Swal.fire({
            icon: 'warning',
            title: 'Validation Error',
            text: 'Please enter a party name',
            confirmButtonColor: '#3085d6'
        });
        return;
    }
    
    // GST number is optional - no validation needed
    
    if (!address) {
        Swal.fire({
            icon: 'warning',
            title: 'Validation Error',
            text: 'Please enter an address',
            confirmButtonColor: '#3085d6'
        });
        return;
    }
    
    // Create backend party object
    const updatedParty = {
        id: id,
        companyName: companyName,
        gstNo: gstNo,
        address: address
    };
    
    // Send PUT request to backend
    fetch(`/party-master/update/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedParty)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to update party: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Party updated successfully:', data);
        
        // Find party in frontend array
        const partyIndex = parties.findIndex(party => party.id === id);
        
        if (partyIndex !== -1) {
            // Update party data in frontend
            parties[partyIndex] = data;
            
            // Exit edit mode
            editingId = null;
            
            // Re-render table
            renderPartyTable();
            
            // Show success notification
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Party updated successfully',
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Party not found',
                confirmButtonColor: '#3085d6'
            });
        }
    })
    .catch(error => {
        console.error('Error updating party:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to update party on server',
            confirmButtonColor: '#3085d6'
        });
    });
}

// Cancel edit mode
function cancelEdit() {
    editingId = null;
    renderPartyTable();
}

// Confirm delete
function confirmDelete(id) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            deleteParty(id);
        }
    });
}

// Delete party with backend sync
function deleteParty(id) {
    // Send DELETE request to backend
    fetch(`/party-master/delete/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to delete party: ${response.status}`);
        }
        return response.text();
    })
    .then(data => {
        console.log('Party deleted successfully:', data);
        
        // Remove party from frontend array
        parties = parties.filter(party => party.id !== id);
        
        // Re-render table
        renderPartyTable();
        
        // Check empty state
        checkEmptyState();
        
        // Show success notification
        Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Party has been deleted successfully.',
            timer: 2000,
            showConfirmButton: false
        });
    })
    .catch(error => {
        console.error('Error deleting party:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to delete party from server',
            confirmButtonColor: '#3085d6'
        });
    });
}

// Show notification function (using SweetAlert)
function showNotification(message, type) {
    let icon = 'info';
    if (type === 'success') icon = 'success';
    if (type === 'error') icon = 'error';
    if (type === 'warning') icon = 'warning';
    
    Swal.fire({
        icon: icon,
        title: type.charAt(0).toUpperCase() + type.slice(1),
        text: message,
        timer: type === 'success' ? 2000 : undefined,
        showConfirmButton: type !== 'success'
    });
}