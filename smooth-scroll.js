// Smooth Scroll + Active Nav Highlight
const links = document.querySelectorAll('a[href^="#"]');
const sections = document.querySelectorAll("section");

links.forEach(link => {
    link.addEventListener("click", e => {
        const id = link.getAttribute("href");
        if (!id || id === "#" || id === "#/") return;

        e.preventDefault();
        const target = document.querySelector(id);
        if (!target) return;

        target.scrollIntoView({ behavior: "smooth", block: "start" });

        document.body.classList.remove("nav-open"); // future mobile nav
    });
});

// Intersection Observer → Highlight active nav
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const id = `#${entry.target.id}`;
        const navLink = document.querySelector(`a[href="${id}"]`);

        if (entry.isIntersecting && navLink) {
            document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
            navLink.classList.add("active");
        }
    });
}, { threshold: 0.6 });

sections.forEach(section => observer.observe(section));
