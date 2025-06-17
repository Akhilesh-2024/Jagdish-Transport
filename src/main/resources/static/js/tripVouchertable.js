console.log('Trip Vouchers table JS loaded successfully!');


let sortConfig = {
    column: null,
    direction: 'asc'
};
let editingRow = null;
let apiBaseUrl = '/api/trip-vouchers';
let currentVouchers = [];

// Initialize table
document.addEventListener('DOMContentLoaded', () => {
    initializeTable();
    initializeDateFilters();
    setupEventListeners();
    
    // Initialize edit modal
    initializeEditModal();
});

function initializeTable() {
    // Fetch data from API
    fetchVouchers();
}

function initializeDateFilters() {
    // Set default date range (current month)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const fromDateInput = document.getElementById('fromDate');
    const toDateInput = document.getElementById('toDate');
    
    fromDateInput.valueAsDate = firstDay;
    toDateInput.valueAsDate = today;
}

function setupEventListeners() {
    // Date filter and search listeners
    document.getElementById('searchBtn').addEventListener('click', applyFilters);
    document.getElementById('resetBtn').addEventListener('click', resetFilters);
    
    // Add date change listeners
    document.getElementById('fromDate').addEventListener('change', applyFilters);
    document.getElementById('toDate').addEventListener('change', applyFilters);
    
    // Add live search with debounce
    document.getElementById('searchInput').addEventListener('input', debounce(function() {
        if (this.value.trim().length >= 2 || this.value.trim().length === 0) {
            applySearchFilter();
        }
    }, 300));
    
    // Column sort listeners
    const sortableHeaders = document.querySelectorAll('th[data-column]');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            if (header.dataset.column) {
                sortTable(header.dataset.column);
            }
        });
    });
    
    // Setup keyboard navigation for the table
    setupTableKeyboardNavigation();
}

// No longer needed as we redirect to the trip voucher page for editing

// Debounce function to limit API calls during search typing
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Function to filter vouchers by search term (MR No, Vehicle No)
function filterVouchersBySearch(vouchers, searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
        console.log('No search term, returning all vouchers');
        return vouchers;
    }
    
    const searchLower = searchTerm.toLowerCase().trim();
    console.log(`Filtering vouchers with search term: "${searchTerm}"`);
    
    const filteredVouchers = vouchers.filter(voucher => {
        // Search in MR No
        const mrNo = (voucher.mrNo || '').toString().toLowerCase();
        
        // Search in Vehicle No (handle both with and without spaces)
        const vehicleNo = (voucher.vehicleNo || '').toLowerCase();
        const vehicleNoNoSpaces = vehicleNo.replace(/\s+/g, '');
        const searchNoSpaces = searchLower.replace(/\s+/g, '');
        
        // Search in Party Name (toBeBilled) for backward compatibility
        const partyName = (voucher.toBeBilled || '').toLowerCase();
        
        // Check if search term matches any of these fields
        const mrMatch = mrNo.includes(searchLower);
        const vehicleMatch = vehicleNo.includes(searchLower) || vehicleNoNoSpaces.includes(searchNoSpaces);
        const partyMatch = partyName.includes(searchLower);
        
        const isMatch = mrMatch || vehicleMatch || partyMatch;
        
        if (isMatch) {
            console.log(`Match found: MR: ${voucher.mrNo}, Vehicle: ${voucher.vehicleNo}, Party: ${voucher.toBeBilled}`);
        }
        
        return isMatch;
    });
    
    console.log(`Filtered ${filteredVouchers.length} vouchers from ${vouchers.length} total`);
    return filteredVouchers;
}

async function fetchVouchers(filterParams = null) {
    try {
        showLoader();
        
        let url = apiBaseUrl;
        
        // Apply date filters if present
        if (filterParams && filterParams.fromDate && filterParams.toDate) {
            url = `${apiBaseUrl}/filter?fromDate=${filterParams.fromDate}&toDate=${filterParams.toDate}`;
            // Note: We'll handle search term filtering on the frontend for better vehicle number search
        }
        
        console.log(`Fetching vouchers from URL: ${url}`);
        
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response:', errorText);
            throw new Error(`Failed to fetch vouchers: ${response.statusText}`);
        }
        
        const vouchers = await response.json();
        console.log(`Received ${vouchers.length} vouchers from server`);
        currentVouchers = vouchers;
        
        // Apply search filtering on the frontend
        let filteredVouchers = vouchers;
        if (filterParams && filterParams.searchTerm) {
            filteredVouchers = filterVouchersBySearch(vouchers, filterParams.searchTerm);
        }
        
        updateTableState(filteredVouchers);
        hideLoader();
    } catch (error) {
        console.error('Error fetching vouchers:', error);
        showNotification('Error fetching data: ' + error.message, true);
        updateTableState([]);
        hideLoader();
    }
}

function showLoader() {
    // Create loader if it doesn't exist
    if (!document.getElementById('dataLoader')) {
        const loader = document.createElement('div');
        loader.id = 'dataLoader';
        loader.className = 'data-loader';
        loader.innerHTML = '<div class="spinner"></div><p>Loading data...</p>';
        document.body.appendChild(loader);
    }
    document.getElementById('dataLoader').style.display = 'flex';
}

function hideLoader() {
    const loader = document.getElementById('dataLoader');
    if (loader) {
        loader.style.display = 'none';
    }
}

function applyFilters() {
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;
    const searchTerm = document.getElementById('searchInput').value.trim();
    
    if (!fromDate || !toDate) {
        showNotification('Please select both From and To dates', true);
        return;
    }
    
    if (new Date(fromDate) > new Date(toDate)) {
        showNotification('From date cannot be after To date', true);
        return;
    }
    
    console.log(`Applying filters: fromDate=${fromDate}, toDate=${toDate}, searchTerm=${searchTerm}`);
    fetchVouchers({ fromDate, toDate, searchTerm });
}

function applySearchFilter() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    console.log(`Applying search filter: searchTerm=${searchTerm}`);
    
    // Filter the current vouchers without refetching from server
    const filteredVouchers = filterVouchersBySearch(currentVouchers, searchTerm);
    updateTableState(filteredVouchers);
}

function resetFilters() {
    // Reset date inputs to current month
    initializeDateFilters();
    
    // Clear search input
    document.getElementById('searchInput').value = '';
    
    // Fetch all vouchers
    fetchVouchers();
}

function updateTableState(vouchers) {
    const elements = {
        tbody: document.querySelector('#tripVoucherTable tbody'),
        tfoot: document.querySelector('#tripVoucherTable tfoot'),
        summary: document.getElementById('summaryContainer'),
        table: document.getElementById('tripVoucherTable'),
        noData: document.getElementById('noDataMessage')
    };

    // Check for null or empty vouchers
    if (!vouchers || !Array.isArray(vouchers) || vouchers.length === 0) {
        // Hide table and summary
        elements.table.style.display = 'none';
        elements.summary.style.display = 'none';
        elements.tfoot.style.display = 'none';
        elements.noData.style.display = 'block';

        // Clear summary values
        document.getElementById('totalCompanyAmount').textContent = '0.00';
        document.getElementById('totalLorryAmount').textContent = '0.00';
        document.getElementById('netBalance').textContent = '0.00';
        return;
    }

    // Show table and summary when data exists
    elements.table.style.display = 'table';
    elements.summary.style.display = 'block';
    elements.tfoot.style.display = 'table-footer-group';
    elements.noData.style.display = 'none';

    updateTableContent(elements.tbody, vouchers);
    updateTotals(vouchers);
    updateSummary(vouchers);
}

// In the updateTableContent function, change the row template to reflect your desired changes
function updateTableContent(tbody, vouchers) {
    if (!vouchers || !Array.isArray(vouchers)) {
        console.error('Invalid vouchers data:', vouchers);
        return;
    }

    try {
        tbody.innerHTML = vouchers.map((voucher, index) => {
            // Calculate Extra amount (Waiting + C/D/Wt + Khoti + Hamali + Extra)
            const extraAmount = 
                parseFloat(voucher.companyWaiting || 0) + 
                parseFloat(voucher.companyCDWT || 0) + 
                parseFloat(voucher.khoti || 0) + 
                parseFloat(voucher.hamali || 0) + 
                parseFloat(voucher.extra || 0);
            
            // Calculate Company amount (Freight + Extra)
            const companyAmount = parseFloat(voucher.freight || 0) + extraAmount;
            
            // Always show lorryAmount in Lorry column, regardless of payment type
            const lorryAmount = parseFloat(voucher.lorryAmount || 0);
            
            // Show vehicle number in Billed To column when:
            // 1. Payment type is Cash, OR
            // 2. Advance is added (greater than 0)
            const hasAdvance = parseFloat(voucher.advance || 0) > 0;
            const billedTo = (voucher.paymentType === 'Cash' || hasAdvance)
                ? voucher.vehicleNo || '' 
                : voucher.toBeBilled || '';
            
            return `
            <tr id="row-${voucher.id}" tabindex="0" data-voucher-id="${voucher.id}" class="voucher-row">
                <td>${formatDate(voucher.timestamp)}</td>
                <td data-mrno="${voucher.mrNo || ''}">${voucher.mrNo || index + 1}</td>
                <td>${voucher.vehicleNo || ''}</td>
                <td>${voucher.vehicleType || ''}</td>
                <td>${voucher.fromLocation || ''}</td>
                <td>${voucher.toLocation || ''}</td>
                <td>${billedTo}</td>
                <td>${formatAmount(voucher.advance || 0)}</td>
                <td>${formatAmount(voucher.freight || 0)}</td>
                <td>${formatAmount(extraAmount)}</td>
                <td>${formatAmount(companyAmount)}</td>
                <td>${formatAmount(lorryAmount)}</td>
                <td class="actions">
                 
                    <button onclick="editVoucher(${voucher.id})" class="btn-icon btn-edit" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteVoucher(${voucher.id})" class="btn-icon btn-delete" title="Delete">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `}).join('');
        
        // After updating the table content, add double-click event listeners to rows
        const rows = tbody.querySelectorAll('tr.voucher-row');
        rows.forEach(row => {
            row.addEventListener('dblclick', function() {
                const voucherId = parseInt(this.dataset.voucherId);
                if (!isNaN(voucherId)) {
                    // Use the editVoucher function which redirects to the edit page
                    editVoucher(voucherId);
                }
            });
        });
    } catch (error) {
        console.error('Error updating table:', error);
        showNotification('Error updating table data', true);
    }
}

function calculateCompanyTotal(voucher) {
    return (
        parseFloat(voucher.freight || 0) +
        parseFloat(voucher.companyWaiting || 0) +
        parseFloat(voucher.companyCDWT || 0) +
        parseFloat(voucher.khoti || 0) +
        parseFloat(voucher.hamali || 0) +
        parseFloat(voucher.extra || 0)
    );
}


function calculateLorryTotal(voucher) {
    return (
        parseFloat(voucher.lorryFreight || 0) +
        parseFloat(voucher.lorryWaiting || 0) +
        parseFloat(voucher.lorryCDWT || 0) +
        parseFloat(voucher.lorryAmount || 0) -
        parseFloat(voucher.lorryCommission || 0) +
        parseFloat(voucher.lorryExtra || 0)
    );
}


function updateTotals(vouchers) {
    // Initialize all totals
    let totalAdvance = 0;
    let totalCoFreight = 0;
    let totalExtra = 0;
    let totalCompany = 0;
    let totalLorry = 0;

    vouchers.forEach(voucher => {
        // Calculate Extra amount (Waiting + C/D/Wt + Khoti + Hamali + Extra)
        const extraAmount = 
            parseFloat(voucher.companyWaiting || 0) + 
            parseFloat(voucher.companyCDWT || 0) + 
            parseFloat(voucher.khoti || 0) + 
            parseFloat(voucher.hamali || 0) + 
            parseFloat(voucher.extra || 0);
        
        // Calculate Company amount (Freight + Extra)
        const companyAmount = parseFloat(voucher.freight || 0) + extraAmount;
        
        // Calculate Lorry amount
        const lorryAmount = parseFloat(voucher.lorryAmount || 0);
        
        // Add to totals
        totalAdvance += parseFloat(voucher.advance || 0);
        totalCoFreight += parseFloat(voucher.freight || 0);
        totalExtra += extraAmount;
        totalCompany += companyAmount;
        totalLorry += lorryAmount;
    });
    
    // Update footer cells
    document.getElementById('totalAdvance').textContent = formatAmount(totalAdvance);
    document.getElementById('totalCoFreight').textContent = formatAmount(totalCoFreight);
    document.getElementById('totalExtra').textContent = formatAmount(totalExtra);
    document.getElementById('totalCompany').textContent = formatAmount(totalCompany);
    document.getElementById('totalLorry').textContent = formatAmount(totalLorry);
}

function updateSummary(vouchers) {
    // Calculate summary values
    let totalCompanyAmount = 0;
    let totalAdvance = 0;
    let totalCommission = 0;
    
    vouchers.forEach(voucher => {
        // Calculate Company amount
        const companyAmount = calculateCompanyTotal(voucher);
        
        // Add to totals
        totalCompanyAmount += companyAmount;
        totalAdvance += parseFloat(voucher.advance || 0);
        totalCommission += parseFloat(voucher.lorryCommission || 0);
    });
    
    // Calculate net balance
    const netBalance = totalCompanyAmount - totalAdvance - totalCommission;
    
    // Update summary display
    document.getElementById('totalCompanyAmount').textContent = formatAmount(totalCompanyAmount);
    document.getElementById('totalAdvance').textContent = formatAmount(totalAdvance);
    document.getElementById('totalCommission').textContent = formatAmount(totalCommission);
    document.getElementById('netBalance').textContent = formatAmount(netBalance);
}

function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}

function formatAmount(amount) {
    return parseFloat(amount).toFixed(2);
}

function sortTable(column) {
    // Toggle direction if same column clicked again
    if (sortConfig.column === column) {
        sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
        sortConfig.column = column;
        sortConfig.direction = 'asc';
    }
    
    // Sort the vouchers array
    const sortedVouchers = [...currentVouchers].sort((a, b) => {
        let valueA, valueB;
        
        // Handle special columns
        switch (column) {
            case 'date':
                valueA = new Date(a.timestamp || 0).getTime();
                valueB = new Date(b.timestamp || 0).getTime();
                break;
            case 'invoiceNumber':
                valueA = a.mrNo || '';
                valueB = b.mrNo || '';
                break;
            case 'vehicleNo':
                valueA = a.vehicleNo || '';
                valueB = b.vehicleNo || '';
                break;
            case 'type':
                valueA = a.vehicleType || '';
                valueB = b.vehicleType || '';
                break;
            case 'from':
                valueA = a.fromLocation || '';
                valueB = b.fromLocation || '';
                break;
            case 'to':
                valueA = a.toLocation || '';
                valueB = b.toLocation || '';
                break;
            case 'billedTo':
                // Use toBeBilled for Credit, vehicleNo for Cash
                valueA = (a.paymentType === 'Cash' || parseFloat(a.advance || 0) > 0) ? (a.vehicleNo || '') : (a.toBeBilled || '');
                valueB = (b.paymentType === 'Cash' || parseFloat(b.advance || 0) > 0) ? (b.vehicleNo || '') : (b.toBeBilled || '');
                break;
            case 'advance':
                valueA = parseFloat(a.advance || 0);
                valueB = parseFloat(b.advance || 0);
                break;
            case 'freight':
                valueA = parseFloat(a.freight || 0);
                valueB = parseFloat(b.freight || 0);
                break;
            case 'extra':
                valueA = parseFloat(a.companyWaiting || 0) + parseFloat(a.companyCDWT || 0) + parseFloat(a.khoti || 0) + parseFloat(a.hamali || 0) + parseFloat(a.extra || 0);
                valueB = parseFloat(b.companyWaiting || 0) + parseFloat(b.companyCDWT || 0) + parseFloat(b.khoti || 0) + parseFloat(b.hamali || 0) + parseFloat(b.extra || 0);
                break;
            case 'company':
                valueA = parseFloat(a.freight || 0) + parseFloat(a.companyWaiting || 0) + parseFloat(a.companyCDWT || 0) + parseFloat(a.khoti || 0) + parseFloat(a.hamali || 0) + parseFloat(a.extra || 0);
                valueB = parseFloat(b.freight || 0) + parseFloat(b.companyWaiting || 0) + parseFloat(b.companyCDWT || 0) + parseFloat(b.khoti || 0) + parseFloat(b.hamali || 0) + parseFloat(b.extra || 0);
                break;
            case 'lorry':
                valueA = parseFloat(a.lorryAmount || 0);
                valueB = parseFloat(b.lorryAmount || 0);
                break;
            default:
                valueA = a[column] || '';
                valueB = b[column] || '';
        }
        
        // Compare values based on direction
        if (sortConfig.direction === 'asc') {
            return valueA > valueB ? 1 : -1;
        } else {
            return valueA < valueB ? 1 : -1;
        }
    });
    
    // Update table with sorted data
    updateTableState(sortedVouchers);
    
    // Update sort indicators in the table header
    updateSortIndicators();
}

function updateSortIndicators() {
    // Remove all sort indicators
    document.querySelectorAll('th[data-column]').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
    });
    
    // Add indicator to current sort column
    if (sortConfig.column) {
        const th = document.querySelector(`th[data-column="${sortConfig.column}"]`);
        if (th) {
            th.classList.add(sortConfig.direction === 'asc' ? 'sort-asc' : 'sort-desc');
        }
    }
}

function showNotification(message, isError = false) {
    // Create notification element if it doesn't exist
    let notificationEl = document.getElementById('notification');
    if (!notificationEl) {
        notificationEl = document.createElement('div');
        notificationEl.id = 'notification';
        notificationEl.className = 'notification';
        document.body.appendChild(notificationEl);
    }
    
    // Set content and show
    notificationEl.innerHTML = `
        <div class="notification-content">
            <i class="fas ${isError ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Add error class if needed
    if (isError) {
        notificationEl.classList.add('error');
    } else {
        notificationEl.classList.remove('error');
    }
    
    // Show notification
    notificationEl.classList.add('show');
    notificationEl.style.display = 'block';
    
    // Add close button event
    const closeBtn = notificationEl.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            notificationEl.classList.remove('show');
            setTimeout(() => {
                notificationEl.style.display = 'none';
            }, 300);
        });
    }
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        notificationEl.style.display = 'none';
    }, 5000);
}

// View voucher - open in the same tab
function viewVoucher(id) {
    // Redirect to the tripVoucher page with the voucher ID as a parameter
    window.location.href = `/tripVoucher?id=${id}`;
}

// Edit voucher - redirect to trip voucher page in edit mode
function editVoucher(id) {
    console.log('Redirecting to edit voucher:', id);
    
    // Redirect to the tripVoucher page with the voucher ID as a parameter for editing
    // Ensure we're using the correct case for the URL
    window.location.href = `/tripVoucher?id=${id}&mode=edit`;
}

// Initialize edit modal functionality
function initializeEditModal() {
    // Get the edit modal
    const editModal = document.getElementById('editModal');
    if (!editModal) return;
    
    // Get the close button
    const closeBtn = editModal.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            editModal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === editModal) {
            editModal.style.display = 'none';
        }
    });
    
    // Initialize payment type change handler
    const editPaymentType = document.getElementById('editPaymentType');
    if (editPaymentType) {
        // Add change event listener
        editPaymentType.addEventListener('change', function() {
            // Call the function to update form fields based on payment type
            updateEditFormByPaymentType(this.value);
        });
        
        // Initialize fields based on current payment type when modal is shown
        // Use MutationObserver to detect when the modal becomes visible
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'style' && 
                    editModal.style.display === 'block') {
                    // Modal is now visible, initialize fields based on current payment type
                    updateEditFormByPaymentType(editPaymentType.value);
                }
            });
        });
        
        // Start observing the modal for style changes
        observer.observe(editModal, { attributes: true });
    }
}

// Function to update edit form fields based on payment type
function updateEditFormByPaymentType(paymentType) {
    console.log(`Updating edit form for payment type: ${paymentType}`);
    
    // Get all form fields
    const companyFields = {
        companyAmount: document.getElementById('editCompanyTotal'),
        freight: document.getElementById('editFreight'),
        companyWaiting: document.getElementById('editCompanyWaiting'),
        companyCDWT: document.getElementById('editCompanyCDWT'),
        khoti: document.getElementById('editKhoti'),
        hamali: document.getElementById('editHamali'),
        extra: document.getElementById('editExtra')
    };
    
    const lorryFields = {
        lorryFreight: document.getElementById('editLorryFreight'),
        lorryWaiting: document.getElementById('editLorryWaiting'),
        lorryCDWT: document.getElementById('editLorryCDWT'),
        lorryExtra: document.getElementById('editLorryExtra'),
        lorryAmount: document.getElementById('editLorryAmount'),
        lorryCommission: document.getElementById('editLorryCommission'),
        lorryAdvance: document.getElementById('editLorryAdvance')
    };
    
    // Helper function to show/hide form groups
    const toggleFormGroup = (element, show) => {
        if (element && element.closest('.form-group')) {
            element.closest('.form-group').style.display = show ? '' : 'none';
        }
    };
    
    // Helper function to enable/disable fields
    const setFieldState = (element, enabled) => {
        if (element) {
            element.disabled = !enabled;
            element.style.opacity = enabled ? '1' : '0.5';
            element.style.backgroundColor = enabled ? '' : 'rgba(0, 0, 0, 0.1)';
        }
    };
    
    // Reset all fields to default state
    Object.values(companyFields).forEach(field => {
        if (field) {
            setFieldState(field, true);
            toggleFormGroup(field, true);
        }
    });
    
    Object.values(lorryFields).forEach(field => {
        if (field) {
            setFieldState(field, true);
            toggleFormGroup(field, true);
        }
    });
    
    // Apply specific rules based on payment type
    switch(paymentType) {
        case 'Cash':
            // Disable company amount
            setFieldState(companyFields.companyAmount, false);
            
            // Show only specific lorry fields
            toggleFormGroup(lorryFields.lorryFreight, true);
            toggleFormGroup(lorryFields.lorryAmount, true);
            toggleFormGroup(lorryFields.lorryCommission, true);
            toggleFormGroup(lorryFields.lorryAdvance, true);
            
            // Hide other lorry fields
            toggleFormGroup(lorryFields.lorryWaiting, false);
            toggleFormGroup(lorryFields.lorryCDWT, false);
            toggleFormGroup(lorryFields.lorryExtra, false);
            
            // Add required attribute to mandatory fields
            if (lorryFields.lorryFreight) lorryFields.lorryFreight.required = true;
            if (lorryFields.lorryCommission) lorryFields.lorryCommission.required = true;
            break;
            
        case 'Credit':
            // Enable company amount
            setFieldState(companyFields.companyAmount, true);
            
            // Show only specific lorry fields
            toggleFormGroup(lorryFields.lorryFreight, true);
            toggleFormGroup(lorryFields.lorryWaiting, true);
            toggleFormGroup(lorryFields.lorryCDWT, true);
            toggleFormGroup(lorryFields.lorryExtra, true);
            toggleFormGroup(lorryFields.lorryAmount, true);
            
            // Hide commission and advance
            toggleFormGroup(lorryFields.lorryCommission, false);
            toggleFormGroup(lorryFields.lorryAdvance, false);
            
            // Add required attribute to mandatory fields
            if (lorryFields.lorryFreight) lorryFields.lorryFreight.required = true;
            break;
            
        case 'Advance':
            // Disable company amount
            setFieldState(companyFields.companyAmount, false);
            
            // Show only advance field
            toggleFormGroup(lorryFields.lorryAdvance, true);
            
            // Hide all other lorry fields
            toggleFormGroup(lorryFields.lorryFreight, false);
            toggleFormGroup(lorryFields.lorryWaiting, false);
            toggleFormGroup(lorryFields.lorryCDWT, false);
            toggleFormGroup(lorryFields.lorryExtra, false);
            toggleFormGroup(lorryFields.lorryAmount, false);
            toggleFormGroup(lorryFields.lorryCommission, false);
            
            // Add required attribute to mandatory fields
            if (lorryFields.lorryAdvance) lorryFields.lorryAdvance.required = true;
            break;
            
        default:
            // For other payment types, show all fields
            break;
    }
    
    // Update totals after changing field visibility
    updateModalTotals();
}

// Update totals in the edit modal
function updateModalTotals() {
    // Calculate Company total
    const freight = parseFloat(document.getElementById('editFreight').value) || 0;
    const companyWaiting = parseFloat(document.getElementById('editCompanyWaiting').value) || 0;
    const companyCDWT = parseFloat(document.getElementById('editCompanyCDWT').value) || 0;
    const khoti = parseFloat(document.getElementById('editKhoti').value) || 0;
    const hamali = parseFloat(document.getElementById('editHamali').value) || 0;
    const extra = parseFloat(document.getElementById('editExtra').value) || 0;
    
    const companyTotal = freight + companyWaiting + companyCDWT + khoti + hamali + extra;
    document.getElementById('editCompanyTotal').value = companyTotal.toFixed(2);
    
    // Calculate Lorry total
    const lorryFreight = parseFloat(document.getElementById('editLorryFreight').value) || 0;
    const lorryWaiting = parseFloat(document.getElementById('editLorryWaiting').value) || 0;
    const lorryCDWT = parseFloat(document.getElementById('editLorryCDWT').value) || 0;
    const lorryAmount = parseFloat(document.getElementById('editLorryAmount').value) || 0;
    const lorryCommission = parseFloat(document.getElementById('editLorryCommission').value) || 0;
    const lorryExtra = parseFloat(document.getElementById('editLorryExtra').value) || 0;
    
    const lorryTotal = lorryFreight + lorryWaiting + lorryCDWT + lorryAmount - lorryCommission + lorryExtra;
    document.getElementById('editLorryTotal').value = lorryTotal.toFixed(2);
}

// Save edited voucher from modal
async function saveEditedVoucher() {
    if (editingRow === null) return true;
    
    try {
        showLoader();
        
        // Get all values from form fields
        const formData = {
            id: editingRow,
            vehicleNo: document.getElementById('editVehicleNo').value,
            vehicleType: document.getElementById('editVehicleType').value,
            paymentType: document.getElementById('editPaymentType').value,
            fromLocation: document.getElementById('editFromLocation').value,
            toLocation: document.getElementById('editToLocation').value,
            toBeBilled: document.getElementById('editToBeBilled').value,
            areaName: document.getElementById('editAreaName').value,
            waitingHrs: parseFloat(document.getElementById('editWaitingHrs').value) || 0,
            cdwt: parseFloat(document.getElementById('editCdwt').value) || 0,
            trips: parseInt(document.getElementById('editTrips').value) || 1,
            
            // Company amounts
            freight: parseFloat(document.getElementById('editFreight').value) || 0,
            companyWaiting: parseFloat(document.getElementById('editCompanyWaiting').value) || 0,
            companyCDWT: parseFloat(document.getElementById('editCompanyCDWT').value) || 0,
            khoti: parseFloat(document.getElementById('editKhoti').value) || 0,
            hamali: parseFloat(document.getElementById('editHamali').value) || 0,
            extra: parseFloat(document.getElementById('editExtra').value) || 0,
            
            // Lorry amounts
            lorryFreight: parseFloat(document.getElementById('editLorryFreight').value) || 0,
            lorryWaiting: parseFloat(document.getElementById('editLorryWaiting').value) || 0,
            lorryCDWT: parseFloat(document.getElementById('editLorryCDWT').value) || 0,
            lorryAmount: parseFloat(document.getElementById('editLorryAmount').value) || 0,
            lorryCommission: parseFloat(document.getElementById('editLorryCommission').value) || 0,
            lorryExtra: parseFloat(document.getElementById('editLorryExtra').value) || 0,
            advance: parseFloat(document.getElementById('editAdvance').value) || 0
        };

        // Send update to API
        const response = await fetch(`${apiBaseUrl}/${editingRow}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`Failed to update voucher: ${response.statusText}`);
        }

        const updatedVoucher = await response.json();
        
        // Update the voucher in current list
        const index = currentVouchers.findIndex(v => v.id === editingRow);
        if (index !== -1) {
            currentVouchers[index] = updatedVoucher;
        }
        
        // Close the modal
        document.getElementById('editModal').style.display = 'none';
        
        // Reset editing row
        editingRow = null;
        
        // Refresh table display
        updateTableState(currentVouchers);
        showNotification('Voucher updated successfully', false);
        hideLoader();
        return true;
    } catch (error) {
        console.error('Error saving voucher:', error);
        showNotification(`Error updating voucher: ${error.message}`, true);
        hideLoader();
        return false;
    }
}

async function deleteVoucher(id) {
    // Confirm deletion
    const confirmation = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    });
    
    if (!confirmation.isConfirmed) return;
    
    try {
        showLoader();
        
        // Send delete request to API
        const response = await fetch(`${apiBaseUrl}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`Failed to delete voucher: ${response.statusText}`);
        }
        
        // Remove from current list
        currentVouchers = currentVouchers.filter(v => v.id !== id);
        
        // Refresh table display
        updateTableState(currentVouchers);
        showNotification('Voucher deleted successfully', false);
        hideLoader();
    } catch (error) {
        console.error('Error deleting voucher:', error);
        showNotification(`Error deleting voucher: ${error.message}`, true);
        hideLoader();
    }
}

// Save all changes
async function saveAllChanges() {
    // First, save any currently editing row
    if (editingRow !== null) {
        const saveResult = await saveEditedVoucher();
        if (!saveResult) return; // Don't proceed if save failed
    }
    
    showNotification('All changes saved successfully', false);
}

// Function to load voucher data for editing
async function loadVoucherForEdit(id) {
    try {
        showLoader();
        
        // Fetch voucher data from API
        const response = await fetch(`${apiBaseUrl}/${id}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch voucher: ${response.statusText}`);
        }
        
        const voucher = await response.json();
        hideLoader();
        
        // Start editing this voucher
        editVoucher(voucher.id);
    } catch (error) {
        console.error('Error loading voucher for edit:', error);
        showNotification(`Error: ${error.message}`, true);
        hideLoader();
    }
}

// Initialize sidebar functionality
document.addEventListener('DOMContentLoaded', function() {
    // Toggle sidebar when button is clicked
    const toggleBtn = document.getElementById('toggleSidebarBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            toggleSidebar();
        });
    }
});

// Setup keyboard navigation for the table
function setupTableKeyboardNavigation() {
    let selectedRowIndex = -1;
    const table = document.getElementById('tripVoucherTable');
    
    // Add keyboard event listener to the document
    document.addEventListener('keydown', function(e) {
        // Only handle keyboard navigation when the table is visible
        if (table.style.display === 'none') return;
        
        const tbody = table.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr');
        
        // If no rows, exit
        if (rows.length === 0) return;
        
        // Handle arrow keys
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault(); // Prevent page scrolling
            
            // Clear previous selection
            rows.forEach(row => {
                row.classList.remove('selected-row');
                row.style.backgroundColor = '';
                row.style.color = '';
                row.style.fontWeight = '';
            });
            
            // Update selected row index
            if (e.key === 'ArrowDown') {
                selectedRowIndex = (selectedRowIndex < rows.length - 1) ? selectedRowIndex + 1 : 0;
            } else if (e.key === 'ArrowUp') {
                selectedRowIndex = (selectedRowIndex > 0) ? selectedRowIndex - 1 : rows.length - 1;
            }
            
            // Apply selection to the new row
            const selectedRow = rows[selectedRowIndex];
            selectedRow.classList.add('selected-row');
            
            // Add blue highlight style to the selected row
            selectedRow.style.backgroundColor = 'rgba(23, 125, 255, 0.2)';
            selectedRow.style.color = '#000';
            selectedRow.style.fontWeight = 'bold';
            
            // Scroll the selected row into view if needed
            selectedRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            console.log(`Selected row ${selectedRowIndex}`);
        }
        
        // Handle Enter key to edit the selected row - open directly in edit form, not popup
        if (e.key === 'Enter' && selectedRowIndex >= 0) {
            e.preventDefault();
            
            const selectedRow = rows[selectedRowIndex];
            const voucherId = parseInt(selectedRow.dataset.voucherId);
            
            if (!isNaN(voucherId)) {
                console.log(`Redirecting to edit page for voucher ID: ${voucherId}`);
                // Fix the case sensitivity issue in the URL
                window.location.href = `/tripVoucher?id=${voucherId}&mode=edit`;
            }
        }
    });
    
    // Add click handler to rows for selection
    table.addEventListener('click', function(e) {
        const tbody = table.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr');
        
        // Find the clicked row
        let clickedRow = e.target;
        while (clickedRow && clickedRow.tagName !== 'TR') {
            clickedRow = clickedRow.parentElement;
        }
        
        // If a row was clicked
        if (clickedRow && clickedRow.parentElement === tbody) {
            // Clear previous selection
            rows.forEach(row => {
                row.classList.remove('selected-row');
                row.style.backgroundColor = '';
                row.style.color = '';
                row.style.fontWeight = '';
            });
            
            // Add selection to clicked row
            clickedRow.classList.add('selected-row');
            clickedRow.style.backgroundColor = 'rgba(23, 125, 255, 0.2)';
            clickedRow.style.color = '#000';
            clickedRow.style.fontWeight = 'bold';
            
            // Update selected row index
            selectedRowIndex = Array.from(rows).indexOf(clickedRow);
            console.log(`Selected row ${selectedRowIndex} by click`);
        }
    });
}