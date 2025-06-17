console.log('Vehicle Statement table JS loaded successfully!');

let sortConfig = {
    column: null,
    direction: 'asc'
};
let apiBaseUrl = 'http://localhost:8081/api/trip-vouchers';
let currentTransactions = [];
let vehicleSuggestions = [];
let typingTimer;
const doneTypingInterval = 500; // ms

// Initialize table
document.addEventListener('DOMContentLoaded', () => {
    initializeTable();
    setupEventListeners();
    setupAutoComplete();
    setDefaultDateRange();
});

function setDefaultDateRange() {
    // Set default date range to one month from current date
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    
    // Format dates to YYYY-MM-DD
    const toDateStr = formatDateForInput(today);
    const fromDateStr = formatDateForInput(oneMonthAgo);
    
    // Set input values
    document.getElementById('fromDate').value = fromDateStr;
    document.getElementById('toDate').value = toDateStr;
}

function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function initializeTable() {
    // Fetch data from API
    fetchTransactions();
    fetchAllVehicles(); // Fetch all vehicle numbers for autocomplete
	fetchBusinessProfile(); // New function to fetch business profile

    
    // Setup filter event listeners
    document.getElementById('searchBtn').addEventListener('click', applyFilters);
    document.getElementById('resetBtn').addEventListener('click', resetFilters);
    document.getElementById('printBtn').addEventListener('click', printAllStatements);
    document.getElementById('excelBtn').addEventListener('click', exportToExcel);
}

// Fix 1: Update fetchAllVehicles to properly populate the dropdown
async function fetchAllVehicles() {
    try {
        const response = await fetch(`${apiBaseUrl}/vehicles`);
        if (!response.ok) {
            throw new Error(`Failed to fetch vehicles: ${response.statusText}`);
        }
        
        const vehicles = await response.json();
        populateVehicleDropdown(vehicles);
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        showNotification('Error loading vehicle suggestions: ' + error.message, true);
    }
}

// Fix 2: New function to populate the dropdown
function populateVehicleDropdown(vehicles) {
    const dropdown = document.getElementById('searchInput');
    
    // Clear existing options except the first default one
    while (dropdown.options.length > 1) {
        dropdown.remove(1);
    }
    
    // Add new vehicle options
    if (vehicles && Array.isArray(vehicles)) {
        vehicles.forEach(vehicle => {
            const option = document.createElement('option');
            option.value = vehicle;
            option.textContent = vehicle;
            dropdown.appendChild(option);
        });
    }
    
    // Store for datalist as well
    vehicleSuggestions = vehicles;
    updateVehicleSuggestions(vehicles);
}

function setupEventListeners() {
    // Column sort listeners
    const sortableHeaders = document.querySelectorAll('th[data-column]');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            if (header.dataset.column) {
                sortTable(header.dataset.column);
            }
        });
    });
    
    // Select all checkbox
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('#transactionTable tbody input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = selectAllCheckbox.checked;
            });
        });
    }
}

function setupAutoComplete() {
    const searchInput = document.getElementById('searchInput');
    
    // Add event listeners for live search
    searchInput.addEventListener('input', function() {
        clearTimeout(typingTimer);
        
        if (searchInput.value) {
            // Show loading state
            searchInput.classList.add('searching');
            
            // Set timer for debounce
            typingTimer = setTimeout(() => {
                fetchVehicleSuggestions(searchInput.value);
            }, doneTypingInterval);
        }
    });
    
    // Apply search on selection
    searchInput.addEventListener('change', function() {
        if (searchInput.value.trim()) {
            applyFilters();
        }
    });
}

async function fetchVehicleSuggestions(searchTerm) {
    try {
		const response = await fetch(`${apiBaseUrl}/vehicles/search?term=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch vehicle suggestions: ${response.statusText}`);
        }
        
        const suggestions = await response.json();
        updateVehicleSuggestions(suggestions);
        
        // Remove loading state
        document.getElementById('searchInput').classList.remove('searching');
    } catch (error) {
        console.error('Error fetching vehicle suggestions:', error);
        document.getElementById('searchInput').classList.remove('searching');
    }
}

// Add this new function to fetch business profile data
async function fetchBusinessProfile() {
    try {
        const response = await fetch('/profile/data');
        if (response.ok) {
            const profileData = await response.json();
            updateBusinessInfo(profileData);
        }
    } catch (error) {
        console.error('Error fetching business profile:', error);
    }
}

// Update business info in the page
function updateBusinessInfo(profileData) {
    // Update company name and address in the UI
    const companyNameElements = document.querySelectorAll('.company-name');
    const companyAddressElements = document.querySelectorAll('.company-address');
    
    if (profileData.businessName) {
        companyNameElements.forEach(el => el.textContent = profileData.businessName);
    }
    
    if (profileData.address) {
        companyAddressElements.forEach(el => el.textContent = profileData.address);
    }
}

function updateVehicleSuggestions(suggestions) {
    const datalist = document.getElementById('vehicleSuggestions');
    if (suggestions && Array.isArray(suggestions)) {
        vehicleSuggestions = suggestions;
    }
    
    // Clear existing options
    datalist.innerHTML = '';
    
    // Add new options
    vehicleSuggestions.forEach(vehicle => {
        const option = document.createElement('option');
        option.value = vehicle;
        datalist.appendChild(option);
    });
}

// Update setupAutoComplete function to work with dropdown
function setupAutoComplete() {
    const searchInput = document.getElementById('searchInput');
    
    // Apply search on selection
    searchInput.addEventListener('change', function() {
        if (searchInput.value.trim()) {
            applyFilters();
        }
    });
}
function updateVehicleSuggestions(suggestions) {
    const datalist = document.getElementById('vehicleSuggestions');
    if (suggestions && Array.isArray(suggestions)) {
        vehicleSuggestions = suggestions;
    }
    
    // Clear existing options
    datalist.innerHTML = '';
    
    // Add new options
    vehicleSuggestions.forEach(vehicle => {
        const option = document.createElement('option');
        option.value = vehicle;
        datalist.appendChild(option);
    });
}

// Update applyFilters to work with dropdown
function applyFilters() {
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;
    const searchTerm = document.getElementById('searchInput').value;
    
    // Validate date range
    if (fromDate && toDate) {
        const fromDateObj = new Date(fromDate);
        const toDateObj = new Date(toDate);
        
        if (fromDateObj > toDateObj) {
            showNotification('From date cannot be greater than To date', true);
            return;
        }
    }
    
    fetchTransactions({
        fromDate,
        toDate,
        searchTerm
    });
    
    // Update selected vehicle info box
    if (searchTerm) {
        document.getElementById('currentVehicleNo').textContent = searchTerm;
        document.getElementById('selectedVehicleInfo').classList.remove('hidden');
    } else {
        document.getElementById('selectedVehicleInfo').classList.add('hidden');
    }
}

function resetFilters() {
    // Reset to default date range (one month)
    setDefaultDateRange();
    document.getElementById('searchInput').value = '';
    document.getElementById('selectedVehicleInfo').classList.add('hidden');
    
    fetchTransactions();
}

async function fetchTransactions(filterParams = null) {
    try {
        showLoader();
        
        // If no filterParams provided, use default date range
        if (!filterParams) {
            const fromDate = document.getElementById('fromDate').value;
            const toDate = document.getElementById('toDate').value;
            const searchTerm = document.getElementById('searchInput').value;
            filterParams = { fromDate, toDate, searchTerm };
        }
        
        // Construct API URL with filters
        let url = `${apiBaseUrl}`;
        const params = [];
        
        if (filterParams) {
            if (filterParams.fromDate) params.push(`fromDate=${filterParams.fromDate}`);
            if (filterParams.toDate) params.push(`toDate=${filterParams.toDate}`);
            if (filterParams.searchTerm && filterParams.searchTerm !== '') 
                params.push(`vehicleNo=${encodeURIComponent(filterParams.searchTerm)}`);
        }
        
        if (params.length > 0) {
            url += `/filter?${params.join('&')}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch transactions: ${response.statusText}`);
        }
        
        const transactions = await response.json();
        currentTransactions = transactions;
        updateTableState(transactions);
        
        // Update selected vehicle info box
        if (filterParams && filterParams.searchTerm) {
            document.getElementById('currentVehicleNo').textContent = filterParams.searchTerm;
            document.getElementById('selectedVehicleInfo').classList.remove('hidden');
        } else {
            document.getElementById('selectedVehicleInfo').classList.add('hidden');
        }
        
        hideLoader();
    } catch (error) {
        console.error('Error fetching transactions:', error);
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

function updateTableState(transactions) {
    const elements = {
        tbody: document.querySelector('#transactionTable tbody'),
        tfoot: document.querySelector('#transactionTable tfoot'),
        table: document.getElementById('transactionTable'),
        noData: document.getElementById('noDataMessage')
    };

    // Check for null or empty transactions
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
        // Hide table and show no data message
        elements.table.style.display = 'none';
        elements.tfoot.classList.add('hidden');
        elements.noData.style.display = 'block';

        // Clear summary values
        document.getElementById('summaryAmount').textContent = '0.00';
        document.getElementById('summaryAdvance').textContent = '0.00';
        document.getElementById('summaryCommission').textContent = '0.00';
        document.getElementById('nettBalance').textContent = '0.00';
        return;
    }

    // Show table and hide no data message when data exists
    elements.table.style.display = 'table';
    elements.tfoot.classList.remove('hidden');
    elements.noData.style.display = 'none';

    updateTableContent(elements.tbody, transactions);
    updateTotals(transactions);
    updateSummary(transactions);
}

function updateTableContent(tbody, transactions) {
    if (!transactions || !Array.isArray(transactions)) {
        console.error('Invalid transactions data:', transactions);
        return;
    }

    try {
        tbody.innerHTML = transactions.map((transaction) => {
            return `
            <tr id="row-${transaction.id}" data-vehicle="${transaction.vehicleNo}">
                <td class="checkbox-cell">
                    <input type="checkbox" data-id="${transaction.id}">
                </td>
                <td>${transaction.mrNo || ''}</td>
                <td>${formatDate(transaction.timestamp || transaction.date)}</td>
                <td>${transaction.fromLocation || ''}</td>
                <td>${transaction.toLocation || ''}</td>
                <td>${transaction.paymentType || ''}</td>
                <td>${transaction.trips || '1'}</td>
                <td>${formatAmount(transaction.advance || 0)}</td>
                <td>${formatAmount(transaction.lorryCommission || transaction.commission || 0)}</td>
                <td>${formatAmount(transaction.lorryExtra || transaction.extra || 0)}</td>
                <td>${formatAmount(transaction.lorryFreight || transaction.freight || 0)}</td>
                <td>${calculateAmount(transaction)}</td>
            </tr>
        `}).join('');
    } catch (error) {
        console.error('Error updating table:', error);
        showNotification('Error updating table data', true);
    }
}

function calculateAmount(transaction) {
    // If payment type is cash or advance, amount is 0
    if (
        transaction.paymentType && 
        (transaction.paymentType.toLowerCase() === 'cash' || 
         transaction.paymentType.toLowerCase() === 'advance')
    ) {
        return formatAmount(0);
    }
    
    // For credit payment type, sum all columns
    const lorryFreight = parseFloat(transaction.lorryFreight || transaction.freight || 0);
    const lorryWaiting = parseFloat(transaction.lorryWaiting || 0);
    const lorryCDWT = parseFloat(transaction.lorryCDWT || 0);
    const lorryAmount = parseFloat(transaction.lorryAmount || 0);
    const amount = parseFloat(transaction.amount || 0);
    
    // If amount is already provided, use it
    if (amount > 0) {
        return formatAmount(amount);
    }
    
    // Otherwise calculate it
    const calculatedAmount = lorryFreight + lorryWaiting + lorryCDWT + lorryAmount;
    return formatAmount(calculatedAmount);
}

function updateTotals(transactions) {
    // Initialize all totals
    let totalTrips = 0;
    let totalAdvance = 0;
    let totalCommission = 0;
    let totalExtra = 0;
    let totalFreight = 0;
    let totalAmount = 0;

    transactions.forEach(transaction => {
        // Accumulate totals
        totalTrips += parseInt(transaction.trips || 1);
        totalAdvance += parseFloat(transaction.advance || 0);
        totalCommission += parseFloat(transaction.lorryCommission || transaction.commission || 0);
        totalExtra += parseFloat(transaction.lorryExtra || transaction.extra || 0);
        totalFreight += parseFloat(transaction.lorryFreight || transaction.freight || 0);
        
        // Calculate amount based on payment type
        const calculatedAmount = parseFloat(calculateAmount(transaction));
        totalAmount += calculatedAmount;
    });

    // Update footer cells with totals
    document.getElementById('totalTrips').textContent = totalTrips;
    document.getElementById('totalAdvance').textContent = formatAmount(totalAdvance);
    document.getElementById('totalCommission').textContent = formatAmount(totalCommission);
    document.getElementById('totalExtra').textContent = formatAmount(totalExtra);
    document.getElementById('totalFreight').textContent = formatAmount(totalFreight);
    document.getElementById('totalAmount').textContent = formatAmount(totalAmount);
    
    // Update the summary container as well
    document.getElementById('summaryAmount').textContent = formatAmount(totalAmount);
    document.getElementById('summaryAdvance').textContent = formatAmount(totalAdvance);
    document.getElementById('summaryCommission').textContent = formatAmount(totalCommission);
    document.getElementById('nettBalance').textContent = formatAmount(totalAmount - totalAdvance - totalCommission);
}

function updateSummary(transactions) {
    let totalAmount = 0;
    let totalAdvance = 0;
    let totalCommission = 0;

    transactions.forEach(transaction => {
        // Calculate amount based on payment type
        const calculatedAmount = parseFloat(calculateAmount(transaction));
        totalAmount += calculatedAmount;
        
        totalAdvance += parseFloat(transaction.advance || 0);
        totalCommission += parseFloat(transaction.lorryCommission || transaction.commission || 0);
    });

    // Calculate net balance
    const netBalance = totalAmount - totalAdvance - totalCommission;

    // Update summary container
    document.getElementById('summaryAmount').textContent = formatAmount(totalAmount);
    document.getElementById('summaryAdvance').textContent = formatAmount(totalAdvance);
    document.getElementById('summaryCommission').textContent = formatAmount(totalCommission);
    document.getElementById('nettBalance').textContent = formatAmount(netBalance);
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Format amount for display
function formatAmount(amount) {
    if (amount === null || amount === undefined) return '0.00';
    return parseFloat(amount).toFixed(2);
}

// Sort table by column
function sortTable(column) {
    if (sortConfig.column === column) {
        // Toggle direction if same column clicked
        sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
        sortConfig.column = column;
        sortConfig.direction = 'asc';
    }

    // Update UI to show sort indicators
    updateSortIndicators();

    // Sort the transactions
    const sortedTransactions = [...currentTransactions].sort((a, b) => {
        let valueA = a[column];
        let valueB = b[column];

        // Handle null/undefined values
        if (valueA === null || valueA === undefined) valueA = '';
        if (valueB === null || valueB === undefined) valueB = '';

        // Convert to numbers for numeric columns
        if (!isNaN(valueA) && !isNaN(valueB)) {
            valueA = parseFloat(valueA);
            valueB = parseFloat(valueB);
        }

        // String comparison
        if (typeof valueA === 'string' && typeof valueB === 'string') {
            return sortConfig.direction === 'asc' 
                ? valueA.localeCompare(valueB) 
                : valueB.localeCompare(valueA);
        } 
        // Number comparison
        else {
            return sortConfig.direction === 'asc' 
                ? valueA - valueB 
                : valueB - valueA;
        }
    });

    // Update table with sorted data
    updateTableState(sortedTransactions);
}

function updateSortIndicators() {
    // Remove all indicators first
    document.querySelectorAll('th[data-column] .sort-indicator').forEach(el => el.remove());
    
    // Add indicator to current sort column
    if (sortConfig.column) {
        const th = document.querySelector(`th[data-column="${sortConfig.column}"]`);
        if (th) {
            const indicator = document.createElement('span');
            indicator.className = 'sort-indicator';
            indicator.textContent = sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
            th.appendChild(indicator);
        }
    }
}

// Show notification message
function showNotification(message, isError = false) {
    const notificationEl = document.getElementById('notification');
    notificationEl.textContent = message;
    notificationEl.className = `notification ${isError ? 'error' : 'success'}`;
    notificationEl.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
        notificationEl.style.display = 'none';
    }, 5000);
}

// Print statement for selected transactions
function printAllStatements() {
    // Get all selected records
    const selectedIds = getSelectedIds();
    
    if (selectedIds.length === 0) {
        showNotification('Please select at least one record to print', true);
        return;
    }
    
    // Get filter values for the date range
    const fromDate = document.getElementById('fromDate').value || '';
    const toDate = document.getElementById('toDate').value || '';
    
    // Filter transactions by selected IDs
    const selectedTransactions = currentTransactions.filter(t => selectedIds.includes(t.id));
    
    // Group transactions by vehicle number
    const vehicleGroups = groupTransactionsByVehicle(selectedTransactions);
    
    // Generate print layout
    const printWindow = window.open('', '_blank');
    
    // Create print content with improved layout
    let printContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Vehicle Statements</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            
            .company-header { text-align: center; margin-bottom: 20px; }
            .company-name { font-size: 18px; font-weight: bold; }
            .company-address { font-size: 12px; }
            
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #000; padding: 5px; text-align: left; font-size: 12px; }
            th { background-color: #f0f0f0; }
            
            .statement-header { 
                display: flex; 
                justify-content: space-between; 
                margin-bottom: 15px; 
                padding: 10px; 
                border: 1px solid #000; 
                background-color: #f9f9f9; 
            }
            .statement-title { font-weight: bold; font-size: 16px; text-align: center; width: 100%; }
            .vehicle-info { margin-bottom: 10px; }
            .date-range { margin-bottom: 10px; }
            .total-row { font-weight: bold; background-color: #f0f0f0; }
            .summary-box { 
                border: 1px solid #000; 
                padding: 10px; 
                width: 300px; 
                float: right; 
                margin-top: 20px; 
                margin-bottom: 40px;
            }
            .summary-row { 
                display: flex; 
                justify-content: space-between; 
                margin-bottom: 5px; 
                padding-bottom: 5px; 
                border-bottom: 1px solid #eee; 
            }
            .summary-row:last-child { 
                font-weight: bold; 
                border-bottom: none; 
                padding-top: 5px; 
                margin-top: 5px; 
                border-top: 1px solid #000; 
            }
            
            .page-break { 
                page-break-after: always; 
                margin-bottom: 30px;
                clear: both;
            }
            
            .print-btn { 
                padding: 8px 16px; 
                background-color: #4CAF50; 
                color: white; 
                border: none; 
                cursor: pointer; 
                margin-top: 20px; 
                margin-bottom: 20px;
            }
            
            @media print {
                .print-btn { display: none; }
                body { padding: 0; }
            }
        </style>
    </head>
    <body>
    `;
    
    // Loop through each vehicle group and add its statements
    Object.entries(vehicleGroups).forEach(([vehicleNo, transactions], index) => {
        // Calculate group totals
        const groupTotals = calculateGroupTotals(transactions);
        
        // Use the from/to date from filters if available
        const displayFromDate = fromDate || formatDate(transactions[0].date);
        const displayToDate = toDate || formatDate(transactions[0].date);
        
        printContent += `
        <div class="${index < Object.keys(vehicleGroups).length - 1 ? 'page-break' : ''}">
            <div class="company-header">
                <div class="company-name">JAGDISH TRANSPORT</div>
                <div class="company-address">No S'S 137, OPP Grafite Limited, MIDC, Satpur, Nashik, Nashik, Maharashtra 422007</div>
            </div>
            
            <div class="statement-header">
                <div class="statement-title">Vehicle Statement</div>
            </div>
            
            <div class="vehicle-info">
                <strong>Vehicle No:</strong> ${vehicleNo}
            </div>
            
            <div class="date-range">
                <strong>From:</strong> ${displayFromDate} <strong style="margin-left: 20px;">To:</strong> ${displayToDate}
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>MR No.</th>
                        <th>Date</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Pmt.</th>
                        <th>T</th>
                        <th>Adv.</th>
                        <th>Comm.</th>
                        <th>Extra</th>
                        <th>Freight</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        // Add each transaction row
        transactions.forEach(transaction => {
            printContent += `
                <tr>
                    <td>${transaction.mrNo || ''}</td>
                    <td>${formatDate(transaction.timestamp || transaction.date)}</td>
                    <td>${transaction.fromLocation || ''}</td>
                    <td>${transaction.toLocation || ''}</td>
                    <td>${transaction.paymentType || ''}</td>
                    <td>${transaction.trips || '1'}</td>
                    <td>${formatAmount(transaction.advance || 0)}</td>
                    <td>${formatAmount(transaction.lorryCommission || transaction.commission || 0)}</td>
                    <td>${formatAmount(transaction.lorryExtra || transaction.extra || 0)}</td>
                    <td>${formatAmount(transaction.lorryFreight || transaction.freight || 0)}</td>
                    <td>${calculateAmount(transaction)}</td>
                </tr>
            `;
        });
        
        // Add total row
        printContent += `
                <tr class="total-row">
                    <td colspan="5">Total</td>
                    <td>${groupTotals.trips}</td>
                    <td>${formatAmount(groupTotals.advance)}</td>
                    <td>${formatAmount(groupTotals.commission)}</td>
                    <td>${formatAmount(groupTotals.extra)}</td>
                    <td>${formatAmount(groupTotals.freight)}</td>
                    <td>${formatAmount(groupTotals.amount)}</td>
                </tr>
                </tbody>
            </table>
            
            <div class="summary-box">
                <div class="summary-row">
                    <span><strong>Total Amount:</strong></span>
                    <span>${formatAmount(groupTotals.amount)}</span>
                </div>
                <div class="summary-row">
                    <span><strong>Total Advance:</strong></span>
                    <span>${formatAmount(groupTotals.advance)}</span>
                </div>
                <div class="summary-row">
                    <span><strong>Total Commission:</strong></span>
                    <span>${formatAmount(groupTotals.commission)}</span>
                </div>
                <div class="summary-row">
                    <span><strong>Net Balance:</strong></span>
                    <span>${formatAmount(groupTotals.amount - groupTotals.advance - groupTotals.commission)}</span>
                </div>
            </div>
        </div>
        `;
    });
    
    printContent += `
        <button onclick="window.print()" class="print-btn">Print All</button>
    </body>
    </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Auto print when loaded
    printWindow.onload = function() {
        printWindow.focus();
    };
}

// Group transactions by vehicle number
function groupTransactionsByVehicle(transactions) {
    const groups = {};
    
    transactions.forEach(transaction => {
        const vehicleNo = transaction.vehicleNo || 'Unknown';
        if (!groups[vehicleNo]) {
            groups[vehicleNo] = [];
        }
        groups[vehicleNo].push(transaction);
    });
    
    return groups;
}

// Calculate totals for a group of transactions
function calculateGroupTotals(transactions) {
    const totals = {
        trips: 0,
        advance: 0,
        commission: 0,
        extra: 0,
        freight: 0,
        amount: 0
    };
    
    transactions.forEach(transaction => {
        totals.trips += parseInt(transaction.trips || 1);
        totals.advance += parseFloat(transaction.advance || 0);
        totals.commission += parseFloat(transaction.lorryCommission || transaction.commission || 0);
        totals.extra += parseFloat(transaction.lorryExtra || transaction.extra || 0);
        totals.freight += parseFloat(transaction.lorryFreight || transaction.freight || 0);
        
        // Calculate amount
        const calculatedAmount = parseFloat(calculateAmount(transaction));
        totals.amount += calculatedAmount;
    });
    
    return totals;
}

function exportToExcel() {
    // Get all selected records
    const selectedIds = getSelectedIds();
    
    let dataToExport;
    
    if (selectedIds.length === 0) {
        // If none selected, export all
        dataToExport = currentTransactions;
    } else {
        // Filter transactions by selected IDs
        dataToExport = currentTransactions.filter(t => selectedIds.includes(t.id));
    }
    
    if (dataToExport.length === 0) {
        showNotification('No data to export', true);
        return;
    }
    
    // Show processing notification
    showNotification('Preparing Excel file for download...', false);
    
    try {
        // Create workbook
        const workbook = XLSX.utils.book_new();
        
        // Get filter parameters
        const fromDate = document.getElementById('fromDate').value;
        const toDate = document.getElementById('toDate').value;
        const vehicleNo = document.getElementById('searchInput').value;
        
        // Group by vehicle
        const vehicleGroups = groupTransactionsByVehicle(dataToExport);
        
        // Process each vehicle group
        Object.entries(vehicleGroups).forEach(([vehicleNumber, transactions]) => {
            // Format data for Excel
            const formattedData = formatDataForExcel(transactions);
            
            // Create headers
            const headers = [
                ['JAGDISH TRANSPORT'],
                ['No S\'S 137, OPP Grafite Limited, MIDC, Satpur, Nashik, Maharashtra 422007'],
                [''],
                ['Vehicle Statement'],
                [''],
                [`Vehicle No: ${vehicleNumber}`],
                [`From: ${fromDate || 'All'}   To: ${toDate || 'All'}`],
                [''],
                // Column headers
                ['MR No.', 'Date', 'From', 'To', 'Payment Type', 'Trips', 'Advance', 'Commission', 'Extra', 'Freight', 'Amount']
            ];
            
            // Add data rows
            const allData = headers.concat(
                formattedData.map(item => [
                    item['MR No'],
                    item['Date'],
                    item['From'],
                    item['To'],
                    item['Payment Type'],
                    item['Trips'],
                    item['Advance'],
                    item['Commission'],
                    item['Extra'],
                    item['Freight'],
                    item['Amount']
                ])
            );
            
            // Calculate totals
            const groupTotals = calculateGroupTotals(transactions);
            
            // Add total row
            allData.push([
                'Total', '', '', '', '',
                groupTotals.trips.toString(),
                formatAmount(groupTotals.advance),
                formatAmount(groupTotals.commission),
                formatAmount(groupTotals.extra), 
                formatAmount(groupTotals.freight),
                formatAmount(groupTotals.amount)
            ]);
            
            // Add summary section
            allData.push(['']);
            allData.push(['Summary']);
            allData.push(['Total Amount', formatAmount(groupTotals.amount)]);
            allData.push(['Total Advance', formatAmount(groupTotals.advance)]);
            allData.push(['Total Commission', formatAmount(groupTotals.commission)]);
            allData.push(['Net Balance', formatAmount(groupTotals.amount - groupTotals.advance - groupTotals.commission)]);
            
            // Create worksheet
            const worksheet = XLSX.utils.aoa_to_sheet(allData);
            
            // Set column widths
            const wscols = [
                {wch: 12}, // MR No
                {wch: 12}, // Date
                {wch: 15}, // From
                {wch: 15}, // To
                {wch: 10}, // Payment Type
                {wch: 5},  // Trips
                {wch: 10}, // Advance
                {wch: 10}, // Commission
                {wch: 10}, // Extra
                {wch: 10}, // Freight
                {wch: 10}  // Amount
            ];
            worksheet['!cols'] = wscols;
            
            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, vehicleNumber.substring(0, 31));
        });
        
        // Generate file name with current date
        const currentDate = new Date().toISOString().split('T')[0];
        const fileName = `Vehicle_Statements_${currentDate}.xlsx`;
        
        // Write and download
        XLSX.writeFile(workbook, fileName);
        
        // Show success notification
        showNotification('Vehicle Statements exported to Excel successfully', false);
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        showNotification('Error exporting to Excel: ' + error.message, true);
        
        // Fallback method if XLSX is not available
        downloadCSV(dataToExport);
    }
}

// Add this function for formatting data for Excel export
function formatDataForExcel(transactions) {
    return transactions.map(transaction => {
        return {
            'MR No': transaction.mrNo || '',
            'Date': formatDate(transaction.timestamp || transaction.date),
            'Vehicle No': transaction.vehicleNo || '',
            'From': transaction.fromLocation || '',
            'To': transaction.toLocation || '',
            'Payment Type': transaction.paymentType || '',
            'Trips': transaction.trips || '1',
            'Advance': parseFloat(transaction.advance || 0).toFixed(2),
            'Commission': parseFloat(transaction.lorryCommission || transaction.commission || 0).toFixed(2),
            'Extra': parseFloat(transaction.lorryExtra || transaction.extra || 0).toFixed(2),
            'Freight': parseFloat(transaction.lorryFreight || transaction.freight || 0).toFixed(2),
            'Amount': calculateAmount(transaction)
        };
    });
}

function downloadCSV(transactions) {
    try {
        // Group by vehicle
        const vehicleGroups = groupTransactionsByVehicle(transactions);
        
        let csvContent = '';
        
        // Process each vehicle group
        Object.entries(vehicleGroups).forEach(([vehicleNumber, vehicleTransactions]) => {
            // Add company header
            csvContent += 'JAGDISH TRANSPORT\n';
            csvContent += 'No S\'S 137, OPP Grafite Limited, MIDC, Satpur, Nashik, Maharashtra 422007\n\n';
            csvContent += 'Vehicle Statement\n\n';
            csvContent += `Vehicle No: ${vehicleNumber}\n`;
            csvContent += `From: ${document.getElementById('fromDate').value || 'All'}   To: ${document.getElementById('toDate').value || 'All'}\n\n`;
            
            // Add column headers
            csvContent += 'MR No.,Date,From,To,Payment Type,Trips,Advance,Commission,Extra,Freight,Amount\n';
            
            // Add data rows
            const formattedData = formatDataForExcel(vehicleTransactions);
            formattedData.forEach(item => {
                csvContent += `"${item['MR No']}","${item['Date']}","${item['From']}","${item['To']}","${item['Payment Type']}",` +
                    `${item['Trips']},${item['Advance']},${item['Commission']},${item['Extra']},${item['Freight']},${item['Amount']}\n`;
            });
            
            // Calculate totals
            const groupTotals = calculateGroupTotals(vehicleTransactions);
            
            // Add total row
            csvContent += `Total,,,,,"${groupTotals.trips}","${formatAmount(groupTotals.advance)}",` +
                `"${formatAmount(groupTotals.commission)}","${formatAmount(groupTotals.extra)}",` +
                `"${formatAmount(groupTotals.freight)}","${formatAmount(groupTotals.amount)}"\n\n`;
            
            // Add summary
            csvContent += 'Summary\n';
            csvContent += `Total Amount,${formatAmount(groupTotals.amount)}\n`;
            csvContent += `Total Advance,${formatAmount(groupTotals.advance)}\n`;
            csvContent += `Total Commission,${formatAmount(groupTotals.commission)}\n`;
            csvContent += `Net Balance,${formatAmount(groupTotals.amount - groupTotals.advance - groupTotals.commission)}\n\n\n`;
        });
        
        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'Vehicle_Statements.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        showNotification('Vehicle Statements exported to CSV successfully', false);
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        showNotification('Error exporting data: ' + error.message, true);
    }
}

function downloadExcel(transactions) {
    showNotification('Preparing Excel file for download...', false);
    
    // In a real implementation, this would generate and download an Excel file
    // For now, we'll just show a notification
    setTimeout(() => {
        showNotification('Vehicle Statements exported to Excel successfully', false);
    }, 1500);
}

// Get selected IDs from checkboxes
function getSelectedIds() {
    const selectedIds = [];
    const checkboxes = document.querySelectorAll('#transactionTable tbody input[type="checkbox"]:checked');
    
    checkboxes.forEach(checkbox => {
        const id = parseInt(checkbox.dataset.id);
        if (!isNaN(id)) {
            selectedIds.push(id);
        }
    });
    
    return selectedIds;
}