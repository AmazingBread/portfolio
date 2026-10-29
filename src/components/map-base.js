export function createMap(element) {
  const map = L.map(element, { center: [35.17, 129.07], zoom: 12, scrollWheelZoom: true });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  const observer = new ResizeObserver(() => map.invalidateSize({ pan: false }));
  observer.observe(element);
  return {
    map,
    destroy() {
      observer.disconnect();
      map.remove();
    },
  };
}
export function pin(point, color = '#126bd0') {
  const icon = L.divIcon({
    className: 'demo-pin',
    iconSize: [26, 34],
    iconAnchor: [13, 34],
    html:
      '<svg viewBox="0 0 26 34" width="26" height="34"><path d="M13 33C10 27 1 19 1 13a12 12 0 0 1 24 0c0 6-9 14-12 20Z" fill="' +
      color +
      '" stroke="white" stroke-width="2"/><circle cx="13" cy="13" r="4" fill="white"/></svg>',
  });
  const marker = L.marker([point.lat, point.lng], { icon });
  const text = document.createElement('span');
  text.textContent = point.name;
  marker.bindTooltip(text, {
    permanent: true,
    direction: 'top',
    offset: [0, -34],
    className: 'demo-map-label',
  });
  return marker;
}
