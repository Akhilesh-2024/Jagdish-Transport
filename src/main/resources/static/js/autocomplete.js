/**
 * Autocomplete functionality for Trip Voucher form
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize autocomplete for all fields with the autocomplete-field class
    const autocompleteFields = document.querySelectorAll('.autocomplete-field');
    autocompleteFields.forEach(field => {
        setupAutocomplete(field);
    });
});

/**
 * Setup autocomplete functionality for a field
 * @param {HTMLElement} field - The input field to set up autocomplete for
 */
function setupAutocomplete(field) {
    // Create wrapper if it doesn't exist
    if (!field.parentElement.classList.contains('autocomplete-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'autocomplete-wrapper';
        field.parentNode.insertBefore(wrapper, field);
        wrapper.appendChild(field);
    }
    
    // Create results container
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'autocomplete-results';
    field.parentNode.appendChild(resultsContainer);
    
    // Add event listeners
    field.addEventListener('input', debounce(function() {
        const query = this.value.trim();
        if (query.length >= 1) {
            fetchSuggestions(this, query, resultsContainer);
        } else {
            resultsContainer.style.display = 'none';
        }
    }, 300));
    
    field.addEventListener('focus', function() {
        // Show suggestions even if the field is empty
        fetchSuggestions(this, this.value.trim() || ' ', resultsContainer);
    });
    
    // Close results when clicking outside
    document.addEventListener('click', function(e) {
        if (!field.parentNode.contains(e.target)) {
            resultsContainer.style.display = 'none';
        }
    });
    
    // Handle keyboard navigation
    field.addEventListener('keydown', function(e) {
        if (resultsContainer.style.display === 'none') return;
        
        const items = resultsContainer.querySelectorAll('.autocomplete-item');
        if (items.length === 0) return;
        
        let activeItem = resultsContainer.querySelector('.autocomplete-item.active');
        const activeIndex = Array.from(items).indexOf(activeItem);
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (activeItem) {
                    activeItem.classList.remove('active');
                    const nextIndex = (activeIndex + 1) % items.length;
                    items[nextIndex].classList.add('active');
                    ensureVisible(items[nextIndex], resultsContainer);
                } else {
                    items[0].classList.add('active');
                    ensureVisible(items[0], resultsContainer);
                }
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                if (activeItem) {
                    activeItem.classList.remove('active');
                    const prevIndex = (activeIndex - 1 + items.length) % items.length;
                    items[prevIndex].classList.add('active');
                    ensureVisible(items[prevIndex], resultsContainer);
                } else {
                    items[items.length - 1].classList.add('active');
                    ensureVisible(items[items.length - 1], resultsContainer);
                }
                break;
                
            case 'Enter':
                e.preventDefault();
                if (activeItem) {
                    // If there's an active item, select it
                    selectItem(field, activeItem.dataset.value, activeItem.textContent);
                    resultsContainer.style.display = 'none';
                } else {
                    // If no item is active but there are results, select the first one
                    const firstItem = items[0];
                    if (firstItem) {
                        selectItem(field, firstItem.dataset.value, firstItem.textContent);
                        resultsContainer.style.display = 'none';
                    }
                }
                break;
                
            case 'Escape':
                resultsContainer.style.display = 'none';
                break;
        }
    });
}

/**
 * Fetch suggestions from the server based on the field's data-source attribute
 * @param {HTMLElement} field - The input field
 * @param {string} query - The search query
 * @param {HTMLElement} resultsContainer - The container to display results in
 */
function fetchSuggestions(field, query, resultsContainer) {
    const source = field.dataset.source;
    let endpoint = '';
    
    // Determine the endpoint based on the data-source attribute
    switch (source) {
        case 'vehicle-master':
            endpoint = '/vehicle-master/search?query=' + encodeURIComponent(query);
            break;
        case 'vehicle-type-master':
            endpoint = '/vehicle-type-master/search?query=' + encodeURIComponent(query);
            break;
        case 'from-to-master':
            endpoint = '/location-master/search?query=' + encodeURIComponent(query);
            break;
        case 'party-master':
            endpoint = '/party-master/search?query=' + encodeURIComponent(query);
            break;
        case 'area-master':
            endpoint = '/area-master/search?query=' + encodeURIComponent(query);
            break;
        default:
            console.error('Unknown data source:', source);
            return;
    }
    
    // Show loading indicator
    resultsContainer.innerHTML = '<div class="autocomplete-item">Loading...</div>';
    resultsContainer.style.display = 'block';
    
    // Log the endpoint for debugging
    console.log('Fetching suggestions from:', endpoint);
    
    // Fetch suggestions from the server
    fetch(endpoint)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log('Received data for ' + source + ':', data);
            displaySuggestions(field, data, resultsContainer);
        })
        .catch(error => {
            console.error('Error fetching suggestions:', error);
            resultsContainer.innerHTML = '<div class="autocomplete-item">Error loading suggestions</div>';
        });
}

/**
 * Display suggestions in the results container
 * @param {HTMLElement} field - The input field
 * @param {Array} data - The suggestions data
 * @param {HTMLElement} resultsContainer - The container to display results in
 */
function displaySuggestions(field, data, resultsContainer) {
    resultsContainer.innerHTML = '';
    
    if (data.length === 0) {
        resultsContainer.innerHTML = '<div class="autocomplete-item">No matches found</div>';
        return;
    }
    
    // If there's exactly one match and it exactly matches the input, select it automatically
    if (data.length === 1) {
        const source = field.dataset.source;
        let textField;
        
        switch (source) {
            case 'vehicle-master': textField = 'vehicleNumber'; break;
            case 'vehicle-type-master': textField = 'vehicleType'; break;
            case 'from-to-master': textField = 'locationName'; break;
            case 'party-master': textField = 'companyName'; break;
            case 'area-master': textField = 'areaName'; break;
            default: textField = null;
        }
        
        if (textField && data[0][textField] && 
            data[0][textField].toLowerCase() === field.value.toLowerCase()) {
            selectItem(field, data[0].id || data[0][textField], data[0][textField]);
            resultsContainer.style.display = 'none';
            return;
        }
    }
    
    const source = field.dataset.source;
    let idField, textField;
    
    // Determine the fields to use based on the data-source attribute
    switch (source) {
        case 'vehicle-master':
            idField = 'id';
            textField = 'vehicleNumber';
            break;
        case 'vehicle-type-master':
            idField = 'id';
            textField = 'vehicleType';
            break;
        case 'from-to-master':
            idField = 'id';
            textField = 'locationName';
            break;
        case 'party-master':
            idField = 'id';
            textField = 'companyName';
            break;
        case 'area-master':
            idField = 'id';
            textField = 'areaName';
            break;
        default:
            console.error('Unknown data source:', source);
            return;
    }
    
    // Log the data for debugging
    console.log('Received data:', data);
    
    // Create an item for each suggestion
    data.forEach((item, index) => {
        // Check if the item has the expected fields
        if (item && (item[textField] !== undefined)) {
            const div = document.createElement('div');
            div.className = 'autocomplete-item';
            // Highlight the first item automatically
            if (index === 0) {
                div.classList.add('active');
            }
            div.textContent = item[textField];
            div.dataset.value = item[idField] || item[textField]; // Use ID if available, otherwise use text
            
            div.addEventListener('click', function() {
                selectItem(field, div.dataset.value, item[textField]);
                resultsContainer.style.display = 'none';
            });
            
            resultsContainer.appendChild(div);
        } else {
            console.warn('Item missing expected field:', item);
        }
    });
    
    resultsContainer.style.display = 'block';
}

/**
 * Select an item from the suggestions
 * @param {HTMLElement} field - The input field
 * @param {string} value - The value to set
 * @param {string} text - The text to display
 */
function selectItem(field, value, text) {
    field.value = text;
    
    // Set the hidden field value
    const hiddenField = document.getElementById(field.id + '_id');
    if (hiddenField) {
        hiddenField.value = value;
    }
    
    // Trigger change event
    const event = new Event('change', { bubbles: true });
    field.dispatchEvent(event);
    
    // If this is the vehicle type field, update rates
    if (field.id === 'vehicleType') {
        if (typeof updateRates === 'function') {
            updateRates();
        }
        if (typeof fetchFreightRates === 'function') {
            fetchFreightRates();
        }
    }
    
    // If this is the area name field, update freight rates
    if (field.id === 'areaName') {
        if (typeof fetchFreightRates === 'function') {
            fetchFreightRates();
        }
    }
}

/**
 * Ensure an element is visible within a scrollable container
 * @param {HTMLElement} element - The element to make visible
 * @param {HTMLElement} container - The scrollable container
 */
function ensureVisible(element, container) {
    const containerTop = container.scrollTop;
    const containerBottom = containerTop + container.clientHeight;
    const elementTop = element.offsetTop;
    const elementBottom = elementTop + element.clientHeight;
    
    if (elementTop < containerTop) {
        container.scrollTop = elementTop;
    } else if (elementBottom > containerBottom) {
        container.scrollTop = elementBottom - container.clientHeight;
    }
}

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - The function to debounce
 * @param {number} wait - The debounce wait time in milliseconds
 * @returns {Function} - The debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}