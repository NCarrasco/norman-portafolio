# JavaScript Modules Documentation

This document describes the three essential JavaScript modules created for the portfolio application.

## Overview

Three production-ready JavaScript modules provide enhanced interactivity and user experience:

1. **Animations Module** - Scroll-based animations using Intersection Observer
2. **Filters Module** - Interactive filtering system for portfolio items
3. **Search Module** - Global site search with fuzzy matching

All modules:
- Use the IIFE (Immediately Invoked Function Expression) pattern
- Export an `init()` function called by `app.js`
- Manage state via `appState` and `window.portfolioData`
- Include ARIA attributes for accessibility
- Support responsive design and dark/light themes
- Have smooth transitions (300ms default)
- Respect `prefers-reduced-motion` media query

---

## 1. Animations Module

**File:** `src/js/modules/animations.js`

### Features

#### Scroll-Based Animations
- Uses IntersectionObserver API for performance
- Triggers animations when elements enter viewport
- Automatically unobserves elements after animation completes

#### Supported Animation Types
- `fade-in` - Fade in with subtle upward movement
- `slide-up` - Slide up from bottom with fade
- `scale` - Scale up from smaller size
- `bounce` - Bounce effect on entry

#### Animated Counters
- Counts from 0 to target value
- Displays large numbers with locale formatting
- Trigger on element entering viewport
- Duration: 1.5 seconds (customizable)

#### Parallax Effect
- Subtle movement in hero section based on scroll
- Configurable speed via `data-parallax` attribute

#### Staggered Animations
- Automatically staggers child element animations
- Cascading visual effect

### HTML Usage

```html
<!-- Fade-in animation -->
<div data-animate="fade-in">Content</div>

<!-- Slide-up with delay -->
<div data-animate="slide-up" data-animate-delay="200">Content</div>

<!-- Staggered animations -->
<div data-animate-stagger="100">
  <div data-animate="fade-in">Item 1</div>
  <div data-animate="fade-in">Item 2</div>
</div>

<!-- Animated counter -->
<div data-counter-target="50">0</div>

<!-- Parallax section -->
<section data-parallax="0.5">Hero content</section>
```

### JavaScript API

```javascript
// Manually animate an element
AnimationsModule.animate(element, 'fade-in');

// Manually animate a counter
AnimationsModule.animateCounter(counterElement);

// Pause/Resume all animations
AnimationsModule.pauseAnimations();
AnimationsModule.resumeAnimations();

// Get animation configuration
const config = AnimationsModule.getConfig();
```

---

## 2. Filters Module

**File:** `src/js/modules/filters.js`

### Features

#### Dynamic Filter UI
- Automatically generates filter buttons from data
- Groups filters by category
- Organized, accessible button groups

#### Multiple Simultaneous Filters
- Select multiple filters at once
- Smart filtering logic based on data type
- Smooth transitions (300ms)

#### Smart Filtering
- Projects: Filter by Category OR Technology
- Skills: Filter by Skill Category
- Experience: Filter by Position OR Company

#### Filter Counter
- Shows "X of Y items shown"
- Hidden when no filters active

#### URL Shareability
- Encodes filters in URL: `?filters=project-category-fraud,project-tags-python`
- Loads filters from URL on page load
- Allows sharing filtered views

#### Reset Functionality
- "Reset All Filters" button
- Clears selections and URL params

### HTML Usage

```html
<!-- Project container -->
<section id="projects" data-filter-container="projects">
  <article data-project-id="1">Project content</article>
</section>

<!-- Skills container -->
<section id="skills" data-filter-container="skills">
  <div data-skill-category="Languages">
    <div data-skill-name="Python">Python</div>
  </div>
</section>

<!-- Experience container -->
<section id="experience" data-filter-container="experience">
  <div data-experience-id="1">Experience content</div>
</section>
```

### JavaScript API

```javascript
// Get active filters
const active = FiltersModule.getActiveFilters();

// Set filters programmatically
FiltersModule.setFilters(['project-category-ml']);

// Reset all filters
FiltersModule.reset();

// Check if filters active
const hasFilters = FiltersModule.hasActiveFilters();
```

---

## 3. Search Module

**File:** `src/js/modules/search.js`

### Features

#### Real-Time Search
- Debounced 300ms
- Searches as user types
- Shows up to 8 results

#### Fuzzy Matching
- Matches partial text
- Case-insensitive
- All characters must be in order

#### Comprehensive Search
- Projects: Title, Description, Tags
- Skills: Skill names and categories
- Experience: Position, Company, Description

#### Result Highlighting
- Highlights matching text with `<mark>` tags
- Shows context snippets
- Result type indicators

#### Keyboard Navigation
- Arrow Up/Down: Navigate results
- Enter: Select result
- Escape: Clear search
- Tab: Navigate through interface

#### Full Accessibility
- ARIA live region for announcements
- Proper roles and labels
- Screen reader support
- Keyboard accessible

### HTML Usage

Search input is auto-generated in navbar.

### JavaScript API

```javascript
// Perform search
const results = SearchModule.search('python');

// Set search query
SearchModule.setQuery('Data Science');

// Clear search
SearchModule.clear();

// Get current results
const current = SearchModule.getResults();
```

---

## Module Initialization

Modules are initialized by `app.js`:

```javascript
const modules = [
  { name: 'theme', obj: window.ThemeModule },
  { name: 'animations', obj: window.AnimationsModule },
  { name: 'form', obj: window.FormModule },
  { name: 'filters', obj: window.FiltersModule },
  { name: 'search', obj: window.SearchModule }
];

for (const { name, obj } of modules) {
  if (obj?.init) {
    await obj.init(appState);
  }
}
```

---

## Global State

### appState Object

```javascript
window.appState = {
  theme: 'light' | 'dark',
  mobileMenuOpen: boolean,
  data: {
    projects: Array,
    experience: Array,
    skills: Array,
    testimonials: Array
  },
  searchQuery: string,
  selectedFilters: Array
}
```

### Portfolio Data

```javascript
window.portfolioData = {
  projects: [...],
  experience: [...],
  skills: [...],
  testimonials: [...]
}
```

---

## CSS Styling

### Main Module Styles
**File:** `src/css/components/modules.css`

Includes:
- Filter button styles
- Search input and dropdown styles
- Result item styling
- Responsive design
- Dark theme support
- Reduced motion preferences

### CSS Variables

All modules use CSS custom properties:
- Colors: `--color-accent`, `--color-border`
- Spacing: `--spacing-1` through `--spacing-20`
- Transitions: `--transition-base`
- Z-index: `--z-dropdown`

---

## Accessibility

### ARIA Attributes
- Search: `role="search"`, `aria-autocomplete`
- Filters: `aria-pressed` for buttons
- Results: `role="listbox"`, `role="option"`
- Live regions for announcements

### Keyboard Support
- Tab navigation
- Enter/Space to activate buttons
- Arrow keys in results
- Escape to close

### Visual Accessibility
- Focus indicators
- High contrast support
- Respects `prefers-reduced-motion`
- Sufficient text contrast

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

### Required APIs
- Intersection Observer API
- URLSearchParams
- fetch API
- ES6 features

---

## Customization

### Change Animation Types

```javascript
// In AnimationsModule
const ANIMATION_CONFIG = {
  'custom-animation': 'animate-custom-class',
};
```

### Adjust Search Settings

```javascript
const DEBOUNCE_DELAY = 300;        // Debounce delay
const MIN_QUERY_LENGTH = 1;        // Minimum characters
const MAX_RESULTS = 8;             // Maximum results shown
```

---

## Testing

### Test Animations
```javascript
const element = document.querySelector('[data-animate="fade-in"]');
console.log(element.classList.contains('animate-fade-in-up'));
```

### Test Filters
```javascript
console.log(FiltersModule.getActiveFilters());
FiltersModule.setFilters(['project-category-ml']);
```

### Test Search
```javascript
const results = SearchModule.search('python');
console.log(`Found ${results.length} results`);
```

---

## File Structure

```
src/
├── js/
│   ├── app.js
│   ├── utils.js
│   └── modules/
│       ├── animations.js         (NEW)
│       ├── filters.js            (NEW)
│       ├── search.js             (NEW)
│       ├── theme.js
│       └── form.js
├── css/
│   ├── animations.css
│   ├── variables.css
│   ├── components/
│   │   └── modules.css           (NEW)
│   └── ...
└── data/
    ├── projects.json
    ├── skills.json
    ├── experience.json
    └── testimonials.json
```
