'use strict';

// Статический сайт: год и необязательная аналитика без серверной части.
// Cloudflare Web Analytics подключён отдельно в index.html.
const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());

const CLARITY_PROJECT_ID = 'ywr5x35xgy';
const CONSENT_KEY = 'excel_analytics_clarity_consent_v1';
const banner = document.getElementById('analytics-consent');
const settingsButton = document.getElementById('consent-settings');
const acceptButton = document.getElementById('consent-accept');
const declineButton = document.getElementById('consent-decline');

let clarityStarted = false;
let consent = null;
try {
  const saved = window.localStorage.getItem(CONSENT_KEY);
  if (saved === 'accepted' || saved === 'declined') consent = saved;
} catch (_) {
  // Если localStorage недоступен, запрашиваем выбор заново.
}

function startClarity() {
  if (clarityStarted || consent !== 'accepted') return;
  clarityStarted = true;

  // Стандартный загрузчик Microsoft Clarity, вызывается только после согласия.
  (function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    t = l.createElement(r);
    t.async = true;
    t.src = 'https://www.clarity.ms/tag/' + i;
    y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, 'clarity', 'script', CLARITY_PROJECT_ID);

  // Согласие на аналитику — без разрешения рекламного хранения.
  window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
}

function updateConsentUi() {
  if (banner) banner.hidden = consent !== null;
  if (settingsButton) settingsButton.hidden = consent === null;
}

function chooseConsent(choice) {
  const previous = consent;
  consent = choice;
  try { window.localStorage.setItem(CONSENT_KEY, choice); } catch (_) {}
  updateConsentUi();

  // После отзыва согласия перегружаем страницу, чтобы завершить текущую
  // запись Clarity. Новая загрузка уже не подключит его скрипт.
  if (choice === 'declined' && previous === 'accepted' && clarityStarted) {
    window.location.reload();
    return;
  }
  if (choice === 'accepted') startClarity();
}

if (acceptButton) acceptButton.addEventListener('click', () => chooseConsent('accepted'));
if (declineButton) declineButton.addEventListener('click', () => chooseConsent('declined'));
if (settingsButton) {
  settingsButton.addEventListener('click', () => {
    // Выбор меняется только явным нажатием «Разрешить» или «Отклонить».
    if (banner) banner.hidden = false;
    settingsButton.hidden = true;
  });
}
updateConsentUi();
if (consent === 'accepted') startClarity();

// Три основных CTA: фиксируем намерение открыть Telegram,
// но НЕ считаем это отправленной заявкой или оплаченным заказом.
for (const link of document.querySelectorAll('a.tracked[data-cta]')) {
  link.addEventListener('click', () => {
    if (consent !== 'accepted' || !clarityStarted || typeof window.clarity !== 'function') return;
    window.clarity('event', 'telegram_click');
    window.clarity('set', 'telegram_button', link.dataset.cta || 'unknown');
  });
}
