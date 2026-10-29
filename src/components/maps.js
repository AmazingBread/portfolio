import BuildingLocationMap from '../../projects/city-safety/source/BuildingLocationMap.js';
import { pageHeader, story } from '../lib/ui.js';
export function mount(root) {
  root.innerHTML =
    pageHeader(
      'PROJECT 01 / GIS',
      'Leaflet 지도 컴포넌트',
      '운영 프로젝트와 같은 EPSG:5181 좌표계·카카오 타일 설정을 사용합니다.',
      ['원본 Vue SFC', 'Leaflet + Proj4', 'EPSG:5181', 'ResizeObserver']
    ) +
    "<section class=\"card implementation-flow\"><h2>왜 위치 지도를 별도 컴포넌트로 만들었나요?</h2><p>관리자 모니터링 화면에서는 건물을 바꿀 때 위치 카드의 지도만 이동해야 합니다. 전체 관제 지도와 인스턴스를 공유하면 중심 위치나 레이어 변경이 다른 화면에 영향을 줄 수 있어 BuildingLocationMap 안에 독립 Leaflet 인스턴스를 생성했습니다.</p><h3>부모 화면 → props → 지도</h3><table style=\"width:100%;text-align:left\"><thead><tr><th>입력</th><th>역할</th></tr></thead><tbody><tr><td>buildingName</td><td>선택한 건물명과 상시 표시 이름표</td></tr><tr><td>coordinates</td><td>[위도, 경도] 형식의 선택 위치</td></tr><tr><td>locations</td><td>건물명과 좌표를 포함한 위치 목록</td></tr></tbody></table><p>부모의 건물 선택 → props 변경 → watcher → updateLocation() → 이전 마커 레이어 제거 → 선택 건물 마커·이름표 생성 → fitBounds()로 화면 맞춤</p><h3>구현에서 처리한 사항</h3><ol><li><strong>지도 타일과 좌표계:</strong> Proj4Leaflet의 EPSG:5181에 해상도·원점·경계를 설정하고 카카오 타일의 확대 단계와 TMS 방향을 맞춥니다. 마커 입력은 [위도, 경도]를 사용합니다.</li><li><strong>중복 마커 방지:</strong> 값이 변경되면 기존 layerGroup을 제거한 뒤 선택한 건물의 마커만 새로 생성합니다.</li><li><strong>좌표 검증:</strong> 숫자 2개인지와 위·경도 범위를 확인합니다. 좌표가 없으면 기본 위치로 이동하고 위치 등록 대기 문구를 표시합니다.</li><li><strong>이름표:</strong> permanent tooltip을 마커 위에 배치합니다. 이름은 textContent로 전달하고 fitBounds 여백으로 잘림을 줄입니다.</li><li><strong>크기 변경:</strong> ResizeObserver가 카드 크기 변화를 감지하면 invalidateSize({ pan: false })를 호출하여 타일 표시를 보정합니다.</li><li><strong>화면 종료:</strong> beforeDestroy에서 observer.disconnect()와 map.remove()를 호출하여 관찰과 지도 자원을 정리합니다.</li></ol><h3>전체 지도와 Vuex의 관계</h3><p>전체 MapView는 지도를 Vuex SET_MAP으로 공유하여 테이블과 마커를 연결합니다. 이 위치 카드는 Vuex 지도 대신 자체 locationMap을 가지며 부모의 props로만 대상을 전달받습니다. 두 지도의 역할을 분리한 구조입니다.</p><p><a href=\"https://github.com/AmazingBread/portfolio/blob/main/projects/city-safety/source/BuildingLocationMap.vue\" target=\"_blank\" rel=\"noopener\">원본 Vue 컴포넌트 코드 ↗</a> · <a href=\"#markers\">테이블·지도 Vuex 연동 사례 →</a></p><h3>직접 확인하는 방법</h3><p>위의 대상 시설을 변경하면 기존 이름표가 사라지고 선택 시설의 위치로 이동합니다. 마우스 휠로 확대·축소할 수 있습니다. 시설명과 좌표는 공개용 예시이며 지도 로직은 원본 컴포넌트입니다.</p></section>" +
    '<div id="original-location-app"></div><section class="card implementation-flow"><h2>실제 프로젝트에서의 역할</h2><p>전체 지도는 MapView.vue가 생성하고 Vuex의 SET_MAP으로 공유합니다. 위치 정보 카드는 별도 BuildingLocationMap.vue로 분리해 지도 객체가 서로 간섭하지 않도록 했습니다.</p><p>이 페이지는 그 위치 정보 컴포넌트를 그대로 실행합니다. 이전 포트폴리오의 OpenStreetMap 대체 예제는 연결에서 제외했습니다.</p><a href="https://github.com/AmazingBread/portfolio/blob/main/projects/city-safety/source/BuildingLocationMap.vue" target="_blank" rel="noopener noreferrer">실제 지도 컴포넌트 코드 ↗</a></section>' +
    story(
      '재사용 위치 지도와 전체 관제 지도가 같은 객체를 공유하면 레이어와 중심 변경이 다른 화면에 영향을 줄 수 있습니다.',
      '위치 카드는 독립 인스턴스를 생성합니다. props watcher로 좌표·건물명을 반영하고 ResizeObserver 및 beforeDestroy에서 크기 보정과 해제를 처리합니다.',
      '시설을 바꾸면 선택한 마커와 이름표만 남습니다. 지도 위에서 휠로 확대·축소할 수 있습니다. 데모에서는 실제 건물 대신 예시 위치를 전달합니다.'
    );
  const vm = new Vue({
    components: { BuildingLocationMap },
    data: () => ({
      selected: 0,
      places: [
        { name: '해온 가상시설', coordinates: [35.165, 129.055] },
        { name: '누리 가상시설', coordinates: [35.183, 129.081] },
      ],
    }),
    template: `<section class="card"><div class="card-heading"><h2>원본 위치 지도 컴포넌트</h2><label>대상 시설 <select v-model.number="selected"><option :value="0">해온 가상시설</option><option :value="1">누리 가상시설</option></select></label></div><div class="original-location-stage"><building-location-map :building-name="places[selected].name" :coordinates="places[selected].coordinates" :locations="places"/></div><p class="inline-message">타일·좌표계·마커 로직: 실제 컴포넌트 / 건물명·좌표: 비식별 예시 데이터</p></section>`,
  }).$mount(root.querySelector('#original-location-app'));
  return () => vm.$destroy();
}
