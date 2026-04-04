/**
 * Portfolio Utilities Library
 * Provides reusable DOM, string, array, and storage helper functions
 */

// ============================================================================
// DOM HELPERS
// ============================================================================

/**
 * Query selector wrapper - returns single element
 * @param {string} selector - CSS selector
 * @returns {Element|null} First matching element or null
 */
function $(selector) {
  if (typeof selector !== 'string') return null;
  return document.querySelector(selector);
}

/**
 * Query selector all wrapper - returns NodeList
 * @param {string} selector - CSS selector
 * @returns {NodeList} All matching elements
 */
function $$(selector) {
  if (typeof selector !== 'string') return [];
  return document.querySelectorAll(selector);
}

/**
 * Add class to element
 * @param {Element} el - DOM element
 * @param {string} className - Class name to add
 */
function addClass(el, className) {
  if (!el || typeof className !== 'string') return;
  el.classList.add(...className.split(/\s+/).filter(Boolean));
}

/**
 * Remove class from element
 * @param {Element} el - DOM element
 * @param {string} className - Class name to remove
 */
function removeClass(el, className) {
  if (!el || typeof className !== 'string') return;
  el.classList.remove(...className.split(/\s+/).filter(Boolean));
}

/**
 * Toggle class on element
 * @param {Element} el - DOM element
 * @param {string} className - Class name to toggle
 * @param {boolean} force - Optional force add (true) or remove (false)
 */
function toggleClass(el, className, force) {
  if (!el || typeof className !== 'string') return;
  el.classList.toggle(className, force);
}

/**
 * Check if element has class
 * @param {Element} el - DOM element
 * @param {string} className - Class name to check
 * @returns {boolean} True if element has class
 */
function hasClass(el, className) {
  if (!el || typeof className !== 'string') return false;
  return el.classList.contains(className);
}

/**
 * Add event listener to element
 * @param {Element} el - DOM element
 * @param {string} event - Event name (e.g., 'click', 'change')
 * @param {Function} callback - Event handler function
 * @returns {Function} Callback for potential removal
 */
function on(el, event, callback) {
  if (!el || typeof event !== 'string' || typeof callback !== 'function') return;
  el.addEventListener(event, callback);
  return callback;
}

/**
 * Remove event listener from element
 * @param {Element} el - DOM element
 * @param {string} event - Event name
 * @param {Function} callback - Event handler function
 */
function off(el, event, callback) {
  if (!el || typeof event !== 'string' || typeof callback !== 'function') return;
  el.removeEventListener(event, callback);
}

/**
 * Create new DOM element with optional class and content
 * @param {string} tag - HTML tag name (e.g., 'div', 'span')
 * @param {string} className - Optional class name(s)
 * @param {string} innerHTML - Optional inner HTML
 * @returns {Element} New DOM element
 */
function create(tag, className = '', innerHTML = '') {
  if (typeof tag !== 'string') return null;
  const el = document.createElement(tag);
  if (className) addClass(el, className);
  if (innerHTML) el.innerHTML = innerHTML;
  return el;
}

/**
 * Append child element to parent
 * @param {Element} parent - Parent DOM element
 * @param {Element|string} child - Child element or HTML string
 */
function append(parent, child) {
  if (!parent) return;
  if (typeof child === 'string') {
    parent.insertAdjacentHTML('beforeend', child);
  } else {
    parent.appendChild(child);
  }
}

/**
 * Remove element from DOM
 * @param {Element} el - DOM element to remove
 */
function remove(el) {
  if (!el) return;
  el.remove();
}

// ============================================================================
// STRING HELPERS
// ============================================================================

/**
 * Convert string to URL-friendly slug
 * @param {string} str - String to slugify
 * @returns {string} Slugified string
 */
function slugify(str) {
  if (typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalize(str) {
  if (typeof str !== 'string' || str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate string with ellipsis
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix (default '...')
 * @returns {string} Truncated string
 */
function truncate(str, length = 50, suffix = '...') {
  if (typeof str !== 'string' || length <= 0) return str;
  if (str.length <= length) return str;
  return str.slice(0, length).trimEnd() + suffix;
}

/**
 * Highlight matches in text by wrapping in <mark> tags
 * @param {string} text - Text to search in
 * @param {string} query - Search query
 * @returns {string} HTML with highlighted matches
 */
function highlightMatches(text, query) {
  if (typeof text !== 'string' || typeof query !== 'string' || !query) {
    return text;
  }
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// ============================================================================
// ARRAY HELPERS
// ============================================================================

/**
 * Remove duplicate items from array
 * @param {Array} arr - Array to process
 * @returns {Array} Array with unique items
 */
function unique(arr) {
  if (!Array.isArray(arr)) return [];
  return [...new Set(arr)];
}

/**
 * Flatten nested array
 * @param {Array} arr - Array to flatten
 * @param {number} depth - Depth to flatten (default 1)
 * @returns {Array} Flattened array
 */
function flatten(arr, depth = 1) {
  if (!Array.isArray(arr)) return [];
  return arr.flat(depth);
}

/**
 * Group array items by property value
 * @param {Array} arr - Array to group
 * @param {string|Function} key - Property name or getter function
 * @returns {Object} Object with groups as properties
 */
function groupBy(arr, key) {
  if (!Array.isArray(arr)) return {};

  return arr.reduce((groups, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {});
}

/**
 * Debounce function - delays execution until calls stop
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(fn, delay = 300) {
  if (typeof fn !== 'function' || delay < 0) return fn;

  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Throttle function - limits execution frequency
 * @param {Function} fn - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(fn, delay = 300) {
  if (typeof fn !== 'function' || delay < 0) return fn;

  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}

// ============================================================================
// STORAGE HELPERS
// ============================================================================

/**
 * Get value from localStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key not found
 * @returns {*} Stored value or default
 */
function getStorage(key, defaultValue = null) {
  if (typeof key !== 'string') return defaultValue;

  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;
    return JSON.parse(stored);
  } catch (e) {
    console.warn(`Failed to parse storage key "${key}":`, e);
    return defaultValue;
  }
}

/**
 * Set value in localStorage
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 */
function setStorage(key, value) {
  if (typeof key !== 'string') return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to set storage key "${key}":`, e);
  }
}

/**
 * Remove value from localStorage
 * @param {string} key - Storage key
 */
function removeStorage(key) {
  if (typeof key !== 'string') return;

  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn(`Failed to remove storage key "${key}":`, e);
  }
}

// ============================================================================
// FORMAT HELPERS
// ============================================================================

/**
 * Format date as "Month Year" (e.g., "Dec 2024")
 * @param {string|Date} date - Date string or Date object
 * @returns {string} Formatted date
 */
function formatDate(date) {
  if (!date) return '';

  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    const options = { month: 'short', year: 'numeric' };
    return d.toLocaleDateString('en-US', options);
  } catch (e) {
    console.warn('Failed to format date:', e);
    return '';
  }
}

/**
 * Format date range (e.g., "Dec 2020 - Jan 2024")
 * @param {string|Date} start - Start date
 * @param {string|Date} end - End date (or 'Present')
 * @returns {string} Formatted date range
 */
function formatDateRange(start, end) {
  if (!start) return '';

  try {
    const startStr = formatDate(start);
    const endStr = (typeof end === 'string' && end.toLowerCase() === 'present')
      ? 'Present'
      : formatDate(end);

    return end ? `${startStr} - ${endStr}` : startStr;
  } catch (e) {
    console.warn('Failed to format date range:', e);
    return '';
  }
}

// ============================================================================
// EXPORT / GLOBAL ASSIGNMENT
// ============================================================================

// Make utilities available globally
if (typeof window !== 'undefined') {
  window.$ = $;
  window.$$ = $$;
  window.addClass = addClass;
  window.removeClass = removeClass;
  window.toggleClass = toggleClass;
  window.hasClass = hasClass;
  window.on = on;
  window.off = off;
  window.create = create;
  window.append = append;
  window.remove = remove;
  window.slugify = slugify;
  window.capitalize = capitalize;
  window.truncate = truncate;
  window.highlightMatches = highlightMatches;
  window.unique = unique;
  window.flatten = flatten;
  window.groupBy = groupBy;
  window.debounce = debounce;
  window.throttle = throttle;
  window.getStorage = getStorage;
  window.setStorage = setStorage;
  window.removeStorage = removeStorage;
  window.formatDate = formatDate;
  window.formatDateRange = formatDateRange;
}
