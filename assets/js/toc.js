// TOC scroll spy and auto expand
(function() {
  const toc = document.querySelector('.toc');
  if (!toc) return;

  const links = toc.querySelectorAll('a');
  const headings = [];
  
  // Collect all headings with their positions
  links.forEach(link => {
    const id = link.getAttribute('href').substring(1);
    const heading = document.getElementById(id);
    if (heading) {
      headings.push({ id, element: heading, link });
    }
  });

  // Find active heading based on scroll position
  function updateActiveLink() {
    const scrollTop = window.scrollY;
    const offset = 100; // Offset from top
    
    let activeHeading = null;
    
    for (let i = headings.length - 1; i >= 0; i--) {
      const heading = headings[i];
      const rect = heading.element.getBoundingClientRect();
      const absoluteTop = rect.top + scrollTop;
      
      if (scrollTop >= absoluteTop - offset) {
        activeHeading = heading;
        break;
      }
    }

    // Remove all active states
    links.forEach(link => {
      link.classList.remove('is-active');
      let parent = link.parentElement;
      while (parent && parent !== toc) {
        parent.classList.remove('is-active');
        parent = parent.parentElement;
      }
    });

    // Add active state to current heading
    if (activeHeading) {
      activeHeading.link.classList.add('is-active');
      
      // Add active state to parent list items to trigger expand
      let parent = activeHeading.link.parentElement;
      while (parent && parent !== toc) {
        if (parent.tagName === 'LI') {
          parent.classList.add('is-active');
        }
        parent = parent.parentElement;
      }
      
      // Scroll link into view if needed
      const linkRect = activeHeading.link.getBoundingClientRect();
      const tocContainer = toc.closest('.toc-container');
      if (tocContainer) {
        const containerRect = tocContainer.getBoundingClientRect();
        if (linkRect.top < containerRect.top || linkRect.bottom > containerRect.bottom) {
          activeHeading.link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
    }
  }

  // Throttle function
  function throttle(func, wait) {
    let timeout;
    return function() {
      if (!timeout) {
        timeout = setTimeout(() => {
          func();
          timeout = null;
        }, wait);
      }
    };
  }

  // Listen to scroll events
  window.addEventListener('scroll', throttle(updateActiveLink, 100));
  
  // Initial update
  updateActiveLink();
  
  // Update on load (for anchor links)
  window.addEventListener('load', updateActiveLink);
})();
