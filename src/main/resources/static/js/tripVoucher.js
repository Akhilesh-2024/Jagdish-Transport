console.log('tripVoucher.js loaded');

// Global variables to track settings
let billSettings = {
  autoGenerate: false,
  prefix: "BILL",
  startNumber: 1000
};

// Store original freight rates
let originalRates = {
  companyRate: 0,
  lorryRate: 0
};

// Global flag to prevent double submission
let isSubmitting = false;

// Global variables for improved Alt+C functionality
let focusableElementsCache = null;
let lastFocusUpdate = 0;

// Function to close the sidebar
function closeSidebar() {
    // Check if jQuery is available
    if (typeof $ !== 'undefined') {
        // Add the sidebar_minimize class to the wrapper
        $('.wrapper').addClass('sidebar_minimize');
        
        // Hide the sidebar
        $('.sidebar').css({
            'display': 'none',
            'width': '0'
        });
        
        // Adjust the main panel to full width
        $('.main-panel').css({
            'width': '100%',
            'margin-left': '0'
        });
        
        // Update the toggle button if it exists
        const minibutton = $('.toggle-sidebar');
        if (minibutton.length) {
            minibutton.addClass('toggled');
            minibutton.html('<i class="gg-more-vertical-alt"></i>');
        }
        
        // Update mini_sidebar variable if it exists
        if (typeof mini_sidebar !== 'undefined') {
            mini_sidebar = 1;
        }
        
        // Update the toggle sidebar button text
        $('#toggleSidebarBtn').html('<i class="fas fa-bars"></i> Menu');
        
        // Adjust layout for sidebar
        adjustLayoutForSidebar();
        
        console.log('Sidebar closed automatically');
    } else {
        console.error('jQuery not available for sidebar manipulation');
    }
}

// Function to open the sidebar
function openSidebar() {
    // Check if jQuery is available
    if (typeof $ !== 'undefined') {
        // Remove the sidebar_minimize class from the wrapper
        $('.wrapper').removeClass('sidebar_minimize');
        
        // Make sure the sidebar is visible
        $('.sidebar').css({
            'display': 'block',
            'width': '250px'
        });
        
        // Adjust the main panel
        $('.main-panel').css({
            'width': 'calc(100% - 250px)',
            'margin-left': '250px'
        });
        
        // Update the toggle button if it exists
        const minibutton = $('.toggle-sidebar');
        if (minibutton.length) {
            minibutton.removeClass('toggled');
            minibutton.html('<i class="gg-menu-right"></i>');
        }
        
        // Update mini_sidebar variable if it exists
        if (typeof mini_sidebar !== 'undefined') {
            mini_sidebar = 0;
        }
        
        // Update the toggle sidebar button text
        $('#toggleSidebarBtn').html('<i class="fas fa-times"></i> Close Menu');
        
        // Adjust layout for sidebar
        adjustLayoutForSidebar();
        
        console.log('Sidebar opened');
    } else {
        console.error('jQuery not available for sidebar manipulation');
    }
}

// Function to toggle the sidebar
function toggleSidebar() {
    if ($('.wrapper').hasClass('sidebar_minimize')) {
        openSidebar();
    } else {
        closeSidebar();
    }
}

// Function to initialize sidebar state
function initSidebarState() {
    // Check if jQuery is available
    if (typeof $ !== 'undefined') {
        // Make sure the body has the trip-voucher-page class
        $('body').addClass('trip-voucher-page');
        
        // Make sure the wrapper has the sidebar_minimize class initially
        $('.wrapper').addClass('sidebar_minimize');
        
        // Set initial styles for the main panel
        $('.main-panel').css({
            'width': '100%',
            'margin-left': '0'
        });
        
        // Set initial styles for the sidebar
        $('.sidebar').css({
            'display': 'none',
            'width': '0'
        });
        
        // Set initial button text
        $('#toggleSidebarBtn').html('<i class="fas fa-bars"></i> Menu');
        
        // Adjust layout for sidebar
        adjustLayoutForSidebar();
        
        console.log('Sidebar state initialized');
    } else {
        console.error('jQuery not available for sidebar initialization');
    }
}

// Function to adjust layout based on sidebar state
function adjustLayoutForSidebar() {
    // Check if jQuery is available
    if (typeof $ !== 'undefined') {
        const windowWidth = $(window).width();
        
        // If sidebar is open
        if (!$('.wrapper').hasClass('sidebar_minimize')) {
            if (windowWidth < 992) {
                // On mobile/tablet, sidebar should overlay the content
                $('.sidebar').css({
                    'position': 'fixed',
                    'z-index': '1050',
                    'width': '250px',
                    'display': 'block'
                });
                
                $('.main-panel').css({
                    'width': '100%',
                    'margin-left': '0'
                });
                
                // Add overlay
                if ($('.sidebar-overlay').length === 0) {
                    $('body').append('<div class="sidebar-overlay"></div>');
                }
                $('.sidebar-overlay').css({
                    'position': 'fixed',
                    'top': '0',
                    'left': '0',
                    'width': '100%',
                    'height': '100%',
                    'background': 'rgba(0,0,0,0.5)',
                    'z-index': '1040',
                    'display': 'block'
                });
                
                // Add click handler to overlay to close sidebar
                $('.sidebar-overlay').off('click').on('click', function() {
                    closeSidebar();
                });
            } else {
                // On desktop, sidebar should push content
                $('.sidebar').css({
                    'position': 'fixed',
                    'z-index': '1000',
                    'width': '250px',
                    'display': 'block'
                });
                
                $('.main-panel').css({
                    'width': 'calc(100% - 250px)',
                    'margin-left': '250px'
                });
                
                // Remove overlay if it exists
                $('.sidebar-overlay').remove();
            }
        } else {
            // If sidebar is closed
            $('.main-panel').css({
                'width': '100%',
                'margin-left': '0'
            });
            
            // Remove overlay if it exists
            $('.sidebar-overlay').remove();
        }
    } else {
        console.error('jQuery not available for layout adjustment');
    }
}

// Improved Alt+C functionality
function getFocusableElements(forceRefresh = false) {
    // Cache focusable elements for better performance, refresh every 2 seconds or when forced
    const now = Date.now();
    if (!focusableElementsCache || (now - lastFocusUpdate) > 2000 || forceRefresh) {
        const focusableSelector = 'input:not([disabled]):not([type="hidden"]):not([readonly]), select:not([disabled]), textarea:not([disabled]):not([readonly]), button:not([disabled])';
        focusableElementsCache = Array.from(document.querySelectorAll(focusableSelector))
            .filter(el => {
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);
                
                // Skip elements that are not visible
                if (style.display === 'none' || 
                    style.visibility === 'hidden' || 
                    rect.width === 0 || 
                    rect.height === 0 ||
                    el.disabled ||
                    el.tabIndex === -1) {
                    return false;
                }
                
                // Skip elements inside autocomplete results (they're not part of the main form flow)
                if (el.closest('.autocomplete-results')) {
                    return false;
                }
                
                // Skip submit buttons that are not the main submit button
                if (el.type === 'submit' && !el.classList.contains('tip-btn-add')) {
                    return false;
                }
                
                return true;
            })
            .sort((a, b) => {
                // Custom sorting for form fields
                const getFieldOrder = (element) => {
                    const fieldOrder = [
                        'billNumber', 'tripDate', 'vehicleNo', 'vehicleType', 'paymentType',
                        'from', 'to', 'toBeBilled', 'areaName', 'waitingHrs', 'cdwt', 'trips',
                        'freight', 'companyWaiting', 'companyCDWT', 'khoti', 'hamali', 'extra',
                        'lorryFreight', 'lorryWaiting', 'lorryCDWT', 'lorryExtra', 'lorryAdvance',
                        'commissionPercentage', 'lorryAmount'
                    ];
                    const index = fieldOrder.indexOf(element.id);
                    return index === -1 ? 999 : index;
                };
                
                const aOrder = getFieldOrder(a);
                const bOrder = getFieldOrder(b);
                
                if (aOrder !== bOrder) {
                    return aOrder - bOrder;
                }
                
                // Fallback to DOM order
                return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
            });
        lastFocusUpdate = now;
        console.log('Focusable elements refreshed:', focusableElementsCache.length, 'elements');
        console.log('Field order:', focusableElementsCache.map(el => el.id || el.tagName));
    }
    return focusableElementsCache;
}

function saveCurrentFieldValue(element) {
    if (!element) return false;
    
    try {
        // Basic validation
        if (element.hasAttribute('required') && !element.value.trim()) {
            showFeedback('This field is required', 'warning');
            return false;
        }
        
        // Number validation
        if (element.type === 'number' && element.value && isNaN(element.value)) {
            showFeedback('Please enter a valid number', 'warning');
            return false;
        }
        
        // Email validation
        if (element.type === 'email' && element.value && !element.value.includes('@')) {
            showFeedback('Please enter a valid email', 'warning');
            return false;
        }
        
        // Trigger input event for real-time validation/calculation
        element.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Trigger change event for form handling
        element.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Handle specific field calculations
        if (element.classList.contains('last-field-in-section')) {
            if (element.id === 'extra' || element.id === 'serviceTax') {
                calculateTotalAmount();
            } else if (element.id === 'lorryExtra' || element.id === 'lorryAdvance') {
                calculateLorryAmount();
            }
        }
        
        console.log('Field value saved:', element.id, '=', element.value);
        return true;
    } catch (error) {
        console.error('Error saving field value:', error);
        return false;
    }
}

function closeAutocompleteDropdowns() {
    try {
        console.log('Closing autocomplete dropdowns...');
        
        // Close all autocomplete results
        const autocompleteResults = document.querySelectorAll('.autocomplete-results');
        autocompleteResults.forEach(results => {
            results.style.display = 'none';
            results.innerHTML = ''; // Clear the contents too
            console.log('Closed autocomplete result container');
        });
        
        // Close searchable dropdown results
        const searchableResults = document.querySelectorAll('.dropdown-results-container');
        searchableResults.forEach(results => {
            results.style.display = 'none';
            console.log('Closed searchable dropdown result container');
        });
        
        // Close any dropdown that might be showing results
        const dropdownContainers = document.querySelectorAll('[id*="Results"], [class*="results"], [class*="dropdown-menu"]');
        dropdownContainers.forEach(container => {
            if (container.style.display !== 'none') {
                container.style.display = 'none';
                console.log('Closed dropdown container:', container.id || container.className);
            }
        });
        
        console.log('Autocomplete dropdowns closed');
    } catch (error) {
        console.error('Error closing autocomplete dropdowns:', error);
    }
}

// Specific function to close vehicle type dropdown
function closeVehicleTypeDropdown() {
    try {
        // Close any vehicle type specific dropdowns
        const vehicleTypeField = document.getElementById('vehicleType');
        if (vehicleTypeField) {
            // If it's in a wrapper, find the results container
            const wrapper = vehicleTypeField.closest('.autocomplete-wrapper, .searchable-dropdown-wrapper');
            if (wrapper) {
                const resultsContainer = wrapper.querySelector('.autocomplete-results, .dropdown-results-container');
                if (resultsContainer) {
                    resultsContainer.style.display = 'none';
                    console.log('Closed vehicle type dropdown results');
                }
            }
            
            // Also look for results container as sibling
            const siblingResults = vehicleTypeField.parentElement.querySelector('.autocomplete-results, .dropdown-results-container');
            if (siblingResults) {
                siblingResults.style.display = 'none';
                console.log('Closed vehicle type sibling results');
            }
        }
    } catch (error) {
        console.error('Error closing vehicle type dropdown:', error);
    }
}

function closeAllDropdowns() {
    try {
        console.log('Closing all dropdowns...');
        
        // Close autocomplete dropdowns
        closeAutocompleteDropdowns();
        
        // Close vehicle type dropdown specifically
        closeVehicleTypeDropdown();
        
        // Close Bootstrap dropdowns
        const openDropdowns = document.querySelectorAll('.dropdown-menu.show');
        openDropdowns.forEach(dropdown => {
            dropdown.classList.remove('show');
            console.log('Closed Bootstrap dropdown');
        });
        
        // Close any dropdown results containers
        const dropdownResults = document.querySelectorAll('.dropdown-results-container');
        dropdownResults.forEach(container => {
            container.style.display = 'none';
            console.log('Closed dropdown results container');
        });
        
        // Close searchable dropdown wrappers
        const searchableDropdowns = document.querySelectorAll('.searchable-dropdown-wrapper.open');
        searchableDropdowns.forEach(wrapper => {
            wrapper.classList.remove('open');
            const resultsContainer = wrapper.querySelector('.dropdown-results-container');
            if (resultsContainer) {
                resultsContainer.style.display = 'none';
            }
            console.log('Closed searchable dropdown wrapper');
        });
        
        // Close native select dropdowns by blurring them
        const activeElement = document.activeElement;
        if (activeElement && activeElement.tagName === 'SELECT') {
            activeElement.blur();
            console.log('Blurred SELECT element');
        }
        
        // Close any custom dropdowns
        const customDropdowns = document.querySelectorAll('.custom-dropdown.open, .searchable-dropdown.open');
        customDropdowns.forEach(dropdown => {
            dropdown.classList.remove('open');
            console.log('Closed custom dropdown');
        });
        
        // Close any visible dropdown menus or containers
        const visibleDropdowns = document.querySelectorAll('.dropdown-menu, .dropdown-content, .dropdown-list');
        visibleDropdowns.forEach(dropdown => {
            if (dropdown.style.display !== 'none') {
                dropdown.style.display = 'none';
                console.log('Hid visible dropdown');
            }
        });
        
        // Force close any dropdown that might be showing
        const allDropdownContainers = document.querySelectorAll('[class*="dropdown"]:not([class*="dropdown-toggle"])');
        allDropdownContainers.forEach(container => {
            if (container.style.display === 'block' || container.classList.contains('show') || container.classList.contains('open')) {
                container.style.display = 'none';
                container.classList.remove('show', 'open');
                console.log('Force closed dropdown container:', container.className);
            }
        });
        
        console.log('All dropdowns closed');
    } catch (error) {
        console.error('Error closing dropdowns:', error);
    }
}

function focusNextElement(currentElement, forceRefresh = false) {
    const focusableElements = getFocusableElements(forceRefresh);
    const currentIndex = focusableElements.indexOf(currentElement);
    
    if (currentIndex === -1) {
        console.warn('Current element not found in focusable elements, refreshing cache...');
        // Try again with forced refresh
        const refreshedElements = getFocusableElements(true);
        const newIndex = refreshedElements.indexOf(currentElement);
        
        if (newIndex === -1) {
            console.error('Current element still not found after refresh');
            return false;
        }
        
        // Use the refreshed elements and new index
        return focusNextElementWithIndex(refreshedElements, newIndex);
    }
    
    return focusNextElementWithIndex(focusableElements, currentIndex);
}

function focusNextElementWithIndex(focusableElements, currentIndex) {
    // Close all dropdowns first to ensure clean state
    closeAllDropdowns();
    
    if (currentIndex >= focusableElements.length - 1) {
        console.log('Already at the last focusable element');
        // Optionally focus on the submit button or first element
        const submitButton = document.querySelector('.tip-btn-add, button[type="submit"]');
        if (submitButton && !submitButton.disabled && !focusableElements.includes(submitButton)) {
            // Close dropdowns before focusing on submit button too
            closeAllDropdowns();
            setTimeout(() => {
                submitButton.focus();
                console.log('Focused on submit button');
            }, 50);
            return true;
        }
        return false;
    }
    
    const nextElement = focusableElements[currentIndex + 1];
    
    try {
        // Small delay to ensure dropdowns are fully closed before focusing
        setTimeout(() => {
            try {
                nextElement.focus();
                
                // Auto-select text in input fields for easy replacement
                if (nextElement.tagName === 'INPUT' && 
                    ['text', 'number', 'email', 'tel', 'url'].includes(nextElement.type)) {
                    // Small delay to ensure focus is complete
                    setTimeout(() => {
                        try {
                            nextElement.select();
                        } catch (e) {
                            // Some fields might not support select(), ignore the error
                            console.log('Could not select text in field:', nextElement.id);
                        }
                    }, 50);
                }
                
                // Add visual feedback
                nextElement.style.transition = 'box-shadow 0.2s ease';
                nextElement.style.boxShadow = '0 0 5px rgba(23, 125, 255, 0.5)';
                setTimeout(() => {
                    nextElement.style.boxShadow = '';
                }, 1000);
                
                console.log('Focused on next element:', nextElement.id || nextElement.tagName);
            } catch (innerError) {
                console.error('Error in delayed focus:', innerError);
            }
        }, 100); // Increased delay to 100ms for better dropdown closing
        
        return true;
    } catch (error) {
        console.error('Error focusing next element:', error);
        return false;
    }
}

function handleAltCShortcut() {
    const activeElement = document.activeElement;
    
    if (!activeElement) {
        console.log('No active element found, focusing on first input');
        const focusableElements = getFocusableElements(true); // Force refresh
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
            showFeedback('Focused on first field', 'info');
        } else {
            showFeedback('No focusable elements found', 'warning');
        }
        return;
    }
    
    console.log('Processing Alt+C for element:', activeElement.id || activeElement.tagName);
    
    // Close any open autocomplete dropdowns first
    closeAutocompleteDropdowns();
    
    // For autocomplete fields, ensure the value is properly set
    if (activeElement.classList.contains('autocomplete-field')) {
        console.log('Handling autocomplete field:', activeElement.id, 'value:', activeElement.value);
        
        // Trigger input and change events to ensure autocomplete works properly
        activeElement.dispatchEvent(new Event('input', { bubbles: true }));
        activeElement.dispatchEvent(new Event('change', { bubbles: true }));
        
        // If the field has a value but no corresponding hidden ID field value, 
        // it might need to be selected from the autocomplete
        const hiddenField = document.getElementById(activeElement.id + '_id');
        if (hiddenField && activeElement.value && !hiddenField.value) {
            console.log('Field has value but no ID, might need autocomplete selection');
            showFeedback('Value saved, moving to next field', 'success');
        }
    }
    
    // Save current field value and trigger any necessary events
    const isValid = saveCurrentFieldValue(activeElement);
    
    if (!isValid) {
        // Don't move to next field if current field is invalid
        return;
    }
    
    // Provide immediate visual feedback
    showAltCFeedback(activeElement);
    
    // Close any other open dropdowns
    closeAllDropdowns();
    
    // Force refresh the focusable elements cache since DOM might have changed
    // (especially after adding new items to dropdowns)
    setTimeout(() => {
        // Move to next field with forced cache refresh
        const success = focusNextElement(activeElement, true);
        if (!success) {
            console.log('Could not focus next element, staying on current field');
            showFeedback('Already at last field', 'info');
        } else {
            showFeedback('Moved to next field', 'info');
        }
    }, 100); // Increased delay to ensure all DOM changes are complete
}

function showAltCFeedback(element) {
    // Create a temporary visual feedback element
    const feedback = document.createElement('div');
    feedback.className = 'altc-feedback';
    feedback.innerHTML = '✓ Saved';
    feedback.style.cssText = `
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        background: #28a745;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: bold;
        z-index: 1001;
        pointer-events: none;
        opacity: 0;
        transition: all 0.3s ease;
    `;
    
    // Position relative to the element
    if (element.parentElement.style.position !== 'relative' && element.parentElement.style.position !== 'absolute') {
        element.parentElement.style.position = 'relative';
    }
    
    element.parentElement.appendChild(feedback);
    
    // Animate in
    setTimeout(() => {
        feedback.style.opacity = '1';
        feedback.style.transform = 'translateX(-50%) translateY(-5px)';
    }, 10);
    
    // Remove after animation
    setTimeout(() => {
        feedback.style.opacity = '0';
        setTimeout(() => {
            if (feedback.parentElement) {
                feedback.remove();
            }
        }, 300);
    }, 1000);
}

// Function to verify Alt+C setup
function verifyAltCSetup() {
    console.log('=== Alt+C Setup Verification ===');
    
    const targetFields = ['vehicleNo', 'vehicleType', 'from', 'to', 'toBeBilled', 'areaName'];
    const autocompleteFields = document.querySelectorAll('.autocomplete-field');
    
    console.log('Total autocomplete fields found:', autocompleteFields.length);
    console.log('Target fields:', targetFields);
    
    targetFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            console.log(`✓ Field ${fieldId}: found, has autocomplete-field class: ${element.classList.contains('autocomplete-field')}`);
            
            // Check if dropdown configuration exists
            const dropdown = dropdowns.find(d => d.id === fieldId);
            if (dropdown) {
                console.log(`  - Dropdown config found: ${dropdown.masterName}`);
                console.log(`  - Create function: ${dropdown.createFunction ? 'defined' : 'missing'}`);
            } else {
                console.log(`  - Dropdown config: missing`);
            }
        } else {
            console.log(`✗ Field ${fieldId}: not found`);
        }
    });
    
    console.log('=== End Verification ===');
}

function showFeedback(message, type = 'info') {
    // Create a toast-like notification
    const toast = document.createElement('div');
    toast.className = `feedback-toast feedback-${type}`;
    toast.textContent = message;
    
    const bgColor = type === 'info' ? '#17a2b8' : type === 'warning' ? '#ffc107' : '#28a745';
    const textColor = type === 'warning' ? '#000' : '#fff';
    
    toast.style.cssText = `
        position: fixed;
        top: 50px;
        right: 20px;
        background: ${bgColor};
        color: ${textColor};
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
        z-index: 1050;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300);
    }, 2000);
}

// Dedicated handler for Alt+C keydown events
function handleAltCKeydown(e) {
    if (e.altKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Alt+C pressed on field:', this.id);
        
        // Show immediate feedback
        showFeedback(`Processing field: ${this.id}`, 'info');
        
        // Check if this field has a corresponding dropdown creation function
        const dropdown = dropdowns.find(d => d.id === this.id);
        if (dropdown && dropdown.createFunction && this.value.trim() === '') {
            // Only prompt for new entry if the field is empty
            console.log('Found create function for empty field:', this.id);
            showFeedback(`Creating new entry for ${this.id}`, 'info');
            dropdown.createFunction(this);
        } else if (dropdown && dropdown.createFunction && this.value.trim() !== '') {
            // Field has a value, ask user what they want to do
            const choice = confirm(`Field "${this.id}" has a value: "${this.value}"\n\nClick OK to create a new entry, or Cancel to save current value and move to next field.`);
            if (choice) {
                console.log('User chose to create new entry for:', this.id);
                dropdown.createFunction(this);
            } else {
                console.log('User chose to save current value and move to next field:', this.id);
                handleAltCShortcut();
            }
        } else {
            console.log('No create function found, using general handler for:', this.id);
            showFeedback(`Saving field value and moving to next field`, 'info');
            // If no specific creation function, use the general Alt+C handler
            handleAltCShortcut();
        }
    }
}

function initializeAltCEnhancements() {
    // Initialize Alt+C functionality for form elements
    const focusableElements = getFocusableElements();
    
    // Add special Alt+C handling for autocomplete fields
    const autocompleteFields = document.querySelectorAll('.autocomplete-field');
    console.log('Found autocomplete fields:', autocompleteFields.length);
    
    autocompleteFields.forEach(field => {
        console.log('Setting up Alt+C for field:', field.id);
        
        // Remove any existing event listeners to avoid duplicates
        field.removeEventListener('keydown', handleAltCKeydown);
        
        // Add the new event listener
        field.addEventListener('keydown', handleAltCKeydown);
    });
    
    // Add global Alt+C handler for all focusable elements as fallback
    document.addEventListener('keydown', function(e) {
        if (e.altKey && (e.key === 'c' || e.key === 'C')) {
            const activeElement = document.activeElement;
            
            // Check if the active element is one of our target fields
            const targetFields = ['vehicleNo', 'vehicleType', 'from', 'to', 'toBeBilled', 'areaName'];
            
            if (activeElement && targetFields.includes(activeElement.id)) {
                console.log('Global Alt+C handler triggered for:', activeElement.id);
                e.preventDefault();
                e.stopPropagation();
                
                // Check if this field has a corresponding dropdown creation function
                const dropdown = dropdowns.find(d => d.id === activeElement.id);
                if (dropdown && dropdown.createFunction) {
                    console.log('Alt+C pressed on field:', activeElement.id);
                    dropdown.createFunction(activeElement);
                } else {
                    // If no specific creation function, use the general Alt+C handler
                    handleAltCShortcut();
                }
            }
        }
    });
    
    focusableElements.forEach((element, index) => {
        // Add title attribute with shortcut hint
        const currentTitle = element.getAttribute('title') || '';
        const shortcutHint = 'Press Alt+C to save and move to next field';
        
        if (!currentTitle.includes('Alt+C')) {
            element.setAttribute('title', currentTitle ? `${currentTitle} | ${shortcutHint}` : shortcutHint);
        }
        
        // Add visual indicator on focus
        element.addEventListener('focus', function() {
            // Show a subtle indicator that Alt+C is available
            this.style.position = 'relative';
            
            // Remove any existing indicator
            const existingIndicator = this.parentElement.querySelector('.altc-indicator');
            if (existingIndicator) {
                existingIndicator.remove();
            }
            
            // Add new indicator
            const indicator = document.createElement('div');
            indicator.className = 'altc-indicator';
            indicator.innerHTML = 'Alt+C';
            indicator.style.cssText = `
                position: absolute;
                top: -20px;
                right: 0;
                background: rgba(23, 125, 255, 0.8);
                color: white;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 10px;
                font-weight: bold;
                z-index: 1000;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            // Position the indicator relative to the parent
            if (this.parentElement.style.position !== 'relative' && this.parentElement.style.position !== 'absolute') {
                this.parentElement.style.position = 'relative';
            }
            
            this.parentElement.appendChild(indicator);
            
            // Fade in the indicator
            setTimeout(() => {
                indicator.style.opacity = '1';
            }, 100);
        });
        
        element.addEventListener('blur', function() {
            // Remove the indicator when focus is lost
            setTimeout(() => {
                const indicator = this.parentElement.querySelector('.altc-indicator');
                if (indicator) {
                    indicator.style.opacity = '0';
                    setTimeout(() => {
                        if (indicator.parentElement) {
                            indicator.remove();
                        }
                    }, 300);
                }
            }, 100);
        });
    });
    
    // Keyboard shortcuts functionality is initialized
    
    console.log('Alt+C enhancements initialized for', focusableElements.length, 'elements');
}

// Keyboard shortcuts help functions removed as per user request

document.addEventListener('DOMContentLoaded', function () {
    setupFormHandlers();
    displayCurrentDate();
    setDefaultTripDate();
    loadEditVoucher();
    // Load settings
    loadBillSettings();
    
    // Initialize sidebar state
    initSidebarState();
    
    // Automatically close the sidebar when Trip Voucher page loads
    closeSidebar();
    
    // Initialize improved Alt+C functionality
    initializeAltCEnhancements();
    
    // Add debugging to verify Alt+C setup
    setTimeout(() => {
        verifyAltCSetup();
    }, 1000);
    
    // Add direct event listener for backspace on SR NO field
    const billNumberField = document.getElementById('billNumber');
    const tripDateField = document.getElementById('tripDate');
    
    // Make sure tripDate field is properly initialized
    if (tripDateField) {
        // Ensure the date field can receive focus
        tripDateField.tabIndex = 1;
        
        // Add a visible indicator when the date field is focused
        tripDateField.addEventListener('focus', function() {
            this.style.backgroundColor = 'rgba(23, 125, 255, 0.1)';
            this.style.borderBottom = '1px solid #177dff';
        });
        
        tripDateField.addEventListener('blur', function() {
            this.style.backgroundColor = 'transparent';
            this.style.borderBottom = 'none';
        });
        
        // Add Alt+D shortcut directly to the date field
        tripDateField.addEventListener('keydown', function(e) {
            if (e.altKey && e.key === 'd') {
                e.preventDefault();
                e.stopPropagation();
                
                // Try to open the date picker
                openDatePicker(this);
            }
        });
        
        // Make the date field clickable to open the picker
        tripDateField.addEventListener('click', function(e) {
            // Try to open the date picker on click
            openDatePicker(this);
        });
    }
    
    // Add global keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        console.log('Key pressed:', e.key, 'Alt key:', e.altKey, 'Ctrl key:', e.ctrlKey);
        
        // Handle Backspace key to close dropdowns
        if (e.key === 'Backspace') {
            // Check if there are any open dropdowns
            const openDropdowns = document.querySelectorAll('.dropdown-menu.show');
            if (openDropdowns.length > 0) {
                // Close all open dropdowns
                openDropdowns.forEach(dropdown => {
                    dropdown.classList.remove('show');
                });
                
                // If the active element is a SELECT, blur it to close native dropdown
                const activeElement = document.activeElement;
                if (activeElement && activeElement.tagName === 'SELECT') {
                    activeElement.blur();
                    
                    // Focus on the previous field if available
                    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
                    const allFocusable = Array.from(document.querySelectorAll(focusableElements))
                        .filter(el => !el.disabled && el.style.display !== 'none' && el.style.visibility !== 'hidden');
                    
                    const currentIndex = allFocusable.indexOf(activeElement);
                    if (currentIndex > 0) {
                        allFocusable[currentIndex - 1].focus();
                    }
                    
                    // Prevent default backspace behavior
                    e.preventDefault();
                }
            }
        }
        
        // Alt+D shortcut for date fields
        if (e.altKey && e.key === 'd') {
            e.preventDefault();
            
            // Directly focus on the tripDate field
            const tripDateField = document.getElementById('tripDate');
            
            if (tripDateField) {
                // Use our dedicated function to open the date picker
                if (openDatePicker(tripDateField)) {
                    // Set visual indicator
                    tripDateField.style.backgroundColor = 'rgba(23, 125, 255, 0.1)';
                    tripDateField.style.borderBottom = '1px solid #177dff';
                    
                    console.log('Alt+D pressed: Focused on tripDate field and opened date picker');
                } else {
                    console.error('Alt+D pressed but failed to open date picker');
                    showNotification('Could not open date picker', true);
                }
            } else {
                console.error('Alt+D pressed but tripDate field not found');
                showNotification('Date field not found', true);
            }
        }
        
        // Alt+C shortcut to save and move to next field
        if (e.altKey && (e.key === 'c' || e.key === 'C')) {
            console.log('ALT+C detected!');
            e.preventDefault();
            e.stopPropagation();
            
            handleAltCShortcut();
        }
        
        // Alt+H shortcut removed as per user request
    });
    
    if (billNumberField) {
        billNumberField.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && this.value === '') {
                e.preventDefault();
                console.log('Backspace pressed on empty billNumber field, moving to tripDate');
                if (tripDateField) {
                    // Force focus on the date field
                    setTimeout(() => {
                        tripDateField.focus();
                        // Simulate a click to open the date picker
                        tripDateField.click();
                        console.log('Focus and click triggered on tripDate field');
                    }, 50);
                }
            }
        });
    }
    
    
    const lorryAdvanceField = document.getElementById('lorryAdvance');
    const lorryAmountField = document.getElementById('lorryAmount');
    
    // Function to handle Enter key press on last fields
    const handleEnterKeyOnLastField = function(e) {
        if (e.key === 'Enter') {
            // Prevent submission if already in progress
            if (isSubmitting) {
                console.log('Form submission already in progress, ignoring Enter key');
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            
            // Get the payment type
            const paymentType = document.getElementById('paymentType') ? document.getElementById('paymentType').value : '';
            
            // For lorryAdvance, only submit if payment type is Cash or Advance
            if (this.id === 'lorryAdvance' && (paymentType === 'Cash' || paymentType === 'Advance')) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Enter pressed directly on lorryAdvance field with payment type ' + paymentType + ', submitting form');
                
                // Get the form and submit button
                const form = document.getElementById('tripForm');
                const submitBtn = document.querySelector('.tip-btn-add');
                
                if (submitBtn) {
                    // Click the submit button
                    submitBtn.click();
                } else if (form) {
                    // Fallback: dispatch submit event
                    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                }
            }
            
            // For lorryAmount, only submit if payment type is Credit
            if (this.id === 'lorryAmount' && paymentType === 'Credit') {
                e.preventDefault();
                e.stopPropagation();
                console.log('Enter pressed directly on lorryAmount field with payment type Credit, submitting form');
                
                // Get the form and submit button
                const form = document.getElementById('tripForm');
                const submitBtn = document.querySelector('.tip-btn-add');
                
                if (submitBtn) {
                    // Click the submit button
                    submitBtn.click();
                } else if (form) {
                    // Fallback: dispatch submit event
                    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                }
            }
        }
    };
    
    // Add event listeners to both fields
    if (lorryAdvanceField) {
        lorryAdvanceField.addEventListener('keydown', handleEnterKeyOnLastField);
    }
    
    if (lorryAmountField) {
        lorryAmountField.addEventListener('keydown', handleEnterKeyOnLastField);
    }
    
    // Set focus to the first input field in the form (SR. NO) instead of the date field
    // Increased timeout to ensure it happens after any other focus events
    setTimeout(() => {
        const billNumberField = document.getElementById('billNumber');
        if (billNumberField) {
            billNumberField.focus();
            console.log('Focus set to billNumber field');
            
            // Add a direct event listener for backspace key on the billNumber field
            billNumberField.addEventListener('keydown', function(e) {
                if (e.key === 'Backspace' && this.value === '') {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Backspace pressed on empty billNumber field (direct handler), moving to tripDate');
                    const tripDateField = document.getElementById('tripDate');
                    if (tripDateField) {
                        tripDateField.focus();
                        tripDateField.click();
                    }
                }
            });
        }
    }, 500);

    // Make Payment Type dropdown searchable
    setTimeout(() => {
        makeSimpleSearchableDropdown('paymentType');     // Payment Type
    }, 1000);
    
    // Add event listeners to all select elements to ensure they close properly
    const selectElements = document.querySelectorAll('select');
    selectElements.forEach(select => {
        // When a selection is made, blur the element to close the dropdown
        select.addEventListener('change', function() {
            // Small delay to allow the selection to register
            setTimeout(() => {
                this.blur();
                
                // Find the next focusable element
                const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
                const allFocusable = Array.from(document.querySelectorAll(focusableElements))
                    .filter(el => !el.disabled && el.style.display !== 'none' && el.style.visibility !== 'hidden');
                
                const currentIndex = allFocusable.indexOf(this);
                if (currentIndex >= 0 && currentIndex < allFocusable.length - 1) {
                    // Focus the next element
                    allFocusable[currentIndex + 1].focus();
                }
            }, 50);
        });
    });
    
    // Add event listeners for amount calculation (Service Tax removed)
    const amountInputs = document.querySelectorAll('#freight, #companyWaiting, #companyCDWT, #khoti, #hamali, #extra');
    amountInputs.forEach(input => {
        input.addEventListener('input', calculateTotalAmount);
    });
    
    // Add event listener for freight to recalculate commission for Cash payment
    const freightInput = document.getElementById('freight');
    if (freightInput) {
        freightInput.addEventListener('input', function() {
            const paymentType = document.getElementById('paymentType').value;
            if (paymentType === 'Cash') {
                calculateCommissionForCash();
            }
        });
    }
    
    // Add event listener for lorryFreight to handle manual changes
    const lorryFreightInput = document.getElementById('lorryFreight');
    if (lorryFreightInput) {
        lorryFreightInput.addEventListener('input', function() {
            // Mark this field as manually edited
            this.setAttribute('data-manual-edit', 'true');
            
            const paymentType = document.getElementById('paymentType').value;
            if (paymentType === 'Cash') {
                // Recalculate commission based on the manually entered freight
                calculateCommissionForCash();
            } else if (paymentType === 'Credit') {
                // Recalculate L.Amount for Credit payment type
                calculateTotalAmount();
            }
        });
        
        // Remove the manual edit flag when the form is reset
        document.getElementById('tripForm').addEventListener('reset', function() {
            lorryFreightInput.removeAttribute('data-manual-edit');
        });
    }
    
    // Add event listeners for other lorry amount fields to recalculate L.Amount for Credit payment type
    const lorryAmountInputs = document.querySelectorAll('#lorryWaiting, #lorryCDWT, #lorryExtra');
    lorryAmountInputs.forEach(input => {
        input.addEventListener('input', function() {
            const paymentType = document.getElementById('paymentType').value;
            if (paymentType === 'Credit') {
                calculateTotalAmount();
            }
        });
    });
    
    // Add event listener for commissionPercentage to recalculate commission when it changes
    const commissionPercentageInput = document.getElementById('commissionPercentage');
    if (commissionPercentageInput) {
        commissionPercentageInput.addEventListener('input', function() {
            const paymentType = document.getElementById('paymentType').value;
            if (paymentType === 'Cash') {
                calculateCommissionForCash();
            }
        });
    }
    
    // Add event listener for waiting hours and CD/WT inputs to fetch rates
    const waitingHoursInput = document.getElementById('waitingHrs');
    if (waitingHoursInput) {
        waitingHoursInput.addEventListener('input', fetchWaitingRates);
    }
    
    const cdwtHoursInput = document.getElementById('cdwt');
    if (cdwtHoursInput) {
        cdwtHoursInput.addEventListener('input', fetchCDWTRates);
    }
    
    // Add event listener for number of trips to update freight rates
    const tripsInput = document.getElementById('trips');
    if (tripsInput) {
        tripsInput.addEventListener('input', updateFreightBasedOnTrips);
    }
    
    // Setup Enter key navigation through form fields
    setupEnterKeyNavigation();
    
    // Setup Alt+C shortcut for creating new entries in dropdowns
    setupAltCShortcut();
    
    // Add window resize handler to ensure layout adjusts properly
    $(window).on('resize', function() {
        adjustLayoutForSidebar();
    });
    
    // Add direct click handler to the Add button
    const addButton = document.querySelector('.tip-btn-add');
    if (addButton) {
        // Make the Add button more prominent when focused
        addButton.style.transition = 'all 0.3s ease';
        
        // Ensure the button is properly styled
        addButton.style.cursor = 'pointer';
        
        // Add direct click handler
        addButton.addEventListener('click', function(e) {
            console.log('Add button clicked directly');
            e.preventDefault();
            
            // Submit the form
            const form = document.getElementById('tripForm');
            if (form) {
                console.log('Dispatching submit event on form');
                form.dispatchEvent(new Event('submit'));
            }
        });
    }
});

const apiBaseUrl = '/api/trip-vouchers';



// Function to get the next MR number from existing vouchers
async function getNextMrNumber() {
  try {
    // Fetch all trip vouchers to find the highest MR number
    const response = await fetch(`${apiBaseUrl}`);
    if (response.ok) {
      const vouchers = await response.json();
      
      // Extract MR numbers and find the highest one
      let highestMrNo = 0;
      vouchers.forEach(voucher => {
        if (voucher.mrNo) {
          // Convert string MR numbers to integers
          const mrNoInt = parseInt(voucher.mrNo, 10);
          if (!isNaN(mrNoInt) && mrNoInt > highestMrNo) {
            highestMrNo = mrNoInt;
          }
        }
      });
      
      // Increment the highest MR number by 1
      const nextMrNo = highestMrNo + 1;
      console.log('Next MR number calculated from vouchers:', nextMrNo);
      return nextMrNo.toString();
    } else {
      console.error('Failed to fetch vouchers for MR number calculation:', response.status);
      return '1'; // Default to 1 if fetch fails
    }
  } catch (error) {
    console.error('Error calculating next MR number:', error);
    return '1'; // Default to 1 if there's an error
  }
}


// Function to load bill settings
async function loadBillSettings() {
  try {
    const response = await fetch('/billSeries/settings');
    if (response.ok) {
      billSettings = await response.json();
      console.log('Bill settings loaded:', billSettings);
      setupBillField();
    } else {
      console.error('Failed to load bill settings:', response.status);
    }
  } catch (error) {
    console.error('Error loading bill settings:', error);
  }
}

// Function to get the next bill number
async function getNextBillNumber() {
  try {
    const response = await fetch('/billSeries/latest-number');
    if (response.ok) {
      const data = await response.json();
      return data.nextBillNumber;
    } else {
      console.error('Failed to load next bill number:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error loading next bill number:', error);
    return null;
  }
}

// Function to setup the bill field based on settings
async function setupBillField() {
  const billNumberField = document.getElementById('billNumber');
  if (!billNumberField) return;
  
  // If auto generate is enabled
  if (billSettings.autoGenerate) {
    const nextBillNumber = await getNextBillNumber();
    if (nextBillNumber) {
      billNumberField.value = nextBillNumber;
      billNumberField.readOnly = true;
      billNumberField.classList.add('readonly-input');
    } else {
      console.error('Failed to get next bill number');
    }
  } else {
    billNumberField.value = '';
    billNumberField.readOnly = false;
    billNumberField.classList.remove('readonly-input');
    billNumberField.placeholder = 'Enter Serial Number';
  }
}

// Function to increment bill number after successful form submission
async function incrementBillNumber() {
  if (billSettings.autoGenerate) {
    try {
      const response = await fetch('/billSeries/increment-bill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error('Failed to increment bill number:', response.status);
      } else {
        console.log('Bill number incremented successfully');
      }
    } catch (error) {
      console.error('Error incrementing bill number:', error);
    }
  }
}

// Function to decrement bill number after deletion
async function decrementBillNumber() {
  if (billSettings.autoGenerate) {
    try {
      const response = await fetch('/billSeries/decrement-bill', {
        method: 'POST'
      });
      if (!response.ok) {
        console.error('Failed to decrement bill number:', response.status);
      }
    } catch (error) {
      console.error('Error decrementing bill number:', error);
    }
  }
}

function setupFormHandlers() {
    const form = document.getElementById('tripForm');

    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Form submitted');
            
            // Prevent the default form submission which might cause a page redirect
            if (window.event) {
                window.event.returnValue = false;
            }
            
            // Save the voucher without redirecting
            await saveVoucher();
            
            // Return false to prevent any default behavior
            return false;
        });
        
        // Add reset handler
        form.addEventListener('reset', function() {
            // Show all fields in Lorry Amount section
            const lorryFields = ['lorryFreight', 'lorryWaiting', 'lorryCDWT', 'lorryAmount', 'lorryCommission', 'lorryExtra', 'lorryAdvance'];
            lorryFields.forEach(id => {
                const field = document.getElementById(id);
                if (field && field.parentElement) {
                    field.parentElement.style.display = '';
                }
            });
            
            // Reset all sections to default state
            const transactionSection = document.querySelector('.form-section:nth-child(1)');
            const companySection = document.querySelector('.form-section:nth-child(2)');
            const lorrySection = document.querySelector('.form-section:nth-child(3)');
            
            if (transactionSection) {
                transactionSection.style.opacity = '1';
                transactionSection.style.pointerEvents = 'auto';
            }
            
            if (companySection) {
                companySection.style.opacity = '1';
                companySection.style.pointerEvents = 'auto';
            }
            
            if (lorrySection) {
                lorrySection.style.opacity = '1';
                lorrySection.style.pointerEvents = 'auto';
            }
            
            // Enable all input fields
            document.querySelectorAll('input, select').forEach(el => {
                el.disabled = false;
                el.style.opacity = '1';
                el.style.backgroundColor = '';
            });
            
            // Reset original rates
            originalRates.companyRate = 0;
            originalRates.lorryRate = 0;
            
            // Reset payment type to default
            setTimeout(() => {
                updatePaymentFields();
            }, 100);
        });

        // We no longer need to update lorry amounts when company amounts change
        // Each field is set independently based on rates from the server

        const vehicleType = document.getElementById('vehicleType');
        if (vehicleType) {
            vehicleType.addEventListener('change', function() {
                console.log('Vehicle type changed to:', this.value);
                updateRates();
                // Add a small delay to ensure updateRates completes first
                setTimeout(() => {
                    fetchFreightRates(); // Fetch freight rates when vehicle type changes
                }, 100);
            });
        } else {
            console.error('Vehicle type element not found for event listener');
        }
        
        const areaName = document.getElementById('areaName');
        if (areaName) {
            areaName.addEventListener('change', function() {
                console.log('Area name changed to:', this.value);
                // Add a small delay to ensure any other operations complete first
                setTimeout(() => {
                    fetchFreightRates(); // Fetch freight rates when area name changes
                }, 100);
            });
        } else {
            console.error('Area name element not found for event listener');
        }
        
        const paymentType = document.getElementById('paymentType');
        if (paymentType) {
            paymentType.addEventListener('change', function() {
                updatePaymentFields();
                
                // If payment type is Cash, calculate commission
                if (this.value === 'Cash') {
                    calculateCommissionForCash();
                }
            });
        }
        
        // No need for change handlers for location dropdowns since we removed the "Other" option
    }
}

// Set default date to today for the trip date field
function setDefaultTripDate() {
    const tripDateField = document.getElementById('tripDate');
    if (tripDateField) {
        // Always set the date to today
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        tripDateField.value = `${year}-${month}-${day}`;
        
        // Set focus on the date field
        setTimeout(() => {
            tripDateField.focus();
            tripDateField.select(); // Select the text for easy editing
            
            // Ensure the date field is visible
            tripDateField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300); // Short delay to ensure the page is fully loaded
        
        // Add event listener to prevent automatic day change
        tripDateField.addEventListener('change', function(e) {
            // Store the user-selected date to prevent automatic changes
            tripDateField.setAttribute('data-user-selected', 'true');
        });
        
        // Add event listener to prevent automatic focus when clicked elsewhere
        document.addEventListener('click', function(e) {
            if (e.target !== tripDateField) {
                tripDateField.blur();
            }
        });
    }
}

function displayCurrentDate() {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = days[now.getDay()];
    
    // Format date as DD.MM.YYYY
    const day_num = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const formattedDate = `${day_num}.${month}.${year}`;

    const currentDayElement = document.getElementById('currentDay');
    const currentDateElement = document.getElementById('currentDate');
    
    if (currentDayElement) currentDayElement.textContent = day;
    
    // Make date editable
    if (currentDateElement) {
        // Check if it's already an input field
        if (currentDateElement.tagName.toLowerCase() !== 'input') {
            // Create an input element to replace the date span
            const dateInput = document.createElement('input');
            dateInput.type = 'text';
            dateInput.id = 'currentDate';
            dateInput.value = formattedDate;
            dateInput.style.border = '1px solid #ccc';
            dateInput.style.borderRadius = '4px';
            dateInput.style.padding = '2px 5px';
            dateInput.style.width = '100px';
            dateInput.style.textAlign = 'center';
            
            // Add event listener to validate date format
            dateInput.addEventListener('blur', function() {
                // Validate date format (DD.MM.YYYY)
                const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
                if (!dateRegex.test(this.value)) {
                    // Reset to current date if invalid
                    this.value = formattedDate;
                }
            });
            
            // Replace the span with the input
            if (currentDateElement.parentNode) {
                currentDateElement.parentNode.replaceChild(dateInput, currentDateElement);
            }
        } else {
            // If it's already an input, just update the value
            currentDateElement.value = formattedDate;
        }
    }
}

// Function to fetch freight rates based on vehicle type and area name
async function fetchFreightRates() {
    const vehicleTypeElement = document.getElementById('vehicleType');
    const areaNameElement = document.getElementById('areaName');
    
    if (!vehicleTypeElement || !areaNameElement) {
        console.error('Vehicle type or area name element not found');
        return;
    }
    
    const vehicleType = vehicleTypeElement.value;
    const areaName = areaNameElement.value;
    
    console.log(`fetchFreightRates called with vehicleType=${vehicleType}, areaName=${areaName}`);
    
    // Only proceed if both vehicle type and area name are selected
    if (!vehicleType || !areaName) {
        console.log('Vehicle type or area name not selected, skipping freight rate fetch');
        return;
    }
    
    try {
        console.log(`Fetching freight rates for vehicle type: ${vehicleType}, area name: ${areaName}`);
        showLoader();
        
        // Fetch rates from the freight rates API
        const apiUrl = `/freight-rates/fetch?vehicleType=${encodeURIComponent(vehicleType)}&areaName=${encodeURIComponent(areaName)}`;
        console.log('Fetching freight rates from API:', apiUrl);
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Server error: ${errorText}`);
            throw new Error(`Failed to fetch freight rates: ${response.statusText}`);
        }
        
        const rates = await response.json();
        
        // Check if the response is an error message
        if (typeof rates === 'string') {
            throw new Error(rates);
        }
        console.log('Fetched area rates:', rates);
        
        if (rates && rates.length > 0) {
            // Use the first matching rate (there should typically be only one)
            const rate = rates[0];
            
            // Store the original rates
            originalRates.companyRate = rate.companyRate || 0;
            originalRates.lorryRate = rate.lorryRate || 0;
            
            console.log(`Original rates stored: companyRate=${originalRates.companyRate}, lorryRate=${originalRates.lorryRate}`);
            
            // Get the number of trips
            const tripsField = document.getElementById('trips');
            const trips = tripsField ? parseInt(tripsField.value) || 1 : 1;
            
            console.log(`Number of trips: ${trips}`);
            
            // Update the freight fields with the fetched rates multiplied by number of trips
            const companyRateField = document.getElementById('freight');
            const lorryRateField = document.getElementById('lorryFreight');
            
            if (!companyRateField) {
                console.error('Company rate field (freight) not found');
            }
            
            if (!lorryRateField) {
                console.error('Lorry rate field (lorryFreight) not found');
            }
            
            if (companyRateField && rate.companyRate) {
                const newCompanyRate = (rate.companyRate * trips).toFixed(2);
                companyRateField.value = newCompanyRate;
                console.log(`Updated company freight rate: ${rate.companyRate} * ${trips} = ${newCompanyRate}`);
            }
            
            if (lorryRateField && rate.lorryRate) {
                const newLorryRate = (rate.lorryRate * trips).toFixed(2);
                lorryRateField.value = newLorryRate;
                console.log(`Updated lorry freight rate: ${rate.lorryRate} * ${trips} = ${newLorryRate}`);
            }
            
            // Recalculate total amounts
            calculateTotalAmount();
            
            console.log('Freight rates updated successfully');
            showNotification('Freight rates loaded successfully', false);
        } else {
            console.warn(`No freight rates found for vehicle type: ${vehicleType} and area name: ${areaName}`);
            showNotification(`No freight rates found for the selected vehicle type and area. Please add rates in the Area Master section.`, true);
        }
    } catch (error) {
        console.error('Error fetching freight rates:', error);
        showNotification(`Error fetching freight rates. Please make sure you have added rates for this vehicle type and area in the Area Master.`, true);
        
        // Don't clear the freight fields if there's an error - this might be causing the issue
        // Instead, just log that we're keeping the existing values
        const companyRateField = document.getElementById('freight');
        const lorryRateField = document.getElementById('lorryFreight');
        
        if (companyRateField) {
            console.log('Keeping existing company freight rate:', companyRateField.value);
        }
        
        if (lorryRateField) {
            console.log('Keeping existing lorry freight rate:', lorryRateField.value);
        }
    } finally {
        hideLoader();
    }
}

// Function to update freight rates based on number of trips
function updateFreightBasedOnTrips() {
    console.log('updateFreightBasedOnTrips called');
    
    // Get the number of trips
    const tripsField = document.getElementById('trips');
    if (!tripsField) {
        console.error('Trips field not found');
        return;
    }
    
    const trips = parseInt(tripsField.value) || 1;
    console.log(`Number of trips: ${trips}`);
    console.log(`Original rates: companyRate=${originalRates.companyRate}, lorryRate=${originalRates.lorryRate}`);
    
    // Update the freight fields with the original rates multiplied by number of trips
    const companyRateField = document.getElementById('freight');
    const lorryRateField = document.getElementById('lorryFreight');
    
    if (!companyRateField) {
        console.error('Company rate field (freight) not found');
    }
    
    if (!lorryRateField) {
        console.error('Lorry rate field (lorryFreight) not found');
    }
    
    if (companyRateField && originalRates.companyRate) {
        const newCompanyRate = (originalRates.companyRate * trips).toFixed(2);
        companyRateField.value = newCompanyRate;
        console.log(`Updated company freight rate: ${originalRates.companyRate} * ${trips} = ${newCompanyRate}`);
    } else {
        console.log('Skipping company rate update - missing field or original rate');
    }
    
    if (lorryRateField && originalRates.lorryRate && !lorryRateField.hasAttribute('data-manual-edit')) {
        const newLorryRate = (originalRates.lorryRate * trips).toFixed(2);
        lorryRateField.value = newLorryRate;
        console.log(`Updated lorry freight rate: ${originalRates.lorryRate} * ${trips} = ${newLorryRate}`);
    } else {
        console.log('Skipping lorry rate update - missing field, original rate, or manual edit');
        if (lorryRateField && lorryRateField.hasAttribute('data-manual-edit')) {
            console.log('Lorry rate field has been manually edited');
        }
    }
    
    // Recalculate total amounts
    calculateTotalAmount();
    
    // If payment type is Cash, recalculate commission
    const paymentType = document.getElementById('paymentType').value;
    if (paymentType === 'Cash') {
        calculateCommissionForCash();
    }
}

// Function to fetch waiting rates from Other Rate Master
async function fetchWaitingRates() {
    const waitingHours = parseFloat(document.getElementById('waitingHrs').value) || 0;
    const vehicleType = document.getElementById('vehicleType').value;
    
    if (waitingHours <= 0 || !vehicleType) {
        return;
    }
    
    try {
        console.log(`Fetching waiting rates for vehicle type: ${vehicleType}, category: waiting`);
        showLoader();
        
        // Fetch rates from the waiting rates API
        const response = await fetch(`/waiting-rates/fetch?type=${encodeURIComponent(vehicleType)}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Server error: ${errorText}`);
            throw new Error(`Failed to fetch waiting rates: ${response.statusText}`);
        }
        
        const rates = await response.json();
        
        if (rates && rates.length > 0) {
            // Use the first matching rate
            const rate = rates[0];
            
            // Calculate waiting charges based on hours
            // Try to use the new fields first, fall back to old fields if needed
            const companyRate = rate.companyRate || rate.waitingCompRate;
            const lorryRate = rate.lorryRate || rate.waitingLorryRate;
            
            console.log('Waiting rates from server:', rate);
            console.log('Company rate:', companyRate);
            console.log('Lorry rate:', lorryRate);
            
            const companyWaitingRate = companyRate * waitingHours;
            const lorryWaitingRate = lorryRate * waitingHours;
            
            // Update the waiting fields
            const companyWaitingField = document.getElementById('companyWaiting');
            const lorryWaitingField = document.getElementById('lorryWaiting');
            
            if (companyWaitingField) {
                companyWaitingField.value = companyWaitingRate.toFixed(2);
            }
            
            if (lorryWaitingField) {
                lorryWaitingField.value = lorryWaitingRate.toFixed(2);
            }
            
            // Recalculate total amounts
            calculateTotalAmount();
            
            console.log('Waiting rates updated successfully');
        } else {
            console.warn(`No waiting rates found for vehicle type: ${vehicleType}`);
            showNotification(`No waiting rates found for the selected vehicle type. Please add rates in the Other Rate Master.`, true);
        }
    } catch (error) {
        console.error('Error fetching waiting rates:', error);
        showNotification(`Error fetching waiting rates. Please make sure you have added rates for this vehicle type in the Other Rate Master.`, true);
    } finally {
        hideLoader();
    }
}

// Function to fetch CD/WT rates from Other Rate Master
async function fetchCDWTRates() {
    const cdwtHours = parseFloat(document.getElementById('cdwt').value) || 0;
    const vehicleType = document.getElementById('vehicleType').value;
    
    if (cdwtHours <= 0 || !vehicleType) {
        return;
    }
    
    try {
        console.log(`Fetching CD/WT rates for vehicle type: ${vehicleType}, category: cdwt`);
        showLoader();
        
        // Fetch rates from the CDWT rates API
        const response = await fetch(`/cdwt-rates/fetch?type=${encodeURIComponent(vehicleType)}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Server error: ${errorText}`);
            throw new Error(`Failed to fetch CD/WT rates: ${response.statusText}`);
        }
        
        const rates = await response.json();
        
        if (rates && rates.length > 0) {
            // Use the first matching rate
            const rate = rates[0];
            
            // Calculate CD/WT charges based on hours
            // Try to use the new fields first, fall back to old fields if needed
            const companyRate = rate.companyRate || rate.cdCompRate;
            const lorryRate = rate.lorryRate || rate.cdLorryRate;
            
            const companyCDWTRate = companyRate * cdwtHours;
            const lorryCDWTRate = lorryRate * cdwtHours;
            
            // Update the CD/WT fields
            const companyCDWTField = document.getElementById('companyCDWT');
            const lorryCDWTField = document.getElementById('lorryCDWT');
            
            if (companyCDWTField) {
                companyCDWTField.value = companyCDWTRate.toFixed(2);
            }
            
            if (lorryCDWTField) {
                lorryCDWTField.value = lorryCDWTRate.toFixed(2);
            }
            
            // Recalculate total amounts
            calculateTotalAmount();
            
            console.log('CD/WT rates updated successfully');
        } else {
            console.warn(`No CD/WT rates found for vehicle type: ${vehicleType}`);
            showNotification(`No CD/WT rates found for the selected vehicle type. Please add rates in the Other Rate Master.`, true);
        }
    } catch (error) {
        console.error('Error fetching CD/WT rates:', error);
        showNotification(`Error fetching CD/WT rates. Please make sure you have added rates for this vehicle type in the Other Rate Master.`, true);
    } finally {
        hideLoader();
    }
}

function calculateLorryAmounts() {
    // This function is now only used to recalculate total amounts
    // We no longer copy values from company to lorry fields
    // Each field is set independently based on rates from the server
    
    // Calculate total amount for both sections
    calculateTotalAmount();
    
    // If payment type is Cash, also calculate commission
    const paymentType = document.getElementById('paymentType').value;
    if (paymentType === 'Cash') {
        calculateCommissionForCash();
    }
}

// Function to calculate commission for Cash payment type
function calculateCommissionForCash() {
    const lorryFreightField = document.getElementById('lorryFreight');
    const lorryCommissionField = document.getElementById('lorryCommission');
    const lorryAmountField = document.getElementById('lorryAmount');
    const commissionPercentageField = document.getElementById('commissionPercentage');
    
    if (!lorryFreightField || !lorryCommissionField || !lorryAmountField || !commissionPercentageField) {
        return;
    }
    
    // Get the freight amount
    const freight = parseFloat(document.getElementById('freight').value) || 0;
    
    // For Cash payment type, set lorryFreight to match the company freight ONLY if it hasn't been manually edited
    if (!lorryFreightField.hasAttribute('data-manual-edit')) {
        lorryFreightField.value = freight.toFixed(2);
    }
    
    // Get the lorry freight value (which might be manually edited)
    const lorryFreight = parseFloat(lorryFreightField.value) || 0;
    
    // For Cash payment type, L.Amount should be the same as Lorry Freight
    lorryAmountField.value = lorryFreight.toFixed(2);
    
    // Get commission percentage (default 10%)
    const commissionPercentage = parseFloat(commissionPercentageField.value) || 10;
    
    // Calculate commission based on the percentage of lorry freight (which might be manually edited)
    const commissionRate = commissionPercentage / 100;
    const commission = lorryFreight * commissionRate;
    
    // Update the commission field
    lorryCommissionField.value = commission.toFixed(2);
    
    console.log(`Cash payment: Freight = ${freight}, L.Amount = ${freight}, Commission (${commissionPercentage}%) = ${commission}`);
}

function calculateTotalAmount() {
    // Get the payment type
    const paymentType = document.getElementById('paymentType').value;
    
    // Calculate total amount for Company Amount section
    const freight = parseFloat(document.getElementById('freight').value) || 0;
    const waiting = parseFloat(document.getElementById('companyWaiting').value) || 0;
    const cdwt = parseFloat(document.getElementById('companyCDWT').value) || 0;
    const khoti = parseFloat(document.getElementById('khoti').value) || 0;
    const hamali = parseFloat(document.getElementById('hamali').value) || 0;
    const extra = parseFloat(document.getElementById('extra').value) || 0;
    // Service Tax removed
    
    const totalAmount = freight + waiting + cdwt + khoti + hamali + extra;
    
    const totalAmountElement = document.getElementById('companyAmount');
    if (totalAmountElement) {
        totalAmountElement.value = totalAmount.toFixed(2);
    }
    
    // For Cash payment type, handle differently
    if (paymentType === 'Cash') {
        // For Cash, we update lorryFreight from freight (if it hasn't been manually changed)
        const lorryFreightElement = document.getElementById('lorryFreight');
        if (lorryFreightElement && !lorryFreightElement.hasAttribute('data-manual-edit')) {
            lorryFreightElement.value = freight.toFixed(2);
        }
        
        // Commission and Lorry Amount are calculated in calculateCommissionForCash
        calculateCommissionForCash();
        return;
    }
    
    // For Credit payment type, calculate L.Amount as the sum of Freight, Waiting, C/D/Wt, and Extra
    const lorryFreight = parseFloat(document.getElementById('lorryFreight').value) || 0;
    const lorryWaiting = parseFloat(document.getElementById('lorryWaiting').value) || 0;
    const lorryCDWT = parseFloat(document.getElementById('lorryCDWT').value) || 0;
    const lorryExtra = parseFloat(document.getElementById('lorryExtra').value) || 0;
    
    const lorryAmount = lorryFreight + lorryWaiting + lorryCDWT + lorryExtra;
    
    const lorryAmountElement = document.getElementById('lorryAmount');
    if (lorryAmountElement) {
        lorryAmountElement.value = lorryAmount.toFixed(2);
    }
    
    // For Credit payment type, we don't need to calculate commission
    if (paymentType === 'Credit') {
        return;
    }
    
    // For other payment types (like Advance), calculate commission as before
    const commission = totalAmount - lorryAmount;
    
    const lorryCommissionElement = document.getElementById('lorryCommission');
    if (lorryCommissionElement) {
        lorryCommissionElement.value = commission.toFixed(2);
    }
}

function getLocationValue(selectId) {
    const selectElement = document.getElementById(selectId);
    
    if (!selectElement) return '';
    
    // Check if other option is selected
    if (selectElement.value === 'other') {
        const otherInputId = selectId + 'Other';
        const otherInput = document.getElementById(otherInputId);
        return otherInput ? otherInput.value : '';
    }
    
    return selectElement.value;
}

function resetLorryAmounts() {
    const fields = ['lorryFreight', 'lorryWaiting', 'lorryCDWT', 'lorryExtra', 'lorryAdvance', 'lorryAmount', 'lorryCommission'];
    
    for (const field of fields) {
        const element = document.getElementById(field);
        if (element) element.value = '';
    }
}

async function collectFormData() {
    const submitBtn = document.querySelector('.tip-btn-add');
    const isEdit = submitBtn && submitBtn.dataset.editId;
    
    // Check if we're in edit mode from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlId = urlParams.get('id');
    const mode = urlParams.get('mode');
    
    // Use either the button's dataset ID or the URL ID if in edit mode
    const editId = isEdit || (mode === 'edit' ? urlId : null);
    
    console.log(`collectFormData: isEdit=${isEdit}, urlId=${urlId}, mode=${mode}, editId=${editId}`);

    // Get payment type to handle special cases
    const paymentType = document.getElementById('paymentType') ? document.getElementById('paymentType').value : '';

    // For Cash payment type, ensure commission and lorry amount are calculated correctly
    if (paymentType === 'Cash') {
        calculateCommissionForCash();
    }

    // Temporarily enable all disabled fields to get their values
    const disabledFields = document.querySelectorAll('input:disabled, select:disabled');
    disabledFields.forEach(field => {
        field.disabled = false;
    });

	let mrNo = '';
	   if (!editId) {
	       // For new records, get the next MR number
	       mrNo = await getNextMrNumber();
	       console.log(`New record, generated MR number: ${mrNo}`);
	   } else {
	       // For edit mode, retrieve the existing MR number from the current record
	       console.log(`Edit mode, fetching existing MR number for ID: ${editId}`);
	       try {
	           const response = await fetch(`${apiBaseUrl}/${editId}`);
	           if (response.ok) {
	               const voucher = await response.json();
	               mrNo = voucher.mrNo || '';
	               console.log(`Retrieved existing MR number: ${mrNo}`);
	           } else {
	               console.error(`Failed to fetch voucher with ID ${editId}: ${response.status}`);
	           }
	       } catch (error) {
	           console.error(`Error fetching voucher with ID ${editId}:`, error);
	       }
	   }
    
    // Collect all form data
    const formData = {
        id: editId || null,
        mrNo: mrNo, // Add MR number for new vouchers
        billNumber: document.getElementById('billNumber') ? document.getElementById('billNumber').value : '',
        vehicleNo: document.getElementById('vehicleNo') ? document.getElementById('vehicleNo').value.trim().toUpperCase() : '',
        vehicleType: document.getElementById('vehicleType') ? document.getElementById('vehicleType').value : '',
        paymentType: paymentType,
        fromLocation: getLocationValue('from'),
        toLocation: getLocationValue('to') || '', // Make toLocation optional with default empty string
        toBeBilled: document.getElementById('toBeBilled') ? document.getElementById('toBeBilled').value.trim() : '',
        areaName: document.getElementById('areaName') ? document.getElementById('areaName').value.trim() : '',
        waitingHrs: parseFloat(document.getElementById('waitingHrs') ? document.getElementById('waitingHrs').value : 0) || 0,
        cdwt: parseFloat(document.getElementById('cdwt') ? document.getElementById('cdwt').value : 0) || 0,
        trips: parseInt(document.getElementById('trips') ? document.getElementById('trips').value : 1) || 1,
        freight: parseFloat(document.getElementById('freight') ? document.getElementById('freight').value : 0) || 0,
        companyWaiting: parseFloat(document.getElementById('companyWaiting') ? document.getElementById('companyWaiting').value : 0) || 0,
        companyCDWT: parseFloat(document.getElementById('companyCDWT') ? document.getElementById('companyCDWT').value : 0) || 0,
        khoti: parseFloat(document.getElementById('khoti') ? document.getElementById('khoti').value : 0) || 0,
        hamali: parseFloat(document.getElementById('hamali') ? document.getElementById('hamali').value : 0) || 0,
        extra: parseFloat(document.getElementById('extra') ? document.getElementById('extra').value : 0) || 0,
        // Service Tax removed
        totalAmount: parseFloat(document.getElementById('companyAmount') ? document.getElementById('companyAmount').value : 0) || 0,
        lorryFreight: parseFloat(document.getElementById('lorryFreight') ? document.getElementById('lorryFreight').value : 0) || 0,
        lorryWaiting: parseFloat(document.getElementById('lorryWaiting') ? document.getElementById('lorryWaiting').value : 0) || 0,
        lorryCDWT: parseFloat(document.getElementById('lorryCDWT') ? document.getElementById('lorryCDWT').value : 0) || 0,
        lorryAmount: parseFloat(document.getElementById('lorryAmount') ? document.getElementById('lorryAmount').value : 0) || 0,
        commissionPercentage: parseFloat(document.getElementById('commissionPercentage') ? document.getElementById('commissionPercentage').value : 10) || 10,
        lorryCommission: parseFloat(document.getElementById('lorryCommission') ? document.getElementById('lorryCommission').value : 0) || 0,
        lorryExtra: parseFloat(document.getElementById('lorryExtra') ? document.getElementById('lorryExtra').value : 0) || 0,
        advance: parseFloat(document.getElementById('lorryAdvance') ? document.getElementById('lorryAdvance').value : 0) || 0
    };
    
    // Re-disable the fields
    disabledFields.forEach(field => {
        field.disabled = true;
    });
    
    console.log('Collected form data:', formData);
    return formData;
}

function validateFormData(data) {
    // Removed all validation - no fields are required
    return {
        isValid: true,
        errors: []
    };
}

async function saveVoucher() {
    // Prevent double submission
    if (isSubmitting) {
        console.log('Form submission already in progress, ignoring duplicate request');
        return;
    }
    
    isSubmitting = true;
    console.log('Starting form submission...');
    
    // Disable the submit button to provide visual feedback
    const submitBtn = document.querySelector('.tip-btn-add');
    let originalButtonText = '';
    if (submitBtn) {
        originalButtonText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
    }
    
    const formData = await collectFormData();
    const validation = validateFormData(formData);

    if (!validation.isValid) {
        showNotification(validation.errors.join('<br>'), true);
        isSubmitting = false;
        return;
    }

    try {
        showLoader();
        
        const isNewVoucher = !formData.id;
        
        // Log the data being sent
        console.log('Saving voucher with data:', formData);
        console.log('API URL:', apiBaseUrl);
        console.log('Method:', formData.id ? 'PUT' : 'POST');
        
        // Get the selected date from the form if available, otherwise use current date
        const selectedDate = document.getElementById('tripDate') ? 
            document.getElementById('tripDate').value : null;
            
        let timestamp;
        if (selectedDate) {
            // If a date is selected, use it with the current time
            const date = new Date(selectedDate);
            if (!isNaN(date.getTime())) {
                // Valid date - use it
                timestamp = date.toISOString();
            } else {
                // Invalid date - use current date/time
                timestamp = new Date().toISOString();
            }
        } else {
            // No date field or no date selected - use current date/time
            timestamp = new Date().toISOString();
        }
        
        const requestBody = JSON.stringify({
            ...formData,
            timestamp: timestamp
        });
        
        console.log('Request body:', requestBody);
        
        // Use the correct URL for PUT requests
        const url = formData.id ? `${apiBaseUrl}/${formData.id}` : apiBaseUrl;
        console.log('Request URL:', url);
        
        const response = await fetch(url, {
            method: formData.id ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: requestBody
        });

        console.log('Response status:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error response:', errorText);
            throw new Error(`Server error: ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        console.log('Response data:', result);
        
        // Only increment for new vouchers, not edits
        if (isNewVoucher) {
            console.log("Processing new voucher");
            
            if (billSettings.autoGenerate) {
                console.log("Incrementing bill number for new voucher");
                await incrementBillNumber();
            }
        }
        
        hideLoader();
        showNotification('Trip voucher saved successfully!');

        // If we're in edit mode, redirect back to the table page
        if (window.isEditMode) {
            console.log('Edit mode detected, redirecting back to table page');
            // Short delay to allow the notification to be seen
            setTimeout(() => {
                window.location.href = '/tripVoucherTable';
            }, 1000);
            return;
        }

        const form = document.getElementById('tripForm');
        if (form) form.reset();
        resetLorryAmounts();
        
        // Setup new bill number for the next entry if it's a new voucher
        if (isNewVoucher) {
            await setupBillField();
        }

        // Stay on the same page instead of redirecting
        console.log('Staying on the same page after form submission');
        
        // Explicitly prevent any redirection attempts
        if (window.event && window.event.preventDefault) {
            window.event.preventDefault();
        }
        
        // Focus back on the date field for the next entry
        setTimeout(() => {
            const tripDateField = document.getElementById('tripDate');
            if (tripDateField) {
                tripDateField.focus();
                tripDateField.select();
            }
            
            // Make sure we're still on the tripVoucher page
            if (window.location.pathname !== '/tripVoucher' && window.location.pathname !== '/tripVoucher/') {
                window.location.href = '/tripVoucher';
            }
        }, 500);

    } catch (error) {
        hideLoader();
        console.error('Save error:', error);
        showNotification('Failed to save voucher: ' + error.message, true);
    } finally {
        // Reset the submission flag and re-enable the button
        isSubmitting = false;
        const submitBtn = document.querySelector('.tip-btn-add');
        if (submitBtn) {
            submitBtn.disabled = false;
            // Restore original button text or set appropriate text based on edit mode
            const isEdit = submitBtn.dataset.editId;
            submitBtn.textContent = isEdit ? 'Update' : (originalButtonText || 'Add');
        }
        console.log('Form submission completed, flag reset');
    }
}

async function loadEditVoucher() {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    const id = urlParams.get('id');
    const mode = urlParams.get('mode');
    
    // Store the edit mode in a global variable to use when saving
    window.isEditMode = mode === 'edit';
    
    // Check if we have either an edit ID or a regular ID
    if (!editId && !id) return;
    
    // Use whichever ID is available
    const voucherId = editId || id;
    
    console.log(`Loading voucher for edit. ID: ${voucherId}, Mode: ${mode}, isEditMode: ${window.isEditMode}`);
    
    // If we're in edit mode, update the page title and button text
    if (window.isEditMode) {
        // Change the page title
        const pageTitle = document.querySelector('.form-section h2');
        if (pageTitle) {
            pageTitle.textContent = 'Edit Trip Voucher';
        }
        
        // Change the button text
        const addButton = document.querySelector('.tip-btn-add');
        if (addButton) {
            addButton.textContent = 'Update Voucher';
        }
    }

    try {
        showLoader();
        const response = await fetch(`${apiBaseUrl}/${voucherId}`);
        if (!response.ok) throw new Error('Could not fetch voucher');

        const voucher = await response.json();
        hideLoader();

        // Populate form fields (basic fields first)
        document.getElementById('vehicleNo').value = voucher.vehicleNo || '';
        document.getElementById('vehicleType').value = voucher.vehicleType || '';
        document.getElementById('paymentType').value = voucher.paymentType || '';
        document.getElementById('toBeBilled').value = voucher.toBeBilled || '';
        document.getElementById('areaName').value = voucher.areaName || '';
        document.getElementById('trips').value = voucher.trips || 1;
        document.getElementById('billNumber').value = voucher.billNumber || '';
        
        // Set the date field if timestamp exists
        if (voucher.timestamp) {
            const date = new Date(voucher.timestamp);
            if (!isNaN(date.getTime())) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                document.getElementById('tripDate').value = `${year}-${month}-${day}`;
            }
        }
        
        // Set waiting and CD/WT values first as they're needed for rate calculations
        document.getElementById('waitingHrs').value = voucher.waitingHrs || 0;
        document.getElementById('cdwt').value = voucher.cdwt || 0;
        
        // Handle location fields
        document.getElementById('from').value = voucher.fromLocation || '';
        document.getElementById('to').value = voucher.toLocation || '';
        
        // If the location doesn't exist in the dropdown, we'll need to add it
        if (voucher.fromLocation && document.getElementById('from').value !== voucher.fromLocation) {
            // Add the location to the dropdown
            const fromOption = document.createElement('option');
            fromOption.value = voucher.fromLocation;
            fromOption.textContent = voucher.fromLocation;
            document.getElementById('from').appendChild(fromOption);
            document.getElementById('from').value = voucher.fromLocation;
        }
        
        if (voucher.toLocation && document.getElementById('to').value !== voucher.toLocation) {
            // Add the location to the dropdown
            const toOption = document.createElement('option');
            toOption.value = voucher.toLocation;
            toOption.textContent = voucher.toLocation;
            document.getElementById('to').appendChild(toOption);
            document.getElementById('to').value = voucher.toLocation;
        }
        
        // Update rates based on vehicle type (will set waiting and CD/WT rates)
        await updateRates();
        
        // Now set the other amount fields that may not be updated by updateRates
        document.getElementById('freight').value = voucher.freight || 0;
        document.getElementById('khoti').value = voucher.khoti || 0;
        document.getElementById('hamali').value = voucher.hamali || 0;
        document.getElementById('extra').value = voucher.extra || 0;
        document.getElementById('serviceTax').value = voucher.serviceTax || 0;
        document.getElementById('companyAmount').value = voucher.totalAmount || 0;
        
        // Set lorry fields
        document.getElementById('lorryFreight').value = voucher.lorryFreight || 0;
        document.getElementById('lorryWaiting').value = voucher.lorryWaiting || 0;
        document.getElementById('lorryCDWT').value = voucher.lorryCDWT || 0;
        document.getElementById('lorryAmount').value = voucher.lorryAmount || 0;
        document.getElementById('lorryCommission').value = voucher.lorryCommission || 0;
        document.getElementById('lorryExtra').value = voucher.lorryExtra || 0;
        document.getElementById('lorryAdvance').value = voucher.advance || 0;
        
        // After populating fields, update payment fields access
        updatePaymentFields();
        
        // First, make all fields visible and enabled
        const allLorryFields = [
            'lorryFreight', 'lorryWaiting', 'lorryCDWT', 'lorryExtra', 
            'lorryAmount', 'commissionPercentage', 'lorryCommission', 'lorryAdvance'
        ];
        
        allLorryFields.forEach(id => {
            const field = document.getElementById(id);
            if (field) {
                field.disabled = false;
                if (field.parentElement) {
                    field.parentElement.style.display = '';
                }
                
                // Remove any required attributes first
                field.removeAttribute('required');
                
                // Remove any visual indicators of required fields
                if (field.parentElement && field.parentElement.querySelector('.required-indicator')) {
                    field.parentElement.querySelector('.required-indicator').remove();
                }
            }
        });
        
        // Then handle specific payment types exactly as in the trip voucher form
        if (voucher.paymentType === 'Cash') {
            // Set commission percentage if available, otherwise default to 10%
            const commissionPercentageField = document.getElementById('commissionPercentage');
            if (commissionPercentageField) {
                commissionPercentageField.value = voucher.commissionPercentage || 10;
            }
            
            // For Cash payment, show only these fields
            const visibleFields = ['lorryFreight', 'lorryAmount', 'commissionPercentage', 'lorryCommission'];
            const hiddenFields = ['lorryWaiting', 'lorryCDWT', 'lorryExtra', 'lorryAdvance'];
            
            // Required fields for Cash payment
            const requiredFields = ['lorryFreight', 'commissionPercentage'];
            
            // Show visible fields
            visibleFields.forEach(id => {
                const field = document.getElementById(id);
                if (field) {
                    field.disabled = false;
                    if (field.parentElement) {
                        field.parentElement.style.display = '';
                    }
                    
                    // Add required attribute to mandatory fields
                    if (requiredFields.includes(id)) {
                        field.setAttribute('required', 'required');
                        
                        // Add visual indicator for required fields
                        if (field.parentElement && !field.parentElement.querySelector('.required-indicator')) {
                            const indicator = document.createElement('span');
                            indicator.className = 'required-indicator';
                            indicator.textContent = ' *';
                            indicator.style.color = 'red';
                            indicator.style.fontWeight = 'bold';
                            
                            // Add the indicator after the label
                            const label = field.parentElement.querySelector('label');
                            if (label) {
                                label.appendChild(indicator);
                            }
                        }
                    }
                }
            });
            
            // Hide other fields
            hiddenFields.forEach(id => {
                const field = document.getElementById(id);
                if (field && field.parentElement) {
                    field.parentElement.style.display = 'none';
                }
            });
            
            // Disable company fields as requested
            const companyFields = [
                'freight', 'companyWaiting', 'companyCDWT', 'khoti', 
                'hamali', 'extra', 'companyAmount'
            ];
            
            companyFields.forEach(id => {
                const field = document.getElementById(id);
                if (field) {
                    // Make read-only but still visible
                    field.readOnly = true;
                    field.style.backgroundColor = '#f5f5f5';
                }
            });
            
        } else if (voucher.paymentType === 'Credit') {
            // For Credit payment type, show only specific fields in the correct order
            const visibleFields = ['lorryFreight', 'lorryWaiting', 'lorryCDWT', 'lorryExtra', 'lorryAmount'];
            const hiddenFields = ['commissionPercentage', 'lorryCommission', 'lorryAdvance'];
            
            // Required fields for Credit payment
            const requiredFields = ['lorryFreight'];
            
            // Show visible fields
            visibleFields.forEach(id => {
                const field = document.getElementById(id);
                if (field) {
                    field.disabled = false;
                    if (field.parentElement) {
                        field.parentElement.style.display = '';
                    }
                    
                    // Add required attribute to mandatory fields
                    if (requiredFields.includes(id)) {
                        field.setAttribute('required', 'required');
                        
                        // Add visual indicator for required fields
                        if (field.parentElement && !field.parentElement.querySelector('.required-indicator')) {
                            const indicator = document.createElement('span');
                            indicator.className = 'required-indicator';
                            indicator.textContent = ' *';
                            indicator.style.color = 'red';
                            indicator.style.fontWeight = 'bold';
                            
                            // Add the indicator after the label
                            const label = field.parentElement.querySelector('label');
                            if (label) {
                                label.appendChild(indicator);
                            }
                        }
                    }
                }
            });
            
            // Hide other fields
            hiddenFields.forEach(id => {
                const field = document.getElementById(id);
                if (field && field.parentElement) {
                    field.parentElement.style.display = 'none';
                }
            });
            
        } else if (voucher.paymentType === 'Advance') {
            // For Advance payment type, show all fields
            const visibleFields = [
                'lorryFreight', 'lorryWaiting', 'lorryCDWT', 'lorryExtra', 
                'lorryAmount', 'lorryCommission', 'lorryAdvance'
            ];
            const hiddenFields = ['commissionPercentage'];
            
            // Required fields for Advance payment
            const requiredFields = ['lorryFreight', 'lorryAdvance'];
            
            // Show visible fields
            visibleFields.forEach(id => {
                const field = document.getElementById(id);
                if (field) {
                    field.disabled = false;
                    if (field.parentElement) {
                        field.parentElement.style.display = '';
                    }
                    
                    // Add required attribute to mandatory fields
                    if (requiredFields.includes(id)) {
                        field.setAttribute('required', 'required');
                        
                        // Add visual indicator for required fields
                        if (field.parentElement && !field.parentElement.querySelector('.required-indicator')) {
                            const indicator = document.createElement('span');
                            indicator.className = 'required-indicator';
                            indicator.textContent = ' *';
                            indicator.style.color = 'red';
                            indicator.style.fontWeight = 'bold';
                            
                            // Add the indicator after the label
                            const label = field.parentElement.querySelector('label');
                            if (label) {
                                label.appendChild(indicator);
                            }
                        }
                    }
                }
            });
            
            // Hide other fields
            hiddenFields.forEach(id => {
                const field = document.getElementById(id);
                if (field && field.parentElement) {
                    field.parentElement.style.display = 'none';
                }
            });
        }
        
        // Add event listener to payment type to update fields when changed
        const paymentTypeField = document.getElementById('paymentType');
        if (paymentTypeField) {
            paymentTypeField.addEventListener('change', function() {
                updatePaymentFields();
                
                // Re-apply the required fields logic based on the new payment type
                const paymentType = this.value;
                
                // Clear all required attributes first
                allLorryFields.forEach(id => {
                    const field = document.getElementById(id);
                    if (field) {
                        field.removeAttribute('required');
                        
                        // Remove any visual indicators
                        if (field.parentElement && field.parentElement.querySelector('.required-indicator')) {
                            field.parentElement.querySelector('.required-indicator').remove();
                        }
                    }
                });
                
                // Set required fields based on payment type
                let requiredFields = [];
                
                if (paymentType === 'Cash') {
                    requiredFields = ['lorryFreight', 'commissionPercentage'];
                } else if (paymentType === 'Credit') {
                    requiredFields = ['lorryFreight'];
                } else if (paymentType === 'Advance') {
                    requiredFields = ['lorryFreight', 'lorryAdvance'];
                }
                
                // Add required attribute and visual indicators
                requiredFields.forEach(id => {
                    const field = document.getElementById(id);
                    if (field) {
                        field.setAttribute('required', 'required');
                        
                        // Add visual indicator
                        if (field.parentElement && !field.parentElement.querySelector('.required-indicator')) {
                            const indicator = document.createElement('span');
                            indicator.className = 'required-indicator';
                            indicator.textContent = ' *';
                            indicator.style.color = 'red';
                            indicator.style.fontWeight = 'bold';
                            
                            // Add the indicator after the label
                            const label = field.parentElement.querySelector('label');
                            if (label) {
                                label.appendChild(indicator);
                            }
                        }
                    }
                });
            });
        }
        
        // Update the header and submit button
        const headerElement = document.querySelector('.header h2');
        if (headerElement) headerElement.textContent = 'Edit Trip Voucher';
        
        const submitBtn = document.querySelector('.tip-btn-add');
        if (submitBtn) {
            submitBtn.textContent = 'Update';
            // Store the voucher ID in the button's dataset for reference during form submission
            submitBtn.dataset.editId = voucherId;
            console.log(`Set submit button dataset.editId to ${voucherId}`);
        }
    } catch (err) {
        hideLoader();
        console.error('Load error:', err);
        showNotification('Failed to load voucher: ' + err.message, true);
    }
}

// Function to open date picker for a given input field
function openDatePicker(dateField) {
    if (!dateField) return false;
    
    try {
        // Focus on the date field
        dateField.focus();
        
        // Try multiple approaches to open the date picker
        
        // 1. Try using showPicker() method (supported in modern browsers)
        if (typeof dateField.showPicker === 'function') {
            dateField.showPicker();
            console.log('Used showPicker() method');
            return true;
        }
        
        // 2. Fallback: simulate a mouse click
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        dateField.dispatchEvent(clickEvent);
        console.log('Used click event simulation');
        
        // 3. Additional fallback: try to trigger the browser's built-in date picker
        setTimeout(() => {
            // Some browsers need a second attempt
            dateField.focus();
            
            // Try to simulate keyboard interaction
            const spaceEvent = new KeyboardEvent('keydown', {
                bubbles: true,
                cancelable: true,
                key: ' ',
                keyCode: 32
            });
            dateField.dispatchEvent(spaceEvent);
            console.log('Used space key simulation');
        }, 100);
        
        return true;
    } catch (error) {
        console.error('Error opening date picker:', error);
        return false;
    }
}

function updatePaymentFields() {
    const paymentType = document.getElementById('paymentType').value;
    const inputs = {};
    
    // Get all input fields
    document.querySelectorAll('input, select').forEach(el => {
        inputs[el.id] = el;
    });
    
    // First disable all lorry payment fields
    const lorryPaymentFields = ['lorryFreight', 'lorryWaiting', 'lorryCDWT', 'lorryAmount', 
                               'lorryCommission', 'lorryExtra', 'lorryAdvance'];
    
    // Company fields
    const companyFields = ['companyAmount', 'serviceTax', 'freight', 'companyWaiting', 'companyCDWT', 'khoti', 'extra', 'hamali'];
    
    // Transaction Details fields
    const transactionFields = ['billNumber', 'vehicleNo', 'vehicleType', 'from', 'to', 'toBeBilled', 'areaName', 'waitingHrs', 'cdwt', 'trips'];
    
    // Reset all fields to default state
    // Enable all company fields by default
    companyFields.forEach(id => {
        if (inputs[id]) {
            inputs[id].disabled = false;
            inputs[id].style.opacity = '1';
            inputs[id].style.backgroundColor = '';
        }
    });
    
    // Enable all transaction fields by default
    transactionFields.forEach(id => {
        if (inputs[id]) {
            inputs[id].disabled = false;
            inputs[id].style.opacity = '1';
            inputs[id].style.backgroundColor = '';
        }
    });
    
    // Disable all lorry fields first
    lorryPaymentFields.forEach(id => {
        if (inputs[id]) {
            inputs[id].disabled = true;
            inputs[id].style.opacity = '0.5';
            inputs[id].style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
        }
    });
    
    // Hide the commission percentage field by default (only show for Cash payment)
    if (inputs['commissionPercentage'] && inputs['commissionPercentage'].parentElement) {
        inputs['commissionPercentage'].parentElement.style.display = 'none';
    }
    
    // Get the form sections
    const transactionSection = document.querySelector('.form-section:nth-child(1)');
    const companySection = document.querySelector('.form-section:nth-child(2)');
    const lorrySection = document.querySelector('.form-section:nth-child(3)');
    
    // Then enable specific fields based on payment type
    switch(paymentType) {
        case 'Credit':
            // Enable only specific fields for Credit in the correct order
            ['lorryFreight', 'lorryWaiting', 'lorryCDWT', 'lorryExtra', 'lorryAmount'].forEach(id => {
                if (inputs[id]) {
                    inputs[id].disabled = false;
                    inputs[id].style.opacity = '1';
                    inputs[id].style.backgroundColor = '';
                    if (inputs[id].parentElement) {
                        inputs[id].parentElement.style.display = '';
                    }
                    
                    // Add required attribute to mandatory fields
                    if (id === 'lorryFreight') {
                        inputs[id].setAttribute('required', 'required');
                        
                        // Add visual indicator for required fields
                        if (inputs[id].parentElement && !inputs[id].parentElement.querySelector('.required-indicator')) {
                            const indicator = document.createElement('span');
                            indicator.className = 'required-indicator';
                            indicator.textContent = ' *';
                            indicator.style.color = 'red';
                            indicator.style.fontWeight = 'bold';
                            
                            // Add the indicator after the label
                            const label = inputs[id].parentElement.querySelector('label');
                            if (label) {
                                label.appendChild(indicator);
                            }
                        }
                    }
                }
            });
            
            // Hide C. Percentage, Commission, and Advance fields
            ['commissionPercentage', 'lorryCommission', 'lorryAdvance'].forEach(id => {
                if (inputs[id] && inputs[id].parentElement) {
                    inputs[id].parentElement.style.display = 'none';
                }
            });
            
            // Enable company section
            if (companySection) {
                companySection.style.opacity = '1';
                companySection.style.pointerEvents = 'auto';
                
                // Enable all inputs in company section
                companyFields.forEach(id => {
                    if (inputs[id]) {
                        inputs[id].disabled = false;
                    }
                });
            }
            break;
            
        case 'Cash':
            // For Cash payment type:
            // 1. Enable Transaction Details section
            if (transactionSection) {
                transactionSection.style.opacity = '1';
                transactionSection.style.pointerEvents = 'auto';
            }
            
            // 2. Disable Company Amount section
            if (companySection) {
                companySection.style.opacity = '0.5';
                companySection.style.pointerEvents = 'none';
                
                // Disable all inputs in company section
                companyFields.forEach(id => {
                    if (inputs[id]) {
                        inputs[id].disabled = true;
                    }
                });
            }
            
            // 3. Enable Lorry Amount section
            if (lorrySection) {
                lorrySection.style.opacity = '1';
                lorrySection.style.pointerEvents = 'auto';
            }
            
            // For Cash, only show Freight, Lorry Amount, Commission Percentage, Commission, and Advance in Lorry Amount section
            ['lorryFreight', 'lorryAmount', 'commissionPercentage', 'lorryCommission', 'lorryAdvance'].forEach(id => {
                if (inputs[id]) {
                    inputs[id].disabled = false;
                    inputs[id].style.opacity = '1';
                    inputs[id].style.backgroundColor = '';
                    if (inputs[id].parentElement) {
                        inputs[id].parentElement.style.display = '';
                    }
                    
                    // Make lorryFreight editable for Cash payment type
                    if (id === 'lorryFreight') {
                        inputs[id].readOnly = false;
                        inputs[id].classList.remove('readonly-input');
                    }
                    
                    // Add required attribute to mandatory fields
                    if (id === 'lorryFreight' || id === 'commissionPercentage') {
                        inputs[id].setAttribute('required', 'required');
                        
                        // Add visual indicator for required fields
                        if (inputs[id].parentElement && !inputs[id].parentElement.querySelector('.required-indicator')) {
                            const indicator = document.createElement('span');
                            indicator.className = 'required-indicator';
                            indicator.textContent = ' *';
                            indicator.style.color = 'red';
                            indicator.style.fontWeight = 'bold';
                            
                            // Add the indicator after the label
                            const label = inputs[id].parentElement.querySelector('label');
                            if (label) {
                                label.appendChild(indicator);
                            }
                        }
                    }
                }
            });
            
            // Hide other fields in Lorry Amount section
            ['lorryWaiting', 'lorryCDWT', 'lorryExtra'].forEach(id => {
                if (inputs[id] && inputs[id].parentElement) {
                    inputs[id].parentElement.style.display = 'none';
                }
            });
            
            // Note: Removed automatic focus to maintain natural field navigation
            
            // Calculate commission based on freight
            calculateCommissionForCash();
            break;
            
        case 'Advance':
            // For Advance payment type:
            // 1. Enable Transaction Details section
            if (transactionSection) {
                transactionSection.style.opacity = '1';
                transactionSection.style.pointerEvents = 'auto';
            }
            
            // 2. Disable Company Amount section
            if (companySection) {
                companySection.style.opacity = '0.5';
                companySection.style.pointerEvents = 'none';
                
                // Disable all inputs in company section
                companyFields.forEach(id => {
                    if (inputs[id]) {
                        inputs[id].disabled = true;
                    }
                });
            }
            
            // 3. Enable Lorry Amount section but only the Advance field
            if (lorrySection) {
                lorrySection.style.opacity = '1';
                lorrySection.style.pointerEvents = 'auto';
            }
            
            // Disable all lorry fields first
            lorryPaymentFields.forEach(id => {
                if (inputs[id]) {
                    inputs[id].disabled = true;
                    inputs[id].style.opacity = '0.5';
                    inputs[id].style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
                    
                    // Hide all fields except lorryAdvance
                    if (id !== 'lorryAdvance' && inputs[id].parentElement) {
                        inputs[id].parentElement.style.display = 'none';
                    }
                }
            });
            
            // Only enable the Advance field
            if (inputs['lorryAdvance']) {
                inputs['lorryAdvance'].disabled = false;
                inputs['lorryAdvance'].style.opacity = '1';
                inputs['lorryAdvance'].style.backgroundColor = '';
                if (inputs['lorryAdvance'].parentElement) {
                    inputs['lorryAdvance'].parentElement.style.display = '';
                }
                
                // Add required attribute to lorryAdvance
                inputs['lorryAdvance'].setAttribute('required', 'required');
                
                // Add visual indicator for required fields
                if (inputs['lorryAdvance'].parentElement && !inputs['lorryAdvance'].parentElement.querySelector('.required-indicator')) {
                    const indicator = document.createElement('span');
                    indicator.className = 'required-indicator';
                    indicator.textContent = ' *';
                    indicator.style.color = 'red';
                    indicator.style.fontWeight = 'bold';
                    
                    // Add the indicator after the label
                    const label = inputs['lorryAdvance'].parentElement.querySelector('label');
                    if (label) {
                        label.appendChild(indicator);
                    }
                }
                
                // Note: Removed automatic focus to maintain natural field navigation
            }
            break;
    }
}

// Enhanced function to update rates based on vehicle type
async function updateRates() {
    const vehicleType = document.getElementById('vehicleType').value;
    const waitingHrs = parseFloat(document.getElementById('waitingHrs').value) || 0;
    const cdwt = parseFloat(document.getElementById('cdwt').value) || 0;
    
    console.log(`updateRates called with: vehicleType=${vehicleType}, waitingHrs=${waitingHrs}, cdwt=${cdwt}`);
    
    if (!vehicleType) {
        // Reset rates if no vehicle type is selected
        document.getElementById('lorryWaiting').value = '0.00';
        document.getElementById('lorryCDWT').value = '0.00';
        document.getElementById('companyWaiting').value = '0.00';
        document.getElementById('companyCDWT').value = '0.00';
        return;
    }
    
    try {
        // Show loading indicator
        showLoader();
        console.log(`Fetching rates for vehicle type: ${vehicleType}`);
        
        // Fetch rates for the selected vehicle type
        const response = await fetch(`/otherRate/all`);
        if (!response.ok) {
            throw new Error(`Failed to fetch rates: ${response.statusText}`);
        }
        
        const rates = await response.json();
        console.log('Fetched rates:', rates);
        
        // Find the matching rate for the selected vehicle type
        const matchedRate = rates.find(rate => rate.type === vehicleType);
        
        if (matchedRate) {
            console.log('Matched rate found:', matchedRate);
            
            // Calculate and set the waiting and CD/WT amounts
            const lorryWaiting = waitingHrs * matchedRate.waitingLorryRate;
            const lorryCDWT = cdwt * matchedRate.cdLorryRate;
            const companyWaiting = waitingHrs * matchedRate.waitingCompRate;
            const companyCDWT = cdwt * matchedRate.cdCompRate;
            
            console.log(`Calculated values:
                lorryWaiting = ${waitingHrs} * ${matchedRate.waitingLorryRate} = ${lorryWaiting}
                lorryCDWT = ${cdwt} * ${matchedRate.cdLorryRate} = ${lorryCDWT}
                companyWaiting = ${waitingHrs} * ${matchedRate.waitingCompRate} = ${companyWaiting}
                companyCDWT = ${cdwt} * ${matchedRate.cdCompRate} = ${companyCDWT}
            `);
            
            // Update the form fields
            document.getElementById('lorryWaiting').value = lorryWaiting.toFixed(2);
            document.getElementById('lorryCDWT').value = lorryCDWT.toFixed(2);
            document.getElementById('companyWaiting').value = companyWaiting.toFixed(2);
            document.getElementById('companyCDWT').value = companyCDWT.toFixed(2);
            
            // Verify the fields were updated
            console.log(`Updated field values:
                lorryWaiting.value = ${document.getElementById('lorryWaiting').value}
                lorryCDWT.value = ${document.getElementById('lorryCDWT').value}
                companyWaiting.value = ${document.getElementById('companyWaiting').value}
                companyCDWT.value = ${document.getElementById('companyCDWT').value}
            `);
            
            // Recalculate total amounts
            calculateLorryAmounts();
            calculateTotalAmount();
            
            hideLoader();
        } else {
            console.warn(`No rate found for vehicle type: ${vehicleType}`);
            showNotification(`No rates found for vehicle type: ${vehicleType}. Please add rates in the Other Rates section.`, true);
            
            // Reset values since no rate was found
            document.getElementById('lorryWaiting').value = '0.00';
            document.getElementById('lorryCDWT').value = '0.00';
            document.getElementById('companyWaiting').value = '0.00';
            document.getElementById('companyCDWT').value = '0.00';
            
            hideLoader();
        }
    } catch (error) {
        console.error('Error fetching rates:', error);
        showNotification('Failed to update rates: ' + error.message, true);
        hideLoader();
    }
}
// Improved notification styling and functionality
function showNotification(message, isError = false) {
    let box = document.getElementById('notification');
    if (!box) {
        box = document.createElement('div');
        box.id = 'notification';
        document.body.appendChild(box);
    }

    // Add styles to ensure it shows properly
    const styles = `
        #notification {
            display: none;
            position: fixed;
            top: 20px;
            right: 20px;
            max-width: 350px;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            transition: all 0.3s ease;
            opacity: 0;
            transform: translateY(-20px);
            font-family: Arial, sans-serif;
        }
        
        #notification.show {
            display: block;
            opacity: 1;
            transform: translateY(0);
        }
        
        #notification.success {
            background-color: #dff2e9;
            border-left: 5px solid #28a745;
            color: #155724;
        }
        
        #notification.error {
            background-color: #fbeae9;
            border-left: 5px solid #dc3545;
            color: #721c24;
        }
        
        .notification-content {
            display: flex;
            align-items: flex-start;
        }
        
        .notification-content i {
            margin-right: 12px;
            font-size: 18px;
            margin-top: 2px;
        }
        
        .notification-message {
            flex: 1;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .notification-close {
            position: absolute;
            top: 8px;
            right: 0px;
            background: none;
            border: none;
            color: inherit;
            opacity: 0.6;
            cursor: pointer;
            font-size: 14px;
        }
        
        .notification-close:hover {
            opacity: 1;
        }
    `;
    
    // Add styles to head if not already present
    if (!document.getElementById('notification-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'notification-styles';
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
    }
    
    box.className = 'notification';
    box.classList.add(isError ? 'error' : 'success');
    
    box.innerHTML = `
        <div class="notification-content">
            <i class="fas ${isError ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" onclick="closeNotification()"><i class="fas fa-times"></i></button>
    `;

    box.classList.add('show');

    if (!isError) {
        setTimeout(() => {
            closeNotification();
        }, 3000);
    }
}

function closeNotification() {
    const box = document.getElementById('notification');
    if (box) {
        box.classList.remove('show');
        setTimeout(() => {
            box.style.display = 'none';
        }, 300);
    }
}

function showLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'flex';
}

function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
}

// Add this function for the delete handler in tripVoucherTable.js
async function deleteVoucher(id) {
    if (confirm('Are you sure you want to delete this voucher?')) {
        try {
            const response = await fetch(`${apiBaseUrl}/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                // Decrement bill number after successful deletion
                await decrementBillNumber();
                
                // Refresh the table
                if (typeof fetchVouchers === 'function') {
                    fetchVouchers();
                } else {
                    window.location.reload();
                }
            } else {
                alert('Error deleting voucher');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error deleting voucher');
        }
    }
}

// Function to load vehicles from vehicle-master
async function loadVehicles() {
    try {
        console.log('Loading vehicles...');
        const response = await fetch('/vehicle-master/all');
        if (response.ok) {
            const vehicles = await response.json();
            const vehicleSelect = document.getElementById('vehicleNo');
            
            if (vehicleSelect) {
                console.log(`Found ${vehicles.length} vehicles to load`);
                
                // Clear existing options
                vehicleSelect.innerHTML = '<option value="">Select Lorry No</option>';
                
                // Add new options
                vehicles.forEach(vehicle => {
                    const option = document.createElement('option');
                    option.value = vehicle.vehicleNumber;
                    option.textContent = vehicle.vehicleNumber;
                    vehicleSelect.appendChild(option);
                });
                
                console.log(`Vehicle dropdown now has ${vehicleSelect.options.length} options`);
            } else {
                console.error('Vehicle select element not found');
            }
        } else {
            console.error('Failed to load vehicles:', response.status);
        }
    } catch (error) {
        console.error('Error loading vehicles:', error);
    }
}


// Function to load vehicle types from vehicle-type-master
async function loadVehicleTypes() {
    try {
        console.log('Loading vehicle types...');
        const response = await fetch('/vehicle-type-master/all');
        if (response.ok) {
            const vehicleTypes = await response.json();
            const vehicleTypeSelect = document.getElementById('vehicleType');
            
            if (vehicleTypeSelect) {
                console.log(`Found ${vehicleTypes.length} vehicle types to load`);
                
                // Clear existing options
                vehicleTypeSelect.innerHTML = '<option value="">Select Vehicle Type</option>';
                
                // Add new options
                vehicleTypes.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type.vehicleType;
                    option.textContent = type.vehicleType;
                    vehicleTypeSelect.appendChild(option);
                });
                
                console.log(`Vehicle type dropdown now has ${vehicleTypeSelect.options.length} options`);
            } else {
                console.error('Vehicle type select element not found');
            }
        } else {
            console.error('Failed to load vehicle types:', response.status);
        }
    } catch (error) {
        console.error('Error loading vehicle types:', error);
    }
}

// Function to load locations from location-master
async function loadLocations() {
    try {
        console.log('Loading locations...');
        const response = await fetch('/location-master/all');
        if (response.ok) {
            const locations = await response.json();
            console.log(`Found ${locations.length} locations to load`);
            const fromSelect = document.getElementById('from');
            const toSelect = document.getElementById('to');
            
            if (fromSelect && toSelect) {
                // Create options HTML
                let optionsHtml = '<option value="">Select Location</option>';
                
                // Group locations alphabetically
                const groupedLocations = {};
                locations.forEach(location => {
                    const firstLetter = location.locationName.charAt(0).toUpperCase();
                    if (!groupedLocations[firstLetter]) {
                        groupedLocations[firstLetter] = [];
                    }
                    groupedLocations[firstLetter].push(location);
                });
                
                // Create option groups
                Object.keys(groupedLocations).sort().forEach(letter => {
                    optionsHtml += `<optgroup label="${letter}">`;
                    groupedLocations[letter].forEach(location => {
                        optionsHtml += `<option value="${location.locationName}">${location.locationName}</option>`;
                    });
                    optionsHtml += '</optgroup>';
                });
                
                // No "Other" option as requested
                
                // Set the HTML for both selects
                fromSelect.innerHTML = optionsHtml;
                toSelect.innerHTML = optionsHtml;
            }
        } else {
            console.error('Failed to load locations:', response.status);
        }
    } catch (error) {
        console.error('Error loading locations:', error);
    }
}

// Function to load parties from party-master
async function loadParties() {
    try {
        console.log('Loading parties...');
        const response = await fetch('/party-master/all');
        if (response.ok) {
            const parties = await response.json();
            console.log(`Found ${parties.length} parties to load`);
            const partySelect = document.getElementById('toBeBilled');
            
            if (partySelect) {
                // Clear existing options
                partySelect.innerHTML = '<option value="">Select Party</option>';
                
                // Add new options
                parties.forEach(party => {
                    const option = document.createElement('option');
                    option.value = party.companyName;
                    option.textContent = party.companyName;
                    partySelect.appendChild(option);
                });
                
                console.log(`Party dropdown now has ${partySelect.options.length} options`);
            } else {
                console.error('Party select element not found');
            }
        } else {
            console.error('Failed to load parties:', response.status);
        }
    } catch (error) {
        console.error('Error loading parties:', error);
    }
}

// Function to load areas from area-master
async function loadAreas() {
    try {
        console.log('Loading areas...');
        const response = await fetch('/area-master/all');
        if (response.ok) {
            const areas = await response.json();
            console.log(`Found ${areas.length} areas to load`);
            const areaSelect = document.getElementById('areaName');
            
            if (areaSelect) {
                // Clear existing options
                areaSelect.innerHTML = '<option value="">Select Area Name</option>';
                
                // Create a Set to track unique area names
                const uniqueAreaNames = new Set();
                
                // Add new options, but only for unique area names
                areas.forEach(area => {
                    // Skip if this area name has already been added
                    if (uniqueAreaNames.has(area.areaName)) {
                        return;
                    }
                    
                    // Add to the set of unique area names
                    uniqueAreaNames.add(area.areaName);
                    
                    // Create and append the option
                    const option = document.createElement('option');
                    option.value = area.areaName;
                    option.textContent = area.areaName;
                    areaSelect.appendChild(option);
                });
                
                // Sort the options alphabetically
                const options = Array.from(areaSelect.options).slice(1); // Skip the first "Select Area Name" option
                options.sort((a, b) => a.text.localeCompare(b.text));
                
                // Clear and rebuild the select with sorted options
                areaSelect.innerHTML = '<option value="">Select Area Name</option>';
                options.forEach(option => areaSelect.appendChild(option));
                
                console.log(`Area dropdown now has ${areaSelect.options.length} options`);
            } else {
                console.error('Area select element not found');
            }
        } else {
            console.error('Failed to load areas:', response.status);
        }
    } catch (error) {
        console.error('Error loading areas:', error);
    }
}

// Add event listeners for waiting hours and CD/WT values to update rates when they change
document.addEventListener('DOMContentLoaded', function() {
    const waitingHrsInput = document.getElementById('waitingHrs');
    const cdwtInput = document.getElementById('cdwt');
    
    if (waitingHrsInput) {
        waitingHrsInput.addEventListener('input', updateRates);
    }
    
    if (cdwtInput) {
        cdwtInput.addEventListener('input', updateRates);
    }
});

// Function to setup Enter key navigation through form fields
function setupEnterKeyNavigation() {
    // Define a direct mapping for Enter key navigation
    const enterKeyMap = {
        'tripDate': 'billNumber', // Changed from currentDate to tripDate
        'currentDate': 'billNumber',
        'billNumber': 'vehicleNo',
        'vehicleNo': 'vehicleType',
        'vehicleType': 'paymentType',
        'paymentType': 'from',
        'from': 'to',
        'to': 'toBeBilled',
        'toBeBilled': 'areaName',
        'areaName': 'waitingHrs',
        'waitingHrs': 'cdwt',
        'cdwt': 'trips',
        'trips': 'freight',
        'freight': 'companyWaiting',
        'companyWaiting': 'companyCDWT',
        'companyCDWT': 'khoti',         // Go to khoti
        'khoti': 'hamali',              // Then to hamali
        'hamali': 'extra',              // Then to extra
        'extra': 'companyAmount',       // Then to companyAmount
        'companyAmount': 'lorryFreight', // Then to lorryFreight
        'lorryFreight': 'lorryWaiting',
        'lorryWaiting': 'lorryCDWT',
        'lorryCDWT': 'lorryExtra',
        'lorryExtra': 'lorryAmount',
        'lorryAmount': 'commissionPercentage',
        'commissionPercentage': 'lorryCommission',
        'lorryCommission': 'lorryAdvance',
        'lorryAdvance': 'tip-btn-add'
    };
    
    // Set initial focus on the bill number field (SR. NO.) when page loads
    setTimeout(() => {
        const billNumberField = document.getElementById('billNumber');
        if (billNumberField) {
            billNumberField.focus();
            billNumberField.select();
            console.log('Focus set to billNumber field in setupEnterKeyNavigation');
        }
    }, 500);
    
    // Add special handler for the Add button
    const addButton = document.querySelector('.tip-btn-add');
    if (addButton) {
        // Make the Add button more prominent when focused
        addButton.style.transition = 'all 0.3s ease';
        addButton.style.outline = 'none';
        
        addButton.addEventListener('focus', function() {
            this.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.5)';
        });
        
        addButton.addEventListener('blur', function() {
            this.style.boxShadow = '';
        });
        
        // Handle Enter key on Add button
        addButton.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                // Prevent submission if already in progress
                if (isSubmitting) {
                    console.log('Form submission already in progress, ignoring Enter key on Add button');
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                
                e.preventDefault();
                e.stopPropagation();
                console.log('Enter pressed on Add button, submitting form');
                
                // Submit the form
                const form = document.getElementById('tripForm');
                if (form) {
                    form.dispatchEvent(new Event('submit'));
                }
            }
        });
    }
    
    // Add Enter key handlers to all form fields
    for (const fieldId in enterKeyMap) {
        const field = document.getElementById(fieldId);
        if (!field) continue;
        
        field.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                console.log(`Enter pressed on ${this.id}, moving to ${enterKeyMap[this.id]}`);
                
                // Get the payment type to determine which is the last field
                const paymentType = document.getElementById('paymentType') ? document.getElementById('paymentType').value : '';
                
                // For Cash and Advance payment types, the last field is lorryAdvance
                // For Credit payment type, the last field is lorryAmount (since lorryAdvance is hidden)
                const isLastField = 
                    (this.id === 'lorryAdvance' && (paymentType === 'Cash' || paymentType === 'Advance')) || 
                    (this.id === 'lorryAmount' && paymentType === 'Credit');
                
                if (isLastField) {
                    // Prevent submission if already in progress
                    if (isSubmitting) {
                        console.log('Form submission already in progress, ignoring Enter key on last field');
                        e.stopPropagation();
                        return;
                    }
                    
                    console.log(`Enter pressed on last field (${this.id}) for payment type ${paymentType}, auto-submitting form`);
                    e.stopPropagation(); // Stop event propagation
                    
                    // Get the form and submit button
                    const form = document.getElementById('tripForm');
                    const submitBtn = document.querySelector('.tip-btn-add');
                    
                    if (form && submitBtn) {
                        // Click the submit button to trigger the form submission
                        submitBtn.click();
                        return;
                    } else if (form) {
                        // Fallback: dispatch submit event directly
                        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                        return;
                    }
                }
                
                const nextFieldId = enterKeyMap[this.id];
                if (nextFieldId) {
                    const nextField = document.getElementById(nextFieldId) || document.querySelector(`.${nextFieldId}`);
                    
                    if (nextField) {
                        // Focus the next field
                        nextField.focus();
                        
                        // If it's a select element, open the dropdown immediately
                        if (nextField.tagName.toLowerCase() === 'select') {
                            setTimeout(() => {
                                const searchInput = document.querySelector(`[data-original-select="${nextField.id}"]`);
                                if (searchInput) {
                                    searchInput.focus();
                                    searchInput.click();
                                } else {
                                    nextField.click();
                                }
                            }, 50);
                        }
                        
                        // If it's a text input, select all text
                        if (nextField.tagName.toLowerCase() === 'input' && 
                            (nextField.type === 'text' || nextField.type === 'number')) {
                            nextField.select();
                        }
                        
                        // If it's the Add button, make sure it's properly focused
                        if (nextField.id === 'tip-btn-add' || nextField.classList.contains('tip-btn-add')) {
                            console.log('Focused on Add button');
                        }
                    }
                }
            }
        });
    }
    
    // Add a global keydown handler to catch any fields that might not be in the map
    document.addEventListener('keydown', function(e) {
        // Handle Enter key globally
        if (e.key === 'Enter' && document.activeElement) {
            const activeId = document.activeElement.id;
            
            // If the active element is not in our map and not the Add button
            if (!enterKeyMap[activeId] && 
                activeId !== 'tip-btn-add' && 
                !document.activeElement.classList.contains('tip-btn-add')) {
                
                e.preventDefault();
                console.log(`Enter pressed on unmapped field ${activeId}, focusing Add button`);
                
                // Focus the Add button
                const addButton = document.querySelector('.tip-btn-add');
                if (addButton) {
                    addButton.focus();
                }
            }
        }
        
        // Handle Backspace key globally for the billNumber field
        if (e.key === 'Backspace' && document.activeElement && document.activeElement.id === 'billNumber') {
            const billNumberField = document.getElementById('billNumber');
            if (billNumberField && billNumberField.value === '') {
                e.preventDefault();
                console.log('Backspace pressed on empty billNumber field (global handler), moving to tripDate');
                const tripDateField = document.getElementById('tripDate');
                if (tripDateField) {
                    // Force focus on the date field
                    setTimeout(() => {
                        tripDateField.focus();
                        // Simulate a click to open the date picker
                        tripDateField.click();
                        console.log('Focus and click triggered on tripDate field from global handler');
                    }, 50);
                }
            }
        }
    });
}

// Define the dropdowns that should have the Alt+C shortcut
// Exclude Payment Type as requested
const dropdowns = [
    {
        id: 'vehicleNo',
        masterName: 'Vehicle Master',
        apiEndpoint: '/vehicle-master/add',
        createFunction: createNewVehicle
    },
    {
        id: 'vehicleType',
        masterName: 'Vehicle Type Master',
        apiEndpoint: '/vehicle-type-master/add',
        createFunction: createNewVehicleType
    },
    {
        id: 'from',
        masterName: 'From & To Master',
        apiEndpoint: '/api/locations/add',
        createFunction: createNewLocation
    },
    {
        id: 'to',
        masterName: 'From & To Master',
        apiEndpoint: '/api/locations/add',
        createFunction: createNewLocation
    },
    {
        id: 'toBeBilled',
        masterName: 'Party Master',
        apiEndpoint: '/api/parties/add',
        createFunction: createNewParty
    },
    {
        id: 'areaName',
        masterName: 'Area Master',
        apiEndpoint: '/area-master/add-from-trip',
        createFunction: createNewArea
    }
];

// Function to setup Alt+C shortcut for creating new entries in dropdowns
function setupAltCShortcut() {
    
    // Add event listeners for Alt+C shortcut to original select elements
    // This is mainly for dropdowns that haven't been enhanced yet
    dropdowns.forEach(dropdown => {
        const element = document.getElementById(dropdown.id);
        if (!element) return;
        
        // Only add the event listener if this is a regular select element
        // (not already enhanced with our searchable dropdown)
        if (element.tagName === 'SELECT' && 
            !element.parentElement.classList.contains('searchable-dropdown-wrapper')) {
            
            element.addEventListener('keydown', function(e) {
                // Check if Alt+C was pressed
                if (e.altKey && e.key === 'c') {
                    e.preventDefault();
                    dropdown.createFunction(this);
                }
            });
        }
    });
}

// Function to create a new vehicle
async function createNewVehicle(inputElement) {
    const vehicleNumber = prompt('Enter new Vehicle Number:');
    if (!vehicleNumber) {
        // User cancelled, just save current field and move to next
        showFeedback('Cancelled, moving to next field', 'info');
        setTimeout(() => {
            handleAltCShortcut();
        }, 100);
        return;
    }
    
    try {
        showLoader();
        
        // Create the new vehicle
        const response = await fetch('/vehicle-master/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                vehicleNumber: vehicleNumber,
                vehicleType: document.getElementById('vehicleType').value || '',
                ownerName: '',
                contactNumber: '',
                address: ''
            })
        });
        
        if (response.ok) {
            const newVehicle = await response.json();
            
            // Handle both select elements and autocomplete input fields
            if (inputElement.tagName === 'SELECT') {
                // Traditional select element
                const option = document.createElement('option');
                option.value = newVehicle.id || vehicleNumber;
                option.textContent = vehicleNumber;
                inputElement.appendChild(option);
                inputElement.value = option.value;
            } else if (inputElement.classList.contains('autocomplete-field')) {
                // Autocomplete input field
                inputElement.value = vehicleNumber;
                
                // Set the hidden field value for the ID
                const hiddenField = document.getElementById(inputElement.id + '_id');
                if (hiddenField) {
                    hiddenField.value = newVehicle.id || vehicleNumber;
                }
                
                // Trigger change event to update any dependent fields
                inputElement.dispatchEvent(new Event('change', { bubbles: true }));
            }
            
            showNotification(`New vehicle "${vehicleNumber}" added successfully`, false);
            
            // Force refresh the focusable elements cache since DOM has changed
            getFocusableElements(true);
            
            // Move to next field after successful creation
            setTimeout(() => {
                focusNextElement(inputElement, true);
            }, 500);
            
        } else {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to add new vehicle');
        }
    } catch (error) {
        console.error('Error adding new vehicle:', error);
        showNotification(`Error adding new vehicle: ${error.message}`, true);
    } finally {
        hideLoader();
    }
}

// Function to create a new vehicle type
async function createNewVehicleType(inputElement) {
    const vehicleType = prompt('Enter new Vehicle Type:');
    if (!vehicleType) {
        // User cancelled, just save current field and move to next
        showFeedback('Cancelled, moving to next field', 'info');
        setTimeout(() => {
            handleAltCShortcut();
        }, 100);
        return;
    }
    
    try {
        showLoader();
        
        // Create the new vehicle type
        const response = await fetch('/vehicle-type-master/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                vehicleType: vehicleType
            })
        });
        
        if (response.ok) {
            const newVehicleType = await response.json();
            
            // Handle both select elements and autocomplete input fields
            if (inputElement.tagName === 'SELECT') {
                // Traditional select element
                const option = document.createElement('option');
                option.value = newVehicleType.id || vehicleType;
                option.textContent = vehicleType;
                inputElement.appendChild(option);
                inputElement.value = option.value;
            } else if (inputElement.classList.contains('autocomplete-field')) {
                // Autocomplete input field
                inputElement.value = vehicleType;
                
                // Set the hidden field value for the ID
                const hiddenField = document.getElementById(inputElement.id + '_id');
                if (hiddenField) {
                    hiddenField.value = newVehicleType.id || vehicleType;
                }
                
                // Trigger change event to update any dependent fields
                inputElement.dispatchEvent(new Event('change', { bubbles: true }));
            }
            
            showNotification(`New vehicle type "${vehicleType}" added successfully`, false);
            
            // Force refresh the focusable elements cache since DOM has changed
            getFocusableElements(true);
            
            // Move to next field after successful creation
            setTimeout(() => {
                focusNextElement(inputElement, true);
            }, 500);
        } else {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to add new vehicle type');
        }
    } catch (error) {
        console.error('Error adding new vehicle type:', error);
        showNotification(`Error adding new vehicle type: ${error.message}`, true);
    } finally {
        hideLoader();
    }
}

// Function to create a new location
async function createNewLocation(selectElement) {
    const locationType = selectElement.id === 'from' ? 'From' : 'To';
    const locationName = prompt(`Enter new ${locationType} Location:`);
    if (!locationName) {
        // User cancelled, just save current field and move to next
        showFeedback('Cancelled, moving to next field', 'info');
        setTimeout(() => {
            handleAltCShortcut();
        }, 100);
        return;
    }
    
    try {
        showLoader();
        
        // Create the new location in the From To Master module
        const response = await fetch('/api/locations/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: locationName,
                type: locationType
            })
        });
        
        if (response.ok) {
            const newLocation = await response.json();
            
            // Add the new option to the dropdown
            const option = document.createElement('option');
            option.value = newLocation.id || locationName; // Use the ID from the server response if available
            option.textContent = locationName;
            
            // Add the option to the dropdown
            selectElement.appendChild(option);
            
            // Select the new option
            selectElement.value = option.value;
            
            // Set the hidden field value for the ID
            const hiddenField = document.getElementById(selectElement.id + '_id');
            if (hiddenField) {
                hiddenField.value = newLocation.id || locationName;
            }
            
            // Update the visible input field if using autocomplete
            const autocompleteField = document.getElementById(selectElement.id);
            if (autocompleteField && autocompleteField.classList.contains('autocomplete-field')) {
                autocompleteField.value = locationName;
            }
            
            // If this is an enhanced dropdown, update the search input
            const wrapper = selectElement.closest('.searchable-dropdown-wrapper');
            if (wrapper) {
                const searchInput = wrapper.querySelector('.dropdown-search-input');
                if (searchInput) {
                    searchInput.value = locationName;
                }
                
                // Hide any open results container
                const resultsContainer = wrapper.querySelector('.dropdown-results-container');
                if (resultsContainer) {
                    resultsContainer.style.display = 'none';
                }
            }
            
            // No "Other" input field to handle
            
            // Trigger change event to update any dependent fields
            const event = new Event('change', { bubbles: true });
            selectElement.dispatchEvent(event);
            
            showNotification(`New ${locationType} location "${locationName}" added successfully`, false);
            
            // Force refresh the focusable elements cache since DOM has changed
            getFocusableElements(true);
            
            // Move to next field after successful creation
            setTimeout(() => {
                focusNextElement(selectElement, true);
            }, 500);
        } else {
            const errorText = await response.text();
            throw new Error(errorText || `Failed to add new ${locationType} location`);
        }
    } catch (error) {
        console.error(`Error adding new ${locationType} location:`, error);
        showNotification(`Error adding new ${locationType} location: ${error.message}`, true);
    } finally {
        hideLoader();
    }
}

// Function to create a new party
async function createNewParty(selectElement) {
    const partyName = prompt('Enter new Party Name:');
    if (!partyName) return;
    
    try {
        showLoader();
        
        // Create the new party
        const response = await fetch('/api/parties/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: partyName
            })
        });
        
        if (response.ok) {
            const newParty = await response.json();
            
            // Add the new option to the dropdown
            const option = document.createElement('option');
            option.value = newParty.id;
            option.textContent = newParty.companyName;
            selectElement.appendChild(option);
            
            // Select the new option
            selectElement.value = newParty.id;
            
            // Set the hidden field value for the ID
            const hiddenField = document.getElementById('toBeBilled_id');
            if (hiddenField) {
                hiddenField.value = newParty.id;
            }
            
            // Update the visible input field if using autocomplete
            const autocompleteField = document.getElementById('toBeBilled');
            if (autocompleteField && autocompleteField.classList.contains('autocomplete-field')) {
                autocompleteField.value = partyName;
            }
            
            // If this is an enhanced dropdown, update the search input
            const wrapper = selectElement.closest('.searchable-dropdown-wrapper');
            if (wrapper) {
                const searchInput = wrapper.querySelector('.dropdown-search-input');
                if (searchInput) {
                    searchInput.value = newParty.companyName;
                }
                
                // Hide any open results container
                const resultsContainer = wrapper.querySelector('.dropdown-results-container');
                if (resultsContainer) {
                    resultsContainer.style.display = 'none';
                }
            }
            
            showNotification(`New party "${partyName}" added successfully`, false);
            
            // Force refresh the focusable elements cache since DOM has changed
            getFocusableElements(true);
            
            // Move to next field after successful creation
            setTimeout(() => {
                focusNextElement(selectElement, true);
            }, 500);
        } else {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to add new party');
        }
    } catch (error) {
        console.error('Error adding new party:', error);
        showNotification(`Error adding new party: ${error.message}`, true);
    } finally {
        hideLoader();
    }
}

// Function to create a new area
async function createNewArea(element) {
    // Determine if this is a select element or an autocomplete input
    const isAutocomplete = element.classList.contains('autocomplete-field');
    const areaName = prompt('Enter new Area Name:');
    
    if (!areaName) return;
    
    try {
        showLoader();
        
        // Get current values from the form
        const vehicleType = document.getElementById('vehicleType').value || '';
        const fromLocation = document.getElementById('from').value || '';
        const toLocation = document.getElementById('to').value || '';
        const partyName = document.getElementById('toBeBilled').value || '';
        const companyRate = parseFloat(document.getElementById('freight').value) || 0;
        const lorryRate = parseFloat(document.getElementById('lorryFreight').value) || 0;
        
        // Format today's date in YYYY-MM-DD format
        const today = new Date();
        const formattedDate = today.getFullYear() + '-' + 
                             String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                             String(today.getDate()).padStart(2, '0');
        
        console.log(`Creating new area with: 
            Area Name: ${areaName}
            Vehicle Type: ${vehicleType}
            From: ${fromLocation}
            To: ${toLocation}
            Party: ${partyName}
            Company Rate: ${companyRate}
            Lorry Rate: ${lorryRate}
            Date: ${formattedDate}`);
        
        // Create the new area with all available data
        const areaData = {
            areaName: areaName,
            vehicleType: vehicleType,
            fromLocation: fromLocation,
            toLocation: toLocation,
            partyName: partyName,
            companyRate: companyRate,
            lorryRate: lorryRate,
            areaDate: formattedDate
        };
        
        console.log('Sending area data to server:', areaData);
        
        const response = await fetch('/area-master/add-from-trip', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(areaData)
        });
        
        if (response.ok) {
            const newArea = await response.json();
            console.log('Area created successfully:', newArea);
            
            if (isAutocomplete) {
                // For autocomplete input fields
                element.value = areaName;
                
                // Set the hidden field value for the ID
                const hiddenField = document.getElementById('areaName_id');
                if (hiddenField) {
                    hiddenField.value = newArea.id || areaName;
                }
                
                // Close any open autocomplete results
                closeAutocompleteDropdowns();
            } else {
                // For traditional select elements
                const option = document.createElement('option');
                option.value = newArea.id || areaName;
                option.textContent = areaName;
                element.appendChild(option);
                element.value = option.value;
                
                // If this is an enhanced dropdown, update the search input
                const wrapper = element.closest('.searchable-dropdown-wrapper');
                if (wrapper) {
                    const searchInput = wrapper.querySelector('.dropdown-search-input');
                    if (searchInput) {
                        searchInput.value = areaName;
                    }
                    
                    // Hide any open results container
                    const resultsContainer = wrapper.querySelector('.dropdown-results-container');
                    if (resultsContainer) {
                        resultsContainer.style.display = 'none';
                    }
                }
            }
            
            // If we're in the trip voucher form, try to fetch freight rates
            if (document.getElementById('freight') && document.getElementById('lorryFreight')) {
                fetchFreightRates();
            }
            
            // Trigger change event to update any dependent fields
            element.dispatchEvent(new Event('change', { bubbles: true }));
            
            // Show success notification
            showNotification(`New area "${areaName}" added successfully`, false);
            
            // Provide visual feedback
            showAltCFeedback(element);
            
            // Force refresh the focusable elements cache since DOM has changed
            getFocusableElements(true);
            
            // Move to next field after successful creation
            setTimeout(() => {
                focusNextElement(element, true);
            }, 300);

/**
 * Function to convert a regular dropdown to an enhanced searchable input field
 * @param {string} selectId - The ID of the select element to make searchable
 */
function makeDropdownSearchable(selectId) {
    // Skip enhanced functionality for paymentType - keep it as a regular searchable dropdown
    if (selectId === 'paymentType') {
        makeSimpleSearchableDropdown(selectId);
        return;
    }
    
    const selectElement = document.getElementById(selectId);
    if (!selectElement) {
        console.error(`Element with ID '${selectId}' not found`);
        return;
    }
    
    // If the dropdown already has a searchable wrapper, don't add another one
    if (selectElement.parentNode && selectElement.parentNode.className === 'searchable-dropdown-wrapper') {
        console.log(`Dropdown ${selectId} is already searchable`);
        return;
    }
    
    console.log(`Making dropdown enhanced searchable: ${selectId} with ${selectElement.options.length} options`);
    
    // Create a wrapper div to contain both the hidden select and the search input
    const wrapper = document.createElement('div');
    wrapper.className = 'searchable-dropdown-wrapper';
    wrapper.style.position = 'relative';
    wrapper.style.width = '100%';
    
    // Create the search input that will replace the dropdown visually
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'dropdown-search-input';
    searchInput.placeholder = 'Type to search...';
    searchInput.style.width = '100%';
    searchInput.style.padding = '8px';
    searchInput.style.boxSizing = 'border-box';
    searchInput.style.border = '1px solid #ccc';
    searchInput.style.borderRadius = '4px';
    searchInput.autocomplete = 'off'; // Disable browser autocomplete
    searchInput.setAttribute('data-original-select', selectId); // Store the original select ID
    
    // Add event listener to automatically open dropdown when focused via Enter key
    searchInput.addEventListener('focus', function(e) {
        // If this was triggered by Enter key navigation, open the dropdown immediately
        if (e.relatedTarget) {
            setTimeout(() => {
                // Show the dropdown results
                const resultsContainer = wrapper.querySelector('.dropdown-results-container');
                if (resultsContainer) {
                    // Filter and display all options
                    filterDropdownOptions('', selectElement, resultsContainer, originalOptions);
                    resultsContainer.style.display = 'block';
                }
            }, 50);
        }
    });
    
    // Insert the wrapper before the select element
    selectElement.parentNode.insertBefore(wrapper, selectElement);
    
    // Move the select element into the wrapper and hide it
    wrapper.appendChild(searchInput);
    wrapper.appendChild(selectElement);
    
    // Store the original options for filtering
    const originalOptions = Array.from(selectElement.options);
    console.log(`Stored ${originalOptions.length} original options for ${selectId}`);
    
    // Create a dropdown results container
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'dropdown-results-container';
    resultsContainer.style.position = 'absolute';
    resultsContainer.style.width = '100%';
    resultsContainer.style.maxHeight = '200px';
    resultsContainer.style.overflowY = 'auto';
    resultsContainer.style.backgroundColor = 'var(--dark-bg)';
    resultsContainer.style.border = '1px solid var(--border)';
    resultsContainer.style.borderRadius = '4px';
    resultsContainer.style.zIndex = '1000';
    resultsContainer.style.display = 'none';
    resultsContainer.style.marginTop = '2px';
    resultsContainer.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    resultsContainer.tabIndex = -1; // Make it focusable to receive keyboard events
    wrapper.appendChild(resultsContainer);
    
    // Function to load data based on the dropdown ID and search text
    async function loadFilteredData(searchText) {
        showLoader();
        try {
            let endpoint = '';
            let dataField = '';
            let valueField = '';
            let textField = '';
            
            // Configure endpoint and data mapping based on dropdown ID
            switch(selectId) {
                case 'vehicleNo':
                    endpoint = '/api/vehicles/search?query=' + encodeURIComponent(searchText);
                    dataField = '';  // Direct array response
                    valueField = 'id';
                    textField = 'vehicleNumber';
                    break;
                case 'vehicleType':
                    endpoint = '/api/vehicle-types/search?query=' + encodeURIComponent(searchText);
                    dataField = '';  // Direct array response
                    valueField = 'id';
                    textField = 'vehicleType';
                    break;
                case 'from':
                case 'to':
                    endpoint = '/api/locations/search?query=' + encodeURIComponent(searchText);
                    dataField = '';  // Direct array response
                    valueField = 'id';
                    textField = 'locationName';
                    break;
                case 'toBeBilled':
                    endpoint = '/api/parties/search?query=' + encodeURIComponent(searchText);
                    dataField = '';  // Direct array response
                    valueField = 'id';
                    textField = 'companyName';
                    break;
                case 'areaName':
                    endpoint = '/api/areas/search?query=' + encodeURIComponent(searchText);
                    dataField = '';  // Direct array response
                    valueField = 'id';
                    textField = 'areaName';
                    break;
                default:
                    console.error(`No endpoint configured for dropdown ${selectId}`);
                    hideLoader();
                    return [];
            }
            
            // Fetch filtered data from the server
            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error(`Failed to fetch data for ${selectId}: ${response.status}`);
            }
            
            let data = await response.json();
            if (dataField && data[dataField]) {
                data = data[dataField];
            }
            
            // Map the data to a consistent format
            return data.map(item => ({
                value: item[valueField],
                text: item[textField]
            }));
        } catch (error) {
            console.error(`Error loading filtered data for ${selectId}:`, error);
            return [];
        } finally {
            hideLoader();
        }
    }
    
    // Function to update the results container with filtered options
    async function updateResults(searchText) {
        resultsContainer.innerHTML = '';
        
        // If search text is empty, show original options
        if (!searchText.trim()) {
            originalOptions.forEach(option => {
                if (option.value) { // Skip empty option
                    addResultItem(option.value, option.text);
                }
            });
        } else {
            // First filter the original options
            let hasMatches = false;
            originalOptions.forEach(option => {
                if (option.value && option.text.toLowerCase().includes(searchText.toLowerCase())) {
                    addResultItem(option.value, option.text);
                    hasMatches = true;
                }
            });
            
            // If we have less than 5 matches from original options, fetch more from server
            if (!hasMatches || originalOptions.length < 10) {
                const filteredData = await loadFilteredData(searchText);
                
                // Add filtered results, avoiding duplicates
                const existingValues = Array.from(resultsContainer.querySelectorAll('.dropdown-result-item'))
                    .map(item => item.dataset.value);
                
                filteredData.forEach(item => {
                    if (!existingValues.includes(item.value.toString())) {
                        addResultItem(item.value, item.text);
                    }
                });
            }
        }
        
        // No "Other" option for location dropdowns as requested
        
        // Show "No results" message if no matches
        if (resultsContainer.children.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'dropdown-no-results';
            noResults.textContent = 'No matches found';
            noResults.style.padding = '8px 12px';
            noResults.style.color = '#999';
            noResults.style.fontStyle = 'italic';
            resultsContainer.appendChild(noResults);
        }
        
        // Show the results container
        resultsContainer.style.display = 'block';
    }
    
    // Function to add a result item to the results container
    function addResultItem(value, text) {
        const item = document.createElement('div');
        item.className = 'dropdown-result-item';
        item.dataset.value = value;
        item.textContent = text;
        item.style.padding = '8px 12px';
        item.style.cursor = 'pointer';
        
        item.addEventListener('mouseover', function() {
            this.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        });
        
        item.addEventListener('mouseout', function() {
            this.style.backgroundColor = '';
        });
        
        item.addEventListener('click', function() {
            selectValue(value, text);
        });
        
        resultsContainer.appendChild(item);
    }
    
    // Function to select a value and update the UI
    function selectValue(value, text) {
        // Update the hidden select element
        selectElement.value = value;
        
        // Update the search input
        searchInput.value = text;
        
        // Hide the results container
        resultsContainer.style.display = 'none';
        
        // Trigger change event on the select element
        const event = new Event('change', { bubbles: true });
        selectElement.dispatchEvent(event);
    }
    
    // Event listener for input changes
    let debounceTimer;
    searchInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            updateResults(this.value);
        }, 300); // Debounce to avoid too many requests
    });
    
    // Event listener for input focus
    searchInput.addEventListener('focus', function() {
        updateResults(this.value);
    });
    
    // Add Alt+C shortcut functionality to the search input
    searchInput.addEventListener('keydown', function(e) {
        // Check if Alt+C was pressed
        if (e.altKey && e.key === 'c') {
            e.preventDefault();
            e.stopPropagation();
            
            // Find the dropdown configuration for this select element
            const dropdownConfig = dropdowns.find(d => d.id === selectId);
            if (dropdownConfig) {
                console.log(`Alt+C pressed for ${selectId} - calling create function`);
                
                // Call the create function with the original select element
                dropdownConfig.createFunction(selectElement);
                
                // Hide the results container if it's open
                resultsContainer.style.display = 'none';
            } else {
                console.warn(`No dropdown config found for ${selectId}`);
            }
        }
    });
    
    // Event listener for clicks outside to close the dropdown
    document.addEventListener('click', function(e) {
        if (!wrapper.contains(e.target)) {
            resultsContainer.style.display = 'none';
        }
    });
    
    // Add Alt+C shortcut functionality to the results container
    resultsContainer.addEventListener('keydown', function(e) {
        // Check if Alt+C was pressed
        if (e.altKey && e.key === 'c') {
            e.preventDefault();
            e.stopPropagation();
            
            // Find the dropdown configuration for this select element
            const dropdownConfig = dropdowns.find(d => d.id === selectId);
            if (dropdownConfig) {
                console.log(`Alt+C pressed in results container for ${selectId} - calling create function`);
                
                // Call the create function with the original select element
                dropdownConfig.createFunction(selectElement);
                
                // Hide the results container
                resultsContainer.style.display = 'none';
            } else {
                console.warn(`No dropdown config found for ${selectId} in results container`);
            }
        }
    });
    
    // Make sure the results container can capture keyboard events
    resultsContainer.addEventListener('click', function(e) {
        // When clicking in the results container, make sure it can receive keyboard events
        this.focus();
        e.stopPropagation();
    });
    
    // Initial setup - hide the select element completely
    selectElement.style.position = 'absolute';
    selectElement.style.width = '1px';
    selectElement.style.height = '1px';
    selectElement.style.opacity = '0';
    selectElement.style.overflow = 'hidden';
    
    // If the select has a selected value, initialize the input with it
    if (selectElement.value && selectElement.selectedIndex > 0) {
        searchInput.value = selectElement.options[selectElement.selectedIndex].text;
    }
    
    // Create a MutationObserver to watch for programmatic changes to the select element
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
                // Update the search input when the select value is changed programmatically
                if (selectElement.value && selectElement.value !== 'other') {
                    const selectedOption = Array.from(selectElement.options).find(opt => opt.value === selectElement.value);
                    if (selectedOption) {
                        searchInput.value = selectedOption.text;
                    }
                } else if (selectElement.value === 'other') {
                    searchInput.value = 'Other (enter manually)';
                } else {
                    searchInput.value = '';
                }
            }
        });
    });
    
    // Start observing the select element for attribute changes
    observer.observe(selectElement, { attributes: true });
    
    // Load initial data if needed
    if (originalOptions.length <= 1) {
        console.warn(`Dropdown ${selectId} has no options, trying to reload data`);
        
        // Attempt to reload data based on the dropdown ID
        if (selectId === 'vehicleNo') {
            loadVehicles().then(() => {
                console.log('Reloaded vehicles data');
                // Update original options after reload
                const updatedOptions = Array.from(selectElement.options);
                originalOptions.length = 0;
                updatedOptions.forEach(opt => originalOptions.push(opt));
            });
        } else if (selectId === 'vehicleType') {
            loadVehicleTypes().then(() => {
                console.log('Reloaded vehicle types data');
                const updatedOptions = Array.from(selectElement.options);
                originalOptions.length = 0;
                updatedOptions.forEach(opt => originalOptions.push(opt));
            });
        } else if (selectId === 'from' || selectId === 'to') {
            loadLocations().then(() => {
                console.log('Reloaded locations data');
                const updatedOptions = Array.from(selectElement.options);
                originalOptions.length = 0;
                updatedOptions.forEach(opt => originalOptions.push(opt));
            });
        } else if (selectId === 'toBeBilled') {
            loadParties().then(() => {
                console.log('Reloaded parties data');
                const updatedOptions = Array.from(selectElement.options);
                originalOptions.length = 0;
                updatedOptions.forEach(opt => originalOptions.push(opt));
            });
        } else if (selectId === 'areaName') {
            loadAreas().then(() => {
                console.log('Reloaded areas data');
                const updatedOptions = Array.from(selectElement.options);
                originalOptions.length = 0;
                updatedOptions.forEach(opt => originalOptions.push(opt));
            });
        }
    }
}

/**
 * Function to create a simple searchable dropdown (used for paymentType)
 * @param {string} selectId - The ID of the select element to make searchable
 */
function makeSimpleSearchableDropdown(selectId) {
    const selectElement = document.getElementById(selectId);
    if (!selectElement) {
        console.error(`Element with ID '${selectId}' not found`);
        return;
    }
    
    // If the dropdown already has a searchable wrapper, don't add another one
    if (selectElement.parentNode && selectElement.parentNode.className === 'searchable-dropdown-wrapper') {
        console.log(`Dropdown ${selectId} is already searchable`);
        return;
    }
    
    console.log(`Making dropdown simple searchable: ${selectId} with ${selectElement.options.length} options`);
    
    // Create a wrapper div to contain both the select and the search input
    const wrapper = document.createElement('div');
    wrapper.className = 'searchable-dropdown-wrapper';
    wrapper.style.position = 'relative';
    wrapper.style.width = '100%';
    
    // Add special handling for Alt+C, Enter, and Backspace
    selectElement.addEventListener('keydown', function(e) {
        // If Alt+C is pressed, close the dropdown and move to next field
        if (e.altKey && e.key === 'c') {
            e.preventDefault();
            e.stopPropagation();
            
            // Close the dropdown
            this.blur();
            
            // Find the next focusable element
            const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
            const allFocusable = Array.from(document.querySelectorAll(focusableElements))
                .filter(el => !el.disabled && el.style.display !== 'none' && el.style.visibility !== 'hidden');
            
            const currentIndex = allFocusable.indexOf(this);
            if (currentIndex >= 0 && currentIndex < allFocusable.length - 1) {
                // Focus the next element
                setTimeout(() => {
                    allFocusable[currentIndex + 1].focus();
                }, 50);
            }
        }
        
        // If Enter is pressed, select the current option and move to next field
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            
            // Commit the current selection
            this.dispatchEvent(new Event('change', { bubbles: true }));
            
            // Close the dropdown
            this.blur();
            
            // Find the next focusable element
            const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
            const allFocusable = Array.from(document.querySelectorAll(focusableElements))
                .filter(el => !el.disabled && el.style.display !== 'none' && el.style.visibility !== 'hidden');
            
            const currentIndex = allFocusable.indexOf(this);
            if (currentIndex >= 0 && currentIndex < allFocusable.length - 1) {
                // Focus the next element
                setTimeout(() => {
                    allFocusable[currentIndex + 1].focus();
                }, 50);
            }
        }
        
        // If Backspace is pressed, close the dropdown
        if (e.key === 'Backspace') {
            // Close the dropdown
            this.blur();
            
            // Prevent default backspace behavior
            e.preventDefault();
            e.stopPropagation();
        }
    });
    
    // Create the search input
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'dropdown-search-input';
    searchInput.placeholder = 'Type to search...';
    searchInput.style.width = '100%';
    searchInput.style.padding = '8px';
    searchInput.style.boxSizing = 'border-box';
    searchInput.style.marginBottom = '5px';
    searchInput.style.border = '1px solid #ccc';
    searchInput.style.borderRadius = '4px';
    
    // Insert the wrapper before the select element
    selectElement.parentNode.insertBefore(wrapper, selectElement);
    
    // Move the select element into the wrapper
    wrapper.appendChild(searchInput);
    wrapper.appendChild(selectElement);
    
    // Store the original options for filtering
    const originalOptions = Array.from(selectElement.options);
    console.log(`Stored ${originalOptions.length} original options for ${selectId}`);
    
    // Add event listener for the search input
    searchInput.addEventListener('input', function() {
        const searchText = this.value.toLowerCase();
        
        // Clear current options
        selectElement.innerHTML = '';
        
        // Filter and add matching options
        originalOptions.forEach(option => {
            if (option.text.toLowerCase().includes(searchText) || option.value === '') {
                selectElement.appendChild(option.cloneNode(true));
            }
        });
        
        // If no options match and this is not the first empty option, show a message
        if (selectElement.options.length === 0 || (selectElement.options.length === 1 && selectElement.options[0].value === '')) {
            const noMatchOption = document.createElement('option');
            noMatchOption.disabled = true;
            noMatchOption.textContent = 'No matches found';
            selectElement.appendChild(noMatchOption);
        }
    });
    
    // When select changes, update the search input with the selected value
    selectElement.addEventListener('change', function() {
        if (this.value && this.value !== 'other') {
            searchInput.value = this.options[this.selectedIndex].text;
        } else if (this.value === 'other') {
            searchInput.value = 'Other (enter manually)';
        } else {
            searchInput.value = '';
        }
        
        // Reset the options to show all again for next search
        resetOptions();
    });
    
    // Create a MutationObserver to watch for programmatic changes to the select element
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
                // Update the search input when the select value is changed programmatically
                if (selectElement.value && selectElement.value !== 'other') {
                    const selectedOption = Array.from(selectElement.options).find(opt => opt.value === selectElement.value);
                    if (selectedOption) {
                        searchInput.value = selectedOption.text;
                    }
                } else if (selectElement.value === 'other') {
                    searchInput.value = 'Other (enter manually)';
                } else {
                    searchInput.value = '';
                }
            }
        });
    });
    
    // Start observing the select element for attribute changes
    observer.observe(selectElement, { attributes: true });
    
    // Function to reset options to original state
    function resetOptions() {
        selectElement.innerHTML = '';
        originalOptions.forEach(option => {
            selectElement.appendChild(option.cloneNode(true));
        });
    }
    
    // Initial setup - hide the select element visually but keep it functional
    selectElement.style.position = 'absolute';
    selectElement.style.width = '100%';
    selectElement.style.opacity = '0';
    selectElement.style.height = '0';
    selectElement.style.overflow = 'hidden';
    
    // Create a custom dropdown display
    const customDropdown = document.createElement('div');
    customDropdown.className = 'custom-dropdown-display';
    customDropdown.style.border = '1px solid #ccc';
    customDropdown.style.borderRadius = '4px';
    customDropdown.style.padding = '8px';
    customDropdown.style.backgroundColor = '#fff';
    customDropdown.style.cursor = 'pointer';
    customDropdown.style.marginTop = '5px';
    customDropdown.style.maxHeight = '200px';
    customDropdown.style.overflowY = 'auto';
    customDropdown.style.display = 'none';
    wrapper.appendChild(customDropdown);
    
    // Populate the custom dropdown
    function updateCustomDropdown() {
        customDropdown.innerHTML = '';
        Array.from(selectElement.options).forEach(option => {
            if (option.disabled) {
                const item = document.createElement('div');
                item.className = 'dropdown-item disabled';
                item.textContent = option.textContent;
                item.style.padding = '8px';
                item.style.color = '#999';
                customDropdown.appendChild(item);
            } else {
                const item = document.createElement('div');
                item.className = 'dropdown-item';
                item.dataset.value = option.value;
                item.textContent = option.textContent;
                item.style.padding = '8px';
                item.style.cursor = 'pointer';
                
                item.addEventListener('mouseover', function() {
                    this.style.backgroundColor = '#f0f0f0';
                });
                
                item.addEventListener('mouseout', function() {
                    this.style.backgroundColor = '';
                });
                
                item.addEventListener('click', function() {
                    selectElement.value = this.dataset.value;
                    
                    // Trigger the change event
                    const event = new Event('change', { bubbles: true });
                    selectElement.dispatchEvent(event);
                    
                    // Update search input and hide dropdown
                    if (this.dataset.value && this.dataset.value !== 'other') {
                        searchInput.value = this.textContent;
                    } else {
                        searchInput.value = '';
                    }
                    
                    customDropdown.style.display = 'none';
                });
                
                customDropdown.appendChild(item);
            }
        });
    }
    
    // Show custom dropdown when clicking on search input
    searchInput.addEventListener('click', function(e) {
        e.stopPropagation();
        updateCustomDropdown();
        customDropdown.style.display = 'block';
    });
    
    // Update custom dropdown when search input changes
    searchInput.addEventListener('input', function() {
        updateCustomDropdown();
        customDropdown.style.display = 'block';
    });
    
    // Hide dropdown when clicking outside
    document.addEventListener('click', function() {
        customDropdown.style.display = 'none';
    });
    
    // Prevent clicks inside the dropdown from closing it
    customDropdown.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Prevent clicks inside the search input from closing the dropdown
    searchInput.addEventListener('click', function(e) {
        e.stopPropagation();
    });
}
        } else {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to add new area');
        }
    } catch (error) {
        console.error('Error adding new area:', error);
        showNotification(`Error adding new area: ${error.message}`, true);
    } finally {
        hideLoader();
    }
}

// Add global Alt+C shortcut handler for enhanced dropdowns
document.addEventListener('keydown', function(e) {
    // Check if Alt+C was pressed
    if (e.altKey && e.key === 'c') {
        e.preventDefault();
        e.stopPropagation();
        
        // Get the active/focused element
        const activeElement = document.activeElement;
        
        // First, check if it's a dropdown search input
        if (activeElement && activeElement.classList.contains('dropdown-search-input')) {
            const selectId = activeElement.getAttribute('data-original-select');
            handleAltCForDropdown(selectId, activeElement);
            return;
        }
        
        // If not, check if we're inside a dropdown results container
        if (activeElement && (activeElement.closest('.dropdown-results-container') || 
            activeElement.classList.contains('dropdown-results-container'))) {
            
            // Find the parent wrapper and then the search input
            const wrapper = activeElement.closest('.searchable-dropdown-wrapper');
            if (wrapper) {
                const searchInput = wrapper.querySelector('.dropdown-search-input');
                if (searchInput) {
                    const selectId = searchInput.getAttribute('data-original-select');
                    handleAltCForDropdown(selectId, searchInput);
                    return;
                }
            }
        }
        
        // If we're not in a dropdown or its results, check if we're in a form field
        // that might be associated with a dropdown
        if (activeElement && activeElement.tagName === 'INPUT') {
            // Check if there's a dropdown with this ID
            const selectId = activeElement.id;
            handleAltCForDropdown(selectId, activeElement);
        }
    }
});

// Helper function to handle Alt+C for a dropdown
function handleAltCForDropdown(selectId, inputElement) {
    if (!selectId) return;
    
    // Find the dropdown configuration for this select element
    const dropdownConfig = dropdowns.find(d => d.id === selectId);
    if (dropdownConfig) {
        const selectElement = document.getElementById(selectId);
        if (selectElement) {
            // Call the create function with the original select element
            dropdownConfig.createFunction(selectElement);
            
            // Hide any open results containers
            const allResultsContainers = document.querySelectorAll('.dropdown-results-container');
            allResultsContainers.forEach(container => {
                container.style.display = 'none';
            });
            
            // Return focus to the input element
            if (inputElement) {
                setTimeout(() => {
                    inputElement.focus();
                }, 100);
            }
        }
    }
}