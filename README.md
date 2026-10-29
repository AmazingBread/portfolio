# 프론트엔드 황영균 포트폴리오

프로젝트별 담당 기능과 확인 가능한 원본 코드를 중심으로 정리합니다.

- **포트폴리오:** https://amazingbread.github.io/city-safety-on/
- **프로젝트 01 / 부산 도시안전ON:** HLS 실시간 CCTV · 지도 컴포넌트 · Vuex 상태 동기화
- **프로젝트 02 / 아시아드 풍향·풍속:** 원본 Vue/D3 차트 + 실제 API 측정 스냅샷

## 실제 구현과 실행 예시 구분

| 항목 | 현재 공개 버전 | 구분 |
|---|---|---|
| HLS 실시간 CCTV | InlineCctvPlayer.vue의 재생·정지·해제 로직 | 운영 기본 주소 제거, 사용자 지정 1대 HLS 샘플 연결 |
| 지도 | BuildingLocationMap.vue | 실제 EPSG:5181·카카오 타일, 예시 좌표 |
| Vuex 동기화 | 실제 mutation 이름과 지도 공유 구조 | 목록·지도·상세를 보여주는 공개용 최소 store |
| 대용량 그래프 | 원본 코드 수령 대기 | 이전 Canvas/Worker 예제를 본인 경력 사례로 표시하지 않음 |
| 아시아드 D3 | 원본 WindSpeed, WindDirection, WindDirectionSpeed | 실제 API 스냅샷 1,009건, KST 표시 어댑터 |

## 소스 근거

- [도시안전ON 원본 추출 SFC](projects/city-safety/source/)
- [Vuex 최소 store](projects/city-safety/sync-store.js)
- [아시아드 원본 SFC](projects/asiad-wind/source/)
- [실제 측정 스냅샷](projects/asiad-wind/data/measurement-snapshot.json)
- [원본 SHA-256 및 변경 범위](docs/source-provenance.json)

원본 전체 소스·인증 정보·RTSP 주소·실제 건물 좌표는 포함하지 않습니다. CCTV는 사용자가 지정한 산책로강변교_남(00-800-0228)의 공개 HLS 중계 주소 한 개만 샘플로 연결합니다. 아시아드 측정값은 사용자가 제공한 API를 읽기 전용으로 조회해 필요한 다섯 필드만 저장했습니다. 데이터는 실시간이 아닌 저장 시점의 스냅샷입니다.

## 기술과 담당 범위

Vue 2, Vuex 3, JavaScript, Leaflet, Proj4, hls.js, D3 7을 사용한 관제 UI와 데이터 시각화 개발 사례입니다. 원 프로젝트 전체를 단독 개발했다는 의미가 아닙니다. 실제 화면·인터랙션·컴포넌트 상태 관리 범위를 소개합니다.

## 로컬 실행

Node.js 18 이상. 프론트엔드 라이브러리는 라이선스와 함께 vendor/에 포함했습니다.

~~~sh
npm start
npm test
npm run build
~~~

기본 실행 주소: http://127.0.0.1:4173/

## AI 도구 활용

Codex를 코드 분리, 공개용 실행 어댑터, 테스트 보조와 문서 정리에 사용했습니다. 실제 개발 소스와 AI가 작성한 설명용 예시를 구분하며, 실제 측정 없이 성능 개선 수치를 주장하지 않습니다.

## 제출

사람인에는 소개 페이지 URL을 등록하고 코드와 구현 설명으로 연결합니다. PDF는 프로젝트별 역할·문제·해결·근거 코드를 요약하는 보조 자료로 사용할 수 있습니다.
