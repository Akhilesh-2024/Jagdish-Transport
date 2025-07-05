/**
 * Enhanced Form Navigation for Master Pages
 * Handles Enter, Backspace, and Alt+D functionality
 * Version: 3.0 - Complete Solution
 */

// Global flag to prevent multiple initializations
let masterNavigationInitialized = false;

document.addEventListener('DOMContentLoaded', function() {
    if (masterNavigationInitialized) {
        console.log("Master navigation already initialized");
        return;
    }
    
    console.log("🚀 Loading Enhanced Master Page Navigation...");
    
    // Add delay to ensure all scripts are loaded
    setTimeout(() => {
        initializeMasterNavigation();
        masterNavigationInitialized = true;
        console.log("✅ Master Page Navigation Ready!");
    }, 200);
});

function initializeMasterNavigation() {
    try {
        const currentPage = detectCurrentPage();
        console.log(`📄 Current page: ${currentPage}`);
        
        if (!isMasterPage(currentPage)) {
            console.log("ℹ️ Not a master page, skipping navigation setup");
            return;
        }
        
        // Setup comprehensive keyboard navigation
        setupKeyboardNavigation(currentPage);
        
        // Setup global Alt+D functionality
        setupGlobalAltD();
        
        // Setup form submission handlers
        setupFormSubmissionHandlers(currentPage);
        
        console.log(`🎉 Navigation setup complete for ${currentPage}`);
        
    } catch (error) {
        console.error("❌ Error initializing master navigation:", error);
    }
}

function detectCurrentPage() {
    const url = window.location.href.toLowerCase();
    
    if (url.includes('fromto')) return 'fromTo';
    if (url.includes('area-master')) return 'area-master';
    if (url.includes('vehicle-type-master')) return 'vehicle-type-master';
    if (url.includes('party-master')) return 'party-master';
    if (url.includes('vehicle-master')) return 'vehicle-master';
    
    return 'unknown';
}

function isMasterPage(pageType) {
    return ['fromTo', 'area-master', 'vehicle-type-master', 'party-master', 'vehicle-master'].includes(pageType);
}

function setupKeyboardNavigation(currentPage) {
    const formElements = document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([readonly]), select, textarea');
    console.log(`📝 Setting up navigation for ${formElements.length} elements`);
    
    formElements.forEach((element, index) => {
        // Add keyboard event handler
        element.addEventListener('keydown', function(event) {
            handleKeyboardInput(event, element, formElements, index, currentPage);
        });
        
        // Add focus handler
        element.addEventListener('focus', function() {
            handleElementFocus(element);
        });
    });
}

function handleKeyboardInput(event, element, formElements, index, currentPage) {
    const key = event.key;
    
    // Handle Enter key
    if (key === 'Enter') {
        event.preventDefault();
        console.log(`⌨️ Enter on: ${element.id || 'unnamed'}`);
        handleEnterKey(element, formElements, index, currentPage);
        return;
    }
    
    // Handle Backspace on empty fields
    if (key === 'Backspace' && isFieldEmpty(element)) {
        console.log(`⌨️ Backspace on empty field: ${element.id || 'unnamed'}`);
        handleBackspaceKey(element, formElements, index);
        return;
    }
    
    // Handle Alt+D
    if (event.altKey && key.toLowerCase() === 'd') {
        event.preventDefault();
        console.log(`⌨️ Alt+D pressed`);
        handleAltD(element);
        return;
    }
}

function handleEnterKey(element, formElements, index, currentPage) {
    const isLastElement = index === formElements.length - 1;
    
    // Check if this is a search field - if so, don't submit form
    if (isSearchField(element)) {
        console.log("🔍 Enter on search field - not submitting");
        return; // Don't submit or navigate, just let the search functionality handle it
    }
    
    // Check if this should trigger form submission
    if (shouldSubmitOnEnter(element, currentPage, isLastElement)) {
        console.log("🚀 Submitting form...");
        submitForm(currentPage);
    } else {
        console.log("➡️ Moving to next field...");
        moveToNextField(formElements, index);
    }
}

/**
 * Check if an element is a search field
 */
function isSearchField(element) {
    if (!element) return false;
    
    const elementId = element.id.toLowerCase();
    const placeholder = (element.placeholder || '').toLowerCase();
    
    // Check if it's a search field by ID or placeholder
    return elementId.includes('search') || 
           placeholder.includes('search') ||
           elementId.includes('searchinput');
}

function shouldSubmitOnEnter(element, currentPage, isLastElement) {
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

function handleBackspaceKey(element, formElements, index) {
    for (let i = index - 1; i >= 0; i--) {
        const prevElement = formElements[i];
        if (isElementUsable(prevElement)) {
            prevElement.focus();
            
            if (prevElement.tagName.toLowerCase() === 'input') {
                setTimeout(() => prevElement.select(), 10);
            }
            break;
        }
    }
}

function handleAltD(element) {
    try {
        let dateInput = null;
        
        // If current element is a date input
        if (element && element.type === 'date') {
            dateInput = element;
        } else {
            // Find first date input on page
            const dateInputs = document.querySelectorAll('input[type="date"]');
            if (dateInputs.length > 0) {
                dateInput = dateInputs[0];
            }
        }
        
        if (dateInput) {
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            dateInput.value = formattedDate;
            dateInput.focus();
            
            // Trigger change event
            dateInput.dispatchEvent(new Event('change', { bubbles: true }));
            
            showMessage(`📅 Date set to: ${formattedDate}`, 'success');
        } else {
            showMessage('❌ No date field found', 'error');
        }
    } catch (error) {
        console.error('Error in Alt+D handler:', error);
        showMessage('❌ Error setting date', 'error');
    }
}

function setupGlobalAltD() {
    document.addEventListener('keydown', function(event) {
        if (event.altKey && event.key.toLowerCase() === 'd') {
            event.preventDefault();
            handleAltD(document.activeElement);
        }
    });
}

function setupFormSubmissionHandlers(currentPage) {
    // Add submission handlers for forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            console.log(`📋 Form submitted for ${currentPage}`);
        });
    });
}

function moveToNextField(formElements, currentIndex) {
    for (let i = currentIndex + 1; i < formElements.length; i++) {
        const nextElement = formElements[i];
        if (isElementUsable(nextElement)) {
            nextElement.focus();
            
            if (nextElement.tagName.toLowerCase() === 'input') {
                setTimeout(() => nextElement.select(), 10);
            } else if (nextElement.tagName.toLowerCase() === 'select') {
                setTimeout(() => openDropdown(nextElement), 50);
            }
            return;
        }
    }
    
    // If no next element, submit form
    console.log("📝 Reached end of form, submitting...");
    submitForm(detectCurrentPage());
}

function submitForm(currentPage) {
    try {
        console.log(`🎯 Submitting ${currentPage} form`);
        
        // Try calling page-specific functions
        const functionMap = {
            'fromTo': 'addLocation',
            'area-master': 'addArea',
            'party-master': 'addParty',
            'vehicle-master': 'addVehicle',
            'vehicle-type-master': 'addVehicleType'
        };
        
        const functionName = functionMap[currentPage];
        if (functionName && typeof window[functionName] === 'function') {
            console.log(`🔧 Calling ${functionName}()`);
            window[functionName]();
            
            // Navigate to search after submission
            setTimeout(() => {
                navigateToSearchAfterSubmit(currentPage);
            }, 500);
            return;
        }
        
        // Try clicking submit buttons
        const buttonSelectors = [
            'button[type="submit"]',
            'input[type="submit"]',
            '#addAreaBtn',
            'button[onclick*="add"]'
        ];
        
        for (const selector of buttonSelectors) {
            const button = document.querySelector(selector);
            if (button && !button.disabled) {
                console.log(`🖱️ Clicking ${selector}`);
                button.click();
                
                // Navigate to search after submission
                setTimeout(() => {
                    navigateToSearchAfterSubmit(currentPage);
                }, 500);
                return;
            }
        }
        
        // Try form submission
        const form = document.querySelector('form');
        if (form) {
            console.log(`📤 Triggering form submission`);
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            
            // Navigate to search after submission
            setTimeout(() => {
                navigateToSearchAfterSubmit(currentPage);
            }, 500);
        }
        
    } catch (error) {
        console.error('Error submitting form:', error);
        showMessage('❌ Error submitting form', 'error');
    }
}

/**
 * Navigate to search bar after form submission
 */
function navigateToSearchAfterSubmit(currentPage) {
    try {
        console.log(`🔍 Looking for search field for ${currentPage}`);
        
        // Define search field selectors for each page
        const searchSelectors = {
            'fromTo': '#locationSearchInput',
            'area-master': '#areaSearchInput', 
            'party-master': '#partySearchInput',
            'vehicle-master': '#vehicleSearchInput',
            'vehicle-type-master': '#vehicleTypeSearchInput'
        };
        
        const searchSelector = searchSelectors[currentPage];
        if (searchSelector) {
            const searchField = document.querySelector(searchSelector);
            if (searchField) {
                console.log(`✅ Focusing on search field: ${searchSelector}`);
                searchField.focus();
                
                // Select all text in search field for easy clearing
                setTimeout(() => {
                    try {
                        searchField.select();
                    } catch (e) {
                        // Some browsers don't support select on certain inputs
                    }
                }, 100);
                
                return;
            }
        }
        
        // Fallback: Try to find any search input
        const fallbackSearchInputs = [
            'input[placeholder*="search" i]',
            'input[placeholder*="Search" i]',
            'input[id*="search" i]',
            'input[id*="Search" i]'
        ];
        
        for (const selector of fallbackSearchInputs) {
            const searchField = document.querySelector(selector);
            if (searchField) {
                console.log(`✅ Focusing on fallback search field: ${selector}`);
                searchField.focus();
                setTimeout(() => searchField.select(), 100);
                return;
            }
        }
        
        // If no search field, focus on first form field for next entry
        const firstFormField = document.querySelector('input:not([type="checkbox"]):not([type="radio"]):not([readonly]), select, textarea');
        if (firstFormField) {
            console.log(`✅ Focusing on first form field for next entry`);
            firstFormField.focus();
            setTimeout(() => {
                try {
                    if (firstFormField.tagName.toLowerCase() === 'input') {
                        firstFormField.select();
                    }
                } catch (e) {
                    // Ignore selection errors
                }
            }, 100);
        }
        
        // Form submitted successfully
        
    } catch (error) {
        console.error('Error navigating after submit:', error);
    }
}

function handleElementFocus(element) {
    if (element.tagName.toLowerCase() === 'input' && 
        element.type !== 'date' && 
        element.type !== 'checkbox' && 
        element.type !== 'radio' &&
        element.type !== 'file') {
        
        setTimeout(() => {
            try {
                element.select();
            } catch (e) {
                // Some elements can't be selected
            }
        }, 10);
    }
}

// Utility functions
function isFieldEmpty(element) {
    const value = element.value || '';
    return value.trim() === '';
}

function isElementUsable(element) {
    if (!element) return false;
    
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           !element.disabled &&
           element.offsetParent !== null;
}

function openDropdown(selectElement) {
    try {
        selectElement.focus();
        selectElement.click();
        
        if (typeof selectElement.showPicker === 'function') {
            selectElement.showPicker();
        }
        
        // Send arrow down key
        const event = new KeyboardEvent('keydown', {
            key: 'ArrowDown',
            keyCode: 40,
            bubbles: true
        });
        selectElement.dispatchEvent(event);
    } catch (error) {
        console.log('Could not open dropdown:', error);
    }
}

function showMessage(message, type = 'success') {
    // Remove existing message
    const existing = document.querySelector('.temp-message');
    if (existing) existing.remove();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'temp-message';
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#dc3545' : '#28a745'};
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        z-index: 10000;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
        max-width: 300px;
    `;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateX(100%)';
            setTimeout(() => messageDiv.remove(), 300);
        }
    }, 2500);
}

// Global access
window.masterNavigation = {
    submit: submitForm,
    altD: handleAltD,
    message: showMessage
};

console.log("🎯 Enhanced Master Navigation v3.0 Loaded");