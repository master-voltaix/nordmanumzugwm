(function () {
  var header = document.querySelector('.header');
  var nav = document.getElementById('nav');
  var burger = document.getElementById('burger');

  window.addEventListener('scroll', function () {
    header.classList.toggle('is-stuck', window.scrollY > 50);
  }, { passive: true });

  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open);
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });

  // Aktiven Menüpunkt beim Scrollen markieren
  var links = Array.prototype.slice.call(nav.querySelectorAll(':scope > ul > li > a'));
  var sections = links.map(function (a) {
    var id = a.getAttribute('href').slice(1);
    return id === 'top' ? null : document.getElementById(id);
  });
  function setActive() {
    var pos = window.scrollY + 140, current = 0;
    sections.forEach(function (s, i) { if (s && s.offsetTop <= pos) current = i; });
    links.forEach(function (a, i) { a.classList.toggle('is-active', i === current); });
  }
  window.addEventListener('scroll', setActive, { passive: true });

  // Einblenden beim Scrollen
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  // Formulare: nur Demo-Bestätigung, es werden keine Daten versendet
  document.querySelectorAll('form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      form.classList.add('is-sent');
      form.reset();
    });
  });
})();
