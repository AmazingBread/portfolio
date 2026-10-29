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
      }
    );
    this.map = L.map(this.$refs.map, {
      crs,
      center: [35.171, 129.065],
      zoom: 9,
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
        const marker = L.circleMarker(item.coordinates, {
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
        marker.setStyle({
          fillColor: Number(id) === this.selected ? '#e54c70' : '#126bd0',
          radius: Number(id) === this.selected ? 12 : 8,
        });
        if (Number(id) === this.selected) {
          marker.openTooltip();
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
  template: `<div class="sync-list"><h3>목록 컴포넌트</h3><button v-for="item in items" :key="item.id" :class="{active:selected===item.id}" @click="$store.dispatch('selectCctv',item.id)"><b>{{item.name}}</b><span>{{item.id===selected?'선택됨':'지도에서 보기 →'}}</span></button><p v-if="!items.length">목록 응답 대기…</p></div>`,
};
export function mount(root) {
  root.innerHTML =
    pageHeader(
      'PROJECT 01 / STATE',
      'Vuex 기반 지도·컴포넌트 동기화',
      '메뉴·목록·지도에서 같은 상태를 참조하고, 서로 다른 입력을 일관된 화면으로 반영합니다.',
      ['Vue 2 + Vuex 3', 'Mutation / Action', '선택 상태 동기화', '비동기 초기화']
    ) +
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
            { id: 1, name: '가상 CCTV A', coordinates: [35.165, 129.055] },
            { id: 2, name: '가상 CCTV B', coordinates: [35.178, 129.072] },
            { id: 3, name: '가상 CCTV C', coordinates: [35.17, 129.083] },
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
    template: `<section class="card"><div class="card-heading"><label><input type="checkbox" :checked="$store.state.isCctv800Open" @change="$store.dispatch('toggleCctv800')"> 지도에 CCTV 표시</label><button class="btn small" @click="load">목록 다시 받기</button></div><div class="sync-layout"><sensor-list/><map-panel/><aside class="sync-detail"><h3>상세 컴포넌트</h3><strong>{{selected?selected.name:'선택 대기'}}</strong><p>선택값은 목록과 지도에서 동일하게 사용합니다.</p><h3>Vuex state</h3><pre>{{stateView}}</pre><h3>최근 mutation</h3><ol><li v-for="(type,i) in trace" :key="i">{{type}}</li></ol></aside></div><p class="inline-message" role="status">{{status}}</p></section>`,
  }).$mount(root.querySelector('#vuex-sync-app'));
  return () => vm.$destroy();
}
