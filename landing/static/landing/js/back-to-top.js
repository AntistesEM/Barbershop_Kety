(() => {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  const threshold = 300; // px прокрутки, после которых показываем кнопку
  let visible = false;
  let ticking = false;

  /**
   * Обновляет видимость кнопки по текущему положению страницы
   * @return {void}
   */
  function updateVisibility() {
    const y = window.scrollY || window.pageYOffset;
    // если пользователь прокрутил больше, чем threshold (px), то кнопка должна быть видимой
    if (y > threshold && !visible) {
      btn.classList.add('visible');
      visible = true;
    }
    // если пользователь прокрутил меньше, чем threshold (px), то кнопка должна быть скрыта
    else if (y <= threshold && visible) {
      btn.classList.remove('visible');
      visible = false;
    }
  }

  // Throttle для scroll через requestAnimationFrame
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateVisibility();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Показать кнопку, когда пользователь кликает якорную ссылку (href^="#")
  document.addEventListener('click', (e) => {
    // безопасно: иногда e.target может быть текстовым узлом
    const el = (e.target?.closest) ? e.target.closest('a[href^="#"]') : null;
    if (el) {
      // даём время браузеру начать прокрутку, потом проверяем видимость
      setTimeout(updateVisibility, 120);
    }
  });

  // Клик по кнопке: плавный скролл наверх и ожидание окончания, чтобы спрятать кнопку
  btn.addEventListener('click', () => {
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      window.scrollTo(0, 0);
      updateVisibility();
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Ожидание достижения вершины: проверяем в цикле через requestAnimationFrame
    (function waitForTop() {
      if ((window.scrollY || window.pageYOffset) === 0) {
        updateVisibility();
      } else {
        requestAnimationFrame(waitForTop);
      }
    })();
  });

  // Начальная проверка при загрузке
  updateVisibility();
})();

// Пояснения:
// - Реагируем на реальную прокрутку (window.scroll) и вычисляем позицию scrollY — значит кнопка появится при ручной прокрутке.
// - requestAnimationFrame в обработчике scroll предотвращает чрезмерные вызовы и делает работу плавной.
// - Обработчик клика по якорям дополнительно показывает кнопку сразу после перехода по ссылке (иначе при мгновенном переходе к секции кнопка могла не появиться, пока scroll не изменится).
// - При возврате вверх отслеживаем фактическое достижение top === 0 (через рекурсивный requestAnimationFrame), чтобы прятать кнопку после завершения плавного скролла.
// - prefers-reduced-motion: если пользователь предпочитает без анимаций — делаем мгновенный scrollTo и сразу прячем.