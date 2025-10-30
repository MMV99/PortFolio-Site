// Smooth scroll + active nav
(function () {
  const links = Array.from(document.querySelectorAll('.nav-list a'));
  const sections = Array.from(document.querySelectorAll('section'));

  // Smooth scroll behavior for internal links
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // update focus for accessibility
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.removeAttribute('tabindex');
    });
  });

  // intersection observer to toggle .active on nav links
  if (sections.length && links.length) {
    const sectionById = {};
    sections.forEach(s => { if (s.id) sectionById[s.id] = s; });

    const linkById = {};
    links.forEach(l => {
      const href = l.getAttribute('href');
      if (href && href.startsWith('#')) linkById[href.slice(1)] = l;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const link = linkById[id];
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    }, { threshold: 0.5 });

    sections.forEach(s => observer.observe(s));
  }
})();