/**
 * Test script to verify keyboard functionality in master pages
 */

console.log("Keyboard Test Script Loaded");

document.addEventListener('DOMContentLoaded', function() {
    // Wait a moment for other scripts to load
    setTimeout(() => {
        runKeyboardTests();
    }, 1000);
});

function runKeyboardTests() {
    console.log("🧪 Running Keyboard Functionality Tests...");
    
    // Test 1: Check if form elements are properly captured
    const formElements = document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([readonly]), select, textarea');
    console.log(`✅ Found ${formElements.length} form elements:`, Array.from(formElements).map(el => ({
        id: el.id,
        type: el.type || el.tagName.toLowerCase(),
        name: el.name
    })));
    
    // Test 2: Check if Enter key handlers are attached
    let enterHandlersCount = 0;
    formElements.forEach(element => {
        const listeners = getEventListeners(element);
        if (listeners && listeners.keydown) {
            enterHandlersCount++;
        }
    });
    console.log(`✅ Elements with keydown handlers: ${enterHandlersCount}`);
    
    // Test 3: Check current page detection
    const currentPage = getCurrentPageTypeTest();
    console.log(`✅ Current page detected as: ${currentPage}`);
    
    // Test 4: Check for submit buttons
    const submitButtons = document.querySelectorAll('button[type="submit"], button[onclick*="add"], input[type="submit"]');
    console.log(`✅ Found ${submitButtons.length} submit buttons:`, Array.from(submitButtons).map(btn => ({
        id: btn.id,
        onclick: btn.onclick ? btn.onclick.toString().substring(0, 50) + '...' : 'none',
        type: btn.type
    })));
    
    // Test 5: Check for date inputs
    const dateInputs = document.querySelectorAll('input[type="date"]');
    console.log(`✅ Found ${dateInputs.length} date inputs:`, Array.from(dateInputs).map(input => ({
        id: input.id,
        value: input.value
    })));
    
    // Test 6: Test Alt+D functionality
    testAltDFunctionality();
    
    // Test 7: Display navigation sequence
    displayNavigationSequence(formElements);
    
    console.log("🎉 Keyboard functionality tests completed!");
}

function getCurrentPageTypeTest() {
    const url = window.location.href;
    
    if (url.includes('fromTo')) return 'fromTo';
    if (url.includes('area-master')) return 'area-master';
    if (url.includes('vehicle-type-master')) return 'vehicle-type-master';
    if (url.includes('party-master')) return 'party-master';
    if (url.includes('vehicle-master')) return 'vehicle-master';
    
    return 'unknown';
}

function testAltDFunctionality() {
    console.log("🔍 Testing Alt+D functionality...");
    
    const dateInputs = document.querySelectorAll('input[type="date"]');
    if (dateInputs.length > 0) {
        const dateInput = dateInputs[0];
        
        // Simulate Alt+D
        const event = new KeyboardEvent('keydown', {
            key: 'd',
            altKey: true,
            bubbles: true,
            cancelable: true
        });
        
        const originalValue = dateInput.value;
        document.dispatchEvent(event);
        
        setTimeout(() => {
            const newValue = dateInput.value;
            if (newValue !== originalValue) {
                console.log(`✅ Alt+D test passed! Date changed from '${originalValue}' to '${newValue}'`);
            } else {
                console.log(`❌ Alt+D test failed! Date remained '${originalValue}'`);
            }
        }, 100);
    } else {
        console.log("ℹ️ No date inputs found to test Alt+D functionality");
    }
}

function displayNavigationSequence(formElements) {
    console.log("🗺️ Form Navigation Sequence:");
    
    formElements.forEach((element, index) => {
        const isVisible = isElementVisibleTest(element);
        const isEnabled = !element.disabled;
        
        console.log(`${index + 1}. ${element.id || element.name || 'unnamed'} (${element.type || element.tagName.toLowerCase()}) - ${isVisible && isEnabled ? '✅ Active' : '❌ Inactive'}`);
    });
}

function isElementVisibleTest(element) {
    if (!element) return false;
    
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           element.offsetParent !== null;
}

// Helper function to get event listeners (works in some browsers)
function getEventListeners(element) {
    try {
        return getEventListeners(element);
    } catch (e) {
        // Fallback for browsers that don't support getEventListeners
        return null;
    }
}

// Add visual indicators to form elements for testing
function addVisualIndicators() {
    const formElements = document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([readonly]), select, textarea');
    
    formElements.forEach((element, index) => {
        // Add a small indicator
        const indicator = document.createElement('span');
        indicator.textContent = `${index + 1}`;
        indicator.style.cssText = `
            position: absolute;
            background: #007bff;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            margin-left: -25px;
            margin-top: 2px;
        `;
        
        element.style.position = 'relative';
        element.parentNode.insertBefore(indicator, element);
    });
}

// Global function to manually test keyboard navigation
window.testKeyboardNavigation = function() {
    console.log("🔧 Manual keyboard navigation test initiated");
    addVisualIndicators();
    
    const formElements = document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([readonly]), select, textarea');
    if (formElements.length > 0) {
        formElements[0].focus();
        console.log("Focus set to first element. Use Tab or Enter to navigate.");
    }
};

// Global function to test Alt+D
window.testAltD = function() {
    const event = new KeyboardEvent('keydown', {
        key: 'd',
        altKey: true,
        bubbles: true,
        cancelable: true
    });
    
    document.dispatchEvent(event);
    console.log("Alt+D event dispatched");
};

console.log("💡 Available test functions:");
console.log("- testKeyboardNavigation() - Test navigation with visual indicators");
console.log("- testAltD() - Test Alt+D date functionality");