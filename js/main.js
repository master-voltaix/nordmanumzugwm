(function () {
  // Hier die URL eintragen, an die Anfragen gesendet werden (z. B. Formspree, Make, eigenes Backend).
  // Solange leer, wird nur die Bestätigung angezeigt und nichts versendet.
  var FORM_ENDPOINT = '';

  document.documentElement.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Conversion-Ereignisse für Google Ads / GA4 / Tag Manager
  window.dataLayer = window.dataLayer || [];
  function track(event, params) {
    var data = params || {};
    data.event = event;
    window.dataLayer.push(data);
    if (typeof window.gtag === 'function') window.gtag('event', event, params || {});
  }

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
  var sections = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  function setActive() {
    var pos = window.scrollY + 160, current = -1, best = -1;
    sections.forEach(function (s, i) {
      if (s && s.offsetTop <= pos && s.offsetTop > best) { best = s.offsetTop; current = i; }
    });
    links.forEach(function (a, i) { a.classList.toggle('is-active', i === current); });
  }
  window.addEventListener('scroll', setActive, { passive: true });
  setActive();

  // Anzeigen-Abgleich: ?ort=Altona&leistung=Büroumzug passt Überschriften an das Suchwort an
  var query = new URLSearchParams(window.location.search);
  function cleanParam(name) {
    var v = (query.get(name) || '').trim();
    return /^[A-Za-zÀ-ÿ0-9 .&\-]{2,40}$/.test(v) ? v : '';
  }
  var ort = cleanParam('ort'), leistung = cleanParam('leistung');
  if (ort) document.querySelectorAll('[data-ort]').forEach(function (el) { el.textContent = ort; });
  if (leistung) document.querySelectorAll('[data-leistung]').forEach(function (el) { el.textContent = leistung; });
  if (ort || leistung) document.title = (leistung || 'Umzugsunternehmen') + ' ' + (ort || 'Hamburg') + ' – Festpreis & kostenloses Angebot | Nordmann Umzüge';

  // Kampagnen-Daten merken und mit der Anfrage mitsenden
  var attribution = {};
  try { attribution = JSON.parse(sessionStorage.getItem('attribution') || '{}'); } catch (e) {}
  ['gclid', 'utm_source', 'utm_campaign', 'utm_term'].forEach(function (key) {
    if (query.get(key)) attribution[key] = query.get(key).slice(0, 200);
  });
  if (leistung || ort) attribution.keyword = [leistung, ort].filter(Boolean).join(' ');
  try { sessionStorage.setItem('attribution', JSON.stringify(attribution)); } catch (e) {}

  // Gestaffelte Gruppen und Richtungen vorbereiten
  document.querySelectorAll('.services, .why, .badges, .features, .values, .steps, .reviews, .faq, .contact-list, .about-list, .checks, .prices, .guarantee-list, .area-chips').forEach(function (group) {
    if (group.classList.contains('reveal') && !group.classList.contains('area-chips')) group.classList.add('stagger');
    Array.prototype.forEach.call(group.children, function (child, i) { child.style.setProperty('--i', i); });
  });
  document.querySelectorAll('.about-copy, .contact-copy, .guarantee-copy, .area-copy, .rating-card').forEach(function (el) { el.classList.add('from-left'); });
  document.querySelectorAll('.about-media, .contact-card').forEach(function (el) { el.classList.add('from-right'); });

  // Kennzahlen hochzählen
  function countUp(el) {
    var node = el.firstChild;
    if (!node || node.nodeType !== 3 || reduce) return;
    var target = parseInt(node.nodeValue.replace(/\D/g, ''), 10);
    if (!target) return;
    var start = null, dur = 1800;
    function tick(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1), eased = 1 - Math.pow(1 - p, 4);
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
        if (el.classList.contains('stagger') || el.classList.contains('area-chips')) setTimeout(function () { el.classList.add('is-done'); }, 1900);
        io.unobserve(el);
      });
    }, { threshold: 0.05, rootMargin: '0px 0px 12% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  // Anfrage absenden (oder Demo-Bestätigung, solange kein Endpunkt eingetragen ist)
  function send(form, done) {
    var data = {};
    new FormData(form).forEach(function (value, key) { data[key] = value; });
    Object.keys(attribution).forEach(function (key) { data[key] = attribution[key]; });
    data.formular = form.getAttribute('data-form') || 'kontakt';
    data.seite = window.location.href;
    function finish() {
      track('generate_lead', { form_name: data.formular, objektart: data.objektart || '' });
      done();
    }
    if (!FORM_ENDPOINT) { finish(); return; }
    fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
      .then(function (res) { if (!res.ok) throw new Error(res.status); finish(); })
      .catch(function () { alert('Die Anfrage konnte leider nicht gesendet werden. Bitte rufen Sie uns an: 040 228 594 170'); });
  }

  // Mehrstufiges Angebotsformular im Hero
  var lead = document.getElementById('angebot');
  if (lead && lead.classList.contains('lead')) {
    var steps = Array.prototype.slice.call(lead.querySelectorAll('.lead-step'));
    var btnNext = lead.querySelector('[data-next]'), btnBack = lead.querySelector('[data-back]'), btnSubmit = lead.querySelector('[data-submit]');
    var stepNow = lead.querySelector('[data-step-now]');
    var current = 0, started = false;

    function valid(i) {
      var step = steps[i], ok = true;
      if (i === 0) ok = !!lead.querySelector('input[name="objektart"]:checked');
      else step.querySelectorAll('[required]').forEach(function (field) { if (!field.checkValidity()) ok = false; });
      step.classList.toggle('has-error', !ok);
      return ok;
    }
    function show(i, back) {
      current = i;
      lead.classList.toggle('is-back', !!back);
      lead.setAttribute('data-current', i + 1);
      steps.forEach(function (s, n) { s.classList.toggle('is-active', n === i); });
      stepNow.textContent = i + 1;
      btnBack.hidden = i === 0;
      btnNext.hidden = i === steps.length - 1;
      btnSubmit.hidden = i !== steps.length - 1;
      var first = steps[i].querySelector('input:not([type="radio"]), select');
      if (first && i > 0 && window.innerWidth > 900) first.focus({ preventScroll: true });
    }
    function next() {
      if (!valid(current)) return;
      track('lead_step', { step: current + 1 });
      show(current + 1);
    }
    btnNext.addEventListener('click', next);
    btnBack.addEventListener('click', function () { show(current - 1, true); });
    lead.addEventListener('change', function (e) {
      if (!started) { started = true; track('lead_start'); }
      if (e.target.name === 'objektart' && current === 0) setTimeout(next, 320);
    });
    lead.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.tagName !== 'BUTTON' && current < steps.length - 1) { e.preventDefault(); next(); }
    });
    lead.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!valid(current)) return;
      btnSubmit.disabled = true;
      send(lead, function () { lead.classList.add('is-sent'); });
      setTimeout(function () { btnSubmit.disabled = false; }, 4000);
    });
    lead.setAttribute('data-current', 1);

    // Buttons mit Vorauswahl (z. B. aus den Preiskarten)
    document.querySelectorAll('[data-choice]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var radio = lead.querySelector('input[name="objektart"][value="' + btn.getAttribute('data-choice') + '"]');
        if (radio && current === 0 && !lead.classList.contains('is-sent')) { radio.checked = true; show(1); }
      });
    });

    // Mobile Leiste erst zeigen, wenn das Formular aus dem Bild ist
    var bar = document.querySelector('.sticky-bar');
    if (bar && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        bar.classList.toggle('is-visible', !entries[0].isIntersecting);
      }, { threshold: 0.15 }).observe(lead);
    } else if (bar) bar.classList.add('is-visible');
  }

  // Übrige Formulare
  document.querySelectorAll('form:not(.lead)').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      send(form, function () { form.classList.add('is-sent'); form.reset(); });
    });
  });

  // Klicks auf Telefonnummern und Angebots-Buttons messen
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a');
    if (!link) return;
    var href = link.getAttribute('href') || '';
    if (href.indexOf('tel:') === 0) track('phone_click', { link_text: link.textContent.trim() });
    else if (href === '#angebot') track('cta_click', { link_text: link.textContent.trim() });
  });
})();
