// Ethiks Fit-out. FORM_ENDPOINT is where enquiries are posted as JSON.
// While it is empty, a form opens the visitor's own email app addressed to info@ethiks.co.uk.
var FORM_ENDPOINT = '';

// scroll rule: the green datum reads the scroll position, 1px to 1mm
(function () {
  var out = document.querySelector('.rule span');
  if (!out) return;
  function read() { out.textContent = ('0000' + Math.round(window.scrollY)).slice(-5) + ' mm'; }
  read(); window.addEventListener('scroll', read, { passive: true });
})();

// reveal sections as they come into view
(function () {
  var els = document.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('on'); }); return; }
  var io = new IntersectionObserver(function (items) { items.forEach(function (i) { if (i.isIntersecting) { i.target.classList.add('on'); io.unobserve(i.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
  els.forEach(function (e) { io.observe(e); });
})();

// drag the photo strip sideways with the mouse
document.querySelectorAll('.strip').forEach(function (s) {
  var down = false, x0 = 0, l0 = 0;
  s.addEventListener('mousedown', function (e) { down = true; x0 = e.pageX; l0 = s.scrollLeft; });
  window.addEventListener('mousemove', function (e) { if (!down) return; var d = e.pageX - x0; if (Math.abs(d) > 4) s.classList.add('drag'); s.scrollLeft = l0 - d; });
  window.addEventListener('mouseup', function () { down = false; s.classList.remove('drag'); });
  s.addEventListener('dragstart', function (e) { e.preventDefault(); });
});

// project filters
(function () {
  var buttons = document.querySelectorAll('.filters button');
  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-f');
      buttons.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      document.querySelectorAll('.gal figure[data-g]').forEach(function (fig) { fig.hidden = !(f === 'all' || fig.getAttribute('data-g') === f); });
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
    fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { if (!r.ok) throw new Error('send failed'); form.reset(); show('Thank you. We have your details and will be in touch.'); })
      .catch(function () { show('Sorry, that did not send. Please try again in a moment.', true); })
      .then(function () { button.disabled = false; });
  });
});
