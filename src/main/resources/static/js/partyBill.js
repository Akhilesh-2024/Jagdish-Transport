console.log('Party Bill JS loaded successfully!');

// Configuration
let sortConfig = {
    column: null,
    direction: 'asc'
};
const apiBaseUrl = 'http://localhost:8081/api';
const tripVoucherUrl = `${apiBaseUrl}/trip-vouchers`;

// State variables
let currentTransactions = [];
let partySuggestions = [];

// Global variables to track settings
let billSettings = {
  autoGenerate: false,
  prefix: "BILL",
  startNumber: 1000
};
let currentBillNo = '';
let typingTimer;
const doneTypingInterval = 500; // ms

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeTable();
    setupEventListeners();
    loadBillSettings();
    setDefaultDateRange();
    setupPartySearchAutocomplete();
    ensureRequiredElements();
    setTodayBillDate(); // Set today's date for bill date
});

// Set default date range (one month)
function setDefaultDateRange() {
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

// Set today's date for bill date
function setTodayBillDate() {
    const today = new Date();
    const todayStr = formatDateForInput(today);
    const billDateInput = document.getElementById('billDate');
    
    if (billDateInput) {
        billDateInput.value = todayStr;
    }
}

function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function initializeTable() {
    // Load parties for dropdown
    fetchAllParties();
    
    // Setup filter event listeners
    document.getElementById('searchBtn').addEventListener('click', applyFilters);
    document.getElementById('resetBtn').addEventListener('click', resetFilters);
    document.getElementById('saveBillBtn').addEventListener('click', saveBill);
}

// Function to load bill settings with better error handling
async function loadBillSettings() {
  try {
    showLoader();
    console.log('Loading bill settings...');
    
    // Use the correct API endpoint path based on your error message
    const response = await fetch('/billSeries/settings');
    
    if (response.ok) {
      billSettings = await response.json();
      console.log('Bill settings loaded:', billSettings);
    } else {
      // Handle 404 or other errors gracefully
      console.warn(`Failed to load bill settings: ${response.status}. Using default settings.`);
      
      // Use defaults if server endpoint is not available
      billSettings = {
        autoGenerate: false,
        prefix: "BILL",
        startNumber: 1000
      };
    }
    
    // Always set up the bill field regardless of whether API call succeeded
    await setupBillField();
    
    // Add visual indicator showing if auto-mode is on
    updateBillModeIndicator();
    
  } catch (error) {
    console.error('Error loading bill settings:', error);
    // Use defaults if server endpoint is not available
    billSettings = {
      autoGenerate: false,
      prefix: "BILL",
      startNumber: 1000
    };
    
    // Still set up the bill field with default settings
    await setupBillField();
    updateBillModeIndicator();
  } finally {
    hideLoader();
  }
}

function updateBillModeIndicator() {
    const billNumberLabel = document.querySelector('label[for="billNo"]');
    if (!billNumberLabel) return;
    
    // Remove old indicator if it exists
    const oldIndicator = document.querySelector('.bill-mode-indicator');
    if (oldIndicator) oldIndicator.remove();
    
    // Create new indicator
    const indicator = document.createElement('span');
    indicator.className = 'bill-mode-indicator ' + 
        (billSettings.autoGenerate ? 'auto-mode' : 'manual-mode');
    indicator.textContent = billSettings.autoGenerate 
        ? ' (Auto Mode)' 
        : ' (Manual Mode)';
    billNumberLabel.appendChild(indicator);
}

// Add this CSS to your stylesheet
// Add the following CSS to your styles.css or within a <style> tag in the HTML header
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .readonly-input {
            background-color: #f0f0f0;
            cursor: not-allowed;
            border: 1px solid #ccc;
        }
        
        .bill-mode-indicator {
            font-size: 0.8rem;
            margin-left: 5px;
        }
        
        .auto-mode {
            color: #4CAF50;
            font-weight: bold;
        }
        
        .manual-mode {
            color: #FF9800;
            font-style: italic;
        }
    `;
    document.head.appendChild(style);
});


// Function to get the next bill number with proper error handling
async function getNextBillNumber() {
  try {
    const response = await fetch(`${apiBaseUrl}/billSeries/latest-number`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Next bill number fetched:', data.nextBillNumber);
      return data.nextBillNumber;
    } else {
      // Generate a fallback bill number if API fails
      console.warn(`Failed to get next bill number: ${response.status}. Using fallback.`);
      const fallbackNumber = `${billSettings.prefix}${billSettings.startNumber}`;
      return fallbackNumber;
    }
  } catch (error) {
    console.error('Error fetching next bill number:', error);
    // Generate a fallback bill number if API fails
    const fallbackNumber = `${billSettings.prefix}${billSettings.startNumber}`;
    return fallbackNumber;
  }
}

async function setupBillField() {
  const billNumberField = document.getElementById('billNo');
  if (!billNumberField) {
    console.error('Bill number field not found in the DOM');
    return;
  }
  
  // Reset state first for clean handling
  billNumberField.value = '';
  billNumberField.readOnly = false;
  billNumberField.classList.remove('readonly-input');
  billNumberField.placeholder = 'Enter Bill Number';
  
  // If auto generate is enabled, fetch and set next bill number
  if (billSettings && billSettings.autoGenerate) {
    try {
      console.log('Auto-generate is ON, fetching next bill number...');
      
      const nextBillNumber = await getNextBillNumber();
      
      if (nextBillNumber) {
        currentBillNo = nextBillNumber; // Store in the global variable
        billNumberField.value = currentBillNo; // Use the global variable
        billNumberField.readOnly = true;
        billNumberField.classList.add('readonly-input');
        console.log('Bill number field set to:', currentBillNo);
      } else {
        throw new Error('Failed to generate a valid bill number');
      }
    } catch (error) {
      console.error('Error setting up bill field:', error);
      
      // Show notification to user
      showNotification('Error in bill number setup. Switching to manual mode.', true);
      
      // Fallback to manual mode if auto fails
      billNumberField.readOnly = false;
      billNumberField.classList.remove('readonly-input');
      billNumberField.placeholder = 'Enter Bill Number (Auto-mode failed)';
      
      // Update settings to reflect fallback
      billSettings.autoGenerate = false;
    }
  } else {
    console.log('Auto-generate is OFF, allowing manual entry');
  }
}

// Fixed fetchLatestBillNo function with better error handling
async function fetchLatestBillNo() {
    try {
        const response = await fetch(`${apiBaseUrl}/billSeries/latest-number`);
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Latest bill number fetched:', data.nextBillNumber);
        return data.nextBillNumber;
    } catch (error) {
        console.error('Error fetching latest bill number:', error);
        return null;
    }
}

// Fetch all party names from API
async function fetchAllParties() {
    try {
        // Get distinct party names from trip vouchers API
        const response = await fetch(`${tripVoucherUrl}/parties`);
        if (!response.ok) {
            throw new Error(`Failed to fetch parties: ${response.statusText}`);
        }
        
        const partyNames = await response.json();
        // Convert to object format expected by our existing code
        const parties = partyNames.map(name => ({ name }));
        populatePartyDropdown(parties);
    } catch (error) {
        console.error('Error fetching parties:', error);
        showNotification('Error loading party data: ' + error.message, true);
    }
}

// Populate party dropdown with fetched data
function populatePartyDropdown(parties) {
    const dropdown = document.getElementById('partySearchInput');
    
    // Clear existing options except the first default one
    while (dropdown.options.length > 1) {
        dropdown.remove(1);
    }
    
    // Add new party options
    if (parties && Array.isArray(parties)) {
        partySuggestions = parties; // Store for future use
        
        parties.forEach(party => {
            const option = document.createElement('option');
            option.value = party.name;
            option.textContent = party.name;
            dropdown.appendChild(option);
        });
    }
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
            const checkboxes = document.querySelectorAll('#partyBillTable tbody input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = selectAllCheckbox.checked;
            });
        });
    }
    
    // Party dropdown change event
    const partyDropdown = document.getElementById('partySearchInput');
    if (partyDropdown) {
        partyDropdown.addEventListener('change', function() {
            if (this.value.trim()) {
                applyFilters();
            }
        });
    }
}

// Function to validate form data including bill number validation
function validateFormData(formData) {
  const errors = [];
  
  // Validate bill number
  if (!formData.billNo || formData.billNo.trim() === '') {
    errors.push('Bill Number is required');
  }
  
  // Add additional validation logic as needed for other fields
  
  return errors;
}

function applyFilters() {
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;
    const partyName = document.getElementById('partySearchInput').value.trim();
    
    // Validate date range
    if (fromDate && toDate) {
        const fromDateObj = new Date(fromDate);
        const toDateObj = new Date(toDate);
        
        if (fromDateObj > toDateObj) {
            showNotification('From date cannot be greater than To date', true);
            return;
        }
    }
    
    // If party name is empty and no dates are specified, show notification
    if (!partyName && (!fromDate || !toDate)) {
        showNotification('Please select at least one filter criteria', true);
        return;
    }
    
    fetchPartyBills({
        fromDate,
        toDate,
        partyName
    });
}

// Updated reset filters function
function resetFilters() {
    // Reset to default date range (one month)
    setDefaultDateRange();
    
    // Clear party search input
    document.getElementById('partySearchInput').value = '';
    
    // Hide selected party info
    document.getElementById('selectedPartyInfo').classList.add('hidden');
    
    // Fetch with default date range (previous month to today)
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;
    
    fetchPartyBills({
        fromDate,
        toDate,
        partyName: ''
    });
}

function setupPartySearchAutocomplete() {
    const partyInput = document.getElementById('partySearchInput');
    
    if (!partyInput) return;
    
    // Add input event listener for real-time filtering
    partyInput.addEventListener('input', function() {
        clearTimeout(typingTimer);
        const query = this.value.trim().toLowerCase();
        
        // If query is empty, don't show dropdown
        if (query === '') {
            hidePartySearchDropdown();
            return;
        }
        
        // Wait for user to stop typing before showing results
        typingTimer = setTimeout(() => {
            // Filter parties based on input
            const matchingParties = partySuggestions.filter(party => 
                party.name && party.name.toLowerCase().includes(query)
            );
            
            // Show dropdown with matching parties
            showPartySearchDropdown(matchingParties, query);
        }, doneTypingInterval);
    });
    
    // Add blur event listener to hide dropdown when focus is lost
    partyInput.addEventListener('blur', function() {
        // Delayed hide to allow for option selection
        setTimeout(hidePartySearchDropdown, 200);
    });
}

function fetchPartyBills(filterParams = null) {
    try {
        showLoader();
        
        // If no filterParams provided, use current form values
        if (!filterParams) {
            const fromDate = document.getElementById('fromDate')?.value;
            const toDate = document.getElementById('toDate')?.value;
            const partyName = document.getElementById('partySearchInput')?.value;
            filterParams = { fromDate, toDate, partyName };
        }
        
        // Validate filter parameters
        if (!filterParams.fromDate || !filterParams.toDate) {
            console.warn('Missing date parameters, using defaults');
            const today = new Date();
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(today.getMonth() - 1);
            
            filterParams.fromDate = filterParams.fromDate || formatDateForInput(oneMonthAgo);
            filterParams.toDate = filterParams.toDate || formatDateForInput(today);
        }
        
        // Construct API URL with filters
        let url = `${tripVoucherUrl}/filter`;
        
        const params = [];
        
        if (filterParams) {
            if (filterParams.fromDate) params.push(`fromDate=${encodeURIComponent(filterParams.fromDate)}`);
            if (filterParams.toDate) params.push(`toDate=${encodeURIComponent(filterParams.toDate)}`);
            // Make sure we're passing partyName only if it's not empty after trimming
            if (filterParams.partyName && filterParams.partyName.trim() !== '') 
                params.push(`partyName=${encodeURIComponent(filterParams.partyName.trim())}`);
        }
        
        if (params.length > 0) {
            url += `?${params.join('&')}`;
        }
        
        console.log('Fetching data from:', url);
        
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(transactions => {
                console.log('Raw data from API:', transactions);
                
                // Handle null response
                if (!transactions) transactions = [];
                
                // Process the data to match our new table structure
                const processedTransactions = transactions.map(t => {
                    // Convert null or undefined values to empty strings or zeros
                    return {
                        id: t.id || Math.floor(Math.random() * 10000), // Generate ID if missing
                        mrNo: t.mrNo || t.voucherNo || '',
                        timestamp: t.timestamp || t.date || new Date().toISOString(),
                        lorryNo: t.lorryNo || t.vehicleNo || '', // Added for Lorry No.
                        fromLocation: t.fromLocation || t.from || '',
                        toLocation: t.toLocation || t.to || '',
                        toBeBilled: t.toBeBilled || '', // Use toBeBilled field for party name
                        partyName: t.toBeBilled || t.partyName || '', // Ensure partyName is available
                        trips: t.trips || 1, // T column
                        vehicleType: t.vehicleType || '', // Add vehicle type for V column
                        extra: parseFloat(t.lorryExtra || t.extra || 0),
                        freight: parseFloat(t.lorryFreight || t.freight || 0),
                        amount: parseFloat(t.amount || calculateAmountFromData(t) || 0)
                    };
                });
                
                console.log('Processed transactions:', processedTransactions);
                
                // Store for future operations
                currentTransactions = processedTransactions;
                
                // Update table with fetched data
                updateTableState(processedTransactions);
                
                // Update selected party info box
                const selectedPartyInfo = document.getElementById('selectedPartyInfo');
                const currentPartyName = document.getElementById('currentPartyName');
                
                if (selectedPartyInfo && currentPartyName && filterParams && filterParams.partyName && filterParams.partyName.trim() !== '') {
                    currentPartyName.textContent = filterParams.partyName.trim();
                    selectedPartyInfo.classList.remove('hidden');
                    
                    // Add count of found records
                    const recordCount = document.getElementById('recordCount');
                    if (recordCount) {
                        recordCount.textContent = `${processedTransactions.length} records found`;
                    } else {
                        const countSpan = document.createElement('span');
                        countSpan.id = 'recordCount';
                        countSpan.className = 'record-count';
                        countSpan.textContent = `${processedTransactions.length} records found`;
                        selectedPartyInfo.appendChild(countSpan);
                    }
                } else if (selectedPartyInfo) {
                    selectedPartyInfo.classList.add('hidden');
                }
                
                hideLoader();
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                showNotification('Error fetching data: ' + error.message, true);
                
                // Still update the table with empty data to show no results
                updateTableState([]);
                hideLoader();
            });
    } catch (error) {
        console.error('Error in fetch operation:', error);
        showNotification('Error in fetch operation: ' + error.message, true);
        
        // Still update the table with empty data to show no results
        updateTableState([]);
        hideLoader();
    }
}

// Ensure the noDataMessage element exists in the DOM
function ensureRequiredElements() {
    if (!document.getElementById('noDataMessage')) {
        const table = document.getElementById('partyBillTable');
        if (table && table.parentNode) {
            const messageDiv = document.createElement('div');
            messageDiv.id = 'noDataMessage';
            messageDiv.className = 'no-data-message';
            messageDiv.textContent = 'No data found for the selected filters.';
            messageDiv.style.display = 'none';
            table.parentNode.insertBefore(messageDiv, table.nextSibling);
        }
    }
    
    if (!document.getElementById('dataLoader')) {
        const loader = document.createElement('div');
        loader.id = 'dataLoader';
        loader.className = 'data-loader';
        loader.innerHTML = '<div class="spinner"></div><p>Loading data...</p>';
        loader.style.display = 'none';
        document.body.appendChild(loader);
    }
}

// Helper function to calculate amount from transaction data
function calculateAmountFromData(transaction) {
    // This is used during data processing to compute amount if missing
    const freight = parseFloat(transaction.lorryFreight || transaction.freight || 0);
    const extra = parseFloat(transaction.lorryExtra || transaction.extra || 0);
    
    // If payment type is cash or advance, amount is 0
    if (
        transaction.paymentType && 
        (transaction.paymentType.toLowerCase() === 'cash' || 
         transaction.paymentType.toLowerCase() === 'advance')
    ) {
        return 0;
    }
    
    return freight + extra;
}

// Show loader while fetching data
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

// Hide loader after data fetching
function hideLoader() {
    const loader = document.getElementById('dataLoader');
    if (loader) {
        loader.style.display = 'none';
    }
}

// Fix for updateTableState function to handle null elements
function updateTableState(transactions) {
    // First check if transactions is empty
    const hasTransactions = transactions && Array.isArray(transactions) && transactions.length > 0;
    
    // Get DOM elements with null checks
    const tableBody = document.querySelector('#partyBillTable tbody');
    const tableFooter = document.querySelector('#partyBillTable tfoot');
    const tableElement = document.getElementById('partyBillTable');
    const noDataMessage = document.getElementById('noDataMessage');
    
    // Early return if required elements don't exist
    if (!tableBody || !tableElement) {
        console.error('Critical UI elements not found. Table body or table element missing.');
        showNotification('UI elements not properly loaded. Please refresh the page.', true);
        return;
    }
    
    // Create noDataMessage element if it doesn't exist
    if (!noDataMessage) {
        console.log('Creating missing noDataMessage element');
        const messageDiv = document.createElement('div');
        messageDiv.id = 'noDataMessage';
        messageDiv.className = 'no-data-message';
        messageDiv.textContent = 'No data found for the selected filters.';
        
        // Insert after the table
        if (tableElement.parentNode) {
            tableElement.parentNode.insertBefore(messageDiv, tableElement.nextSibling);
        }
    }
    
    // Handle case when there are no transactions
    if (!hasTransactions) {
        console.log('No transactions to display');
        
        // Make the table hidden
        if (tableElement) tableElement.style.display = 'none';
        
        // Hide footer if it exists
        if (tableFooter) tableFooter.classList.add('hidden');
        
        // Show no data message
        const messageElement = document.getElementById('noDataMessage');
        if (messageElement) messageElement.style.display = 'block';
        
        return;
    }
    
    // If we have transactions, show the table and hide the message
    if (tableElement) tableElement.style.display = 'table';
    if (tableFooter) tableFooter.classList.remove('hidden');
    
    const messageElement = document.getElementById('noDataMessage');
    if (messageElement) messageElement.style.display = 'none';
    
    // Update table content and totals
    updateTableContent(tableBody, transactions);
    updateTotals(transactions);
}

// Now update the updateTableContent function to display vehicle type data in the V column
function updateTableContent(tableBody, transactions) {
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add transaction rows
    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        
        // Checkbox column
        const selectCell = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.dataset.id = transaction.id;
        selectCell.appendChild(checkbox);
        row.appendChild(selectCell);
        
        // MR No / Voucher No column
        const mrNoCell = document.createElement('td');
        mrNoCell.textContent = transaction.mrNo || '';
        row.appendChild(mrNoCell);
        
        // Date column
        const dateCell = document.createElement('td');
        dateCell.textContent = formatDate(transaction.timestamp);
        row.appendChild(dateCell);
        
        // Lorry No column
        const lorryNoCell = document.createElement('td');
        lorryNoCell.textContent = transaction.lorryNo || '';
        row.appendChild(lorryNoCell);
        
        // From Location column
        const fromCell = document.createElement('td');
        fromCell.textContent = transaction.fromLocation || '';
        row.appendChild(fromCell);
        
        // To Location column
        const toCell = document.createElement('td');
        toCell.textContent = transaction.toLocation || '';
        row.appendChild(toCell);
        
        // T (Trips) column
        const tripsCell = document.createElement('td');
        tripsCell.textContent = transaction.trips || 1;
        tripsCell.className = 'numeric';
        row.appendChild(tripsCell);
        
        // V (Vehicle Type) column - Fixed to display vehicle type data
        const vCell = document.createElement('td');
        vCell.textContent = transaction.vehicleType || '';
        row.appendChild(vCell);
        
        // Extra column
        const extraCell = document.createElement('td');
        extraCell.textContent = formatAmount(transaction.extra);
        extraCell.className = 'numeric';
        row.appendChild(extraCell);
        
        // Freight column
        const freightCell = document.createElement('td');
        freightCell.textContent = formatAmount(transaction.freight);
        freightCell.className = 'numeric';
        row.appendChild(freightCell);
        
        // Amount column
        const amountCell = document.createElement('td');
        const calculatedAmount = calculateAmount(transaction);
        amountCell.textContent = formatAmount(calculatedAmount);
        amountCell.className = 'numeric';
        row.appendChild(amountCell);
        
        // Add the row to the table
        tableBody.appendChild(row);
    });
}

// Calculate amount based on transaction data
function calculateAmount(transaction) {
    // If payment type is cash or advance, amount is 0
    if (
        transaction.paymentType && 
        (transaction.paymentType.toLowerCase() === 'cash' || 
         transaction.paymentType.toLowerCase() === 'advance')
    ) {
        return 0;
    }
    
    // Sum of freight and extra
    const freight = parseFloat(transaction.freight || 0);
    const extra = parseFloat(transaction.extra || 0);
    const amount = parseFloat(transaction.amount || 0);
    
    // If amount is already provided, use it
    if (amount > 0) {
        return amount;
    }
    
    // Otherwise calculate it
    return freight + extra;
}

// Update totals in table footer to match the new table structure
function updateTotals(transactions) {
    // Initialize all totals
    let totalTrips = 0;
    let totalExtra = 0;
    let totalFreight = 0;
    let totalAmount = 0;
    
    transactions.forEach(transaction => {
        // Safely parse values, default to 0 if parsing fails
        const trips = parseInt(transaction.trips || 1, 10) || 0;
        const extra = parseFloat(transaction.extra || 0) || 0;
        const freight = parseFloat(transaction.freight || 0) || 0;
        
        // Accumulate totals
        totalTrips += trips;
        totalExtra += extra;
        totalFreight += freight;
        
        // Calculate amount based on payment type
        const calculatedAmount = calculateAmount(transaction);
        totalAmount += calculatedAmount;
    });
    
    // Update footer cells with totals
    document.getElementById('totalTrips').textContent = totalTrips;
    document.getElementById('totalExtra').textContent = formatAmount(totalExtra);
    document.getElementById('totalFreight').textContent = formatAmount(totalFreight);
    document.getElementById('totalAmount').textContent = formatAmount(totalAmount);
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (e) {
        console.error("Error formatting date:", e);
        return '';
    }
}
// Format amount for display
function formatAmount(amount) {
    if (amount === null || amount === undefined) return '0.00';
    
    // Ensure it's a number and format with 2 decimal places
    const numAmount = parseFloat(amount);
    return isNaN(numAmount) ? '0.00' : numAmount.toFixed(2);
}

// Add vehicle type to column mapping for sorting
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
    
    // Clone the transactions array for sorting
    const sortedTransactions = [...currentTransactions];
    
    // Define column mapping for special cases
    const columnMapping = {
        'mrNo': 'mrNo', 
        'date': 'timestamp',
        'fromLocation': 'fromLocation',
        'toLocation': 'toLocation',
        'paymentType': 'paymentType',
        'trips': 'trips',
        'v': 'vehicleType', // Added for vehicle type column
        'advance': 'advance',
        'commission': 'lorryCommission',
        'extra': 'lorryExtra',
        'freight': 'lorryFreight',
        'amount': 'amount'
    };
    
    // Get the actual property name to sort by
    const propertyName = columnMapping[column] || column;
    
    // Sort the transactions
    sortedTransactions.sort((a, b) => {
        let valueA = a[propertyName];
        let valueB = b[propertyName];
        
        // Handle null/undefined values
        if (valueA === null || valueA === undefined) valueA = '';
        if (valueB === null || valueB === undefined) valueB = '';
        
        // Convert to numbers for numeric columns
        if (['trips', 'advance', 'lorryCommission', 'lorryExtra', 'lorryFreight', 'amount'].includes(propertyName)) {
            valueA = parseFloat(valueA) || 0;
            valueB = parseFloat(valueB) || 0;
            return sortConfig.direction === 'asc' ? valueA - valueB : valueB - valueA;
        } 
        // Date comparison for timestamp column
        else if (propertyName === 'timestamp') {
            valueA = new Date(valueA).getTime();
            valueB = new Date(valueB).getTime();
            
            // Handle invalid dates
            if (isNaN(valueA)) valueA = 0;
            if (isNaN(valueB)) valueB = 0;
            
            return sortConfig.direction === 'asc' ? valueA - valueB : valueB - valueA;
        }
        // String comparison for text columns
        else {
            valueA = String(valueA).toLowerCase();
            valueB = String(valueB).toLowerCase();
            return sortConfig.direction === 'asc' 
                ? valueA.localeCompare(valueB) 
                : valueB.localeCompare(valueA);
        }
    });
    
    // Update table with sorted data
    updateTableState(sortedTransactions);
}
// Update sort indicators in table headers
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
    
    // If notification doesn't exist, create it
    if (!notificationEl) {
        const newNotification = document.createElement('div');
        newNotification.id = 'notification';
        newNotification.className = `notification ${isError ? 'error' : 'success'}`;
        document.body.appendChild(newNotification);
    }
    
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${isError ? 'error' : 'success'}`;
    notification.style.display = 'block';
    
    // Auto-hide after 5 seconds
    if (window.notificationTimeout) {
        clearTimeout(window.notificationTimeout);
    }
    
    window.notificationTimeout = setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

// Get selected IDs from checkboxes
function getSelectedIds() {
    const selectedIds = [];
    const checkboxes = document.querySelectorAll('#partyBillTable tbody input[type="checkbox"]:checked');
    
    checkboxes.forEach(checkbox => {
        const id = parseInt(checkbox.dataset.id);
        if (!isNaN(id)) {
            selectedIds.push(id);
        }
    });
    
    return selectedIds;
}

// Fix the save bill function with proper error handling and JSON formatting
async function saveBill() {
  // Get all selected records
  const selectedIds = getSelectedIds();
  
  if (selectedIds.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'No Records Selected',
      text: 'Please select at least one record to include in the bill',
      confirmButtonColor: '#3085d6'
    });
    return false;
  }
  
  const billNo = document.getElementById('billNo').value.trim();
  if (!billNo) {
    Swal.fire({
      icon: 'error',
      title: 'Missing Bill Number',
      text: 'Please enter or generate a bill number',
      confirmButtonColor: '#3085d6'
    });
    return false;
  }
  
  const partyName = document.getElementById('partySearchInput').value.trim();
  if (!partyName) {
    Swal.fire({
      icon: 'error',
      title: 'Missing Party',
      text: 'Please select a party for the bill',
      confirmButtonColor: '#3085d6'
    });
    return false;
  }
  
  try {
    // Show loading state with SweetAlert2
    Swal.fire({
      title: 'Saving Bill...',
      html: 'Please wait while we process your request',
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });
    
    // Filter transactions by selected IDs
    const selectedTransactions = currentTransactions.filter(t => selectedIds.includes(t.id));
    
    // Format date properly for backend
    const billDate = document.getElementById('billDate')?.value || formatDateForInput(new Date());
    
    // Transform transactions to match the expected format in PartyBillRequest
    // Simplify the transaction objects to reduce chances of JSON parsing errors
    const formattedTransactions = selectedTransactions.map(t => {
      // Return only the essential properties needed by the backend
      return {
        id: t.id,
        mrNo: t.mrNo || "",
        date: t.timestamp, 
        lorryNo: t.lorryNo || "",
        fromLocation: t.fromLocation || "",
        toLocation: t.toLocation || "",
        partyName: t.partyName || t.toBeBilled || "",
        trips: t.trips || 1,
        vehicleType: t.vehicleType || "",
        extra: parseFloat(t.extra || 0),
        freight: parseFloat(t.freight || 0),
        amount: parseFloat(t.amount || calculateAmount(t) || 0)
      };
    });
    
    // Create a clean bill data object with minimal properties
    const billData = {
      billNo: billNo,
      partyName: partyName,
      date: billDate,
      transactions: formattedTransactions,
      totalAmount: calculateTotalAmount(selectedTransactions)
    };
    
    console.log('Sending bill data to server:', billData);
    
    // Validate the bill data
    const validationErrors = validateFormData({
      billNo: billNo,
      partyName: partyName
    });
    
    if (validationErrors.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: validationErrors.join(', '),
        confirmButtonColor: '#3085d6'
      });
      return false;
    }
    
    // Send to API - using correct endpoint with /api prefix
    const response = await fetch(`/api/party-bills/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(billData)
    });
    
    if (!response.ok) {
      let errorMessage = `Server returned status ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.text(); // Use text() instead of json() for easier debugging
        console.error('Server error response:', errorData);
        if (errorData) {
          errorMessage += ` - ${errorData}`;
        }
      } catch (e) {
        console.error('Error parsing error response:', e);
      }
      throw new Error(`Failed to save bill: ${errorMessage}`);
    }
    
    let savedBill;
    try {
      savedBill = await response.json();
    } catch (jsonError) {
      console.warn('Server returned non-JSON response:', jsonError);
      // Continue even if response isn't valid JSON - it might still have worked
    }
    
    // Success - increment bill number if auto-generate is on
    if (billSettings.autoGenerate) {
      try {
        // Call the increment API endpoint correctly
        const incrementResponse = await fetch(`/billSeries/increment-bill`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!incrementResponse.ok) {
          console.warn('Failed to increment bill number:', incrementResponse.statusText);
          // Continue with success message but with warning
          Swal.fire({
            icon: 'warning',
            title: 'Bill Saved',
            text: 'Bill saved successfully, but failed to update bill number for next entry.',
            confirmButtonColor: '#3085d6'
          });
        } else {
          let incrementData;
          try {
            incrementData = await incrementResponse.json();
            console.log('Bill number incremented:', incrementData);
            
            // Update the current bill number and UI
            if (incrementData && incrementData.nextBillNumber) {
              currentBillNo = incrementData.nextBillNumber;
              const billNoField = document.getElementById('billNo');
              if (billNoField) {
                billNoField.value = currentBillNo;
              }
            }
          } catch (parseError) {
            console.warn('Error parsing increment response:', parseError);
          }
          
          // Show success message with SweetAlert2
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: `Bill #${billNo} saved successfully!`,
            confirmButtonColor: '#3085d6'
          });
        }
      } catch (incrementError) {
        console.error('Error incrementing bill number:', incrementError);
        
        // Still show bill saved but with warning about increment
        Swal.fire({
          icon: 'warning',
          title: 'Bill Saved',
          text: 'Bill saved successfully, but failed to update bill number for next entry.',
          confirmButtonColor: '#3085d6'
        });
      }
    } else {
      // Not in auto-mode, just show success
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Bill #${billNo} saved successfully!`,
        confirmButtonColor: '#3085d6'
      });
    }
    
    // Uncheck all checkboxes after successful save
    const checkboxes = document.querySelectorAll('#partyBillTable tbody input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
      checkbox.checked = false;
    });
    
    // Also uncheck "select all" if it exists
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
      selectAllCheckbox.checked = false;
    }
    
    // Optional: refresh the table data
    applyFilters();
    
    return true;
    
  } catch (error) {
    console.error('Error saving bill:', error);
    
    // Show error message with SweetAlert2 with better error details
    Swal.fire({
      icon: 'error',
      title: 'Error Saving Bill',
      text: error.message || 'An unexpected error occurred',
      confirmButtonColor: '#3085d6'
    });
    
    return false;
  }
}


// Add SweetAlert2 to the page if it's not already there
function ensureSweetAlert() {
  if (typeof Swal === 'undefined') {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
      
      // Also add some basic styling for SweetAlert2 (optional)
      const style = document.createElement('style');
      style.textContent = `
        .swal2-popup {
          font-size: 1rem;
        }
      `;
      document.head.appendChild(style);
    });
  }
  return Promise.resolve();
}

// Call this function in the DOMContentLoaded event
document.addEventListener('DOMContentLoaded', async () => {
  await ensureSweetAlert();
  // rest of your initialization code remains the same
});

// Calculate total amount for selected transactions
function calculateTotalAmount(transactions) {
    let totalAmount = 0;
    
    transactions.forEach(transaction => {
        const calculatedAmount = calculateAmount(transaction);
        totalAmount += calculatedAmount;
    });
    
    return totalAmount;
}

// Function to increment bill number with better error handling
async function incrementBillNumber() {
  if (!billSettings.autoGenerate) {
    // Don't attempt increment if auto-generate is off
    return;
  }
  
  try {
    console.log('Incrementing bill number...');
    
    // Call API to increment bill number
    const response = await fetch(`${apiBaseUrl}/billSeries/increment-bill`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Bill number increment response:', data);
      
      // Update current bill number with the value returned from the server
      if (data && data.nextBillNumber) {
        currentBillNo = data.nextBillNumber;
        
        // Update the field if it exists
        const billNumberField = document.getElementById('billNo');
        if (billNumberField) {
          billNumberField.value = currentBillNo;
        }
        
        console.log('Bill number updated to:', currentBillNo);
        return true;
      } else {
        console.warn('Invalid response format from server when incrementing bill number');
        return false;
      }
    } else {
      console.warn(`Failed to increment bill number: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('Error incrementing bill number:', error);
    return false;
  }
}


// Show party search dropdown with matching results
function showPartySearchDropdown(parties, query) {
    // Get or create dropdown element
    let dropdown = document.getElementById('partySearchDropdown');
    
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = 'partySearchDropdown';
        dropdown.className = 'party-search-dropdown';
        const container = document.querySelector('.party-search-container');
        if (container) {
            container.appendChild(dropdown);
        } else {
            const partyInput = document.getElementById('partySearchInput');
            if (partyInput && partyInput.parentNode) {
                partyInput.parentNode.appendChild(dropdown);
            }
        }
    }
    
    // Clear previous results
    dropdown.innerHTML = '';
    
    // Add matching parties to dropdown
    if (parties && parties.length > 0) {
        parties.forEach(party => {
            if (!party.name) return; // Skip entries without names

            const option = document.createElement('div');
            option.className = 'party-option';
            option.textContent = party.name;
            option.addEventListener('click', () => {
                document.getElementById('partySearchInput').value = party.name;
                hidePartySearchDropdown();
                // Auto-apply filter when option is selected
                applyFilters();
            });
            dropdown.appendChild(option);
        });
        dropdown.style.display = 'block';
    } else {
        dropdown.innerHTML = '<div class="no-results">No matching parties found</div>';
        dropdown.style.display = 'block';
    }
}
// Hide party search dropdown
function hidePartySearchDropdown() {
    const dropdown = document.getElementById('partySearchDropdown');
    if (dropdown) {
        dropdown.style.display = 'none';
    }
}

