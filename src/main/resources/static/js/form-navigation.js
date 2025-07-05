
// Global flag to prevent multiple initializations
let formNavigationInitialized = false;

document.addEventListener('DOMContentLoaded', function() {
    if (formNavigationInitialized) return;
    
    console.log("🚀 Form Navigation System Loading...");
    
    // Small delay to ensure DOM is fully ready
    setTimeout(() => {
        initFormNavigation();
        setupTripVoucherNavigation();
        setupShiftKeyDropdownOpener();
        setupMasterPagesKeyboardNavigation();
        formNavigationInitialized = true;
        
        console.log("✅ Form Navigation System Fully Loaded");
    }, 100);
});


function initFormNavigation() {
    const formElements = document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]), select');
        formElements.forEach((element, index) => {
        element.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                
                // Special case for Area Master page - if the current element is areaDate
                if (window.location.href.includes('area-master') && element.id === 'areaDate') {
                    // Find the submit button and click it
                    const addAreaBtn = document.getElementById('addAreaBtn');
                    if (addAreaBtn) {
                        setTimeout(() => {
                            addAreaBtn.click();
                        }, 100);
                        return;
                    }
                }
            
                const nextElement = findNextFormElement(formElements, index);
                
                if (nextElement) {
                 
                    nextElement.focus();
                        if (nextElement.tagName.toLowerCase() === 'select') {
                        setTimeout(() => {
                            openDropdown(nextElement);
                        }, 50);
                    }
                    
                    if (nextElement.tagName.toLowerCase() === 'input') {
                        nextElement.select();
                    }
                }
            }
            
            if (event.key === 'Backspace' && 
                ((element.tagName.toLowerCase() === 'input' && element.value === '') || 
                 (element.tagName.toLowerCase() === 'select' && element.value === ''))) {
                
                let prevIndex = index - 1;
                while (prevIndex >= 0) {
                    const prevElement = formElements[prevIndex];
                    
                    if (isElementVisible(prevElement) && !prevElement.disabled) {
                        // Focus on the previous element
                        prevElement.focus();
                        
                        // If it's an input, select all text
                        if (prevElement.tagName.toLowerCase() === 'input') {
                            prevElement.select();
                        }
                        
                        // If it's a select element, open the dropdown
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
        });
    });
}

/**
 * Setup Shift key listener to open dropdowns
 */
function setupShiftKeyDropdownOpener() {
    // Add global keydown event listener for Shift key
    document.addEventListener('keydown', function(event) {
        // Check if Shift key was pressed
        if (event.key === 'Shift') {
            // Get the currently focused element
            const activeElement = document.activeElement;
            
            // If it's a select element, open the dropdown
            if (activeElement && activeElement.tagName.toLowerCase() === 'select') {
                openDropdown(activeElement);
            }
        }
    });
}

/**
 * Set up custom navigation for Trip Voucher page
 */
function setupTripVoucherNavigation() {
    // Check if we're on the Trip Voucher page
    if (window.location.href.includes('tripVoucher')) {
        // Fix navigation from C/D/Wt to khoti to hamali to Extra to companyAmount
        const companyCDWT = document.getElementById('companyCDWT');
        const khoti = document.getElementById('khoti');
        const hamali = document.getElementById('hamali');
        const extra = document.getElementById('extra');
        const companyAmount = document.getElementById('companyAmount');
        const lorryAmount = document.getElementById('lorryAmount');
        const lorryAdvance = document.getElementById('lorryAdvance');
        const clearButton = document.getElementById('btn-clear');
        const addButton = document.getElementById('tip-btn-add');
        
        if (companyCDWT) {
            companyCDWT.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    // Navigate to khoti first
                    if (khoti) {
                        khoti.focus();
                    }
                }
            });
        }
        
        if (khoti) {
            khoti.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    // Navigate to hamali next
                    if (hamali) {
                        hamali.focus();
                    }
                }
            });
        }
        
        if (hamali) {
            hamali.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    // Navigate to extra next
                    if (extra) {
                        extra.focus();
                    }
                }
            });
        }
        
        if (extra) {
            extra.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    // Navigate to companyAmount next
                    if (companyAmount) {
                        companyAmount.focus();
                    }
                }
            });
        }
        
        if (companyAmount) {
            companyAmount.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    // Navigate to lorryFreight next
                    const lorryFreight = document.getElementById('lorryFreight');
                    if (lorryFreight) {
                        lorryFreight.focus();
                    }
                }
            });
        }
        
        // Add navigation from lorryAdvance to buttons
        if (lorryAdvance) {
            lorryAdvance.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    // Navigate to Clear button first
                    if (clearButton) {
                        clearButton.focus();
                    }
                }
            });
        }
        
        // Add navigation from Clear button to Add button
        if (clearButton) {
            clearButton.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    // Navigate to Add button
                    if (addButton) {
                        addButton.focus();
                    }
                }
            });
        }
    }
}

/**
 * Open a dropdown select element
 * @param {Element} selectElement - The select element to open
 */
function openDropdown(selectElement) {
    // First focus the element
    selectElement.focus();
    
    // Use multiple approaches to ensure the dropdown opens
    
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
    
    const mouseupEvent = new MouseEvent('mouseup', {
        bubbles: true,
        cancelable: true,
        view: window
    });
    selectElement.dispatchEvent(mouseupEvent);
    
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
    
    // Method 5: Simulate a direct click on the select element
    setTimeout(() => {
        selectElement.click();
    }, 50);
}

/**
 * Find the next focusable form element
 * @param {NodeList} elements - List of all form elements
 * @param {number} currentIndex - Current element index
 * @returns {Element|null} - Next form element or null if not found
 */
function findNextFormElement(elements, currentIndex) {
    // Special case handling for Trip Voucher page
    const currentElement = elements[currentIndex];
    
    // If we're on the Trip Voucher page
    if (window.location.href.includes('tripVoucher')) {
        // If current element is companyCDWT, go to extra
        if (currentElement && currentElement.id === 'companyCDWT') {
            // Find the extra field
            for (let i = 0; i < elements.length; i++) {
                if (elements[i].id === 'extra' && isElementVisible(elements[i]) && !elements[i].disabled) {
                    return elements[i];
                }
            }
        }
        
        // If current element is extra, go to lorryAmount
        if (currentElement && currentElement.id === 'extra') {
            // Find the lorryAmount field
            for (let i = 0; i < elements.length; i++) {
                if (elements[i].id === 'lorryAmount' && isElementVisible(elements[i]) && !elements[i].disabled) {
                    return elements[i];
                }
            }
        }
    }
    
    // Special case for Area Master page
    if (window.location.href.includes('area-master')) {
        // If current element is areaDate, submit the form
        if (currentElement && currentElement.id === 'areaDate') {
            // Find the submit button and click it
            const addAreaBtn = document.getElementById('addAreaBtn');
            if (addAreaBtn) {
                setTimeout(() => {
                    addAreaBtn.click();
                }, 100);
                return null;
            }
        }
    }
    
    // Look for the next visible and enabled element
    for (let i = currentIndex + 1; i < elements.length; i++) {
        const element = elements[i];
        
        // Check if element is visible and not disabled
        if (isElementVisible(element) && !element.disabled) {
            return element;
        }
    }
    
    // If we reach the end, return the first element (circular navigation)
    for (let i = 0; i < currentIndex; i++) {
        const element = elements[i];
        
        // Check if element is visible and not disabled
        if (isElementVisible(element) && !element.disabled) {
            return element;
        }
    }
    
    return null;
}

/**
 * Check if an element is visible in the DOM
 * @param {Element} element - DOM element to check
 * @returns {boolean} - True if element is visible
 */
/**
 * Set up master pages specific keyboard navigation
 */
function setupMasterPagesKeyboardNavigation() {
    // Check if we're on a master page
    const masterPages = ['fromTo', 'area-master', 'vehicle-type-master', 'party-master', 'vehicle-master'];
    const currentPage = masterPages.find(page => window.location.href.includes(page));
    
    if (!currentPage) return;
    
    console.log(`Setting up keyboard navigation for ${currentPage} page`);
    
    // Enhanced Enter key handling for master pages
    const formElements = document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([readonly]), select, textarea');
    
    formElements.forEach((element, index) => {
        // Remove existing keydown listeners to avoid conflicts
        element.removeEventListener('keydown', handleKeyDown);
        
        // Add new enhanced keydown listener
        element.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleMasterPageEnterKey(element, currentPage, formElements, index);
            }
            
            if (event.key === 'Backspace' && 
                ((element.tagName.toLowerCase() === 'input' && element.value === '') || 
                 (element.tagName.toLowerCase() === 'select' && element.value === '') ||
                 (element.tagName.toLowerCase() === 'textarea' && element.value === ''))) {
                
                handleMasterPageBackspaceKey(element, formElements, index);
            }
            
            // Alt+D for date functionality
            if (event.altKey && event.key.toLowerCase() === 'd') {
                event.preventDefault();
                handleAltDForDate(element);
            }
        });
        
        // Enhanced focus behavior
        if (element.tagName.toLowerCase() === 'input' && element.type !== 'date') {
            element.addEventListener('focus', function() {
                setTimeout(() => {
                    this.select();
                }, 10);
            });
        }
    });
}

/**
 * Handle Enter key for master pages
 */
function handleMasterPageEnterKey(element, currentPage, allElements, currentIndex) {
    const isLastElement = currentIndex === allElements.length - 1;
    
    // Page-specific logic
    switch(currentPage) {
        case 'fromTo':
            if (element.id === 'location' || isLastElement) {
                const form = element.closest('form');
                if (form) {
                    form.dispatchEvent(new Event('submit'));
                } else {
                    // Fallback to button click
                    const submitBtn = document.querySelector('button[type="submit"], button[onclick*="addLocation"]');
                    if (submitBtn) submitBtn.click();
                }
            } else {
                navigateToNextElement(allElements, currentIndex);
            }
            break;
            
        case 'area-master':
            if (element.id === 'areaDate' || isLastElement) {
                const addAreaBtn = document.getElementById('addAreaBtn');
                if (addAreaBtn) {
                    addAreaBtn.click();
                }
            } else {
                navigateToNextElement(allElements, currentIndex);
            }
            break;
            
        case 'vehicle-type-master':
            if (isLastElement) {
                const submitBtn = document.querySelector('button[onclick*="addVehicleType"], button[type="submit"]');
                if (submitBtn) submitBtn.click();
            } else {
                navigateToNextElement(allElements, currentIndex);
            }
            break;
            
        case 'party-master':
            if (element.id === 'address' || isLastElement) {
                const submitBtn = document.querySelector('button[onclick*="addParty"], button[type="submit"]');
                if (submitBtn) submitBtn.click();
            } else {
                navigateToNextElement(allElements, currentIndex);
            }
            break;
            
        case 'vehicle-master':
            if (isLastElement) {
                const submitBtn = document.querySelector('button[onclick*="addVehicle"], button[type="submit"]');
                if (submitBtn) submitBtn.click();
            } else {
                navigateToNextElement(allElements, currentIndex);
            }
            break;
            
        default:
            if (isLastElement) {
                // Try to submit the form
                const form = element.closest('form');
                if (form) {
                    form.dispatchEvent(new Event('submit'));
                }
            } else {
                navigateToNextElement(allElements, currentIndex);
            }
    }
}

/**
 * Handle Backspace key for master pages
 */
function handleMasterPageBackspaceKey(element, allElements, currentIndex) {
    let prevIndex = currentIndex - 1;
    while (prevIndex >= 0) {
        const prevElement = allElements[prevIndex];
        
        if (isElementVisible(prevElement) && !prevElement.disabled) {
            prevElement.focus();
            
            if (prevElement.tagName.toLowerCase() === 'input') {
                setTimeout(() => {
                    prevElement.select();
                }, 10);
            }
            
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

/**
 * Handle Alt+D for date inputs
 */
function handleAltDForDate(element) {
    try {
        // If current element is a date input, set today's date
        if (element.type === 'date') {
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            element.value = formattedDate;
            element.dispatchEvent(new Event('change', { bubbles: true }));
            showDateNotification('Date set to today');
            return;
        }
        
        // Look for date inputs in the current form/page
        const dateInputs = document.querySelectorAll('input[type="date"]');
        
        if (dateInputs.length > 0) {
            const firstDateInput = dateInputs[0];
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            
            firstDateInput.value = formattedDate;
            firstDateInput.focus();
            firstDateInput.dispatchEvent(new Event('change', { bubbles: true }));
            
            showDateNotification('Date set to today');
        }
    } catch (error) {
        console.error('Error in Alt+D date functionality:', error);
        showDateNotification('Error setting date', 'error');
    }
}

/**
 * Navigate to next element
 */
function navigateToNextElement(elements, currentIndex) {
    for (let i = currentIndex + 1; i < elements.length; i++) {
        const nextElement = elements[i];
        
        if (isElementVisible(nextElement) && !nextElement.disabled) {
            nextElement.focus();
            
            if (nextElement.tagName.toLowerCase() === 'input') {
                setTimeout(() => {
                    nextElement.select();
                }, 10);
            }
            
            if (nextElement.tagName.toLowerCase() === 'select') {
                setTimeout(() => {
                    openDropdown(nextElement);
                }, 50);
            }
            
            return;
        }
    }
}

/**
 * Show date notification
 */
function showDateNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#f44336' : '#4CAF50'};
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
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 2000);
}

/**
 * Set up master pages specific keyboard navigation
 */
function setupMasterPagesKeyboardNavigation() {
    // Check if we're on a master page
    const masterPages = ['fromTo', 'area-master', 'vehicle-type-master', 'party-master', 'vehicle-master'];
    const currentPage = masterPages.find(page => window.location.href.includes(page));
    
    if (!currentPage) return;
    
    console.log(`Setting up keyboard navigation for ${currentPage} page`);
    
    // Enhanced Enter key handling for master pages
    const formElements = document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([readonly]), select, textarea');
    
    formElements.forEach((element, index) => {
        // Remove existing keydown listeners to avoid conflicts
        element.removeEventListener('keydown', handleKeyDown);
        
        // Add new enhanced keydown listener
        element.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleMasterPageEnterKey(element, currentPage, formElements, index);
            }
            
            if (event.key === 'Backspace' && 
                ((element.tagName.toLowerCase() === 'input' && element.value === '') || 
                 (element.tagName.toLowerCase() === 'select' && element.value === '') ||
                 (element.tagName.toLowerCase() === 'textarea' && element.value === ''))) {
                
                handleMasterPageBackspaceKey(element, formElements, index);
            }
            
            // Alt+D for date functionality
            if (event.altKey && event.key.toLowerCase() === 'd') {
                event.preventDefault();
                handleAltDForDate(element);
            }
        });
        
        // Enhanced focus behavior
        if (element.tagName.toLowerCase() === 'input' && element.type !== 'date') {
            element.addEventListener('focus', function() {
                setTimeout(() => {
                    this.select();
                }, 10);
            });
        }
    });
}

/**
 * Handle Enter key for master pages
 */
function handleMasterPageEnterKey(element, currentPage, allElements, currentIndex) {
    const isLastElement = currentIndex === allElements.length - 1;
    
    // Page-specific logic
    switch(currentPage) {
        case 'fromTo':
            if (element.id === 'location' || isLastElement) {
                const form = element.closest('form');
                if (form) {
                    form.dispatchEvent(new Event('submit'));
                } else {
                    // Fallback to button click
                    const submitBtn = document.querySelector('button[type="submit"], button[onclick*="addLocation"]');
                    if (submitBtn) submitBtn.click();
                }
            } else {
                navigateToNextElement(allElements, currentIndex);
            }
            break;
            
        case 'area-master':
            if (element.id === 'areaDate' || isLastElement) {
                const addAreaBtn = document.getElementById('addAreaBtn');
                if (addAreaBtn) {
                    addAreaBtn.click();
                }
            } else {
                navigateToNextElement(allElements, currentIndex);
            }
            break;
            
        case 'vehicle-type-master':
            if (isLastElement) {
                const submitBtn = document.querySelector('button[onclick*="addVehicleType"], button[type="submit"]');
                if (submitBtn) submitBtn.click();
            } else {
                navigateToNextElement(allElements, currentIndex);
            }
            break;
            
        case 'party-master':
            if (element.id === 'address' || isLastElement) {
                const submitBtn = document.querySelector('button[onclick*="addParty"], button[type="submit"]');
                if (submitBtn) submitBtn.click();
            } else {
                navigateToNextElement(allElements, currentIndex);
            }
            break;
            
        case 'vehicle-master':
            if (isLastElement) {
                const submitBtn = document.querySelector('button[onclick*="addVehicle"], button[type="submit"]');
                if (submitBtn) submitBtn.click();
            } else {
                navigateToNextElement(allElements, currentIndex);
            }
            break;
            
        default:
            if (isLastElement) {
                // Try to submit the form
                const form = element.closest('form');
                if (form) {
                    form.dispatchEvent(new Event('submit'));
                }
            } else {
                navigateToNextElement(allElements, currentIndex);
            }
    }
}

/**
 * Handle Backspace key for master pages
 */
function handleMasterPageBackspaceKey(element, allElements, currentIndex) {
    let prevIndex = currentIndex - 1;
    while (prevIndex >= 0) {
        const prevElement = allElements[prevIndex];
        
        if (isElementVisible(prevElement) && !prevElement.disabled) {
            prevElement.focus();
            
            if (prevElement.tagName.toLowerCase() === 'input') {
                setTimeout(() => {
                    prevElement.select();
                }, 10);
            }
            
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

/**
 * Handle Alt+D for date inputs
 */
function handleAltDForDate(element) {
    try {
        // If current element is a date input, set today's date
        if (element.type === 'date') {
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            element.value = formattedDate;
            element.dispatchEvent(new Event('change', { bubbles: true }));
            showDateNotification('Date set to today');
            return;
        }
        
        // Look for date inputs in the current form/page
        const dateInputs = document.querySelectorAll('input[type="date"]');
        
        if (dateInputs.length > 0) {
            const firstDateInput = dateInputs[0];
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            
            firstDateInput.value = formattedDate;
            firstDateInput.focus();
            firstDateInput.dispatchEvent(new Event('change', { bubbles: true }));
            
            showDateNotification('Date set to today');
        }
    } catch (error) {
        console.error('Error in Alt+D date functionality:', error);
        showDateNotification('Error setting date', 'error');
    }
}

/**
 * Navigate to next element
 */
function navigateToNextElement(elements, currentIndex) {
    for (let i = currentIndex + 1; i < elements.length; i++) {
        const nextElement = elements[i];
        
        if (isElementVisible(nextElement) && !nextElement.disabled) {
            nextElement.focus();
            
            if (nextElement.tagName.toLowerCase() === 'input') {
                setTimeout(() => {
                    nextElement.select();
                }, 10);
            }
            
            if (nextElement.tagName.toLowerCase() === 'select') {
                setTimeout(() => {
                    openDropdown(nextElement);
                }, 50);
            }
            
            return;
        }
    }
}

/**
 * Show date notification
 */
function showDateNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#f44336' : '#4CAF50'};
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
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 2000);
}

function isElementVisible(element) {
    // Check if element exists
    if (!element) return false;
    
    // Get computed style
    const style = window.getComputedStyle(element);
    
    // Check if element is visible
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           element.offsetParent !== null;
}