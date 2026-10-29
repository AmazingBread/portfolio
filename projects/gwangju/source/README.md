# Highcharts 그래프 구현 코드

광주첨단 스마트그린산단 침수대응 의사결정지원시스템에서 사용한 애플리케이션 코드입니다. Highcharts 라이브러리 자체는 포함하지 않습니다.

- 원본 경로: `src/main/webapp/resources/js/createHighChart.js`
- `createBigDataChart`: 시계열 그래프 설정
- `createChart`: 센서 종류와 시리즈 구성에 따라 축·차트 종류·단위를 설정
- 수위: spline / 강우값: column / 누적강우: areaspline
- 운영 페이지의 Highcharts·moment 및 전역 컨텍스트를 전제로 하므로 단독 실행용 모듈은 아닙니다.
- 원본 SHA-256: c57c8054313786271e91f1a66092cbb0ece5bde3d31b29dae65142e2eb7d0fbe
