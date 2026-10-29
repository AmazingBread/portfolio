import WindSpeed from './source/WindSpeed.js';
import WindDirection from './source/WindDirection.js';
import WindDirectionSpeed from './source/WindDirectionSpeed.js';
import { pageHeader, story } from '../../src/lib/ui.js';
export function mount(root) {
  root.innerHTML =
    pageHeader(
      'PROJECT 02',
      '아시아드 풍향·풍속 모니터링',
      '원본 Vue + D3 컴포넌트와 실제 API 측정값으로 구현 근거를 확인합니다.',
      ['Vue 2', 'D3.js 7', '실제 측정 스냅샷']
    ) +
    '<div id="asiad-original"></div>' +
    story(
      '풍속의 시간 변화와 풍향·강도를 같은 화면에서 읽을 수 있어야 했습니다.',
      '원 프로젝트의 WindSpeed.vue, WindDirection.vue, WindDirectionSpeed.vue를 그대로 사용합니다. 차트 컴포넌트에 실제 측정값을 props로 전달합니다.',
      '축·최대값·풍향 벡터를 확인하세요. 날짜 범위를 줄이면 원본 컴포넌트를 새 데이터로 다시 생성합니다. 실시간 조회가 아닌 저장된 스냅샷입니다.'
    );
  let alive = true;
  const vm = new Vue({
    components: { WindSpeed, WindDirection, WindDirectionSpeed },
    data: () => ({ items: [], meta: null, error: '', period: 'all', version: 0 }),
    computed: {
      filtered() {
        if (!this.items.length) return [];
        if (this.period === 'all') return this.items;
        const last = Date.parse(this.items.at(-1).measureDatetime);
        return this.items.filter(
          (r) => Date.parse(r.measureDatetime) >= last - Number(this.period) * 86400000
        );
      },
      speed() {
        return this.filtered.map((r) => ({ date: r.measureDatetime, speed: r.ws10m }));
      },
      gust() {
        return this.filtered.map((r) => ({ date: r.measureDatetime, speed: r.wsGust }));
      },
      direction() {
        return this.filtered.map((r) => ({
          date: r.measureDatetime,
          speed: r.ws10m,
          direction: r.wd10m,
        }));
      },
      gustDirection() {
        return this.filtered.map((r) => ({
          date: r.measureDatetime,
          speed: r.wsGust,
          direction: r.wdGust,
        }));
      },
      peak() {
        return this.filtered.reduce((a, b) => (!a || b.ws10m >= a.ws10m ? b : a), null);
      },
      gustPeak() {
        return this.filtered.reduce((a, b) => (!a || b.wsGust >= a.wsGust ? b : a), null);
      },
    },
    methods: {
      format(date) {
        return new Intl.DateTimeFormat('sv-SE', {
          timeZone: 'Asia/Seoul',
          year: '2-digit',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(date));
      },
    },
    template: `<div class="asiad-original">
 <div class="card source-proof"><div><h2>원본 컴포넌트로 렌더링</h2><p>데이터: 사용자 제공 API의 실제 응답 · 실시간 연결 아님 · KST</p><p v-if="meta">스냅샷 {{format(meta.capturedAt)}} / 원본 {{items.length.toLocaleString()}}건 / 표시 {{filtered.length.toLocaleString()}}건</p></div><label>조회 범위 <select v-model="period" @change="version++"><option value="all">전체 스냅샷</option><option value="1">마지막 1일</option><option value="3">마지막 3일</option></select></label></div>
 <p v-if="error" role="alert">{{error}}</p><p v-else-if="!items.length" role="status">측정 스냅샷을 불러옵니다…</p>
 <template v-else>
 <section class="original-wind-row"><h3>풍속 그래프</h3><div class="original-wind-box"><div class="original-line"><wind-speed :key="'speed'+version" :wind-speed="speed"/></div><div class="original-summary"><span>최대 풍속 시간</span><strong>{{format(peak.measureDatetime)}}</strong><span>최대 풍속</span><strong>{{peak.ws10m.toFixed(2)}}<small> m/s</small></strong></div></div></section>
 <section class="original-wind-row"><h3>돌풍속 그래프</h3><div class="original-wind-box"><div class="original-line"><wind-speed :key="'gust'+version" :wind-speed="gust"/></div><div class="original-summary"><span>최대 돌풍속 시간</span><strong>{{format(gustPeak.measureDatetime)}}</strong><span>최대 돌풍속</span><strong>{{gustPeak.wsGust.toFixed(2)}}<small> m/s</small></strong></div></div></section>
 <section class="original-wind-row"><h3>풍향 그래프</h3><div class="original-wind-box"><div class="original-polar"><wind-direction :key="'direction'+version" :wind-direction="direction"/></div><div class="original-vector"><wind-direction-speed :key="'vector'+version" :wind-direction-speed="direction"/></div><div class="original-summary"><span>최대 풍속 시간</span><strong>{{format(peak.measureDatetime)}}</strong><span>최대 풍속 / 풍향</span><strong>{{peak.ws10m.toFixed(2)}}<small> m/s</small></strong><strong>{{peak.wd10m.toFixed(1)}}°</strong></div></div></section>
 <section class="original-wind-row"><h3>돌풍향 그래프</h3><div class="original-wind-box"><div class="original-polar"><wind-direction :key="'gust-direction'+version" :wind-direction="gustDirection"/></div><div class="original-vector"><wind-direction-speed :key="'gust-vector'+version" :wind-direction-speed="gustDirection"/></div><div class="original-summary"><span>최대 돌풍속 시간</span><strong>{{format(gustPeak.measureDatetime)}}</strong><span>최대 돌풍속 / 풍향</span><strong>{{gustPeak.wsGust.toFixed(2)}}<small> m/s</small></strong><strong>{{gustPeak.wdGust.toFixed(1)}}°</strong></div></div></section>
 </template><p class="source-links"><a href="https://github.com/AmazingBread/city-safety-on/tree/main/projects/asiad-wind/source" target="_blank" rel="noopener noreferrer">원본 Vue/D3 컴포넌트 코드 ↗</a> · <a href="./projects/asiad-wind/data/measurement-snapshot.json" target="_blank" rel="noopener noreferrer">사용한 실제 측정 데이터 ↗</a></p>
 </div>`,
  }).$mount(root.querySelector('#asiad-original'));
  fetch(new URL('./data/measurement-snapshot.json', import.meta.url))
    .then((r) => {
      if (!r.ok) throw Error('스냅샷을 불러오지 못했습니다.');
      return r.json();
    })
    .then((data) => {
      if (!alive) return;
      vm.meta = data;
      vm.items = data.items;
    })
    .catch((e) => {
      if (alive) vm.error = e.message;
    });
  return () => {
    alive = false;
    vm.$destroy();
  };
}
