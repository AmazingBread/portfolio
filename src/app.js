const names = {
  overview: '프로젝트 소개',
  cctv: 'CCTV 플레이어',
  graphs: '대용량 그래프',
  maps: '지도 인터랙션',
  markers: '마커 & 클러스터',
  asiad: '아시아드 풍향·풍속',
};
const loaders = {
  overview: () => import('./components/overview.js'),
  cctv: () => import('./components/cctv.js'),
  graphs: () => import('./components/graphs.js'),
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
  document.title = names[key] + ' | 도시안전ON';
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
