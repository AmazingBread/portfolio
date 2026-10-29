import { pageHeader, story } from '../lib/ui.js';
import { createSyncStore } from '../../projects/city-safety/sync-store.js';
const MapPanel = {
  computed: {
    items() {
      return this.$store.state.cctv800List;
    },
    visible() {
      return this.$store.state.isCctv800Open;
    },
    selected() {
      return this.$store.state.selectedId;
    },
  },
  watch: {
    items() {
      this.draw();
    },
    visible() {
      this.draw();
    },
    selected() {
      this.focus();
    },
  },
  mounted() {
    const crs = new L.Proj.CRS(
      'EPSG:5181',
      '+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
      {
        resolutions: [2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25],
        origin: [-30000, -60000],
        bounds: L.bounds([-30000-Math.pow(2,19)*4,-60000],[-30000+Math.pow(2,19)*5,-60000+Math.pow(2,19)*5]),
      }
    );
    this.map = L.map(this.$refs.map, {
      crs,
      center: [35.179, 129.074],
      zoom: 7,
      maxZoom: 13,
      minZoom: 0,
    });
    L.tileLayer('https://map{s}.daumcdn.net/map_2d/2306uwn/L{z}/{y}/{x}.png', {
      subdomains: '0123',
      zoomReverse: true,
      zoomOffset: 1,
      tms: true,
      maxZoom: 13,
      attribution: '© Kakao',
    }).addTo(this.map);
    this.$store.commit('SET_MAP', Vue.markRaw(this.map));
    this.draw();
    this.observer = new ResizeObserver(() => this.map.invalidateSize({ pan: false }));
    this.observer.observe(this.$refs.map);
  },
  beforeDestroy() {
    this.observer.disconnect();
    this.map.remove();
    this.$store.commit('SET_MAP', null);
  },
  methods: {
    draw() {
      if (!this.map) return;
      if (this.layer) this.map.removeLayer(this.layer);
      this.layer = L.layerGroup().addTo(this.map);
      this.markers = {};
      if (!this.visible) return;
      this.items.forEach((item) => {
        const marker = L.marker(item.coordinates, { icon:L.divIcon({className:'',html:'<div class="flood-pin"></div>',iconSize:[28,28],iconAnchor:[14,28]}),
          /* shared marker selection */
          radius: item.id === this.selected ? 12 : 8,
          color: '#fff',
          weight: 2,
          fillColor: item.id === this.selected ? '#e54c70' : '#126bd0',
          fillOpacity: 1,
        });
        const text = document.createElement('span');
        text.textContent = item.name;
        marker
          .bindTooltip(text, { direction: 'top' })
          .on('click', () => this.$store.dispatch('selectCctv', item.id))
          .addTo(this.layer);
        this.markers[item.id] = marker;
      });
      this.focus();
    },
    focus() {
      if (!this.map) return;
      for (const [id, marker] of Object.entries(this.markers || {})) {
        /* circle-only styles are not used by pin markers. */
        marker.setOpacity(Number(id) === this.selected ? 1 : .85);
        /* marker.setStyle({
          fillColor: Number(id) === this.selected ? '#e54c70' : '#126bd0',
          radius: Number(id) === this.selected ? 12 : 8,
        }); */
        if (Number(id) === this.selected) {
          marker.bindPopup('<b>'+this.items.find(x=>x.id===Number(id)).name+'</b><br>도로침수위 · 안전<br>관측값: 0 cm').openPopup();
          this.map.panTo(marker.getLatLng());
        }
      }
    },
  },
  template: '<div ref="map" class="sync-map" aria-label="Vuex 연동 지도"></div>',
};
const SensorList = {
  computed: {
    items() {
      return this.$store.state.cctv800List;
    },
    selected() {
      return this.$store.state.selectedId;
    },
  },
  template: `<div class="sync-list"><h3>도로침수 <small>(예시 3개소)</small></h3><table style="width:100%;border-collapse:collapse"><thead><tr><th>지점명</th><th>범례</th><th>관측값(cm)</th></tr></thead><tbody><tr v-for="item in items" :key="item.id" :style="{background:selected===item.id?'#e4efff':'transparent'}"><td><button :aria-pressed="selected===item.id" @click="$store.dispatch('selectCctv',item.id)">{{item.name}}</button></td><td><span class="flood-badge">안전</span></td><td>0</td></tr></tbody></table><p v-if="!items.length">목록 응답 대기…</p></div>`,
};
export function mount(root) {
  root.innerHTML =
    pageHeader(
      'PROJECT 01 / STATE',
      'Vuex 기반 지도·컴포넌트 동기화',
      '메뉴·목록·지도에서 같은 상태를 참조하고, 서로 다른 입력을 일관된 화면으로 반영합니다.',
      ['Vue 2 + Vuex 3', 'Mutation / Action', '선택 상태 동기화', '비동기 초기화']
    ) +
    '<section class=\"card implementation-flow\"><p class=\"eyebrow\">테이블과 지도</p><h2>테이블의 센서를 지도 마커와 연결하기</h2><p>도로침수 테이블에서 선택한 센서를 지도에서 정확하게 찾고, 같은 센서의 상세 팝업을 표시하는 기능입니다.</p><figure style=\"margin:20px 0\"><a href=\"assets/city-safety/map-table-operation.png\" target=\"_blank\" rel=\"noopener\"><img src=\"assets/city-safety/map-table-operation.png\" style=\"width:100%;height:auto;border-radius:12px\" alt=\"부산 도시안전ON 실제 운영 화면: 지도 위 센서 마커와 도로침수 테이블\"></a><figcaption>사용자가 제공한 실제 운영 화면입니다. 이미지를 누르면 원본 크기로 볼 수 있습니다. 아래 실행 예시는 예시 센서 데이터로 상태 흐름을 설명합니다.</figcaption></figure><h3>1. Vuex가 공유하는 지도와 데이터</h3><p>MapView는 생성한 Leaflet 지도를 SET_MAP으로 저장합니다. FlvlList는 API 응답을 SET_FLVL_LIST로 저장하고, state.map으로 같은 지도 인스턴스에 접근합니다. 지도 레이어는 state.flvlLayer로 공유합니다.</p><h3>2. 센서 데이터와 마커를 직접 연결</h3><p>마커를 만들 때 flvlMarkerMap이라는 WeakMap에 센서 데이터 객체와 마커를 연결합니다. 테이블 행이 전달한 데이터 객체로 해당 마커를 찾으므로, 화면에 표시된 이름만으로 다시 검색하지 않습니다. 객체 참조가 키이므로 행과 마커 생성에 같은 센서 객체를 사용해야 합니다.</p><h3>3. 테이블 클릭 → 지도 이동 → 팝업</h3><ol><li>행의 클릭 이벤트가 sensorFindMarker(data)를 호출합니다.</li><li>state.map과 state.flvlLayer가 준비됐는지 확인합니다.</li><li>flvlMarkerMap.get(sensorData)로 대상 마커를 찾습니다.</li><li>marker.getLatLng()로 좌표를 얻고 map.setView(latlng, 13)으로 이동합니다.</li><li>zoomToShowLayer 콜백에서 클러스터에 가려진 마커가 보이면 센서별 팝업 내용을 설정하고 openPopup()을 호출합니다.</li></ol><div style=\"padding:18px;background:#eef5ff;border-radius:10px;line-height:2\"><strong>원본의 연결 구조</strong><br>MapView → SET_MAP → Vuex state.map<br>조회 응답 → SET_FLVL_LIST → 테이블 / 마커 생성<br>테이블 행 클릭 → WeakMap 조회 → 지도 이동 → 마커 표시 → 센서 팝업</div><h3>원본과 아래 실행 예시의 차이</h3><p>원본은 Vuex에 공유한 지도·레이어와 WeakMap을 이용해 마커를 직접 제어합니다. 아래 예시는 선택 ID를 action → mutation으로 갱신하고 각 컴포넌트가 반응하는 공개용 최소 구현입니다. SELECT_CCTV와 selectedId는 설명용이며 원본 도로침수 코드의 선택 방식과 구분합니다.</p><a href=\"projects/city-safety/table-marker-source.txt\" target=\"_blank\" rel=\"noopener\">원본 센서·마커 연결 코드 보기 ↗</a></section><h2>직접 확인하는 Vuex 동기화 예시</h2><p>테이블 행 또는 지도 마커를 클릭하면 선택 상태와 상세 정보가 함께 갱신됩니다. 운영 화면과 유사하게 구성한 예시 센서 3건을 사용합니다.</p>' +
    '<div id="vuex-sync-app"></div><section class="card implementation-flow"><h2>상태 흐름</h2><p>목록 클릭 / 마커 클릭 → dispatch(selectCctv) → commit(SELECT_CCTV) → selectedId 변경 → 지도 강조 + 목록 강조 + 상세 정보 갱신</p><p>실제 프로젝트의 SET_MAP, SET_CCTV800_LIST, SET_SHOW_CCTV800 구조를 추출한 최소 재현입니다. 선택 상태와 예시 데이터는 공개 설명용으로 분리했습니다.</p><a href="https://github.com/AmazingBread/city-safety-on/blob/main/projects/city-safety/sync-store.js" target="_blank" rel="noopener noreferrer">Store 코드 보기 ↗</a></section>' +
    story(
      '메뉴에서 표시 상태를 바꾸거나 목록·마커를 선택했을 때 다른 컴포넌트가 서로 다른 상태를 보여주면 안 됩니다.',
      'Vuex를 공통 상태로 사용하고 지도 생성·목록 수신·표시 토글을 mutation으로 관리합니다. 지도 객체는 Vue.markRaw로 반응형 변환에서 제외합니다.',
      '목록과 마커 양쪽에서 선택해 보세요. 표시 토글과 목록 다시 받기를 눌러도 Vuex 상태와 지도 레이어가 함께 갱신됩니다.'
    );
  Vue.use(Vuex);
  const store = createSyncStore(Vuex);
  let timeout;
  const vm = new Vue({
    store,
    components: { MapPanel, SensorList },
    data: () => ({ trace: [], status: '목록 수신 대기' }),
    computed: {
      selected() {
        return this.$store.state.cctv800List.find(
          (item) => item.id === this.$store.state.selectedId
        );
      },
      stateView() {
        const s = this.$store.state;
        return JSON.stringify(
          {
            map: s.map ? 'Leaflet instance' : 'null',
            isCctv800Open: s.isCctv800Open,
            items: s.cctv800List.length,
            selectedId: s.selectedId,
          },
          null,
          2
        );
      },
    },
    methods: {
      load() {
        clearTimeout(timeout);
        this.status = '목록을 비동기로 받는 중…';
        this.$store.commit('SET_CCTV800_LIST', []);
        timeout = setTimeout(() => {
          this.$store.commit('SET_CCTV800_LIST', [
            { id: 1, name: '예시 관측소 A', coordinates: [35.165, 129.055] },
            { id: 2, name: '예시 관측소 B', coordinates: [35.178, 129.072] },
            { id: 3, name: '예시 관측소 C', coordinates: [35.17, 129.083] },
          ]);
          this.status = '목록 3건 수신 완료';
        }, 600);
      },
    },
    mounted() {
      this.unsubscribe = store.subscribe((mutation) => {
        this.trace.unshift(mutation.type);
        this.trace = this.trace.slice(0, 5);
      });
      this.load();
    },
    beforeDestroy() {
      clearTimeout(timeout);
      this.unsubscribe();
    },
    template: `<section class="card"><div class="card-heading"><label><input type="checkbox" :checked="$store.state.isCctv800Open" @change="$store.dispatch('toggleCctv800')"> 도로침수 센서 표시</label><button class="btn small" @click="load">목록 다시 받기</button></div><div class="flood-demo"><sensor-list/><map-panel/><aside class="sync-detail"><h3>상세 컴포넌트</h3><strong>{{selected?selected.name:'선택 대기'}}</strong><p>선택값은 목록과 지도에서 동일하게 사용합니다.</p><h3>Vuex state</h3><pre>{{stateView}}</pre><h3>최근 mutation</h3><ol><li v-for="(type,i) in trace" :key="i">{{type}}</li></ol></aside></div><p class="inline-message" role="status">{{status}}</p></section>`,
  }).$mount(root.querySelector('#vuex-sync-app'));
  return () => vm.$destroy();
}
