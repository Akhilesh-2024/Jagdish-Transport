// Global variables
let vehicles = [];
let editingId = null;
let filteredVehicles = [];
let selectedVehicles = new Set();
let currentPage = 1;
const itemsPerPage = 20;

// DOM loaded event
document.addEventListener('DOMContentLoaded', function() {
    // Initial data load from server
    loadVehicles();
    
    // Set up form input handler for live uppercase conversion
    const vehicleNumberInput = document.getElementById('vehicleNumber');
    vehicleNumberInput.addEventListener('input', function() {
        this.value = this.value.toUpperCase();
    });
    
    // Set up form submission handler
    document.getElementById('vehicleMasterForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addVehicle();
    });
    
    // Set up search functionality
    const searchInput = document.getElementById('vehicleSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterVehicles(this.value);
        });
    }
    
    // Set up select all functionality
    const selectAllCheckbox = document.getElementById('selectAllVehicles');
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
    
    // Check if empty state element should be shown initially
    checkEmptyState();
    
    // Setup WebSocket connection for live updates
    setupWebSocket();
});

// WebSocket setup for live updates
function setupWebSocket() {
    // Check if SockJS and Stomp are available
    if (typeof SockJS !== 'undefined' && typeof Stomp !== 'undefined') {
        const socket = new SockJS('/websocket');
        const stompClient = Stomp.over(socket);
        
        stompClient.connect({}, function(frame) {
            console.log('Connected to WebSocket: ' + frame);
            
            // Subscribe to vehicle updates
            stompClient.subscribe('/topic/vehicles', function(message) {
                const action = JSON.parse(message.body);
                
                switch(action.type) {
                    case 'ADD':
                        // Add new vehicle to local array if not already there
                        if (!vehicles.some(v => v.id === action.vehicle.id)) {
                            vehicles.push(action.vehicle);
                        }
                        break;
                    case 'UPDATE':
                        // Update existing vehicle in local array
                        const updateIndex = vehicles.findIndex(v => v.id === action.vehicle.id);
                        if (updateIndex !== -1) {
                            vehicles[updateIndex] = action.vehicle;
                        }
                        break;
                    case 'DELETE':
                        // Remove vehicle from local array
                        vehicles = vehicles.filter(v => v.id !== action.id);
                        break;
                }
                
                // Update filtered vehicles and re-render table with updated data
                applyCurrentFilter();
                renderVehicleTable();
                renderPagination();
                checkEmptyState();
                updateSelectAllCheckbox();
                updateDeleteSelectedButton();
                
                // If we were editing the item that got updated by someone else, exit edit mode
                if (editingId && (action.type === 'UPDATE' || action.type === 'DELETE') && 
                    (action.id === editingId || action.vehicle?.id === editingId)) {
                    editingId = null;
                }
            });
        }, function(error) {
            console.error('WebSocket connection error:', error);
            // Fallback to polling if WebSocket fails
            setInterval(loadVehicles, 15000); // Use 15 seconds instead of 5 seconds
        });
    } else {
        console.warn('WebSocket libraries not available, falling back to polling');
        setInterval(function() {
            // Only poll if not currently editing
            if (!editingId) {
                loadVehicles();
            }
        }, 15000); // Use 15 seconds instead of 5 seconds
    }
}

// Check if empty state should be shown
function checkEmptyState() {
    const emptyState = document.getElementById('emptyState');
    const tableSection = document.querySelector('.table-section');
    
    if (emptyState && tableSection) {
        if (vehicles.length === 0) {
            emptyState.style.display = 'flex';
            tableSection.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            tableSection.style.display = 'block';
        }
    }
}

// Load vehicles from server
function loadVehicles() {
    fetch('/vehicle-master/all')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Sort vehicles alphabetically by vehicle number
            vehicles = data.sort((a, b) => a.vehicleNumber.localeCompare(b.vehicleNumber));
            filteredVehicles = [...vehicles];
            selectedVehicles.clear();
            currentPage = 1;
            renderVehicleTable();
            renderPagination();
            checkEmptyState();
            updateSelectAllCheckbox();
            updateDeleteSelectedButton();
        })
        .catch(error => {
            console.error("Error loading vehicles:", error);
            showNotification('Error loading vehicles', 'error');
        });
}

// Render vehicle table with pagination
function renderVehicleTable() {
    const tableBody = document.querySelector('#vehicleTable tbody');
    // Clear existing rows
    tableBody.innerHTML = '';
    
    if (filteredVehicles.length === 0) {
        checkEmptyState();
        return;
    }
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex);
    
    paginatedVehicles.forEach((vehicle, index) => {
        const row = document.createElement('tr');
        row.dataset.id = vehicle.id;
        
        const globalIndex = startIndex + index + 1;
        const isSelected = selectedVehicles.has(vehicle.id);
        
        if (editingId === vehicle.id) {
            // Editing mode
            row.classList.add('editing');
            row.innerHTML = `
                <td>
                    <input type="checkbox" class="vehicle-checkbox" data-id="${vehicle.id}" ${isSelected ? 'checked' : ''} onchange="toggleVehicleSelection(${vehicle.id}, this.checked)">
                </td>
                <td>${globalIndex}</td>
                <td>
                    <input type="text" value="${vehicle.vehicleNumber}" id="edit-${vehicle.id}" class="form-control" oninput="this.value = this.value.toUpperCase()">
                </td>
                <td>
                    <button class="btn-icon btn-save" onclick="saveEdit(${vehicle.id})" title="Save">
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
                    <input type="checkbox" class="vehicle-checkbox" data-id="${vehicle.id}" ${isSelected ? 'checked' : ''} onchange="toggleVehicleSelection(${vehicle.id}, this.checked)">
                </td>
                <td>${globalIndex}</td>
                <td>${vehicle.vehicleNumber}</td>
                <td>
                    <button onclick="enableEdit(${vehicle.id})" class="btn-icon btn-edit" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="confirmDelete(${vehicle.id})" class="btn-icon btn-delete" title="Delete">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
        }
        
        tableBody.appendChild(row);
    });
}

// Add new vehicle
function addVehicle() {
    const vehicleNumberInput = document.getElementById('vehicleNumber');
    const vehicleNumber = vehicleNumberInput.value.trim();
    
    if (!vehicleNumber) {
        showNotification('Please enter a vehicle number', 'error');
        return;
    }
    
    // Validate vehicle number format (optional)
    if (!/^[A-Z0-9\s-]+$/.test(vehicleNumber)) {
        showNotification('Vehicle number should only contain letters, numbers, spaces, and hyphens', 'error');
        return;
    }
    
    // Check if vehicle number already exists
    if (vehicles.some(item => item.vehicleNumber.toLowerCase() === vehicleNumber.toLowerCase())) {
        showNotification('This vehicle number already exists', 'error');
        return;
    }
    
    // Create new vehicle object
    const newVehicle = {
        vehicleNumber: vehicleNumber
    };
    
    // Send to server
    fetch('/vehicle-master/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newVehicle)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Add the new vehicle to our local array immediately
        vehicles.push(data);
        
        // Update filtered vehicles and re-render
        applyCurrentFilter();
        renderVehicleTable();
        renderPagination();
        checkEmptyState();
        updateSelectAllCheckbox();
        updateDeleteSelectedButton();
        
        // Clear input
        vehicleNumberInput.value = '';
        
        // Focus back to input field for next entry
        vehicleNumberInput.focus();
        
        // Show success notification
        showNotification('Vehicle added successfully', 'success');
    })
    .catch(error => {
        console.error("Error adding vehicle:", error);
        showNotification('Error adding vehicle', 'error');
    });
}

// Enable edit mode
function enableEdit(id) {
    // Clear any existing edit timeout
    if (window.editTimeoutId) {
        clearTimeout(window.editTimeoutId);
        window.editTimeoutId = null;
    }
    
    editingId = parseInt(id);
    renderVehicleTable();
    
    // Focus the input after rendering
    setTimeout(() => {
        const input = document.getElementById(`edit-${id}`);
        if (input) {
            input.focus();
            input.select();
            
            // Add keyboard event listener for Enter key
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    saveEdit(id);
                }
                
                // Reset the auto-save timer on each keystroke
                if (window.editTimeoutId) {
                    clearTimeout(window.editTimeoutId);
                }
            });
            
            // Add click event listener to the document to detect clicks outside the edit field
            document.addEventListener('click', function handleClickOutside(event) {
                // If we're still in edit mode and the click is outside the editing row
                if (editingId === id && !event.target.closest(`tr[data-id="${id}"]`)) {
                    // Remove this event listener
                    document.removeEventListener('click', handleClickOutside);
                    // Save the edit
                    saveEdit(id);
                }
            });
        }
    }, 10);
}

// Save edited vehicle
function saveEdit(id) {
    // Clear any existing edit timeout
    if (window.editTimeoutId) {
        clearTimeout(window.editTimeoutId);
        window.editTimeoutId = null;
    }
    
    console.log("Saving edit for vehicle ID:", id);
    const editInput = document.getElementById(`edit-${id}`);
    
    // If the input element doesn't exist anymore, abort the save
    if (!editInput) {
        console.warn("Edit input element not found, aborting save");
        editingId = null;
        return;
    }
    
    const newValue = editInput.value.trim();
    
    if (!newValue) {
        showNotification('Vehicle number cannot be empty', 'error');
        return;
    }
    
    // Validate vehicle number format (optional)
    if (!/^[A-Z0-9\s-]+$/.test(newValue)) {
        showNotification('Vehicle number should only contain letters, numbers, spaces, and hyphens', 'error');
        return;
    }
    
    // Check if the new value already exists (except for the current one)
    if (vehicles.some(item => item.id !== id && item.vehicleNumber.toLowerCase() === newValue.toLowerCase())) {
        showNotification('This vehicle number already exists', 'error');
        return;
    }
    
    // Create updated vehicle object
    const updatedVehicle = {
        id: id,
        vehicleNumber: newValue
    };
    
    // Send to server
    fetch(`/vehicle-master/update/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedVehicle)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Update the vehicle in our local array immediately
        const vehicleIndex = vehicles.findIndex(v => v.id === id);
        
        if (vehicleIndex !== -1) {
            vehicles[vehicleIndex] = data;
        }
        
        // Exit edit mode
        editingId = null;
        
        // Update filtered vehicles and re-render
        applyCurrentFilter();
        renderVehicleTable();
        renderPagination();
        updateSelectAllCheckbox();
        updateDeleteSelectedButton();
        
        // Show success notification
        showNotification('Vehicle updated successfully', 'success');
    })
    .catch(error => {
        console.error("Error updating vehicle:", error);
        // Show more detailed error message
        showNotification(`Error updating vehicle: ${error.message}`, 'error');
        
        // Don't exit edit mode on error so user can try again
        // Just re-render to ensure UI is consistent
        renderVehicleTable();
    });
}

// Cancel edit mode
function cancelEdit() {
    // Clear any existing edit timeout
    if (window.editTimeoutId) {
        clearTimeout(window.editTimeoutId);
        window.editTimeoutId = null;
    }
    
    editingId = null;
    renderVehicleTable();
}

// Confirm delete with SweetAlert
function confirmDelete(id) {
    // Check if SweetAlert is available
    if (typeof Swal !== 'undefined') {
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
                deleteVehicle(id);
            }
        });
    } else {
        // Fallback to regular confirm if SweetAlert is not available
        if (confirm('Are you sure you want to delete this vehicle?')) {
            deleteVehicle(id);
        }
    }
}

// Delete vehicle
function deleteVehicle(id) {
    // Send delete request to server
    fetch(`/vehicle-master/delete/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        // Remove the vehicle from our local array immediately
        vehicles = vehicles.filter(v => v.id !== id);
        selectedVehicles.delete(id);
        
        // Update filtered vehicles and re-render
        applyCurrentFilter();
        renderVehicleTable();
        renderPagination();
        checkEmptyState();
        updateSelectAllCheckbox();
        updateDeleteSelectedButton();
        
        // Show success notification with SweetAlert if available
        if (typeof Swal !== 'undefined') {
            Swal.fire(
                'Deleted!',
                'Vehicle has been deleted.',
                'success'
            );
        } else {
            // Fallback to regular notification
            showNotification('Vehicle deleted successfully', 'success');
        }
    })
    .catch(error => {
        console.error("Error deleting vehicle:", error);
        showNotification('Error deleting vehicle', 'error');
    });
}

// Filter vehicles based on search input
function filterVehicles(searchTerm) {
    searchTerm = searchTerm.toLowerCase();
    
    if (!searchTerm) {
        filteredVehicles = [...vehicles];
    } else {
        filteredVehicles = vehicles.filter(vehicle => 
            vehicle.vehicleNumber.toLowerCase().includes(searchTerm)
        );
    }
    
    currentPage = 1;
    renderVehicleTable();
    renderPagination();
    updateSelectAllCheckbox();
    updateDeleteSelectedButton();
}

// Apply current filter (used after data updates)
function applyCurrentFilter() {
    const searchInput = document.getElementById('vehicleSearchInput');
    const searchTerm = searchInput ? searchInput.value : '';
    filterVehicles(searchTerm);
}

// Show notification
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');
    
    if (!notification || !notificationMessage) {
        console.error('Notification elements not found');
        return;
    }
    
    const icon = notification.querySelector('i.fas');
    
    // Set the message
    notificationMessage.textContent = message;
    
    // Set appropriate icon and class based on type
    notification.className = 'notification';
    notification.classList.add(type);
    
    // Update icon if it exists
    if (icon) {
        icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    }
    
    // Show notification
    notification.classList.add('show');
    
    // Auto-hide after 3 seconds
    setTimeout(hideNotification, 3000);
}

// Hide notification
function hideNotification() {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.classList.remove('show');
    }
}

// Toggle individual vehicle selection
function toggleVehicleSelection(vehicleId, isSelected) {
    if (isSelected) {
        selectedVehicles.add(vehicleId);
    } else {
        selectedVehicles.delete(vehicleId);
    }
    updateSelectAllCheckbox();
    updateDeleteSelectedButton();
}

// Toggle select all vehicles
function toggleSelectAll(selectAll) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex);
    
    if (selectAll) {
        paginatedVehicles.forEach(vehicle => selectedVehicles.add(vehicle.id));
    } else {
        paginatedVehicles.forEach(vehicle => selectedVehicles.delete(vehicle.id));
    }
    
    // Update checkboxes in the current page
    const checkboxes = document.querySelectorAll('.vehicle-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll;
    });
    
    updateDeleteSelectedButton();
}

// Update select all checkbox state
function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('selectAllVehicles');
    if (!selectAllCheckbox) return;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex);
    
    if (paginatedVehicles.length === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
        return;
    }
    
    const selectedInPage = paginatedVehicles.filter(vehicle => selectedVehicles.has(vehicle.id));
    
    if (selectedInPage.length === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else if (selectedInPage.length === paginatedVehicles.length) {
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
    if (!deleteBtn) return;
    
    const selectedCount = selectedVehicles.size;
    if (selectedCount > 0) {
        deleteBtn.disabled = false;
        deleteBtn.textContent = `Delete Selected (${selectedCount})`;
    } else {
        deleteBtn.disabled = true;
        deleteBtn.textContent = 'Delete Selected';
    }
}

// Confirm delete selected vehicles
function confirmDeleteSelected() {
    if (selectedVehicles.size === 0) {
        showNotification('No vehicles selected', 'error');
        return;
    }
    
    const selectedCount = selectedVehicles.size;
    const message = `Are you sure you want to delete ${selectedCount} selected vehicle${selectedCount > 1 ? 's' : ''}?`;
    
    // Check if SweetAlert is available
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Are you sure?',
            text: message,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: `Yes, delete ${selectedCount > 1 ? 'them' : 'it'}!`
        }).then((result) => {
            if (result.isConfirmed) {
                deleteSelectedVehicles();
            }
        });
    } else {
        // Fallback to regular confirm if SweetAlert is not available
        if (confirm(message)) {
            deleteSelectedVehicles();
        }
    }
}

// Delete selected vehicles
function deleteSelectedVehicles() {
    const vehicleIds = Array.from(selectedVehicles);
    
    if (vehicleIds.length === 0) {
        return;
    }
    
    // Send delete request to server
    fetch('/vehicle-master/delete-multiple', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(vehicleIds)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        // Remove the vehicles from our local array immediately
        vehicles = vehicles.filter(v => !vehicleIds.includes(v.id));
        selectedVehicles.clear();
        
        // Update filtered vehicles and re-render
        applyCurrentFilter();
        renderVehicleTable();
        renderPagination();
        checkEmptyState();
        updateSelectAllCheckbox();
        updateDeleteSelectedButton();
        
        // Show success notification
        const deletedCount = vehicleIds.length;
        const message = `${deletedCount} vehicle${deletedCount > 1 ? 's' : ''} deleted successfully`;
        
        if (typeof Swal !== 'undefined') {
            Swal.fire(
                'Deleted!',
                message,
                'success'
            );
        } else {
            showNotification(message, 'success');
        }
    })
    .catch(error => {
        console.error("Error deleting vehicles:", error);
        showNotification('Error deleting selected vehicles', 'error');
    });
}

// Render pagination controls
function renderPagination() {
    const paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) return;
    
    const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<nav aria-label="Vehicle pagination"><ul class="pagination justify-content-center">';
    
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
    
    // Add last page and ellipsis if needed
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
    
    // Add pagination info
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, filteredVehicles.length);
    const totalItems = filteredVehicles.length;
    
    paginationHTML += `<div class="pagination-info text-center mt-2">
        <small class="text-muted">
            Showing ${startItem} to ${endItem} of ${totalItems} vehicles
        </small>
    </div>`;
    
    paginationContainer.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
    
    if (page < 1 || page > totalPages) {
        return;
    }
    
    currentPage = page;
    renderVehicleTable();
    renderPagination();
    updateSelectAllCheckbox();
    
    // Scroll to top of table
    const tableContainer = document.querySelector('.table-section');
    if (tableContainer) {
        tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}