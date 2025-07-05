// Global variables
let areas = [];
let editingId = null;
let vehicleTypes = [];
let parties = [];  // This will be loaded from backend now
let selectedAreas = new Set();
let filteredAreas = [];
let currentPage = 1;
const itemsPerPage = 20; // Pagination with 20 items per page

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
    
    // Set up delete selected functionality
    const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
    if (deleteSelectedBtn) {
        // Remove any existing event listeners
        deleteSelectedBtn.replaceWith(deleteSelectedBtn.cloneNode(true));
        
        // Get the fresh reference and add the event listener
        const freshDeleteBtn = document.getElementById('deleteSelectedBtn');
        freshDeleteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Delete selected button clicked");
            confirmDeleteSelected();
        });
    }
    
    // Set up select all checkbox functionality
    const selectAllCheckbox = document.getElementById('selectAllAreas');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            toggleSelectAll(this.checked);
        });
    }
    
    // No automatic calculation of Lorry Freight Rate - both fields are independent
    
    // Check if empty state element should be shown initially
    checkEmptyState();
    
    // Enhanced keyboard navigation for area master
    setupAreaMasterKeyboardNavigation();
});

// Enhanced keyboard navigation for area master
function setupAreaMasterKeyboardNavigation() {
    // This function is now empty because the keyboard navigation
    // has been moved to area-master-navigation.js
    
    // We keep this function to maintain compatibility with existing code
    console.log("Area Master keyboard navigation initialized (delegated to area-master-navigation.js)");
}

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
    
    if (searchTerm === '') {
        // If search term is empty, show all areas
        filteredAreas = [...areas];
    } else {
        // Filter areas based on search term
        filteredAreas = areas.filter(area => {
            const areaName = area.areaName.toLowerCase();
            const vehicleType = area.vehicleType.toLowerCase();
            const partyName = Array.isArray(area.partyName) ? area.partyName[0].toLowerCase() : area.partyName.toLowerCase();
            
            return areaName.includes(searchTerm) || 
                   vehicleType.includes(searchTerm) || 
                   partyName.includes(searchTerm);
        });
    }
    
    // Reset to first page when filtering
    currentPage = 1;
    
    // Re-render the table with filtered data
    renderAreaTable();
}

// Update the selected count display
function updateSelectedCount() {
    const selectedCount = document.querySelectorAll('#partyOptions input[type="checkbox"]:checked').length;
    const totalParties = parties.length;
    
    // Show "Every Party" if all parties are selected
    if (selectedCount === totalParties && totalParties > 0) {
        document.getElementById('selectedCount').textContent = "Every Party";
    } else {
        document.getElementById('selectedCount').textContent = selectedCount;
    }
}

// No automatic calculation of Lorry Freight Rate - both fields are independent

// Fetch area data from backend
function fetchAreaData() {
    console.log("Fetching area data from backend...");
    
    // Show loading indicator
    const tableSection = document.getElementById('tableSection');
    if (tableSection) {
        // Make sure table section is visible during loading
        tableSection.style.display = 'block';
        
        // Create a table structure with loading indicator
        tableSection.innerHTML = `
            <div class="table-controls" style="margin-bottom: 15px;">
                <div class="search-container" style="display: inline-block; margin-right: 15px;">
                    <div class="search-box">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" id="areaSearchInput" placeholder="Search areas...">
                    </div>
                </div>
                <div class="bulk-actions" style="display: inline-block;">
                    <button type="button" id="deleteSelectedBtn" class="btn btn-danger" disabled>
                        <i class="fas fa-trash-alt"></i> Delete Selected
                    </button>
                </div>
            </div>
            
            <div class="table-container">
                <table id="areaTable" class="data-table">
                    <thead>
                        <tr>
                            <th>
                                <input type="checkbox" id="selectAllAreas" title="Select All">
                            </th>
                            <th>Sr. No.</th>
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
                            <td colspan="9" class="loading-cell">
                                <div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading area data...</div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div id="paginationContainer" class="pagination-container" style="margin-top: 20px;"></div>
        `;
        
        // Re-attach event listeners
        const searchInput = document.getElementById('areaSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                filterAreaTable(this.value);
            });
        }
        
        const deleteBtn = document.getElementById('deleteSelectedBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                confirmDeleteSelected();
            });
        }
        
        const selectAll = document.getElementById('selectAllAreas');
        if (selectAll) {
            selectAll.addEventListener('change', function() {
                toggleSelectAll(this.checked);
            });
        }
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
                    partyName: [item.partyName || ''], // Make it an array with single value (could be "Every Party")
                    companyRate: item.companyRate || 0,
                    lorryRate: item.lorryRate || 0,
                    date: item.areaDate || new Date().toISOString().split('T')[0]
                };
            });
            
            // Sort areas alphabetically by area name
            areas.sort((a, b) => a.areaName.localeCompare(b.areaName));
            
            // Initialize filtered areas
            filteredAreas = [...areas];
            
            // Reset selection and pagination
            selectedAreas.clear();
            currentPage = 1;
            
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
                        <td colspan="9" class="error-cell">
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
        option.setAttribute('tabindex', '0'); // Make focusable for keyboard navigation
        
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
                
                // Use a bubbling event to ensure all listeners catch it
                const changeEvent = new Event('change', { bubbles: true });
                checkbox.dispatchEvent(changeEvent);
                
                // Add a visual indicator that the option was selected
                option.classList.add('just-selected');
                setTimeout(() => {
                    option.classList.remove('just-selected');
                }, 500);
                
                console.log("Party option clicked:", checkbox.value, "Checked:", checkbox.checked);
            }
        });
        
        // Add keyboard handler for the option
        option.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change'));
            }
        });
        
        partyOptions.appendChild(option);
    });
    
    // Initialize selected count
    updateSelectedCount();
    
    // Trigger an event to notify that party options have been initialized
    document.dispatchEvent(new CustomEvent('partyOptionsInitialized'));
    
    // Make the party options container keyboard navigable
    partyOptions.setAttribute('tabindex', '-1');
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
    const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
    const selectAllCheckbox = document.getElementById('selectAllAreas');
    
    if (!emptyState || !tableSection) {
        console.error("Empty state or table section elements not found!");
        return;
    }
    
    console.log("Checking empty state, areas length:", areas.length);
    
    if (areas.length === 0) {
        // Show empty state message
        emptyState.style.display = 'flex';
        tableSection.style.display = 'none';
        
        // Disable select all and delete buttons
        if (deleteSelectedBtn) deleteSelectedBtn.disabled = true;
        if (selectAllCheckbox) selectAllCheckbox.disabled = true;
    } else {
        // Hide empty state and show table with data
        emptyState.style.display = 'none';
        tableSection.style.display = 'block';
        
        // Enable select all checkbox
        if (selectAllCheckbox) selectAllCheckbox.disabled = false;
        
        // Update delete button state based on selections
        updateDeleteSelectedButton();
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
    
    // Check if all parties are selected
    const totalParties = parties.length;
    const isAllPartiesSelected = selectedParties.length === totalParties;
    
    let savePromises;
    
    if (isAllPartiesSelected) {
        // If all parties are selected, create one entry with "Every Party"
        const backendArea = {
            areaName: areaName,
            vehicleType: vehicleType,
            partyName: "Every Party", // Display "Every Party" for all parties
            companyRate: companyRate,
            lorryRate: lorryRate,
            areaDate: areaDate
        };
        
        // Send single POST request
        savePromises = [fetch('/area-master/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(backendArea)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to save area for all parties: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(`Area saved successfully for all parties:`, data);
            
            // Create new area object for frontend
            const newArea = {
                id: data.id,
                areaName: areaName,
                vehicleType: vehicleType,
                partyName: ["Every Party"], // Display "Every Party"
                companyRate: companyRate,
                lorryRate: lorryRate,
                date: areaDate
            };
            
            // Add to areas array
            areas.push(newArea);
            return newArea;
        })];
    } else {
        // Create a separate record for each selected party (existing behavior)
        savePromises = selectedParties.map(party => {
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
    }
    
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
                        <th>
                            <input type="checkbox" id="selectAllAreas" title="Select All">
                        </th>
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
        
        // Add event listener for select all checkbox
        const selectAllCheckbox = document.getElementById('selectAllAreas');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', function() {
                toggleSelectAll(this.checked);
            });
        }
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
                <td colspan="9" class="empty-cell">
                    No area data available. Add your first area using the form above.
                </td>
            </tr>
        `;
        
        // Hide pagination when no data
        const paginationContainer = document.getElementById('paginationContainer');
        if (paginationContainer) {
            paginationContainer.innerHTML = '';
        }
        
        // Update select all checkbox and delete button
        updateSelectAllCheckbox();
        updateDeleteSelectedButton();
        
        return;
    }
    
    // Apply filtering if needed
    filteredAreas = [...areas];
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAreas = filteredAreas.slice(startIndex, endIndex);
    
    // Add rows for each area in the current page
    paginatedAreas.forEach((area, index) => {
        const row = document.createElement('tr');
        row.dataset.id = area.id;
        
        const globalIndex = startIndex + index + 1;
        const isSelected = selectedAreas.has(area.id);
        
        // Add selected class to highlight selected rows
        if (isSelected) {
            row.classList.add('selected');
        }
        
        if (editingId === area.id) {
            // Editing mode
            row.classList.add('editing');
            
            // Use a text input with autocomplete for Party Name
            row.innerHTML = `
                <td>
                    <input type="checkbox" class="area-checkbox" data-id="${area.id}" ${isSelected ? 'checked' : ''} onchange="toggleAreaSelection(${area.id}, this.checked)">
                </td>
                <td>${globalIndex}</td>
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
                <td>
                    <input type="checkbox" class="area-checkbox" data-id="${area.id}" ${isSelected ? 'checked' : ''} onchange="toggleAreaSelection(${area.id}, this.checked)">
                </td>
                <td>${globalIndex}</td>
                <td>${area.areaName || ''}</td>
                <td>${area.vehicleType || ''}</td>
                <td>${Array.isArray(area.partyName) && area.partyName.length > 0 ? area.partyName[0] : (area.partyName || '')}</td>
                <td>${(area.companyRate || 0).toFixed(2)}</td>
                <td>${(area.lorryRate || 0).toFixed(2)}</td>
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
    
    // Render pagination
    renderPagination();
    
    // Update select all checkbox state
    updateSelectAllCheckbox();
    
    // Set up delete button event listener
    setupDeleteButton();
    
    // Update delete selected button state
    updateDeleteSelectedButton();
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

// Render pagination
function renderPagination() {
    const paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) return;
    
    const totalPages = Math.ceil(filteredAreas.length / itemsPerPage);
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<nav aria-label="Area pagination"><ul class="pagination justify-content-center">';
    
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
    const endItem = Math.min(currentPage * itemsPerPage, filteredAreas.length);
    const totalItems = filteredAreas.length;
    
    paginationHTML += `<div class="pagination-info text-center mt-2">
        <small class="text-muted">
            Showing ${startItem} to ${endItem} of ${totalItems} areas
        </small>
    </div>`;
    
    paginationContainer.innerHTML = paginationHTML;
}

// Change page - make it globally accessible
window.changePage = function(page) {
    const totalPages = Math.ceil(filteredAreas.length / itemsPerPage);
    
    if (page < 1 || page > totalPages) {
        return;
    }
    
    currentPage = page;
    renderAreaTable();
    
    // Scroll to top of table
    const tableContainer = document.querySelector('.table-section');
    if (tableContainer) {
        tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Toggle area selection - make it globally accessible
window.toggleAreaSelection = function(areaId, isSelected) {
    console.log(`Toggle area selection: ID=${areaId}, Selected=${isSelected}`);
    
    // Make sure areaId is a number
    areaId = parseInt(areaId);
    
    if (isNaN(areaId)) {
        console.error(`Invalid area ID: ${areaId}`);
        return;
    }
    
    if (isSelected) {
        selectedAreas.add(areaId);
        console.log(`Added area ${areaId} to selection`);
    } else {
        selectedAreas.delete(areaId);
        console.log(`Removed area ${areaId} from selection`);
    }
    
    // Update UI
    updateSelectAllCheckbox();
    updateDeleteSelectedButton();
    
    // Update row styling
    const row = document.querySelector(`tr[data-id="${areaId}"]`);
    if (row) {
        if (isSelected) {
            row.classList.add('selected');
        } else {
            row.classList.remove('selected');
        }
    }
    
    console.log(`Current selection: ${Array.from(selectedAreas).join(', ')}`);
}

// Toggle select all areas - make it globally accessible
window.toggleSelectAll = function(selectAll) {
    console.log(`Toggle select all: ${selectAll}`);
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAreas = filteredAreas.slice(startIndex, endIndex);
    
    if (selectAll) {
        // Add all visible areas to selection
        paginatedAreas.forEach(area => {
            if (area && area.id) {
                selectedAreas.add(area.id);
                console.log(`Added area ${area.id} to selection`);
            }
        });
    } else {
        // Remove all visible areas from selection
        paginatedAreas.forEach(area => {
            if (area && area.id) {
                selectedAreas.delete(area.id);
                console.log(`Removed area ${area.id} from selection`);
            }
        });
    }
    
    // Update checkboxes and row styling in the current page
    const checkboxes = document.querySelectorAll('.area-checkbox');
    checkboxes.forEach(checkbox => {
        const areaId = parseInt(checkbox.getAttribute('data-id'));
        if (!isNaN(areaId)) {
            checkbox.checked = selectAll;
            
            // Update row styling
            const row = checkbox.closest('tr');
            if (row) {
                if (selectAll) {
                    row.classList.add('selected');
                } else {
                    row.classList.remove('selected');
                }
            }
        }
    });
    
    // Update UI
    updateDeleteSelectedButton();
    console.log(`Selection after toggle: ${Array.from(selectedAreas).join(', ')}`);
}

// Update select all checkbox state
function updateSelectAllCheckbox() {
    console.log("Updating select all checkbox state");
    
    const selectAllCheckbox = document.getElementById('selectAllAreas');
    if (!selectAllCheckbox) {
        console.warn("Select all checkbox not found");
        return;
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAreas = filteredAreas.slice(startIndex, endIndex);
    
    if (paginatedAreas.length === 0) {
        console.log("No areas in current page");
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
        return;
    }
    
    // Count how many areas on the current page are selected
    let selectedCount = 0;
    for (const area of paginatedAreas) {
        if (area && area.id && selectedAreas.has(area.id)) {
            selectedCount++;
        }
    }
    
    console.log(`Selected ${selectedCount} out of ${paginatedAreas.length} areas on current page`);
    
    if (selectedCount === 0) {
        // None selected
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else if (selectedCount === paginatedAreas.length) {
        // All selected
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
    } else {
        // Some selected
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
    }
    
    // Also update the individual checkboxes to match the selection state
    const checkboxes = document.querySelectorAll('.area-checkbox');
    checkboxes.forEach(checkbox => {
        const areaId = parseInt(checkbox.getAttribute('data-id'));
        if (!isNaN(areaId)) {
            checkbox.checked = selectedAreas.has(areaId);
        }
    });
}

// Set up delete button event listener
function setupDeleteButton() {
    const deleteBtn = document.getElementById('deleteSelectedBtn');
    if (!deleteBtn) return;
    
    // Remove any existing event listeners by cloning and replacing
    const newDeleteBtn = deleteBtn.cloneNode(true);
    deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);
    
    // Add event listener to the new button
    newDeleteBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log("Delete selected button clicked");
        confirmDeleteSelected();
    });
    
    // Update button state
    updateDeleteSelectedButton();
}

// Update delete selected button state
function updateDeleteSelectedButton() {
    const deleteBtn = document.getElementById('deleteSelectedBtn');
    if (!deleteBtn) return;
    
    const selectedCount = selectedAreas.size;
    if (selectedCount > 0) {
        deleteBtn.disabled = false;
        deleteBtn.textContent = `Delete Selected (${selectedCount})`;
        deleteBtn.classList.add('active');
    } else {
        deleteBtn.disabled = true;
        deleteBtn.textContent = 'Delete Selected';
        deleteBtn.classList.remove('active');
    }
}

// Confirm delete selected areas
function confirmDeleteSelected() {
    console.log("confirmDeleteSelected called");
    console.log("Current selection:", Array.from(selectedAreas));
    
    if (selectedAreas.size === 0) {
        showNotification('No areas selected', 'error');
        return;
    }
    
    const selectedCount = selectedAreas.size;
    const message = `Are you sure you want to delete ${selectedCount} selected area${selectedCount > 1 ? 's' : ''}?`;
    
    console.log(`Confirming deletion of ${selectedCount} areas`);
    
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
                console.log("User confirmed deletion");
                deleteSelectedAreas();
            } else {
                console.log("User cancelled deletion");
            }
        });
    } else {
        // Fallback to regular confirm if SweetAlert is not available
        if (confirm(message)) {
            console.log("User confirmed deletion (using native confirm)");
            deleteSelectedAreas();
        } else {
            console.log("User cancelled deletion (using native confirm)");
        }
    }
}

// Delete selected areas
function deleteSelectedAreas() {
    // Convert Set to Array of IDs
    const areaIds = Array.from(selectedAreas);
    
    if (areaIds.length === 0) {
        showNotification('No areas selected for deletion', 'error');
        return;
    }
    
    console.log('Attempting to delete areas with IDs:', areaIds);
    
    // Show loading notification
    showNotification(`Deleting ${areaIds.length} area${areaIds.length > 1 ? 's' : ''}...`, 'info');
    
    // Send delete request to server
    fetch('/area-master/delete-multiple', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(areaIds)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        return response.text().then(text => {
            // Try to parse as JSON, but handle plain text responses too
            try {
                return text ? JSON.parse(text) : {};
            } catch (e) {
                return text;
            }
        });
    })
    .then(data => {
        console.log('Areas deleted, server response:', data);
        
        // Remove deleted areas from local arrays
        areas = areas.filter(area => !selectedAreas.has(area.id));
        filteredAreas = filteredAreas.filter(area => !selectedAreas.has(area.id));
        
        // Clear selection
        selectedAreas.clear();
        
        // Update UI
        renderAreaTable();
        updateSelectAllCheckbox();
        updateDeleteSelectedButton();
        
        // Check empty state
        checkEmptyState();
        
        // Show success notification
        showNotification(`${areaIds.length} area${areaIds.length > 1 ? 's' : ''} deleted successfully`, 'success');
    })
    .catch(error => {
        console.error('Error deleting areas:', error);
        showNotification(`Failed to delete areas: ${error.message}`, 'error');
    });
}