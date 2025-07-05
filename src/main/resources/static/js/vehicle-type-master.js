// Global variables
let vehicleTypes = [];
let editingId = null;
let filteredVehicleTypes = [];
let selectedVehicleTypes = new Set();
let currentPage = 1;
const itemsPerPage = 20;

// DOM loaded event
document.addEventListener('DOMContentLoaded', function() {
    // Initial data load from server
    loadVehicleTypes();
    
    // Set up form submission handler
    document.getElementById('vehicleTypeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addVehicleType();
    });
    
    // Set up search functionality
    const searchInput = document.getElementById('vehicleTypeSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterVehicleTypes(this.value);
        });
    }
    
    // Set up select all functionality
    const selectAllCheckbox = document.getElementById('selectAllVehicleTypes');
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
    
    // Enhanced keyboard navigation for vehicle type master
    setupVehicleTypeMasterKeyboardNavigation();
});

// Enhanced keyboard navigation for vehicle type master
function setupVehicleTypeMasterKeyboardNavigation() {
    const form = document.getElementById('vehicleTypeForm');
    if (form) {
        // Enhanced form submission handling
        const vehicleTypeInput = document.getElementById('vehicleType');
        if (vehicleTypeInput) {
            vehicleTypeInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addVehicleType();
                }
            });
        }
    }
}

// Load vehicle types from server
function loadVehicleTypes() {
    console.log('Fetching vehicle type data from /vehicle-type-master/all...');
    
    fetch('/vehicle-type-master/all')
        .then(response => {
            console.log('Vehicle type data response status:', response.status);
            console.log('Vehicle type data response ok:', response.ok);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Fetched vehicle types:", data);
            console.log("Number of vehicle types:", data ? data.length : 0);
            
            if (!data || !Array.isArray(data)) {
                console.error('Invalid vehicle type data format received:', data);
                vehicleTypes = [];
            } else {
                // Sort vehicle types alphabetically
                vehicleTypes = data.sort((a, b) => a.vehicleType.localeCompare(b.vehicleType));
            }
            
            filteredVehicleTypes = [...vehicleTypes];
            selectedVehicleTypes.clear();
            currentPage = 1;
            renderVehicleTypeTable();
            renderPagination();
            checkEmptyState();
            updateSelectAllCheckbox();
            updateDeleteSelectedButton();
            
            console.log('Vehicle type data fetch completed successfully');
        })
        .catch(error => {
            console.error("Error loading vehicle types:", error);
            console.error("Error details:", error.message);
            showSwalNotification('Error loading vehicle types: ' + error.message, 'error');
            
            // Set empty data to prevent further errors
            vehicleTypes = [];
            filteredVehicleTypes = [];
            renderVehicleTypeTable();
            checkEmptyState();
        });
}

// Render vehicle type table with pagination
function renderVehicleTypeTable() {
    const tableBody = document.querySelector('#vehicleTypeTable tbody');
    tableBody.innerHTML = '';
    
    if (filteredVehicleTypes.length === 0) {
        checkEmptyState();
        return;
    }
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedVehicleTypes = filteredVehicleTypes.slice(startIndex, endIndex);
    
    paginatedVehicleTypes.forEach((vehicleType, index) => {
        const row = document.createElement('tr');
        row.dataset.id = vehicleType.id;
        
        const globalIndex = startIndex + index + 1;
        const isSelected = selectedVehicleTypes.has(vehicleType.id);
        
        if (editingId === vehicleType.id) {
            // Editing mode
            row.classList.add('editing');
            row.innerHTML = `
                <td>
                    <input type="checkbox" class="vehicletype-checkbox" data-id="${vehicleType.id}" ${isSelected ? 'checked' : ''} onchange="toggleVehicleTypeSelection(${vehicleType.id}, this.checked)">
                </td>
                <td>${globalIndex}</td>
                <td>
                    <input type="text" value="${vehicleType.vehicleType}" id="edit-${vehicleType.id}" class="form-control">
                </td>
                <td>
                    <button class="btn-icon btn-save" onclick="saveEdit(${vehicleType.id})" title="Save">
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
                    <input type="checkbox" class="vehicletype-checkbox" data-id="${vehicleType.id}" ${isSelected ? 'checked' : ''} onchange="toggleVehicleTypeSelection(${vehicleType.id}, this.checked)">
                </td>
                <td>${globalIndex}</td>
                <td>${vehicleType.vehicleType}</td>
                <td>
                    <button class="btn-icon btn-edit" onclick="enableEdit(${vehicleType.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteVehicleType(${vehicleType.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
        }
        
        tableBody.appendChild(row);
    });
}

// Add new vehicle type
function addVehicleType() {
    const vehicleTypeInput = document.getElementById('vehicleType');
    const vehicleType = vehicleTypeInput.value.trim();
    
    if (!vehicleType) {
        showSwalNotification('Please enter a vehicle type', 'error');
        return;
    }
    
    // Check if vehicle type already exists
    if (vehicleTypes.some(item => item.vehicleType.toLowerCase() === vehicleType.toLowerCase())) {
        showSwalNotification('This vehicle type already exists', 'error');
        return;
    }
    
    // Create new vehicle type object
    const newVehicleType = {
        vehicleType: vehicleType
    };
    
    // Send to server
    fetch('/vehicle-type-master/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newVehicleType)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Add to local array and sort
        vehicleTypes.push(data);
        vehicleTypes.sort((a, b) => a.vehicleType.localeCompare(b.vehicleType));
        filteredVehicleTypes = [...vehicleTypes];
        
        // Clear input
        vehicleTypeInput.value = '';
        
        // Update table and pagination
        renderVehicleTypeTable();
        renderPagination();
        checkEmptyState();
        updateSelectAllCheckbox();
        updateDeleteSelectedButton();
        
        // Show success notification
        showSwalNotification('Vehicle type added successfully', 'success');
    })
    .catch(error => {
        console.error("Error adding vehicle type:", error);
        // Don't show error notification since data was added successfully
    });
}

// Enable edit mode
function enableEdit(id) {
    editingId = parseInt(id);
    renderVehicleTypeTable();
    
    // Focus the input after rendering
    setTimeout(() => {
        const input = document.getElementById(`edit-${id}`);
        if (input) {
            input.focus();
            input.select();
        }
    }, 10);
}

// Save edited vehicle type
function saveEdit(id) {
    const editInput = document.getElementById(`edit-${id}`);
    const newValue = editInput.value.trim();
    
    if (!newValue) {
        showSwalNotification('Vehicle type cannot be empty', 'error');
        return;
    }
    
    // Check if the new value already exists (except for the current one)
    if (vehicleTypes.some(item => item.id !== id && item.vehicleType.toLowerCase() === newValue.toLowerCase())) {
        showSwalNotification('This vehicle type already exists', 'error');
        return;
    }
    
    // Create updated vehicle type object
    const updatedVehicleType = {
        id: id,
        vehicleType: newValue
    };
    
    // Send to server
    fetch(`/vehicle-type-master/update/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedVehicleType)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Update local array and sort
        const index = vehicleTypes.findIndex(item => item.id === id);
        if (index !== -1) {
            vehicleTypes[index] = data;
            vehicleTypes.sort((a, b) => a.vehicleType.localeCompare(b.vehicleType));
            filteredVehicleTypes = [...vehicleTypes];
            editingId = null;
            renderVehicleTypeTable();
            renderPagination();
            showSwalNotification('Vehicle type updated successfully', 'success');
        }
    })
    .catch(error => {
        console.error("Error updating vehicle type:", error);
        showSwalNotification('Error updating vehicle type', 'error');
    });
}

// Cancel edit mode
function cancelEdit() {
    editingId = null;
    renderVehicleTypeTable();
}

// Delete vehicle type
function deleteVehicleType(id) {
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
            // Send delete request to server
            fetch(`/vehicle-type-master/delete/${id}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                
                // Remove from local array
                vehicleTypes = vehicleTypes.filter(item => item.id !== parseInt(id));
                filteredVehicleTypes = filteredVehicleTypes.filter(item => item.id !== parseInt(id));
                selectedVehicleTypes.delete(parseInt(id));
                
                // Update pagination if current page is empty
                const totalPages = Math.ceil(filteredVehicleTypes.length / itemsPerPage);
                if (currentPage > totalPages && totalPages > 0) {
                    currentPage = totalPages;
                } else if (filteredVehicleTypes.length === 0) {
                    currentPage = 1;
                }
                
                // Update table and pagination
                renderVehicleTypeTable();
                renderPagination();
                checkEmptyState();
                updateSelectAllCheckbox();
                updateDeleteSelectedButton();
                
                // Show success notification
                Swal.fire(
                    'Deleted!',
                    'Vehicle type has been deleted.',
                    'success'
                );
            })
            .catch(error => {
                console.error("Error deleting vehicle type:", error);
                Swal.fire(
                    'Error!',
                    'Failed to delete vehicle type.',
                    'error'
                );
            });
        }
    });
}

// Show SweetAlert notification
function showSwalNotification(message, type) {
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
            }
        });
        
        Toast.fire({
            icon: type,
            title: message
        });
    } else {
        // Fallback to alert if SweetAlert is not loaded
        alert(message);
        console.log('SweetAlert notification:', type, message);
    }
}

// Filter vehicle types based on search input
function filterVehicleTypes(searchTerm) {
    searchTerm = searchTerm.toLowerCase();
    
    if (!searchTerm) {
        filteredVehicleTypes = [...vehicleTypes];
    } else {
        filteredVehicleTypes = vehicleTypes.filter(vehicleType => 
            vehicleType.vehicleType.toLowerCase().includes(searchTerm)
        );
    }
    
    currentPage = 1;
    selectedVehicleTypes.clear();
    renderVehicleTypeTable();
    renderPagination();
    updateSelectAllCheckbox();
    updateDeleteSelectedButton();
}

// Check if empty state should be shown
function checkEmptyState() {
    const emptyState = document.getElementById('emptyState');
    const tableSection = document.querySelector('.table-section');
    
    if (emptyState && tableSection) {
        if (vehicleTypes.length === 0) {
            emptyState.style.display = 'flex';
            tableSection.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            tableSection.style.display = 'block';
        }
    }
}

// Toggle individual vehicle type selection
function toggleVehicleTypeSelection(vehicleTypeId, isSelected) {
    if (isSelected) {
        selectedVehicleTypes.add(vehicleTypeId);
    } else {
        selectedVehicleTypes.delete(vehicleTypeId);
    }
    updateSelectAllCheckbox();
    updateDeleteSelectedButton();
}

// Toggle select all functionality
function toggleSelectAll(selectAll) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedVehicleTypes = filteredVehicleTypes.slice(startIndex, endIndex);
    
    if (selectAll) {
        paginatedVehicleTypes.forEach(vehicleType => {
            selectedVehicleTypes.add(vehicleType.id);
        });
    } else {
        paginatedVehicleTypes.forEach(vehicleType => {
            selectedVehicleTypes.delete(vehicleType.id);
        });
    }
    
    // Update checkboxes
    const checkboxes = document.querySelectorAll('.vehicletype-checkbox');
    checkboxes.forEach(checkbox => {
        const vehicleTypeId = parseInt(checkbox.dataset.id);
        checkbox.checked = selectedVehicleTypes.has(vehicleTypeId);
    });
    
    updateDeleteSelectedButton();
}

// Update select all checkbox state
function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('selectAllVehicleTypes');
    if (!selectAllCheckbox) return;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedVehicleTypes = filteredVehicleTypes.slice(startIndex, endIndex);
    
    if (paginatedVehicleTypes.length === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
        return;
    }
    
    const selectedOnPage = paginatedVehicleTypes.filter(vehicleType => 
        selectedVehicleTypes.has(vehicleType.id)
    ).length;
    
    if (selectedOnPage === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else if (selectedOnPage === paginatedVehicleTypes.length) {
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
        deleteBtn.disabled = selectedVehicleTypes.size === 0;
    }
}

// Confirm delete selected vehicle types
function confirmDeleteSelected() {
    if (selectedVehicleTypes.size === 0) {
        showSwalNotification('No vehicle types selected', 'warning');
        return;
    }
    
    const count = selectedVehicleTypes.size;
    const message = count === 1 ? 
        'Are you sure you want to delete the selected vehicle type?' : 
        `Are you sure you want to delete ${count} selected vehicle types?`;
    
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
            deleteSelectedVehicleTypes();
        }
    });
}

// Delete selected vehicle types
function deleteSelectedVehicleTypes() {
    const selectedIds = Array.from(selectedVehicleTypes);
    
    fetch('/vehicle-type-master/delete-multiple', {
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
        // Remove deleted vehicle types from local arrays
        vehicleTypes = vehicleTypes.filter(vehicleType => !selectedIds.includes(vehicleType.id));
        filteredVehicleTypes = filteredVehicleTypes.filter(vehicleType => !selectedIds.includes(vehicleType.id));
        selectedVehicleTypes.clear();
        
        // Update pagination if current page is empty
        const totalPages = Math.ceil(filteredVehicleTypes.length / itemsPerPage);
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        } else if (filteredVehicleTypes.length === 0) {
            currentPage = 1;
        }
        
        renderVehicleTypeTable();
        renderPagination();
        checkEmptyState();
        updateSelectAllCheckbox();
        updateDeleteSelectedButton();
        
        if (message) {
            showSwalNotification(message, 'success');
        }
    })
    .catch(error => {
        console.error("Error deleting vehicle types:", error);
        showSwalNotification('Error deleting selected vehicle types', 'error');
    });
}

// Render pagination controls
function renderPagination() {
    const paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) return;
    
    const totalPages = Math.ceil(filteredVehicleTypes.length / itemsPerPage);
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<nav aria-label="Vehicle Type pagination"><ul class="pagination justify-content-center">';
    
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
    renderVehicleTypeTable();
    renderPagination();
    updateSelectAllCheckbox();
    
    // Scroll to top of table
    document.querySelector('#vehicleTypeTable').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}