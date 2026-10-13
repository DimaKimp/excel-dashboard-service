
'use strict';

// ======================================================
// 1. Текущий год в подвале сайта
// ======================================================

const year = document.getElementById('year');

if (year) {
  year.textContent = String(new Date().getFullYear());
}


// ======================================================
// 2. Настройки Microsoft Clarity
// ======================================================

const CLARITY_PROJECT_ID = 'ywr5x35xgy';

const banner = document.getElementById('analytics-consent');
const settingsButton = document.getElementById('consent-settings');

let clarityStarted = false;

// При каждой загрузке страницы согласие отсутствует.
// localStorage и sessionStorage для согласия не используем.
let consent = null;


// ======================================================
// 3. Подключение Clarity только после разрешения
// ======================================================

function startClarity() {
  if (clarityStarted || consent !== 'accepted') {
    return;
  }

  clarityStarted = true;

  (function(c, l, a, r, i, t, y) {
    c[a] = c[a] || function() {
      (c[a].q = c[a].q || []).push(arguments);
    };

    t = l.createElement(r);
    t.async = true;
    t.src = 'https://www.clarity.ms/tag/' + i;

    y = l.getElementsByTagName(r)[0];

    if (y && y.parentNode) {
      y.parentNode.insertBefore(t, y);
    } else {
      l.head.appendChild(t);
    }

  })(window, document, 'clarity', 'script', CLARITY_PROJECT_ID);

  window.clarity('consentv2', {
    ad_Storage: 'denied',
    analytics_Storage: 'granted'
  });
}


// ======================================================
// 4. Показ и скрытие окна согласия
// ======================================================

function updateConsentUi() {
  if (banner) {
    // Пока решение не принято, окно видно.
    banner.hidden = consent !== null;
  }

  if (settingsButton) {
    // После решения доступно изменение настроек.
    settingsButton.hidden = consent === null;
  }
}


// ======================================================
// 5. Обработка выбора пользователя
// ======================================================

function chooseConsent(choice) {
  if (choice !== 'accepted' && choice !== 'declined') {
    return;
  }

  const wasClarityStarted = clarityStarted;

  consent = choice;

  // Не сохраняем согласие между загрузками страницы.
  updateConsentUi();

  if (choice === 'accepted') {
    startClarity();
    return;
  }

  // Если Clarity уже запущен, отзываем разрешение.
  if (choice === 'declined' && wasClarityStarted) {
    if (typeof window.clarity === 'function') {
      window.clarity('consentv2', {
        ad_Storage: 'denied',
        analytics_Storage: 'denied'
      });
    }

    // Обновляем страницу, чтобы прекратить текущий
    // сеанс работы подключённого Clarity.
    // После F5 снова будет запрошено согласие.
    window.location.reload();
  }
}


// ======================================================
// 6. Обработка нажатий на кнопки
// ======================================================

document.addEventListener('click', function(event) {
  const target = event.target instanceof Element
    ? event.target
    : null;

  if (!target) {
    return;
  }

  if (target.closest('#consent-decline')) {
    event.preventDefault();
    chooseConsent('declined');
    return;
  }

  if (target.closest('#consent-accept')) {
    event.preventDefault();
    chooseConsent('accepted');
    return;
  }

  if (target.closest('#consent-settings')) {
    event.preventDefault();

    if (banner) {
      banner.hidden = false;
    }

    if (settingsButton) {
      settingsButton.hidden = true;
    }
  }

}, true);


// ======================================================
// 7. Обеспечиваем доступность кнопок
// ======================================================

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


// ======================================================
// 8. Первоначальное состояние страницы
// ======================================================

// Окно появляется при КАЖДОЙ загрузке страницы.
// Clarity до нажатия "Разрешить" не подключаем.
updateConsentUi();


// ======================================================
// 9. Отслеживание нажатий на Telegram
// ======================================================

for (const link of document.querySelectorAll(
  'a.tracked[data-cta]'
)) {
  link.addEventListener('click', function() {
    if (
      consent !== 'accepted' ||
      !clarityStarted ||
      typeof window.clarity !== 'function'
    ) {
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
