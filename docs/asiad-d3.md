# 아시아드 풍향·풍속 / 원본 Vue+D3

현재 화면은 원본 WindSpeed.vue, WindDirection.vue, WindDirectionSpeed.vue로 그립니다. 원본 SFC는 source/에 그대로 보관하며 실행 어댑터는 import를 로컬 라이브러리에 연결하고 시간 라벨만 KST로 통일합니다.

데이터는 사용자가 제공한 측정 API의 실제 응답 1,009건을 2026-10-29에 저장한 스냅샷입니다. measureDatetime, ws10m, wd10m, wsGust, wdGust 다섯 필드만 공개합니다. 실시간 응답이나 합성 데이터가 아닙니다. 재생 시점에 새로 API를 호출하지 않습니다.

이전 독립 재구성 데모와 가상 데이터 대신 실제 소스와 실제 데이터로 교체했습니다. 원본 프로젝트는 수정하지 않았습니다.

원본 파일의 원시 SHA-256과 줄바꿈을 LF로 정규화한 SHA-256을 함께 기록해 Windows/GitHub에서 동일하게 검증합니다.
