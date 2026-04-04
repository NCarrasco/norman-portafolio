/**
 * Portfolio Application
 * Main entry point for module initialization
 * HTML components are inlined in index.html — no fetch() calls needed
 */

// ============================================================================
// GLOBAL STATE MANAGEMENT
// ============================================================================

/**
 * Application state object
 * Holds shared data accessible across all modules
 */
const appState = {
  // UI states
  theme: getStorage('theme', 'light'),
  mobileMenuOpen: false,

  // Portfolio data
  data: {
    projects: [],
    experience: [],
    skills: [],
    testimonials: []
  },

  // Search and filter states
  searchQuery: '',
  selectedFilters: [],

  /**
   * Get state value
   * @param {string} key - State key path (supports dot notation)
   * @returns {*} State value
   */
  get(key) {
    const keys = key.split('.');
    let value = this;
    for (const k of keys) {
      value = value[k];
      if (value === undefined) return undefined;
    }
    return value;
  },

  /**
   * Set state value and trigger update
   * @param {string} key - State key path (supports dot notation)
   * @param {*} value - New value
   */
  set(key, value) {
    const keys = key.split('.');
    let obj = this;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in obj)) {
        obj[k] = {};
      }
      obj = obj[k];
    }

    obj[keys[keys.length - 1]] = value;
  }
};

// ============================================================================
// DATA LOADING
// ============================================================================

/**
 * Load all portfolio data into appState
 * Data is read from the inline DOM since components are baked into index.html
 */
async function loadPortfolioData() {
  try {
    console.info('Loading portfolio data from DOM...');

    // Make data globally accessible for modules
    window.portfolioData = appState.data;

    console.info('Portfolio data ready');
    return true;
  } catch (error) {
    console.error('Failed to load portfolio data:', error);
    return false;
  }
}

// ============================================================================
// MODULE INITIALIZATION
// ============================================================================

/**
 * Initialize all application modules
 * Modules must expose an init() function
 */
async function initializeModules() {
  try {
    console.info('Initializing modules...');

    // Initialize modules in order of dependency
    const modules = [
      { name: 'theme', obj: window.ThemeModule },
      { name: 'animations', obj: window.AnimationsModule },
      { name: 'form', obj: window.FormModule },
      { name: 'filters', obj: window.FiltersModule },
      { name: 'search', obj: window.SearchModule }
    ];

    for (const { name, obj } of modules) {
      if (!obj || typeof obj.init !== 'function') {
        console.warn(`Module not found or missing init(): ${name}`);
        continue;
      }

      try {
        await obj.init(appState);
        console.info(`Initialized module: ${name}`);
      } catch (error) {
        console.error(`Failed to initialize module ${name}:`, error);
      }
    }

    console.info('All modules initialized');
  } catch (error) {
    console.error('Error initializing modules:', error);
  }
}

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

/**
 * Initialize entire application
 * Called when DOM is ready
 */
async function initializeApp() {
  try {
    console.info('Initializing portfolio application...');

    // Step 1: Load portfolio data
    const dataLoaded = await loadPortfolioData();
    if (!dataLoaded) {
      console.error('Failed to load portfolio data. Some features may not work.');
    }

    // Step 2: Initialize all modules (DOM is already populated inline)
    await initializeModules();

    // Step 3: Additional initialization
    setupGlobalErrorHandling();

    // Emit custom event for any additional setup
    document.dispatchEvent(new CustomEvent('app:ready', { detail: appState }));

    console.info('Application initialization complete');
  } catch (error) {
    console.error('Critical error during app initialization:', error);
    showFallbackContent();
  }
}

// ============================================================================
// ERROR HANDLING & RECOVERY
// ============================================================================

/**
 * Setup global error handling
 */
function setupGlobalErrorHandling() {
  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });
}

/**
 * Show fallback content if app fails to load
 */
function showFallbackContent() {
  const main = $('#main-content');
  if (main) {
    main.innerHTML = `
      <div class="error-container" style="padding: 2rem; text-align: center;">
        <h2>Unable to Load Application</h2>
        <p>We encountered an error while loading the application. Please try refreshing the page.</p>
        <button onclick="location.reload()" style="padding: 0.5rem 1rem; margin-top: 1rem;">
          Refresh Page
        </button>
      </div>
    `;
  }
}

// ============================================================================
// DOM READY - START APPLICATION
// ============================================================================

/**
 * Wait for DOM to be ready, then initialize app
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM is already ready
  initializeApp();
}

// ============================================================================
// GLOBAL EXPORTS
// ============================================================================

// Make appState and utilities available globally for debugging and module access
if (typeof window !== 'undefined') {
  window.appState = appState;
  window.portfolioApp = {
    initializeApp,
    loadPortfolioData,
    initializeModules,
    state: appState
  };
}
