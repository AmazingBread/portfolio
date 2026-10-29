import InlineCctvPlayer from '../../projects/city-safety/source/InlineCctvPlayer.js';
import { pageHeader, story } from '../lib/ui.js';
export function mount(root) {
  root.innerHTML =
    pageHeader(
      'PROJECT 01 / HLS',
      'HLS 기반 실시간 CCTV',
      '도시안전ON에서 제공되는 CCTV 한 대를 실제 프로젝트의 Vue 재생 컴포넌트로 연결합니다.',
      ['Vue 컴포넌트', 'hls.js', 'M3U8 / MediaSource', '10초 제한']
    ) +
    '<div id="hls-source-app"></div><section class="card implementation-flow"><h2>구현 흐름</h2><ol><li>센서 데이터의 cctv_cd로 HLS 재생 주소 구성</li><li>hls.js 지원 여부 확인 · 미지원 환경은 네이티브 HLS 확인</li><li>MANIFEST_PARSED → play() → playing 시 10초 타이머</li><li>pause() + stopLoad()로 마지막 프레임을 유지하고 추가 다운로드 중단</li><li>다시보기 시 startLoad(-1), 화면 종료 시 destroy()와 타이머 해제</li></ol><a href="https://github.com/AmazingBread/city-safety-on/blob/main/projects/city-safety/source/InlineCctvPlayer.vue" target="_blank" rel="noopener noreferrer">실제 Vue 컴포넌트 코드 보기 ↗</a></section>' +
    story(
      'HLS 연결과 재생 시간 제한, 정지 프레임 유지, 네트워크 로드 중단을 함께 제어해야 합니다.',
      '원 프로젝트 InlineCctvPlayer.vue의 재생·정지·해제 메서드를 유지했습니다. 센서 응답 중 CCTV 코드와 이름만 사용하며 원본 RTSP 정보는 사용하지 않습니다.',
      '실제 CCTV 한 대를 10초 재생합니다. 정지 후 다시보기 또는 연결 해제를 확인하세요. 영상 상태는 운영 중계 서버와 카메라 상태에 따라 달라질 수 있습니다.'
    );
  const vm = new Vue({
    components: { InlineCctvPlayer },
    data: () => ({
      connected: true,
      camera: { cctv_cd: '00-800-0228', sensor_name: '산책로강변교_남' },
      streamBase: 'https://safecity.busan.go.kr:30443/play/hls',
    }),
    methods: {
      replay() {
        if (!this.connected) this.connected = true;
        else if (this.$refs.player) this.$refs.player.replay();
      },
      disconnect() {
        this.connected = false;
      },
    },
    template: `<section class="card"><div class="card-heading"><div><h2>{{camera.sensor_name}}</h2><p class="muted">도시안전ON 실시간 CCTV · 1대 · 재생 제한 10초</p></div><div class="controls"><button class="btn primary" type="button" @click="replay">{{connected?'다시보기':'실시간 CCTV 연결'}}</button><button class="btn" type="button" @click="disconnect" :disabled="!connected">연결 해제</button></div></div><div class="hls-player-stage"><inline-cctv-player v-if="connected" ref="player" :cctv-cd="camera.cctv_cd" :stream-base="streamBase" :sensor-name="camera.sensor_name" :duration="10"/><div v-else class="hls-empty"><b>CCTV 연결이 해제되었습니다.</b><p>실시간 CCTV 연결을 누르면 10초 동안 다시 재생합니다.</p></div></div><p class="inline-message">샘플 코드 {{camera.cctv_cd}} · 원본 RTSP 주소 및 카메라 인증 정보 미포함 · 브라우저에서 HLS 중계 서버에 직접 요청</p></section>`,
  }).$mount(root.querySelector('#hls-source-app'));
  return () => vm.$destroy();
}
