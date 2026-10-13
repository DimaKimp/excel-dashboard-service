
'use strict';

// Год в подвале сайта.
const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());

// Microsoft Clarity подключается только после согласия.
const CLARITY_PROJECT_ID = 'ywr5x35xgy';
const CONSENT_KEY = 'excel_analytics_clarity_consent_v1';

const banner = document.getElementById('analytics-consent');
const settingsButton = document.getElementById('consent-settings');

let clarityStarted = false;
let consent = null;

try {
  const saved = localStorage.getItem(CONSENT_KEY);
  if (saved === 'accepted' || saved === 'declined') {
    consent = saved;
  }
} catch (_) {
  // Если хранилище недоступно, выбор запрашивается снова.
}

function startClarity() {
  if (clarityStarted || consent !== 'accepted') return;
  clarityStarted = true;

  (function(c, l, a, r, i, t, y) {
    c[a] = c[a] || function() {
      (c[a].q = c[a].q || []).push(arguments);
    };
    t = l.createElement(r);
    t.async = true;
    t.src = 'https://www.clarity.ms/tag/' + i;
    y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, 'clarity', 'script', CLARITY_PROJECT_ID);

  window.clarity('consentv2', {
    ad_Storage: 'denied',
    analytics_Storage: 'granted'
  });
}

function updateConsentUi() {
  if (banner) banner.hidden = consent !== null;
  if (settingsButton) settingsButton.hidden = consent === null;
}

function chooseConsent(choice) {
  const previous = consent;
  consent = choice;

  try {
    localStorage.setItem(CONSENT_KEY, choice);
  } catch (_) {}

  updateConsentUi();

  if (choice === 'declined' &&
      previous === 'accepted' &&
      clarityStarted) {
    location.reload();
    return;
  }

  if (choice === 'accepted') startClarity();
}

// Обработка нажатий на кнопки согласия.
document.addEventListener('click', function(event) {
  const target = event.target instanceof Element
    ? event.target
    : null;

  if (!target) return;

  if (target.closest('#consent-decline')) {
    event.preventDefault();
    chooseConsent('declined');
  } else if (target.closest('#consent-accept')) {
    event.preventDefault();
    chooseConsent('accepted');
  } else if (target.closest('#consent-settings')) {
    event.preventDefault();

    if (banner) banner.hidden = false;
    if (settingsButton) settingsButton.hidden = true;
  }
}, true);

// Даём кнопкам возможность принимать нажатия.
for (const id of [
  'consent-accept',
  'consent-decline',
  'consent-settings'
]) {
  const button = document.getElementById(id);

  if (button) {
    button.style.pointerEvents = 'auto';
    button.style.position = 'relative';
    button.style.zIndex = '2';
  }
}

updateConsentUi();
if (consent === 'accepted') startClarity();

// События перехода в Telegram.
for (const link of document.querySelectorAll(
  'a.tracked[data-cta]'
)) {
  link.addEventListener('click', function() {
    if (consent !== 'accepted' ||
        !clarityStarted ||
        typeof window.clarity !== 'function') {
      return;
    }

    window.clarity('event', 'telegram_click');

    window.clarity(
      'set',
      'telegram_button',
      link.dataset.cta || 'unknown'
    );
  });
}
