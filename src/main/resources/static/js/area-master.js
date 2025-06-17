// Global variables
let areas = [];
let editingId = null;
let vehicleTypes = [];
let parties = [];  // This will be loaded from backend now

// DOM loaded event
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    
    // Set today's date as default
    document.getElementById('areaDate').valueAsDate = new Date();
    
    // Initialize area data from backend
    fetchAreaData();
    
    // Fetch vehicle types from API
    fetchVehicleTypes();
    
    // Fetch party data from backend
    fetchPartyData();
    
    // Set up form submission handler
    document.getElementById('addAreaBtn').addEventListener('click', function(e) {
        e.preventDefault();
        addArea();
    });
    
    // Set up multiselect buttons
    setupMultiSelectButtons();
    
    // Set up search filtering for party options
    document.getElementById('partySearch').addEventListener('input', function() {
        filterPartyOptions(this.value);
    });
    
    // Set up search filtering for area table
    const areaSearchInput = document.getElementById('areaSearchInput');
    if (areaSearchInput) {
        areaSearchInput.addEventListener('input', function() {
            filterAreaTable(this.value);
        });
    }
    
    // No automatic calculation of Lorry Freight Rate - both fields are independent
    
    // Check if empty state element should be shown initially
    checkEmptyState();
});

// Set up multiselect buttons
function setupMultiSelectButtons() {
    // Handle select all/none buttons
    document.querySelectorAll('.btn-select').forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('data-select');
            const checkboxes = document.querySelectorAll('#partyOptions input[type="checkbox"]');
            
            checkboxes.forEach(checkbox => {
                checkbox.checked = action === 'all';
            });
            
            // Update selected count
            updateSelectedCount();
        });
    });
}

// Filter party options based on search input
function filterPartyOptions(searchTerm) {
    searchTerm = searchTerm.toLowerCase();
    const options = document.querySelectorAll('#partyOptions .party-option');
    
    options.forEach(option => {
        const partyName = option.querySelector('span').textContent.toLowerCase();
        if (partyName.includes(searchTerm)) {
            option.style.display = 'flex';
        } else {
            option.style.display = 'none';
        }
    });
}

// Filter area table based on search input
function filterAreaTable(searchTerm) {
    searchTerm = searchTerm.toLowerCase();
    const tableRows = document.querySelectorAll('#areaTable tbody tr');
    
    tableRows.forEach(row => {
        const areaName = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const vehicleType = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
        const partyName = row.querySelector('td:nth-child(4)').textContent.toLowerCase();
        
        // Check if any of the fields match the search term
        if (areaName.includes(searchTerm) || 
            vehicleType.includes(searchTerm) || 
            partyName.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Update the selected count display
function updateSelectedCount() {
    const selectedCount = document.querySelectorAll('#partyOptions input[type="checkbox"]:checked').length;
    document.getElementById('selectedCount').textContent = selectedCount;
}

// No automatic calculation of Lorry Freight Rate - both fields are independent

// Fetch area data from backend
function fetchAreaData() {
    console.log("Fetching area data from backend...");
    
    // Show loading indicator
    const tableSection = document.getElementById('tableSection');
    if (tableSection) {
        // Create a table structure with loading indicator
        tableSection.innerHTML = `
            <table id="areaTable" class="data-table">
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Area Name</th>
                        <th>Vehicle Type</th>
                        <th>Party Name</th>
                        <th>Company Freight Rate</th>
                        <th>Lorry Freight Rate</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colspan="8" class="loading-cell">
                            <div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading area data...</div>
                        </td>
                    </tr>
                </tbody>
            </table>
        `;
    }
    
    fetch('/area-master/all')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch area data: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Area data received:", data);
            
            // Transform backend data to match frontend structure
            areas = data.map(item => {
                // Each backend item now has a single party
                return {
                    id: item.id,
                    areaName: item.areaName,
                    vehicleType: item.vehicleType || '',
                    partyName: [item.partyName || ''], // Make it an array with single value
                    companyRate: item.companyRate || 0,
                    lorryRate: item.lorryRate || 0,
                    date: item.areaDate || new Date().toISOString().split('T')[0]
                };
            });
            
            // Sort areas alphabetically by area name
            areas.sort((a, b) => a.areaName.localeCompare(b.areaName));
            
            // Render area table
            renderAreaTable();
            
            // Check empty state
            checkEmptyState();
        })
        .catch(error => {
            console.error("Error fetching area data:", error);
            showNotification('Failed to load area data from server. Retrying...', 'error');
            
            // Clear any existing areas to prevent stale data
            areas = [];
            
            // Update the table to show the error
            const tableBody = document.querySelector('#areaTable tbody');
            if (tableBody) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="8" class="error-cell">
                            <div class="error-message">
                                <i class="fas fa-exclamation-triangle"></i> 
                                Error loading data. Retrying...
                            </div>
                        </td>
                    </tr>
                `;
            }
            
            checkEmptyState();
            
            // Retry after 2 seconds
            setTimeout(() => {
                fetchAreaData();
            }, 2000);
        });
}

// Fetch vehicle types from backend
function fetchVehicleTypes() {
    console.log("Fetching vehicle types from API...");
    
    fetch('/vehicle-type-master/all')
        .then(response => {
            console.log("API response status:", response.status);
            if (!response.ok) {
                throw new Error(`Failed to fetch vehicle types: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("API data received:", data);
            
            // Extract the vehicleType field from each object
            vehicleTypes = data.map(item => {
                if (item && typeof item === 'object' && item.vehicleType) {
                    return item.vehicleType;
                }
                return null;
            }).filter(Boolean); // Filter out any null values
            
            // Sort vehicle types alphabetically
            vehicleTypes.sort((a, b) => a.localeCompare(b));
            
            console.log("Processed vehicle types:", vehicleTypes);
            
            if (vehicleTypes.length === 0) {
                console.warn("No valid vehicle types found in API response");
                useFallbackVehicleTypes();
            } else {
                // Initialize the select with the fetched data
                initializeVehicleTypeSelect();
            }
        })
        .catch(error => {
            console.error("Error fetching vehicle types:", error);
            useFallbackVehicleTypes();
        });
}

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
            
            // Extract company names from party data
            parties = data.map(item => {
                if (item && typeof item === 'object' && item.companyName) {
                    return item.companyName;
                }
                return null;
            }).filter(Boolean);
            
            // Sort parties alphabetically
            parties.sort((a, b) => a.localeCompare(b));
            
            if (parties.length === 0) {
                console.warn("No valid parties found in API response");
                parties = ["Party A", "Party B", "Party C", "Party D", "Party E"];
            }
            
            // Initialize party multiselect
            initializePartyMultiselect();
        })
        .catch(error => {
            console.error("Error fetching party data:", error);
            parties = ["Party A", "Party B", "Party C", "Party D", "Party E"];
            initializePartyMultiselect();
        });
}

// Use fallback vehicle types if API fails
function useFallbackVehicleTypes() {
    console.log("Using fallback vehicle types");
    vehicleTypes = ["17F", "10 ton", "12F"];
    initializeVehicleTypeSelect();
}

// Save new vehicle type to backend
function saveNewVehicleType(typeName) {
    console.log("Saving new vehicle type:", typeName);
    
    // Create vehicle type object with the correct property name
    const vehicleType = {
        vehicleType: typeName
    };
    
    // Send POST request to API
    fetch('/vehicle-type-master/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleType)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to save vehicle type: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Vehicle type saved successfully:', data);
    })
    .catch(error => {
        console.error('Error saving vehicle type:', error);
        showNotification('Vehicle type saved locally but failed to save to server', 'error');
    });
}

// Initialize vehicle type select
function initializeVehicleTypeSelect() {
    console.log("Initializing vehicle type select");
    const vehicleTypeSelect = document.getElementById('vehicleType');
    
    if (!vehicleTypeSelect) {
        console.error("Vehicle type select element not found!");
        return;
    }
    
    // Clear existing options
    vehicleTypeSelect.innerHTML = '<option value="">Choose Vehicle Type</option>';
    
    // Group the vehicle types in optgroups for better organization
    const optgroup = document.createElement('optgroup');
    optgroup.label = "Available Vehicle Types";
    
    // Add vehicle types
    if (vehicleTypes && vehicleTypes.length > 0) {
        vehicleTypes.forEach(typeName => {
            if (typeName) {  // Ensure typeName is not null or undefined
                const option = document.createElement('option');
                option.value = typeName;
                option.textContent = typeName;
                optgroup.appendChild(option);
            }
        });
        
        // Add the optgroup to the select
        vehicleTypeSelect.appendChild(optgroup);
        console.log(`Added ${vehicleTypes.length} vehicle types to dropdown`);
    } else {
        console.warn('No vehicle types available to add to dropdown');
    }
    
    // Add listener for the custom vehicle type field
    const customVehicleTypeInput = document.getElementById('customVehicleType');
    if (customVehicleTypeInput) {
        customVehicleTypeInput.addEventListener('input', function() {
            // If custom vehicle type is entered, clear the select
            if (this.value.trim()) {
                vehicleTypeSelect.value = '';
            }
        });
    }
    
    // Add listener for the vehicle type select
    vehicleTypeSelect.addEventListener('change', function() {
        const customVehicleTypeInput = document.getElementById('customVehicleType');
        if (customVehicleTypeInput && this.value) {
            // If vehicle type is selected, clear the custom input
            customVehicleTypeInput.value = '';
        }
    });
}

// Initialize party multiselect
function initializePartyMultiselect() {
    console.log("Initializing party multiselect");
    const partyOptions = document.getElementById('partyOptions');
    
    if (!partyOptions) {
        console.error("Party options element not found!");
        return;
    }
    
    // Clear existing options
    partyOptions.innerHTML = '';
    
    // Add parties as checkboxes
    parties.forEach(party => {
        const option = document.createElement('div');
        option.className = 'party-option';
        
        option.innerHTML = `
            <label>
                <input type="checkbox" value="${party}">
                <span>${party}</span>
            </label>
        `;
        
        // Add click handler for the checkbox
        const checkbox = option.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', function() {
            updateSelectedCount();
            // Add selected class to parent for better visual feedback
            if (this.checked) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
        
        // Add click handler for the entire option div
        option.addEventListener('click', function(e) {
            // Don't trigger if the click was directly on the checkbox
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change'));
            }
        });
        
        partyOptions.appendChild(option);
    });
    
    // Initialize selected count
    updateSelectedCount();
}

// Get selected parties from multiselect
function getSelectedParties() {
    const checkedBoxes = document.querySelectorAll('#partyOptions input[type="checkbox"]:checked');
    return Array.from(checkedBoxes).map(checkbox => checkbox.value);
}

// Get party name from edit form
function getPartyNameFromEdit(id) {
    const partyNameInput = document.getElementById(`edit-partyName-${id}`);
    return partyNameInput ? partyNameInput.value.trim() : '';
}

// Check if empty state should be shown
function checkEmptyState() {
    const emptyState = document.getElementById('emptyState');
    const tableSection = document.getElementById('tableSection');
    
    if (!emptyState || !tableSection) {
        console.error("Empty state or table section elements not found!");
        return;
    }
    
    console.log("Checking empty state, areas length:", areas.length);
    
    if (areas.length === 0) {
        // Show empty state message but keep table visible with its own empty message
        emptyState.style.display = 'flex';
        
        // Make sure the table is still visible but shows an empty message
        tableSection.style.display = 'block';
        
        // The empty message in the table is handled by renderAreaTable
    } else {
        // Hide empty state and show table with data
        emptyState.style.display = 'none';
        tableSection.style.display = 'block';
    }
}

// Add new area with backend synchronization
function addArea() {
    const areaNameInput = document.getElementById('areaName');
    const vehicleTypeInput = document.getElementById('vehicleType');
    const customVehicleTypeInput = document.getElementById('customVehicleType');
    const companyRateInput = document.getElementById('companyRate');
    const lorryRateInput = document.getElementById('lorryRate');
    const areaDateInput = document.getElementById('areaDate');
    
    // Get values
    const areaName = areaNameInput.value.trim();
    let vehicleType = vehicleTypeInput.value;
    const customVehicleType = customVehicleTypeInput.value.trim();
    const selectedParties = getSelectedParties();
    const companyRate = parseFloat(companyRateInput.value);
    const lorryRate = parseFloat(lorryRateInput.value);
    const areaDate = areaDateInput.value;
    
    // Validate inputs before using custom vehicle type
    if (!areaName) {
        showNotification('Please enter an area name', 'error');
        return;
    }
    
    // Use custom vehicle type if provided
    if (customVehicleType) {
        vehicleType = customVehicleType;
        
        // Add to vehicle types if not already present
        if (!vehicleTypes.includes(customVehicleType)) {
            vehicleTypes.push(customVehicleType);
            
            // Add new vehicle type to database via API
            saveNewVehicleType(customVehicleType);
            
            // Update select options
            initializeVehicleTypeSelect();
        }
    }
    
    // Continue with other validations
    if (!vehicleType) {
        showNotification('Please select or enter a vehicle type', 'error');
        return;
    }
    
    if (selectedParties.length === 0) {
        showNotification('Please select at least one party', 'error');
        return;
    }
    
    if (isNaN(companyRate) || companyRate <= 0) {
        showNotification('Please enter a valid company rate', 'error');
        return;
    }
    
    if (isNaN(lorryRate) || lorryRate <= 0) {
        showNotification('Please enter a valid lorry rate', 'error');
        return;
    }
    
    if (!areaDate) {
        showNotification('Please select a date', 'error');
        return;
    }
    
    // Create a separate record for each selected party
    const savePromises = selectedParties.map(party => {
        // Create area object for backend with single party
        const backendArea = {
            areaName: areaName,
            vehicleType: vehicleType,
            partyName: party, // Single party name
            companyRate: companyRate,
            lorryRate: lorryRate,
            areaDate: areaDate
        };
        
        // Send POST request to backend for each party
        return fetch('/area-master/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(backendArea)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to save area for party ${party}: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(`Area saved successfully for party ${party}:`, data);
            
            // Create new area object for frontend with the ID from backend
            const newArea = {
                id: data.id,
                areaName: areaName,
                vehicleType: vehicleType,
                partyName: [party], // Keep as array for frontend but with single value
                companyRate: companyRate,
                lorryRate: lorryRate,
                date: areaDate
            };
            
            // Add to areas array
            areas.push(newArea);
            return newArea;
        });
    });
    
    // Process all promises
    Promise.all(savePromises)
        .then(newAreas => {
            console.log('All areas saved successfully:', newAreas);
            
            // Render area table
            renderAreaTable();
            
            // Check empty state
            checkEmptyState();
            
            // Reset form
            resetForm();
            
            // Show success notification
            showNotification(`Added ${selectedParties.length} area entries successfully`, 'success');
        })
        .catch(error => {
            console.error('Error saving areas:', error);
            showNotification('Failed to save one or more areas to server', 'error');
        });
}

// Reset form
function resetForm() {
    document.getElementById('areaName').value = '';
    document.getElementById('vehicleType').value = '';
    document.getElementById('customVehicleType').value = '';
    
    // Reset party multiselect - uncheck all checkboxes
    document.querySelectorAll('#partyOptions input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Update selected count
    updateSelectedCount();
    
    document.getElementById('companyRate').value = '';
    document.getElementById('lorryRate').value = '';
    document.getElementById('areaDate').valueAsDate = new Date();
}

// Render area table
function renderAreaTable() {
    console.log("Rendering area table with", areas.length, "areas");
    
    // Make sure the table exists
    const tableSection = document.getElementById('tableSection');
    if (!tableSection) {
        console.error("Table section element not found!");
        return;
    }
    
    // Ensure the table structure exists
    if (!document.getElementById('areaTable')) {
        tableSection.innerHTML = `
            <table id="areaTable" class="data-table">
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Area Name</th>
                        <th>Vehicle Type</th>
                        <th>Party Name</th>
                        <th>Company Freight Rate</th>
                        <th>Lorry Freight Rate</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        `;
    }
    
    const tableBody = document.querySelector('#areaTable tbody');
    if (!tableBody) {
        console.error("Table body element not found!");
        return;
    }
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // If no areas, show a message
    if (areas.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-cell">
                    No area data available. Add your first area using the form above.
                </td>
            </tr>
        `;
        return;
    }
    
    // Add rows for each area
    areas.forEach((area, index) => {
        const row = document.createElement('tr');
        row.dataset.id = area.id;
        
        if (editingId === area.id) {
            // Editing mode
            row.classList.add('editing');
            
            // Use a text input with autocomplete for Party Name
            row.innerHTML = `
                <td>${index + 1}</td>
                <td><input type="text" class="edit-input" id="edit-areaName-${area.id}" value="${area.areaName}"></td>
                <td>
                    <select class="edit-input" id="edit-vehicleType-${area.id}">
                        ${vehicleTypes.map(type => `<option value="${type}" ${type === area.vehicleType ? 'selected' : ''}>${type}</option>`).join('')}
                    </select>
                </td>
                <td>
                    <div class="edit-party-container" id="edit-partyContainer-${area.id}">
                        <div class="autocomplete-wrapper">
                            <input type="text" class="edit-input party-autocomplete" id="edit-partyName-${area.id}" value="${area.partyName[0] || ''}" placeholder="Type to search parties...">
                            <div class="autocomplete-dropdown" id="autocomplete-dropdown-${area.id}"></div>
                        </div>
                    </div>
                </td>
                <td><input type="number" class="edit-input" id="edit-companyRate-${area.id}" value="${area.companyRate}" step="0.01"></td>
                <td><input type="number" class="edit-input" id="edit-lorryRate-${area.id}" value="${area.lorryRate}" step="0.01"></td>
                <td><input type="date" class="edit-input" id="edit-date-${area.id}" value="${area.date}"></td>
                <td class="actions">
                    <button class="btn-icon btn-save" onclick="saveEdit(${area.id})" title="Save">
                        <i class="fas fa-save"></i>
                    </button>
                    <button class="btn-icon btn-cancel" onclick="cancelEdit()" title="Cancel">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            `;
            
            // Setup autocomplete after rendering
            setTimeout(() => {
                setupPartyAutocomplete(area.id);
            }, 10);
        } else {
            // Normal mode - display single party per row
            // Each area object now has only one party in its partyName array
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${area.areaName}</td>
                <td>${area.vehicleType}</td>
                <td>${area.partyName[0]}</td>
                <td>${area.companyRate.toFixed(2)}</td>
                <td>${area.lorryRate.toFixed(2)}</td>
                <td>${formatDate(area.date)}</td>
                <td class="actions">
                    <button class="btn-icon btn-edit" onclick="enableEdit(${area.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="confirmDelete(${area.id})" title="Delete">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
        }
        
        tableBody.appendChild(row);
    });
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Enable edit mode
function enableEdit(id) {
    editingId = id;
    renderAreaTable();
    
    // Focus the area name input after rendering
    setTimeout(() => {
        const areaNameInput = document.getElementById(`edit-areaName-${id}`);
        if (areaNameInput) {
            areaNameInput.focus();
            
            // Add Enter key navigation to area name input
            areaNameInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const vehicleTypeSelect = document.getElementById(`edit-vehicleType-${id}`);
                    if (vehicleTypeSelect) {
                        vehicleTypeSelect.focus();
                    }
                }
            });
        } else {
            console.error(`Area name input for ID ${id} not found after rendering`);
        }
        
        // Ensure vehicle type select is initialized properly
        const vehicleTypeSelect = document.getElementById(`edit-vehicleType-${id}`);
        if (vehicleTypeSelect) {
            // Make sure it has all options
            if (vehicleTypeSelect.options.length < vehicleTypes.length + 1) {
                vehicleTypes.forEach(type => {
                    const exists = Array.from(vehicleTypeSelect.options).some(option => option.value === type);
                    if (!exists) {
                        const option = document.createElement('option');
                        option.value = type;
                        option.textContent = type;
                        vehicleTypeSelect.appendChild(option);
                    }
                });
            }
            
            // Add Enter key navigation to vehicle type select
            vehicleTypeSelect.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const partyNameInput = document.getElementById(`edit-partyName-${id}`);
                    if (partyNameInput) {
                        partyNameInput.focus();
                    }
                }
            });
        } else {
            console.error(`Vehicle type select for ID ${id} not found after rendering`);
        }
        
        // Add Enter key navigation to company rate input
        const companyRateInput = document.getElementById(`edit-companyRate-${id}`);
        if (companyRateInput) {
            companyRateInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const lorryRateInput = document.getElementById(`edit-lorryRate-${id}`);
                    if (lorryRateInput) {
                        lorryRateInput.focus();
                    }
                }
            });
        }
        
        // Add Enter key navigation to lorry rate input
        const lorryRateInput = document.getElementById(`edit-lorryRate-${id}`);
        if (lorryRateInput) {
            lorryRateInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const dateInput = document.getElementById(`edit-date-${id}`);
                    if (dateInput) {
                        dateInput.focus();
                    }
                }
            });
        }
        
        // Add Enter key navigation to date input
        const dateInput = document.getElementById(`edit-date-${id}`);
        if (dateInput) {
            dateInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    // Save the edit when Enter is pressed on the last field
                    saveEdit(id);
                }
            });
        }
    }, 10);
}

// Save edited area with backend sync
function saveEdit(id) {
    // Get edited values
    const areaNameInput = document.getElementById(`edit-areaName-${id}`);
    const vehicleTypeSelect = document.getElementById(`edit-vehicleType-${id}`);
    const companyRateInput = document.getElementById(`edit-companyRate-${id}`);
    const lorryRateInput = document.getElementById(`edit-lorryRate-${id}`);
    const dateInput = document.getElementById(`edit-date-${id}`);
    
    if (!areaNameInput || !vehicleTypeSelect || !companyRateInput || !lorryRateInput || !dateInput) {
        console.error("One or more edit form elements not found");
        showNotification('Error updating area rate', 'error');
        return;
    }
    
    const areaName = areaNameInput.value.trim();
    const vehicleType = vehicleTypeSelect.value;
    const partyName = getPartyNameFromEdit(id);
    const companyRate = parseFloat(companyRateInput.value);
    const lorryRate = parseFloat(lorryRateInput.value);
    const date = dateInput.value;
    
    // Validate inputs
    if (!areaName) {
        showNotification('Please enter an area name', 'error');
        return;
    }
    
    if (!vehicleType) {
        showNotification('Please select a vehicle type', 'error');
        return;
    }
    
    if (!partyName) {
        showNotification('Please enter a party name', 'error');
        return;
    }
    
    if (isNaN(companyRate) || companyRate <= 0) {
        showNotification('Please enter a valid company rate', 'error');
        return;
    }
    
    if (isNaN(lorryRate) || lorryRate <= 0) {
        showNotification('Please enter a valid lorry rate', 'error');
        return;
    }
    
    if (!date) {
        showNotification('Please select a date', 'error');
        return;
    }
    
    // Find current area
    const currentArea = areas.find(area => area.id === id);
    if (!currentArea) {
        showNotification('Area not found', 'error');
        return;
    }
    
    // Update backend area object with new party name
    const backendArea = {
        id: id,
        areaName: areaName,
        vehicleType: vehicleType,
        partyName: partyName, // Use the new party name from input
        companyRate: companyRate,
        lorryRate: lorryRate,
        areaDate: date
    };
    
    // Send PUT request to backend to update existing record
    fetch(`/area-master/update/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendArea)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to update area: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Area updated successfully:', data);
        
        // Find area in frontend array and update it
        const areaIndex = areas.findIndex(area => area.id === id);
        
        if (areaIndex !== -1) {
            // Update area data in frontend
            areas[areaIndex] = {
                ...areas[areaIndex],
                areaName: areaName,
                vehicleType: vehicleType,
                partyName: [partyName], // Update with new party name as array with single value
                companyRate: companyRate,
                lorryRate: lorryRate,
                date: date
            };
            
            // Exit edit mode and render the updated table
            editingId = null;
            renderAreaTable();
            showNotification('Area rate updated successfully', 'success');
        } else {
            showNotification('Area not found', 'error');
        }
    })
    .catch(error => {
        console.error('Error updating area:', error);
        showNotification('Failed to update area on server', 'error');
    });
}

// Cancel edit mode
function cancelEdit() {
    editingId = null;
    renderAreaTable();
}

// Setup party autocomplete for edit mode
function setupPartyAutocomplete(id) {
    const partyInput = document.getElementById(`edit-partyName-${id}`);
    const dropdownContainer = document.getElementById(`autocomplete-dropdown-${id}`);
    
    if (!partyInput || !dropdownContainer) {
        console.error("Party input or dropdown container not found");
        return;
    }
    
    let selectedIndex = -1;
    let matchingParties = [];
    
    // Function to update dropdown with matching parties
    function updateDropdown(searchTerm) {
        // Clear previous results
        dropdownContainer.innerHTML = '';
        selectedIndex = -1;
        
        if (searchTerm.length < 1) {
            dropdownContainer.style.display = 'none';
            return;
        }
        
        // Filter parties based on search term
        matchingParties = parties.filter(party => 
            party.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        if (matchingParties.length > 0) {
            dropdownContainer.style.display = 'block';
            
            // Add matching parties to dropdown
            matchingParties.forEach((party, index) => {
                const option = document.createElement('div');
                option.className = 'autocomplete-option';
                option.textContent = party;
                option.dataset.index = index;
                
                option.addEventListener('click', function() {
                    partyInput.value = party;
                    dropdownContainer.style.display = 'none';
                    
                    // Move to next field (lorry rate)
                    const companyRateInput = document.getElementById(`edit-companyRate-${id}`);
                    if (companyRateInput) {
                        companyRateInput.focus();
                    }
                });
                
                dropdownContainer.appendChild(option);
            });
        } else {
            dropdownContainer.style.display = 'none';
        }
    }
    
    // Function to select an option from the dropdown
    function selectOption(index) {
        // Remove selected class from all options
        const options = dropdownContainer.querySelectorAll('.autocomplete-option');
        options.forEach(opt => opt.classList.remove('selected'));
        
        if (index >= 0 && index < matchingParties.length) {
            selectedIndex = index;
            options[index].classList.add('selected');
            options[index].scrollIntoView({ block: 'nearest' });
        }
    }
    
    // Add input event listener
    partyInput.addEventListener('input', function() {
        updateDropdown(this.value);
    });
    
    // Add keydown event for keyboard navigation
    partyInput.addEventListener('keydown', function(e) {
        const options = dropdownContainer.querySelectorAll('.autocomplete-option');
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (dropdownContainer.style.display === 'none') {
                    updateDropdown(this.value);
                } else {
                    selectOption(Math.min(selectedIndex + 1, matchingParties.length - 1));
                }
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                selectOption(Math.max(selectedIndex - 1, 0));
                break;
                
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && dropdownContainer.style.display === 'block') {
                    // Select the highlighted option
                    partyInput.value = matchingParties[selectedIndex];
                    dropdownContainer.style.display = 'none';
                    
                    // Move to next field (company rate)
                    const companyRateInput = document.getElementById(`edit-companyRate-${id}`);
                    if (companyRateInput) {
                        companyRateInput.focus();
                    }
                } else {
                    // Move to next field
                    const companyRateInput = document.getElementById(`edit-companyRate-${id}`);
                    if (companyRateInput) {
                        companyRateInput.focus();
                    }
                }
                break;
                
            case 'Escape':
                dropdownContainer.style.display = 'none';
                break;
                
            case 'Tab':
                if (dropdownContainer.style.display === 'block' && selectedIndex >= 0) {
                    e.preventDefault();
                    partyInput.value = matchingParties[selectedIndex];
                    dropdownContainer.style.display = 'none';
                }
                break;
        }
    });
    
    // Show dropdown on focus if input has value
    partyInput.addEventListener('focus', function() {
        if (this.value.trim().length > 0) {
            updateDropdown(this.value);
        }
    });
    
    // Hide dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target !== partyInput && !dropdownContainer.contains(e.target)) {
            dropdownContainer.style.display = 'none';
        }
    });
}

// Confirm delete
function confirmDelete(id) {
    if (confirm('Are you sure you want to delete this area rate?')) {
        deleteArea(id);
    }
}

// Delete area with backend sync
function deleteArea(id) {
    // Send DELETE request to backend
    fetch(`/area-master/delete/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to delete area: ${response.status}`);
        }
        return response.text();
    })
    .then(data => {
        console.log('Area deleted successfully:', data);
        
        // Remove area from frontend array
        areas = areas.filter(area => area.id !== id);
        
        // Re-render table
        renderAreaTable();
        
        // Check empty state
        checkEmptyState();
        
        // Show success notification
        showNotification('Area rate deleted successfully', 'success');
    })
    .catch(error => {
        console.error('Error deleting area:', error);
        showNotification('Failed to delete area from server', 'error');
    });
}

// Show notification
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');
    
    if (!notification || !notificationMessage) {
        console.error("Notification elements not found");
        alert(message); // Fallback to alert if notification elements not found
        return;
    }
    
    // Set message
    notificationMessage.textContent = message;
    
    // Set type
    notification.className = 'notification';
    notification.classList.add(type);
    
    // Update icon
    const icon = notification.querySelector('i.fas');
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