/**
 * Test Script for Master Page Navigation
 * Use this to test keyboard functionality
 */

console.log("🧪 Master Navigation Test Script Loaded");

// Test functions available in console
window.testMasterNavigation = function() {
    console.log("🔍 Testing Master Page Navigation...");
    
    const currentPage = detectCurrentPageTest();
    console.log(`📄 Current Page: ${currentPage}`);
    
    const formElements = document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([readonly]), select, textarea');
    console.log(`📝 Found ${formElements.length} form elements`);
    
    formElements.forEach((element, index) => {
        const isVisible = isElementVisible(element);
        const isEnabled = !element.disabled;
        const status = isVisible && isEnabled ? '✅' : '❌';
        
        console.log(`${index + 1}. ${element.id || element.name || 'unnamed'} (${element.type || element.tagName.toLowerCase()}) ${status}`);
    });
    
    // Test Alt+D
    const dateInputs = document.querySelectorAll('input[type="date"]');
    console.log(`📅 Found ${dateInputs.length} date inputs`);
    
    console.log("🎯 Test Complete. Try these keyboard shortcuts:");
    console.log("   • Enter - Navigate to next field or submit");
    console.log("   • Backspace (on empty field) - Go to previous field");
    console.log("   • Alt+D - Set today's date");
};

function detectCurrentPageTest() {
    const url = window.location.href.toLowerCase();
    
    if (url.includes('fromto')) return 'fromTo';
    if (url.includes('area-master')) return 'area-master';
    if (url.includes('vehicle-type-master')) return 'vehicle-type-master';
    if (url.includes('party-master')) return 'party-master';
    if (url.includes('vehicle-master')) return 'vehicle-master';
    
    return 'unknown';
}

function isElementVisible(element) {
    if (!element) return false;
    
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           element.offsetParent !== null;
}

// Test Alt+D manually
window.testAltD = function() {
    console.log("🧪 Testing Alt+D functionality...");
    
    const event = new KeyboardEvent('keydown', {
        key: 'd',
        altKey: true,
        bubbles: true,
        cancelable: true
    });
    
    document.dispatchEvent(event);
    console.log("Alt+D event dispatched");
};

// Test form submission
window.testSubmit = function() {
    console.log("🧪 Testing form submission...");
    
    if (typeof window.masterNavigation !== 'undefined') {
        const currentPage = detectCurrentPageTest();
        window.masterNavigation.submit(currentPage);
    } else {
        console.log("❌ Master navigation not available");
    }
};

// Add visual indicators to form elements
window.showNavigationOrder = function() {
    console.log("🎨 Adding visual navigation indicators...");
    
    // Remove existing indicators
    document.querySelectorAll('.nav-indicator').forEach(el => el.remove());
    
    const formElements = document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([readonly]), select, textarea');
    
    formElements.forEach((element, index) => {
        const indicator = document.createElement('div');
        indicator.className = 'nav-indicator';
        indicator.textContent = index + 1;
        indicator.style.cssText = `
            position: absolute;
            background: #007bff;
            color: white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            font-size: 12px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            margin-left: -30px;
            margin-top: 2px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        `;
        
        element.style.position = 'relative';
        element.parentNode.style.position = 'relative';
        element.parentNode.appendChild(indicator);
    });
    
    console.log(`✅ Added ${formElements.length} navigation indicators`);
};

// Auto-run test when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        console.log("🎯 Master Navigation Test Ready!");
        console.log("Available test functions:");
        console.log("• testMasterNavigation() - Complete test");
        console.log("• testAltD() - Test Alt+D");
        console.log("• testSubmit() - Test form submission");
        console.log("• showNavigationOrder() - Show navigation sequence");
    }, 1000);
});