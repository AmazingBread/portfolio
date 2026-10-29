export function mount(root) {
  root.innerHTML =
    '<section class="hero"><div><p class="eyebrow">PUBLIC SAFETY × FRONTEND ENGINEERING</p><h1>복잡한 관제 데이터를<br><em>이해하기 쉬운 화면으로.</em></h1><p class="hero-copy">도시안전ON 개발 경험에서 출발한 프론트엔드 포트폴리오.<br>CCTV 재생부터 대용량 데이터와 공간 정보까지,<br>핵심 인터랙션을 독립 데모로 직접 확인할 수 있습니다.</p><div class="hero-actions"><a class="btn primary" href="#cctv">데모 시작하기 <span>→</span></a><a class="btn" href="https://github.com/AmazingBread/city-safety-on" target="_blank" rel="noopener noreferrer">소스 코드 ↗</a></div><p class="fine">운영 화면의 원본 소스·계정·영상·위치 데이터는 포함하지 않았습니다.</p></div><div class="hero-visual" aria-hidden="true"><div class="visual-top"><span class="live-dot"></span> URBAN SAFETY CONSOLE <span>DEMO</span></div><svg viewBox="0 0 440 310"><defs><pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#e0e9ef"/></pattern></defs><rect width="440" height="310" fill="url(#grid)"/><path d="M55 224 206 144 383 216 232 293Z" fill="#e1e9ef"/><path d="M111 112 215 62 321 111 218 167Z" fill="#d1deea"/><path d="M111 112 218 167v112L111 221Z" fill="#9bb1c8"/><path d="M218 167 321 111v113l-103 55Z" fill="#c1d0df"/><g stroke="#f2f7fb" stroke-width="6"><path d="M129 137v65m24-53v65m24-52v65m24-52v65M238 172v76m25-89v76m25-89v76m20-87v76"/></g><g fill="#1b78db" stroke="white" stroke-width="4"><circle cx="146" cy="140" r="10"/><circle cx="285" cy="185" r="10"/></g><path d="M146 130V80H49m236 95V86h105" stroke="#3ebba9" stroke-width="2" fill="none"/></svg><div class="visual-card v-left"><span>균열 센서</span><strong>0.35 <small>mm</small></strong><i>● 가상 데이터</i></div><div class="visual-card v-right"><span>건물 안전 상태</span><strong class="green">안전</strong><i>DEMO MODE</i></div><div class="visual-bottom">CCTV · CHARTS · MAPS · MARKERS</div></div></section>' +
    '<section class="project-summary"><div><span>프로젝트 성격</span><strong>공공 안전 관제 UI</strong></div><div><span>원 프로젝트 경험</span><strong>Vue · JavaScript · SCSS</strong></div><div><span>이 데모의 구성</span><strong>ES Modules · Canvas · Leaflet</strong></div><div><span>기여 범위</span><strong>화면·인터랙션 구현</strong></div></section>' +
    '<section class="section"><div class="section-title"><div><p class="eyebrow">EXPLORE THE IMPLEMENTATION</p><h2>네 가지 기능, 네 가지 해결 과정</h2></div><span>직접 조작하며 확인하세요</span></div><div class="feature-grid">' +
    [
      [
        '01',
        'cctv',
        'CCTV 플레이어',
        '10초 재생, 마지막 프레임 유지, 다시보기와 자원 정리.',
        'VIDEO LIFECYCLE',
      ],
      [
        '02',
        'graphs',
        '대용량 그래프',
        '최대 100만 건 생성. Worker에서 Min/Max 집계 후 Canvas 렌더링.',
        'DATA VISUALIZATION',
      ],
      [
        '03',
        'maps',
        '지도 인터랙션',
        '독립 지도 인스턴스, 휠 확대·축소, 위치 전환과 크기 갱신.',
        'GEOSPATIAL UI',
      ],
      [
        '04',
        'markers',
        '마커 & 클러스터',
        '지연 로딩, 레이어 갱신, 필터와 2,000개 마커 클러스터링.',
        'ASYNC RENDERING',
      ],
    ]
      .map(
        (f) =>
          '<a class="feature-card" href="#' +
          f[1] +
          '"><span class="feature-number">' +
          f[0] +
          '</span><small>' +
          f[4] +
          '</small><h3>' +
          f[2] +
          '</h3><p>' +
          f[3] +
          '</p><b>기능 살펴보기 →</b></a>'
      )
      .join('') +
    '</div></section>' +
    '<section class="case-study"><p class="eyebrow">ENGINEERING NOTES</p><h2>동작하는 화면 뒤의 문제 해결</h2><div class="case-list"><article><span>01 / 비동기 초기화</span><h3>첫 진입에서 보이지 않던 CCTV 마커</h3><p>지도 생성과 목록 응답의 시점 차이로 빈 레이어가 남는 구조를 확인했습니다. 데이터 준비 시점에 레이어를 다시 구성하고 중복 생성을 방지하는 흐름으로 개선했습니다.</p></article><article><span>02 / 컴포넌트 수명</span><h3>페이지를 떠난 뒤에도 남는 재생 자원</h3><p>재생 제한과 다시보기 동작을 분리하고, 화면 종료 시 타이머·미디어 자원을 정리합니다. 이 공개 데모는 운영 HLS 대신 합성 영상과 로컬 파일로 같은 흐름을 재현합니다.</p></article><article><span>03 / 데이터 시각화</span><h3>전체 데이터와 화면에 그리는 데이터 분리</h3><p>공개 데모에서는 원본 데이터를 Worker로 처리하고 픽셀 폭에 맞는 Min/Max 표본을 Canvas로 그립니다. 축소 전후의 건수와 처리 시간을 실제 실행 결과로 표시합니다.</p></article></div></section>' +
    '<section class="submission"><div><p class="eyebrow">ABOUT THIS PORTFOLIO</p><h2>기능을 실행하고, 구현을 확인하세요.</h2><p>운영 시스템의 복제본이 아닌, 핵심 개발 경험을 설명하기 위해 새로 만든 독립 예제입니다.<br>AI 도구는 코드 초안과 검증 보조에 활용했으며, 실제 기여 범위와 한계는 README에 구분했습니다.</p></div><a class="btn" href="https://github.com/AmazingBread/city-safety-on#readme" target="_blank" rel="noopener noreferrer">README 보기 ↗</a></section>';
  return () => {};
}
