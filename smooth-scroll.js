// Smooth scroll + active nav
const links = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section');

links.forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href');
    if(!id||id==='#')return;
    e.preventDefault();
    document.querySelector(id).scrollIntoView({behavior:'smooth'});
  });
});

const obs=new IntersectionObserver(es=>{
  es.forEach(e=>{
    if(e.isIntersecting){
      document.querySelectorAll('.nav-link').forEach(l=>l.classList.remove('active'));
      const l=document.querySelector(`a[href="#${e.target.id}"]`);
      if(l)l.classList.add('active');
    }
  });
},{threshold:.6});
sections.forEach(s=>obs.observe(s));

// Mobile menu
const nav=document.querySelector(".nav-list");
const overlay=document.querySelector(".nav-overlay");
const toggle=document.querySelector(".nav-toggle");

const close=()=>{nav.classList.remove("open");overlay.classList.remove("show");};
toggle.addEventListener("click",()=>{nav.classList.toggle("open");overlay.classList.toggle("show");});
overlay.addEventListener("click",close);
links.forEach(l=>l.addEventListener("click",close));
