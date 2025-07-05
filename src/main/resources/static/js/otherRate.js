// RateManager class handles localStorage data and table rendering for other rates.
class RateManager {
    constructor() {
        this.rateData = [];  // Initialize as empty array
        this.vehicleTypes = []; // Store vehicle types
        this.editingRow = null;
        this.baseUrl = "";
        this.endpoints = {
            getAll: "/otherRate/all",
            save: "/otherRate/save",
            delete: "/otherRate/delete/",
            vehicleTypes: "/vehicle-type-master/all",
            saveVehicleType: "/vehicle-type-master/add"
        };
        // Pagination settings
        this.itemsPerPage = 20;
        this.currentPage = 1;
        this.selectedItems = new Set();
        this.init();
    }

    // Initialize the manager by fetching data from server first, then local if server fails
    async init() {
        try {
            // Fetch vehicle types first
            await this.fetchVehicleTypes();
            
            // Then fetch rates
            await this.fetchRatesFromServer();
        } catch (error) {
            console.warn("Could not fetch from server, using localStorage:", error);
            this.loadRatesFromLocalStorage();
        } finally {
            this.setupCommissionHandler();
            this.renderTable();
            this.setupInputHandlers();
            this.setupSearchFunctionality();
            this.setupSelectionHandlers();
            this.renderPagination();
        }
    }
    
    // Setup handlers for selection checkboxes
    setupSelectionHandlers() {
        // Setup select all checkbox
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                this.selectAllItems(isChecked);
            });
        }
        
        // Setup delete selected button
        const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
        if (deleteSelectedBtn) {
            deleteSelectedBtn.addEventListener('click', () => {
                this.deleteSelectedItems();
            });
        }
    }
    
    // Select or deselect all items
    selectAllItems(select) {
        const checkboxes = document.querySelectorAll('#rateTableBody input[type="checkbox"]');
        const visibleRows = Array.from(document.querySelectorAll('#rateTableBody tr')).filter(
            row => row.style.display !== 'none'
        );
        
        this.selectedItems.clear();
        
        if (select) {
            visibleRows.forEach(row => {
                const index = parseInt(row.dataset.index);
                if (!isNaN(index)) {
                    this.selectedItems.add(index);
                }
            });
        }
        
        // Update checkboxes
        checkboxes.forEach(checkbox => {
            const row = checkbox.closest('tr');
            const index = parseInt(row.dataset.index);
            checkbox.checked = select && row.style.display !== 'none';
        });
        
        this.updateDeleteButtonState();
    }
    
    // Toggle selection of a single item
    toggleItemSelection(index) {
        if (this.selectedItems.has(index)) {
            this.selectedItems.delete(index);
        } else {
            this.selectedItems.add(index);
        }
        
        this.updateDeleteButtonState();
        this.updateSelectAllCheckbox();
    }
    
    // Update the state of the delete button based on selections
    updateDeleteButtonState() {
        const deleteBtn = document.getElementById('deleteSelectedBtn');
        if (deleteBtn) {
            deleteBtn.disabled = this.selectedItems.size === 0;
        }
    }
    
    // Update the state of the select all checkbox
    updateSelectAllCheckbox() {
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        if (!selectAllCheckbox) return;
        
        const visibleRows = Array.from(document.querySelectorAll('#rateTableBody tr')).filter(
            row => row.style.display !== 'none'
        );
        
        const visibleChecked = visibleRows.every(row => {
            const index = parseInt(row.dataset.index);
            return this.selectedItems.has(index);
        });
        
        selectAllCheckbox.checked = visibleChecked && visibleRows.length > 0;
    }
    
    // Delete all selected items
    async deleteSelectedItems() {
        if (this.selectedItems.size === 0) return;
        
        Swal.fire({
            title: "Are you sure?",
            text: `This will permanently delete ${this.selectedItems.size} selected entries.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, delete them!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Convert Set to Array and sort in descending order to avoid index shifting issues
                    const selectedIndices = Array.from(this.selectedItems).sort((a, b) => b - a);
                    
                    // Delete items one by one, starting from the highest index
                    for (const index of selectedIndices) {
                        const item = this.rateData[index];
                        if (!item) continue;
                        
                        // Only try server delete if we have an ID
                        if (item.id) {
                            const response = await fetch(`${this.baseUrl}${this.endpoints.delete}${item.id}`, {
                                method: "DELETE",
                            });
                            
                            if (!response.ok) {
                                throw new Error(`Server returned ${response.status}`);
                            }
                        }
                        
                        // Remove from local data
                        this.rateData.splice(index, 1);
                    }
                    
                    // If we have more data, sync with server
                    if (this.rateData.length > 0) {
                        await this.saveToServer();
                    } else {
                        this.saveToLocalStorage();
                    }
                    
                    // Clear selection and update UI
                    this.selectedItems.clear();
                    this.updateDeleteButtonState();
                    this.renderTable();
                    this.renderPagination();
                    
                    Swal.fire("Deleted!", "The selected entries have been deleted.", "success").then(() => {
                        // Focus on the search input after deletion
                        setTimeout(() => {
                            const searchInput = document.getElementById('rateSearchInput');
                            if (searchInput) {
                                searchInput.focus();
                            }
                        }, 100);
                    });
                } catch (error) {
                    console.error("Error deleting entries:", error);
                    Swal.fire("Error", "Failed to delete the entries.", "error");
                }
            }
        });
    }
    
    // Render pagination controls
    renderPagination() {
        const container = document.getElementById('paginationContainer');
        if (!container) return;
        
        // Get filtered data based on search
        const searchTerm = document.getElementById('rateSearchInput')?.value?.toLowerCase() || '';
        const filteredData = this.rateData.filter(item => 
            item.type.toLowerCase().includes(searchTerm)
        );
        
        const totalPages = Math.ceil(filteredData.length / this.itemsPerPage);
        
        // If only one page or no data, hide pagination
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }
        
        // Ensure current page is valid
        if (this.currentPage > totalPages) {
            this.currentPage = totalPages;
        }
        
        // Create pagination HTML
        let paginationHTML = '<ul class="pagination">';
        
        // Previous button
        paginationHTML += `
            <li class="pagination-item">
                <a class="pagination-link ${this.currentPage === 1 ? 'disabled' : ''}" 
                   ${this.currentPage === 1 ? '' : 'onclick="rateManager.goToPage(' + (this.currentPage - 1) + ')"'}>
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `;
        
        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        // Adjust start page if we're near the end
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        // First page
        if (startPage > 1) {
            paginationHTML += `
                <li class="pagination-item">
                    <a class="pagination-link" onclick="rateManager.goToPage(1)">1</a>
                </li>
            `;
            
            if (startPage > 2) {
                paginationHTML += `
                    <li class="pagination-item">
                        <span class="pagination-link disabled">...</span>
                    </li>
                `;
            }
        }
        
        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <li class="pagination-item">
                    <a class="pagination-link ${i === this.currentPage ? 'active' : ''}" 
                       onclick="rateManager.goToPage(${i})">${i}</a>
                </li>
            `;
        }
        
        // Last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `
                    <li class="pagination-item">
                        <span class="pagination-link disabled">...</span>
                    </li>
                `;
            }
            
            paginationHTML += `
                <li class="pagination-item">
                    <a class="pagination-link" onclick="rateManager.goToPage(${totalPages})">${totalPages}</a>
                </li>
            `;
        }
        
        // Next button
        paginationHTML += `
            <li class="pagination-item">
                <a class="pagination-link ${this.currentPage === totalPages ? 'disabled' : ''}" 
                   ${this.currentPage === totalPages ? '' : 'onclick="rateManager.goToPage(' + (this.currentPage + 1) + ')"'}>
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;
        
        paginationHTML += '</ul>';
        container.innerHTML = paginationHTML;
    }
    
    // Go to a specific page
    goToPage(page) {
        this.currentPage = page;
        this.renderTable();
        this.renderPagination();
        
        // Scroll to the top of the table
        const tableWrapper = document.querySelector('.table-wrapper');
        if (tableWrapper) {
            tableWrapper.scrollTop = 0;
        }
    }
    
    // Setup search functionality for the rate table
    setupSearchFunctionality() {
        const searchInput = document.getElementById('rateSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.filterRateTable(searchInput.value);
            });
        }
    }
    
    // Filter the rate table based on search input
    filterRateTable(searchTerm) {
        searchTerm = searchTerm.toLowerCase();
        
        // Reset to first page when searching
        this.currentPage = 1;
        
        // Re-render table and pagination with the filter applied
        this.renderTable();
        this.renderPagination();
        
        // Update selection UI
        this.updateSelectAllCheckbox();
    }
    
    // Fetch vehicle types from server
    async fetchVehicleTypes() {
        try {
            const response = await fetch(this.baseUrl + this.endpoints.vehicleTypes);
            if (!response.ok) throw new Error(`Server returned ${response.status}`);
            
            const data = await response.json();
            
            // Extract vehicle types from response
            this.vehicleTypes = data.map(item => {
                if (item && typeof item === 'object' && item.vehicleType) {
                    return item.vehicleType;
                }
                return null;
            }).filter(Boolean); // Filter out null values
            
            // Populate datalist with vehicle types
            this.populateVehicleTypesList();
            
            return this.vehicleTypes;
        } catch (error) {
            console.error("Error fetching vehicle types:", error);
            this.vehicleTypes = [];
            return [];
        }
    }
    
    // Populate the datalist with vehicle types
    populateVehicleTypesList() {
        const datalist = document.getElementById('vehicleTypesList');
        if (!datalist) return;
        
        // Clear existing options
        datalist.innerHTML = '';
        
        // Add options for each vehicle type
        this.vehicleTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            datalist.appendChild(option);
        });
    }
    
    // Save a new vehicle type to the server
    async saveVehicleType(typeName) {
        // Check if type already exists
        if (this.vehicleTypes.includes(typeName)) {
            return true; // Already exists, no need to save
        }
        
        try {
            const response = await fetch(this.baseUrl + this.endpoints.saveVehicleType, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vehicleType: typeName })
            });
            
            if (!response.ok) throw new Error(`Server returned ${response.status}`);
            
            // Add to local array and update datalist
            this.vehicleTypes.push(typeName);
            this.populateVehicleTypesList();
            
            return true;
        } catch (error) {
            console.error("Error saving vehicle type:", error);
            return false;
        }
    }

    // Fetch rates data from the server
    async fetchRatesFromServer() {
        try {
            const response = await fetch(this.baseUrl + this.endpoints.getAll);
            if (!response.ok) throw new Error(`Server returned ${response.status}`);
            this.rateData = await response.json();
            this.saveToLocalStorage(); // Update localStorage with latest server data
            return this.rateData;
        } catch (error) {
            console.error("Error fetching rates from server:", error);
            throw error;
        }
    }

    // Load rates from localStorage (fallback)
    loadRatesFromLocalStorage() {
        const savedRates = localStorage.getItem('vehicleRates');
        if (savedRates) {
            this.rateData = JSON.parse(savedRates);
        }
    }

    // Save to both localStorage and server
    async saveToServer(data = this.rateData) {
        try {
            const response = await fetch(this.baseUrl + this.endpoints.save, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) throw new Error(`Server returned ${response.status}`);
            
            // Update our local data with fresh data from server
            await this.fetchRatesFromServer();
            this.showNotification("Rates updated successfully!");
            return true;
        } catch (error) {
            console.error("Error saving rates to server:", error);
            this.showNotification("Error saving rates to server", true);
            return false;
        }
    }

    // Save to localStorage
    saveToLocalStorage() {
        try {
            localStorage.setItem('vehicleRates', JSON.stringify(this.rateData));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    // No commission rate handler needed - all fields are entered manually
    setupCommissionHandler() {
        // Commission functionality removed as requested
    }

    // Prevent unwanted key events on number inputs and sanitize input value
    setupInputHandlers() {
        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('wheel', (e) => e.preventDefault());
            input.addEventListener('keydown', (e) => {
                const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', '.'];
                if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key)) {
                    e.preventDefault();
                }
            });
            input.addEventListener('input', function() {
                let value = this.value.replace(/[^\d.]/g, '');
                const parts = value.split('.');
                if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('');
                if (value.startsWith('.')) value = '0' + value;
                this.value = value;
            });
        });
    }

    // All rate calculations removed - manual entry for all fields
    async updateAllRates(newRate) {
        // Function removed - no automatic calculation needed
    }

    // No automatic updates of lorry rates
    updateAllLorryRates() {
        // Function removed - no automatic calculation needed
    }

    // No automatic calculation of lorry rates
    calculateLorryRate(compRate) {
        // Function removed - no automatic calculation needed
        return compRate; // Return the same value for backward compatibility
    }

    // Check empty state and update UI accordingly
    checkEmptyState() {
        const table = document.querySelector('.rate-table');
        const noDataMessage = document.getElementById('noDataMessage');
        const paginationContainer = document.getElementById('paginationContainer');
        
        // Get filtered data based on search
        const searchTerm = document.getElementById('rateSearchInput')?.value?.toLowerCase() || '';
        const filteredData = this.rateData.filter(item => 
            item.type.toLowerCase().includes(searchTerm)
        );
        
        if (filteredData.length === 0) {
            // Show empty state message and hide table and pagination
            if (table) table.style.display = 'none';
            if (noDataMessage) noDataMessage.classList.add('show');
            if (paginationContainer) paginationContainer.style.display = 'none';
        } else {
            // Show table and hide empty state message
            if (table) table.style.display = 'table';
            if (noDataMessage) noDataMessage.classList.remove('show');
            if (paginationContainer) paginationContainer.style.display = 'flex';
        }
    }

    // Render table rows based on rateData with pagination
    renderTable(highlight = false) {
        const tbody = document.getElementById('rateTableBody');
        if (!Array.isArray(this.rateData)) {
            this.rateData = [];
        }
        
        // Get filtered data based on search
        const searchTerm = document.getElementById('rateSearchInput')?.value?.toLowerCase() || '';
        const filteredData = this.rateData.filter(item => 
            item.type.toLowerCase().includes(searchTerm)
        );
        
        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, filteredData.length);
        const paginatedData = filteredData.slice(startIndex, endIndex);
        
        // Render table rows
        tbody.innerHTML = paginatedData.map((rate, paginatedIndex) => {
            // Find the original index in the full data array
            const originalIndex = this.rateData.findIndex(item => 
                item === rate || (item.id && rate.id && item.id === rate.id)
            );
            
            const isSelected = this.selectedItems.has(originalIndex);
            
            return `
                <tr data-index="${originalIndex}" ${highlight ? 'class="table-warning"' : ''} data-id="${rate.id || ''}">
                    <td class="select-column">
                        <input type="checkbox" ${isSelected ? 'checked' : ''} 
                               onchange="rateManager.toggleItemSelection(${originalIndex})">
                    </td>
                    <td>${rate.type}</td>
                    <td class="rate-value">${this.formatAmount(rate.cdCompRate)}</td>
                    <td class="rate-value">${this.formatAmount(rate.cdLorryRate)}</td>
                    <td class="rate-value">${this.formatAmount(rate.waitingCompRate)}</td>
                    <td class="rate-value">${this.formatAmount(rate.waitingLorryRate)}</td>
                    <td class="actions">
                        <button onclick="rateManager.editRow(${originalIndex})" class="btn-action btn-edit" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="rateManager.deleteRow(${originalIndex})" class="btn-action btn-delete" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        this.checkEmptyState();
        this.updateSelectAllCheckbox();
        this.updateDeleteButtonState();
    }

    // Expose a method to add a new rate row
    async addNewRate() {
        if (this.editingRow !== null) {
            if (!confirm('Discard current changes?')) return;
            this.cancelEdit(this.editingRow);
        }
        
        // Create a new empty rate object
        const newRate = {
            type: '',
            cdCompRate: '',
            cdLorryRate: '',
            waitingCompRate: '',
            waitingLorryRate: ''
        };
        
        // Add the new rate at the beginning of the array instead of the end
        this.rateData.unshift(newRate);
        
        // Make sure the table is visible (not the empty state)
        const table = document.querySelector('.rate-table');
        const noDataMessage = document.getElementById('noDataMessage');
        const paginationContainer = document.getElementById('paginationContainer');
        
        if (table && noDataMessage) {
            table.style.display = 'table';
            noDataMessage.classList.remove('show');
            if (paginationContainer) paginationContainer.style.display = 'flex';
        }
        
        // Always go to the first page when adding a new rate
        this.currentPage = 1;
        
        // Render the table with the new row and update pagination
        this.renderTable();
        this.renderPagination();
        
        // Scroll to the top of the table to ensure the new row is visible
        const tableWrapper = document.querySelector('.table-wrapper');
        if (tableWrapper) {
            tableWrapper.scrollTop = 0;
        }
        
        // Edit the first row (index 0)
        this.editRow(0);
    }

    // Cancel editing a row and restore original data if needed
    cancelEdit(index) {
        // Check if this is a new empty row (could be at index 0 since we're adding at the beginning)
        if (index === 0 && !this.rateData[index].type.trim()) {
            // Remove the first element if it's empty
            this.rateData.shift();
        } else if (index === this.rateData.length - 1 && !this.rateData[index].type.trim()) {
            // For backward compatibility, also check the last element
            this.rateData.pop();
        }
        this.originalData = null;
        this.editingRow = null;
        this.renderTable();
        this.renderPagination();
        
        // Focus on the search input after canceling to prevent focus from going to the Add New Rate button
        setTimeout(() => {
            const searchInput = document.getElementById('rateSearchInput');
            if (searchInput) {
                searchInput.focus();
            }
        }, 100);
    }

    // Edit a row in the table for inline editing
    editRow(index) {
        if (this.editingRow !== null) {
            if (!confirm('Discard current changes?')) return;
            this.cancelEdit(this.editingRow);
        }
        const row = document.querySelector(`tr[data-index="${index}"]`);
        this.originalData = { ...this.rateData[index] };
        this.editingRow = index;
        const cells = row.cells;
        
        // Keep the checkbox cell as is (cells[0])
        cells[1].innerHTML = `<input type="text" class="edit-input vehicle-type-input" value="${this.rateData[index].type || ''}" placeholder="Enter Vehicle Type" list="vehicleTypesList" required>`;
        cells[2].innerHTML = `<input type="number" class="edit-input cdCompRate" value="${this.rateData[index].cdCompRate || ''}" step="0.01" placeholder="Company Rate" required>`;
        cells[3].innerHTML = `<input type="number" class="edit-input cdLorryRate" value="${this.rateData[index].cdLorryRate || ''}" step="0.01" placeholder="Lorry Rate" required>`;
        cells[4].innerHTML = `<input type="number" class="edit-input waitingCompRate" value="${this.rateData[index].waitingCompRate || ''}" step="0.01" placeholder="Company Rate" required>`;
        cells[5].innerHTML = `<input type="number" class="edit-input waitingLorryRate" value="${this.rateData[index].waitingLorryRate || ''}" step="0.01" placeholder="Lorry Rate" required>`;
        cells[6].innerHTML = `
            <button onclick="rateManager.saveRow(${index})" class="btn-action btn-save" title="Save">
                <i class="fas fa-check"></i>
            </button>
            <button onclick="rateManager.cancelEdit(${index})" class="btn-action btn-cancel" title="Cancel">
                <i class="fas fa-times"></i>
            </button>
        `;
        row.classList.add('editing');
        
        // Get all input fields in the row
        const inputs = row.querySelectorAll('input');
        const firstInput = inputs[0];
        
        // Focus and select the first input field
        setTimeout(() => {
            firstInput.focus();
            firstInput.select();
        }, 50);
        
        // Add keyboard navigation (Enter and Backspace)
        inputs.forEach((input, inputIndex) => {
            // Handle Enter key
            input.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    // Move to next input or save if last input
                    if (inputIndex < inputs.length - 1) {
                        inputs[inputIndex + 1].focus();
                        inputs[inputIndex + 1].select();
                    } else {
                        // If last input, save the row
                        this.saveRow(index);
                    }
                }
                
                // Handle Backspace key when input is empty
                if (event.key === 'Backspace' && input.value === '') {
                    event.preventDefault();
                    // Move to previous input if available
                    if (inputIndex > 0) {
                        inputs[inputIndex - 1].focus();
                        inputs[inputIndex - 1].select();
                    }
                }
            });
            
            // Format number inputs
            if (input.type === 'number') {
                input.addEventListener('input', function() {
                    let value = this.value.replace(/[^\d.]/g, '');
                    if (value.startsWith('.')) value = '0' + value;
                    const parts = value.split('.');
                    if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('');
                    this.value = value;
                    // No automatic calculation of lorry rates - all fields are independent
                });
                
                input.addEventListener('blur', function() {
                    const numValue = parseFloat(this.value) || 0;
                    this.value = numValue.toFixed(2);
                });
            }
        });
    }

    // Validate row data before saving
    validateRowData(data) {
        const errors = [];
        if (!data.type.trim()) {
            errors.push("Vehicle type is required");
        }
        ['cdCompRate', 'cdLorryRate', 'waitingCompRate', 'waitingLorryRate'].forEach(field => {
            if (isNaN(parseFloat(data[field]))) {
                errors.push(`Invalid value for ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
            }
        });
        return errors;
    }

    // Save an edited row
    async saveRow(index) {
        const row = document.querySelector(`tr[data-index="${index}"]`);
        const inputs = row.querySelectorAll('input');
        const newData = {
            id: this.rateData[index].id || null,
            type: inputs[1].value.trim(), // Adjusted for checkbox in first column
            cdCompRate: parseFloat(inputs[2].value) || 0,
            cdLorryRate: parseFloat(inputs[3].value) || 0,
            waitingCompRate: parseFloat(inputs[4].value) || 0,
            waitingLorryRate: parseFloat(inputs[5].value) || 0
        };
        
        const errors = this.validateRowData(newData);
        if (errors.length > 0) {
            this.showNotification(errors.join('\n'), true);
            return;
        }

        try {
            // No automatic calculation - use the values entered by the user
            
            // Check if vehicle type is new and save it to Vehicle Type Master
            if (newData.type && !this.vehicleTypes.includes(newData.type)) {
                await this.saveVehicleType(newData.type);
            }
            
            // Update the local data
            this.rateData[index] = newData;
            
            // Save to server
            const success = await this.saveToServer();
            
            if (success) {
                this.editingRow = null;
                this.renderTable();
                this.renderPagination();
                
                const updatedRow = document.querySelector(`tr[data-index="${index}"]`);
                if (updatedRow) {
                    updatedRow.classList.add('highlight');
                    setTimeout(() => updatedRow.classList.remove('highlight'), 1500);
                }
                
                this.showNotification('Rate updated successfully');
                
                // Focus on the search input after saving to prevent focus from going to the Add New Rate button
                setTimeout(() => {
                    const searchInput = document.getElementById('rateSearchInput');
                    if (searchInput) {
                        searchInput.focus();
                    }
                }, 100);
            }
        } catch (error) {
            console.error('Error saving row:', error);
            this.showNotification('Error saving changes', true);
        }
    }

    // Delete a row from the table and server
    async deleteRow(index) {
        const item = this.rateData[index];
        if (!item) return;

        Swal.fire({
            title: "Are you sure?",
            text: "This will permanently delete the entry.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Only try server delete if we have an ID
                    if (item.id) {
                        const response = await fetch(`${this.baseUrl}${this.endpoints.delete}${item.id}`, {
                            method: "DELETE",
                        });
                        
                        if (!response.ok) {
                            throw new Error(`Server returned ${response.status}`);
                        }
                    }
                    
                    // Remove from local data 
                    this.rateData.splice(index, 1);
                    
                    // Remove from selected items if it was selected
                    if (this.selectedItems.has(index)) {
                        this.selectedItems.delete(index);
                    }
                    
                    // Update indices in selectedItems set for items after the deleted one
                    const newSelectedItems = new Set();
                    this.selectedItems.forEach(selectedIndex => {
                        if (selectedIndex < index) {
                            newSelectedItems.add(selectedIndex);
                        } else if (selectedIndex > index) {
                            newSelectedItems.add(selectedIndex - 1);
                        }
                    });
                    this.selectedItems = newSelectedItems;
                    
                    // If we have more data, sync with server
                    if (this.rateData.length > 0) {
                        await this.saveToServer();
                    } else {
                        this.saveToLocalStorage();
                    }
                    
                    // Check if we need to adjust the current page
                    const searchTerm = document.getElementById('rateSearchInput')?.value?.toLowerCase() || '';
                    const filteredData = this.rateData.filter(item => 
                        item.type.toLowerCase().includes(searchTerm)
                    );
                    
                    const totalPages = Math.ceil(filteredData.length / this.itemsPerPage);
                    if (this.currentPage > totalPages && totalPages > 0) {
                        this.currentPage = totalPages;
                    }
                    
                    this.renderTable();
                    this.renderPagination();
                    this.updateDeleteButtonState();
                    
                    Swal.fire("Deleted!", "The entry has been deleted.", "success").then(() => {
                        // Focus on the search input after deletion to prevent focus from going to the Add New Rate button
                        setTimeout(() => {
                            const searchInput = document.getElementById('rateSearchInput');
                            if (searchInput) {
                                searchInput.focus();
                            }
                        }, 100);
                    });
                } catch (error) {
                    console.error("Error deleting entry:", error);
                    Swal.fire("Error", "Failed to delete the entry.", "error");
                }
            }
        });
    }

    // Format a number to 2 decimal places
    formatAmount(value) {
        if (isNaN(value) || value === null) return '0.00';
        return parseFloat(value).toFixed(2);
    }

    // Show a notification message
    showNotification(message, isError = false) {
        let notification = document.getElementById("notification");
        
        if (!notification) {
            notification = document.createElement("div");
            notification.id = "notification";
            document.body.appendChild(notification);
        }

        notification.innerHTML = `<i class="fas fa-${isError ? "exclamation-circle" : "check-circle"}"></i> <span>${message}</span>`;
        notification.className = isError ? "notification error show" : "notification show";

        setTimeout(() => notification.classList.remove("show"), 3000);
    }
}

// Global initialization for RateManager and global functions
window.onload = () => {
    try {
        window.rateManager = new RateManager();
        
        // Set up event listeners for all Add New Rate buttons
        document.querySelectorAll('.btn-add, .btn-add-empty').forEach(btn => {
            btn.addEventListener('click', () => rateManager.addNewRate());
        });
        
        // Add keyboard navigation to search input
        const searchInput = document.getElementById('rateSearchInput');
        if (searchInput) {
            // Focus on the search input when the page loads
            // This prevents the focus from going to the Add New Rate button
            setTimeout(() => {
                searchInput.focus();
            }, 100);
            
            searchInput.addEventListener('keydown', (event) => {
                // When Enter is pressed in search box, focus on Add New Rate button
                if (event.key === 'Enter') {
                    event.preventDefault();
                    const addButton = document.querySelector('.search-container .btn-add');
                    if (addButton) {
                        addButton.focus();
                    }
                }
            });
        }
        
        // Remove the Save button from DOM
        const saveBtn = document.getElementById('saveRatesBtn');
        if (saveBtn) saveBtn.style.display = 'none';
    } catch (error) {
        console.error('Error initializing RateManager:', error);
        const notification = document.getElementById('notification') || document.createElement('div');
        notification.innerHTML = `<i class="fas fa-exclamation-circle"></i><span>Error initializing application</span>`;
        notification.classList.add('show', 'error');
        document.body.appendChild(notification);
    }
};

// Global function to show notification (for backward compatibility)
function showNotification(message, isError = false) {
    if (window.rateManager) {
        window.rateManager.showNotification(message, isError);
    } else {
        let notification = document.getElementById("notification");
        
        if (!notification) {
            notification = document.createElement("div");
            notification.id = "notification";
            document.body.appendChild(notification);
        }

        notification.innerHTML = `<i class="fas fa-${isError ? "exclamation-circle" : "check-circle"}"></i> <span>${message}</span>`;
        notification.className = isError ? "notification error show" : "notification show";

        setTimeout(() => notification.classList.remove("show"), 3000);
    }
}