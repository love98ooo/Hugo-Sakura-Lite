/**
 * Sakura Theme JavaScript
 */

(function() {
  'use strict';

  // Initialize theme before DOM ready to prevent flash
  initTheme();

  // DOM Ready
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initMobileMenu();
    initSmoothScroll();
    initLazyLoading();
    initKeyboardShortcuts();
    initThemeToggle();
    initCodeHighlight();
    initCodeCopyButtons();
    initMermaid();
    initShareButton();
  }

  /**
   * Theme Initialization (runs immediately to prevent flash)
   */
  function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }

  /**
   * Theme Toggle
   */
  function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    });
  }

  /**
   * Keyboard Shortcuts
   */
  function initKeyboardShortcuts() {
    // Cmd/Ctrl + K to go to search page
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        window.location.href = '/search/';
      }
    });
  }

  /**
   * Mobile Menu
   */
  function initMobileMenu() {
    const menuToggle = document.getElementById('mobileMenuToggle');
    const navOverlay = document.getElementById('mobileNavOverlay');

    if (!menuToggle || !navOverlay) return;

    function toggleMenu() {
      const isActive = navOverlay.classList.toggle('is-active');
      menuToggle.classList.toggle('is-active', isActive);
      document.body.style.overflow = isActive ? 'hidden' : '';
    }

    function closeMenu() {
      navOverlay.classList.remove('is-active');
      menuToggle.classList.remove('is-active');
      document.body.style.overflow = '';
    }

    menuToggle.addEventListener('click', toggleMenu);

    // Close menu when clicking on a link
    navOverlay.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navOverlay.classList.contains('is-active')) {
        closeMenu();
      }
    });
  }

  /**
   * Smooth Scroll for Anchor Links
   */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();

          // Update URL hash
          history.pushState(null, null, href);

          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  /**
   * Lazy Loading for Images with Loading Animation
   * Only applies to: .hero, .post-card, .page-banner
   */
  function initLazyLoading() {
    // Handle post-card images
    document.querySelectorAll('.post-card__thumb img').forEach(img => {
      const thumb = img.closest('.post-card__thumb');
      if (img.complete && img.naturalHeight !== 0) {
        img.classList.add('is-loaded');
        if (thumb) thumb.classList.add('is-loaded');
      } else {
        img.addEventListener('load', function() {
          this.classList.add('is-loaded');
          const thumb = this.closest('.post-card__thumb');
          if (thumb) thumb.classList.add('is-loaded');
        });
        img.addEventListener('error', function() {
          this.classList.add('is-loaded');
          const thumb = this.closest('.post-card__thumb');
          if (thumb) thumb.classList.add('is-loaded');
        });
      }
    });

    // Handle page-banner (uses background-image, so we need to detect load differently)
    document.querySelectorAll('.page-banner').forEach(banner => {
      const bg = banner.querySelector('.page-banner__background');
      if (bg) {
        const bgImage = getComputedStyle(bg).backgroundImage;
        if (bgImage && bgImage !== 'none') {
          const url = bgImage.replace(/url\(['"]?(.+?)['"]?\)/, '$1');
          const img = new Image();
          img.onload = () => banner.classList.add('is-loaded');
          img.onerror = () => banner.classList.add('is-loaded');
          img.src = url;
        } else {
          banner.classList.add('is-loaded');
        }
      } else {
        banner.classList.add('is-loaded');
      }
    });

    // Intersection Observer for lazy loaded images
    if ('IntersectionObserver' in window) {
      const lazyImages = document.querySelectorAll('img[loading="lazy"]:not(.is-loaded)');

      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            // Force load if src is set but not loaded
            if (img.dataset.src) {
              img.src = img.dataset.src;
            }
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px'
      });

      lazyImages.forEach(img => imageObserver.observe(img));
    }
  }

  /**
   * Header Scroll Effect
   */
  (function() {
    const header = document.querySelector('.site-header');
    const hero = document.querySelector('.hero');
    if (!header) return;

    let ticking = false;

    function updateHeader() {
      const currentScroll = window.pageYOffset;
      const threshold = hero ? hero.offsetHeight - 100 : 100;

      if (currentScroll > threshold) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }

      ticking = false;
    }

    // Initial check
    updateHeader();

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });
  })();

  /**
   * Hero Background Loading Animation
   */
  (function() {
    const hero = document.querySelector('.hero');
    const heroBg = document.querySelector('.hero__background');
    if (!hero || !heroBg) return;

    if (heroBg.complete && heroBg.naturalHeight !== 0) {
      heroBg.classList.add('is-loaded');
      hero.classList.add('hero--loaded');
    } else {
      heroBg.addEventListener('load', function() {
        this.classList.add('is-loaded');
        hero.classList.add('hero--loaded');
      });
      heroBg.addEventListener('error', function() {
        this.classList.add('is-loaded');
        hero.classList.add('hero--loaded');
      });
    }
  })();

  /**
   * Hero Scroll Button
   */
  (function() {
    const heroScroll = document.querySelector('.hero__scroll');
    if (!heroScroll) return;

    heroScroll.addEventListener('click', function() {
      const hero = document.querySelector('.hero');
      if (hero) {
        window.scrollTo({
          top: hero.offsetHeight,
          behavior: 'smooth'
        });
      }
    });
  })();

  /**
   * Code Syntax Highlighting with highlight.js
   */
  function initCodeHighlight() {
    if (typeof hljs !== 'undefined') {
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
      });
    }
  }

  /**
   * Copy Button for Code Blocks
   */
  function initCodeCopyButtons() {
    document.querySelectorAll('pre').forEach((pre) => {
      // Skip if already has a copy button
      if (pre.querySelector('.code-copy-btn')) return;

      // Create wrapper for positioning
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      // Create copy button
      const copyBtn = document.createElement('button');
      copyBtn.className = 'code-copy-btn';
      copyBtn.type = 'button';
      copyBtn.setAttribute('aria-label', '复制代码');
      copyBtn.innerHTML = `
        <svg class="icon-copy" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <svg class="icon-check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;

      wrapper.appendChild(copyBtn);

      // Copy functionality
      copyBtn.addEventListener('click', async () => {
        const code = pre.querySelector('code');
        const text = code ? code.textContent : pre.textContent;

        try {
          await navigator.clipboard.writeText(text);
          copyBtn.classList.add('is-copied');
          setTimeout(() => {
            copyBtn.classList.remove('is-copied');
          }, 2000);
        } catch (err) {
          // Fallback for older browsers
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          copyBtn.classList.add('is-copied');
          setTimeout(() => {
            copyBtn.classList.remove('is-copied');
          }, 2000);
        }
      });
    });
  }

  /**
   * Mermaid Diagrams
   */
  function initMermaid() {
    if (typeof mermaid === 'undefined') return;

    // Detect theme
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
      (!document.documentElement.getAttribute('data-theme') &&
       window.matchMedia('(prefers-color-scheme: dark)').matches);

    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'var(--font-mono)',
    });

    // Find all mermaid code blocks and render them
    document.querySelectorAll('pre code.language-mermaid').forEach((block) => {
      const pre = block.parentElement;
      const container = document.createElement('div');
      container.className = 'mermaid';
      container.textContent = block.textContent;
      pre.parentNode.replaceChild(container, pre);
    });

    // Also support <div class="mermaid"> directly
    mermaid.run();
  }

  /**
   * Share Button - Copy URL
   */
  function initShareButton() {
    const shareBtn = document.querySelector('.share-btn');
    if (!shareBtn) return;

    shareBtn.addEventListener('click', async function() {
      const url = window.location.href;

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(url);
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = url;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }

        // Visual feedback
        shareBtn.classList.add('is-copied');
        const originalTitle = shareBtn.getAttribute('title');
        shareBtn.setAttribute('title', '已复制链接');

        setTimeout(() => {
          shareBtn.classList.remove('is-copied');
          shareBtn.setAttribute('title', originalTitle);
        }, 1000);
      } catch (err) {
        console.error('Failed to copy URL:', err);
      }
    });
  }

})();
