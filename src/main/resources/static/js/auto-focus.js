/**
 * Auto-Focus Script
 * Automatically focuses on the primary input field when a page loads
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("🔍 Auto-Focus Script Loaded");
    
    // Wait a short moment to ensure all other scripts have initialized
    setTimeout(() => {
        applyAutoFocus();
    }, 300);
});

/**
 * Apply auto-focus based on the current page
 */
function applyAutoFocus() {
    const currentPage = detectCurrentPage();
    console.log(`📄 Setting auto-focus for: ${currentPage}`);
    
    switch(currentPage) {
        case 'fromTo':
            focusElement('#location');
            break;
        case 'party-master':
            focusElement('#companyName');
            break;
        case 'area-master':
            focusElement('#areaName');
            break;
        case 'vehicle-type-master':
            focusElement('#vehicleType');
            break;
        case 'vehicle-master':
            focusElement('#vehicleNumber');
            break;
        default:
            console.log("ℹ️ No auto-focus configured for this page");
    }
}

/**
 * Focus on an element and select its text if applicable
 * @param {string} selector - CSS selector for the element to focus
 */
function focusElement(selector) {
    try {
        const element = document.querySelector(selector);
        if (!element) {
            console.warn(`⚠️ Element not found: ${selector}`);
            return;
        }
        
        console.log(`🎯 Focusing on: ${selector}`);
        element.focus();
        
        // If it's an input field, select all text
        if (element.tagName.toLowerCase() === 'input' && 
            element.type !== 'checkbox' && 
            element.type !== 'radio') {
            element.select();
        }
        
        // If it's a select element, try to open the dropdown
        if (element.tagName.toLowerCase() === 'select' && typeof openDropdown === 'function') {
            setTimeout(() => {
                try {
                    openDropdown(element);
                } catch (e) {
                    console.warn("Could not open dropdown:", e);
                }
            }, 100);
        }
    } catch (error) {
        console.error("❌ Error focusing element:", error);
    }
}

/**
 * Detect the current page based on URL
 * @returns {string} Page identifier
 */
function detectCurrentPage() {
    const url = window.location.href.toLowerCase();
    
    if (url.includes('fromto')) return 'fromTo';
    if (url.includes('area-master')) return 'area-master';
    if (url.includes('vehicle-type-master')) return 'vehicle-type-master';
    if (url.includes('party-master')) return 'party-master';
    if (url.includes('vehicle-master')) return 'vehicle-master';
    
    return 'unknown';
}

/**
 * Open a dropdown select element (fallback implementation)
 * @param {Element} selectElement - The select element to open
 */
function openDropdown(selectElement) {
    // First focus the element
    selectElement.focus();
    
    // Try multiple methods to open the dropdown
    
    // Method 1: Click events
    selectElement.click();
    
    // Method 2: Mouse events sequence
    const mousedownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        view: window
    });
    selectElement.dispatchEvent(mousedownEvent);
    
    const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
    });
    selectElement.dispatchEvent(clickEvent);
    
    // Method 3: Keyboard events
    const keydownEvent = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: 'ArrowDown',
        keyCode: 40
    });
    selectElement.dispatchEvent(keydownEvent);
    
    // Method 4: Modern browsers API
    if (typeof selectElement.showPicker === 'function') {
        try {
            selectElement.showPicker();
        } catch (e) {
            console.log('showPicker not supported or failed', e);
        }
    }
}