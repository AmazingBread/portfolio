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
    '<div id="original-location-app"></div><section class="card implementation-flow"><h2>실제 프로젝트에서의 역할</h2><p>전체 지도는 MapView.vue가 생성하고 Vuex의 SET_MAP으로 공유합니다. 위치 정보 카드는 별도 BuildingLocationMap.vue로 분리해 지도 객체가 서로 간섭하지 않도록 했습니다.</p><p>이 페이지는 그 위치 정보 컴포넌트를 그대로 실행합니다. 이전 포트폴리오의 OpenStreetMap 대체 예제는 연결에서 제외했습니다.</p><a href="https://github.com/AmazingBread/city-safety-on/blob/main/projects/city-safety/source/BuildingLocationMap.vue" target="_blank" rel="noopener noreferrer">실제 지도 컴포넌트 코드 ↗</a></section>' +
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
