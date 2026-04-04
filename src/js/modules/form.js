/**
 * Form Module - Form Validation and Submission
 * Handles real-time validation, visual feedback, and Formspree submission
 */

const FormModule = (() => {
  // ============================================================================
  // PRIVATE STATE & CONFIGURATION
  // ============================================================================

  const FORM_SELECTOR = '[data-form="contact"]';
  const STORAGE_KEY = 'form_draft';

  // Validation rules for each field
  const VALIDATION_RULES = {
    name: {
      minLength: 3,
      maxLength: 50,
      pattern: /^[a-zA-Z\s'-]+$/,
      messages: {
        required: 'El nombre es requerido',
        minLength: 'El nombre debe tener al menos 3 caracteres',
        maxLength: 'El nombre no debe exceder 50 caracteres',
        pattern: 'El nombre solo puede contener letras, espacios, guiones y apóstrofes'
      }
    },
    email: {
      minLength: 5,
      maxLength: 254,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      messages: {
        required: 'El correo es requerido',
        pattern: 'Ingresa un correo válido',
        maxLength: 'El correo es demasiado largo'
      }
    },
    subject: {
      minLength: 5,
      maxLength: 100,
      messages: {
        required: 'El asunto es requerido',
        minLength: 'El asunto debe tener al menos 5 caracteres',
        maxLength: 'El asunto no debe exceder 100 caracteres'
      }
    },
    message: {
      minLength: 10,
      maxLength: 5000,
      messages: {
        required: 'El mensaje es requerido',
        minLength: 'El mensaje debe tener al menos 10 caracteres',
        maxLength: 'El mensaje no debe exceder 5000 caracteres'
      }
    }
  };

  let formElement = null;
  let formState = {
    isValid: false,
    isDirty: false,
    isSubmitting: false,
    fields: {
      name: { value: '', isValid: false, touched: false },
      email: { value: '', isValid: false, touched: false },
      subject: { value: '', isValid: false, touched: false },
      message: { value: '', isValid: false, touched: false }
    }
  };

  // ============================================================================
  // PRIVATE VALIDATION METHODS
  // ============================================================================

  /**
   * Validate a field against its rules
   * @param {string} fieldName - Name of the field
   * @param {string} value - Field value to validate
   * @returns {Object} Validation result { isValid, errors }
   */
  function validateField(fieldName, value) {
    const rules = VALIDATION_RULES[fieldName];
    if (!rules) {
      return { isValid: true, errors: [] };
    }

    const errors = [];
    const trimmedValue = value.trim();

    // Required check
    if (!trimmedValue) {
      errors.push(rules.messages.required);
      return { isValid: false, errors };
    }

    // Min length check
    if (rules.minLength && trimmedValue.length < rules.minLength) {
      errors.push(rules.messages.minLength);
    }

    // Max length check
    if (rules.maxLength && trimmedValue.length > rules.maxLength) {
      errors.push(rules.messages.maxLength);
    }

    // Pattern check
    if (rules.pattern && !rules.pattern.test(trimmedValue)) {
      errors.push(rules.messages.pattern);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Update field state and validation
   * @param {string} fieldName - Name of the field
   * @param {string} value - Field value
   * @param {boolean} touched - Whether field has been touched
   */
  function updateFieldState(fieldName, value, touched = false) {
    const validation = validateField(fieldName, value);

    formState.fields[fieldName] = {
      value: value,
      isValid: validation.isValid,
      touched: touched || formState.fields[fieldName].touched,
      errors: validation.errors
    };

    formState.isDirty = true;

    // Update overall form validity
    updateFormValidity();
  }

  /**
   * Check if entire form is valid
   */
  function updateFormValidity() {
    const allFieldsValid = Object.values(formState.fields).every(
      field => field.isValid
    );
    formState.isValid = allFieldsValid;
  }

  // ============================================================================
  // PRIVATE DOM MANIPULATION METHODS
  // ============================================================================

  /**
   * Get form field element
   * @param {string} fieldName - Name of the field
   * @returns {Element|null} Input/textarea element
   */
  function getFieldElement(fieldName) {
    if (!formElement) return null;
    return formElement.querySelector(`[name="${fieldName === 'email' ? '_replyto' : fieldName === 'subject' ? '_subject' : fieldName}"]`);
  }

  /**
   * Get form group container
   * @param {string} fieldName - Name of the field
   * @returns {Element|null} Form group container
   */
  function getFieldGroup(fieldName) {
    if (!formElement) return null;
    return formElement.querySelector(`[data-field="${fieldName}"]`);
  }

  /**
   * Update field visual state
   * @param {string} fieldName - Name of the field
   */
  function updateFieldDisplay(fieldName) {
    const fieldElement = getFieldElement(fieldName);
    const fieldGroup = getFieldGroup(fieldName);
    const errorContainer = formElement.querySelector(`[data-error="${fieldName}"]`);
    const fieldState = formState.fields[fieldName];

    if (!fieldElement || !fieldGroup) return;

    // Remove existing classes
    removeClass(fieldElement, 'is-valid is-invalid');

    // Add visual feedback only if field is touched or form is dirty
    if (fieldState.touched || formState.isDirty) {
      if (fieldState.isValid) {
        addClass(fieldElement, 'is-valid');
      } else {
        addClass(fieldElement, 'is-invalid');
      }
    }

    // Update error messages
    if (errorContainer) {
      errorContainer.innerHTML = '';

      if (fieldState.errors && fieldState.errors.length > 0 && (fieldState.touched || formState.isDirty)) {
        errorContainer.innerHTML = fieldState.errors
          .map(error => `<span class="field-error-message" role="alert">${error}</span>`)
          .join('');
      }
    }
  }

  /**
   * Update all field displays
   */
  function updateAllFieldDisplays() {
    Object.keys(VALIDATION_RULES).forEach(fieldName => {
      updateFieldDisplay(fieldName);
    });
  }

  /**
   * Update submit button state
   */
  function updateSubmitButtonState() {
    const submitButton = formElement.querySelector('[data-action="submit-form"]');
    if (!submitButton) return;

    // Disable if form is invalid or submitting
    if (!formState.isValid || formState.isSubmitting) {
      submitButton.disabled = true;
      submitButton.setAttribute('aria-disabled', 'true');

      if (formState.isSubmitting) {
        submitButton.textContent = 'Enviando...';
      }
    } else {
      submitButton.disabled = false;
      submitButton.setAttribute('aria-disabled', 'false');
      submitButton.textContent = 'Enviar mensaje';
    }
  }

  /**
   * Show status message (success or error)
   * @param {string} type - 'success' or 'error'
   * @param {string} message - Optional custom message
   */
  function showStatusMessage(type, message = null) {
    const statusContainer = formElement.querySelector(`[data-status="${type}"]`);
    if (!statusContainer) return;

    const messageEl = statusContainer.querySelector('.status-message');
    if (message && messageEl) {
      messageEl.textContent = message;
    }

    // Show the appropriate message and hide others
    if (type === 'success') {
      formElement.querySelector('[data-status="error"]').style.display = 'none';
      statusContainer.style.display = 'block';
      statusContainer.setAttribute('role', 'status');
      statusContainer.setAttribute('aria-live', 'polite');
    } else if (type === 'error') {
      formElement.querySelector('[data-status="success"]').style.display = 'none';
      statusContainer.style.display = 'block';
      statusContainer.setAttribute('role', 'alert');
      statusContainer.setAttribute('aria-live', 'assertive');
    }
  }

  /**
   * Hide status messages
   */
  function hideStatusMessages() {
    const successEl = formElement.querySelector('[data-status="success"]');
    const errorEl = formElement.querySelector('[data-status="error"]');

    if (successEl) successEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';
  }

  /**
   * Clear form fields and state
   */
  function clearForm() {
    // Clear all field values
    Object.keys(VALIDATION_RULES).forEach(fieldName => {
      const fieldElement = getFieldElement(fieldName);
      if (fieldElement) {
        fieldElement.value = '';
      }

      // Reset field state
      formState.fields[fieldName] = {
        value: '',
        isValid: false,
        touched: false,
        errors: []
      };
    });

    formState.isDirty = false;
    formState.isValid = false;

    // Clear localStorage draft
    removeStorage(STORAGE_KEY);

    // Update displays
    updateAllFieldDisplays();
    updateSubmitButtonState();
  }

  // ============================================================================
  // PRIVATE STORAGE METHODS
  // ============================================================================

  /**
   * Save form draft to localStorage
   */
  function saveDraft() {
    const draft = {};
    Object.keys(VALIDATION_RULES).forEach(fieldName => {
      draft[fieldName] = formState.fields[fieldName].value;
    });
    setStorage(STORAGE_KEY, draft);
  }

  /**
   * Load form draft from localStorage
   */
  function loadDraft() {
    const draft = getStorage(STORAGE_KEY, null);
    if (!draft || typeof draft !== 'object') return;

    Object.entries(draft).forEach(([fieldName, value]) => {
      if (VALIDATION_RULES[fieldName] && value) {
        const fieldElement = getFieldElement(fieldName);
        if (fieldElement) {
          fieldElement.value = value;
          updateFieldState(fieldName, value);
        }
      }
    });

    updateAllFieldDisplays();
  }

  // ============================================================================
  // PRIVATE EVENT HANDLERS
  // ============================================================================

  /**
   * Handle field input event
   * @param {string} fieldName - Name of the field
   */
  function createInputHandler(fieldName) {
    return function(e) {
      const value = e.target.value;
      updateFieldState(fieldName, value);
      updateFieldDisplay(fieldName);
      updateSubmitButtonState();
      saveDraft();
    };
  }

  /**
   * Handle field blur event
   * @param {string} fieldName - Name of the field
   */
  function createBlurHandler(fieldName) {
    return function(e) {
      const value = e.target.value;
      updateFieldState(fieldName, value, true);
      updateFieldDisplay(fieldName);
    };
  }

  /**
   * Handle form submission
   */
  function handleFormSubmit(e) {
    e.preventDefault();

    // Mark all fields as touched
    Object.keys(VALIDATION_RULES).forEach(fieldName => {
      formState.fields[fieldName].touched = true;
    });

    updateAllFieldDisplays();

    // Stop if form is invalid
    if (!formState.isValid) {
      console.warn('[Form] Form validation failed');
      return;
    }

    // Submit form
    submitForm();
  }

  /**
   * Submit form via Formspree
   */
  async function submitForm() {
    try {
      formState.isSubmitting = true;
      updateSubmitButtonState();
      hideStatusMessages();

      // Prepare form data
      const formData = new FormData(formElement);

      // Submit to Formspree
      const response = await fetch(formElement.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        // Success
        showStatusMessage('success');
        clearForm();
        console.info('[Form] Submission successful');
      } else {
        // Error from Formspree
        const error = await response.json();
        showStatusMessage('error', error.message || 'Error al enviar el mensaje. Por favor intenta de nuevo.');
        console.error('[Form] Submission error:', error);
      }
    } catch (error) {
      // Network or other error
      showStatusMessage('error');
      console.error('[Form] Submission error:', error);
    } finally {
      formState.isSubmitting = false;
      updateSubmitButtonState();
    }
  }

  /**
   * Setup all event listeners
   */
  function setupEventListeners() {
    if (!formElement) return;

    Object.keys(VALIDATION_RULES).forEach(fieldName => {
      const fieldElement = getFieldElement(fieldName);
      if (!fieldElement) return;

      // Setup aria attributes
      fieldElement.setAttribute('aria-required', 'true');
      fieldElement.setAttribute('aria-invalid', 'false');

      // Input event (real-time validation)
      on(fieldElement, 'input', createInputHandler(fieldName));

      // Blur event (mark as touched)
      on(fieldElement, 'blur', createBlurHandler(fieldName));
    });

    // Form submission
    on(formElement, 'submit', handleFormSubmit);
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  return {
    /**
     * Initialize form module
     * Called by app.js on startup
     * @param {Object} appState - Application state object
     */
    async init(appState) {
      try {
        console.info('[Form] Initializing...');

        // Find form element
        formElement = $(FORM_SELECTOR);
        if (!formElement) {
          console.warn(`[Form] Form not found: ${FORM_SELECTOR}`);
          return;
        }

        // Load draft data
        loadDraft();

        // Setup event listeners
        setupEventListeners();

        // Initial state
        updateSubmitButtonState();

        console.info('[Form] Initialized successfully');
      } catch (error) {
        console.error('[Form] Initialization error:', error);
      }
    },

    /**
     * Validate entire form
     * @returns {boolean} True if form is valid
     */
    validate() {
      Object.keys(VALIDATION_RULES).forEach(fieldName => {
        const fieldElement = getFieldElement(fieldName);
        if (fieldElement) {
          updateFieldState(fieldName, fieldElement.value, true);
        }
      });

      updateAllFieldDisplays();
      return formState.isValid;
    },

    /**
     * Clear form
     */
    clear() {
      clearForm();
    },

    /**
     * Get form data
     * @returns {Object} Form field values
     */
    getData() {
      const data = {};
      Object.keys(VALIDATION_RULES).forEach(fieldName => {
        data[fieldName] = formState.fields[fieldName].value;
      });
      return data;
    },

    /**
     * Check if form is valid
     * @returns {boolean} Form validity status
     */
    isValid() {
      return formState.isValid;
    },

    /**
     * Check if form has been modified
     * @returns {boolean} Whether form is dirty
     */
    isDirty() {
      return formState.isDirty;
    }
  };
})();

// Make module globally accessible
if (typeof window !== 'undefined') {
  window.FormModule = FormModule;
}
