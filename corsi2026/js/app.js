/* Discover CUS Verona – landing corsi
   Vanilla JS: apertura form (dialog), validazione, invio a Google Apps Script, sticky CTA. */
(function () {
  'use strict';

  // === CONFIG ===============================================================
  // URL della Web App di Google Apps Script (vedi README.md → "Collegare il form a Google Sheet").
  // Finché è vuoto, il form mostra un errore e NON invia nulla.
  var FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwt9U-l4OeqYMca8SX8b7lwvhbuZrw1koJQuvw2LmWUEpWzVeOFhGfNKtQLKAd0pQQ/exec';
  // Chiave condivisa con Code.gs (FORM_KEY). Deve essere identica nei due file.
  var FORM_KEY = 'gjkCBp10zGLF5ANeEoiOVydX';
  // ==========================================================================

  var dialog = document.getElementById('formDialog');
  var form = document.getElementById('preForm');
  var success = document.getElementById('formSuccess');
  var formError = document.getElementById('formError');
  var submitBtn = document.getElementById('submitBtn');
  var sticky = document.getElementById('stickyCta');
  var hero = document.querySelector('.hero');
  var lastTrigger = null;

  if (!dialog || !form) return;

  // Fallback per browser senza <dialog>
  var supportsDialog = typeof dialog.showModal === 'function';

  function openForm(trigger) {
    lastTrigger = trigger || null;
    var course = trigger && trigger.getAttribute('data-course');
    if (course) {
      var radio = form.querySelector('input[name="corso"][value="' + course + '"]');
      if (radio) radio.checked = true;
    }
    formError.hidden = true;
    if (supportsDialog) {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
      dialog.style.display = 'block';
    }
    document.body.style.overflow = 'hidden';
    var first = form.querySelector('input[name="nome"]');
    if (first && !success.hidden === false) setTimeout(function () { first.focus(); }, 50);
  }

  function closeForm() {
    if (supportsDialog) { if (dialog.open) dialog.close(); }
    else { dialog.removeAttribute('open'); dialog.style.display = 'none'; }
    document.body.style.overflow = '';
    if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
  }

  document.querySelectorAll('[data-open-form]').forEach(function (btn) {
    btn.addEventListener('click', function () { openForm(btn); });
  });
  document.querySelectorAll('[data-close-form]').forEach(function (btn) {
    btn.addEventListener('click', closeForm);
  });
  dialog.addEventListener('close', function () { document.body.style.overflow = ''; });
  // click sul backdrop → chiudi
  dialog.addEventListener('click', function (e) {
    if (e.target === dialog) closeForm();
  });

  // === Validazione ==========================================================
  function setInvalid(name, invalid) {
    var input = form.querySelector('[name="' + name + '"]');
    if (!input) return;
    var field = input.closest('.field');
    if (field) field.classList.toggle('is-invalid', invalid);
    if (input.type !== 'radio' && input.type !== 'checkbox') input.setAttribute('aria-invalid', invalid ? 'true' : 'false');
  }

  function phoneDigits(v) {
    return v.replace(/\D/g, '');
  }

  function validate() {
    var ok = true;
    var nome = form.nome.value.trim();
    var tel = phoneDigits(form.telefono.value);
    var corso = form.querySelector('input[name="corso"]:checked');
    var privacy = form.privacy.checked;

    var nomeOk = nome.length >= 2;
    var telOk = tel.length >= 6 && tel.length <= 15;

    setInvalid('nome', !nomeOk); if (!nomeOk) ok = false;
    setInvalid('telefono', !telOk); if (!telOk) ok = false;
    setInvalid('corso', !corso); if (!corso) ok = false;
    setInvalid('privacy', !privacy); if (!privacy) ok = false;

    if (!ok) {
      var firstBad = form.querySelector('.is-invalid input');
      if (firstBad) firstBad.focus();
    }
    return ok;
  }

  // rimuovi errore appena l'utente corregge
  form.addEventListener('input', function (e) {
    var field = e.target.closest('.field');
    if (field && field.classList.contains('is-invalid')) field.classList.remove('is-invalid');
  });

  // === Invio ================================================================
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    formError.hidden = true;
    if (!validate()) return;

    // honeypot: se compilato, fingi successo e non inviare
    if (form.website.value) { showSuccess(); return; }

    if (!FORM_ENDPOINT) {
      console.error('[preiscrizione] FORM_ENDPOINT non configurato in js/app.js');
      formError.hidden = false;
      return;
    }

    var data = new URLSearchParams();
    data.append('nome', form.nome.value.trim());
    data.append('telefono', form.telefono.value.trim());
    data.append('corso', form.querySelector('input[name="corso"]:checked').value);
    data.append('data', form.data.value);
    data.append('privacy', 'si');
    data.append('origine', form.origine.value);
    data.append('website', form.website.value); // honeypot (vuoto)
    data.append('k', FORM_KEY);

    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;

    fetch(FORM_ENDPOINT, { method: 'POST', body: data })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json().catch(function () { return { ok: true }; });
      })
      .then(function (json) {
        if (json && json.ok === false) throw new Error(json.error || 'server');
        showSuccess(!!(json && json.duplicate));
      })
      .catch(function (err) {
        console.error('[preiscrizione] errore invio', err);
        formError.hidden = false;
      })
      .finally(function () {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
      });
  });

  function showSuccess(duplicate) {
    var nameEl = success.querySelector('[data-success-name]');
    if (nameEl) nameEl.textContent = form.nome.value.trim().split(' ')[0];
    var dup = success.querySelector('[data-success-duplicate]');
    if (dup) dup.hidden = !duplicate;
    form.hidden = true;
    success.hidden = false;
    var closeBtn = success.querySelector('button');
    if (closeBtn) closeBtn.focus();
  }

  // === Sticky CTA mobile: appare dopo l'hero ================================
  if (sticky && hero && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      var heroVisible = entries[0].isIntersecting;
      sticky.classList.toggle('is-visible', !heroVisible && !(dialog.open));
    }, { threshold: 0, rootMargin: '-40% 0px 0px 0px' });
    io.observe(hero);
    dialog.addEventListener('close', function () {
      var r = hero.getBoundingClientRect();
      sticky.classList.toggle('is-visible', r.bottom < window.innerHeight * 0.4);
    });
    document.querySelectorAll('[data-open-form]').forEach(function (btn) {
      btn.addEventListener('click', function () { sticky.classList.remove('is-visible'); });
    });
  }
})();
