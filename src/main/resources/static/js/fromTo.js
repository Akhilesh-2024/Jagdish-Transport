console.log("fromTo.js loaded");

// Global variables
let locations = [];
let editingId = null;
let filteredLocations = [];
let selectedLocations = new Set();
let currentPage = 1;
const itemsPerPage = 20;

// DOM loaded event
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing location master");
    
    // Initial data load from server
    loadLocations();
    
    // Set up form submission handler
    document.getElementById('locationMasterForm').addEventListener('submit', function(e) {
        e.preventDefault();
        console.log("Form submitted, adding location");
        addLocation();
    });
    
    // Set up search functionality
    const searchInput = document.getElementById('locationSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterLocations(this.value);
        });
    }
    
    // Set up select all functionality
    const selectAllCheckbox = document.getElementById('selectAllLocations');
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
    
    // Enhanced keyboard navigation for fromTo master
    setupFromToMasterKeyboardNavigation();
});

// Enhanced keyboard navigation for fromTo master
function setupFromToMasterKeyboardNavigation() {
    // We don't need to add a separate keydown event listener for Enter key
    // since the form's submit event already handles this
    // This prevents the double submission issue when pressing Enter
}
// Load locations from server
function loadLocations() {
    console.log("Attempting to load locations from /location-master/all");
    fetch('/location-master/all')
        .then(response => {
            console.log("Response status:", response.status);
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log("Loaded locations data:", data);
            // Sort locations alphabetically by locationName
            locations = data.sort((a, b) => a.locationName.localeCompare(b.locationName));
            filteredLocations = [...locations];
            selectedLocations.clear();
            currentPage = 1;
            renderLocationTable();
            renderPagination();
            checkEmptyState();
            updateSelectAllCheckbox();
            updateDeleteSelectedButton();
        })
        .catch(error => {
            console.error("Error loading locations:", error);
            showSwalNotification('Error loading locations: ' + error.message, 'error');
        });
}
// Render location table with pagination
function renderLocationTable() {
    const tableBody = document.querySelector('#locationTable tbody');
    tableBody.innerHTML = '';
    
    console.log("Rendering location table with data:", filteredLocations);
    
    if (filteredLocations.length === 0) {
        checkEmptyState();
        return;
    }
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedLocations = filteredLocations.slice(startIndex, endIndex);
    
    paginatedLocations.forEach((location, index) => {
        const row = document.createElement('tr');
        row.dataset.id = location.id;
        
        const globalIndex = startIndex + index + 1;
        const isSelected = selectedLocations.has(location.id);
        
        if (editingId === location.id) {
            // Editing mode
            row.classList.add('editing');
            row.innerHTML = `
                <td>
                    <input type="checkbox" class="location-checkbox" data-id="${location.id}" ${isSelected ? 'checked' : ''} onchange="toggleLocationSelection(${location.id}, this.checked)">
                </td>
                <td>${globalIndex}</td>
                <td>
                    <input type="text" value="${location.locationName}" id="edit-${location.id}" class="form-control">
                </td>
                <td>
                    <button class="btn-icon btn-save" onclick="saveEdit(${location.id})" title="Save">
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
                    <input type="checkbox" class="location-checkbox" data-id="${location.id}" ${isSelected ? 'checked' : ''} onchange="toggleLocationSelection(${location.id}, this.checked)">
                </td>
                <td>${globalIndex}</td>
                <td>${location.locationName}</td>
                <td>
                    <button class="btn-icon btn-edit" onclick="enableEdit(${location.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteLocation(${location.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
        }
        
        tableBody.appendChild(row);
    });

    console.log("Table rendered with rows:", tableBody.children.length);
}

// Add new location
function addLocation() {
    const locationInput = document.getElementById('location');
    const locationName = locationInput.value.trim();
    
    if (!locationName) {
        showSwalNotification('Please enter a location', 'error');
        return;
    }
    
    // Check if location already exists
    if (locations.some(item => item.locationName.toLowerCase() === locationName.toLowerCase())) {
        showSwalNotification('This location already exists', 'error');
        return;
    }
    
    // Create new location object
    const newLocation = {
        locationName: locationName
    };
    
    console.log("Sending new location:", newLocation);
    
    // Send to server
    fetch('/location-master/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(newLocation)
    })
    .then(response => {
        if (!response.ok) {
            console.error("Server responded with status:", response.status);
            return response.text().then(text => {
                throw new Error('Server error: ' + response.status + ' ' + text);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log("Location added successfully:", data);
        
        // Add to local array and sort
        locations.push(data);
        locations.sort((a, b) => a.locationName.localeCompare(b.locationName));
        filteredLocations = [...locations];
        
        // Clear input
        locationInput.value = '';
        
        // Update table and pagination
        renderLocationTable();
        renderPagination();
        checkEmptyState();
        updateSelectAllCheckbox();
        updateDeleteSelectedButton();
        
        // Show success notification
        showSwalNotification('Location added successfully', 'success');
    })
    .catch(error => {
        console.error("Error adding location:", error);
        showSwalNotification('Error adding location: ' + error.message, 'error');
    });
}

// Enable edit mode
function enableEdit(id) {
    editingId = parseInt(id);
    renderLocationTable();
    
    // Focus the input after rendering
    setTimeout(() => {
        const input = document.getElementById(`edit-${id}`);
        if (input) {
            input.focus();
            input.select();
        }
    }, 10);
}

// Save edited location
function saveEdit(id) {
    const editInput = document.getElementById(`edit-${id}`);
    const newValue = editInput.value.trim();
    
    if (!newValue) {
        showSwalNotification('Location cannot be empty', 'error');
        return;
    }
    
    // Check if the new value already exists (except for the current one)
    if (locations.some(item => item.id !== id && item.locationName.toLowerCase() === newValue.toLowerCase())) {
        showSwalNotification('This location already exists', 'error');
        return;
    }
    
    // Create updated location object
    const updatedLocation = {
        id: id,
        locationName: newValue
    };
    
    console.log("Updating location:", updatedLocation);
    
    // Send to server
    fetch(`/location-master/update/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(updatedLocation)
    })
    .then(response => {
        if (!response.ok) {
            console.error("Server responded with status:", response.status);
            return response.text().then(text => {
                throw new Error('Server error: ' + response.status + ' ' + text);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log("Location updated successfully:", data);
        
        // Update local array and sort
        const index = locations.findIndex(item => item.id === id);
        if (index !== -1) {
            locations[index] = data;
            locations.sort((a, b) => a.locationName.localeCompare(b.locationName));
            filteredLocations = [...locations];
            editingId = null;
            renderLocationTable();
            renderPagination();
            showSwalNotification('Location updated successfully', 'success');
        }
    })
    .catch(error => {
        console.error("Error updating location:", error);
        showSwalNotification('Error updating location: ' + error.message, 'error');
    });
}

// Cancel edit mode
function cancelEdit() {
    editingId = null;
    renderLocationTable();
}

// Delete location
function deleteLocation(id) {
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
            fetch(`/location-master/delete/${id}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    console.error("Server responded with status:", response.status);
                    return response.text().then(text => {
                        throw new Error('Server error: ' + response.status + ' ' + text);
                    });
                }
                
                // Remove from local array
                locations = locations.filter(item => item.id !== parseInt(id));
                filteredLocations = filteredLocations.filter(item => item.id !== parseInt(id));
                selectedLocations.delete(parseInt(id));
                
                // Update pagination if current page is empty
                const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);
                if (currentPage > totalPages && totalPages > 0) {
                    currentPage = totalPages;
                } else if (filteredLocations.length === 0) {
                    currentPage = 1;
                }
                
                // Update table and pagination
                renderLocationTable();
                renderPagination();
                checkEmptyState();
                updateSelectAllCheckbox();
                updateDeleteSelectedButton();
                
                // Show success notification
                Swal.fire(
                    'Deleted!',
                    'Location has been deleted.',
                    'success'
                );
            })
            .catch(error => {
                console.error("Error deleting location:", error);
                Swal.fire(
                    'Error!',
                    'Failed to delete location: ' + error.message,
                    'error'
                );
            });
        }
    });
}

// Show SweetAlert notification
function showSwalNotification(message, type) {
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
}

// Hide notification
function hideNotification() {
    document.getElementById('notification').classList.remove('show');
}

// Filter locations based on search input
function filterLocations(searchTerm) {
    searchTerm = searchTerm.toLowerCase();
    
    if (!searchTerm) {
        filteredLocations = [...locations];
    } else {
        filteredLocations = locations.filter(location => 
            location.locationName.toLowerCase().includes(searchTerm)
        );
    }
    
    currentPage = 1;
    selectedLocations.clear();
    renderLocationTable();
    renderPagination();
    updateSelectAllCheckbox();
    updateDeleteSelectedButton();
}

// Check if empty state should be shown
function checkEmptyState() {
    const emptyState = document.getElementById('emptyState');
    const tableSection = document.querySelector('.table-section');
    
    if (emptyState && tableSection) {
        if (locations.length === 0) {
            emptyState.style.display = 'flex';
            tableSection.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            tableSection.style.display = 'block';
        }
    }
}

// Toggle individual location selection
function toggleLocationSelection(locationId, isSelected) {
    if (isSelected) {
        selectedLocations.add(locationId);
    } else {
        selectedLocations.delete(locationId);
    }
    updateSelectAllCheckbox();
    updateDeleteSelectedButton();
}

// Toggle select all functionality
function toggleSelectAll(selectAll) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedLocations = filteredLocations.slice(startIndex, endIndex);
    
    if (selectAll) {
        paginatedLocations.forEach(location => {
            selectedLocations.add(location.id);
        });
    } else {
        paginatedLocations.forEach(location => {
            selectedLocations.delete(location.id);
        });
    }
    
    // Update checkboxes
    const checkboxes = document.querySelectorAll('.location-checkbox');
    checkboxes.forEach(checkbox => {
        const locationId = parseInt(checkbox.dataset.id);
        checkbox.checked = selectedLocations.has(locationId);
    });
    
    updateDeleteSelectedButton();
}

// Update select all checkbox state
function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('selectAllLocations');
    if (!selectAllCheckbox) return;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedLocations = filteredLocations.slice(startIndex, endIndex);
    
    if (paginatedLocations.length === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
        return;
    }
    
    const selectedOnPage = paginatedLocations.filter(location => 
        selectedLocations.has(location.id)
    ).length;
    
    if (selectedOnPage === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else if (selectedOnPage === paginatedLocations.length) {
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
        deleteBtn.disabled = selectedLocations.size === 0;
    }
}

// Confirm delete selected locations
function confirmDeleteSelected() {
    if (selectedLocations.size === 0) {
        showSwalNotification('No locations selected', 'warning');
        return;
    }
    
    const count = selectedLocations.size;
    const message = count === 1 ? 
        'Are you sure you want to delete the selected location?' : 
        `Are you sure you want to delete ${count} selected locations?`;
    
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
            deleteSelectedLocations();
        }
    });
}

// Delete selected locations
function deleteSelectedLocations() {
    const selectedIds = Array.from(selectedLocations);
    
    fetch('/location-master/delete-multiple', {
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
        // Remove deleted locations from local arrays
        locations = locations.filter(location => !selectedIds.includes(location.id));
        filteredLocations = filteredLocations.filter(location => !selectedIds.includes(location.id));
        selectedLocations.clear();
        
        // Update pagination if current page is empty
        const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        } else if (filteredLocations.length === 0) {
            currentPage = 1;
        }
        
        renderLocationTable();
        renderPagination();
        checkEmptyState();
        updateSelectAllCheckbox();
        updateDeleteSelectedButton();
        
        if (message) {
            showSwalNotification(message, 'success');
        }
    })
    .catch(error => {
        console.error("Error deleting locations:", error);
        showSwalNotification('Error deleting selected locations', 'error');
    });
}

// Render pagination controls
function renderPagination() {
    const paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) return;
    
    const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<nav aria-label="Location pagination"><ul class="pagination justify-content-center">';
    
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
    renderLocationTable();
    renderPagination();
    updateSelectAllCheckbox();
    
    // Scroll to top of table
    document.querySelector('#locationTable').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}