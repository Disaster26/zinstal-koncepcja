(function () {
  'use strict';
  if (/[?&]v=b/.test(location.search)) document.body.classList.add('hB');

  /* cień nagłówka */
  var top = document.getElementById('top');
  function cien() { top.classList.toggle('cien', window.scrollY > 8); }
  window.addEventListener('scroll', cien, { passive: true }); cien();

  /* menu mobilne */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu-mob');
  function zamknij() { menu.hidden = true; burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Otwórz menu'); }
  burger.addEventListener('click', function () {
    var otw = menu.hidden;
    menu.hidden = !otw;
    burger.setAttribute('aria-expanded', String(otw));
    burger.setAttribute('aria-label', otw ? 'Zamknij menu' : 'Otwórz menu');
  });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) zamknij(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { zamknij(); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth > 1060 && !menu.hidden) zamknij(); });

  /* przeciąganie myszą w poziomych torach (palec działa natywnie) */
  function przeciagaj(tor, onEnd) {
    var start = null, sl = 0, ruch = false;
    tor.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0 || tor.scrollWidth <= tor.clientWidth + 2) return;
      if (e.target.closest('button')) return;
      start = e.clientX; sl = tor.scrollLeft; ruch = false;
      e.stopPropagation();
    });
    window.addEventListener('pointermove', function (e) {
      if (start === null) return;
      var dx = e.clientX - start;
      if (Math.abs(dx) > 5) { ruch = true; tor.classList.add('ciag'); tor.style.scrollSnapType = 'none'; }
      if (ruch) tor.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function (e) {
      if (start === null) return;
      var dx = e.clientX - start; start = null;
      tor.classList.remove('ciag');
      if (ruch) {
        if (onEnd) onEnd(dx); else tor.style.scrollSnapType = '';
        setTimeout(function () { ruch = false; }, 0);
      }
    });
    tor.addEventListener('click', function (e) { if (ruch) { e.preventDefault(); e.stopPropagation(); } }, true);
    tor.addEventListener('dragstart', function (e) { e.preventDefault(); });
  }
  document.querySelectorAll('[data-tor]').forEach(function (t) { przeciagaj(t); });

  /* galerie w kartach: palec, mysz, strzałki, klawiatura, licznik, leniwe ładowanie */
  document.querySelectorAll('[data-gal]').forEach(function (g) {
    var tor = g.querySelector('.gal-tor'), sl = tor.children, n = sl.length, lic = g.querySelector('.gal-lic b');
    function idx() { return Math.round(tor.scrollLeft / tor.clientWidth); }
    function idz(i) {
      i = (i + n) % n;
      tor.style.scrollSnapType = 'none';
      tor.scrollTo({ left: i * tor.clientWidth, behavior: 'smooth' });
      clearTimeout(tor._t); tor._t = setTimeout(function () { tor.style.scrollSnapType = ''; }, 450);
    }
    g.querySelector('.gal-p').addEventListener('click', function () { idz(idx() - 1); });
    g.querySelector('.gal-n').addEventListener('click', function () { idz(idx() + 1); });
    tor.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); idz(idx() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); idz(idx() - 1); }
    });
    tor.addEventListener('scroll', function () { lic.textContent = Math.min(n, idx() + 1); }, { passive: true });
    przeciagaj(tor, function (dx) {
      var i = Math.round((tor.scrollLeft) / tor.clientWidth);
      if (Math.abs(dx) > 40) i = Math.floor((tor.scrollLeft + (dx < 0 ? tor.clientWidth * 0.99 : 0)) / tor.clientWidth);
      idz(Math.max(0, Math.min(n - 1, i)));
    });
    /* poziome przewijanie galerii nie ma przesuwać toru kart */
    tor.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
  });

  /* przycisk z typem -> wybór w formularzu */
  var typ = document.getElementById('typ');
  document.querySelectorAll('[data-typ]').forEach(function (a) {
    a.addEventListener('click', function () {
      var v = a.dataset.typ;
      [].forEach.call(typ.options, function (o) { if (o.text === v) typ.value = v; });
    });
  });

  /* nazwa pliku */
  var plik = document.querySelector('.plik input');
  if (plik) plik.addEventListener('change', function () {
    var c = plik.files.length;
    plik.nextElementSibling.textContent = c ? (c === 1 ? plik.files[0].name : 'Wybrane pliki: ' + c) : 'Dołącz projekt lub przedmiar (opcjonalnie)';
  });

  /* formularz pokazowy - bez wysyłki */
  var form = document.getElementById('form');
  var info = document.getElementById('form-info');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nazwa = form.nazwa.value.trim(), tel = form.tel.value.trim(), mail = form.email.value.trim();
    if (!nazwa || (!tel && !mail)) {
      info.className = 'form-info blad';
      info.textContent = 'Podaj imię i nazwisko (lub firmę) oraz telefon albo e-mail.';
      return;
    }
    info.className = 'form-info ok';
    info.textContent = 'Dziękujemy. W docelowej stronie zapytanie trafi od razu na zinstal@zinstal.pl.';
    form.reset();
  });

  /* dolny pasek na telefonie: dopiero po przewinięciu za przycisk w hero */
  var pasek = document.getElementById('mob-pasek');
  var cta = document.getElementById('hero-cta');
  var kontakt = document.getElementById('kontakt');
  if ('IntersectionObserver' in window && pasek && cta) {
    var zaCta = false, wKontakcie = false;
    function ustaw() {
      var w = zaCta && !wKontakcie;
      pasek.classList.toggle('widac', w);
      pasek.setAttribute('aria-hidden', String(!w));
      pasek.querySelectorAll('a').forEach(function (a) { a.tabIndex = w ? 0 : -1; });
    }
    new IntersectionObserver(function (en) { zaCta = !en[0].isIntersecting && en[0].boundingClientRect.top < 0; ustaw(); }).observe(cta);
    new IntersectionObserver(function (en) { wKontakcie = en[0].isIntersecting; ustaw(); }, { threshold: 0.1 }).observe(kontakt);
  }
})();
