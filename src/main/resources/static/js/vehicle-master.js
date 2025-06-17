// Global variables
let vehicles = [];
let editingId = null;

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
                
                // Re-render table with updated data
                renderVehicleTable();
                checkEmptyState();
                
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
            renderVehicleTable();
            checkEmptyState();
        })
        .catch(error => {
            console.error("Error loading vehicles:", error);
            showNotification('Error loading vehicles', 'error');
        });
}

// Render vehicle table
function renderVehicleTable() {
    const tableBody = document.querySelector('#vehicleTable tbody');
    // Clear existing rows
    tableBody.innerHTML = '';
    
    if (vehicles.length === 0) {
        checkEmptyState();
        return;
    }
    
    vehicles.forEach((vehicle, index) => {
        const row = document.createElement('tr');
        row.dataset.id = vehicle.id;
        
        if (editingId === vehicle.id) {
            // Editing mode
            row.classList.add('editing');
            row.innerHTML = `
                <td>${index + 1}</td>
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
                <td>${index + 1}</td>
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
        
        // Re-render table with the new data
        renderVehicleTable();
        checkEmptyState();
        
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
        
        // Re-render table
        renderVehicleTable();
        
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
        
        // Re-render table
        renderVehicleTable();
        checkEmptyState();
        
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
    const tableRows = document.querySelectorAll('#vehicleTable tbody tr');
    
    tableRows.forEach(row => {
        // Skip rows that don't have the expected structure
        if (row.cells.length < 2) {
            return;
        }
        
        const vehicleNumber = row.cells[1].textContent.toLowerCase();
        
        if (vehicleNumber.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
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