document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.reviews-form');
  const successEl = document.querySelector('.success.message');
  const errorEl = document.querySelector('.error.message');

  let successTimeoutId = null;
  let errorTimeoutId = null;

  /**
   * Показать сообщение об успехе с заданным текстом и таймером.
   * 
   * @param {string} text - текст сообщения
   * @param {number} [ms=3000] - таймер в миллисекундах, по умолчанию 3000
   */
  function showSuccess(text, ms = 3000) {
    if (!successEl) return;
    successEl.textContent = text;
    successEl.classList.remove('visually-hidden');
    // очистить предыдущий таймер, если есть
    if (successTimeoutId) clearTimeout(successTimeoutId);
    successTimeoutId = setTimeout(() => {
      successEl.classList.add('visually-hidden');
      successTimeoutId = null;
    }, ms);
  }

  /**
   * Показать сообщение об ошибке с заданным текстом и таймером.
   * 
   * @param {string} text - текст сообщения
   * @param {number} [ms=3000] - таймер в миллисекундах, по умолчанию 3000
   */
  function showError(text, ms = 3000) {
    if (!errorEl) return;
    errorEl.textContent = text;
    errorEl.classList.remove('visually-hidden');
    if (errorTimeoutId) clearTimeout(errorTimeoutId);
    errorTimeoutId = setTimeout(() => {
      errorEl.classList.add('visually-hidden');
      errorTimeoutId = null;
    }, ms);
  }

  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // прячем сообщения
    successEl.classList.add('visually-hidden');
    errorEl.classList.add('visually-hidden');

    const formData = new FormData(form);
    // берем CSRF из скрытого input, который генерит {% csrf_token %}
    const csrfInput = form.querySelector('input[name="csrfmiddlewaretoken"]');
    const csrftoken = csrfInput ? csrfInput.value : '';
    
    try {
      const resp = await fetch(form.action || window.location.href, {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRFToken': csrftoken,
        },
        body: formData,
        credentials: 'same-origin',
      });

      const data = await resp.json().catch(() => null);

      if (resp.ok && data && data.success) {
        // успешная отправка
        showSuccess('Спасибо! Отзыв отправлен на модерацию.');

        // очистить форму
        form.reset();
      } else {
        // ошибка — показать сообщение
        const msg = data?.error ? data.error : 'Произошла ошибка при отправке';
        showError(msg);
      }
    } catch (err) {
      errorEl.textContent = 'Сетевая ошибка. Попробуйте позже.';
      errorEl.classList.remove('visually-hidden');
      console.error(err);
    }
  });
});
