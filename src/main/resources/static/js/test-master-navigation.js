/**
 * Simple Test for Master Page Navigation
 */

console.log("🧪 Master Navigation Test Loaded");

// Test master page navigation
window.testMasterPageNavigation = function() {
    console.log("🔍 Testing Master Page Navigation...");
    
    const currentPage = detectCurrentPage();
    console.log(`📄 Current Page: ${currentPage}`);
    
    // Test form elements
    const formElements = document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([readonly]), select, textarea');
    console.log(`📝 Found ${formElements.length} form elements`);
    
    formElements.forEach((element, index) => {
        console.log(`${index + 1}. ${element.id || 'unnamed'} (${element.type || element.tagName.toLowerCase()})`);
    });
    
    // Test search input
    const searchInputs = document.querySelectorAll('input[id*="SearchInput"]');
    console.log(`🔍 Found ${searchInputs.length} search inputs`);
    searchInputs.forEach(input => {
        console.log(`   🔍 Search: ${input.id}`);
    });
    
    // Test submission function
    const functionMap = {
        'fromTo': 'addLocation',
        'area-master': 'addArea',
        'party-master': 'addParty',
        'vehicle-master': 'addVehicle',
        'vehicle-type-master': 'addVehicleType'
    };
    
    const functionName = functionMap[currentPage];
    if (functionName) {
        const functionExists = typeof window[functionName] === 'function';
        console.log(`🔧 ${functionName}(): ${functionExists ? '✅ Available' : '❌ Not found'}`);
    }
    
    console.log("✅ Test Complete!");
};

function detectCurrentPage() {
    const url = window.location.href.toLowerCase();
    
    if (url.includes('fromto')) return 'fromTo';
    if (url.includes('area-master')) return 'area-master';
    if (url.includes('vehicle-type-master')) return 'vehicle-type-master';
    if (url.includes('party-master')) return 'party-master';
    if (url.includes('vehicle-master')) return 'vehicle-master';
    
    return 'unknown';
}

// Test specific enter key behavior
window.testEnterKeyBehavior = function() {
    console.log("🧪 Testing Enter Key Behavior...");
    
    const currentPage = detectCurrentPage();
    const formElements = document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([readonly]), select, textarea');
    
    formElements.forEach((element, index) => {
        const isLastElement = index === formElements.length - 1;
        const isSearch = isSearchFieldTest(element);
        const shouldSubmit = shouldSubmitOnEnterTest(element, currentPage, isLastElement);
        
        let action = '➡️ NEXT FIELD';
        if (isSearch) {
            action = '🔍 SEARCH (NO SUBMIT)';
        } else if (shouldSubmit) {
            action = '🚀 SUBMIT';
        }
        
        console.log(`${element.id || 'unnamed'}: ${action}`);
    });
};

// Test search field detection
function isSearchFieldTest(element) {
    if (!element) return false;
    
    const elementId = element.id.toLowerCase();
    const placeholder = (element.placeholder || '').toLowerCase();
    
    return elementId.includes('search') || 
           placeholder.includes('search') ||
           elementId.includes('searchinput');
}

function shouldSubmitOnEnterTest(element, currentPage, isLastElement) {
    const elementId = element.id;
    
    switch(currentPage) {
        case 'fromTo':
            return elementId === 'location' || isLastElement;
        case 'area-master':
            return elementId === 'areaDate' || isLastElement;
        case 'party-master':
            return elementId === 'address' || isLastElement;
        case 'vehicle-type-master':
            return elementId === 'vehicleType' || isLastElement;
        case 'vehicle-master':
            return elementId === 'vehicleNumber' || isLastElement;
        default:
            return isLastElement;
    }
}

// Auto-run test when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        console.log("🎯 Master Navigation Test Ready!");
        console.log("Available commands:");
        console.log("• testMasterPageNavigation() - Test all features");
        console.log("• testEnterKeyBehavior() - Test Enter key logic");
    }, 1000);
});