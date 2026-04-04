# JavaScript Modules - Quick Start Guide

## What Was Created?

Two production-ready JavaScript modules for your portfolio:

1. **Theme Module** - Dark mode with system preference detection
2. **Form Module** - Contact form validation and Formspree submission

## Do I Need to Do Anything?

### Minimal Setup (Required)

1. Open `components/forms.html`
2. Find this line:
   ```html
   <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
   ```
3. Replace `YOUR_FORM_ID` with your actual Formspree form ID

That's it! Both modules are automatically loaded and initialized.

## How to Verify It Works

### Test Theme Toggle
1. Open your portfolio in a browser
2. Look for the sun/moon icon in the navbar (top right)
3. Click the icon - the page should switch to dark mode
4. Reload the page - the theme should persist

### Test Form Validation
1. Scroll to the "Contacto" section
2. Try typing in the form fields:
   - Fields show red border as you type (invalid)
   - Fields turn green once valid
   - Error messages appear below invalid fields
3. Submit button only works when all fields are valid
4. After successful submission:
   - Success message appears
   - Form clears automatically
   - You can fill and submit again

### Check localStorage
1. Open browser DevTools (F12)
2. Go to "Application" or "Storage" tab
3. Look for localStorage entries:
   - `theme` - stores your theme preference
   - `form_draft` - stores form data while filling

## Browser Compatibility

### Works In
- Chrome/Edge 76+
- Firefox 67+
- Safari 12.1+

### Desktop & Mobile
Both modules are fully responsive and work on mobile devices.

## For Developers

### Access Module APIs

**In browser console:**

```javascript
// Theme module
ThemeModule.getTheme()           // Get current theme
ThemeModule.setTheme('dark')     // Set dark theme
ThemeModule.toggle()             // Toggle theme

// Form module
FormModule.validate()            // Validate form
FormModule.getData()             // Get form data
FormModule.clear()               // Clear form
FormModule.isValid()             // Is form valid?
FormModule.isDirty()             // Has form changed?
```

### Listen for Theme Changes

```javascript
document.addEventListener('theme:changed', (event) => {
  console.log('New theme:', event.detail.theme);
  // Your code here...
});
```

## What Each Module Does

### Theme Module (236 lines)

**Features:**
- Detects system dark mode preference
- Saves your choice to localStorage
- Provides toggle button
- Smooth 0.3s transitions
- Works across page reloads

**Key Files:**
- `src/js/modules/theme.js` - The module
- `components/navbar.html` - Toggle button
- `src/css/variables.css` - Dark theme colors

### Form Module (556 lines)

**Features:**
- Real-time validation as you type
- Field-specific rules (length, pattern, format)
- Visual feedback (red/green borders)
- Error messages in Spanish
- Saves draft while filling
- Submits to Formspree
- Shows "Enviando..." while sending

**Validation Rules:**
- **Name**: 3-50 characters, letters/spaces/hyphens only
- **Email**: Valid email format
- **Subject**: 5-100 characters
- **Message**: 10-5000 characters

**Key Files:**
- `src/js/modules/form.js` - The module
- `components/forms.html` - The form
- `src/css/components/forms.css` - Form styling

## Common Questions

**Q: Why isn't the form submitting?**
A: Make sure you set the Formspree form ID in `components/forms.html`

**Q: Can I customize the validation rules?**
A: Yes! Edit the `VALIDATION_RULES` object in `form.js`

**Q: Can I change the error messages?**
A: Yes! Edit the `messages` object in the validation rules

**Q: How do I change dark mode colors?**
A: Edit `:root.dark-theme` variables in `src/css/variables.css`

**Q: Does it work offline?**
A: Theme module yes, form module needs internet for Formspree

**Q: Can I disable the draft saving?**
A: Yes, comment out `saveDraft()` in the input handler

## File Structure

```
portfolio/
├── src/js/modules/
│   ├── theme.js          ← Theme module (NEW)
│   └── form.js           ← Form module (NEW)
├── components/
│   ├── navbar.html       (has toggle button)
│   └── forms.html        (update Formspree ID)
├── src/css/
│   ├── variables.css     (has dark theme colors)
│   └── components/forms.css
└── index.html            (loads modules)
```

## Documentation

For detailed documentation, see:
- `MODULES_DOCUMENTATION.md` - Complete feature guide
- `MODULES_INTEGRATION_SUMMARY.md` - Implementation details

## Troubleshooting

### Theme not changing?
- Check browser DevTools console for errors
- Verify `dark-theme` class appears on `<html>` element
- Try `ThemeModule.toggle()` in console

### Form not validating?
- Check console for error messages
- Verify form has `data-form="contact"` attribute
- Verify input names are correct (see MODULES_DOCUMENTATION.md)

### Formspree not working?
- Verify form ID is set correctly
- Check Formspree dashboard for submission records
- Check browser Network tab for POST response

## Next Steps

1. Set Formspree form ID in `components/forms.html` ✓
2. Test theme toggle ✓
3. Test form validation ✓
4. Deploy to production

## Support

If you encounter issues:
1. Check browser console for error messages
2. Verify file paths are correct
3. See detailed documentation in `MODULES_DOCUMENTATION.md`
4. Review validation rules and error messages

Everything is ready to use! Both modules are fully functional and automatically initialized when the page loads.
