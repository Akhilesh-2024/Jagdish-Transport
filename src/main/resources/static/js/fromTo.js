console.log("fromTo.js loaded");

// Global variables
let locations = [];
let editingId = null;

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
});
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
            renderLocationTable();
        })
        .catch(error => {
            console.error("Error loading locations:", error);
            showSwalNotification('Error loading locations: ' + error.message, 'error');
        });
}
// Render location table
function renderLocationTable() {
    const tableBody = document.querySelector('#locationTable tbody');
    tableBody.innerHTML = '';
    
    console.log("Rendering location table with data:", locations);
    
    if (locations.length === 0) {
        document.getElementById('emptyState').style.display = 'block';
        tableBody.innerHTML = '<tr><td colspan="3">No locations available</td></tr>';
        return;
    } else {
        document.getElementById('emptyState').style.display = 'none';
		
    }
    
    locations.forEach((location, index) => {
        const row = document.createElement('tr');
        row.dataset.id = location.id;
        
        if (editingId === location.id) {
            // Editing mode
            row.classList.add('editing');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>
                    <input type="text" value="${location.locationName}" id="edit-${location.id}" class="form-control">
                </td>
                <td>
                    <button class="btn-icon btn-edit" onclick="saveEdit(${location.id})">
                        <i class="fas fa-save"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="cancelEdit()">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            `;
        } else {
            // Normal mode
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${location.locationName}</td>
                <td>
                    <button class="btn-icon btn-edit" onclick="enableEdit(${location.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteLocation(${location.id})">
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
        
        // Add to local array
        locations.push(data);
        
        // Clear input
        locationInput.value = '';
        
        // Update table
        renderLocationTable();
        
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
        
        // Update local array
        const index = locations.findIndex(item => item.id === id);
        if (index !== -1) {
            locations[index] = data;
            editingId = null;
            renderLocationTable();
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
                
                // Update table
                renderLocationTable();
                
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
    const tableRows = document.querySelectorAll('#locationTable tbody tr');
    
    tableRows.forEach(row => {
        // Skip the "no locations available" row
        if (row.cells.length === 1 && row.cells[0].colSpan === 3) {
            return;
        }
        
        const locationName = row.cells[1].textContent.toLowerCase();
        
        if (locationName.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}