// Enhanced scroll behavior for navbar
(function() {
  const navbar = document.querySelector('.navbar');
  let lastScrollY = window.scrollY;
  let ticking = false;
  
  function updateNavbar() {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    // Hide navbar when scrolling down, show when scrolling up
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      // Scrolling down
      navbar.style.transform = 'translateY(-100%)';
      navbar.style.opacity = '0';
    } else {
      // Scrolling up or at top
      navbar.style.transform = 'translateY(0)';
      navbar.style.opacity = '1';
    }
    
    lastScrollY = currentScrollY;
    ticking = false;
  }
  
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', onScroll, { passive: true });
  
  // Add smooth transition for navbar
  const style = document.createElement('style');
  style.textContent = `
    .navbar {
      transition: transform 0.3s ease, opacity 0.3s ease, background 0.3s ease;
    }
  `;
  document.head.appendChild(style);
})();

// Enhanced typing effect for hero section
(function() {
  const heroTitle = document.querySelector('.hero-title');
  const originalText = heroTitle.textContent;
  const roles = ["Creative Developer", "Problem Solver", "UI Enthusiast", "Game Tech Explorer"];
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;
  
  function typeEffect() {
    const currentRole = roles[roleIndex];
    
    if (isDeleting) {
      // Deleting text
      heroTitle.textContent = originalText + currentRole.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50;
    } else {
      // Typing text
      heroTitle.textContent = originalText + currentRole.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 100;
    }
    
    // Check if we've finished typing the current role
    if (!isDeleting && charIndex === currentRole.length) {
      // Pause at the end of typing
      typingSpeed = 1000;
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
  
  // Observe all glass containers
  document.querySelectorAll('.glass-container').forEach(el => {
    el.classList.add('fade-on-scroll');
    observer.observe(el);
  });
  
  // Add CSS for fade animation
  const style = document.createElement('style');
  style.textContent = `
    .fade-on-scroll {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .fade-in {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);
})();

// Mouse move effect for navbar (optional enhancement)
(function() {
  const navbar = document.querySelector('.navbar');
  
  document.addEventListener('mousemove', (e) => {
    // Show navbar when mouse moves near the top
    if (e.clientY < 100) {
      navbar.style.transform = 'translateY(0)';
      navbar.style.opacity = '1';
    }
  });
})();