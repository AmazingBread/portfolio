import { pageHeader, story } from '../lib/ui.js';
import { createMap } from './map-base.js';
import { makeLocations } from '../lib/data.js';
export function mount(root) {
  root.innerHTML =
    pageHeader(
      '04',
      '마커 & 클러스터',
      '데이터가 늦게 도착해도 첫 진입부터 정확히. 레이어를 갱신하는 흐름을 확인합니다.',
      ['2,000개 마커', '비동기 목록', '레이어 교체']
    ) +
    '<section class="card"><div class="card-heading"><div><h2>가상 센서 분포</h2><p class="muted">클러스터를 클릭하면 해당 영역으로 확대됩니다.</p></div><div class="controls"><label>건수 <select id="marker-count"><option>100</option><option>500</option><option selected>2000</option></select></label><label>상태 <select id="marker-filter"><option value="all">전체</option><option value="warning">경계만</option></select></label><button class="btn small" id="reload-markers">다시 불러오기</button></div></div><div class="map-stage" id="marker-map" aria-label="가상센서 클러스터 지도"></div><p class="inline-message" id="markers-status" role="status">데이터를 준비합니다…</p></section>' +
    story(
      '지도 초기화와 목록 응답이 어긋나면 빈 레이어가 남거나 반복 진입 시 마커가 중복될 수 있습니다.',
      '800ms 지연을 둔 응답을 재현합니다. 요청 번호로 오래된 응답을 무시하고 기존 레이어를 교체합니다.',
      '목록을 불러오는 중 필터를 바꾸거나 다시 불러오기를 눌러도 최신 결과만 표시됩니다.'
    );
  const view = createMap(root.querySelector('#marker-map'));
  let layer = null,
    timeout = null,
    request = 0,
    alive = true;
  const status = root.querySelector('#markers-status');
  function load() {
    const id = ++request;
    clearTimeout(timeout);
    if (layer) {
      view.map.removeLayer(layer);
      layer.clearLayers();
      layer = null;
    }
    status.textContent = '목록 수신 대기 중… (가상 지연 800ms)';
    timeout = setTimeout(() => {
      if (!alive || id !== request) return;
      const count = Number(root.querySelector('#marker-count').value),
        filter = root.querySelector('#marker-filter').value,
        all = makeLocations(count),
        rows = filter === 'warning' ? all.filter((p) => p.status === '경계') : all;
      const next = L.markerClusterGroup({ chunkedLoading: true, showCoverageOnHover: false });
      layer = next;
      const markers = rows.map((point) => {
        const marker = L.marker([point.lat, point.lng]);
        const node = document.createElement('span');
        node.textContent = point.name + ' · ' + point.status;
        marker.bindTooltip(node);
        return marker;
      });
      view.map.addLayer(next);
      next.addLayers(markers);
      status.textContent =
        '원본 ' +
        count.toLocaleString() +
        '개 / 표시 ' +
        rows.length.toLocaleString() +
        '개 · 현재 레이어 1개 · 가상 데이터';
    }, 800);
  }
  root.querySelector('#reload-markers').onclick = load;
  root.querySelector('#marker-count').onchange = load;
  root.querySelector('#marker-filter').onchange = load;
  load();
  return () => {
    alive = false;
    request++;
    clearTimeout(timeout);
    if (layer) layer.clearLayers();
    view.destroy();
  };
}
