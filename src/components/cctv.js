import { pageHeader, story } from '../lib/ui.js';
import { TimedPlayback } from '../lib/timed-playback.js';
export function mount(root) {
  root.innerHTML =
    pageHeader(
      '01',
      'CCTV 플레이어',
      '영상 연결부터 정지, 다시보기, 해제까지. 재사용 가능한 재생 수명 관리 데모입니다.',
      ['HTMLVideoElement', 'Canvas captureStream', '10초 재생']
    ) +
    '<section class="demo-split"><article class="card"><div class="card-heading"><h2>영상 미리보기</h2><span class="pill">SYNTHETIC VIDEO</span></div><div class="video-frame"><video muted playsinline aria-label="합성 CCTV 프리뷰"></video><button class="video-overlay" hidden><b>▶</b><strong>다시보기</strong><span>10초 재생이 종료되었습니다.</span></button><span class="video-status">연결 중</span></div><div class="video-toolbar"><span>합성 영상 · 실제 CCTV 아님</span><strong id="video-countdown">10초</strong></div></article><article class="card settings"><p class="eyebrow">PLAYBACK CONTROL</p><h2>한 번에 10초만 재생</h2><p>재생이 시작된 순간 제한 시간을 계산합니다. 종료 시 마지막 프레임을 유지하고 다시보기 버튼을 표시합니다.</p><button class="btn primary" id="replay">다시 재생</button><button class="btn" id="synthetic">합성 영상으로 전환</button><label class="file-input">로컬 영상으로 테스트<input type="file" accept="video/*" id="local-video"></label><small>선택한 파일은 브라우저 안에서만 재생되며 서버에 업로드되지 않습니다.</small><div class="notice" role="status" id="video-message">합성 영상이 자동 재생됩니다.</div></article></section>' +
    story(
      '재생이 끝나도 타이머나 미디어 자원이 남으면 네트워크와 메모리가 계속 사용됩니다.',
      '재생 제어 클래스를 분리하고, 화면 이동 시 타이머·애니메이션·스트림·파일 URL을 모두 정리합니다.',
      '10초 정지 후 다시보기, 로컬 영상 선택, 메뉴 이동 후 재진입을 확인해 보세요.'
    );
  const video = root.querySelector('video'),
    overlay = root.querySelector('.video-overlay'),
    status = root.querySelector('.video-status'),
    count = root.querySelector('#video-countdown'),
    message = root.querySelector('#video-message');
  let alive = true,
    frame = null,
    stream = null,
    url = null,
    countdown = null,
    started = 0,
    phase = 0;
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 450;
  const ctx = canvas.getContext('2d');
  function draw() {
    if (!alive) return;
    phase++;
    ctx.fillStyle = '#142f46';
    ctx.fillRect(0, 0, 800, 450);
    ctx.fillStyle = '#7895a7';
    ctx.fillRect(190, 90, 420, 270);
    ctx.fillStyle = '#bdd2d9';
    for (let x = 215; x < 590; x += 65)
      for (let y = 115; y < 330; y += 58) ctx.fillRect(x, y, 35, 30);
    ctx.fillStyle = '#c2cbd0';
    ctx.fillRect(0, 360, 800, 90);
    ctx.fillStyle = '#d7ede4';
    ctx.fillRect(((phase * 2) % 1000) - 100, 385, 90, 28);
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px monospace';
    ctx.fillText('CITY SAFETY ON / SYNTHETIC', 22, 32);
    ctx.fillText(new Date().toLocaleTimeString('ko-KR'), 22, 425);
    frame = requestAnimationFrame(draw);
  }
  const timer = new TimedPlayback({
    onStop: () => {
      video.pause();
      cancelAnimationFrame(frame);
      overlay.hidden = false;
      status.textContent = '일시정지';
      count.textContent = '0초';
      clearInterval(countdown);
    },
  });
  function resetMedia() {
    timer.clear();
    clearInterval(countdown);
    cancelAnimationFrame(frame);
    video.pause();
    video.srcObject = null;
    video.removeAttribute('src');
    video.load();
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
    if (url) {
      URL.revokeObjectURL(url);
      url = null;
    }
  }
  function play() {
    overlay.hidden = true;
    status.textContent = '연결 중';
    timer.clear();
    clearInterval(countdown);
    video.play().catch(() => {
      if (alive) {
        overlay.hidden = false;
        overlay.querySelector('span').textContent = '재생 버튼을 눌러주세요.';
      }
    });
  }
  function synthetic() {
    resetMedia();
    message.textContent = '합성 영상 · 실제 CCTV 미연결';
    if (!canvas.captureStream) {
      message.textContent =
        '이 브라우저는 합성 스트림을 지원하지 않습니다. 로컬 영상을 선택해주세요.';
      return;
    }
    draw();
    stream = canvas.captureStream(20);
    video.srcObject = stream;
    play();
  }
  function replay() {
    if (video.srcObject) {
      cancelAnimationFrame(frame);
      draw();
    } else video.currentTime = 0;
    play();
  }
  video.addEventListener('playing', () => {
    if (!alive || timer.timer !== null) return;
    started = performance.now();
    status.textContent = '● 재생 중';
    count.textContent = '10초';
    timer.start();
    clearInterval(countdown);
    countdown = setInterval(() => {
      count.textContent =
        Math.max(0, 10 - Math.floor((performance.now() - started) / 1000)) + '초';
    }, 250);
  });
  video.addEventListener('ended', () => {
    timer.clear();
    clearInterval(countdown);
    overlay.hidden = false;
    status.textContent = '영상 종료';
  });
  video.addEventListener('error', () => {
    if (video.getAttribute('src')) {
      message.textContent = '이 파일을 재생할 수 없습니다. 다른 영상 파일을 선택해주세요.';
      timer.clear();
      clearInterval(countdown);
    }
  });
  overlay.onclick = replay;
  root.querySelector('#replay').onclick = replay;
  root.querySelector('#synthetic').onclick = synthetic;
  root.querySelector('#local-video').onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    resetMedia();
    url = URL.createObjectURL(file);
    video.src = url;
    message.textContent = '로컬 파일: ' + file.name;
    play();
  };
  synthetic();
  return () => {
    alive = false;
    timer.destroy();
    resetMedia();
  };
}
