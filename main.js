// Ethiks Fit-out. FORM_ENDPOINT is where enquiries are posted as JSON.
// It points at the Zapier workflow "Ethiks website forms to email", which emails each form to the matching Ethiks inbox.
var FORM_ENDPOINT = 'https://hooks.zapier.com/hooks/catch/25369631/8KvtTZa0at3Oadt9/';
var CALM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// hero slideshow: crossfade every few seconds; the labels jump to a photo
(function () {
  var figs = document.querySelectorAll('.slides figure'), dots = document.querySelectorAll('.dots button');
  if (figs.length < 2) return;
  var i = 0, ms = 6000, timer;
  document.querySelector('.hero2').style.setProperty('--slide-ms', ms + 'ms');
  function show(n) {
    figs[i].classList.remove('on'); dots[i].classList.remove('on');
    i = (n + figs.length) % figs.length;
    figs[i].classList.add('on'); void dots[i].offsetWidth; dots[i].classList.add('on');
  }
  function play() { clearInterval(timer); if (!CALM) timer = setInterval(function () { show(i + 1); }, ms); }
  dots.forEach(function (d, n) { d.addEventListener('click', function () { show(n); play(); }); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) clearInterval(timer); else play(); });
  play();
})();

// service panels: the one under the pointer (or focus) opens
(function () {
  var panels = document.querySelectorAll('.panel');
  panels.forEach(function (p) {
    function open() { panels.forEach(function (o) { o.classList.toggle('on', o === p); }); }
    p.addEventListener('mouseenter', open); p.addEventListener('focus', open);
  });
})();

// count up a number when it scrolls into view
(function () {
  var els = document.querySelectorAll('[data-count]');
  if (CALM || !('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (items) {
    items.forEach(function (it) {
      if (!it.isIntersecting) return; io.unobserve(it.target);
      var el = it.target, end = +el.getAttribute('data-count'), start = end - 60, t0 = null;
      function step(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 1100); el.textContent = Math.round(start + (end - start) * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  els.forEach(function (e) { io.observe(e); });
})();

// reveal sections as they come into view
(function () {
  var els = document.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('on'); }); return; }
  var io = new IntersectionObserver(function (items) { items.forEach(function (i) { if (i.isIntersecting) { i.target.classList.add('on'); io.unobserve(i.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
  els.forEach(function (e) { io.observe(e); });
})();

// photos open full size, with arrows and Escape
(function () {
  var lb = document.querySelector('.lb'); if (!lb) return;
  var big = lb.querySelector('img'), cap = lb.querySelector('p'), set = [], at = 0, last = null;
  function items() { return Array.prototype.filter.call(document.querySelectorAll('[data-zoom]'), function (f) { return !f.hidden && f.getAttribute('aria-hidden') !== 'true'; }); }
  function draw() { var im = set[at].querySelector('img'), c = set[at].querySelector('figcaption'); big.src = im.currentSrc || im.src; big.alt = im.alt; cap.textContent = c ? c.textContent : im.alt; }
  function open(f) { set = items(); at = Math.max(0, set.indexOf(f)); last = document.activeElement; draw(); lb.hidden = false; lb.classList.add('on'); lb.querySelector('.x').focus(); }
  function close() { lb.classList.remove('on'); lb.hidden = true; if (last && last.focus) last.focus(); }
  function move(d) { at = (at + d + set.length) % set.length; draw(); }
  document.addEventListener('click', function (e) {
    var f = e.target.closest && e.target.closest('[data-zoom]');
    if (f) { var src = f; if (f.getAttribute('aria-hidden') === 'true') { var s = f.querySelector('img').getAttribute('src'); src = items().filter(function (x) { return x.querySelector('img').getAttribute('src') === s; })[0] || f; } open(src); return; }
    if (e.target === lb || e.target.classList.contains('x')) close();
    else if (e.target.classList.contains('prev')) move(-1);
    else if (e.target.classList.contains('next')) move(1);
  });
  document.addEventListener('keydown', function (e) { if (lb.hidden) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') move(-1); if (e.key === 'ArrowRight') move(1); });
})();

// phone menu: the button top right opens and closes the page links
(function () {
  var head = document.querySelector('.head'), btn = document.querySelector('.menu'), nav = document.getElementById('nav');
  if (!head || !btn || !nav) return;
  head.classList.add('has-menu');
  btn.addEventListener('click', function () { var open = nav.classList.toggle('open'); btn.setAttribute('aria-expanded', open ? 'true' : 'false'); });
  nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); } });
})();

// project filters
(function () {
  var buttons = document.querySelectorAll('.filters button');
  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-f');
      buttons.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      document.querySelectorAll('.gallery figure[data-g]').forEach(function (fig) { fig.hidden = !(f === 'all' || fig.getAttribute('data-g') === f); });
    });
  });
})();

document.querySelectorAll('form[data-form]').forEach(function (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = form.querySelector('.msg');
    var missing = Array.prototype.filter.call(form.querySelectorAll('[required]'), function (el) { return !el.value.trim(); });
    var email = form.querySelector('input[type="email"]');
    var badEmail = email && email.value.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim());
    function show(text, isError) { msg.hidden = false; msg.textContent = text; msg.classList.toggle('err', !!isError); }
    if (missing.length) { show('Fill in the missing details: ' + missing.map(function (el) { var l = el.closest('label'); return (el.getAttribute('aria-label') || (l ? l.firstChild.textContent : el.name)).trim().toLowerCase(); }).join(', ') + '.', true); missing[0].focus(); return; }
    if (badEmail) { show('Check the email address.', true); email.focus(); return; }
    var kind = form.getAttribute('data-form');
    if (!FORM_ENDPOINT) {
      var to = 'info@ethiks.co.uk';
      var subject = kind === 'register' ? 'Registration to work with Ethiks' : 'Quote request';
      var lines = [];
      new FormData(form).forEach(function (v, k) { if (String(v).trim()) lines.push(k.replace(/_/g, ' ') + ': ' + v); });
      location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
      show('Your email app should open with your details ready to send. If it does not, email ' + to + '.');
      return;
    }
    var data = { form: kind, page: location.pathname };
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    var button = form.querySelector('button'); button.disabled = true;
    // Sent as an ordinary form post, so the browser needs no permission check first.
    var body = new URLSearchParams(); Object.keys(data).forEach(function (k) { body.append(k, data[k]); });
    fetch(FORM_ENDPOINT, { method: 'POST', body: body })
      .then(function (r) { if (!r.ok) throw new Error('send failed'); form.reset(); show('Thank you. We have your details and will be in touch.'); })
      .catch(function () { show('Sorry, that did not send. Please try again in a moment.', true); })
      .then(function () { button.disabled = false; });
  });
});
