<template>
    <div class="inline-cctv">
        <video ref="video" autoplay muted playsinline :aria-label="sensorName" @playing="onPlaying" @error="onVideoError"></video>
        <button v-if="paused || error" class="play-overlay" type="button" @click="replay">
            <span aria-hidden="true">▶</span><strong>{{ error ? '연결 재시도' : '다시보기' }}</strong>
            <small>{{ error || duration + '초 재생 후 정지되었습니다.' }}</small>
        </button>
        <div v-else-if="loading" class="loading-message" role="status">CCTV 연결 중…</div>
        <div class="video-footer"><span>{{ sensorName }}</span><span>{{ duration }}초 재생</span><button type="button" aria-label="CCTV 전체화면" @click="fullscreen">⛶</button></div>
    </div>
</template>

<script>
export default {
    name: 'InlineCctvPlayer',
    props: {
        cctvCd: { type: String, default: 'public-test' },
        streamUrl: { type: String, default: '' },
        sensorName: { type: String, default: 'CCTV' },
        duration: { type: Number, default: 10 },
        streamBase: { type: String, default: '' }
    },
    data() { return { paused: false, loading: true, error: '', stopTimer: null }; },
    mounted() { this.start(); },
    beforeDestroy() { this.cleanup(); },
    watch: {
        streamUrl() { this.start(); },
        cctvCd() { this.start(); },
        streamBase() { this.start(); }
    },
    methods: {
        cleanup() {
            clearTimeout(this.stopTimer);
            this.stopTimer = null;
            if (this.hls) { this.hls.destroy(); this.hls = null; }
            const video = this.$refs.video;
            if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
        },
        start() {
            this.cleanup();
            this.paused = false; this.loading = true; this.error = '';
            const video = this.$refs.video;
            if (!video || !this.cctvCd) return;
            const url = this.streamUrl || `${this.streamBase}/${encodeURIComponent(this.cctvCd)}/index.m3u8`;
            const HlsPlayer = window.Hls;
            if (HlsPlayer && HlsPlayer.isSupported()) {
                const hls = new HlsPlayer({ enableWorker: true, lowLatencyMode: true, backBufferLength: 30 });
                this.hls = hls;
                hls.on(HlsPlayer.Events.MANIFEST_PARSED, () => this.play());
                hls.on(HlsPlayer.Events.ERROR, (_, data) => {
                    if (data.fatal) this.fail('영상을 불러오지 못했습니다.');
                });
                hls.loadSource(url); hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url; this.play();
            } else { this.fail('이 브라우저에서 CCTV 재생을 지원하지 않습니다.'); }
        },
        play() {
            const result = this.$refs.video.play();
            if (result && result.catch) result.catch(() => this.fail('재생 버튼을 눌러 다시 시도해주세요.'));
        },
        onPlaying() {
            this.loading = false; this.paused = false; this.error = '';
            if (this.stopTimer === null) this.stopTimer = setTimeout(this.pause, this.duration * 1000);
        },
        pause() {
            clearTimeout(this.stopTimer); this.stopTimer = null;
            this.$refs.video.pause();
            if (this.hls) this.hls.stopLoad();
            this.paused = true;
        },
        replay() {
            if (this.error) { this.start(); return; }
            this.paused = false; this.loading = true;
            if (this.hls) this.hls.startLoad(-1);
            this.play();
        },
        fail(message) {
            clearTimeout(this.stopTimer); this.stopTimer = null;
            if (this.hls) this.hls.stopLoad();
            this.$refs.video.pause();
            this.loading = false; this.error = message;
        },
        onVideoError() { if (this.$refs.video.getAttribute('src')) this.fail('영상을 불러오지 못했습니다.'); },
        fullscreen() { if (this.$el.requestFullscreen) this.$el.requestFullscreen().catch(() => {}); }
    }
};
</script>

<style scoped>
.inline-cctv { position: relative; flex: 1; min-height: 0; overflow: hidden; border-radius: 7px; background: #162339; color: #fff; }
video { display: block; width: 100%; height: 100%; object-fit: cover; }
.play-overlay { position: absolute; inset: 0; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 0; background: #08162977; color: #fff; cursor: pointer; }
.play-overlay span { font-size: 30px; } .play-overlay strong { font-size: 17px; } .play-overlay small { font-size: 12px; }
.loading-message { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 14px; }
.video-footer { position: absolute; bottom: 0; left: 0; right: 0; display: flex; align-items: center; gap: 10px; padding: 5px 9px; background: #07101e99; font-size: 12px; pointer-events: none; }
.video-footer span:first-child { flex: 1; } .video-footer button { padding: 0; border: 0; background: transparent; color: #fff; font-size: 22px; cursor: pointer; pointer-events: auto; }
</style>
