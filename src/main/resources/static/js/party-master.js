// Global variables
let parties = [];
let editingId = null;
let filteredParties = [];
let selectedParties = new Set();
let currentPage = 1;
const itemsPerPage = 20;

// DOM loaded event
document.addEventListener('DOMContentLoaded', function() {
    console.log("Party Master DOM fully loaded");
    
    // Initialize party data from backend
    fetchPartyData();
    
    // Form submission is handled by the onsubmit attribute in HTML
    
    // Set up search filtering for party table
    const partySearchInput = document.getElementById('partySearchInput');
    if (partySearchInput) {
        partySearchInput.addEventListener('input', function() {
            filterParties(this.value);
        });
    }
    
    // Set up select all functionality
    const selectAllCheckbox = document.getElementById('selectAllParties');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            toggleSelectAll(this.checked);
        });
    }
    
    // Set up delete selected functionality
    const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', function() {
            confirmDeleteSelected();
        });
    }
    
    // Enhanced keyboard navigation for party master
    setupPartyMasterKeyboardNavigation();
    
    // Button click is handled by the form submission since it's a submit button
});

// Enhanced keyboard navigation for party master
function setupPartyMasterKeyboardNavigation() {
    console.log('Setting up Party Master keyboard navigation');
    
    // Get the form element
    const form = document.getElementById('partyMasterForm');
    
    // Add individual field handlers for better control
    const companyNameField = document.getElementById('companyName');
    const gstNoField = document.getElementById('gstNo');
    const addressField = document.getElementById('address');
    
    // Prevent form submission on Enter key for all fields
    if (form) {
        form.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent default form submission
            }
        });
    }
    
    if (companyNameField) {
        companyNameField.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                console.log('Enter pressed on company name, moving to GST');
                if (gstNoField) {
                    gstNoField.focus();
                }
            }
        });
    }
    
    if (gstNoField) {
        gstNoField.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                console.log('Enter pressed on GST, moving to address');
                if (addressField) {
                    addressField.focus();
                }
            }
        });
    }
    
    if (addressField) {
        addressField.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                console.log('Enter pressed on address, submitting form');
                // Submit the form
                document.getElementById('partyMasterForm').dispatchEvent(new Event('submit'));
            }
        });
    }
    
    console.log('Party Master keyboard navigation setup complete');
}

// Fetch party data from backend
function fetchPartyData() {
    console.log('Fetching party data from /party-master/all...');
    
    fetch('/party-master/all')
        .then(response => {
            console.log('Party data response status:', response.status);
            console.log('Party data response ok:', response.ok);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Fetched parties:", data);
            console.log("Number of parties:", data ? data.length : 0);
            
            if (!data || !Array.isArray(data)) {
                console.error('Invalid party data format received:', data);
                parties = [];
            } else {
                parties = data.sort((a, b) => a.companyName.localeCompare(b.companyName));
            }
            
            filteredParties = [...parties];
            selectedParties.clear();
            currentPage = 1;
            renderPartyTable();
            renderPagination();
            checkEmptyState();
            updateSelectAllCheckbox();
            updateDeleteSelectedButton();
            
            console.log('Party data fetch completed successfully');
        })
        .catch(error => {
            console.error("Error fetching party data:", error);
            console.error("Error details:", error.message);
            showNotification('Error loading party data: ' + error.message, 'error');
            
            // Set empty data to prevent further errors
            parties = [];
            filteredParties = [];
            renderPartyTable();
            checkEmptyState();
        });
}

// Render party table with pagination
function renderPartyTable() {
    const tableBody = document.querySelector('#partyTable tbody');
    if (!tableBody) {
        console.error("Table body not found");
        return;
    }
    
    tableBody.innerHTML = '';
    
    if (filteredParties.length === 0) {
        checkEmptyState();
        return;
    }
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedParties = filteredParties.slice(startIndex, endIndex);
    
    paginatedParties.forEach((party, index) => {
        const row = document.createElement('tr');
        row.dataset.id = party.id;
        
        const globalIndex = startIndex + index + 1;
        const isSelected = selectedParties.has(party.id);
        
        if (editingId === party.id) {
            // Editing mode
            row.classList.add('editing');
            row.innerHTML = `
                <td>
                    <input type="checkbox" class="party-checkbox" data-id="${party.id}" ${isSelected ? 'checked' : ''} onchange="togglePartySelection(${party.id}, this.checked)">
                </td>
                <td>${globalIndex}</td>
                <td>
                    <input type="text" value="${party.companyName}" id="edit-companyName-${party.id}" class="form-control">
                </td>
                <td>
                    <input type="text" value="${party.gstNo || ''}" id="edit-gstNo-${party.id}" class="form-control">
                </td>
                <td>
                    <textarea id="edit-address-${party.id}" class="form-control">${party.address || ''}</textarea>
                </td>
                <td>
                    <button class="btn-icon btn-save" onclick="saveEdit(${party.id})" title="Save">
                        <i class="fas fa-save"></i>
                    </button>
                    <button class="btn-icon btn-cancel" onclick="cancelEdit()" title="Cancel">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            `;
        } else {
            // Normal mode
            row.innerHTML = `
                <td>
                    <input type="checkbox" class="party-checkbox" data-id="${party.id}" ${isSelected ? 'checked' : ''} onchange="togglePartySelection(${party.id}, this.checked)">
                </td>
                <td>${globalIndex}</td>
                <td>${party.companyName}</td>
                <td>${party.gstNo || ''}</td>
                <td>${party.address || ''}</td>
                <td>
                    <button class="btn-icon btn-edit" onclick="enableEdit(${party.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteParty(${party.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
        }
        
        tableBody.appendChild(row);
    });
}

// Add new party
// Validation functions
function validateCompanyName(name) {
    if (!name || name.trim() === '') {
        return { valid: false, message: 'Company name is required' };
    }
    
    if (name.trim().length < 2) {
        return { valid: false, message: 'Company name must be at least 2 characters' };
    }
    
    // Check for invalid characters
    const invalidCharsRegex = /[^\w\s&.,'-]/;
    if (invalidCharsRegex.test(name)) {
        return { valid: false, message: 'Company name contains invalid characters' };
    }
    
    return { valid: true };
}

function validateAddress(address) {
    if (!address || address.trim() === '') {
        return { valid: false, message: 'Address is required' };
    }
    
    if (address.trim().length < 5) {
        return { valid: false, message: 'Address must be at least 5 characters' };
    }
    
    return { valid: true };
}

// Validate GST number format
function validateGSTNumber(gstNo) {
    console.log('Validating GST number:', gstNo);
    
    // If empty, it's valid (system will generate one)
    if (!gstNo || gstNo.trim() === '') {
        console.log('GST number is empty, valid');
        return { valid: true };
    }
    
    // If it starts with "NA-", it's a system-generated one, so it's valid
    if (gstNo.startsWith('NA-')) {
        console.log('GST number is system-generated, valid');
        return { valid: true };
    }
    
    // Indian GST format: 2 chars state code + 10 chars PAN + 1 char entity number + 1 char check digit + Z
    // Example: 27AAPFU0939F1ZV
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    
    // If it's a numeric-only GST, it should be at least 5 digits
    if (/^\d+$/.test(gstNo)) {
        if (gstNo.length < 5) {
            return { valid: false, message: 'Numeric GST number must be at least 5 digits' };
        }
        return { valid: true };
    }
    
    // If it's a proper GST format, validate it
    if (gstRegex.test(gstNo)) {
        return { valid: true };
    }
    
    // For now, we'll accept other formats to be flexible, but warn the user
    console.log('GST number format is non-standard but accepted');
    return { valid: true, warning: 'GST number format is non-standard' };
}

// Check if GST number exists on the server
async function checkGSTNumberExists(gstNo) {
    if (!gstNo || gstNo.trim() === '') {
        return false; // Empty GST numbers don't exist
    }
    
    try {
        const response = await fetch(`/party-master/check-gst?gstNo=${encodeURIComponent(gstNo)}`);
        const data = await response.json();
        console.log('GST check response:', data);
        return data.exists;
    } catch (error) {
        console.error('Error checking GST number:', error);
        return false; // Assume it doesn't exist if there's an error
    }
}

async function addParty() {
    console.log('AddParty function called');
    
    // Get form elements safely
    const companyNameElement = document.getElementById('companyName');
    const gstNoElement = document.getElementById('gstNo');
    const addressElement = document.getElementById('address');
    
    if (!companyNameElement || !gstNoElement || !addressElement) {
        console.error('Some form elements are missing!');
        showNotification('Form error: Missing required elements', 'error');
        return;
    }
    
    const companyName = companyNameElement.value.trim();
    const gstNo = gstNoElement.value.trim();
    const address = addressElement.value.trim();
    
    console.log('Form values:', { companyName, gstNo, address });
    
    // Validate company name
    const companyNameValidation = validateCompanyName(companyName);
    if (!companyNameValidation.valid) {
        showNotification(companyNameValidation.message, 'error');
        companyNameElement.focus();
        return;
    }
    
    // Validate address
    const addressValidation = validateAddress(address);
    if (!addressValidation.valid) {
        showNotification(addressValidation.message, 'error');
        addressElement.focus();
        return;
    }
    
    // Validate GST number if provided
    if (gstNo && gstNo.trim() !== '') {
        const gstValidation = validateGSTNumber(gstNo);
        if (!gstValidation.valid) {
            showNotification(gstValidation.message, 'error');
            gstNoElement.focus();
            gstNoElement.select();
            return;
        }
        
        // Show warning if GST format is non-standard
        if (gstValidation.warning) {
            console.warn(gstValidation.warning);
        }
    }
    
    // Check if company already exists
    if (parties.some(party => party.companyName.toLowerCase() === companyName.toLowerCase())) {
        showNotification('This company already exists', 'error');
        companyNameElement.focus();
        return;
    }
    
    // Check if GST number exists on the server (if provided)
    if (gstNo && gstNo.trim() !== '') {
        try {
            const exists = await checkGSTNumberExists(gstNo);
            if (exists) {
                showNotification(`GST number '${gstNo}' already exists. Please use a different GST number.`, 'error');
                gstNoElement.focus();
                gstNoElement.select();
                return;
            }
        } catch (error) {
            console.error('Error checking GST number:', error);
            // Continue with submission even if check fails
        }
    }
    
    // Create the party object
    const newParty = {
        companyName: companyName,
        address: address
    };
    
    // Only include GST if it's not empty
    if (gstNo && gstNo.trim() !== '') {
        newParty.gstNo = gstNo;
        console.log('Including GST number in request:', gstNo);
    } else {
        console.log('GST number is empty, will be generated by server');
        // Explicitly set to null to ensure it's handled properly
        newParty.gstNo = null;
    }
    
    try {
        console.log('Sending party data to server:', JSON.stringify(newParty));
        
        const response = await fetch('/party-master/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newParty)
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            // Try to get the error message from the response
            const errorText = await response.text();
            console.log('Error response text:', errorText);
            throw new Error(errorText || 'Network response was not ok');
        }
        
        const data = await response.json();
        console.log('Party added successfully:', data);
        
        // Add to local array
        parties.push(data);
        parties.sort((a, b) => a.companyName.localeCompare(b.companyName));
        filteredParties = [...parties];
        
        // Clear form
        document.getElementById('partyMasterForm').reset();
        
        // Update UI
        renderPartyTable();
        renderPagination();
        checkEmptyState();
        updateSelectAllCheckbox();
        updateDeleteSelectedButton();
        
        // Show success message
        showNotification('Party added successfully', 'success');
        
        return data; // Return the added party
        
    } catch (error) {
        console.error("Error adding party:", error);
        
        // Extract the error message
        let errorMessage = 'Error adding party';
        if (error.message) {
            console.log('Error message:', error.message);
            
            // Try to parse the error message if it's JSON
            try {
                const errorObj = JSON.parse(error.message);
                console.log('Parsed error object:', errorObj);
                errorMessage = errorObj.message || errorObj || error.message;
            } catch (e) {
                // If not JSON, use the error message directly
                console.log('Error message is not JSON');
                errorMessage = error.message;
            }
            
            // Clean up the error message if it contains SQL details
            if (errorMessage.includes('could not execute statement')) {
                console.log('SQL error detected');
                if (errorMessage.includes('Duplicate entry') && errorMessage.includes('gst_no')) {
                    errorMessage = 'GST number already exists. Please use a different GST number.';
                }
            }
        }
        
        console.log('Final error message:', errorMessage);
        showNotification(errorMessage, 'error');
        
        // Focus on the GST field if it's a GST error
        if (errorMessage.toLowerCase().includes('gst')) {
            const gstField = document.getElementById('gstNo');
            if (gstField) {
                gstField.focus();
                gstField.select(); // Select the text for easy editing
                
                // Clear the GST field to allow the user to enter a new one
                gstField.value = '';
            }
        }
        
        throw error; // Re-throw to be handled by caller
    }
}

// Enable edit mode
function enableEdit(id) {
    editingId = parseInt(id);
    renderPartyTable();
    
    // Focus the first input after rendering
    setTimeout(() => {
        const input = document.getElementById(`edit-companyName-${id}`);
        if (input) {
            input.focus();
            input.select();
        }
    }, 10);
}

// Save edited party
function saveEdit(id) {
    const companyName = document.getElementById(`edit-companyName-${id}`).value.trim();
    const gstNo = document.getElementById(`edit-gstNo-${id}`).value.trim();
    const address = document.getElementById(`edit-address-${id}`).value.trim();
    
    if (!companyName) {
        showNotification('Company name cannot be empty', 'error');
        return;
    }
    
    // Check if the new company name already exists (except for the current one)
    if (parties.some(party => party.id !== id && party.companyName.toLowerCase() === companyName.toLowerCase())) {
        showNotification('This company already exists', 'error');
        return;
    }
    
    const updatedParty = {
        id: id,
        companyName: companyName,
        gstNo: gstNo,
        address: address
    };
    
    fetch(`/party-master/update/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedParty)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const index = parties.findIndex(party => party.id === id);
        if (index !== -1) {
            parties[index] = data;
            parties.sort((a, b) => a.companyName.localeCompare(b.companyName));
            filteredParties = [...parties];
            editingId = null;
            renderPartyTable();
            renderPagination();
            showNotification('Party updated successfully', 'success');
        }
    })
    .catch(error => {
        console.error("Error updating party:", error);
        showNotification('Error updating party', 'error');
    });
}

// Cancel edit mode
function cancelEdit() {
    editingId = null;
    renderPartyTable();
}

// Delete party
function deleteParty(id) {
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
            fetch(`/party-master/delete/${id}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                
                parties = parties.filter(party => party.id !== parseInt(id));
                filteredParties = filteredParties.filter(party => party.id !== parseInt(id));
                selectedParties.delete(parseInt(id));
                
                // Update pagination if current page is empty
                const totalPages = Math.ceil(filteredParties.length / itemsPerPage);
                if (currentPage > totalPages && totalPages > 0) {
                    currentPage = totalPages;
                } else if (filteredParties.length === 0) {
                    currentPage = 1;
                }
                
                renderPartyTable();
                renderPagination();
                checkEmptyState();
                updateSelectAllCheckbox();
                updateDeleteSelectedButton();
                
                Swal.fire('Deleted!', 'Party has been deleted.', 'success');
            })
            .catch(error => {
                console.error("Error deleting party:", error);
                Swal.fire('Error!', 'Failed to delete party.', 'error');
            });
        }
    });
}

// Filter parties based on search input
function filterParties(searchTerm) {
    searchTerm = searchTerm.toLowerCase();
    
    if (!searchTerm) {
        filteredParties = [...parties];
    } else {
        filteredParties = parties.filter(party => 
            party.companyName.toLowerCase().includes(searchTerm) ||
            (party.gstNo && party.gstNo.toLowerCase().includes(searchTerm)) ||
            (party.address && party.address.toLowerCase().includes(searchTerm))
        );
    }
    
    currentPage = 1;
    selectedParties.clear();
    renderPartyTable();
    renderPagination();
    updateSelectAllCheckbox();
    updateDeleteSelectedButton();
}

// Check if empty state should be shown
function checkEmptyState() {
    const emptyState = document.getElementById('emptyState');
    const tableSection = document.querySelector('.table-section');
    
    if (emptyState && tableSection) {
        if (parties.length === 0) {
            emptyState.style.display = 'flex';
            tableSection.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            tableSection.style.display = 'block';
        }
    }
}

// Toggle individual party selection
function togglePartySelection(partyId, isSelected) {
    if (isSelected) {
        selectedParties.add(partyId);
    } else {
        selectedParties.delete(partyId);
    }
    updateSelectAllCheckbox();
    updateDeleteSelectedButton();
}

// Toggle select all functionality
function toggleSelectAll(selectAll) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedParties = filteredParties.slice(startIndex, endIndex);
    
    if (selectAll) {
        paginatedParties.forEach(party => {
            selectedParties.add(party.id);
        });
    } else {
        paginatedParties.forEach(party => {
            selectedParties.delete(party.id);
        });
    }
    
    // Update checkboxes
    const checkboxes = document.querySelectorAll('.party-checkbox');
    checkboxes.forEach(checkbox => {
        const partyId = parseInt(checkbox.dataset.id);
        checkbox.checked = selectedParties.has(partyId);
    });
    
    updateDeleteSelectedButton();
}

// Update select all checkbox state
function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('selectAllParties');
    if (!selectAllCheckbox) return;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedParties = filteredParties.slice(startIndex, endIndex);
    
    if (paginatedParties.length === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
        return;
    }
    
    const selectedOnPage = paginatedParties.filter(party => 
        selectedParties.has(party.id)
    ).length;
    
    if (selectedOnPage === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else if (selectedOnPage === paginatedParties.length) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
    } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
    }
}

// Update delete selected button state
function updateDeleteSelectedButton() {
    const deleteBtn = document.getElementById('deleteSelectedBtn');
    if (deleteBtn) {
        deleteBtn.disabled = selectedParties.size === 0;
    }
}

// Confirm delete selected parties
function confirmDeleteSelected() {
    if (selectedParties.size === 0) {
        showNotification('No parties selected', 'warning');
        return;
    }
    
    const count = selectedParties.size;
    const message = count === 1 ? 
        'Are you sure you want to delete the selected party?' : 
        `Are you sure you want to delete ${count} selected parties?`;
    
    Swal.fire({
        title: 'Are you sure?',
        text: message,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete them!'
    }).then((result) => {
        if (result.isConfirmed) {
            deleteSelectedParties();
        }
    });
}

// Delete selected parties
function deleteSelectedParties() {
    const selectedIds = Array.from(selectedParties);
    
    fetch('/party-master/delete-multiple', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedIds)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(message => {
        parties = parties.filter(party => !selectedIds.includes(party.id));
        filteredParties = filteredParties.filter(party => !selectedIds.includes(party.id));
        selectedParties.clear();
        
        // Update pagination if current page is empty
        const totalPages = Math.ceil(filteredParties.length / itemsPerPage);
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        } else if (filteredParties.length === 0) {
            currentPage = 1;
        }
        
        renderPartyTable();
        renderPagination();
        checkEmptyState();
        updateSelectAllCheckbox();
        updateDeleteSelectedButton();
        
        if (message) {
            showNotification(message, 'success');
        }
    })
    .catch(error => {
        console.error("Error deleting parties:", error);
        showNotification('Error deleting selected parties', 'error');
    });
}

// Render pagination controls
function renderPagination() {
    const paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) return;
    
    const totalPages = Math.ceil(filteredParties.length / itemsPerPage);
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<nav aria-label="Party pagination"><ul class="pagination justify-content-center">';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<li class="page-item">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1})" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>`;
    } else {
        paginationHTML += `<li class="page-item disabled">
            <span class="page-link" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
            </span>
        </li>`;
    }
    
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Add first page and ellipsis if needed
    if (startPage > 1) {
        paginationHTML += `<li class="page-item">
            <a class="page-link" href="#" onclick="changePage(1)">1</a>
        </li>`;
        if (startPage > 2) {
            paginationHTML += `<li class="page-item disabled">
                <span class="page-link">...</span>
            </li>`;
        }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            paginationHTML += `<li class="page-item active">
                <span class="page-link">${i}</span>
            </li>`;
        } else {
            paginationHTML += `<li class="page-item">
                <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
            </li>`;
        }
    }
    
    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<li class="page-item disabled">
                <span class="page-link">...</span>
            </li>`;
        }
        paginationHTML += `<li class="page-item">
            <a class="page-link" href="#" onclick="changePage(${totalPages})">${totalPages}</a>
        </li>`;
    }
    
    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<li class="page-item">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1})" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>`;
    } else {
        paginationHTML += `<li class="page-item disabled">
            <span class="page-link" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
                </span>
        </li>`;
    }
    
    paginationHTML += '</ul></nav>';
    paginationContainer.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    currentPage = page;
    renderPartyTable();
    renderPagination();
    updateSelectAllCheckbox();
    
    // Scroll to top of table
    document.querySelector('#partyTable').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}

// Track active notifications to prevent duplicates
let activeNotification = null;

// Show notification
function showNotification(message, type) {
    console.log('Showing notification:', type, message);
    
    // If there's an active notification, close it first
    if (activeNotification) {
        console.log('Closing previous notification');
        if (typeof Swal !== 'undefined') {
            Swal.close();
        }
        activeNotification = null;
    }
    
    // Check if SweetAlert is available
    if (typeof Swal !== 'undefined') {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            },
            didClose: () => {
                activeNotification = null;
                console.log('Notification closed');
            }
        });
        
        activeNotification = Toast.fire({
            icon: type,
            title: message
        });
    } else {
        // Fallback to alert if SweetAlert is not loaded
        alert(message);
        console.log('Party Master notification:', type, message);
        activeNotification = null;
    }
}