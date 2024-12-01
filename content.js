// Advanced Universal Dark Mode Script
function applyUniversalDarkMode() {
  // Check if dark mode has already been applied
  if (document.body.classList.contains('universal-dark-mode')) return;

  // Dark mode color scheme
  const darkBackground = '#121212';
  const darkText = '#E0E0E0';  // Light text for better readability
  const darkLinkColor = '#4CAF50';
  const darkAccentBackground = '#1E1E1E';

  // Function to ensure sufficient color contrast
  function ensureReadableColor(bgColor, currentColor) {
    // Parse background color
    const bgRGB = parseColor(bgColor);
    if (!bgRGB) return darkText;

    // Calculate background brightness
    const bgBrightness = (bgRGB[0] * 299 + bgRGB[1] * 587 + bgRGB[2] * 114) / 1000;

    // If current color is already light or background is dark, return light text
    if (isDarkColor(bgColor) || isLightColor(currentColor)) {
      return darkText;
    }

    // If background is light, convert to a dark color
    const currentRGB = parseColor(currentColor);
    if (!currentRGB) return darkText;

    // Darken the color if it's too light
    const darkenedColor = `rgb(${Math.max(currentRGB[0] - 100, 0)}, 
                               ${Math.max(currentRGB[1] - 100, 0)}, 
                               ${Math.max(currentRGB[2] - 100, 0)})`;

    return darkenedColor;
  }

  // Function to check if color is light
  function isLightColor(color) {
    const rgb = parseColor(color);
    if (!rgb) return false;
    const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
    return brightness > 200;  // Higher threshold for light colors
  }

  // Check if a color is considered dark
  function isDarkColor(color) {
    const rgb = parseColor(color);
    if (!rgb) return false;
    const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
    return brightness < 128;
  }

  // Parse color to RGB
  function parseColor(color) {
    // Handle transparent and inherit cases
    if (color === 'transparent' || color === 'inherit') return null;

    const tempElement = document.createElement('div');
    tempElement.style.color = color;
    document.body.appendChild(tempElement);
    
    const computedColor = window.getComputedStyle(tempElement).color;
    document.body.removeChild(tempElement);

    const match = computedColor.match(/(\d+),\s*(\d+),\s*(\d+)/);
    return match ? [
      parseInt(match[1]),
      parseInt(match[2]),
      parseInt(match[3])
    ] : null;
  }

  // Recursive function to apply dark mode to elements
  function applyDarkModeToElement(element) {
    if (!element || element.classList?.contains('universal-dark-mode')) return;

    try {
      const style = window.getComputedStyle(element);
      const backgroundColor = style.backgroundColor;
      const currentColor = style.color;

      // Determine background color
      const finalBackground = isDarkColor(backgroundColor) 
        ? darkAccentBackground 
        : darkBackground;

      // Determine text color with better contrast
      const finalTextColor = ensureReadableColor(finalBackground, currentColor);

      // Apply styles
      element.style.backgroundColor = finalBackground;
      element.style.color = finalTextColor;

      // Special handling for links
      if (element.tagName === 'A') {
        element.style.color = darkLinkColor;
      }

      // Special handling for input elements
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName)) {
        element.style.backgroundColor = darkAccentBackground;
        element.style.color = darkText;
        element.style.borderColor = '#444';
      }

      // Add a class to mark processed elements
      element.classList.add('universal-dark-mode');

      // Recursively process child elements
      element.childNodes.forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          applyDarkModeToElement(child);
        }
      });
    } catch (error) {
      console.warn('Error applying dark mode:', error);
    }
  }

  // Apply dark mode to the entire document
  function initDarkMode() {
    document.body.classList.add('universal-dark-mode');
    document.body.style.backgroundColor = darkBackground;
    document.body.style.color = darkText;
    
    // Select a wide range of elements
    const elementsToColor = document.querySelectorAll(
      'body, div, span, p, h1, h2, h3, h4, h5, h6, ' +
      'article, section, main, header, footer, ' +
      'nav, aside, a, button, input, textarea, select'
    );

    elementsToColor.forEach(applyDarkModeToElement);
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