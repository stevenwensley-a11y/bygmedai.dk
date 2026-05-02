/**
 * BygMedAI Cookie Consent — Datatilsynet-compliant
 * Issue stevenwensley-a11y/bygmedai.dk#3 (G2 Sitewide GA samtykke)
 *
 * Pattern:
 *   1. Define window.dataLayer + window.gtag (no-op stub) FØR side-script kører,
 *      så inline onclick="gtag(...)" ikke throw'er ReferenceError.
 *   2. Set Google Consent Mode V2 default = denied.
 *   3. Vis Datatilsynet-compliant banner: "Accepter" / "Afvis" — equal-weighted, no pre-check.
 *   4. Persistér valg i localStorage med 12 mdr expiry. Re-prompt efter expiry.
 *   5. Ved "Accepter" → load gtag.js dynamically + consent update granted.
 *   6. Ved "Afvis" → INGEN gtag.js load. Inline events sidder i dataLayer men sender ikke.
 *
 * Consent revoke: window.bygmedaiCookieConsent.revoke() — fjerner valg + reload.
 */
(function () {
  'use strict';

  var CONSENT_KEY = 'bygmedai_cookie_consent';
  var CONSENT_TS_KEY = 'bygmedai_cookie_consent_ts';
  var EXPIRY_MS = 365 * 24 * 60 * 60 * 1000; // 12 months
  var GA_ID = (document.currentScript && document.currentScript.dataset && document.currentScript.dataset.gaId) || 'G-BZME709L33';

  // Always-define dataLayer + gtag stub (so onclick-handlers ikke throw)
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function () { window.dataLayer.push(arguments); };
  }

  // Google Consent Mode V2 — default = denied
  window.gtag('consent', 'default', {
    'ad_storage': 'denied',
    'analytics_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'wait_for_update': 500
  });

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, val) {
    try { localStorage.setItem(key, val); } catch (e) {}
  }
  function safeRemove(key) {
    try { localStorage.removeItem(key); } catch (e) {}
  }

  function getDecision() {
    var v = safeGet(CONSENT_KEY);
    var ts = parseInt(safeGet(CONSENT_TS_KEY), 10);
    if (!v || !ts || isNaN(ts) || (Date.now() - ts > EXPIRY_MS)) return null;
    return v;
  }

  function setDecision(value) {
    safeSet(CONSENT_KEY, value);
    safeSet(CONSENT_TS_KEY, String(Date.now()));
  }

  function clearDecision() {
    safeRemove(CONSENT_KEY);
    safeRemove(CONSENT_TS_KEY);
  }

  function loadGtag() {
    if (window.__bygmedaiGaLoaded) return;
    window.__bygmedaiGaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { 'anonymize_ip': true });
  }

  function applyDecision(decision) {
    if (decision === 'accepted') {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted',
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied'
      });
      loadGtag();
    }
    // 'rejected' → no-op; defaults stay denied
  }

  function buildBanner() {
    var banner = document.createElement('div');
    banner.id = 'bygmedai-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'bcb-title');
    banner.setAttribute('aria-describedby', 'bcb-desc');
    banner.setAttribute('aria-modal', 'false');
    banner.innerHTML =
      '<div class="bcb-inner">' +
        '<div class="bcb-content">' +
          '<h2 id="bcb-title">Vi bruger cookies</h2>' +
          '<p id="bcb-desc">Vi bruger Google Analytics til at forstå, hvordan hjemmesiden bruges. ' +
          'Vi sætter ingen cookies eller sender data, før du har givet samtykke. ' +
          '<a href="/privatlivspolitik/">Læs vores privatlivspolitik</a>.</p>' +
        '</div>' +
        '<div class="bcb-buttons">' +
          '<button type="button" class="bcb-btn bcb-btn-reject" id="bcb-reject">Afvis</button>' +
          '<button type="button" class="bcb-btn bcb-btn-accept" id="bcb-accept">Accepter</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(banner);

    document.getElementById('bcb-accept').addEventListener('click', function () {
      setDecision('accepted');
      applyDecision('accepted');
      banner.remove();
    });
    document.getElementById('bcb-reject').addEventListener('click', function () {
      setDecision('rejected');
      banner.remove();
    });
  }

  function init() {
    var decision = getDecision();
    if (decision === 'accepted') {
      applyDecision('accepted');
    } else if (decision === 'rejected') {
      // no banner, no GA
    } else {
      buildBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API for /privatlivspolitik/ revoke link or settings UI
  window.bygmedaiCookieConsent = {
    decision: function () { return getDecision(); },
    revoke: function () { clearDecision(); window.location.reload(); },
    show: buildBanner
  };
})();
