// Invoice Handler Module
console.log('Invoice Handler Module loaded successfully!');

// Constants and Configuration
const API_BASE_URL = '/api';
const PARTY_MASTER_URL = '/party-master';

// Initialize module when document is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeInvoiceHandlers();
});

function initializeInvoiceHandlers() {
    // Set up event listeners for invoice buttons
    const printButton = document.getElementById('printInvoiceBtn');
    const exportButton = document.getElementById('exportExcelBtn');
    
    if (printButton) {
        printButton.addEventListener('click', handlePrintInvoice);
    }
    
    if (exportButton) {
        exportButton.addEventListener('click', handleExportInvoice);
    }
    
    // Add custom styles for the invoice
    addInvoiceStyles();
}

// Common function to increment bill number after successful invoice actions
async function incrementBillNumber() {
  if (billSettings.autoGenerate) {
    try {
      // Show loader during the increment operation
      showLoader();
      
      // Call the increment API endpoint
      const incrementResponse = await fetch(`/billSeries/increment-bill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      // Hide loader after getting response
      hideLoader();
      
      if (!incrementResponse.ok) {
        console.warn('Failed to increment bill number:', incrementResponse.statusText);
        showNotification('Invoice processed, but failed to update bill number for next entry.', true);
        return false;
      } 
      
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
        
        return true;
      } catch (parseError) {
        console.warn('Error parsing increment response:', parseError);
        return false;
      }
    } catch (incrementError) {
      hideLoader();
      console.error('Error incrementing bill number:', incrementError);
      showNotification('Invoice processed, but failed to update bill number for next entry.', true);
      return false;
    }
  }
  
  return true; // Return true if auto-generate is off (no increment needed)
}

async function handlePrintInvoice() {
  try {
    // Check if transactions are selected
    const selectedIds = getSelectedIds();
    if (selectedIds.length === 0) {
      showNotification('Please select at least one transaction to print invoice', true);
      return;
    }
    
    // Get bill information
    const billNo = document.getElementById('billNo').value.trim();
    const billDate = document.getElementById('billDate').value;
    
    // Validate bill information
    if (!billNo) {
      showNotification('Please enter a valid Bill Number', true);
      return;
    }
    
    if (!billDate) {
      showNotification('Please enter a valid Bill Date', true);
      return;
    }
    
    // Get party name
    const partyName = document.getElementById('partySearchInput').value.trim();
    if (!partyName) {
      showNotification('Please select a party first', true);
      return;
    }
    
    // Show loader
    showLoader();
    
    // Get selected transactions
    const selectedTransactions = currentTransactions.filter(t => 
      selectedIds.includes(parseInt(t.id))
    );
    
    // Fetch party address from API
    const partyDetails = await fetchPartyDetails(partyName);
    
    // Prepare data for invoice
    const invoiceData = prepareInvoiceData(
      selectedTransactions, 
      billNo, 
      billDate, 
      partyName,
      partyDetails
    );
    
    // Populate the invoice template
    populateInvoiceTemplate(invoiceData);
    
    // Hide loader
    hideLoader();
    
    // Print the invoice
    printInvoice();
    
    // Increment bill number after successful print
    await incrementBillNumber();
    
  } catch (error) {
    hideLoader();
    console.error('Error generating invoice:', error);
    showNotification('Error generating invoice: ' + error.message, true);
  }
}
async function handleExportInvoice() {
  try {
    // Check if transactions are selected
    const selectedIds = getSelectedIds();
    if (selectedIds.length === 0) {
      showNotification('Please select at least one transaction to export', true);
      return;
    }
    
    // Get bill information
    const billNo = document.getElementById('billNo').value.trim();
    const billDate = document.getElementById('billDate').value;
    
    // Validate bill information
    if (!billNo) {
      showNotification('Please enter a valid Bill Number', true);
      return;
    }
    
    if (!billDate) {
      showNotification('Please enter a valid Bill Date', true);
      return;
    }
    
    // Get party name
    const partyName = document.getElementById('partySearchInput').value.trim();
    if (!partyName) {
      showNotification('Please select a party first', true);
      return;
    }
    
    // Show loader
    showLoader();
    
    // Get selected transactions
    const selectedTransactions = currentTransactions.filter(t => 
      selectedIds.includes(parseInt(t.id))
    );
    
    // Fetch party address from API
    const partyDetails = await fetchPartyDetails(partyName);
    
    // Prepare data for invoice
    const invoiceData = prepareInvoiceData(
      selectedTransactions, 
      billNo, 
      billDate, 
      partyName,
      partyDetails
    );
    
    // Export to Excel - using same data as print invoice
    exportToExcel(invoiceData);
    
    // Hide loader
    hideLoader();
    
    // Increment bill number after successful export
    await incrementBillNumber();
    
  } catch (error) {
    hideLoader();
    console.error('Error exporting invoice:', error);
    showNotification('Error exporting invoice: ' + error.message, true);
  }
}


// Fetch party details including address from the Party Master API
async function fetchPartyDetails(partyName) {
    try {
        // If "All Parties" is selected, return default values
        if (partyName === "All Parties") {
            return { 
                name: "All Parties",
                address: '',
                gstin: '',
                contactPerson: '',
                contactNumber: ''
            };
        }
        
        // Try to fetch by specific name first
        const directResponse = await fetch(`${PARTY_MASTER_URL}/by-name/${encodeURIComponent(partyName)}`);
        
        if (directResponse.ok) {
            const partyDetail = await directResponse.json();
            return {
                name: partyDetail.name || partyName,
                address: partyDetail.address || '',
                gstin: partyDetail.gstin || '',
                contactPerson: partyDetail.contactPerson || '',
                contactNumber: partyDetail.contactNumber || ''
            };
        }
        
        // If direct fetch fails, try to get all parties and find the matching one
        const response = await fetch(`${PARTY_MASTER_URL}/all`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch party details: ${response.status}`);
        }
        
        const parties = await response.json();
        
        // Find the party with matching name
        const partyDetail = parties.find(party => 
            party.name.toLowerCase() === partyName.toLowerCase()
        );
        
        if (!partyDetail) {
            console.warn(`Party details not found for: ${partyName}`);
            return { 
                name: partyName,
                address: '',
                gstin: '',
                contactPerson: '',
                contactNumber: ''
            };
        }
        
        return {
            name: partyDetail.name || partyName,
            address: partyDetail.address || '',
            gstin: partyDetail.gstin || '',
            contactPerson: partyDetail.contactPerson || '',
            contactNumber: partyDetail.contactNumber || ''
        };
        
    } catch (error) {
        console.error('Error fetching party details:', error);
        // Return empty details as fallback
        return { 
            name: partyName,
            address: '',
            gstin: '',
            contactPerson: '',
            contactNumber: ''
        };
    }
}

// Prepare all data needed for the invoice
function prepareInvoiceData(transactions, billNo, billDate, partyName, partyDetails) {
    // Calculate totals
    let totalTrips = 0;
    let totalExtra = 0;
    let totalFreight = 0;
    let totalAmount = 0;
    
    transactions.forEach(t => {
        // Safely convert to numbers
        const trips = parseInt(t.trips || 1);
        const extra = parseFloat(t.extra || 0);
        const freight = parseFloat(t.freight || 0);
        const amount = calculateAmount(t);
        
        // Accumulate totals
        totalTrips += (isNaN(trips) ? 0 : trips);
        totalExtra += (isNaN(extra) ? 0 : extra);
        totalFreight += (isNaN(freight) ? 0 : freight);
        totalAmount += amount;
    });
    
    // Get invoice period from transactions
    const invoicePeriod = getInvoicePeriod(transactions);
    
    // Convert total amount to words
    const amountInWords = numberToWords(totalAmount);
    
    // Get bank details
    const bankDetails = {
        accountHolder: document.getElementById('accountHolder').value.trim(),
        bankName: document.getElementById('bankName').value.trim(),
        accountNumber: document.getElementById('accountNumber').value.trim(),
        branch: document.getElementById('branch').value.trim(),
        ifscCode: document.getElementById('ifscCode').value.trim()
    };
    
    // Return prepared data
    return {
        transactions,
        billNo,
        billDate,
        partyName,
        partyAddress: partyDetails.address || '',
        partyGstin: partyDetails.gstin || '',
        contactPerson: partyDetails.contactPerson || '',
        contactNumber: partyDetails.contactNumber || '',
        totals: {
            trips: totalTrips,
            extra: totalExtra,
            freight: totalFreight,
            amount: totalAmount,
            amountInWords: amountInWords
        },
        invoicePeriod,
        bankDetails
    };
}

// Improved getInvoicePeriod function to use filter date range if available
function getInvoicePeriod(transactions, filterParams) {
    // First try to use the user-selected date range from filterParams
    if (filterParams && filterParams.fromDate && filterParams.toDate) {
        const fromDate = new Date(filterParams.fromDate);
        const toDate = new Date(filterParams.toDate);
        
        // Validate dates are valid
        if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
            const formatOptions = {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            };
            
            return `${fromDate.toLocaleDateString('en-IN', formatOptions)} to ${toDate.toLocaleDateString('en-IN', formatOptions)}`;
        }
    }
    
    // Fallback to calculating from transaction dates if filterParams not available
    if (!transactions || transactions.length === 0) {
        return 'N/A';
    }
    
    // Get all dates from transactions
    const dates = transactions
        .map(t => new Date(t.timestamp))
        .filter(d => !isNaN(d.getTime())); // Filter out invalid dates
    
    if (dates.length === 0) {
        return 'N/A';
    }
    
    // Find min and max dates
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    // Format dates for display
    const formatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    };
    
    return `${minDate.toLocaleDateString('en-IN', formatOptions)} to ${maxDate.toLocaleDateString('en-IN', formatOptions)}`;
}

// Populate the invoice template with data
function populateInvoiceTemplate(data) {
    // Set bill details
    document.getElementById('invoiceBillNo').textContent = data.billNo;
    document.getElementById('invoiceBillDate').textContent = formatDisplayDate(data.billDate);
    
    // Set period header with dynamic dates
    document.getElementById('invoicePeriod').textContent = data.invoicePeriod;
    
    // Set party details
    document.getElementById('invoicePartyName').textContent = data.partyName;
    
    // Format and set party address with contact details if available
    let addressText = data.partyAddress || '';
    
    if (data.partyGstin) {
        addressText += (addressText ? '\n' : '') + `GSTIN: ${data.partyGstin}`;
    }
    
    let contactText = '';
    if (data.contactPerson) {
        contactText += `Contact: ${data.contactPerson}`;
    }
    
    if (data.contactNumber) {
        contactText += (contactText ? ', ' : '') + data.contactNumber;
    }
    
    if (contactText) {
        addressText += (addressText ? '\n' : '') + contactText;
    }
    
    // Set address with line breaks for HTML
    document.getElementById('invoicePartyAddress').innerHTML = addressText.replace(/\n/g, '<br>');
    
    // Populate table with transactions
    const tableBody = document.getElementById('invoiceTableBody');
    tableBody.innerHTML = '';
    
    data.transactions.forEach(t => {
        const row = document.createElement('tr');
        
        // MR No.
        const mrNoCell = document.createElement('td');
        mrNoCell.className = 'text-left';
        mrNoCell.textContent = t.mrNo || '';
        row.appendChild(mrNoCell);
        
        // Date
        const dateCell = document.createElement('td');
        dateCell.className = 'text-left';
        dateCell.textContent = formatDate(t.timestamp);
        row.appendChild(dateCell);
        
        // Lorry No.
        const lorryNoCell = document.createElement('td');
        lorryNoCell.className = 'text-left';
        lorryNoCell.textContent = t.lorryNo || '';
        row.appendChild(lorryNoCell);
        
        // From
        const fromCell = document.createElement('td');
        fromCell.className = 'text-left';
        fromCell.textContent = t.fromLocation || '';
        row.appendChild(fromCell);
        
        // To
        const toCell = document.createElement('td');
        toCell.className = 'text-left';
        toCell.textContent = t.toLocation || '';
        row.appendChild(toCell);
        
        // Trips
        const tripsCell = document.createElement('td');
        tripsCell.className = 'center-col';
        tripsCell.textContent = t.trips || 1;
        row.appendChild(tripsCell);
        
        // Vehicle Type
        const vCell = document.createElement('td');
        vCell.className = 'text-left';
        vCell.textContent = t.vehicleType || '';
        row.appendChild(vCell);
        
        // Extra
        const extraCell = document.createElement('td');
        extraCell.className = 'amount-col';
        extraCell.textContent = formatAmount(t.extra);
        row.appendChild(extraCell);
        
        // Freight
        const freightCell = document.createElement('td');
        freightCell.className = 'amount-col';
        freightCell.textContent = formatAmount(t.freight);
        row.appendChild(freightCell);
        
        // Amount
        const amountCell = document.createElement('td');
        amountCell.className = 'amount-col';
        amountCell.textContent = formatAmount(calculateAmount(t));
        row.appendChild(amountCell);
        
        // Add row to table
        tableBody.appendChild(row);
    });
    
    // Set totals
    document.getElementById('invoiceTotalTrips').textContent = data.totals.trips;
    document.getElementById('invoiceTotalExtra').textContent = formatAmount(data.totals.extra);
    document.getElementById('invoiceTotalFreight').textContent = formatAmount(data.totals.freight);
    document.getElementById('invoiceTotalAmount').textContent = formatAmount(data.totals.amount);
    
    // Set amount in words
    document.getElementById('invoiceAmountInWords').textContent = data.totals.amountInWords;
    
    // Set bank details
    document.getElementById('invoiceAccountHolder').textContent = data.bankDetails.accountHolder || 'Not provided';
    document.getElementById('invoiceBankName').textContent = data.bankDetails.bankName || 'Not provided';
    document.getElementById('invoiceAccountNumber').textContent = data.bankDetails.accountNumber || 'Not provided';
    document.getElementById('invoiceBranch').textContent = data.bankDetails.branch || 'Not provided';
    document.getElementById('invoiceIFSCCode').textContent = data.bankDetails.ifscCode || 'Not provided';
}

// Print the invoice using browser's print functionality
function printInvoice() {
    const invoiceTemplate = document.getElementById('invoiceTemplate');
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
        showNotification('Please allow popup windows to print invoices', true);
        return;
    }
    
    // Prepare the HTML content
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice - ${document.getElementById('invoicePartyName').textContent}</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                ${getInvoiceStyles()}
            </style>
        </head>
        <body>
            ${invoiceTemplate.innerHTML}
        </body>
        </html>
    `;
    
    // Write to new window and print
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load before printing
    printWindow.onload = function() {
        setTimeout(() => {
            printWindow.print();
            // Optional: close the window after printing
            // printWindow.close();
        }, 500);
    };
}

// Export invoice data to Excel - updated to use the same data as print invoice
function exportToExcel(invoiceData) {
    try {
        // Create workbook
        const wb = XLSX.utils.book_new();
        
        // Prepare headers
        const headers = [
            'MR No.', 'Date', 'Lorry No.', 'From', 'To', 
            'Trips', 'Vehicle Type', 'Extra', 'Freight', 'Amount'
        ];
        
        // Prepare data with headers
        const excelData = [headers];
        
        // Add invoice info in the first few rows
        excelData.unshift(['']);
        excelData.unshift(['Bill No:', invoiceData.billNo, 'Bill Date:', formatDisplayDate(invoiceData.billDate)]);
        excelData.unshift(['Party Name:', invoiceData.partyName]);
        excelData.unshift(['Bill For The Period:', invoiceData.invoicePeriod]);
        
        if (invoiceData.partyAddress) {
            excelData.unshift(['Party Address:', invoiceData.partyAddress]);
        }
        
        if (invoiceData.partyGstin) {
            excelData.unshift(['GSTIN:', invoiceData.partyGstin]);
        }
        
        excelData.unshift(['JAGDISH TRANSPORT - INVOICE']);
        
        // Add transaction data
        invoiceData.transactions.forEach(t => {
            const row = [
                t.mrNo || '',
                formatDate(t.timestamp),
                t.lorryNo || '',
                t.fromLocation || '',
                t.toLocation || '',
                parseInt(t.trips || 1),
                t.vehicleType || '',
                parseFloat(t.extra || 0),
                parseFloat(t.freight || 0),
                calculateAmount(t)
            ];
            
            excelData.push(row);
        });
        
        // Add totals row
        excelData.push([
            '', '', '', '', '', 
            invoiceData.totals.trips, 
            '', 
            invoiceData.totals.extra, 
            invoiceData.totals.freight, 
            invoiceData.totals.amount
        ]);
        
        // Add amount in words
        excelData.push(['']);
        excelData.push(['Amount in Words:', invoiceData.totals.amountInWords]);
        
        // Add bank details
        excelData.push(['']);
        excelData.push(['Bank Details:']);
        excelData.push(['Account Holder:', invoiceData.bankDetails.accountHolder || 'Not provided']);
        excelData.push(['Bank Name:', invoiceData.bankDetails.bankName || 'Not provided']);
        excelData.push(['Account Number:', invoiceData.bankDetails.accountNumber || 'Not provided']);
        excelData.push(['Branch:', invoiceData.bankDetails.branch || 'Not provided']);
        excelData.push(['IFSC Code:', invoiceData.bankDetails.ifscCode || 'Not provided']);
        
        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        
        // Set column widths
        const colWidths = [
            { wch: 10 }, // MR No
            { wch: 12 }, // Date
            { wch: 12 }, // Lorry No
            { wch: 15 }, // From
            { wch: 15 }, // To
            { wch: 8 },  // Trips
            { wch: 15 }, // Vehicle Type
            { wch: 10 }, // Extra
            { wch: 10 }, // Freight
            { wch: 12 }  // Amount
        ];
        
        ws['!cols'] = colWidths;
        
        // Add to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Invoice');
        
        // Generate filename
        const filename = `Invoice_${invoiceData.partyName.replace(/[^a-z0-9]/gi, '_')}_${invoiceData.billNo}.xlsx`;
        
        // Save file
        XLSX.writeFile(wb, filename);
        
        // Show success notification
        showNotification(`Invoice exported successfully as ${filename}`);
        
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        showNotification('Error exporting to Excel: ' + error.message, true);
    }
}


// Convert number to words for invoice
function numberToWords(num) {
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const convertLessThanOneThousand = (num) => {
    if (num === 0) return '';
    
    let result = '';
    
    if (num < 10) {
      result = units[num];
    } else if (num < 20) {
      result = teens[num - 10];
    } else if (num < 100) {
      result = tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + units[num % 10] : '');
    } else {
      result = units[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' ' + convertLessThanOneThousand(num % 100) : '');
    }
    
    return result;
  };
  
  if (num === 0) return 'Zero Rupees Only';
  
  let rupees = Math.floor(num);
  let paise = Math.round((num - rupees) * 100);
  
  let result = '';
  
  if (rupees > 0) {
    if (rupees >= 10000000) {
      result += convertLessThanOneThousand(Math.floor(rupees / 10000000)) + ' Crore ';
      rupees %= 10000000;
    }
    
    if (rupees >= 100000) {
      result += convertLessThanOneThousand(Math.floor(rupees / 100000)) + ' Lakh ';
      rupees %= 100000;
    }
    
    if (rupees >= 1000) {
      result += convertLessThanOneThousand(Math.floor(rupees / 1000)) + ' Thousand ';
      rupees %= 1000;
    }
    
    if (rupees > 0) {
      result += convertLessThanOneThousand(rupees);
    }
    
    result += ' Rupees';
  }
  
  if (paise > 0) {
    result += (rupees > 0 ? ' and ' : '') + convertLessThanOneThousand(paise) + ' Paise';
  }
  
  return result + ' Only';
}

// Add invoice styles to the document
function addInvoiceStyles() {
    // Check if styles already exist
    if (document.getElementById('invoiceStyles')) {
        return;
    }
    
    // Create style element
    const style = document.createElement('style');
    style.id = 'invoiceStyles';
    style.textContent = getInvoiceStyles();
    
    // Add to document head
    document.head.appendChild(style);
}

// Get invoice styles as CSS text
function getInvoiceStyles() {
    return `
        /* Invoice Styles */
        .invoice-container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
            font-family: 'Arial', sans-serif;
            color: #333;
            background-color: #fff;
        }
        
        .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #1e3a8a;
            padding-bottom: 10px;
        }
        
        .invoice-logo {
            flex: 0 0 150px;
/*			background-color: gray;
*/        }
        
        .invoice-title {
            text-align: right;
            flex: 1;
        }
        
        .invoice-title h2 {
            color: #1e3a8a;
            font-size: 28px;
            margin: 0 0 5px 0;
        }
        
        .invoice-company {
            font-size: 20px;
            font-weight: bold;
            color: #1e3a8a;
            margin-bottom: 5px;
        }
        
        .invoice-address {
            font-size: 12px;
            color: #555;
            margin-bottom: 2px;
        }
        
        .invoice-contact {
            font-size: 12px;
            color: #555;
        }
        
        .invoice-details-section {
            margin-bottom: 20px;
        }
        
        .invoice-period-box {
            background-color: #f8f9fa;
            padding: 8px 12px;
            border-radius: 4px;
            margin-bottom: 15px;
            border-left: 4px solid #1e3a8a;
            font-size: 14px;
        }
        
        .invoice-party-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
        }
        
        .invoice-party-details {
            flex: 1;
            padding-right: 20px;
        }
        
        .party-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .party-address {
            font-size: 14px;
            color: #555;
            line-height: 1.4;
        }
        
        .invoice-bill-details {
            text-align: right;
            flex: 0 0 200px;
        }
        
        .bill-number, .bill-date {
            font-size: 14px;
            margin-bottom: 5px;
        }
        
        .label {
            font-weight: bold;
            color: #555;
        }
        
        .invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        .invoice-table th {
            background-color: #1e3a8a;
            color: white;
            padding: 10px;
            font-size: 14px;
            text-align: left;
            font-weight: normal;
        }
        
        .invoice-table td {
            padding: 8px 10px;
            border-bottom: 1px solid #e0e0e0;
            font-size: 13px;
        }
        
        .invoice-table tbody tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        .invoice-table .amount-col {
            text-align: right;
        }
        
        .invoice-table .center-col {
            text-align: center;
        }
        
        .invoice-table .text-left {
            text-align: left;
        }
        
        .total-row {
            font-weight: bold;
            background-color: #f0f0f0 !important;
        }
        
        .total-row td {
            border-top: 2px solid #1e3a8a;
            border-bottom: 2px solid #1e3a8a !important;
        }
        
        .total-label {
            text-align: right;
        }
        
        .bold-amount {
            font-weight: bold;
            color: #1e3a8a;
        }
        
        .no-border {
            border: none !important;
        }
        
        .invoice-footer {
            display: flex;
            justify-content: space-between;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
        }
        
        .invoice-bank-details {
            flex: 1;
        }
        
        .invoice-bank-details h4 {
            color: #1e3a8a;
            margin-top: 0;
            margin-bottom: 10px;
            font-size: 16px;
        }
        
        .bank-details-table {
            border-collapse: collapse;
            width: 100%;
            max-width: 400px;
        }
        
        .bank-details-table td {
            padding: 4px 0;
            font-size: 13px;
        }
        
        .bank-details-table td:first-child {
            width: 40%;
        }
        
        .invoice-signature {
            text-align: center;
            flex: 0 0 200px;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            align-items: center;
        }
        
        .signature-line {
            width: 180px;
            border-bottom: 1px solid #1e3a8a;
            margin: 40px 0 10px 0;
        }
        
        .invoice-terms {
            margin-top: 20px;
            font-size: 12px;
            color: #777;
            text-align: center;
            padding-top: 10px;
            border-top: 1px solid #e0e0e0;
        }
        
        .terms-note {
            margin: 0;
            font-style: italic;
        }
        
        /* Responsive adjustments */
        @media print {
            body {
                margin: 0;
                padding: 0;
                background: white;
            }
            
            .invoice-container {
                width: 100%;
                max-width: none;
                padding: 10mm;
                margin: 0;
                box-shadow: none;
                border: none;
            }
            
            /* Ensure page breaks don't happen in the middle of rows */
            .invoice-table tr {
                page-break-inside: avoid;
            }
            
            /* Ensure headers print correctly on every page */
            .invoice-table thead {
                display: table-header-group;
            }
            
            /* Force background colors to print */
            .invoice-table th {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                color-adjust: exact;
                background-color: #1e3a8a !important;
                color: white !important;
            }
            
            .invoice-table tbody tr:nth-child(even) {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                color-adjust: exact;
                background-color: #f9f9f9 !important;
            }
            
            .total-row {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                color-adjust: exact;
                background-color: #f0f0f0 !important;
            }
        }
        
        @media screen and (max-width: 768px) {
            .invoice-party-section {
                flex-direction: column;
            }
            
            .invoice-bill-details {
                text-align: left;
                margin-top: 15px;
            }
            
            .invoice-footer {
                flex-direction: column;
            }
            
            .invoice-signature {
                margin-top: 20px;
                align-items: flex-start;
            }
        }
    `;
}

// Format date for input fields (YYYY-MM-DD)
function formatDisplayDate(dateString) {
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
        console.error("Error formatting display date:", e);
        return '';
    }
}

// Make these functions available globally for other modules
window.handlePrintInvoice = handlePrintInvoice;
window.handleExportInvoice = handleExportInvoice;