const services = JSON.parse(document.getElementById('services-data').textContent);

document.addEventListener('DOMContentLoaded', () => {
    const servicesContainer = document.querySelector('.services-container');

    // Получаем объект service по id (строка/число)
    const getServiceById = (id) => services.find(s => String(s.id) === String(id));

    // Показывает цены и картинку
    const showPrices = (name, prices, img) => {
        getPrices(name, prices, img);
    };

    // Разворачивает/сворачивает .service-item
    const toggleServiceItem = (header) => {
        const serviceItem = header.closest('.service-item');
        if (serviceItem) serviceItem.classList.toggle('expanded');
    };

    // Обработчик клика по .service-header (делегирование)
    servicesContainer.addEventListener('click', (e) => {
        const header = e.target.closest('.service-header');
        if (!header) return;

        const service = getServiceById(header.dataset.serviceId || header.id);
        if (!service) return;

        // Разворачиваем элемент ТОЛЬКО если у него есть подразделы
        if (service.subsections && service.subsections.length > 0) {
            toggleServiceItem(header); // Разворачиваем
        } else {
            // Если подразделов нет, убедимся, что элемент НЕ развернут (на всякий случай)
            const serviceItem = header.closest('.service-item');
            if (serviceItem && serviceItem.classList.contains('expanded')) {
                serviceItem.classList.remove('expanded');
            }
        }

        // Если есть <i>, то показываем цены подпунктов, если нет <i>, то показываем общий прайс
        if (!header.querySelector('i')) { // Если header не содержит <i>
            showPrices(service.name, service.price_list, service.title_image);
        }
        // Если есть <i>, то цены подпунктов показываются в обработчике для h4
    });

    // Делегирование кликов по h4 внутри .service-content — обработка подпунктов
    servicesContainer.addEventListener('click', (e) => {
        const subsectionH4 = e.target.closest('.service-content h4');
        if (!subsectionH4) return;

        const serviceItem = subsectionH4.closest('.service-item');
        if (!serviceItem) return;

        const header = serviceItem.querySelector('.service-header');
        const service = header && getServiceById(header.dataset.serviceId || header.id);
        if (!service || !service.subsections) return; // Если нет сервиса или нет подпунктов, ничего не делаем

        const name = subsectionH4.textContent.trim();
        const subsectionData = service.subsections.find(el => el.name === name);
        if (!subsectionData) return;

        showPrices(subsectionData.name, subsectionData.price_items, subsectionData.title_image);
    });

    // Инициализация: показать данные по умолчанию (первый сервис/первая подсекция)
    const initDefault = () => {
        const firstHeader = document.querySelector('.service-header');
        if (!firstHeader) return;

        const service = getServiceById(firstHeader.dataset.serviceId || firstHeader.id);
        if (!service) return;

        const serviceItem = firstHeader.closest('.service-item');
        
        if (service.subsections && service.subsections.length > 0) {
            const firstSub = service.subsections[0];
            showPrices(firstSub.name, firstSub.price_items, firstSub.title_image);
            // Разворачиваем элемент, только если у него есть подразделы
            if (serviceItem && !serviceItem.classList.contains('expanded')) {
                serviceItem.classList.add('expanded');
            }
        } else {
            // Если подразделов нет, показываем общий прайс сервиса
            showPrices(service.name, service.price_list, service.title_image);
        }
    };

    // Запускаем инициализацию
    initDefault();
});

/**
 * Очищает контейнер от всех дочерних элементов.
 * 
 * Если контейнер имеет метод replaceChildren, то он будет использоваться.
 * Иначе, контейнер будет очищен с помощью innerHTML.
 * @param {HTMLElement} container - контейнер, который нужно очистить
**/
function clear(container) {
    if (typeof container.replaceChildren === 'function') {
        container.replaceChildren();
    } else {
        container.innerHTML = '';
    }
}

/**
 * Очищает контейнер от всех дочерних элементов и
 * рисует там список цен с фотографией.
 * 
 * @param {string} name - имя услуги
 * @param {object[]} prices - массив объектов с информацией о ценах
 * @param {string} img - URL фотографии услуги
 */
function getPrices(name, prices, img) {
    const pricesContainer = document.querySelector('.prices');
    const titleImg = document.querySelector('.title-img');

    clear(pricesContainer);
    clear(titleImg);

    const elementUl = document.createElement('ul');
    elementUl.classList.add('prices-list');

    pricesContainer.appendChild(elementUl);

    for (const price of prices) {
        const elementLi = document.createElement('li');

        const elementPTitle = document.createElement('p');
        elementPTitle.textContent = price.operation_name;
        if (price.duration_minutes !== null) {
            elementPTitle.textContent += ` (${price.duration_minutes} мин.)`;
        }
        elementLi.appendChild(elementPTitle);

        const elementPPrice = document.createElement('p');
        elementPPrice.textContent = `${price.price} руб.`;
        elementLi.appendChild(elementPPrice);
        
        elementUl.appendChild(elementLi);
    }

    const elementImg = document.createElement('img');
    elementImg.alt = `Фото обложка услуги ${name}`;
    elementImg.src = img;
    titleImg.appendChild(elementImg);
}

// Без первоначальной инициализации
// const services = JSON.parse(document.getElementById('services-data').textContent);

// document.addEventListener('DOMContentLoaded', () => {
//     const serviceHeaders = document.querySelectorAll('.service-header');

//     serviceHeaders.forEach(header => {
//         header.addEventListener('click', function () {
//             const service = services.find(service => service.id == header.id);

//             if (header.querySelector('i')) {
//                 // Находим родительский элемент .service-item
//                 const serviceItem = this.closest('.service-item');
//                 // Переключаем класс 'expanded' на родительском элементе
//                 serviceItem.classList.toggle('expanded');

//                 const subsections = serviceItem.querySelectorAll('.service-content h4');
//                 subsections.forEach(subsection => {
//                     subsection.addEventListener('click', () => {
//                         const subsectionData = service.subsections.find(element => element.name == subsection.textContent);
//                         getPrices(subsectionData.name, subsectionData.price_items, subsectionData.title_image);
//                     });
//                 });
//                 return;
//             }

//             getPrices(service.name, service.price_list, service.title_image);
//         });
//     });
// });
