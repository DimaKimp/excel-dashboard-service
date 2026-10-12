'use strict';
// Сайт статический: сам по себе НЕ отправляет данные посетителей на сервер.
// Для измерения конверсий подключите аналитику отдельно, только после
// настройки необходимых уведомлений/согласий и проверки правил сервиса.
// Значения utm_source / utm_campaign можно изучать в аналитике, когда она подключена.
const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());

// Если позже подключите Яндекс Метрику и настроите цель telegram_click,
// добавьте её идентификатор в переменную METRIKA_ID ниже.
// Не считайте цель измеренной, пока счётчик и согласия не настроены.
const METRIKA_ID = null;
for (const link of document.querySelectorAll('.tracked')) {
  link.addEventListener('click', () => {
    if (METRIKA_ID && typeof window.ym === 'function') {
      window.ym(METRIKA_ID, 'reachGoal', 'telegram_click', {
        button: link.dataset.cta || 'unknown'
      });
    }
  });
}
