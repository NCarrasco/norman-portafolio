/**
 * Theme Module - Dark Mode Theme Management
 * Handles theme detection, persistence, and user preference management
 */

const ThemeModule = (() => {
  // ============================================================================
  // PRIVATE STATE
  // ============================================================================

  let currentTheme = 'light';
  const STORAGE_KEY = 'theme';
  const THEME_CLASS = 'dark-theme';
  const THEME_TOGGLE_SELECTOR = '[data-action="toggle-theme"]';

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Detect system color scheme preference
   * @returns {string} 'light' or 'dark'
   */
  function detectSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * Get stored theme preference
   * @returns {string|null} Stored theme or null if not found
   */
  function getStoredTheme() {
    return getStorage(STORAGE_KEY, null);
  }

  /**
   * Save theme preference to localStorage
   * @param {string} theme - Theme name ('light' or 'dark')
   */
  function saveThemePreference(theme) {
    setStorage(STORAGE_KEY, theme);
  }

  /**
   * Apply theme to DOM
   * @param {string} theme - Theme name ('light' or 'dark')
   */
  function applyTheme(theme) {
    const root = document.documentElement;

    if (theme === 'dark') {
      addClass(root, THEME_CLASS);
    } else {
      removeClass(root, THEME_CLASS);
    }

    // Update theme icons visibility
    updateThemeIcons(theme);

    // Update current state
    currentTheme = theme;

    // Dispatch custom event for other modules to listen
    document.dispatchEvent(
      new CustomEvent('theme:changed', {
        detail: { theme }
      })
    );
  }

  /**
   * Update sun/moon icon visibility
   * @param {string} theme - Current theme ('light' or 'dark')
   */
  function updateThemeIcons(theme) {
    const sunIcon = $('.theme-sun');
    const moonIcon = $('.theme-moon');

    if (!sunIcon || !moonIcon) return;

    if (theme === 'dark') {
      // Show moon in dark mode (to switch to light)
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    } else {
      // Show sun in light mode (to switch to dark)
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    }
  }

  /**
   * Initialize theme from storage or system preference
   */
  function initializeTheme() {
    // Check stored preference first
    let theme = getStoredTheme();

    // Fall back to system preference
    if (!theme) {
      theme = detectSystemPreference();
    }

    // Apply the determined theme
    applyTheme(theme);

    // Listen for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        // Only auto-apply if user hasn't set explicit preference
        if (!getStoredTheme()) {
          const newTheme = e.matches ? 'dark' : 'light';
          applyTheme(newTheme);
        }
      });
    }
  }

  /**
   * Toggle theme between light and dark
   */
  function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    saveThemePreference(newTheme);

    // Log theme change
    console.info(`[Theme] Switched to ${newTheme} mode`);
  }

  /**
   * Setup theme toggle button event listener
   */
  function setupToggleButton() {
    const toggleButton = $(THEME_TOGGLE_SELECTOR);

    if (!toggleButton) {
      console.warn(`[Theme] Toggle button not found: ${THEME_TOGGLE_SELECTOR}`);
      return;
    }

    // Add click event
    on(toggleButton, 'click', (e) => {
      e.preventDefault();
      toggleTheme();
    });

    // Add keyboard support (Enter/Space)
    on(toggleButton, 'keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTheme();
      }
    });

    // Ensure button is properly accessible
    if (!toggleButton.hasAttribute('role')) {
      toggleButton.setAttribute('role', 'button');
    }
    if (!toggleButton.hasAttribute('aria-label')) {
      toggleButton.setAttribute('aria-label', 'Toggle dark mode');
    }
    if (!toggleButton.hasAttribute('tabindex')) {
      toggleButton.setAttribute('tabindex', '0');
    }
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  return {
    /**
     * Initialize theme module
     * Called by app.js on startup
     * @param {Object} appState - Application state object
     */
    async init(appState) {
      try {
        console.info('[Theme] Initializing...');

        // Initialize theme from storage/system
        initializeTheme();

        // Setup toggle button
        setupToggleButton();

        // Update appState
        if (appState) {
          appState.set('theme', currentTheme);
        }

        console.info('[Theme] Initialized successfully');
      } catch (error) {
        console.error('[Theme] Initialization error:', error);
      }
    },

    /**
     * Get current theme
     * @returns {string} Current theme ('light' or 'dark')
     */
    getTheme() {
      return currentTheme;
    },

    /**
     * Set theme explicitly
     * @param {string} theme - Theme name ('light' or 'dark')
     */
    setTheme(theme) {
      if (theme !== 'light' && theme !== 'dark') {
        console.warn(`[Theme] Invalid theme: ${theme}`);
        return;
      }
      applyTheme(theme);
      saveThemePreference(theme);
    },

    /**
     * Toggle between light and dark theme
     */
    toggle() {
      toggleTheme();
    }
  };
})();

// Make module globally accessible
if (typeof window !== 'undefined') {
  window.ThemeModule = ThemeModule;
}
