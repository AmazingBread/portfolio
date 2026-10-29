import { pageHeader, story } from '../lib/ui.js';
import { createMap, pin } from './map-base.js';
export function mount(root) {
  root.innerHTML =
    pageHeader(
      '03',
      '지도 인터랙션',
      '지도는 독립 컴포넌트로, 선택한 대상의 위치만 명확하게 표시합니다.',
      ['Leaflet', 'ResizeObserver', '선택 상태 동기화']
    ) +
    '<section class="card"><div class="card-heading"><div><h2>가상 시설 위치</h2><p class="muted">표시 위치는 데모용이며 실제 관제 대상과 무관합니다.</p></div><label>대상 시설 <select id="facility"><option value="0">해온 가상시설</option><option value="1">누리 가상시설</option></select></label></div><div class="map-stage" id="facility-map" aria-label="가상시설 위치 지도"></div><div class="table-footer"><span id="map-status" role="status"></span><span>지도 타일: OpenStreetMap</span></div></section>' +
    story(
      '컨테이너 크기나 대상 선택이 바뀌었을 때 지도와 마커가 이전 상태로 남을 수 있습니다.',
      '독립 지도 인스턴스와 ResizeObserver를 사용하고, 선택 변경 시 기존 레이어를 제거해 한 개의 마커만 유지합니다.',
      '시설을 전환하면 마커·이름표·중심 위치가 함께 바뀝니다. 지도 위에서 휠 확대·축소도 가능합니다.'
    );
  const view = createMap(root.querySelector('#facility-map'));
  let marker;
  const facilities = [
    { name: '해온 가상시설', lat: 35.165, lng: 129.055 },
    { name: '누리 가상시설', lat: 35.183, lng: 129.081 },
  ];
  function show() {
    const i = Number(root.querySelector('#facility').value),
      p = facilities[i];
    if (marker) view.map.removeLayer(marker);
    marker = pin(p, i ? '#cf3789' : '#126bd0').addTo(view.map);
    view.map.setView([p.lat, p.lng], 15);
    root.querySelector('#map-status').textContent = p.name + ' · 표시 마커 1개';
  }
  root.querySelector('#facility').onchange = show;
  show();
  return () => view.destroy();
}
