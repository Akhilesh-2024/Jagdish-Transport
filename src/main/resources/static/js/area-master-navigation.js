/**
 * Custom keyboard navigation for Area Master page
 * This file overrides the default form-navigation.js behavior for the area-master page
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Area Master Navigation System Loading...");
    
    // Only run this script on the area-master page
    if (!window.location.href.includes('area-master')) {
        return;
    }
    
    // Listen for the party options initialized event
    document.addEventListener('partyOptionsInitialized', function() {
        console.log("Party options have been initialized, setting up keyboard navigation");
        makePartyOptionsFocusable();
    });
    
    // Define the field navigation order
    const fieldOrder = [
        'areaName',
        'vehicleType',
        'customVehicleType',
        'partySearch',
        'companyRate',
        'lorryRate',
        'areaDate',
        'addAreaBtn'
    ];
    
    // Get all form elements
    const form = document.getElementById('areaMasterForm');
    if (!form) return;
    
    // Disable the default form-navigation.js behavior for this page
    window.areaMasterCustomNavigation = true;
    
    // Add our custom keyboard navigation
    setupCustomNavigation();
    
    /**
     * Set up custom keyboard navigation for the area master form
     */
    function setupCustomNavigation() {
        // Prevent the default form submission
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const addAreaBtn = document.getElementById('addAreaBtn');
            if (addAreaBtn) addAreaBtn.click();
        });
        
        // Add event listeners to each field
        fieldOrder.forEach((fieldId, index) => {
            const field = document.getElementById(fieldId);
            if (!field) return;
            
            field.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Special handling for party search field
                    if (fieldId === 'partySearch') {
                        // Focus on the first party option
                        focusOnFirstPartyOption();
                        return;
                    }
                    
                    // If this is the last field or the areaDate field, submit the form
                    if (fieldId === 'areaDate' || index === fieldOrder.length - 1) {
                        const addAreaBtn = document.getElementById('addAreaBtn');
                        if (addAreaBtn) {
                            addAreaBtn.click();
                            return;
                        }
                    }
                    
                    // Otherwise, move to the next field
                    const nextFieldId = fieldOrder[index + 1];
                    if (nextFieldId) {
                        const nextField = document.getElementById(nextFieldId);
                        if (nextField) {
                            nextField.focus();
                            
                            // If it's an input field, select all text
                            if (nextField.tagName.toLowerCase() === 'input') {
                                nextField.select();
                            }
                            
                            // If it's a select element, open the dropdown
                            if (nextField.tagName.toLowerCase() === 'select') {
                                openDropdown(nextField);
                            }
                        }
                    }
                }
            }, true); // Use capturing phase to ensure our handler runs first
        });
        
        // Set up party options navigation
        setupPartyOptionsNavigation();
        
        console.log("✅ Area Master Custom Navigation Initialized");
    }
    
    /**
     * Set up keyboard navigation for party options
     */
    function setupPartyOptionsNavigation() {
        // Get the party options container
        const partyOptions = document.getElementById('partyOptions');
        if (!partyOptions) return;
        
        // Add keyboard navigation to the party options container
        partyOptions.addEventListener('keydown', function(e) {
            const options = document.querySelectorAll('#partyOptions .party-option');
            if (options.length === 0) return;
            
            // Find the currently focused option
            let focusedOption = document.activeElement.closest('.party-option');
            let focusedIndex = -1;
            
            if (focusedOption) {
                focusedIndex = Array.from(options).indexOf(focusedOption);
            }
            
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    // Move to the next option
                    if (focusedIndex < options.length - 1) {
                        focusNextPartyOption(focusedIndex + 1, options);
                    }
                    break;
                    
                case 'ArrowUp':
                    e.preventDefault();
                    // Move to the previous option
                    if (focusedIndex > 0) {
                        focusNextPartyOption(focusedIndex - 1, options);
                    } else {
                        // If at the top, go back to the search field
                        document.getElementById('partySearch').focus();
                    }
                    break;
                    
                case 'Enter':
                    e.preventDefault();
                    // Toggle the checkbox
                    if (focusedOption) {
                        const checkbox = focusedOption.querySelector('input[type="checkbox"]');
                        if (checkbox) {
                            // Toggle the checkbox state
                            checkbox.checked = !checkbox.checked;
                            
                            // Trigger change event to update UI
                            const changeEvent = new Event('change', { bubbles: true });
                            checkbox.dispatchEvent(changeEvent);
                            
                            // Add a visual indicator that the option was selected
                            focusedOption.classList.add('just-selected');
                            setTimeout(() => {
                                focusedOption.classList.remove('just-selected');
                            }, 500);
                            
                            console.log("Party option selected:", checkbox.value, "Checked:", checkbox.checked);
                            
                            // Move to the next field after selecting
                            setTimeout(() => {
                                const companyRateField = document.getElementById('companyRate');
                                if (companyRateField) {
                                    companyRateField.focus();
                                    companyRateField.select();
                                }
                            }, 100); // Small delay to ensure the selection is processed
                        }
                    }
                    break;
                    
                case 'Escape':
                    e.preventDefault();
                    // Go back to the search field
                    document.getElementById('partySearch').focus();
                    break;
            }
        }, true);
        
        // Make party options focusable and add keyboard events
        makePartyOptionsFocusable();
        
        // Add a mutation observer to handle dynamically added party options
        const partyOptionsContainer = document.getElementById('partyOptions');
        if (partyOptionsContainer) {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        // New party options were added, make them focusable
                        makePartyOptionsFocusable();
                    }
                });
            });
            
            observer.observe(partyOptionsContainer, { childList: true });
        }
    }
    
    /**
     * Make party options focusable and add keyboard events
     */
    function makePartyOptionsFocusable() {
        const options = document.querySelectorAll('#partyOptions .party-option');
        options.forEach(option => {
            // Make sure we don't add duplicate event listeners
            if (option.getAttribute('data-keyboard-enabled') === 'true') {
                return;
            }
            
            option.setAttribute('tabindex', '0');
            option.setAttribute('data-keyboard-enabled', 'true');
            
            // Add keyboard event for individual options
            option.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const checkbox = this.querySelector('input[type="checkbox"]');
                    if (checkbox) {
                        // Toggle the checkbox
                        checkbox.checked = !checkbox.checked;
                        
                        // Dispatch a bubbling change event
                        const changeEvent = new Event('change', { bubbles: true });
                        checkbox.dispatchEvent(changeEvent);
                        
                        // Add visual feedback
                        this.classList.add('just-selected');
                        setTimeout(() => {
                            this.classList.remove('just-selected');
                        }, 500);
                        
                        console.log("Party option selected via keyboard:", checkbox.value, "Checked:", checkbox.checked);
                        
                        // Move to the next field after a short delay
                        setTimeout(() => {
                            const companyRateField = document.getElementById('companyRate');
                            if (companyRateField) {
                                companyRateField.focus();
                                companyRateField.select();
                            }
                        }, 100);
                    }
                }
            });
        });
    }
    
    /**
     * Focus on the first party option
     */
    function focusOnFirstPartyOption() {
        // First, make sure the party options are visible
        const partyOptions = document.getElementById('partyOptions');
        if (partyOptions) {
            // Make sure the dropdown is visible
            const multiSelectDropdown = partyOptions.closest('.multiselect-dropdown');
            if (multiSelectDropdown) {
                multiSelectDropdown.style.display = 'block';
            }
            
            // Get all visible party options
            const options = Array.from(document.querySelectorAll('#partyOptions .party-option'))
                .filter(option => option.style.display !== 'none');
                
            if (options.length > 0) {
                // Focus on the first visible option
                options[0].focus();
                
                // Scroll to the top of the options
                partyOptions.scrollTop = 0;
                
                // Add a visual indicator that keyboard navigation is active
                document.body.classList.add('keyboard-navigation-active');
                
                console.log("Focused on first party option:", options[0].textContent);
            } else {
                console.log("No visible party options found");
            }
        } else {
            console.log("Party options container not found");
        }
    }
    
    /**
     * Focus on the next party option
     */
    function focusNextPartyOption(index, options) {
        if (index >= 0 && index < options.length) {
            options[index].focus();
            
            // Ensure the option is visible
            const partyOptions = document.getElementById('partyOptions');
            if (partyOptions) {
                const option = options[index];
                const optionTop = option.offsetTop;
                const optionHeight = option.offsetHeight;
                const containerHeight = partyOptions.offsetHeight;
                const scrollTop = partyOptions.scrollTop;
                
                // If the option is below the visible area
                if (optionTop + optionHeight > scrollTop + containerHeight) {
                    partyOptions.scrollTop = optionTop + optionHeight - containerHeight;
                }
                // If the option is above the visible area
                else if (optionTop < scrollTop) {
                    partyOptions.scrollTop = optionTop;
                }
            }
        }
    }
    
    /**
     * Helper function to open a dropdown
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
});

// Override the form-navigation.js functions for area-master page
document.addEventListener('DOMContentLoaded', function() {
    // Only run this script on the area-master page
    if (!window.location.href.includes('area-master')) {
        return;
    }
    
    // Override the setupMasterPagesKeyboardNavigation function
    const originalSetupMasterPagesKeyboardNavigation = window.setupMasterPagesKeyboardNavigation;
    window.setupMasterPagesKeyboardNavigation = function() {
        console.log("🛑 Preventing default master page navigation for area-master");
        // Do nothing for area-master page
    };
    
    // Override the handleMasterPageEnterKey function
    const originalHandleMasterPageEnterKey = window.handleMasterPageEnterKey;
    window.handleMasterPageEnterKey = function(element, currentPage, allElements, currentIndex) {
        if (currentPage === 'area-master') {
            console.log("🛑 Preventing default master page Enter key handling for area-master");
            return; // Do nothing for area-master page
        }
        
        // Call the original function for other pages
        if (originalHandleMasterPageEnterKey) {
            originalHandleMasterPageEnterKey(element, currentPage, allElements, currentIndex);
        }
    };
});