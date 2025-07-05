/**
 * Master Pages Keyboard Navigation Functionality
 * Handles Enter, Backspace, and Alt+D functionality for all master pages
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("Master keyboard navigation loaded");
    
    // Initialize keyboard navigation for all master pages
    initializeMasterKeyboardNavigation();
});

function initializeMasterKeyboardNavigation() {
    // Get all form elements (inputs, selects, textareas) excluding checkboxes and radios
    const formElements = document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([readonly]), select, textarea');
    
    formElements.forEach((element, index) => {
        // Add Enter key navigation
        element.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleEnterKeyNavigation(element, formElements, index);
            }
            
            // Add Backspace navigation when field is empty
            if (event.key === 'Backspace' && 
                ((element.tagName.toLowerCase() === 'input' && element.value === '') || 
                 (element.tagName.toLowerCase() === 'select' && element.value === '') ||
                 (element.tagName.toLowerCase() === 'textarea' && element.value === ''))) {
                
                handleBackspaceNavigation(element, formElements, index);
            }
            
            // Add Alt+D functionality for date inputs
            if (event.altKey && event.key.toLowerCase() === 'd') {
                event.preventDefault();
                handleAltDDateFunction(element);
            }
        });
        
        // Add focus behavior for input fields
        if (element.tagName.toLowerCase() === 'input' && element.type !== 'date') {
            element.addEventListener('focus', function() {
                // Select all text when focusing on input
                setTimeout(() => {
                    this.select();
                }, 10);
            });
        }
    });
    
    // Setup form submission handlers
    setupFormSubmissionHandlers();
    
    // Setup global Alt+D functionality
    setupGlobalAltDFunctionality();
}

function handleEnterKeyNavigation(currentElement, allElements, currentIndex) {
    // Special handling for specific pages
    const currentPage = getCurrentPageType();
    
    switch(currentPage) {
        case 'fromTo':
            handleFromToEnterNavigation(currentElement);
            break;
        case 'area-master':
            handleAreaMasterEnterNavigation(currentElement);
            break;
        case 'vehicle-type-master':
            handleVehicleTypeMasterEnterNavigation(currentElement);
            break;
        case 'party-master':
            handlePartyMasterEnterNavigation(currentElement);
            break;
        case 'vehicle-master':
            handleVehicleMasterEnterNavigation(currentElement);
            break;
        default:
            // Generic navigation for other pages
            navigateToNextElement(allElements, currentIndex);
    }
}

function handleBackspaceNavigation(currentElement, allElements, currentIndex) {
    // Navigate to previous visible and enabled element
    let prevIndex = currentIndex - 1;
    while (prevIndex >= 0) {
        const prevElement = allElements[prevIndex];
        
        if (isElementVisible(prevElement) && !prevElement.disabled) {
            prevElement.focus();
            
            // Select text if it's an input
            if (prevElement.tagName.toLowerCase() === 'input') {
                setTimeout(() => {
                    prevElement.select();
                }, 10);
            }
            
            // Open dropdown if it's a select
            if (prevElement.tagName.toLowerCase() === 'select') {
                setTimeout(() => {
                    openDropdown(prevElement);
                }, 50);
            }
            
            break;
        }
        
        prevIndex--;
    }
}

function handleAltDDateFunction(element) {
    // If current element is a date input, set today's date
    if (element.type === 'date') {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        element.value = formattedDate;
        
        // Trigger change event
        element.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Show notification
        showDateSetNotification('Date set to today');
        return;
    }
    
    // Look for date inputs in the current form/page
    const dateInputs = document.querySelectorAll('input[type="date"]');
    
    if (dateInputs.length > 0) {
        // Focus on the first date input and set today's date
        const firstDateInput = dateInputs[0];
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        
        firstDateInput.value = formattedDate;
        firstDateInput.focus();
        
        // Trigger change event
        firstDateInput.dispatchEvent(new Event('change', { bubbles: true }));
        
        showDateSetNotification('Date set to today');
    }
}

// Page-specific Enter key handlers
function handleFromToEnterNavigation(element) {
    if (element.id === 'location') {
        // Submit the form
        const submitButton = document.querySelector('button[type="submit"], button[onclick*="addLocation"]');
        if (submitButton) {
            submitButton.click();
        }
    }
}

function handleAreaMasterEnterNavigation(element) {
    if (element.id === 'areaDate') {
        // Submit the form
        const addButton = document.getElementById('addAreaBtn');
        if (addButton) {
            addButton.click();
        }
    } else {
        // Navigate to next field
        const allElements = document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([readonly]), select, textarea');
        const currentIndex = Array.from(allElements).indexOf(element);
        navigateToNextElement(allElements, currentIndex);
    }
}

function handleVehicleTypeMasterEnterNavigation(element) {
    if (element.id === 'vehicleTypeName') {
        // Submit the form
        const submitButton = document.querySelector('button[onclick*="addVehicleType"], button[type="submit"]');
        if (submitButton) {
            submitButton.click();
        }
    }
}

function handlePartyMasterEnterNavigation(element) {
    if (element.id === 'address') {
        // Last field, submit the form
        const submitButton = document.querySelector('button[onclick*="addParty"], button[type="submit"]');
        if (submitButton) {
            submitButton.click();
        }
    } else {
        // Navigate to next field
        const allElements = document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([readonly]), select, textarea');
        const currentIndex = Array.from(allElements).indexOf(element);
        navigateToNextElement(allElements, currentIndex);
    }
}

function handleVehicleMasterEnterNavigation(element) {
    // Check if this is the last field in the form
    const allElements = document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([readonly]), select, textarea');
    const currentIndex = Array.from(allElements).indexOf(element);
    
    if (currentIndex === allElements.length - 1) {
        // Last field, submit the form
        const submitButton = document.querySelector('button[onclick*="addVehicle"], button[type="submit"]');
        if (submitButton) {
            submitButton.click();
        }
    } else {
        navigateToNextElement(allElements, currentIndex);
    }
}

function navigateToNextElement(elements, currentIndex) {
    // Look for the next visible and enabled element
    for (let i = currentIndex + 1; i < elements.length; i++) {
        const nextElement = elements[i];
        
        if (isElementVisible(nextElement) && !nextElement.disabled) {
            nextElement.focus();
            
            // Select text if it's an input
            if (nextElement.tagName.toLowerCase() === 'input') {
                setTimeout(() => {
                    nextElement.select();
                }, 10);
            }
            
            // Open dropdown if it's a select
            if (nextElement.tagName.toLowerCase() === 'select') {
                setTimeout(() => {
                    openDropdown(nextElement);
                }, 50);
            }
            
            return;
        }
    }
    
    // If we reach here, we're at the end - try to submit the form
    submitCurrentForm();
}

function setupFormSubmissionHandlers() {
    // Add Enter key submission for all forms
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                // Don't prevent default if we're in a textarea
                if (event.target.tagName.toLowerCase() === 'textarea') {
                    return;
                }
                
                // Check if we should submit
                const activeElement = document.activeElement;
                const formElements = form.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([readonly]), select, textarea');
                const lastElement = formElements[formElements.length - 1];
                
                if (activeElement === lastElement) {
                    event.preventDefault();
                    submitCurrentForm();
                }
            }
        });
    });
}

function setupGlobalAltDFunctionality() {
    // Global Alt+D listener for date functionality
    document.addEventListener('keydown', function(event) {
        if (event.altKey && event.key.toLowerCase() === 'd') {
            event.preventDefault();
            
            // Try to set date on focused element first
            const focusedElement = document.activeElement;
            if (focusedElement && focusedElement.type === 'date') {
                handleAltDDateFunction(focusedElement);
                return;
            }
            
            // Otherwise find the first date input
            const dateInputs = document.querySelectorAll('input[type="date"]');
            if (dateInputs.length > 0) {
                handleAltDDateFunction(dateInputs[0]);
            }
        }
    });
}

function submitCurrentForm() {
    const currentPage = getCurrentPageType();
    
    switch(currentPage) {
        case 'fromTo':
            const addLocationBtn = document.querySelector('button[onclick*="addLocation"], button[type="submit"]');
            if (addLocationBtn) addLocationBtn.click();
            break;
        case 'area-master':
            const addAreaBtn = document.getElementById('addAreaBtn');
            if (addAreaBtn) addAreaBtn.click();
            break;
        case 'vehicle-type-master':
            const addVehicleTypeBtn = document.querySelector('button[onclick*="addVehicleType"], button[type="submit"]');
            if (addVehicleTypeBtn) addVehicleTypeBtn.click();
            break;
        case 'party-master':
            const addPartyBtn = document.querySelector('button[onclick*="addParty"], button[type="submit"]');
            if (addPartyBtn) addPartyBtn.click();
            break;
        case 'vehicle-master':
            const addVehicleBtn = document.querySelector('button[onclick*="addVehicle"], button[type="submit"]');
            if (addVehicleBtn) addVehicleBtn.click();
            break;
        default:
            // Try to find and click any submit button
            const submitBtn = document.querySelector('button[type="submit"], input[type="submit"], button[onclick*="add"], button[onclick*="submit"]');
            if (submitBtn) submitBtn.click();
    }
}

function getCurrentPageType() {
    const url = window.location.href;
    
    if (url.includes('fromTo')) return 'fromTo';
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

function openDropdown(selectElement) {
    selectElement.focus();
    
    // Try multiple methods to open the dropdown
    selectElement.click();
    
    // Keyboard method
    const keydownEvent = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: 'ArrowDown',
        keyCode: 40
    });
    selectElement.dispatchEvent(keydownEvent);
    
    // Modern browsers method
    if (typeof selectElement.showPicker === 'function') {
        try {
            selectElement.showPicker();
        } catch (e) {
            console.log('showPicker not supported');
        }
    }
}

function showDateSetNotification(message) {
    // Create and show a temporary notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 10000;
        font-size: 14px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        transition: opacity 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 2 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 2000);
}

// Export functions for use in other scripts
window.masterKeyboardNavigation = {
    initialize: initializeMasterKeyboardNavigation,
    handleAltD: handleAltDDateFunction,
    submitForm: submitCurrentForm
};/**
 * Master Pages Keyboard Navigation Functionality
 * Handles Enter, Backspace, and Alt+D functionality for all master pages
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("Master keyboard navigation loaded");
    
    // Initialize keyboard navigation for all master pages
    initializeMasterKeyboardNavigation();
});

function initializeMasterKeyboardNavigation() {
    // Get all form elements (inputs, selects, textareas) excluding checkboxes and radios
    const formElements = document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([readonly]), select, textarea');
    
    formElements.forEach((element, index) => {
        // Add Enter key navigation
        element.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleEnterKeyNavigation(element, formElements, index);
            }
            
            // Add Backspace navigation when field is empty
            if (event.key === 'Backspace' && 
                ((element.tagName.toLowerCase() === 'input' && element.value === '') || 
                 (element.tagName.toLowerCase() === 'select' && element.value === '') ||
                 (element.tagName.toLowerCase() === 'textarea' && element.value === ''))) {
                
                handleBackspaceNavigation(element, formElements, index);
            }
            
            // Add Alt+D functionality for date inputs
            if (event.altKey && event.key.toLowerCase() === 'd') {
                event.preventDefault();
                handleAltDDateFunction(element);
            }
        });
        
        // Add focus behavior for input fields
        if (element.tagName.toLowerCase() === 'input' && element.type !== 'date') {
            element.addEventListener('focus', function() {
                // Select all text when focusing on input
                setTimeout(() => {
                    this.select();
                }, 10);
            });
        }
    });
    
    // Setup form submission handlers
    setupFormSubmissionHandlers();
    
    // Setup global Alt+D functionality
    setupGlobalAltDFunctionality();
}

function handleEnterKeyNavigation(currentElement, allElements, currentIndex) {
    // Special handling for specific pages
    const currentPage = getCurrentPageType();
    
    switch(currentPage) {
        case 'fromTo':
            handleFromToEnterNavigation(currentElement);
            break;
        case 'area-master':
            handleAreaMasterEnterNavigation(currentElement);
            break;
        case 'vehicle-type-master':
            handleVehicleTypeMasterEnterNavigation(currentElement);
            break;
        case 'party-master':
            handlePartyMasterEnterNavigation(currentElement);
            break;
        case 'vehicle-master':
            handleVehicleMasterEnterNavigation(currentElement);
            break;
        default:
            // Generic navigation for other pages
            navigateToNextElement(allElements, currentIndex);
    }
}

function handleBackspaceNavigation(currentElement, allElements, currentIndex) {
    // Navigate to previous visible and enabled element
    let prevIndex = currentIndex - 1;
    while (prevIndex >= 0) {
        const prevElement = allElements[prevIndex];
        
        if (isElementVisible(prevElement) && !prevElement.disabled) {
            prevElement.focus();
            
            // Select text if it's an input
            if (prevElement.tagName.toLowerCase() === 'input') {
                setTimeout(() => {
                    prevElement.select();
                }, 10);
            }
            
            // Open dropdown if it's a select
            if (prevElement.tagName.toLowerCase() === 'select') {
                setTimeout(() => {
                    openDropdown(prevElement);
                }, 50);
            }
            
            break;
        }
        
        prevIndex--;
    }
}

function handleAltDDateFunction(element) {
    // If current element is a date input, set today's date
    if (element.type === 'date') {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        element.value = formattedDate;
        
        // Trigger change event
        element.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Show notification
        showDateSetNotification('Date set to today');
        return;
    }
    
    // Look for date inputs in the current form/page
    const dateInputs = document.querySelectorAll('input[type="date"]');
    
    if (dateInputs.length > 0) {
        // Focus on the first date input and set today's date
        const firstDateInput = dateInputs[0];
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        
        firstDateInput.value = formattedDate;
        firstDateInput.focus();
        
        // Trigger change event
        firstDateInput.dispatchEvent(new Event('change', { bubbles: true }));
        
        showDateSetNotification('Date set to today');
    }
}

// Page-specific Enter key handlers
function handleFromToEnterNavigation(element) {
    if (element.id === 'location') {
        // Submit the form
        const submitButton = document.querySelector('button[type="submit"], button[onclick*="addLocation"]');
        if (submitButton) {
            submitButton.click();
        }
    }
}

function handleAreaMasterEnterNavigation(element) {
    if (element.id === 'areaDate') {
        // Submit the form
        const addButton = document.getElementById('addAreaBtn');
        if (addButton) {
            addButton.click();
        }
    } else {
        // Navigate to next field
        const allElements = document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([readonly]), select, textarea');
        const currentIndex = Array.from(allElements).indexOf(element);
        navigateToNextElement(allElements, currentIndex);
    }
}

function handleVehicleTypeMasterEnterNavigation(element) {
    if (element.id === 'vehicleTypeName') {
        // Submit the form
        const submitButton = document.querySelector('button[onclick*="addVehicleType"], button[type="submit"]');
        if (submitButton) {
            submitButton.click();
        }
    }
}

function handlePartyMasterEnterNavigation(element) {
    if (element.id === 'address') {
        // Last field, submit the form
        const submitButton = document.querySelector('button[onclick*="addParty"], button[type="submit"]');
        if (submitButton) {
            submitButton.click();
        }
    } else {
        // Navigate to next field
        const allElements = document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([readonly]), select, textarea');
        const currentIndex = Array.from(allElements).indexOf(element);
        navigateToNextElement(allElements, currentIndex);
    }
}

function handleVehicleMasterEnterNavigation(element) {
    // Check if this is the last field in the form
    const allElements = document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([readonly]), select, textarea');
    const currentIndex = Array.from(allElements).indexOf(element);
    
    if (currentIndex === allElements.length - 1) {
        // Last field, submit the form
        const submitButton = document.querySelector('button[onclick*="addVehicle"], button[type="submit"]');
        if (submitButton) {
            submitButton.click();
        }
    } else {
        navigateToNextElement(allElements, currentIndex);
    }
}

function navigateToNextElement(elements, currentIndex) {
    // Look for the next visible and enabled element
    for (let i = currentIndex + 1; i < elements.length; i++) {
        const nextElement = elements[i];
        
        if (isElementVisible(nextElement) && !nextElement.disabled) {
            nextElement.focus();
            
            // Select text if it's an input
            if (nextElement.tagName.toLowerCase() === 'input') {
                setTimeout(() => {
                    nextElement.select();
                }, 10);
            }
            
            // Open dropdown if it's a select
            if (nextElement.tagName.toLowerCase() === 'select') {
                setTimeout(() => {
                    openDropdown(nextElement);
                }, 50);
            }
            
            return;
        }
    }
    
    // If we reach here, we're at the end - try to submit the form
    submitCurrentForm();
}

function setupFormSubmissionHandlers() {
    // Add Enter key submission for all forms
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                // Don't prevent default if we're in a textarea
                if (event.target.tagName.toLowerCase() === 'textarea') {
                    return;
                }
                
                // Check if we should submit
                const activeElement = document.activeElement;
                const formElements = form.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([readonly]), select, textarea');
                const lastElement = formElements[formElements.length - 1];
                
                if (activeElement === lastElement) {
                    event.preventDefault();
                    submitCurrentForm();
                }
            }
        });
    });
}

function setupGlobalAltDFunctionality() {
    // Global Alt+D listener for date functionality
    document.addEventListener('keydown', function(event) {
        if (event.altKey && event.key.toLowerCase() === 'd') {
            event.preventDefault();
            
            // Try to set date on focused element first
            const focusedElement = document.activeElement;
            if (focusedElement && focusedElement.type === 'date') {
                handleAltDDateFunction(focusedElement);
                return;
            }
            
            // Otherwise find the first date input
            const dateInputs = document.querySelectorAll('input[type="date"]');
            if (dateInputs.length > 0) {
                handleAltDDateFunction(dateInputs[0]);
            }
        }
    });
}

function submitCurrentForm() {
    const currentPage = getCurrentPageType();
    
    switch(currentPage) {
        case 'fromTo':
            const addLocationBtn = document.querySelector('button[onclick*="addLocation"], button[type="submit"]');
            if (addLocationBtn) addLocationBtn.click();
            break;
        case 'area-master':
            const addAreaBtn = document.getElementById('addAreaBtn');
            if (addAreaBtn) addAreaBtn.click();
            break;
        case 'vehicle-type-master':
            const addVehicleTypeBtn = document.querySelector('button[onclick*="addVehicleType"], button[type="submit"]');
            if (addVehicleTypeBtn) addVehicleTypeBtn.click();
            break;
        case 'party-master':
            const addPartyBtn = document.querySelector('button[onclick*="addParty"], button[type="submit"]');
            if (addPartyBtn) addPartyBtn.click();
            break;
        case 'vehicle-master':
            const addVehicleBtn = document.querySelector('button[onclick*="addVehicle"], button[type="submit"]');
            if (addVehicleBtn) addVehicleBtn.click();
            break;
        default:
            // Try to find and click any submit button
            const submitBtn = document.querySelector('button[type="submit"], input[type="submit"], button[onclick*="add"], button[onclick*="submit"]');
            if (submitBtn) submitBtn.click();
    }
}

function getCurrentPageType() {
    const url = window.location.href;
    
    if (url.includes('fromTo')) return 'fromTo';
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

function openDropdown(selectElement) {
    selectElement.focus();
    
    // Try multiple methods to open the dropdown
    selectElement.click();
    
    // Keyboard method
    const keydownEvent = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: 'ArrowDown',
        keyCode: 40
    });
    selectElement.dispatchEvent(keydownEvent);
    
    // Modern browsers method
    if (typeof selectElement.showPicker === 'function') {
        try {
            selectElement.showPicker();
        } catch (e) {
            console.log('showPicker not supported');
        }
    }
}

function showDateSetNotification(message) {
    // Create and show a temporary notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 10000;
        font-size: 14px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        transition: opacity 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 2 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 2000);
}

// Export functions for use in other scripts
window.masterKeyboardNavigation = {
    initialize: initializeMasterKeyboardNavigation,
    handleAltD: handleAltDDateFunction,
    submitForm: submitCurrentForm
};