// Global variables
let vehicleTypes = [];
let editingId = null;

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
});

// Load vehicle types from server
function loadVehicleTypes() {
    fetch('/vehicle-type-master/all')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Sort vehicle types alphabetically
            vehicleTypes = data.sort((a, b) => a.vehicleType.localeCompare(b.vehicleType));
            renderVehicleTypeTable();
        })
        .catch(error => {
            console.error("Error loading vehicle types:", error);
           /* showSwalNotification('Error loading vehicle types', 'error');*/
        });
}

// Render vehicle type table
function renderVehicleTypeTable() {
    const tableBody = document.querySelector('#vehicleTypeTable tbody');
    tableBody.innerHTML = '';
    
    if (vehicleTypes.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="2" class="empty-state">
                    <p>No vehicle types found. Add one above.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    vehicleTypes.forEach(vehicleType => {
        const row = document.createElement('tr');
        row.dataset.id = vehicleType.id;
        
        if (editingId === vehicleType.id) {
            // Editing mode
            row.classList.add('editing');
            row.innerHTML = `
                <td>
                    <input type="text" value="${vehicleType.vehicleType}" id="edit-${vehicleType.id}" class="form-control">
                </td>
                <td>
                    <button class="btn btn-sm btn-success save-btn" onclick="saveEdit(${vehicleType.id})">
                        <i class="fas fa-save"></i> Save
                    </button>
                    <button class="btn btn-sm btn-secondary cancel-btn" onclick="cancelEdit()">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </td>
            `;
        } else {
            // Normal mode
            row.innerHTML = `
                <td>${vehicleType.vehicleType}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="enableEdit(${vehicleType.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteVehicleType(${vehicleType.id})">
                        <i class="fas fa-trash"></i> Delete
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
        // Add to local array
        vehicleTypes.push(data);
        
        // Clear input
        vehicleTypeInput.value = '';
        
        // Update table
        renderVehicleTypeTable();
        
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
        // Update local array
        const index = vehicleTypes.findIndex(item => item.id === id);
        if (index !== -1) {
            vehicleTypes[index] = data;
            editingId = null;
            renderVehicleTypeTable();
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
                
                // Update table
                renderVehicleTypeTable();
                
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

// Filter vehicle types based on search input
function filterVehicleTypes(searchTerm) {
    searchTerm = searchTerm.toLowerCase();
    const tableRows = document.querySelectorAll('#vehicleTypeTable tbody tr');
    
    tableRows.forEach(row => {
        // Skip the "no vehicle types found" row
        if (row.cells.length === 1 && row.cells[0].colSpan === 2) {
            return;
        }
        
        const vehicleType = row.cells[0].textContent.toLowerCase();
        
        if (vehicleType.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}