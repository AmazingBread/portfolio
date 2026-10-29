
import { pageHeader } from '../../src/lib/ui.js';
export function mount(root) {
  root.innerHTML =
    pageHeader(
      'PROJECT 01',
      '부산 도시안전ON',
      '공공 안전 관제 화면에서 CCTV, 공간 정보, 센서 목록의 상태를 함께 다루는 프론트엔드 개발 사례입니다.',
      ['Vue 2', 'Vuex', 'Leaflet / EPSG:5181', 'HLS']
    ) +
    "<section class=\"portfolio-scope\"><div><span class=\"eyebrow\">IMPLEMENTATION SCOPE</span><h2>Vuex 연결 · 지도 컴포넌트 · HLS 재생</h2><p>실제 화면에서 기능을 확인하고, 데이터 흐름과 원본 코드로 구현을 살펴볼 수 있습니다.</p></div><div class=\"portfolio-scope-links\"><a href=\"#markers\">테이블·마커 동작 보기 →</a><a href=\"https://github.com/AmazingBread/city-safety-on/tree/main/projects/city-safety/source/\" target=\"_blank\" rel=\"noopener\">원본 코드 ↗</a></div></section>" +
    '<section class="case-study-panel"><div><p class="eyebrow">MY CONTRIBUTION</p><h2>화면을 나누고, 상태는 연결하기</h2><p>실제 소스에서 확인할 수 있는 담당 기능을 기술 주제별로 정리했습니다. 아래 실행 예시와 공개용 원본 컴포넌트를 함께 확인할 수 있습니다.</p></div><div class="contribution-list"><span>HLS CCTV 재생과 제한 시간·자원 관리</span><span>공통 지도 컴포넌트와 좌표계 설정</span><span>Vuex를 통한 지도·목록·상세 정보 동기화</span><span>첫 진입 시 데이터 응답과 지도 생성 순서 개선</span></div></section><div class="feature-grid project-features">' +
    [
      ['cctv', '01', 'HLS 기반 실시간 CCTV', 'M3U8 재생, stopLoad, destroy, 다시보기'],
      ['maps', '02', '지도 컴포넌트', '실제 좌표계·타일 설정과 원본 Vue SFC'],
      ['markers', '03', 'Vuex 상태 동기화', '메뉴·목록·지도·상세 화면의 같은 선택 상태'],
    ]
      .map(
        ([route, no, title, detail]) =>
          '<a class="feature-card" href="#' +
          route +
          '"><span class="feature-number">' +
          no +
          '</span><h3>' +
          title +
          '</h3><p>' +
          detail +
          '</p><b>구현 근거 확인 →</b></a>'
      )
      .join('') +
    '</div><section class="card implementation-flow"><h2>확인 가능한 코드와 공개 범위</h2><p>원본 프로젝트 전체를 공개하지 않고, 독립 실행에 필요한 컴포넌트만 추출했습니다. 운영 주소·인증 값·실제 건물 좌표는 제외했습니다.</p><p>원본과 실행 어댑터의 차이는 source-provenance.json에 기록했습니다. 실제 원본 코드, 공개용 어댑터, 예시 데이터를 구분합니다.</p><a href="https://github.com/AmazingBread/city-safety-on/tree/main/projects/city-safety/source" target="_blank" rel="noopener noreferrer">실제 프로젝트에서 추출한 컴포넌트 ↗</a></section>';
  return () => {};
}
