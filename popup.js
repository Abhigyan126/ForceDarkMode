document.addEventListener('DOMContentLoaded', function() {
  const urlInput = document.getElementById('urlInput');
  const addUrlBtn = document.getElementById('addUrlBtn');
  const addCurrentSiteBtn = document.getElementById('addCurrentSiteBtn');
  const urlContainer = document.getElementById('urlContainer');

  // Utility function to extract domain
  function extractDomain(url) {
      try {
          // Remove protocol and www
          let domain = url.replace(/^(https?:\/\/)?(www\.)?/, '');
          
          // Remove path, query parameters
          domain = domain.split('/')[0];
          
          return domain.toLowerCase().trim();
      } catch (error) {
          console.error('Domain extraction error:', error);
          return url.toLowerCase().trim();
      }
  }

  // Render stored URLs
  function renderUrls() {
      chrome.storage.local.get('storedURLs', function(data) {
          const storedURLs = data.storedURLs || [];
          
          // Clear existing content
          urlContainer.innerHTML = '';
          
          // If no URLs, show a message
          if (storedURLs.length === 0) {
              urlContainer.innerHTML = '<p>No URLs stored yet.</p>';
              return;
          }
          
          // Render each URL with delete button
          storedURLs.forEach((url, index) => {
              const urlItem = document.createElement('div');
              urlItem.className = 'url-item';
              
              const urlSpan = document.createElement('span');
              urlSpan.textContent = url;
              
              const deleteBtn = document.createElement('button');
              deleteBtn.textContent = 'Delete';
              deleteBtn.className = 'delete-btn';
              deleteBtn.addEventListener('click', function() {
                  // Remove the URL from storage
                  storedURLs.splice(index, 1);
                  chrome.storage.local.set({'storedURLs': storedURLs}, renderUrls);
              });
              
              urlItem.appendChild(urlSpan);
              urlItem.appendChild(deleteBtn);
              urlContainer.appendChild(urlItem);
          });
      });
  }

  // Add URL manually
  addUrlBtn.addEventListener('click', function() {
      const url = urlInput.value.trim();
      if (!url) {
          alert('Please enter a URL');
          return;
      }

      const domain = extractDomain(url);

      chrome.storage.local.get('storedURLs', function(data) {
          const storedURLs = data.storedURLs || [];
          
          // Check for duplicates
          if (!storedURLs.includes(domain)) {
              storedURLs.push(domain);
              chrome.storage.local.set({'storedURLs': storedURLs}, function() {
                  urlInput.value = ''; // Clear input
                  renderUrls(); // Refresh the list
              });
          } else {
              alert('URL already exists!');
          }
      });
  });

  // Add current site
  addCurrentSiteBtn.addEventListener('click', function() {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          if (tabs[0]) {
              const url = new URL(tabs[0].url);
              const domain = extractDomain(url.hostname);

              chrome.storage.local.get('storedURLs', function(data) {
                  const storedURLs = data.storedURLs || [];
                  
                  if (!storedURLs.includes(domain)) {
                      storedURLs.push(domain);
                      chrome.storage.local.set({'storedURLs': storedURLs}, renderUrls);
                  } else {
                      alert('Site already in the list!');
                  }
              });
          }
      });
  });

  // Initial render of URLs
  renderUrls();
});