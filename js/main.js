/* =========================================================
   НАСТРОЙКИ
   Номер WhatsApp Натальи — только цифры, с кодом страны, без «+».
   Пример: '79001234567'
   Пока номер пустой, кнопки WhatsApp ведут к форме, а форма работает в демо-режиме.
   ========================================================= */
const WHATSAPP_NUMBER = '60102698156';

(function () {
  'use strict';

  const doc = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const header = document.getElementById('header');
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const fab = document.querySelector('.fab');
  const totop = document.querySelector('.totop');

  requestAnimationFrame(function () { setTimeout(function () { doc.classList.add('is-loaded'); }, 60); });

  /* ---------- Шапка и плавающая кнопка ---------- */
  const heroBtn = document.querySelector('.hero__actions .btn');
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
    // в шапке: пока видна кнопка первого экрана — «Задать вопрос», ниже — «Записаться»
    if (heroBtn) header.classList.toggle('cta-on', heroBtn.getBoundingClientRect().bottom < header.offsetHeight);
    if (fab) fab.classList.toggle('is-visible', window.scrollY > 600);
    if (totop) totop.classList.toggle('is-visible', window.scrollY > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (totop) totop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ---------- Мобильное меню ---------- */
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    header.classList.toggle('is-menu', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  }
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- WhatsApp ---------- */
  if (WHATSAPP_NUMBER) {
    document.querySelectorAll('[data-wa]').forEach(function (a) {
      a.href = 'https://wa.me/' + WHATSAPP_NUMBER;
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }

  /* ---------- Появление при прокрутке ---------- */
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const siblings = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains('reveal'); });
        const delay = Math.min(siblings.indexOf(el), 7) * 90;
        el.style.transitionDelay = delay + 'ms';
        el.classList.add('is-in');
        setTimeout(function () { el.style.transitionDelay = ''; }, delay + 1100);
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- «Записаться» в направлении подставляет его в форму ---------- */
  const topic = document.getElementById('topic');
  document.querySelectorAll('[data-topic]').forEach(function (link) {
    link.addEventListener('click', function () {
      const value = link.getAttribute('data-topic');
      Array.prototype.forEach.call(topic.options, function (o) { if (o.text === value) topic.value = o.value || o.text; });
    });
  });

  /* ---------- Направления: плашка раскрывается при наведении (на телефоне — по нажатию) ---------- */
  const panels = Array.prototype.slice.call(document.querySelectorAll('#dirs .dir'));
  function activate(panel) {
    panels.forEach(function (p) {
      const on = p === panel;
      p.classList.toggle('is-active', on);
      p.setAttribute('aria-expanded', String(on));
    });
  }
  /* на телефоне высота открытой плашки = фото-зона сверху + текст, чтобы текст не закрывал лицо */
  /* на компьютере так же подбирается высота всего ряда плашек */
  function fitPanels() {
    let tallest = 0;
    panels.forEach(function (p) {
      const body = p.querySelector('.dir__body');
      if (!body) return;
      tallest = Math.max(tallest, body.offsetHeight);
      p.style.setProperty('--fit', (body.offsetHeight + 28 + 250) + 'px');
    });
    const list = document.getElementById('dirs');
    if (list && tallest) list.style.setProperty('--fit', (tallest + 36 + 250) + 'px');
  }
  fitPanels();
  window.addEventListener('resize', fitPanels);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitPanels);

  panels.forEach(function (p) {
    p.addEventListener('mouseenter', function () { if (fine) activate(p); });
    p.addEventListener('focusin', function () { activate(p); });
    p.addEventListener('click', function (e) { if (!p.classList.contains('is-active')) { e.preventDefault(); activate(p); } });
    p.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target === p) { e.preventDefault(); activate(p); }
    });
  });

  /* ---------- Жидкое стекло: блик следует за мышкой ---------- */
  if (fine && !reduce) {
    document.querySelectorAll('.lg').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- Лёгкий параллакс стеклянных плашек на первом экране ---------- */
  const hero = document.querySelector('.hero');
  if (hero && fine && !reduce) {
    const layers = Array.prototype.slice.call(hero.querySelectorAll('[data-depth]'));
    let tx = 0, ty = 0, cx = 0, cy = 0, running = false;
    function tick() {
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      layers.forEach(function (el) {
        const d = Number(el.getAttribute('data-depth'));
        el.style.translate = (-cx * d).toFixed(2) + 'px ' + (-cy * d).toFixed(2) + 'px';
      });
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) requestAnimationFrame(tick); else running = false;
    }
    hero.addEventListener('mousemove', function (e) {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      if (!running) { running = true; requestAnimationFrame(tick); }
    });
  }

  /* ---------- Курсор ---------- */
  if (fine) {
    doc.classList.add('has-cursor');
    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot'; ring.className = 'cursor-ring';
    dot.setAttribute('aria-hidden', 'true'); ring.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ring); document.body.appendChild(dot);
    let mx = -100, my = -100, rx = -100, ry = -100, shown = false;
    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      if (!shown) { shown = true; rx = mx; ry = my; dot.classList.add('is-on'); ring.classList.add('is-on'); }
      const t = e.target;
      if (!(t instanceof Element)) return;
      const light = !!t.closest('[data-cursor="light"], .dir, .approach');
      const text = !!t.closest('input, textarea');
      const interactive = !!t.closest('a, button, summary, label, select, .dir');
      dot.classList.toggle('is-light', light); ring.classList.toggle('is-light', light);
      ring.classList.toggle('is-hover', interactive);
      ring.classList.toggle('is-text', text); dot.classList.toggle('is-text', text);
    }, { passive: true });
    document.addEventListener('mouseleave', function () { dot.classList.remove('is-on'); ring.classList.remove('is-on'); shown = false; });
    window.addEventListener('mousedown', function () { ring.classList.add('is-down'); });
    window.addEventListener('mouseup', function () { ring.classList.remove('is-down'); });
    (function loop() {
      const k = reduce ? 1 : 0.2;
      rx += (mx - rx) * k; ry += (my - ry) * k;
      ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)';
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Форма ---------- */
  const form = document.getElementById('form');
  const formBody = document.getElementById('formBody');
  const formDone = document.getElementById('formDone');
  const formError = document.getElementById('formError');
  const doneTitle = document.getElementById('formDoneTitle');
  const doneText = document.getElementById('formDoneText');

  function showError(message, field) {
    formError.textContent = message;
    formError.hidden = false;
    if (field) { field.classList.add('is-invalid'); field.focus(); }
  }
  form.addEventListener('input', function (e) { e.target.classList.remove('is-invalid'); formError.hidden = true; });
  form.addEventListener('change', function () { formError.hidden = true; });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const f = form.elements;
    const name = f.name.value.trim();
    const phone = f.phone.value.trim();
    if (!name) return showError('Напишите, пожалуйста, как к вам обращаться.', f.name);
    if (phone.replace(/\D/g, '').length < 10) return showError('Проверьте номер телефона — кажется, в нём не хватает цифр.', f.phone);
    if (!f.consent.checked) return showError('Включите согласие на обработку персональных данных.');

    const lines = ['Здравствуйте, Наталья! Хочу записаться на консультацию.', 'Имя: ' + name, 'Телефон: ' + phone];
    if (f.topic.value) lines.push('Направление: ' + f.topic.value);
    if (f.message.value.trim()) lines.push('Комментарий: ' + f.message.value.trim());

    if (WHATSAPP_NUMBER) {
      window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
      doneTitle.textContent = 'Спасибо, ' + name + '!';
      doneText.textContent = 'Открылся WhatsApp с готовым сообщением — осталось нажать «Отправить». Я отвечу вам в ближайшее время.';
    } else {
      doneTitle.textContent = 'Демо-режим';
      doneText.textContent = 'Форма работает, но заявка никуда не отправлена: номер WhatsApp ещё не указан в файле js/main.js.';
    }
    formBody.hidden = true;
    formDone.hidden = false;
  });

  /* ---------- Дипломы, сертификаты и отзывы: лента и просмотр крупно ---------- */
  const docsList = document.getElementById('docs');
  const reviewsList = document.getElementById('reviews');
  const lightbox = document.getElementById('lightbox');
  const moreBtn = document.querySelector('.reviews-more');
  if (reviewsList && moreBtn) {
    moreBtn.addEventListener('click', function () {
      reviewsList.classList.add('is-open');
      moreBtn.setAttribute('aria-expanded', 'true');
    });
  }
  if (docsList && lightbox) {
    const docBtns = Array.prototype.slice.call(docsList.querySelectorAll('.doc'));
    const shotBtns = reviewsList ? Array.prototype.slice.call(reviewsList.querySelectorAll('.shot')) : [];
    let group = docBtns;
    const prevBtn = document.querySelector('.docs-nav__btn--prev');
    const nextBtn = document.querySelector('.docs-nav__btn:not(.docs-nav__btn--prev)');
    const lbImg = lightbox.querySelector('.lightbox__img');
    const lbCap = lightbox.querySelector('.lightbox__cap');
    let current = 0;

    function step() { const li = docsList.querySelector('li'); return li ? li.offsetWidth + 18 : 300; }
    function updateNav() {
      const max = docsList.scrollWidth - docsList.clientWidth - 2;
      prevBtn.disabled = docsList.scrollLeft <= 2;
      nextBtn.disabled = docsList.scrollLeft >= max;
    }
    prevBtn.addEventListener('click', function () { docsList.scrollBy({ left: -step(), behavior: 'smooth' }); });
    nextBtn.addEventListener('click', function () { docsList.scrollBy({ left: step(), behavior: 'smooth' }); });
    docsList.addEventListener('scroll', updateNav, { passive: true });
    window.addEventListener('resize', updateNav);
    updateNav();

    function show(i) {
      current = (i + group.length) % group.length;
      const img = group[current].querySelector('img');
      lbImg.src = img.getAttribute('src');
      lbImg.alt = img.alt;
      lbCap.textContent = group === docBtns ? img.alt : '';  // у скриншотов отзывов подпись не нужна
    }
    [docBtns, shotBtns].forEach(function (list) {
      list.forEach(function (b, i) {
        b.addEventListener('click', function () {
          group = list;
          lightbox.classList.toggle('is-shot', list === shotBtns);
          show(i);
          lightbox.showModal();
        });
      });
    });
    lightbox.querySelector('.lightbox__close').addEventListener('click', function () { lightbox.close(); });
    lightbox.querySelector('.lightbox__prev').addEventListener('click', function () { show(current - 1); });
    lightbox.querySelector('.lightbox__next').addEventListener('click', function () { show(current + 1); });
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox || e.target.classList.contains('lightbox__figure')) lightbox.close(); });
    lightbox.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
    lightbox.addEventListener('close', function () { group[current].focus({ preventScroll: true }); });
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
