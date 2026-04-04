/**
 * Search Module - Global Site Search
 * Provides real-time search with fuzzy matching across projects, skills, and experience
 * Features keyboard navigation, result highlighting, and accessibility support
 */

const SearchModule = (() => {
  // ============================================================================
  // PRIVATE STATE
  // ============================================================================

  let searchInput = null;
  let searchDropdown = null;
  let searchResults = [];
  let currentResultIndex = -1;
  const DEBOUNCE_DELAY = 300;
  const MIN_QUERY_LENGTH = 1;
  const MAX_RESULTS = 8;

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Perform fuzzy match on a string
   * Returns true if query matches text with partial/fuzzy logic
   * @param {string} text - Text to search in
   * @param {string} query - Search query
   * @returns {boolean} True if match found
   */
  function fuzzyMatch(text, query) {
    if (!text || !query) return false;

    text = text.toLowerCase();
    query = query.toLowerCase();

    // Exact match
    if (text.includes(query)) return true;

    // Fuzzy match - all characters must be in order but not necessarily consecutive
    let queryIndex = 0;
    for (let i = 0; i < text.length && queryIndex < query.length; i++) {
      if (text[i] === query[queryIndex]) {
        queryIndex++;
      }
    }

    return queryIndex === query.length;
  }

  /**
   * Get text snippet with highlighted query
   * @param {string} text - Full text
   * @param {string} query - Search query
   * @param {number} maxLength - Maximum snippet length
   * @returns {string} HTML snippet with highlights
   */
  function getHighlightedSnippet(text, query, maxLength = 100) {
    if (!text || !query) return text;

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    let snippet = text;
    let start = 0;

    if (index !== -1) {
      start = Math.max(0, index - 20);
      snippet = text.substring(start, start + maxLength);
      if (start > 0) snippet = '...' + snippet;
      if (start + maxLength < text.length) snippet += '...';
    } else {
      snippet = text.substring(0, maxLength);
      if (maxLength < text.length) snippet += '...';
    }

    // Highlight all matches
    return highlightMatches(snippet, query);
  }

  /**
   * Search portfolio data for matching items
   * @param {string} query - Search query
   * @returns {Array} Array of search results
   */
  function performSearch(query) {
    if (!query || query.length < MIN_QUERY_LENGTH) {
      return [];
    }

    const portfolioData = window.portfolioData;
    if (!portfolioData) return [];

    const results = [];

    // Search projects
    if (portfolioData.projects && Array.isArray(portfolioData.projects)) {
      portfolioData.projects.forEach((project) => {
        // Check title
        if (fuzzyMatch(project.title, query)) {
          results.push({
            type: 'project',
            title: project.title,
            text: project.description,
            section: '#projects',
            url: project.link,
            highlight: highlightMatches(project.title, query),
            snippet: getHighlightedSnippet(project.description, query, 80)
          });
        }
        // Check description
        else if (fuzzyMatch(project.description, query)) {
          results.push({
            type: 'project',
            title: project.title,
            text: project.description,
            section: '#projects',
            url: project.link,
            highlight: highlightMatches(project.title, query),
            snippet: getHighlightedSnippet(project.description, query, 80)
          });
        }
        // Check tags
        else if (project.tags?.some((tag) => fuzzyMatch(tag, query))) {
          results.push({
            type: 'project',
            title: project.title,
            text: project.description,
            section: '#projects',
            url: project.link,
            highlight: highlightMatches(project.title, query),
            snippet: getHighlightedSnippet(project.tags.join(', '), query, 80)
          });
        }
      });
    }

    // Search skills
    if (portfolioData.skills && Array.isArray(portfolioData.skills)) {
      portfolioData.skills.forEach((category) => {
        if (category.skills && Array.isArray(category.skills)) {
          category.skills.forEach((skill) => {
            if (fuzzyMatch(skill.name, query)) {
              results.push({
                type: 'skill',
                title: skill.name,
                text: `Category: ${category.category}`,
                section: '#skills',
                category: category.category,
                highlight: highlightMatches(skill.name, query),
                snippet: `Category: ${category.category}`
              });
            }
          });
        }
      });
    }

    // Search certifications/experience
    if (portfolioData.experience && Array.isArray(portfolioData.experience)) {
      portfolioData.experience.forEach((exp) => {
        // Check position
        if (fuzzyMatch(exp.position, query)) {
          results.push({
            type: 'experience',
            title: exp.position,
            text: exp.description,
            company: exp.company,
            section: '#experience',
            highlight: highlightMatches(exp.position, query),
            snippet: `Company: ${exp.company}`
          });
        }
        // Check company
        else if (fuzzyMatch(exp.company, query)) {
          results.push({
            type: 'experience',
            title: exp.position,
            company: exp.company,
            text: exp.description,
            section: '#experience',
            highlight: highlightMatches(exp.company, query),
            snippet: `Company: ${exp.company}`
          });
        }
        // Check description
        else if (fuzzyMatch(exp.description, query)) {
          results.push({
            type: 'experience',
            title: exp.position,
            company: exp.company,
            text: exp.description,
            section: '#experience',
            highlight: highlightMatches(exp.position, query),
            snippet: getHighlightedSnippet(exp.description, query, 80)
          });
        }
      });
    }

    // Limit results
    return results.slice(0, MAX_RESULTS);
  }

  /**
   * Create search result element
   * @param {Object} result - Result object
   * @param {number} index - Result index
   * @returns {Element} Result item element
   */
  function createResultElement(result, index) {
    const li = create('li', 'search-result-item');
    li.setAttribute('data-result-index', index);
    li.setAttribute('role', 'option');

    // Result icon/type indicator
    const typeIcon = create('span', 'search-result-type');
    typeIcon.setAttribute('aria-label', result.type);
    typeIcon.textContent = result.type === 'project' ? '📁' : result.type === 'skill' ? '🎯' : '💼';

    // Result content
    const content = create('div', 'search-result-content');

    // Title
    const title = create('div', 'search-result-title');
    title.innerHTML = result.highlight || result.title;

    // Snippet/description
    const snippet = create('div', 'search-result-snippet');
    snippet.innerHTML = result.snippet || result.text.substring(0, 100);

    append(content, title);
    append(content, snippet);

    append(li, typeIcon);
    append(li, content);

    // Click handler
    on(li, 'click', () => selectResult(result));

    // Hover handler
    on(li, 'mouseenter', () => {
      setCurrentResult(index);
    });

    return li;
  }

  /**
   * Render search results in dropdown
   * @param {Array} results - Search results
   */
  function renderResults(results) {
    if (!searchDropdown) return;

    // Clear previous results
    searchDropdown.innerHTML = '';
    currentResultIndex = -1;

    if (results.length === 0) {
      const noResults = create('div', 'search-no-results');
      noResults.setAttribute('role', 'status');
      noResults.textContent = 'No results found';
      append(searchDropdown, noResults);
      searchDropdown.style.display = 'block';
      return;
    }

    // Create results list
    const resultsList = create('ul', 'search-results-list');
    resultsList.setAttribute('role', 'listbox');
    resultsList.setAttribute('aria-label', `${results.length} search results`);

    results.forEach((result, index) => {
      const resultEl = createResultElement(result, index);
      append(resultsList, resultEl);
    });

    append(searchDropdown, resultsList);
    searchDropdown.style.display = 'block';
  }

  /**
   * Handle search input changes
   * @param {Event} event - Input event
   */
  const handleSearchInput = debounce((event) => {
    const query = event.target.value.trim();

    if (query.length < MIN_QUERY_LENGTH) {
      searchDropdown.style.display = 'none';
      searchResults = [];
      return;
    }

    // Perform search
    searchResults = performSearch(query);

    // Render results
    renderResults(searchResults);

    // Update ARIA live region
    const liveRegion = $('.search-live-region');
    if (liveRegion) {
      liveRegion.textContent = `${searchResults.length} results found for "${query}"`;
    }
  }, DEBOUNCE_DELAY);

  /**
   * Set current result selection
   * @param {number} index - Result index
   */
  function setCurrentResult(index) {
    if (index < 0 || index >= searchResults.length) return;

    // Remove previous highlight
    const prevResult = $(`.search-result-item[data-result-index="${currentResultIndex}"]`);
    if (prevResult) {
      removeClass(prevResult, 'selected');
    }

    // Set new highlight
    currentResultIndex = index;
    const currentResult = $(`.search-result-item[data-result-index="${index}"]`);
    if (currentResult) {
      addClass(currentResult, 'selected');
      currentResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      currentResult.setAttribute('aria-selected', 'true');
    }
  }

  /**
   * Navigate search results with arrow keys
   * @param {KeyboardEvent} event - Keyboard event
   */
  function handleKeyNavigation(event) {
    if (!searchDropdown || searchDropdown.style.display === 'none') return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setCurrentResult(currentResultIndex + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setCurrentResult(currentResultIndex - 1);
        break;
      case 'Enter':
        event.preventDefault();
        if (currentResultIndex >= 0 && searchResults[currentResultIndex]) {
          selectResult(searchResults[currentResultIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        clearSearch();
        break;
      default:
        break;
    }
  }

  /**
   * Select a search result
   * @param {Object} result - Result object
   */
  function selectResult(result) {
    // Scroll to section
    const section = $(result.section);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      // Focus the section for accessibility
      section.focus();
    }

    // Navigate to URL if available
    if (result.url) {
      window.open(result.url, '_blank');
    }

    // Clear search
    clearSearch();

    console.debug('[Search] Selected result:', result.title);
  }

  /**
   * Clear search input and results
   */
  function clearSearch() {
    if (searchInput) {
      searchInput.value = '';
      searchInput.focus();
    }
    searchDropdown.style.display = 'none';
    searchResults = [];
    currentResultIndex = -1;
  }

  /**
   * Create search input element and add to navbar
   */
  function createSearchInput() {
    const navbar = $('#navbar');
    if (!navbar) {
      console.warn('[Search] Navbar not found');
      return false;
    }

    // Create search container
    const searchContainer = create('div', 'search-container');
    searchContainer.setAttribute('role', 'search');

    // Create input
    searchInput = create('input', 'search-input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search projects, skills...';
    searchInput.setAttribute('aria-label', 'Search portfolio');
    searchInput.setAttribute('aria-autocomplete', 'list');
    searchInput.setAttribute('autocomplete', 'off');

    // Create dropdown
    searchDropdown = create('div', 'search-dropdown');
    searchDropdown.setAttribute('role', 'listbox');
    searchDropdown.style.display = 'none';

    // Create live region for screen readers
    const liveRegion = create('div', 'search-live-region');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';

    // Event listeners
    on(searchInput, 'input', handleSearchInput);
    on(searchInput, 'keydown', handleKeyNavigation);
    on(searchInput, 'focus', () => {
      if (searchResults.length > 0) {
        searchDropdown.style.display = 'block';
      }
    });

    // Close dropdown on blur
    on(searchInput, 'blur', () => {
      setTimeout(() => {
        searchDropdown.style.display = 'none';
      }, 200);
    });

    // Close dropdown on click outside
    on(document, 'click', (e) => {
      if (!searchContainer.contains(e.target)) {
        searchDropdown.style.display = 'none';
      }
    });

    // Append elements
    append(searchContainer, searchInput);
    append(searchContainer, searchDropdown);
    append(searchContainer, liveRegion);

    // Add to navbar - find appropriate location
    const navContent = navbar.querySelector('.nav-content') || navbar.querySelector('nav') || navbar;
    append(navContent, searchContainer);

    return true;
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  return {
    /**
     * Initialize search module
     * Called by app.js on startup
     * @param {Object} appState - Application state object
     */
    async init(appState) {
      try {
        console.info('[Search] Initializing...');

        const portfolioData = window.portfolioData;
        if (!portfolioData) {
          console.warn('[Search] Portfolio data not available');
          return;
        }

        // Create search input
        if (!createSearchInput()) {
          console.error('[Search] Failed to create search input');
          return;
        }

        // Update app state
        if (appState) {
          appState.set('search.initialized', true);
        }

        console.info('[Search] Initialized successfully');
      } catch (error) {
        console.error('[Search] Initialization error:', error);
      }
    },

    /**
     * Perform search programmatically
     * @param {string} query - Search query
     * @returns {Array} Search results
     */
    search(query) {
      return performSearch(query);
    },

    /**
     * Clear search
     */
    clear() {
      clearSearch();
    },

    /**
     * Get current search results
     * @returns {Array} Current search results
     */
    getResults() {
      return [...searchResults];
    },

    /**
     * Set search query programmatically
     * @param {string} query - Search query
     */
    setQuery(query) {
      if (searchInput) {
        searchInput.value = query;
        handleSearchInput({ target: searchInput });
      }
    }
  };
})();

// Make module globally accessible
if (typeof window !== 'undefined') {
  window.SearchModule = SearchModule;
}
