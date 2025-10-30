// Enhanced scroll behavior for navbar
(function() {
  const navbar = document.querySelector('.navbar');
  let lastScrollY = window.scrollY;
  const SCROLL_THRESHOLD = 100; // pixels to scroll before hiding navbar
  
  function updateNavbar() {
    const currentScrollY = window.scrollY;
    
    // Background change on scroll
    if (currentScrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    // Only hide/show if scrolled more than threshold
    if (Math.abs(currentScrollY - lastScrollY) > 50) {
      if (currentScrollY > lastScrollY && currentScrollY > SCROLL_THRESHOLD) {
        // Scrolling down - hide navbar
        navbar.style.transform = 'translateY(-100%)';
      } else {
        // Scrolling up - show navbar
        navbar.style.transform = 'translateY(0)';
      }
    }
    
    lastScrollY = currentScrollY;
  }
  
  // Throttle scroll events for better performance
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateNavbar();
        ticking = false;
      });
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', onScroll, { passive: true });
  
  // Show navbar when hovering near top
  document.addEventListener('mousemove', (e) => {
    if (e.clientY < 80) {
      navbar.style.transform = 'translateY(0)';
    }
  });
})();

// Enhanced typing effect for hero section
(function() {
  const heroSubtitle = document.querySelector('.hero-subtitle');
  const originalText = "Creative Developer & Problem Solver";
  const roles = [/*"UI/UX Enthusiast", "Game Developer", "Full-Stack Developer", "Tech Innovator"*/];
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;
  
  // Clear the original text and set up typing
  heroSubtitle.textContent = "";
  
  function typeEffect() {
    const currentRole = roles[roleIndex];
    
    if (isDeleting) {
      // Deleting text
      heroSubtitle.textContent = originalText + " | " + currentRole.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50;
    } else {
      // Typing text
      heroSubtitle.textContent = originalText + " | " + currentRole.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 100;
    }
    
    // Check if we've finished typing the current role
    if (!isDeleting && charIndex === currentRole.length) {
      // Pause at the end of typing
      typingSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      // Move to next role after deleting
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typingSpeed = 500;
    }
    
    setTimeout(typeEffect, typingSpeed);
  }
  
  // Start the typing effect after a short delay
  setTimeout(typeEffect, 1000);
})();

// Enhanced scroll animations
(function() {
  // Intersection Observer for fade-in animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
      }
    });
  }, observerOptions);
  
  // Observe all glass containers and section headers
  document.querySelectorAll('.glass-container, .section-header').forEach(el => {
    el.classList.add('fade-on-scroll');
    observer.observe(el);
  });
  
  // Add CSS for fade animation
  const style = document.createElement('style');
  style.textContent = `
    .fade-on-scroll {
      opacity: 0;
      transform: translateY(30px);
      transition: opacity 0.8s ease, transform 0.8s ease;
    }
    
    .fade-in {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);
})();

// Add smooth hover effects for interactive elements
(function() {
  // Add ripple effect to buttons
  document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple 0.6s linear;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
      `;
      
      button.style.position = 'relative';
      button.style.overflow = 'hidden';
      button.appendChild(ripple);
      
      setTimeout(() => ripple.remove(), 600);
    });
  });
  
  // Add ripple animation
  const rippleStyle = document.createElement('style');
  rippleStyle.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(rippleStyle);
})();