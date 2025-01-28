// Advanced Universal Dark Mode Script
function applyUniversalDarkMode() {
  // Check if dark mode has already been applied
  if (document.body.classList.contains('dark-mode-processed')) return;

  // Dark mode color scheme
  const darkBackground = '#121212';
  const darkText = '#E0E0E0';
  const darkLinkColor = '#4CAF50';
  const darkAccentBackground = '#1E1E1E';

  // Remove conflicting classes from specified elements
  function removeConflictingClasses(element) {
    const lightClasses = [
      'bg-light',
      'bg-white',
      'text-dark',
      'navbar-light',
      'bg-body-tertiary'
    ];
    
    lightClasses.forEach(className => {
      element.classList.remove(className);
    });
  }

  // Parse color to RGB
  function parseColor(color) {
    if (color === 'transparent' || color === 'inherit') return null;

    const tempElement = document.createElement('div');
    tempElement.style.color = color;
    document.body.appendChild(tempElement);
    
    const computedColor = window.getComputedStyle(tempElement).color;
    document.body.removeChild(tempElement);

    const match = computedColor.match(/(\d+),\s*(\d+),\s*(\d+)/);
    return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : null;
  }

  // Check if a color is dark
  function isDarkColor(color) {
    const rgb = parseColor(color);
    if (!rgb) return false;
    const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
    return brightness < 128;
  }

  // Apply dark mode to element
  function applyDarkModeToElement(element) {
    if (!element || element.classList?.contains('dark-mode-processed')) return;

    try {
      // Remove Bootstrap and other light theme classes
      removeConflictingClasses(element);

      // Force dark background and text colors
      element.style.setProperty('background-color', darkBackground, 'important');
      element.style.setProperty('color', darkText, 'important');

      // Special handling for specific elements
      if (element.tagName === 'A') {
        element.style.setProperty('color', darkLinkColor, 'important');
      }

      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName)) {
        element.style.setProperty('background-color', darkAccentBackground, 'important');
        element.style.setProperty('color', darkText, 'important');
        element.style.setProperty('border-color', '#444', 'important');
      }

      // Mark as processed
      element.classList.add('dark-mode-processed');

      // Process children
      element.childNodes.forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          applyDarkModeToElement(child);
        }
      });
    } catch (error) {
      console.warn('Error applying dark mode:', error);
    }
  }

  // Initialize dark mode for specific elements
  function initDarkMode() {
    // Create and append a style element for targeted elements
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .dark-mode-processed {
        background-color: ${darkBackground} !important;
        color: ${darkText} !important;
      }
    `;
    document.head.appendChild(styleElement);

    // Select only specific elements to apply dark mode
    const elementsToColor = document.querySelectorAll(
      'body, div, span, p, h1, h2, h3, h4, h5, h6, ' +
      'article, section, main, header, footer, ' +
      'nav, aside, a, button, input, textarea, select'
    );

    elementsToColor.forEach(applyDarkModeToElement);

    // Create an observer to handle dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE && 
              node.matches('body, div, span, p, h1, h2, h3, h4, h5, h6, ' +
                          'article, section, main, header, footer, ' +
                          'nav, aside, a, button, input, textarea, select')) {
            applyDarkModeToElement(node);
          }
        });
      });
    });

    // Start observing the document
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Check if dark mode should be applied based on stored URLs
  chrome.storage.local.get('storedURLs', function(data) {
    const storedURLs = data.storedURLs || [];
    const currentURL = window.location.href;

    if (storedURLs.some(url => currentURL.includes(url))) {
      initDarkMode();
    }
  });
}

// Run the script
applyUniversalDarkMode();
