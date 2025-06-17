
document.addEventListener('DOMContentLoaded', function() {
    initFormNavigation();
    setupTripVoucherNavigation();
     setupShiftKeyDropdownOpener();
});


function initFormNavigation() {
    const formElements = document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]), select');
        formElements.forEach((element, index) => {
        element.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                
            
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