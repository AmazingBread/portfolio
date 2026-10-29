// index_risk.jsp 원본 발췌. 단독 실행 파일이 아닙니다.
// DOM 조회·슬라이더 이벤트 (400–418행)

                let rangeSlider = document.getElementById ('rangeBox');
                let sliderValue = document.getElementById ('sliderValue');
                rangeSlider.addEventListener ('mousedown', function (e) {
                    e.stopPropagation (); // 이벤트 버블링 방지
                });
                let range = document.getElementById ('range');
                // 슬라이더의 max 값을 배열의 길이로 설정

                range.addEventListener ('input', function (e) {
                    let index = range.value
                    drawNewCircle (index)
                });
                let playInterval;
                let isPlaying = false;
                let dateError = false;
                range.disabled = true;

                var timeObjects = {};

// 타이머 기반 input 이벤트 발생 (599–623행)
                function bubblePlaying() {
                    isPlaying = true;
                    range.disabled = false;

                    // 0.5초(500 밀리초)마다 슬라이더 업데이트
                    $ (".rangeStop").show ();
                    $ (".rangePlay").hide ();
                    drawNewCircle (range.value)
                    playInterval = setInterval (function () {
                        var currentValue = parseInt (range.value, 10);
                        if (currentValue < parseInt (range.max, 10)) {
                            currentValue += 1; // 한 스텝 증가
                            range.value = currentValue;
                            // 슬라이더 값 변경 이벤트 발생
                            var event = new Event ('input', {
                                bubbles   : true,
                                cancelable: true,
                            });
                            range.dispatchEvent (event);
                        } else {
                            // 플레이백 종료
                            bubbleStop ();
                        }
                    }, selectedSpeed * 100); // 0.5초마다 실행
                }