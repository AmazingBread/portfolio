const L = window.L;

const component = {
  name: 'InlineCctvPlayer',
  props: {
    cctvCd: { type: String, default: 'public-test' },
    streamUrl: { type: String, default: '' },
    sensorName: { type: String, default: 'CCTV' },
    duration: { type: Number, default: 10 },
    streamBase: { type: String, default: '' },
  },
  data() {
    return { paused: false, loading: true, error: '', stopTimer: null };
  },
  mounted() {
    this.start();
  },
  beforeDestroy() {
    this.cleanup();
  },
  watch: {
    streamUrl() {
      this.start();
    },
    cctvCd() {
      this.start();
    },
    streamBase() {
      this.start();
    },
  },
  methods: {
    cleanup() {
      clearTimeout(this.stopTimer);
      this.stopTimer = null;
      if (this.hls) {
        this.hls.destroy();
        this.hls = null;
      }
      const video = this.$refs.video;
      if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
    },
    start() {
      this.cleanup();
      this.paused = false;
      this.loading = true;
      this.error = '';
      const video = this.$refs.video;
      if (!video || !this.cctvCd) return;
      const url =
        this.streamUrl || `${this.streamBase}/${encodeURIComponent(this.cctvCd)}/index.m3u8`;
      const HlsPlayer = window.Hls;
      if (HlsPlayer && HlsPlayer.isSupported()) {
        const hls = new HlsPlayer({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 30,
        });
        this.hls = hls;
        hls.on(HlsPlayer.Events.MANIFEST_PARSED, () => this.play());
        hls.on(HlsPlayer.Events.ERROR, (_, data) => {
          if (data.fatal) this.fail('영상을 불러오지 못했습니다.');
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        this.play();
      } else {
        this.fail('이 브라우저에서 CCTV 재생을 지원하지 않습니다.');
      }
    },
    play() {
      const result = this.$refs.video.play();
      if (result && result.catch)
        result.catch(() => this.fail('재생 버튼을 눌러 다시 시도해주세요.'));
    },
    onPlaying() {
      this.loading = false;
      this.paused = false;
      this.error = '';
      if (this.stopTimer === null)
        this.stopTimer = setTimeout(this.pause, this.duration * 1000);
    },
    pause() {
      clearTimeout(this.stopTimer);
      this.stopTimer = null;
      this.$refs.video.pause();
      if (this.hls) this.hls.stopLoad();
      this.paused = true;
    },
    replay() {
      if (this.error) {
        this.start();
        return;
      }
      this.paused = false;
      this.loading = true;
      if (this.hls) this.hls.startLoad(-1);
      this.play();
    },
    fail(message) {
      clearTimeout(this.stopTimer);
      this.stopTimer = null;
      if (this.hls) this.hls.stopLoad();
      this.$refs.video.pause();
      this.loading = false;
      this.error = message;
    },
    onVideoError() {
      if (this.$refs.video.getAttribute('src')) this.fail('영상을 불러오지 못했습니다.');
    },
    fullscreen() {
      if (this.$el.requestFullscreen) this.$el.requestFullscreen().catch(() => {});
    },
  },
};

component.template =
  '\n<div class="inline-cctv">\n    <video ref="video" autoplay muted playsinline :aria-label="sensorName" @playing="onPlaying" @error="onVideoError"></video>\n    <button v-if="paused || error" class="play-overlay" type="button" @click="replay">\n        <span aria-hidden="true">▶</span><strong>{{ error ? \'연결 재시도\' : \'다시보기\' }}</strong>\n        <small>{{ error || duration + \'초 재생 후 정지되었습니다.\' }}</small>\n    </button>\n    <div v-else-if="loading" class="loading-message" role="status">CCTV 연결 중…</div>\n    <div class="video-footer"><span>{{ sensorName }}</span><span>{{ duration }}초 재생</span><button type="button" aria-label="CCTV 전체화면" @click="fullscreen">⛶</button></div>\n</div>\n';
export default component;
