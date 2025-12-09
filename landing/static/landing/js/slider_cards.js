document.addEventListener('DOMContentLoaded', () => {
  const masters = JSON.parse(document.getElementById('masters-data').textContent);

  const slider = document.querySelector('.slider');
  if (!slider) return;

  const cardsContainer = slider.querySelector('.cards');
  if (!cardsContainer) return;
  
  // Количество карточек
  const N = masters.length;
  if (N <= 0) return;
  const defaultIndex = 1;

  // Генерируем радиокнопки
  for (let i = 1; i <= N; i++) {
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'card';
    input.id = `c-${i}`;
    input.className = 'visually-hidden';
    input.setAttribute('data-generated', 'true');
    if (i === defaultIndex) input.checked = true;
    slider.insertBefore(input, cardsContainer);
  }

  // Генерируем карточки
  masters.forEach((profile, i) => {
    const label = document.createElement('label');
    label.className = 'item';
    label.setAttribute('for', `c-${i + 1}`);
    label.setAttribute('data-index', i);
    label.setAttribute('role', 'listitem');

    const divMainContent = document.createElement('div');
    divMainContent.className = 'main_content';
    label.appendChild(divMainContent);

    const divImg = document.createElement('div');
    divImg.className = 'img';
    divMainContent.appendChild(divImg);

    const img = document.createElement('img');
    img.alt = `Фото ${profile.name}`;
    img.src = profile.photo;
    // fallback при ошибке загрузки
    img.onerror = () => { img.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22150%22 height=%22210%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23ddd%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23666%22 font-size=%2216%22%3Eno image%3C/text%3E%3C/svg%3E'; };
    divImg.appendChild(img);

    const divContent = document.createElement('div');
    divContent.className = 'content';
    divMainContent.appendChild(divContent);

    const h2 = document.createElement('h2');
    h2.textContent = profile.name;
    divContent.appendChild(h2);

    const h4 = document.createElement('h4');
    h4.textContent = profile.specialty;
    divContent.appendChild(h4);

    const p = document.createElement('p');
    p.setAttribute('data-simplebar', 'true'); // Устанавливаем атрибут = 'data-simplebar';
    p.textContent = profile.description;
    divContent.appendChild(p);

    const divSocial = document.createElement('div');
    divSocial.className = 'social';
    divContent.appendChild(divSocial);

    // Создаём иконки
    profile.socials.forEach((social) => {
      const divIcon = document.createElement('div');
      divIcon.className = 'icon';
      divSocial.appendChild(divIcon);

      const a = document.createElement('a');
      a.href = social.href;
      a.setAttribute('aria-label', social.href.startsWith('tel:') ? 'phone' : `link ${profile.name}`);
      a.target = social.href.startsWith('#') ? '_self' : '_blank';
      a.rel = a.target === '_blank' ? 'noopener noreferrer' : '';

      const i = document.createElement('i');
      // Устанавливаем классы и стиль безопасно
      social.icon.split(' ').forEach(cls => { if (cls) i.classList.add(cls); });
      if (social.color) i.style.setProperty('--color', social.color);
      a.appendChild(i);
      divIcon.appendChild(a);
    });

    cardsContainer.appendChild(label);
  });

  // dotsContainer должен быть let, чтобы при отсутствии можно было создать
  let dotsContainer = slider.querySelector('.dots');
  if (!dotsContainer) {
    const divDots = document.createElement('div');
    divDots.className = 'dots';
    divDots.setAttribute('role', 'tablist');
    divDots.setAttribute('data-generated', 'true');
    slider.appendChild(divDots);
    dotsContainer = divDots;
  }

  // Создаём точки
  for (let i = 0; i < N; i++) {
    const dot = document.createElement('label');
    dot.setAttribute('for', `c-${i + 1}`);
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-selected', i + 1 === defaultIndex ? 'true' : 'false');
    dot.setAttribute('data-generated', 'true');
    dot.tabIndex = 0; // делаем фокусируемыми
    dotsContainer.appendChild(dot);
  }

  // Стили
  let styleCSS = '';
  const centerStyle = `
    z-index: 4;
    padding: 10px;
  `;
  const centerImgStyle = `
    width: 150px;
    height: 150px;
    border: 3px solid #fff;
    border-radius: 50%;
    object-fit: fill;
  `;
  const centerContentStyle = `
    display: block;
  `;
  const next1Style = `
    transform: translate3d(300px, 0, -90px) rotateY(-15deg);
    z-index: 3;
  `;
  const next2Style = `
    transform: translate3d(600px, 0, -180px) rotateY(-25deg);
    z-index: 2;
  `;
  const prev1Style = `
    transform: translate3d(-300px, 0, -90px) rotateY(15deg);
    z-index: 3;
  `;
  const prev2Style = `
    transform: translate3d(-600px, 0, -180px) rotateY(25deg);
    z-index: 2;
  `;
  const farStyle = `
    transform: translate3d(0, 0, -300px) scale(.85);
    z-index: 1;
    opacity: 0;
    pointer-events: none;
  `;
  const dotActive = `
    background-color: #fff;
    transform: scale(2);
    box-shadow: 0px 0px 0px 3px #342f2fe6;
  `;
  const dotNeighbor = `
    transform: scale(1.5);
  `;

  for (let i = 1; i <= N; i++) {
    for (let j = 1; j <= N; j++) {
      const delta = (j - i + N) % N;
      let ruleBody = '';
      if (delta === 0) {
        ruleBody = centerStyle;
      } else if (delta === 1) {
        ruleBody = next1Style;
      } else if (delta === 2) {
        ruleBody = next2Style;
      } else if (delta === N - 1) {
        ruleBody = prev1Style;
      } else if (delta === N - 2) {
        ruleBody = prev2Style;
      } else {
        ruleBody = farStyle;
      }
      styleCSS += `#c-${i}:checked ~ .cards label[for="c-${j}"]{ ${ruleBody} }\n`;
    }
    styleCSS += `#c-${i}:checked ~ .cards label[for="c-${i}"] .main_content .img img{ ${centerImgStyle} }\n`;
    styleCSS += `#c-${i}:checked ~ .cards label[for="c-${i}"] .main_content .content{ ${centerContentStyle} }\n`;
    styleCSS += `#c-${i}:checked ~ .dots label[for="c-${i}"]{ ${dotActive} }\n`;
    const nextIdx = i % N + 1;
    const prevIdx = ((i - 2 + N) % N) + 1;
    styleCSS += `#c-${i}:checked ~ .dots label[for="c-${nextIdx}"], #c-${i}:checked ~ .dots label[for="c-${prevIdx}"]{ ${dotNeighbor} }\n`;
  }

  const EXISTING_STYLE_ID = 'carousel-generated-style';
  const oldStyleTag = document.getElementById(EXISTING_STYLE_ID);
  if (oldStyleTag) oldStyleTag.remove();
  const styleTag = document.createElement('style');
  styleTag.id = EXISTING_STYLE_ID;
  styleTag.textContent = styleCSS;
  document.head.appendChild(styleTag);

  // Работа с aria-selected и клавиатурой
  const radios = Array.from(slider.querySelectorAll('input[type="radio"][name="card"]'));
  const dots = Array.from(dotsContainer.querySelectorAll('label'));

  function updateAriaSelected() {
    const checked = radios.find(r => r.checked);
    const checkedId = checked ? checked.id : null;
    dots.forEach(d => {
      d.setAttribute('aria-selected', d.getAttribute('for') === checkedId ? 'true' : 'false');
    });
  }

  updateAriaSelected();
  radios.forEach(r => r.addEventListener('change', updateAriaSelected));

  // Клавиатурная навигация для точек
  dots.forEach(dot => {
    dot.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Right') {
        e.preventDefault();
        // перейти к следующей
        const currentFor = dot.getAttribute('for');
        const idx = parseInt(currentFor.replace('c-', ''), 10);
        const next = idx % N + 1;
        const nextInput = document.getElementById(`c-${next}`);
        if (nextInput) nextInput.checked = true;
        updateAriaSelected();
        document.querySelector(`label[for="c-${next}"]`).focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        e.preventDefault();
        const currentFor = dot.getAttribute('for');
        const idx = parseInt(currentFor.replace('c-', ''), 10);
        const prev = ((idx - 2 + N) % N) + 1;
        const prevInput = document.getElementById(`c-${prev}`);
        if (prevInput) prevInput.checked = true;
        updateAriaSelected();
        document.querySelector(`label[for="c-${prev}"]`).focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        // пробел или enter — активируем
        e.preventDefault();
        const forId = dot.getAttribute('for');
        const input = document.getElementById(forId);
        if (input) input.checked = true;
        updateAriaSelected();
      }
    });

    // Клик по точке
    dot.addEventListener('click', () => {
      // Немного отложим, чтобы состояние checked обновилось
      setTimeout(updateAriaSelected, 0);
    });
  });
});
