(function () {
  document.documentElement.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var header = document.querySelector('.header');
  var nav = document.getElementById('nav');
  var burger = document.getElementById('burger');
  var progress = document.getElementById('progress');

  window.addEventListener('scroll', function () {
    header.classList.toggle('is-stuck', window.scrollY > 50);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
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

  // Gestaffelte Gruppen und Richtungen vorbereiten
  document.querySelectorAll('.services, .why, .badges, .features, .values, .steps, .reviews, .faq, .contact-list, .about-list, .checks').forEach(function (group) {
    if (group.classList.contains('reveal')) group.classList.add('stagger');
    Array.prototype.forEach.call(group.children, function (child, i) { child.style.setProperty('--i', i); });
  });
  document.querySelectorAll('.about-copy, .contact-copy').forEach(function (el) { el.classList.add('from-left'); });
  document.querySelectorAll('.about-media, .contact-card').forEach(function (el) { el.classList.add('from-right'); });

  // Kennzahlen hochzählen
  function countUp(el) {
    var node = el.firstChild;
    if (!node || node.nodeType !== 3 || reduce) return;
    var target = parseInt(node.nodeValue.replace(/\D/g, ''), 10);
    if (!target) return;
    var start = null, dur = 1600;
    function tick(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
      node.nodeValue = Math.round(target * eased).toLocaleString('de-DE');
      if (p < 1) requestAnimationFrame(tick);
    }
    node.nodeValue = '0';
    requestAnimationFrame(tick);
  }
  var stats = document.querySelector('.stats');
  if (stats) stats.classList.add('reveal');

  // Einblenden beim Scrollen
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add('is-in');
        if (el === stats) el.querySelectorAll('b').forEach(countUp);
        if (el.classList.contains('stagger')) setTimeout(function () { el.classList.add('is-done'); }, 1600);
        io.unobserve(el);
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
