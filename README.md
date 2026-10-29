# 도시안전ON

**CCTV · 대용량 그래프 · 지도 · 마커**로 나누어 살펴보는 프론트엔드 포트폴리오입니다.

도시안전ON 개발 과정에서 다룬 화면과 인터랙션을 설명하기 위해 **독립적으로 새로 작성한 데모**입니다. 운영 프로젝트의 전체 소스나 실서비스 데이터가 아닙니다.

- 프로젝트 소개와 데모: https://amazingbread.github.io/city-safety-on/ (GitHub Pages 활성화 후 사용)
- 코드: https://github.com/AmazingBread/city-safety-on
- 작성자: [AmazingBread](https://github.com/AmazingBread)

## 바로 확인할 기능

| 기능 | 데모 | 핵심 구현 |
|---|---|---|
| CCTV | [플레이어](https://amazingbread.github.io/city-safety-on/#cctv) | 10초 제한, 정지 프레임, 다시보기, 로컬 영상, 타이머·미디어 해제 |
| 대용량 그래프 | [그래프](https://amazingbread.github.io/city-safety-on/#graphs) | 1만/10만/100만 가상 데이터, Worker, Min/Max 표본화, Canvas, 휠·드래그 |
| 지도 | [지도](https://amazingbread.github.io/city-safety-on/#maps) | 독립 Leaflet 인스턴스, ResizeObserver, 대상 전환, 상시 이름표 |
| 마커 | [클러스터](https://amazingbread.github.io/city-safety-on/#markers) | 2,000개 가상 위치, 클러스터, 지연 응답, 필터·레이어 교체 |

## 추가 프로젝트: 아시아드 풍향·풍속 / D3

[아시아드 D3 데모](https://amazingbread.github.io/city-safety-on/#asiad) · [구현 설명](docs/asiad-d3.md)

풍속·돌풍속 시계열, 풍향 극좌표와 시간축 벡터, 최대값 표시, 기간 조회 및 갱신 시뮬레이션을 별도 projects/asiad-wind/ 폴더에 구성했습니다. 원본 Vue + D3 7 프로젝트는 읽기만 했고, 공개 데모는 가상 데이터로 재구성했습니다.

## 담당 범위와 기술 구분

- 원 프로젝트 작업: Vue 기반 관제·관리자 화면, CCTV 재생 컴포넌트, 지도·마커 표시, SCSS 레이아웃, 임계값 입력 UI 및 비동기 초기화 문제 개선.
- 이 공개 데모: 위 경험을 분리해 설명하기 위한 브라우저 ES Modules, Canvas, Worker, Leaflet 기반 재구성.
- 원 프로젝트와 동일한 서버·DB·API·로그인·실시간 데이터 수집 기능은 제공하지 않습니다.
- 원 프로젝트 전체를 단독 개발했다는 의미가 아닙니다. 위 항목의 화면·인터랙션 범위에 한정합니다.

## 실행

Node.js 18 이상에서 별도 패키지 설치 없이 실행할 수 있습니다.

~~~sh
npm start
# http://127.0.0.1:4173
npm test
npm run build
~~~

파일 더블클릭 대신 HTTP 서버로 열어야 ES Modules와 Web Worker가 동작합니다. 지도 타일은 인터넷 연결이 필요합니다. Leaflet 및 MarkerCluster는 라이선스와 함께 vendor/에 포함되어 있습니다.

## 폴더 구조

~~~text
src/components/
  overview.js     프로젝트 소개
  cctv.js         영상 수명 관리 데모
  graphs.js       대용량 그래프 인터랙션
  maps.js         대상 선택과 지도 갱신
  markers.js      비동기 마커와 클러스터
  map-base.js     재사용 지도 생성·핀
src/workers/      그래프 데이터 생성·집계
src/lib/          표본화·가상 데이터·재생 제어
tests/            극값 보존·경계·재생 제어 검증
docs/             기능별 설명과 제출 안내
~~~

## 문제 해결 사례

### 1. 첫 지도 진입에서 CCTV 마커가 나타나지 않는 문제

지도 생성 시 목록 응답이 아직 도착하지 않아 빈 레이어가 만들어졌고, 데이터 도착 후 재구성이 없었습니다. 목록 갱신을 감지해 기존 레이어를 제거하고 다시 그리는 방식으로 개선했습니다. 공개 마커 데모는 지연 응답과 연속 필터 변경을 통해 같은 종류의 타이밍 문제를 확인하도록 만들었습니다.

### 2. 재생 제한과 미디어 자원 정리

원 프로젝트는 HLS 재생 후 정지 프레임을 유지하면서 추가 로드를 중단하는 흐름을 사용했습니다. 공개 데모는 실제 운영 스트림 대신 합성 Canvas 영상과 사용자가 고른 로컬 영상을 사용하며, 메뉴 이동 시 타이머·스트림 트랙·Object URL을 정리합니다. 운영 HLS 기능 전체를 검증하는 데모는 아닙니다.

### 3. 대량 측정값의 화면 표현

이 공개 데모에서 추가한 구현입니다. Worker에서 최대 100만 건의 가상 값을 생성하고, 화면 구간을 버킷으로 나누어 최솟값·최댓값을 보존합니다. 표본을 Canvas에 그려 원본 개수와 렌더링 개수를 분리합니다. 처리 시간은 Worker 내 실제 측정값이며, 특정 FPS나 성능 향상률을 주장하지 않습니다.

## 공개 범위

- 실서비스 계정·환경 변수·토큰·API·운영 CCTV·정확한 건물 위치·수신자 개인정보를 포함하지 않습니다.
- 지도는 OpenStreetMap 공개 타일을 사용합니다. 타일 요청은 해당 제공자에게 전송되며 출처를 지도에 표시합니다.
- 가상 마커는 설명용 데이터이며 실제 위험 상황과 무관합니다.
- AI 도구(Codex)는 코드 초안·분리 작업·검증 보조에 사용했습니다. 생성 코드와 실제 구현 범위는 위와 같이 구분했습니다.

## 사람인 제출

URL 항목에는 실행 가능한 소개 페이지를 등록하고, README와 코드로 연결하세요. PDF는 담당 범위, 4개 기능, 문제 해결 사례, 실행 링크를 5~7페이지로 요약하는 보조 자료로 사용할 수 있습니다. 자세한 구성은 [제출 안내](docs/submission.md)를 참고하세요.
