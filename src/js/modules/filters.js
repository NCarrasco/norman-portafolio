/**
 * Filters Module - Interactive Filtering System
 * Provides dynamic filter UI for projects, skills, and experience
 * Stores filter state in URL query params for shareability
 */

const FiltersModule = (() => {
  // ============================================================================
  // PRIVATE STATE
  // ============================================================================

  let filters = {};
  let activeFilters = [];
  let filterContainers = {};
  const TRANSITION_DURATION = 300;

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Get all unique categories from portfolio data
   * @param {Array} items - Array of portfolio items (projects, skills, etc.)
   * @param {string} categoryKey - Key for category field
   * @returns {Array} Unique category names
   */
  function getCategories(items, categoryKey) {
    if (!Array.isArray(items)) return [];

    const categories = new Set();
    items.forEach((item) => {
      if (item[categoryKey]) {
        categories.add(item[categoryKey]);
      }
    });

    return Array.from(categories).sort();
  }

  /**
   * Get all unique tags from items
   * @param {Array} items - Array of items
   * @returns {Array} Unique tag names
   */
  function getTags(items) {
    if (!Array.isArray(items)) return [];

    const tags = new Set();
    items.forEach((item) => {
      if (Array.isArray(item.tags)) {
        item.tags.forEach((tag) => tags.add(tag));
      }
    });

    return Array.from(tags).sort();
  }

  /**
   * Create filter button element
   * @param {string} filterValue - Filter value
   * @param {string} filterId - Unique filter identifier
   * @returns {Element} Filter button element
   */
  function createFilterButton(filterValue, filterId) {
    const button = create('button', 'filter-btn');
    button.setAttribute('data-filter', filterId);
    button.setAttribute('data-filter-value', filterValue);
    button.textContent = filterValue;

    // Add ARIA attributes for accessibility
    button.setAttribute('aria-label', `Filter by ${filterValue}`);
    button.setAttribute('aria-pressed', 'false');

    return button;
  }

  /**
   * Create filter UI for a category
   * @param {string} categoryName - Display name for category
   * @param {string} categoryId - Identifier for category
   * @param {Array} options - Filter options to display
   * @returns {Element} Filter container element
   */
  function createFilterCategory(categoryName, categoryId, options) {
    const container = create('div', 'filter-category');
    container.setAttribute('data-category', categoryId);

    // Category title
    const title = create('h4', 'filter-category-title');
    title.textContent = categoryName;
    append(container, title);

    // Filter buttons container
    const buttonsContainer = create('div', 'filter-buttons');
    options.forEach((option) => {
      const filterId = `${categoryId}-${slugify(option)}`;
      const button = createFilterButton(option, filterId);
      on(button, 'click', () => toggleFilter(filterId, option, categoryId));
      append(buttonsContainer, button);
    });

    append(container, buttonsContainer);
    return container;
  }

  /**
   * Toggle filter on/off
   * @param {string} filterId - Filter identifier
   * @param {string} filterValue - Filter display value
   * @param {string} categoryId - Filter category
   */
  function toggleFilter(filterId, filterValue, categoryId) {
    const index = activeFilters.findIndex((f) => f.id === filterId);

    if (index > -1) {
      // Remove filter
      activeFilters.splice(index, 1);
      const button = $(`[data-filter="${filterId}"]`);
      if (button) {
        removeClass(button, 'active');
        button.setAttribute('aria-pressed', 'false');
      }
    } else {
      // Add filter
      activeFilters.push({
        id: filterId,
        value: filterValue,
        category: categoryId
      });
      const button = $(`[data-filter="${filterId}"]`);
      if (button) {
        addClass(button, 'active');
        button.setAttribute('aria-pressed', 'true');
      }
    }

    // Update URL and apply filters
    updateURLParams();
    applyFilters();
    updateFilterCounter();
  }

  /**
   * Apply active filters to content
   */
  function applyFilters() {
    const filterData = window.portfolioData;
    if (!filterData) return;

    // Handle project filtering
    if (filterData.projects && filterData.projects.length > 0) {
      filterProjectItems(filterData.projects);
    }

    // Handle skills filtering
    if (filterData.skills && filterData.skills.length > 0) {
      filterSkillItems(filterData.skills);
    }

    // Handle experience filtering
    if (filterData.experience && filterData.experience.length > 0) {
      filterExperienceItems(filterData.experience);
    }

    // Trigger filter animation
    animateFilterTransition();
  }

  /**
   * Filter project items based on active filters
   * @param {Array} projects - Projects array
   */
  function filterProjectItems(projects) {
    const projectContainer = $('[data-filter-container="projects"]');
    if (!projectContainer) return;

    const projectCards = projectContainer.querySelectorAll('[data-project-id]');

    projectCards.forEach((card) => {
      const projectId = parseInt(card.getAttribute('data-project-id'), 10);
      const project = projects.find((p) => p.id === projectId);

      if (!project) return;

      const categoryFilter = activeFilters.filter((f) => f.category === 'project-category');
      const tagFilters = activeFilters.filter((f) => f.category === 'project-tags');

      let shouldShow = true;

      // Check category filters
      if (categoryFilter.length > 0) {
        shouldShow = categoryFilter.some((f) => f.value === project.category);
      }

      // Check tag filters (if category passed)
      if (shouldShow && tagFilters.length > 0) {
        shouldShow = tagFilters.some((f) => project.tags?.includes(f.value));
      }

      // Apply visibility
      if (shouldShow) {
        removeClass(card, 'filter-hidden');
        addClass(card, 'filter-visible');
      } else {
        addClass(card, 'filter-hidden');
        removeClass(card, 'filter-visible');
      }
    });
  }

  /**
   * Filter skill items based on active filters
   * @param {Array} skills - Skills array (array of category objects)
   */
  function filterSkillItems(skills) {
    const skillContainer = $('[data-filter-container="skills"]');
    if (!skillContainer) return;

    const skillCategories = skillContainer.querySelectorAll('[data-skill-category]');

    skillCategories.forEach((categoryEl) => {
      const categoryName = categoryEl.getAttribute('data-skill-category');
      const skillItems = categoryEl.querySelectorAll('[data-skill-name]');

      let categoryHasVisibleItems = false;

      skillItems.forEach((skillEl) => {
        const skillName = skillEl.getAttribute('data-skill-name');
        const categoryFilter = activeFilters.filter((f) => f.category === 'skill-category');

        let shouldShow = true;
        if (categoryFilter.length > 0) {
          shouldShow = categoryFilter.some((f) => f.value === categoryName);
        }

        if (shouldShow) {
          removeClass(skillEl, 'filter-hidden');
          addClass(skillEl, 'filter-visible');
          categoryHasVisibleItems = true;
        } else {
          addClass(skillEl, 'filter-hidden');
          removeClass(skillEl, 'filter-visible');
        }
      });

      // Hide category if no items visible
      if (categoryFilter.length > 0) {
        if (categoryHasVisibleItems) {
          removeClass(categoryEl, 'filter-hidden');
        } else {
          addClass(categoryEl, 'filter-hidden');
        }
      }
    });
  }

  /**
   * Filter experience items based on active filters
   * @param {Array} experience - Experience array
   */
  function filterExperienceItems(experience) {
    const experienceContainer = $('[data-filter-container="experience"]');
    if (!experienceContainer) return;

    const experienceCards = experienceContainer.querySelectorAll('[data-experience-id]');

    experienceCards.forEach((card) => {
      const experienceId = parseInt(card.getAttribute('data-experience-id'), 10);
      const exp = experience.find((e) => e.id === experienceId);

      if (!exp) return;

      const positionFilter = activeFilters.filter((f) => f.category === 'experience-position');
      const companyFilter = activeFilters.filter((f) => f.category === 'experience-company');

      let shouldShow = true;

      // Check position filters
      if (positionFilter.length > 0) {
        shouldShow = positionFilter.some((f) => f.value === exp.position);
      }

      // Check company filters
      if (shouldShow && companyFilter.length > 0) {
        shouldShow = companyFilter.some((f) => f.value === exp.company);
      }

      if (shouldShow) {
        removeClass(card, 'filter-hidden');
        addClass(card, 'filter-visible');
      } else {
        addClass(card, 'filter-hidden');
        removeClass(card, 'filter-visible');
      }
    });
  }

  /**
   * Animate filter transitions
   */
  function animateFilterTransition() {
    const visibleItems = $$('.filter-visible');
    const hiddenItems = $$('.filter-hidden');

    visibleItems.forEach((item) => {
      item.style.transition = `opacity ${TRANSITION_DURATION}ms ease-in-out`;
      item.style.opacity = '1';
      item.style.display = '';
    });

    hiddenItems.forEach((item) => {
      item.style.transition = `opacity ${TRANSITION_DURATION}ms ease-in-out`;
      item.style.opacity = '0';
      setTimeout(() => {
        item.style.display = 'none';
      }, TRANSITION_DURATION);
    });
  }

  /**
   * Update filter counter display
   */
  function updateFilterCounter() {
    const counterElements = $$('[data-filter-counter]');

    counterElements.forEach((counter) => {
      const containerType = counter.getAttribute('data-filter-counter');
      const container = $(`[data-filter-container="${containerType}"]`);

      if (!container) return;

      const totalItems = container.querySelectorAll('[data-project-id], [data-skill-name], [data-experience-id]').length;
      const visibleItems = container.querySelectorAll('.filter-visible').length;

      counter.textContent = `${visibleItems} of ${totalItems} items shown`;

      // Show/hide counter based on active filters
      if (activeFilters.length > 0) {
        counter.style.display = 'block';
      } else {
        counter.style.display = 'none';
      }
    });
  }

  /**
   * Update URL parameters to reflect current filters
   */
  function updateURLParams() {
    const filterParams = activeFilters
      .map((f) => f.id)
      .join(',');

    const url = new URL(window.location);
    if (filterParams) {
      url.searchParams.set('filters', filterParams);
    } else {
      url.searchParams.delete('filters');
    }

    window.history.replaceState({}, '', url);
  }

  /**
   * Load filters from URL params
   */
  function loadFiltersFromURL() {
    const url = new URL(window.location);
    const filterParams = url.searchParams.get('filters');

    if (!filterParams) return;

    const filterIds = filterParams.split(',');
    filterIds.forEach((filterId) => {
      const button = $(`[data-filter="${filterId}"]`);
      if (button) {
        const filterValue = button.getAttribute('data-filter-value');
        const categoryId = button.closest('[data-category]')?.getAttribute('data-category');
        if (filterValue && categoryId) {
          toggleFilter(filterId, filterValue, categoryId);
        }
      }
    });
  }

  /**
   * Reset all active filters
   */
  function resetFilters() {
    activeFilters = [];

    // Remove active class from all buttons
    const activeButtons = $$('.filter-btn.active');
    activeButtons.forEach((button) => {
      removeClass(button, 'active');
      button.setAttribute('aria-pressed', 'false');
    });

    // Show all items
    const allItems = $$('.filter-hidden, .filter-visible');
    allItems.forEach((item) => {
      removeClass(item, 'filter-hidden');
      removeClass(item, 'filter-visible');
      item.style.opacity = '1';
      item.style.display = '';
    });

    updateURLParams();
    updateFilterCounter();

    console.info('[Filters] All filters reset');
  }

  /**
   * Initialize filter UI for a content type
   * @param {string} containerSelector - Container element selector
   * @param {Array} items - Items to filter
   * @param {string} type - Type (projects, skills, experience)
   */
  function initializeFilterUI(containerSelector, items, type) {
    const filterContainer = $(containerSelector);
    if (!filterContainer) return;

    const filterUIContainer = create('div', 'filter-controls');
    filterUIContainer.setAttribute('data-filter-ui', type);

    let filterCategories = {};

    if (type === 'projects') {
      const categories = getCategories(items, 'category');
      const tags = getTags(items);

      filterCategories = {
        'project-category': { name: 'Category', options: categories },
        'project-tags': { name: 'Technology', options: tags }
      };
    } else if (type === 'skills') {
      const categories = items.map((cat) => cat.category);
      filterCategories = {
        'skill-category': { name: 'Skill Category', options: categories }
      };
    } else if (type === 'experience') {
      const positions = getCategories(items, 'position');
      const companies = getCategories(items, 'company');

      filterCategories = {
        'experience-position': { name: 'Position', options: positions },
        'experience-company': { name: 'Company', options: companies }
      };
    }

    // Create filter category sections
    Object.entries(filterCategories).forEach(([categoryId, { name, options }]) => {
      const categoryUI = createFilterCategory(name, categoryId, options);
      append(filterUIContainer, categoryUI);
    });

    // Add reset button
    const resetButton = create('button', 'filter-reset-btn');
    resetButton.textContent = 'Reset All Filters';
    resetButton.setAttribute('aria-label', 'Reset all filters');
    on(resetButton, 'click', resetFilters);
    append(filterUIContainer, resetButton);

    // Add counter
    const counter = create('div', 'filter-counter');
    counter.setAttribute('data-filter-counter', type);
    counter.style.display = 'none';
    append(filterUIContainer, counter);

    // Mark container for filtering
    filterContainer.setAttribute('data-filter-container', type);

    // Insert filter UI before content
    filterContainer.parentElement?.insertBefore(filterUIContainer, filterContainer);
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  return {
    /**
     * Initialize filters module
     * Called by app.js on startup
     * @param {Object} appState - Application state object
     */
    async init(appState) {
      try {
        console.info('[Filters] Initializing...');

        const portfolioData = window.portfolioData;
        if (!portfolioData) {
          console.warn('[Filters] Portfolio data not available');
          return;
        }

        // Initialize filter UI for projects
        if (portfolioData.projects?.length > 0) {
          initializeFilterUI('#projects', portfolioData.projects, 'projects');
          console.debug(`[Filters] Initialized projects filter with ${portfolioData.projects.length} items`);
        }

        // Initialize filter UI for skills
        if (portfolioData.skills?.length > 0) {
          initializeFilterUI('#skills', portfolioData.skills, 'skills');
          console.debug(`[Filters] Initialized skills filter`);
        }

        // Initialize filter UI for experience
        if (portfolioData.experience?.length > 0) {
          initializeFilterUI('#experience', portfolioData.experience, 'experience');
          console.debug(`[Filters] Initialized experience filter with ${portfolioData.experience.length} items`);
        }

        // Load filters from URL if present
        loadFiltersFromURL();

        // Update app state
        if (appState) {
          appState.set('filters.initialized', true);
          appState.set('filters.active', activeFilters);
        }

        console.info('[Filters] Initialized successfully');
      } catch (error) {
        console.error('[Filters] Initialization error:', error);
      }
    },

    /**
     * Get active filters
     * @returns {Array} Array of active filter objects
     */
    getActiveFilters() {
      return [...activeFilters];
    },

    /**
     * Set filters programmatically
     * @param {Array} filterArray - Array of filter IDs to activate
     */
    setFilters(filterArray) {
      resetFilters();

      if (!Array.isArray(filterArray)) return;

      filterArray.forEach((filterId) => {
        const button = $(`[data-filter="${filterId}"]`);
        if (button) {
          button.click();
        }
      });
    },

    /**
     * Reset all filters
     */
    reset() {
      resetFilters();
    },

    /**
     * Check if any filters are active
     * @returns {boolean} True if filters are active
     */
    hasActiveFilters() {
      return activeFilters.length > 0;
    }
  };
})();

// Make module globally accessible
if (typeof window !== 'undefined') {
  window.FiltersModule = FiltersModule;
}
