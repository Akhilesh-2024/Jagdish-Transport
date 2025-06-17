/**
 * Dashboard Statistics JavaScript
 * Fetches and displays dashboard statistics
 */

document.addEventListener('DOMContentLoaded', function() {
    // Fetch dashboard statistics
    fetchDashboardStats();
});

/**
 * Fetches dashboard statistics from the API
 */
function fetchDashboardStats() {
    fetch('/api/dashboard/stats')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            updateDashboardStats(data);
        })
        .catch(error => {
            console.error('Error fetching dashboard stats:', error);
            // Set default values in case of error
            updateDashboardStats({
                totalVehicles: 0,
                totalParties: 0,
                totalLocations: 0,
                totalVehicleTypes: 0,
                recentBills: []
            });
        });
}

/**
 * Updates the dashboard with the fetched statistics
 */
function updateDashboardStats(data) {
    // Update stat cards
    document.getElementById('totalVehicles').textContent = data.totalVehicles;
    document.getElementById('totalParties').textContent = data.totalParties;
    document.getElementById('totalLocations').textContent = data.totalLocations;
    document.getElementById('totalVehicleTypes').textContent = data.totalVehicleTypes;
    
    // Update recent bills table
    updateRecentBillsTable(data.recentBills);
    
    // Add animation to the numbers
    animateNumbers();
}

/**
 * Updates the recent bills table with the fetched data
 */
function updateRecentBillsTable(bills) {
    const tableBody = document.getElementById('recentBillsTable');
    
    // Clear existing content
    tableBody.innerHTML = '';
    
    if (bills && bills.length > 0) {
        // Add each bill to the table with a slight delay for animation effect
        bills.forEach((bill, index) => {
            setTimeout(() => {
                const row = document.createElement('tr');
                row.style.opacity = '0';
                row.style.transform = 'translateY(10px)';
                row.style.transition = 'all 0.3s ease';
                
                // Format the date
                const billDate = new Date(bill.billDate);
                const formattedDate = billDate.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
                
                // Format the amount
                const formattedAmount = new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR'
                }).format(bill.totalAmount);
                
                // Truncate party name if too long
                const partyName = bill.partyName.length > 25 
                    ? bill.partyName.substring(0, 25) + '...' 
                    : bill.partyName;
                
                row.innerHTML = `
                    <td><span class="badge bg-primary text-white">${bill.billNo}</span></td>
                    <td>${formattedDate}</td>
                    <td title="${bill.partyName}">${partyName}</td>
                    <td><strong>${formattedAmount}</strong></td>
                    <td class="text-center">
                        <a href="/partyBill?billNo=${bill.billNo}" class="btn btn-primary btn-sm rounded-pill">
                            <i class="fas fa-eye"></i> View
                        </a>
                    </td>
                `;
                
                tableBody.appendChild(row);
                
                // Trigger animation after a small delay
                setTimeout(() => {
                    row.style.opacity = '1';
                    row.style.transform = 'translateY(0)';
                }, 50);
            }, index * 100); // Stagger the appearance of each row
        });
    } else {
        // Show a message if no bills are available
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="5" class="text-center py-4">
                <div class="empty-state">
                    <i class="fas fa-file-invoice text-muted" style="font-size: 3rem;"></i>
                    <p class="mt-3 mb-0">No recent bills found</p>
                    <a href="/partyBill" class="btn btn-sm btn-primary mt-3">Create New Bill</a>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    }
}

/**
 * Adds animation to the stat numbers
 */
function animateNumbers() {
    const numberElements = document.querySelectorAll('.card-title');
    
    numberElements.forEach((element, index) => {
        const finalValue = parseInt(element.textContent);
        
        // Only animate if it's a number
        if (!isNaN(finalValue)) {
            // Add a slight delay for each card to create a cascade effect
            setTimeout(() => {
                let startValue = 0;
                const duration = 1500; // 1.5 seconds
                const increment = finalValue / (duration / 16); // 60fps
                
                // Add a highlight effect to the card
                const card = element.closest('.dashboard-card');
                if (card) {
                    card.style.transition = 'box-shadow 0.3s ease';
                    card.style.boxShadow = '0 0 15px rgba(23, 125, 255, 0.5)';
                    
                    // Remove highlight after animation
                    setTimeout(() => {
                        card.style.boxShadow = '';
                    }, duration);
                }
                
                const timer = setInterval(() => {
                    startValue += increment;
                    
                    if (startValue >= finalValue) {
                        element.textContent = finalValue;
                        clearInterval(timer);
                        
                        // Add a small bounce effect when done
                        element.style.transform = 'scale(1.1)';
                        setTimeout(() => {
                            element.style.transform = 'scale(1)';
                        }, 100);
                    } else {
                        element.textContent = Math.floor(startValue);
                    }
                }, 16);
            }, index * 200); // Stagger the animations
        }
    });
}