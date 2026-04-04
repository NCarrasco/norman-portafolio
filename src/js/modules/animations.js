/**
 * Animations Module - Scroll-Based Animations using Intersection Observer
 * Provides fade-in, slide-up, scale, and bounce animations for portfolio elements
 * Includes parallax effects and animated counters for statistics
 */

const AnimationsModule = (() => {
  // ============================================================================
  // PRIVATE STATE
  // ============================================================================

  let observerInstance = null;
  const observedElements = new Map();
  const counterElements = new Map();
  const ANIMATION_CONFIG = {
    'fade-in': 'animate-fade-in-up',
    'slide-up': 'animate-slide-in-up',
    'scale': 'animate-scale-in',
    'bounce': 'animate-bounce-in'
  };

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Create Intersection Observer for scroll animations
   * @returns {IntersectionObserver} Configured observer instance
   */
  function createObserver() {
    const options = {
      root: null,
      rootMargin: '0px 0px -100px 0px', // Trigger when element is 100px from bottom
      threshold: 0.1
    };

    return new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateElement(entry.target);
        }
      });
    }, options);
  }

  /**
   * Apply animation to element based on data-animate attribute
   * @param {Element} el - DOM element to animate
   */
  function animateElement(el) {
    if (!el || observedElements.has(el)) return;

    const animationType = el.getAttribute('data-animate');
    if (!animationType || !ANIMATION_CONFIG[animationType]) {
      return;
    }

    const animationClass = ANIMATION_CONFIG[animationType];

    // Apply animation with delay support
    const delay = el.getAttribute('data-animate-delay');
    if (delay) {
      el.style.animationDelay = `${delay}ms`;
    }

    addClass(el, animationClass);
    observedElements.set(el, true);

    // Listen for animation end to unobserve
    const handleAnimationEnd = () => {
      off(el, 'animationend', handleAnimationEnd);
      observerInstance.unobserve(el);
    };

    on(el, 'animationend', handleAnimationEnd);
  }

  /**
   * Setup animated counters for numeric elements
   * @param {Element} el - Counter element with data-counter-target attribute
   */
  function setupCounter(el) {
    const targetValue = parseInt(el.getAttribute('data-counter-target'), 10);
    const duration = parseInt(el.getAttribute('data-counter-duration') || '1500', 10);

    if (!Number.isFinite(targetValue) || targetValue < 0) {
      console.warn('[Animations] Invalid counter target value:', targetValue);
      return;
    }

    counterElements.set(el, {
      targetValue,
      duration,
      currentValue: 0,
      startTime: null,
      animationId: null
    });
  }

  /**
   * Animate counter from 0 to target value
   * @param {Element} el - Counter element
   * @param {number} startTime - Animation start timestamp
   */
  function animateCounter(el, startTime) {
    const counterData = counterElements.get(el);
    if (!counterData) return;

    const elapsed = startTime - (counterData.startTime || startTime);
    const progress = Math.min(elapsed / counterData.duration, 1);
    const currentValue = Math.floor(counterData.targetValue * progress);

    // Format with separators for large numbers
    el.textContent = currentValue.toLocaleString();

    if (progress < 1) {
      counterData.startTime = counterData.startTime || startTime;
      counterData.animationId = requestAnimationFrame((time) => animateCounter(el, time));
    } else {
      // Ensure final value is displayed
      el.textContent = counterData.targetValue.toLocaleString();
      counterElements.delete(el);
    }
  }

  /**
   * Setup parallax effect for hero section
   * Subtle movement based on scroll position
   */
  function setupParallax() {
    const heroSection = $('[data-parallax]');
    if (!heroSection) return;

    const parallaxSpeed = parseFloat(heroSection.getAttribute('data-parallax') || '0.5');

    const handleParallax = throttle(() => {
      const scrollY = window.scrollY;
      const offset = scrollY * parallaxSpeed;
      heroSection.style.transform = `translateY(${offset}px)`;
    }, 10);

    on(window, 'scroll', handleParallax);

    // Return cleanup function
    return () => {
      off(window, 'scroll', handleParallax);
    };
  }

  /**
   * Initialize all scroll animations on page
   */
  function initializeScrollAnimations() {
    const animatedElements = $$('[data-animate]');

    if (animatedElements.length === 0) {
      console.debug('[Animations] No elements with data-animate found');
      return;
    }

    console.debug(`[Animations] Found ${animatedElements.length} elements to animate`);

    animatedElements.forEach((el) => {
      observerInstance.observe(el);
    });
  }

  /**
   * Initialize animated counters
   */
  function initializeCounters() {
    const counters = $$('[data-counter-target]');

    if (counters.length === 0) {
      console.debug('[Animations] No counter elements found');
      return;
    }

    console.debug(`[Animations] Found ${counters.length} counter elements`);

    counters.forEach((el) => {
      setupCounter(el);

      // Create observer for counter animation trigger
      const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !counterElements.get(el).animationId) {
            requestAnimationFrame((time) => animateCounter(el, time));
            counterObserver.unobserve(el);
          }
        });
      }, {
        threshold: 0.5
      });

      counterObserver.observe(el);
    });
  }

  /**
   * Setup staggered animations for list items
   * Elements with data-animate-stagger will animate with delays
   */
  function initializeStaggerAnimations() {
    const staggerContainers = $$('[data-animate-stagger]');

    staggerContainers.forEach((container) => {
      const staggerDelay = parseInt(container.getAttribute('data-animate-stagger') || '100', 10);
      const children = container.querySelectorAll('[data-animate]');

      children.forEach((child, index) => {
        const delay = index * staggerDelay;
        child.setAttribute('data-animate-delay', delay.toString());
      });
    });
  }

  /**
   * Enhance accessibility for animated elements
   */
  function setupAccessibility() {
    const animatedElements = $$('[data-animate]');

    animatedElements.forEach((el) => {
      // Add ARIA attributes for screen readers
      if (!el.hasAttribute('role')) {
        el.setAttribute('aria-hidden', 'false');
      }

      // Respect prefers-reduced-motion
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        removeClass(el, ANIMATION_CONFIG[el.getAttribute('data-animate')] || '');
        el.style.opacity = '1';
        el.style.transform = 'none';
      }
    });
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  return {
    /**
     * Initialize animations module
     * Called by app.js on startup
     * @param {Object} appState - Application state object
     */
    async init(appState) {
      try {
        console.info('[Animations] Initializing...');

        // Create intersection observer
        observerInstance = createObserver();

        // Setup staggered animations first
        initializeStaggerAnimations();

        // Setup scroll-based animations
        initializeScrollAnimations();

        // Setup animated counters
        initializeCounters();

        // Setup parallax effect
        const cleanupParallax = setupParallax();

        // Setup accessibility
        setupAccessibility();

        // Store cleanup function for potential module cleanup
        if (appState) {
          appState.set('animations.initialized', true);
        }

        console.info('[Animations] Initialized successfully');
      } catch (error) {
        console.error('[Animations] Initialization error:', error);
      }
    },

    /**
     * Manually animate an element
     * @param {Element} el - DOM element to animate
     * @param {string} type - Animation type (fade-in, slide-up, scale, bounce)
     */
    animate(el, type = 'fade-in') {
      if (!el || !ANIMATION_CONFIG[type]) {
        console.warn('[Animations] Invalid animation type:', type);
        return;
      }

      const animationClass = ANIMATION_CONFIG[type];
      addClass(el, animationClass);
    },

    /**
     * Trigger counter animation on demand
     * @param {Element} el - Counter element
     */
    animateCounter(el) {
      if (!el) return;

      if (el.hasAttribute('data-counter-target')) {
        setupCounter(el);
        requestAnimationFrame((time) => animateCounter(el, time));
      }
    },

    /**
     * Pause all animations (for performance)
     */
    pauseAnimations() {
      const animatedElements = $$('[data-animate]');
      animatedElements.forEach((el) => {
        el.style.animationPlayState = 'paused';
      });
    },

    /**
     * Resume all animations
     */
    resumeAnimations() {
      const animatedElements = $$('[data-animate]');
      animatedElements.forEach((el) => {
        el.style.animationPlayState = 'running';
      });
    },

    /**
     * Get animation configuration
     * @returns {Object} Animation type mappings
     */
    getConfig() {
      return { ...ANIMATION_CONFIG };
    }
  };
})();

// Make module globally accessible
if (typeof window !== 'undefined') {
  window.AnimationsModule = AnimationsModule;
}
