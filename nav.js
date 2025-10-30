// ...new file...
const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.navbar ul');

if (navToggle && navList) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navList.classList.toggle('open');
  });

  // close menu when a link is clicked (mobile)
  navList.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      navList.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}