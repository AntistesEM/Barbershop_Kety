const address = JSON.parse(document.getElementById('address-data').textContent);

document.addEventListener('DOMContentLoaded', () => {
  const mapEl = document.getElementById('map');
  if (!mapEl) return;

  // Проверка: подключён ли Leaflet
  if (typeof L === 'undefined') {
    console.error('Leaflet не найден. Убедитесь, что leaflet.js загружен до map.js');
    return;
  }

  // Координаты и подпись
  const lat = address.latitude;
  const lon = address.longitude;
  const zoom = 16;
  const label = address.name;

  // Инициализация карты
  const map = L.map(mapEl, {
    center: [lat, lon],
    zoom,
    scrollWheelZoom: false
  });

  // Тайлы OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Маркер и popup
  const marker = L.marker([lat, lon]).addTo(map);
  marker.bindPopup(`<strong>${label}</strong><br>${address.address}`).openPopup();

  // Доступность: делаем элемент маркера фокусируемым (если доступен)
  const markerEl = (marker.getElement?.());
  if (markerEl) {
    markerEl.setAttribute('tabindex', '0');
    markerEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        marker.openPopup();
      }
    });
  }
});
