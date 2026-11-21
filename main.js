// Ethiks Fit-out forms. FORM_ENDPOINT is where enquiries are posted as JSON.
// While it is empty, the form opens the visitor's own email app addressed to info@ethiks.co.uk.
var FORM_ENDPOINT = '';

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
