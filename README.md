# 프론트엔드 황영균 포트폴리오

**실시간 영상 · 지도 상태 동기화 · 시계열 데이터 시각화**

공공 안전 관제와 기상 모니터링에서 구현한 프론트엔드 기능을 소개합니다. 프로젝트별 실행 화면과 원본 코드를 함께 확인할 수 있습니다.

### [포트폴리오 열기 →](https://amazingbread.github.io/city-safety-on/)

[부산 도시안전ON](#01-부산-도시안전on) · [아시아드](#02-아시아드-풍향풍속-모니터링) · [광주첨단](#03-광주첨단-스마트그린산단-침수대응) · [로컬 실행](#로컬-실행)

## 프로젝트 한눈에 보기

| 프로젝트 | 구현 내용 | 주요 기술 | 화면 |
| :--- | :--- | :--- | :--- |
| 부산 도시안전ON | HLS CCTV, GIS 지도, 지도·목록·상세 상태 동기화 | Vue 2 · Vuex 3 · Leaflet · hls.js | [보기](https://amazingbread.github.io/city-safety-on/#city) |
| 아시아드 풍향·풍속 | 풍속·돌풍속 시계열, 풍향 극좌표·벡터 | Vue 2 · D3.js 7 · SVG | [보기](https://amazingbread.github.io/city-safety-on/#asiad) |
| 광주첨단 침수대응 | 위험도 이력 지도 재생, 수위·강우 복합 차트 검색 | JavaScript · JSP · jQuery · Leaflet · Highcharts | [보기](https://amazingbread.github.io/city-safety-on/#graphs) |

## 01. 부산 도시안전ON

센서·지도·실시간 영상을 함께 확인하는 공공 안전 관제 UI입니다.

| 기능 | 기술적으로 보여주는 내용 | 실행 / 코드 |
| :--- | :--- | :--- |
| HLS 실시간 CCTV | 10초 재생 제한, pause·stopLoad 분리, 종료 시 타이머와 인스턴스 해제 | [실행](https://amazingbread.github.io/city-safety-on/#cctv) / [원본 컴포넌트](projects/city-safety/source/InlineCctvPlayer.vue) |
| GIS 지도 컴포넌트 | EPSG:5181 좌표계, 지도 초기화, 마커 갱신, 컨테이너 크기 대응 | [실행](https://amazingbread.github.io/city-safety-on/#maps) / [원본 컴포넌트](projects/city-safety/source/BuildingLocationMap.vue) |
| Vuex 상태 동기화 | 공통 상태를 통해 목록 선택·지도 마커·상세 패널 연결 | [실행](https://amazingbread.github.io/city-safety-on/#markers) / [공개용 최소 store](projects/city-safety/sync-store.js) |

**확인할 흐름:** 목록 선택 → Vuex 상태 변경 → 지도와 상세 패널 갱신.

공개 버전은 사용자 지정 CCTV 한 대를 연결합니다. 지도 좌표와 동기화 목록은 예시 데이터이며, 전체 운영 store 대신 핵심 흐름을 재현한 최소 구현을 제공합니다.

## 02. 아시아드 풍향·풍속 모니터링

풍속과 돌풍속의 변화, 최대값이 발생한 시점, 해당 시점의 풍향을 함께 표현합니다.

- **시계열:** 시간축에 따른 풍속·돌풍속과 최대값 표시
- **방향:** 풍향 극좌표와 시간별 방향 벡터 표현
- **데이터:** 실제 API 측정 스냅샷 1,009건 사용
- **실행 방식:** 원본 Vue/D3 컴포넌트에 공개용 실행 어댑터와 KST 표시 적용

[차트 실행 →](https://amazingbread.github.io/city-safety-on/#asiad) · [원본 컴포넌트](projects/asiad-wind/source/) · [측정 스냅샷](projects/asiad-wind/data/measurement-snapshot.json)

저장된 측정값을 재현하며 실시간으로 갱신되는 화면은 아닙니다.

## 03. 광주첨단 스마트그린산단 침수대응

침수대응 의사결정지원시스템의 **침수위험 시뮬레이션**과 **빅데이터 검색** 개발 사례입니다.

### 침수위험 시뮬레이션

![침수위험 시뮬레이션 실제 화면](assets/gwangju/simulation.png)

기준시간과 조회 간격을 설정하고, 시간 슬라이더에 따라 센서별 위험도 레이어를 지도에 표시합니다.

1. 조회 조건으로 시간 키 생성
2. 침수위·수위·하천 이력 데이터를 시간별로 병합
3. 재생 또는 슬라이더 이동 시 이전 레이어 제거
4. 해당 시점의 위험도에 따른 색상·반경으로 Leaflet 원 갱신

[이력 조회 코드](projects/gwangju/history-loading.txt) · [지도 갱신 코드](projects/gwangju/simulation.txt)

### 빅데이터 검색 · Highcharts

![수위와 강우 빅데이터 검색 실제 화면](assets/gwangju/search.png)

기간·지역·센서를 선택하여 **수위, 강우값, 1시간 누적강우, 누적강우**를 그래프와 표로 확인합니다. 서로 다른 단위의 시리즈를 다중 Y축에 연결하고, 선·막대·영역 차트를 조합합니다.

[구현 사례 보기 →](https://amazingbread.github.io/city-safety-on/#graphs) · [Highcharts 구현 코드](projects/gwangju/source/createHighChart.js)

현재 공개 페이지는 실제 화면과 원본 코드 발췌로 구성된 사례 소개입니다. 운영 API 연결 및 대용량 성능 벤치마크를 재현한 실행 데모는 아닙니다.

## 코드 안내

~~~text
├── src/                       포트폴리오 화면 · 라우팅 · 스타일
├── projects/
│   ├── city-safety/            도시안전ON 컴포넌트 · Vuex 예시
│   ├── asiad-wind/             D3 컴포넌트 · 실제 측정 스냅샷
│   └── gwangju/                침수대응 사례 · 원본 코드 발췌
├── assets/gwangju/             실제 운영 화면 캡처
├── docs/source-provenance.json 원본 해시 · 공개용 변경 범위
├── tests/                     상태 동기화 · 데이터 · HLS 수명 검증
└── scripts/                   로컬 서버 · 정적 빌드
~~~

## 로컬 실행

Node.js 18 이상에서 실행합니다. 프론트엔드 라이브러리는 라이선스와 함께 `vendor/`에 포함되어 있습니다.

~~~sh
npm start
~~~

브라우저에서 [http://127.0.0.1:4173/](http://127.0.0.1:4173/)를 엽니다.

~~~sh
npm test       # 상태 동기화, 측정 데이터, 원본 출처, HLS 자원 해제 검증
npm run build # dist/에 정적 배포 파일 생성
~~~

## 공개 범위와 개발 도구

프로젝트별 프론트엔드 구현 범위를 소개하며, 원 프로젝트 전체를 단독 개발했다는 의미는 아닙니다. 운영 프로젝트는 별도 보관하고 이 저장소에서 공개용 화면을 구성합니다.

원본 전체 소스·인증 정보·RTSP 주소는 포함하지 않습니다. 원본 컴포넌트, 실행 어댑터, 예시 데이터와 실제 측정 스냅샷을 구분합니다. [원본 해시 및 변경 범위](docs/source-provenance.json)에서 추출된 컴포넌트의 출처를 확인할 수 있습니다.

Codex를 코드 분리, 실행 어댑터, 테스트 보조와 문서 정리에 활용했습니다. 확인되지 않은 처리량이나 성능 개선 수치는 기재하지 않습니다.


### 테이블과 지도 마커 연결 상세

![도시안전ON 실제 운영 화면](assets/city-safety/map-table-operation.png)

MapView에서 SET_MAP으로 공유한 지도와 센서 목록을 기반으로 테이블·마커를 구성합니다. 원본 FlvlList는 WeakMap에 센서 객체와 마커를 연결하며, 테이블 클릭 시 대상 마커를 찾아 지도 이동 → 클러스터 표시 → 팝업 열기를 수행합니다. 선택 ID를 action/mutation으로 공유하는 공개 예시와 원본의 직접 마커 제어 방식을 구분하여 설명합니다.

[상세 설명 및 실행 예시](https://amazingbread.github.io/city-safety-on/#markers) · [원본 코드 발췌](projects/city-safety/table-marker-source.txt)


### HLS CCTV 실제 구동 화면

![도시안전ON CCTV 실제 구동 화면](assets/city-safety/cctv-operation.png)

운영 화면의 091_안락 CCTV 영상과 재생 종료 카운트다운입니다. [CCTV 기능 설명 및 실행 샘플](https://amazingbread.github.io/city-safety-on/#cctv)에서 원본 Vue 컴포넌트와 HLS 재생·정지·자원 해제 흐름을 확인할 수 있습니다. 실행 샘플 카메라는 산책로강변교_남이며 이미지와 구분합니다.
