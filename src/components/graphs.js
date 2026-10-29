import { pageHeader, story } from '../lib/ui.js';
import { moveRange } from '../lib/data.js';
export function mount(root) {
  root.innerHTML =
    pageHeader(
      '02',
      '대용량 그래프',
      '많은 데이터를 모두 그리는 대신, 화면에 필요한 정보만 계산합니다.',
      ['Web Worker', 'Min/Max 표본화', 'Canvas 2D']
    ) +
    '<section class="card"><div class="card-heading"><div><h2>균열 측정값 추이</h2><p class="muted">휠: 확대·축소 / 드래그: 구간 이동</p></div><div class="controls"><label>원본 건수 <select id="point-count"><option value="10000">1만 건</option><option value="100000" selected>10만 건</option><option value="1000000">100만 건</option></select></label><button class="btn small" id="reset-range">전체 보기</button></div></div><div class="metrics"><div><span>원본 데이터</span><strong id="raw-count">—</strong></div><div><span>표시 구간</span><strong id="range-count">—</strong></div><div><span>그린 포인트</span><strong id="drawn-count">—</strong></div><div><span>Worker 처리</span><strong id="worker-time">—</strong></div></div><div class="chart-container"><canvas aria-label="대용량 균열 추이 그래프" role="img"></canvas><div id="chart-tooltip" class="chart-tooltip" hidden></div></div><p class="inline-message" role="status" id="chart-summary">Worker에서 가상 데이터를 준비합니다…</p></section>' +
    story(
      '모든 측정값을 DOM이나 SVG로 그리면 화면 갱신 비용이 커질 수 있습니다.',
      '별도 Worker에서 데이터를 생성하고, 구간별 최솟값과 최댓값을 보존한 표본을 Canvas로 그립니다.',
      '100만 건을 선택해 원본 건수와 그린 포인트 수를 비교하세요. 처리 시간은 해당 기기에서 측정한 값입니다.'
    );
  const canvas = root.querySelector('canvas'),
    ctx = canvas.getContext('2d'),
    worker = new Worker(new URL('../workers/chart-worker.js', import.meta.url), {
      type: 'module',
    });
  let alive = true,
    total = 100000,
    start = 0,
    end = total,
    points = [],
    pending = false,
    sequence = 0,
    lastRequest = 0,
    drag = null,
    raf = null;
  const tip = root.querySelector('#chart-tooltip');
  function request() {
    const rect = canvas.getBoundingClientRect();
    lastRequest = ++sequence;
    worker.postMessage({
      type: 'sample',
      id: lastRequest,
      start,
      end,
      buckets: Math.max(50, Math.floor(rect.width / 2)),
    });
  }
  function schedule() {
    if (pending) return;
    pending = true;
    raf = requestAnimationFrame(() => {
      pending = false;
      request();
    });
  }
  function initialize() {
    total = Number(root.querySelector('#point-count').value);
    start = 0;
    end = total;
    lastRequest = ++sequence;
    worker.postMessage({ type: 'init', id: lastRequest, count: total });
    root.querySelector('#chart-summary').textContent = '데이터 생성 및 표본화 중…';
  }
  function paint() {
    const box = canvas.getBoundingClientRect(),
      w = box.width,
      h = box.height,
      dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.font = '12px sans-serif';
    const left = 52,
      right = w - 20,
      top = 24,
      bottom = h - 36;
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = top + ((bottom - top) * i) / 4;
      ctx.strokeStyle = '#e2e9f0';
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
      ctx.fillStyle = '#72869a';
      ctx.fillText((1.7 - i * 0.2).toFixed(2), 10, y + 4);
    }
    const x = (p) => left + ((p.x - start) / Math.max(1, end - start - 1)) * (right - left),
      y = (p) => bottom - ((p.y - 0.9) / 0.8) * (bottom - top);
    if (points.length) {
      ctx.beginPath();
      points.forEach((p, i) => (i ? ctx.lineTo(x(p), y(p)) : ctx.moveTo(x(p), y(p))));
      ctx.strokeStyle = '#168bce';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.fillStyle = '#72869a';
    ctx.fillText(Math.floor(start).toLocaleString() + '번째', left, h - 12);
    ctx.textAlign = 'right';
    ctx.fillText(Math.floor(end).toLocaleString() + '번째', right, h - 12);
    ctx.textAlign = 'left';
  }
  worker.onmessage = (e) => {
    if (!alive || e.data.id !== lastRequest) return;
    if (e.data.type === 'ready') {
      request();
      return;
    }
    points = e.data.points;
    root.querySelector('#raw-count').textContent = total.toLocaleString();
    root.querySelector('#range-count').textContent = Math.round(end - start).toLocaleString();
    root.querySelector('#drawn-count').textContent = points.length.toLocaleString();
    root.querySelector('#worker-time').textContent = e.data.ms.toFixed(1) + ' ms';
    root.querySelector('#chart-summary').textContent =
      '가상 데이터 · ' +
      Math.round(start).toLocaleString() +
      ' ~ ' +
      Math.round(end).toLocaleString() +
      '번째 · Min/Max 표본은 각 구간의 극값을 보존합니다.';
    paint();
  };
  worker.onerror = () => {
    root.querySelector('#chart-summary').textContent =
      'Worker 실행을 확인해주세요. npm start로 실행해야 합니다.';
  };
  const resize = new ResizeObserver(schedule);
  resize.observe(canvas);
  canvas.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      const old = end - start,
        newSize = Math.max(100, Math.min(total, old * (e.deltaY > 0 ? 1.25 : 0.8)));
      const ratio = Math.max(0, Math.min(1, (e.offsetX - 52) / (canvas.clientWidth - 72)));
      start = Math.max(0, Math.min(total - newSize, start + old * ratio - newSize * ratio));
      end = start + newSize;
      schedule();
    },
    { passive: false }
  );
  canvas.onpointerdown = (e) => {
    drag = { x: e.clientX, start, end };
    canvas.setPointerCapture(e.pointerId);
  };
  canvas.onpointermove = (e) => {
    if (drag) {
      [start, end] = moveRange(
        drag.start,
        drag.end,
        (-(e.clientX - drag.x) / canvas.clientWidth) * (drag.end - drag.start),
        total
      );
      schedule();
      return;
    }
    if (!points.length) return;
    const value =
      start +
      Math.max(0, Math.min(1, (e.offsetX - 52) / (canvas.clientWidth - 72))) * (end - start);
    let nearest = points[0];
    for (const p of points)
      if (Math.abs(p.x - value) < Math.abs(nearest.x - value)) nearest = p;
    tip.textContent = nearest.x.toLocaleString() + '번째 / ' + nearest.y.toFixed(3) + ' mm';
    tip.style.left = Math.min(canvas.clientWidth - 190, Math.max(5, e.offsetX)) + 'px';
    tip.style.top = Math.max(8, e.offsetY - 35) + 'px';
    tip.hidden = false;
  };
  canvas.onpointerup = canvas.onpointercancel = () => {
    drag = null;
  };
  canvas.onpointerleave = () => {
    tip.hidden = true;
  };
  root.querySelector('#point-count').onchange = initialize;
  root.querySelector('#reset-range').onclick = () => {
    start = 0;
    end = total;
    schedule();
  };
  initialize();
  return () => {
    alive = false;
    resize.disconnect();
    cancelAnimationFrame(raf);
    worker.terminate();
  };
}
