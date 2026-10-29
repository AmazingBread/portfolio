const names = {
  swimvirus: '스윔바이러스 · 개인 프로젝트',
  overview: '소개 · 프로젝트',
  city: '부산 도시안전ON',
  cctv: 'HLS 기반 실시간 CCTV',
  graphs: '광주첨단 · 침수 시뮬레이션 / 빅데이터',
  maps: '지도 컴포넌트 · GIS',
  markers: 'Vuex 지도 상태 동기화',
  asiad: '아시아드 풍향·풍속',
};
const loaders = {
  swimvirus: () => import('../projects/swimvirus/index.js'),
  overview: () => import('./components/overview.js'),
  city: () => import('../projects/city-safety/index.js'),
  cctv: () => import('./components/cctv.js'),
  graphs: () => import('../projects/gwangju/index.js'),
  maps: () => import('./components/maps.js'),
  markers: () => import('./components/markers.js'),
  asiad: () => import('../projects/asiad-wind/index.js'),
};
let cleanup = () => {},
  revision = 0;
async function navigate() {
  const id = ++revision;
  cleanup();
  cleanup = () => {};
  const key = location.hash.slice(1) in loaders ? location.hash.slice(1) : 'overview';
  document.querySelectorAll('[data-page]').forEach((a) => {
    const active = a.dataset.page === key;
    a.classList.toggle('active', active);
    if (active) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  document.querySelector('#breadcrumb').textContent = names[key];
  document.title = names[key] + ' | 프론트엔드 황영균 포트폴리오';
  const root = document.querySelector('#main');
  root.innerHTML = '<p class="loading">화면을 준비합니다…</p>';
  try {
    const page = await loaders[key]();
    if (id !== revision) return;
    cleanup = page.mount(root) || (() => {});
    window.scrollTo(0, 0);
  } catch (error) {
    root.textContent = '데모를 불러오지 못했습니다. 로컬에서는 npm start로 실행해주세요.';
    console.error(error);
  }
}
window.addEventListener('hashchange', navigate);
navigate();
