console.log('From To Table JS loaded');

let transactionTable;
let transactions = [];

document.addEventListener('DOMContentLoaded', function() {
    loadTransactionsFromServer();
    setupEventListeners();
    setupEditableTable();
});

function goToForm() {
    window.location.href = 'fromTo';
}

// Setup event listeners
function setupEventListeners() {
    // Add export button listener
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToExcel);
    }
    
    // Add add button listener
    const addBtn = document.getElementById('addBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            window.location.href = 'fromTo';
        });
    }
}

// Load transactions from server and display in table
function loadTransactionsFromServer() {
    const table = document.getElementById('transactionTable');
    const noData = document.getElementById('noDataMessage');
    const summaryContainer = document.querySelector('.summary-container');
    const loadingIndicator = document.createElement('div');
    
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading transactions...';
    document.body.appendChild(loadingIndicator);
    
    fetch('http://localhost:8081/api/transactions/all')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch transactions');
            }
            return response.json();
        })
        .then(data => {
            transactions = data;
            console.log('Loaded Transactions:', transactions);
            
            // Handle empty state
            if (!transactions.length) {
                table.style.display = 'none';
                noData.style.display = 'block';
                summaryContainer.style.display = 'none';
                return;
            }

            // Show table when data exists
            table.style.display = 'table';
            noData.style.display = 'none';
            summaryContainer.style.display = 'block';

            updateTableContent(transactions);
            updateTotals(transactions);
        })
        .catch(error => {
            console.error('Error loading transactions:', error);
            showNotification('Error loading transactions: ' + error.message, true);
            
            // Show error state
            table.style.display = 'none';
            noData.innerHTML = `<p><i class="fas fa-exclamation-circle"></i> Failed to load transactions: ${error.message}</p>
                               <p>Please check your connection and try again.</p>`;
            noData.style.display = 'block';
            summaryContainer.style.display = 'none';
        })
        .finally(() => {
            document.body.removeChild(loadingIndicator);
        });
}

function updateTableContent(transactions) {
    const tbody = document.querySelector('#transactionTable tbody');
    
    tbody.innerHTML = transactions.map((t, index) => `
        <tr id="row-${t.id}" data-id="${t.id}">
            <td class="editable" data-field="mrNo">${t.mrNo || ''}</td>
            <td class="editable" data-field="date">${formatDate(t.date) || ''}</td>
            <td class="editable" data-field="vehicleNo">${t.vehicleNo || ''}</td>
            <td class="editable" data-field="fromLocation">${t.fromLocation || ''}</td>
            <td class="editable" data-field="toLocation">${t.toLocation || ''}</td>
            <td class="editable" data-field="paymentType">${t.paymentType || ''}</td>
            <td class="editable" data-field="trips">${t.trips || '1'}</td>
            <td class="editable" data-field="advance">${formatNumber(t.advance)}</td>
            <td class="editable" data-field="commission">${formatNumber(t.commission)}</td>
            <td class="editable" data-field="extra">${formatNumber(t.extra)}</td>
            <td class="editable" data-field="freight">${formatNumber(t.freight)}</td>
            <td>${formatNumber(calculateAmount(t))}</td>
            <td class="actions">
                <button onclick="editRecord(${t.id})" class="btn-icon btn-edit" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteRecord(${t.id})" class="btn-icon btn-delete" title="Delete">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function setupEditableTable() {
    const tbody = document.querySelector('#transactionTable tbody');
    
    // Event delegation for editable cells
    tbody.addEventListener('dblclick', function(e) {
        const cell = e.target.closest('.editable');
        if (!cell) return;
        
        const currentValue = cell.textContent;
        const field = cell.dataset.field;
        const row = cell.parentElement;
        const id = row.dataset.id;
        
        // Create input for editing
        const input = document.createElement('input');
        input.type = field === 'date' ? 'date' : 'text';
        input.value = field === 'date' ? formatDateForInput(currentValue) : 
                     (field === 'advance' || field === 'commission' || field === 'extra' || field === 'freight') ? 
                     parseFormattedNumber(currentValue) : currentValue;
        input.className = 'cell-editor';
        
        // Replace cell content with input
        cell.innerHTML = '';
        cell.appendChild(input);
        input.focus();
        
        // Handle input blur (save on exit)
        input.addEventListener('blur', function() {
            saveCell(id, field, this.value, cell);
        });
        
        // Handle input key press
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                saveCell(id, field, this.value, cell);
            } else if (e.key === 'Escape') {
                cell.textContent = currentValue;
            }
        });
    });
}

function formatDateForInput(dateString) {
    if (!dateString) return '';
    
    // Handle date format: DD/MM/YYYY to YYYY-MM-DD for input
    const parts = dateString.split('/');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    
    // Try to parse as date object
    const date = new Date(dateString);
    if (!isNaN(date)) {
        return date.toISOString().split('T')[0];
    }
    
    return dateString;
}

function saveCell(id, field, value, cell) {
    // Find the transaction
    const transaction = transactions.find(t => t.id == id);
    if (!transaction) {
        console.error('Transaction not found:', id);
        cell.textContent = value;
        return;
    }
    
    // Get the row for accessing other cells
    const row = cell.closest('tr');
    
    // Format value based on field type
    let originalValue = value;
    if (field === 'date') {
        // Format date for display
        const date = new Date(value);
        if (!isNaN(date)) {
            const formattedDate = formatDate(date);
            cell.textContent = formattedDate;
            value = date.toISOString().split('T')[0]; // Format for server
        } else {
            cell.textContent = value;
        }
    } else if (field === 'paymentType') {
        // Handle payment type changes
        cell.textContent = value;
        
        // Update amount based on new payment type
        const freight = parseFormattedNumber(row.querySelector('[data-field="freight"]').textContent) || 0;
        const extra = parseFormattedNumber(row.querySelector('[data-field="extra"]').textContent) || 0;
        
        // Calculate new amount
        const amountCell = row.querySelector('td:nth-last-child(2)');
        if (amountCell) {
            // Get new amount based on payment type
            const newAmount = value === 'Credit' ? freight + extra : 0;
            amountCell.textContent = formatNumber(newAmount);
        }
    } else if (field === 'advance' || field === 'commission' || field === 'extra' || field === 'freight') {
        // Format number for display
        const num = parseFloat(value) || 0;
        cell.textContent = formatNumber(num);
        value = num; // Send number to server
        
        // If changing freight or extra and payment type is Credit, update amount
        if ((field === 'freight' || field === 'extra') && transaction.paymentType === 'Credit') {
            const freight = field === 'freight' ? num : parseFormattedNumber(row.querySelector('[data-field="freight"]').textContent);
            const extra = field === 'extra' ? num : parseFormattedNumber(row.querySelector('[data-field="extra"]').textContent);
            
            // Update amount cell
            const amountCell = row.querySelector('td:nth-last-child(2)');
            if (amountCell) {
                amountCell.textContent = formatNumber(freight + extra);
            }
        }
    } else {
        cell.textContent = value;
    }
    
    // Check if value actually changed
    if (transaction[field] === value) {
        return; // No change, don't update
    }
    
    // Update transaction object
    transaction[field] = value;
    
    // Calculate amount field if needed
    if (field === 'freight' || field === 'extra' || field === 'paymentType') {
        const amount = calculateAmount(transaction);
        transaction.amount = amount;
    }
    
    // Send update to server
    const updateIndicator = document.createElement('span');
    updateIndicator.className = 'update-indicator';
    updateIndicator.innerHTML = ' <i class="fas fa-sync fa-spin"></i>';
    cell.appendChild(updateIndicator);
    
    fetch(`http://localhost:8081/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message); });
        }
        return response.json();
    })
    .then(data => {
        console.log('Update success:', data);
        // Update UI with server response data
        const updatedTransaction = data.transaction;
        
        // Find the transaction and update with server response
        const index = transactions.findIndex(t => t.id == id);
        if (index !== -1) {
            transactions[index] = updatedTransaction;
        }
        
        // Update totals
        updateTotals(transactions);
        
        // Add success indicator
        cell.classList.add('updated');
        setTimeout(() => cell.classList.remove('updated'), 1500);
    })
    .catch(error => {
        console.error('Update error:', error);
        // Revert to original value
        if (field === 'date') {
            cell.textContent = formatDate(transaction.date);
        } else if (field === 'advance' || field === 'commission' || field === 'extra' || field === 'freight') {
            cell.textContent = formatNumber(transaction[field]);
        } else {
            cell.textContent = transaction[field] || '';
        }
        
        // Add error indicator
        cell.classList.add('update-error');
        showNotification('Error updating: ' + error.message, true);
        setTimeout(() => cell.classList.remove('update-error'), 2000);
    })
    .finally(() => {
        if (updateIndicator.parentNode === cell) {
            cell.removeChild(updateIndicator);
        }
    });
}

function formatDate(dateString) {
    if (!dateString) return '';  // Handle empty date case
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;  // If invalid date, return original string
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function editRecord(id) {
    window.location.href = `fromTo?edit=true&id=${id}`;
}

function deleteRecord(id) {
    try {
        Swal.fire({
            title: 'Are you sure?',
            text: "This will permanently delete this transaction!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            background: 'rgb(26, 32, 53)',
            color: '#fff'
        }).then((result) => {
            if (result.isConfirmed) {
                const row = document.querySelector(`tr#row-${id}`);
                
                // Add fade out animation
                row.style.animation = 'fadeOut 0.3s ease forwards';
                
                // Send delete request to server
                fetch(`http://localhost:8081/api/transactions/${id}`, {
                    method: 'DELETE'
                })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(err => { throw new Error(err.message); });
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Delete success:', data);
                    
                    // Remove from local array
                    transactions = transactions.filter(t => t.id != id);
                    
                    // Update UI after animation
                    setTimeout(() => {
                        if (transactions.length === 0) {
                            document.getElementById('transactionTable').style.display = 'none';
                            document.getElementById('noDataMessage').style.display = 'block';
                            document.querySelector('.summary-container').style.display = 'none';
                        } else {
                            row.remove();
                            updateTotals(transactions);
                        }
                        showNotification('Record deleted successfully!');
                    }, 300);
                })
                .catch(error => {
                    console.error('Delete error:', error);
                    // Restore row if delete failed
                    row.style.animation = '';
                    showNotification('Error deleting record: ' + error.message, true);
                });
            }
        });
    } catch (error) {
        console.error('Delete error:', error);
        showNotification('Error deleting record', true);
    }
}

// Format number to 2 decimal places
function formatNumber(value) {
    const num = parseFloat(value) || 0;
    return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        style: 'decimal'
    }).format(num);
}

// Parse number from formatted string
function parseFormattedNumber(formattedValue) {
    if (typeof formattedValue === 'number') return formattedValue;
    // Remove thousand separators and parse as float
    return parseFloat(formattedValue.toString().replace(/,/g, '')) || 0;
}

// Calculate amount based on payment type
function calculateAmount(transaction) {
    const freight = parseFloat(transaction.freight) || 0;
    const extra = parseFloat(transaction.extra) || 0;
    const commission = parseFloat(transaction.commission) || 0;
    const advance = parseFloat(transaction.advance) || 0;

    switch (transaction.paymentType) {
        case 'Cash':
            return 0;
        case 'Credit':
            return freight + extra;
        case 'Advance':
            return 0;
        default:
            return 0;
    }
}

// Update totals in summary section
function updateTotals(transactions) {
    let totalTrips = 0;
    let totalAdvance = 0;
    let totalCommission = 0;
    let totalExtra = 0;
    let totalFreight = 0;
    let totalAmount = 0;

    // Calculate totals
    transactions.forEach(t => {
        const trips = parseInt(t.trips || '1', 10);
        const advance = parseFormattedNumber(t.advance || '0');
        const commission = parseFormattedNumber(t.commission || '0');
        const extra = parseFormattedNumber(t.extra || '0');
        const freight = parseFormattedNumber(t.freight || '0');
        const amount = calculateAmount(t);

        totalTrips += trips;
        totalAdvance += advance;
        totalCommission += commission;
        totalExtra += extra;
        totalFreight += freight;
        totalAmount += amount;
    });

    // Update table footer totals
    document.getElementById('totalTrips').textContent = totalTrips;
    document.getElementById('totalAdvance').textContent = formatNumber(totalAdvance);
    document.getElementById('totalCommission').textContent = formatNumber(totalCommission);
    document.getElementById('totalExtra').textContent = formatNumber(totalExtra);
    document.getElementById('totalFreight').textContent = formatNumber(totalFreight);
    document.getElementById('totalAmount').textContent = formatNumber(totalAmount);
    
    // Update summary section
    document.getElementById('summaryAmount').textContent = formatNumber(totalAmount);
    document.getElementById('summaryAdvance').textContent = formatNumber(totalAdvance);
    document.getElementById('summaryCommission').textContent = formatNumber(totalCommission);

    // Calculate net balance
    const netBalance = totalAmount - totalAdvance - totalCommission;
    const nettBalanceElement = document.getElementById('nettBalance');

    nettBalanceElement.textContent = formatNumber(Math.abs(netBalance));
    nettBalanceElement.className = 'summary-amount ' + (netBalance < 0 ? 'negative-amount' : 'positive-amount');
    if (netBalance < 0) nettBalanceElement.textContent = '(-) ' + nettBalanceElement.textContent;
}

// Export to Excel functionality
function exportToExcel() {
    if (transactions.length === 0) {
        showNotification('No data to export!', true);
        return;
    }
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    
    // Format data for export
    const exportData = transactions.map(t => ({
        'MR No': t.mrNo,
        'Date': formatDate(t.date),
        'Vehicle No': t.vehicleNo,
        'From': t.fromLocation,
        'To': t.toLocation,
        'Payment Type': t.paymentType,
        'Trips': t.trips,
        'Advance': parseFormattedNumber(t.advance),
        'Commission': parseFormattedNumber(t.commission),
        'Extra': parseFormattedNumber(t.extra),
        'Freight': parseFormattedNumber(t.freight),
        'Amount': calculateAmount(t)
    }));
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    
    // Generate Excel file
    const fileName = `Transactions_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    showNotification('Exported successfully to ' + fileName);
}

// Show notification popup
function showNotification(message, isError = false) {
    const notification = document.getElementById('notification') || createNotificationElement();
    notification.innerHTML = `
        <i class="fas ${isError ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
        <span>${message}</span>
    `;
    notification.classList.add('show');
    if (isError) notification.classList.add('error');
    else notification.classList.remove('error');

    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show', 'error');
    }, 3000);
}

// Create notification element if it doesn't exist
function createNotificationElement() {
    const notification = document.createElement('div');
    notification.id = 'notification';
    document.body.appendChild(notification);
    
    // Add styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            #notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(46, 125, 50, 0.9);
                color: white;
                padding: 10px 20px;
                border-radius: 4px;
                display: flex;
                align-items: center;
                gap: 10px;
                transform: translateY(100px);
                opacity: 0;
                transition: all 0.3s ease;
                z-index: 1000;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            #notification.show {
                transform: translateY(0);
                opacity: 1;
            }
            #notification.error {
                background: rgba(198, 40, 40, 0.9);
            }
            #notification i {
                font-size: 18px;
            }
            @keyframes fadeOut {
                from { opacity: 1; transform: translateX(0); }
                to { opacity: 0; transform: translateX(-10px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    return notification;
}

// Refresh data from server
function refreshData() {
    loadTransactionsFromServer();
    showNotification('Data refreshed from server');
}

// Add this to your existing styles or create a new style tag
const editableTableStyles = document.createElement('style');
editableTableStyles.textContent = `
    .editable {
        cursor: cell;
        position: relative;
    }
    
    .editable:hover::after {
        content: "✎";
        position: absolute;
        top: 2px;
        right: 2px;
        font-size: 12px;
        color: #3b82f6;
        opacity: 0.5;
    }
    
    .cell-editor {
        width: 100%;
        padding: 4px;
        border: 2px solid #3b82f6;
        background: #1a2035;
        color: white;
        border-radius: 4px;
        outline: none;
    }
    
    .updated {
        animation: highlight 1.5s ease;
    }
    
    .update-error {
        background-color: rgba(220, 38, 38, 0.2) !important;
    }
    
    @keyframes highlight {
        0% { background-color: rgba(59, 130, 246, 0.5); }
        100% { background-color: transparent; }
    }
    
    .loading-indicator {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(26, 32, 53, 0.9);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 1000;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        font-size: 16px;
    }
    
    .loading-indicator i {
        font-size: 20px;
        color: #3b82f6;
    }
    
    .update-indicator {
        margin-left: 5px;
        color: #3b82f6;
    }
`;
document.head.appendChild(editableTableStyles);