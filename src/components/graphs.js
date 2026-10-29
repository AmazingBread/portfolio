import { pageHeader } from '../lib/ui.js';
export function mount(root) {
  root.innerHTML =
    pageHeader(
      'PROJECT 01 / DATA',
      '대용량 그래프 · 원본 코드 확인 대기',
      '이전에 게시한 Worker·Canvas 예제는 별도로 만든 데모였으며, 황영균님의 실제 구현 사례로 제시하지 않습니다.',
      ['원본 코드 수령 후 교체']
    ) +
    '<section class="card pending-case"><h2>실제 개발 코드를 기준으로 다시 정리합니다.</h2><p>전달받을 코드에서 데이터량, 차트 라이브러리, 데이터 가공 방식, 확대·축소와 최적화 흐름을 확인한 뒤 구현 근거를 작성하겠습니다.</p><p>기존 100만 건 Canvas·Worker 데모는 메뉴에서 제외했으며, 이 포트폴리오의 경력 성과나 원본 구현으로 설명하지 않습니다.</p><a class="btn" href="#asiad">원본 코드가 확인된 아시아드 D3 프로젝트 보기 →</a></section>';
  return () => {};
}
