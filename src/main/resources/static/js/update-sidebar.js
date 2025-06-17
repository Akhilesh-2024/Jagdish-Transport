/**
 * Update Sidebar Script
 * 
 * This script updates the sidebar menu structure to place Trip Voucher after Dashboard and before Master.
 */

document.addEventListener('DOMContentLoaded', function() {
    updateSidebarMenuOrder();
    
    // Keep sidebar closed on page load/refresh
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
    }
});

/**
 * Update the sidebar menu order to place Trip Voucher after Dashboard and before Master
 */
function updateSidebarMenuOrder() {
    // Get the sidebar navigation list
    const navList = document.querySelector('.sidebar-content .nav');
    if (!navList) return;
    
    // Find the Dashboard, Master, and Trip Voucher items
    const dashboardItem = navList.querySelector('.nav-item:has(.dashboard-btn)');
    const masterItem = navList.querySelector('.nav-item:has([data-bs-toggle="collapse"][href="#master"])');
    const tripVoucherItem = Array.from(navList.querySelectorAll('.nav-item')).find(item => {
        const link = item.querySelector('a');
        return link && link.getAttribute('href') && link.getAttribute('href').includes('/tripVoucher');
    });
    
    // If all items are found, reorder them
    if (dashboardItem && masterItem && tripVoucherItem) {
        // Remove Trip Voucher from its current position
        navList.removeChild(tripVoucherItem);
        
        // Insert Trip Voucher after Dashboard and before Master
        navList.insertBefore(tripVoucherItem, masterItem);
    }
}