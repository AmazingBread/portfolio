import WindSpeed from './source/WindSpeed.js';
import WindDirection from './source/WindDirection.js';
import WindDirectionSpeed from './source/WindDirectionSpeed.js';
import { pageHeader, story } from '../../src/lib/ui.js';
export function mount(root) {
  root.innerHTML =
    pageHeader(
      'PROJECT 02',
      '아시아드 풍향·풍속 모니터링',
      '풍속과 돌풍속의 변화, 풍향을 함께 볼 수 있도록 만든 모니터링 화면입니다.',
      ['공공기관 프로젝트', 'Vue 2', 'D3.js 7', '실제 측정 스냅샷']
    ) +
    "<section class=\"engineering-case\"><p class=\"eyebrow\">개발 내용</p><h2>시간 변화와 방향 정보를 함께 읽는 기상 모니터링</h2><p class=\"engineering-lead\">풍속 숫자만으로는 언제 강한 바람이 발생했고 어느 방향이었는지 판단하기 어렵습니다. 풍속·돌풍속의 시계열, 풍향 분포, 시간별 방향 벡터와 최대값 요약을 같은 데이터로 구성했습니다.</p><div class=\"engineering-facts\"><div><strong>구현 범위</strong><p>Vue 화면 및 D3 차트 컴포넌트, 측정 응답 변환, 시간축·극좌표·벡터 표시</p></div><div><strong>컴포넌트 구성</strong><p>WindSpeed / WindDirection / WindDirectionSpeed를 데이터 props로 연결</p></div><div><strong>공개 실행 데이터</strong><p>실제 측정 1,009건 · 전체 / 마지막 1일 / 마지막 3일 범위 선택</p></div></div><h3>데이터와 화면의 연결 흐름</h3><div class=\"engineering-flow\">측정 JSON → 날짜 범위 필터 → 풍속·돌풍속·풍향 배열 변환 → Vue props → D3 SVG → 최대값·동일 시점 풍향 요약</div><div class=\"engineering-details\"><article><h3>01. API 데이터와 차트 책임 분리</h3><p>부모 화면이 measureDatetime, ws10m, wd10m, wsGust, wdGust를 읽고 차트가 필요한 date·speed·direction 형태로 변환합니다. 차트는 API를 직접 호출하지 않고 props를 받아 그리므로 풍속과 돌풍속에 같은 컴포넌트를 사용할 수 있습니다.</p></article><article><h3>02. 세 가지 표현을 조합한 이유</h3><p>시계열은 발생 시점과 변화량을, 극좌표는 방향과 세기의 분포를, 시간별 벡터는 방향의 시간 변화를 보여줍니다. 최대 풍속의 풍향은 별도 최대 풍향을 구하는 대신 최대 풍속이 발생한 같은 레코드에서 가져옵니다.</p></article><article><h3>03. 조회 범위가 바뀔 때의 처리</h3><p>공개 예시에서는 마지막 측정 시각을 기준으로 기간을 필터링하고 version key를 바꿔 차트를 다시 생성합니다. 이전 SVG와 새 데이터가 겹치지 않게 인스턴스를 교체합니다. 실시간 운영 조회가 아닌 저장된 스냅샷의 범위 탐색입니다.</p></article><article><h3>04. 날짜와 레이아웃 보정</h3><p>공개 실행 환경에서 시간 라벨은 KST 기준으로 맞췄습니다. 극좌표 SVG에는 viewBox를 추가해 컨테이너가 줄어들어도 N·E·S·W 표시가 잘리지 않도록 했습니다. 원본 .vue와 공개 실행 .js 어댑터의 변경을 구분합니다.</p></article><article><h3>확인 순서</h3><p>전체 스냅샷에서 풍속 2.50m/s, 돌풍속 12.00m/s의 최대값과 해당 시점을 확인한 뒤 마지막 1일로 바꿔 축과 요약값이 함께 갱신되는지 살펴볼 수 있습니다. 아래 원본 코드·데이터 링크로 계산 근거를 볼 수 있습니다.</p></article></div></section>" +
    "<section class=\"portfolio-scope\"><div><span class=\"eyebrow\">담당 기능</span><h2>측정값 변환 · 시계열·방향 표현 · 최대값 연결</h2><p>아래에 동작 화면과 처리 과정을 정리했습니다.</p></div><div class=\"portfolio-scope-links\"><a href=\"#asiad\">D3 차트와 데이터 보기 →</a><a href=\"https://github.com/AmazingBread/portfolio/tree/main/projects/asiad-wind/source/\" target=\"_blank\" rel=\"noopener\">원본 코드 ↗</a></div></section>" +
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
 <section class="card"><h2>D3 구현 코드와 사용 데이터</h2><p>실행 화면에 사용한 Vue/D3 컴포넌트와 실제 측정 JSON을 GitHub에서 함께 볼 수 있습니다.</p><ul><li><a href="https://github.com/AmazingBread/portfolio/blob/main/projects/asiad-wind/source/WindSpeed.vue" target="_blank" rel="noopener">풍속·돌풍속 시계열 코드</a></li><li><a href="https://github.com/AmazingBread/portfolio/blob/main/projects/asiad-wind/source/WindDirection.vue" target="_blank" rel="noopener">풍향 극좌표 코드</a></li><li><a href="https://github.com/AmazingBread/portfolio/blob/main/projects/asiad-wind/source/WindDirectionSpeed.vue" target="_blank" rel="noopener">시간별 풍향 벡터 코드</a></li><li><a href="https://github.com/AmazingBread/portfolio/blob/main/projects/asiad-wind/data/measurement-snapshot.json" target="_blank" rel="noopener">사용한 실제 측정 데이터 JSON — 1,009건</a></li></ul><p>measureDatetime: 측정 시각 / ws10m: 풍속(m/s) / wd10m: 풍향(°) / wsGust: 돌풍속(m/s) / wdGust: 돌풍향(°). 저장된 API 응답이며 실시간 갱신 데이터가 아닙니다.</p></section><div class="card source-proof"><div><h2>원본 컴포넌트로 렌더링</h2><p>데이터: 사용자 제공 API의 실제 응답 · 실시간 연결 아님 · KST</p><p v-if="meta">스냅샷 {{format(meta.capturedAt)}} / 원본 {{items.length.toLocaleString()}}건 / 표시 {{filtered.length.toLocaleString()}}건</p></div><label>조회 범위 <select v-model="period" @change="version++"><option value="all">전체 스냅샷</option><option value="1">마지막 1일</option><option value="3">마지막 3일</option></select></label></div>
 <p v-if="error" role="alert">{{error}}</p><p v-else-if="!items.length" role="status">측정 스냅샷을 불러옵니다…</p>
 <template v-else>
 <section class="original-wind-row"><h3>풍속 그래프</h3><div class="original-wind-box"><div class="original-line"><wind-speed :key="'speed'+version" :wind-speed="speed"/></div><div class="original-summary"><span>최대 풍속 시간</span><strong>{{format(peak.measureDatetime)}}</strong><span>최대 풍속</span><strong>{{peak.ws10m.toFixed(2)}}<small> m/s</small></strong></div></div></section>
 <section class="original-wind-row"><h3>돌풍속 그래프</h3><div class="original-wind-box"><div class="original-line"><wind-speed :key="'gust'+version" :wind-speed="gust"/></div><div class="original-summary"><span>최대 돌풍속 시간</span><strong>{{format(gustPeak.measureDatetime)}}</strong><span>최대 돌풍속</span><strong>{{gustPeak.wsGust.toFixed(2)}}<small> m/s</small></strong></div></div></section>
 <section class="original-wind-row"><h3>풍향 그래프</h3><div class="original-wind-box"><div class="original-polar"><wind-direction :key="'direction'+version" :wind-direction="direction"/></div><div class="original-vector"><wind-direction-speed :key="'vector'+version" :wind-direction-speed="direction"/></div><div class="original-summary"><span>최대 풍속 시간</span><strong>{{format(peak.measureDatetime)}}</strong><span>최대 풍속 / 풍향</span><strong>{{peak.ws10m.toFixed(2)}}<small> m/s</small></strong><strong>{{peak.wd10m.toFixed(1)}}°</strong></div></div></section>
 <section class="original-wind-row"><h3>돌풍향 그래프</h3><div class="original-wind-box"><div class="original-polar"><wind-direction :key="'gust-direction'+version" :wind-direction="gustDirection"/></div><div class="original-vector"><wind-direction-speed :key="'gust-vector'+version" :wind-direction-speed="gustDirection"/></div><div class="original-summary"><span>최대 돌풍속 시간</span><strong>{{format(gustPeak.measureDatetime)}}</strong><span>최대 돌풍속 / 풍향</span><strong>{{gustPeak.wsGust.toFixed(2)}}<small> m/s</small></strong><strong>{{gustPeak.wdGust.toFixed(1)}}°</strong></div></div></section>
 </template><p class="source-links"><a href="https://github.com/AmazingBread/portfolio/tree/main/projects/asiad-wind/source" target="_blank" rel="noopener noreferrer">원본 Vue/D3 컴포넌트 코드 ↗</a> · <a href="https://github.com/AmazingBread/portfolio/blob/main/projects/asiad-wind/data/measurement-snapshot.json" target="_blank" rel="noopener noreferrer">사용한 실제 측정 데이터 ↗</a></p>
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
