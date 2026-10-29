# 실제 사용한 측정 데이터

[measurement-snapshot.json](measurement-snapshot.json)은 D3 실행 화면에 사용하는 실제 API 응답 스냅샷입니다. 총 1,009건이며 `capturedAt`은 저장 시각, `timezone`은 화면 표시 기준입니다.

| 필드 | 의미 | 단위 |
|---|---|---|
| measureDatetime | 측정 시각(타임존 포함) | ISO 날짜 |
| ws10m | 풍속 | m/s |
| wd10m | 풍향 | ° |
| wsGust | 돌풍속 | m/s |
| wdGust | 돌풍향 | ° |

실시간 API를 호출하지 않고 이 JSON을 읽어 원본 컴포넌트에 전달합니다.

공개 실행 어댑터 WindDirection.js에는 SVG viewBox를 추가하여 좁은 화면에서 동·남쪽 방위가 잘리지 않도록 했습니다. 원본 .vue는 보존합니다.
