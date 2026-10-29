# CCTV

Canvas captureStream으로 합성 영상을 만들어 HTMLVideoElement에서 재생합니다. playing 이벤트 후 10초 타이머를 걸고 pause로 마지막 프레임을 유지합니다. 다시보기는 타이머를 재설정합니다. 화면 해제 시 트랙, Object URL, RAF를 정리합니다.

구현: [src/components/cctv.js](../src/components/cctv.js)
