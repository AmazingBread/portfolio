
const d3 = window.d3;

// const csvFilePath = 'assets/test.csv';

const component = {
    name: 'zoomAiData',
    components: {},
    props: {
        zoomAiData: Array,
    },
    data() {
        return {
            svg : '',
            width: 0, // 초기값은 0으로 설정
            height : 270,
            marginTop : 50,
            marginRight : 50,
            marginBottom : 40,
            marginLeft : 70,
            bisect: '',
            brush: null,
            idleTimeout : null,
            xAxis : null,
            yAxis : null,
            yAxis2 : null,
            x:'',
            y:'',
            y2:'',

            tooltip: null,
            pointerCircle: null,
            pointerCircle2: null,
            pointerCircle3: null,
            pointerLine: null,
            currentX: null,  // 줌 변환된 x 스케일 저장용
            zoomBehavior: null,
            isZoomed: false,
            flow1:null,
            flow2:null,
            rain:null,
            rainAcc:null,
            chartGroup : null,
            tooltipGroup: null,
        };
    },
    mounted() {
        this.width = this.$refs.zoomAiData.clientWidth
        this.drawzoomAiData();
        // 마우스 위치 업데이트 이벤트 수신
    },
    computed: {
        // pointerPosition() {
        //     return this.$store.state.pointerPosition; // 다른 컴포넌트에서 pointerPosition을 가져옴
        // },
        // isPointerLeft() {
        //     return this.$store.state.isPointerLeft; // 다른 컴포넌트에서 pointerPosition을 가져옴
        // }
    },
    watch: {
        pointerPosition(newEvent) {
            this.pointerMoved(newEvent); // pointerPosition이 변경될 때마다 호출
        },
        // isPointerLeft() {
        //     this.pointerLeft(); // pointerPosition이 변경될 때마다 호출this.$store.state.isPointerLeft
        // }
    },
    created() {},
    beforeDestroy() {},
    methods: {
        resetZoom() {
            this.svg
                 .transition()
                 .duration(500)
                 .call(this.zoomBehavior.transform, d3.zoomIdentity); // 원래 상태로 리셋

            // currentX도 원래 스케일로
            this.currentX = this.x;
            this.isZoomed = false; // 👈 리셋 시 false 처리


            // x축 다시 그리기
            this.xAxis
                 .attr("transform", `translate(0,${this.height - this.marginBottom})`)
                 .call(
                d3.axisBottom(this.currentX)
                   .tickValues(this.initialTicks)
                   .tickSizeOuter(0)
            );

            // 라인 다시 그리기
            // this.svg.selectAll(".flow1")
            //     .attr("d", d3.line()
            //               .x(d => this.x(new Date(d.date))) // 원래 x스케일
            //               .y(d => this.y(d.flow1))
            // );
            this.svg.select('.flow1')
            .attr("d", this.flow1(this.zoomAiData));
            this.svg.select('.flow2')
            .attr("d", this.flow2(this.zoomAiData));

            // 축 텍스트 다시 두 줄로 (생략 가능)
        },
        zoomed(event){
            const transform = event.transform;
            this.currentX = transform.rescaleX(this.x);

            // 줌 상태 감지
            if (!transform.k || transform.k === 1) {
                this.isZoomed = false;
            } else {
                this.isZoomed = true; // 👈 줌 중일 때만 true
            }

            // 1. x축 눈금 계산 (데이터 기준, 중복 제거)
            if (this.isZoomed) {
                let tickDates =  this.isZoomed
                    ? Array.from(new Set(this.zoomAiData.map(d => new Date(d.date).getTime()))).map(t => new Date(t))
                    : this.initialTicks;
                // 스케일 범위 안에 있는 값만 남기기
                const domain = this.currentX.domain();
                tickDates = tickDates.filter(d => d >= domain[0] && d <= domain[1]);

                const maxTicks = 5; // 너무 많으면 5개만 표시
                const displayTicks = tickDates.length <= maxTicks
                    ? tickDates
                    : tickDates.filter((d, i) => i % Math.ceil(tickDates.length / maxTicks) === 0);
                this.xAxis
                     .attr("transform", `translate(0,${this.height - this.marginBottom})`)
                     .call(
                    d3.axisBottom(this.currentX)
                       .tickValues(displayTicks)
                       .tickSizeOuter(0)
                )
            }else{
                // x축 다시 그리기
                this.xAxis.attr("transform", `translate(0,${this.height - this.marginBottom})`).call(
                    d3.axisBottom(this.currentX).ticks(5).tickSizeOuter(0)
                )
            }

            // 2. 축 텍스트 두 줄 만들기 (별도 처리)
            this.xAxis.selectAll(".tick text")
            .call(tick => {
                    tick.each(function(d) {
                        const date = new Date(d);
                        const dateText = d3.timeFormat("%Y/%m/%d")(date);
                        const timeText = d3.timeFormat("%H:%M")(date);

                        const text = d3.select(this);
                        text.text(null) // 기존 텍스트를 지웁니다.

                        text.append('tspan') // 첫 번째 줄 (날짜)
                             .attr('x', 0)
                             .attr('dy', '1em') // 첫 번째 줄을 위로 조금 이동
                             .text(dateText);
                        text.append('tspan') // 두 번째 줄 (시간)
                             .attr('x', 0)
                             .attr('dy', '1.0em') // 두 번째 줄을 아래로 조금 이동
                             .text(timeText);
                    });
                }
            );

            // // 라인 다시 그리기
            // const line = d3.line()
            //     .x(d => this.currentX(new Date(d.date)))
            //     .y(d => this.y(d.flow1));

            this.svg.select('.flow1')
            .attr("d", this.flow1(this.zoomAiData));

            this.svg.select('.flow2')
            .attr("d", this.flow2(this.zoomAiData));

            const barWidth = Math.max(1, (this.width - this.marginLeft - this.marginRight) / this.zoomAiData.length);
            this.chartGroup.selectAll('rect.rain')
            .data(this.zoomAiData)
                 .attr("x", d => this.currentX(new Date(d.date)) - barWidth / 2)
                // .attr("height", d => (this.height - this.marginBottom) - this.y2(d.rain))
                 .attr("height", d => this.y2(d.rain) - this.y2(0))
                 .attr("y", d => this.y2(0));

            // ✅ 누적강우 Area 다시 그리기
            this.chartGroup.select('path.rainAcc')
            .attr("d", this.rainAcc(this.zoomAiData));


            this.svg.attr("viewBox", `0 0 ${this.width} ${this.height}`);
        },
        addZoom() {
            const zoom = d3.zoom()
                            .scaleExtent([1, 40])
                            .translateExtent([[this.marginLeft, 0], [this.width - this.marginRight, this.height]])
                            .extent([[this.marginLeft, 0], [this.width - this.marginRight, this.height]])
                            .on("zoom", this.zoomed);

            this.svg.call(zoom);
            this.zoomBehavior = zoom; // 👈 줌 객체 저장해두기
        },
        drawzoomAiData() {
            // 데이터의 최대값을 계산
            // const maxValue = d3.max(this.zoomAiData, d => d.flow1);
            const maxValue = d3.max(this.zoomAiData, d => Math.max(d.flow1, d.flow2));
            const yMin = 0; // 최소값은 항상 0
            const yMax = maxValue <= 0 ? 1 : Math.ceil(maxValue * 1.5); // 최대값이 0 이하일 때 yMax는 1, 아니면 최대값 반올림 후 0.1 단위로 조정

            this.x = d3.scaleUtc(
                d3.extent(this.zoomAiData, d => new Date(d.date)),
                [this.marginLeft, this.width - this.marginRight]
            );
            this.currentX = this.x.copy(); // ← 요거 중요! 반드시 추가해야 함, 행님!
            this.y = d3.scaleLinear([yMin, yMax], [this.height - this.marginBottom, this.marginTop]);
            const maxValue3 = d3.max(this.zoomAiData, d => Math.max(d.rainAcc));
            const maxValueRain = d3.max(this.zoomAiData, d => Math.max(d.rain));
            const yMin3 = 0; // 최소값은 항상 0
            const yMax3 = maxValue3 <= 0 ? 1 : Math.ceil(maxValue3 * 1.5);
            this.y3 = d3.scaleLinear([yMin3, yMax3], [this.height - this.marginBottom, this.marginTop]);
            this.y2 = d3.scaleLinear()
                         .domain([0, maxValueRain <= 0 ? 1 : Math.ceil(maxValueRain * 1.5)]) // 최대 값 설정
                         .range([this.marginTop, this.height - this.marginBottom]); // 위쪽이 0, 아래쪽이 최대값이 되도록 설정


            // flow1 라인
            this.flow1 = d3.line()
                            .x(d => this.currentX(new Date(d.date)))
                            .y(d => this.y(d.flow1))
            // flow2 라인
            this.flow2 = d3.line()
                            .x(d => this.currentX(new Date(d.date)))
                            .y(d => this.y(d.flow2));

            // 누적 강우(area)
            this.rainAcc = d3.area()
                              .x(d => this.currentX(new Date(d.date)))
                              .y0(this.height - this.marginBottom)
                              .y1(d => this.y3(d.rainAcc))
                              .curve(d3.curveMonotoneX);


            // refs 설정
            this.svg = d3.select(this.$refs.zoomAiData)
                          .attr("viewBox", [0, 0, this.width, this.height])
                          .attr("width", this.width)
                          .attr("height", this.height)
                          .attr("style", "max-width: 100%; height: auto; height: intrinsic; font: 10px sans-serif;")
                          .style("overflow", "visible")
                          .on("pointerenter pointermove", this.pointerMoved)
                          .on("touchstart", event => event.preventDefault())
                          .on("zoom", this.zoomed)  // 줌 대상은 svg

            this.chartGroup = this.svg.append("g").attr("class", "chartGroup");

            this.svg.append("defs")
            .append("clipPath")
                 .attr("id", "clip")
                 .append("rect")
                 .attr("x", this.marginLeft)
                 .attr("y", 0)
                 .attr("width", this.width - this.marginLeft - this.marginRight)
                 .attr("height", this.height);
            this.chartGroup.attr("clip-path", "url(#clip)");

            // clip-path 적용한 xAxis 그룹
            const xAxisGroup = this.svg.append("g")
            .attr("class", "xAxisGroup")
                                    .attr("clip-path", "url(#clip)")
                                    .attr("transform", `translate(0,${this.height - this.marginBottom})`);


            // 초기 tick 10개 생성
            const [start, end] = this.x.domain();
            this.initialTicks = Array.from({length: 10}, (_, i) =>
                new Date(start.getTime() + i * (end - start) / 9)
            );


            this.xAxis = xAxisGroup.call(d3.axisBottom(this.currentX)
                // .tickValues(this.initialTicks)
                                            .ticks(5)
                                            .tickSizeOuter(0));

            // 2. 축 텍스트 두 줄 만들기 (별도 처리)
            this.xAxis.selectAll(".tick text")
            .call(function(tick) {
                tick.each(function(d) {
                    const date = new Date(d);
                    const dateText = d3.timeFormat("%y/%m/%d")(date);
                    const timeText = d3.timeFormat("%H:%M")(date);
                    const text = d3.select(this);
                    text.text(timeText);
                    text.text('') // 기존 텍스트를 지웁니다.
                    text.append('tspan') // 첫 번째 줄 (날짜)
                         .attr('x', 0)
                         .attr('dy', '1em') // 첫 번째 줄을 위로 조금 이동
                         .style('font-size', '10px') // 폰트 사이즈 줄임
                         .text(dateText);

                    text.append('tspan') // 두 번째 줄 (시간)
                         .attr('x', 0)
                         .attr('dy', '1.0em') // 두 번째 줄을 아래로 조금 이동
                         .text(timeText);
                });
            });

            // Add the y-axis, remove the domain line, add grid lines and a label.
            this.yAxis = this.svg.append("g")
            .attr("transform", `translate(${this.marginLeft},0)`)
                              .call(d3.axisLeft(this.y).ticks(this.height / 40))
                              .call(g => g.select(".domain").remove())
                              .call(g => g.selectAll(".tick line").clone()
            .attr("x2", this.width - this.marginLeft - this.marginRight)
                                           .attr("stroke-opacity", 0.1))
                              .append("text") // 라벨 추가
                              .attr("fill", "black")
                              .attr("text-anchor", "end")
                              .attr("x", -8)
                              .attr("y", (this.marginTop / 2) -10)
                              .attr("dy", ".05em")
                              .selectAll("tspan")
                              .data(["유량", "(L/min)"])
                              .enter()
                              .append("tspan")
                              .attr("x", 0)
                              .attr("dy", (d, i) => i === 0 ? 0 : "1.2em")
                              .text(d => d);

            // 왼쪽 yAxis2 (예: 누적강우용)
            this.yAxis2 = this.svg.append("g")
            .attr("transform", `translate(${this.marginLeft - 30},0)`) // 기존 y축보다 조금 왼쪽으로
                               .call(d3.axisLeft(this.y3).ticks(4).tickFormat(d => d.toFixed(1)))
                               .call(g => g.select(".domain").remove())
                               .append("text")
                               .attr("fill", "black")
                               .attr("text-anchor", "end")
                               .attr("x", -8)
                               .attr("y", (this.marginTop / 2) -10)
                               .attr("dy", ".05em")
                               .selectAll("tspan")
                               .data(["누적강우", "(mm)"])
                               .enter()
                               .append("tspan")
                               .attr("x", -8)
                               .attr("dy", (d, i) => i === 0 ? 0 : "1.2em")
                               .text(d => d);

            // y2축 (오른쪽, value2)
            this.svg.append("g")
            .attr("transform", `translate(${this.width - this.marginRight},0)`)
                 .call(d3.axisRight(this.y2)
                          .ticks(4) // 눈금 개수 조정
                          .tickFormat(d => d.toFixed(1)) // 소수점 1자리로 포맷
            )
                 .call(g => g.select(".domain").remove()) // 도메인 라인 제거
                // .call(g => g.selectAll(".tick line").clone() // grid lines 추가
                //              .attr("x2", this.width - this.marginLeft - this.marginRight) // 왼쪽으로 그리드 라인 길이 설정
                //              .attr("stroke-opacity", 0.1))
                 .append("text") // 라벨 추가
                 .attr("fill", "black")
                 .attr("text-anchor", "end")
                 .attr("x", 25)
                 .attr("y", (this.marginTop / 2) -10)
                 .attr("dy", ".05em")
                 .selectAll("tspan")
                 .data(["강우", "(mm)"])
                 .enter()
                 .append("tspan")
                 .attr("x", 25)
                 .attr("dy", (d, i) => i === 0 ? 0 : "1.2em")
                 .text(d => d);

            // Area (누적 강우)
            this.chartGroup.append("path")
            .attr("fill", "#90f598")  // 이미지 색상 기준 적용
                 .attr("fill-opacity", .2) // 투명도 조절
                 .attr("stroke", "#129d12") // 외곽선도 동일 색상
                 .attr("stroke-width", 1)
                 .attr("class", "rainAcc")
                 .attr("d", this.rainAcc(this.zoomAiData));

            // Bar Chart (강우)
            const barWidth = Math.max(1, (this.width - this.marginLeft - this.marginRight) / this.zoomAiData.length);

            this.chartGroup.append("g")
            .selectAll("rect")
                 .data(this.zoomAiData)
                 .join("rect")
                 .attr("x", d => this.x(new Date(d.date)) - barWidth / 2)
                 .attr("y", d => this.y2(0)) // y 위치 설정
                 .attr("width", barWidth * 0.8)
                 .attr("height", d => this.y2(d.rain) - this.y2(0))
                 .attr("fill", "#1E90FF")
                 .attr("opacity", 0.6)
                 .attr("class", "rain");

            // flow1
            this.chartGroup.append("path")
            .attr("fill", "none")
                 .attr("stroke", "#FFA500")
                 .attr("stroke-width", 1.5)
                 .attr("class", "flow1") // 여기에서 .line 클래스 추가
                 .attr("d", this.flow1(this.zoomAiData));

            // flow2
            this.chartGroup.append("path")
            .attr("fill", "none")
                 .attr("stroke", "gray")
                 .attr("stroke-width", 1.5)
                 .attr("stroke-dasharray", "5,5") // 점선 패턴: 5픽셀 선, 5픽셀 간격
                 .attr("class", "flow2")
                 .attr("d", this.flow2(this.zoomAiData));

            // 마우스 포인터 위치에 표시할 포인트(circle) 생성
            this.pointerCircle = this.chartGroup.append("circle")
            .attr("r", 5)  // 포인트 크기
                                      .attr("fill", "orange")  // 포인트 색상
                                      .attr("opacity", 0.5)  // 포인트 색상
                // .attr("stroke", "black")
                                      .attr("stroke-width", 1.5)
                                      .style("display", "none");  // 기본적으로 숨김 처리
            // 마우스 포인터 위치에 표시할 포인트(circle) 생성
            this.pointerCircle2 = this.chartGroup.append("circle")
            .attr("r", 5)  // 포인트 크기
                                       .attr("fill", "balck")  // 포인트 색상
                                       .attr("opacity", 0.5)  // 포인트 색상
                // .attr("stroke", "black")
                                       .attr("stroke-width", 1.5)
                                       .style("display", "none");  // 기본적으로 숨김 처리
            // 마우스 포인터 위치에 표시할 포인트(circle) 생성
            this.pointerCircle3 = this.chartGroup.append("circle")
            .attr("r", 5)  // 포인트 크기
                                       .attr("fill", "DodgerBlue")  // 포인트 색상
                                       .attr("opacity", 0.5)  // 포인트 색상
                // .attr("stroke", "black")
                                       .attr("stroke-width", 1.5)
                                       .style("display", "none");  // 기본적으로 숨김 처리

            this.pointerCircle4 = this.chartGroup.append("circle")
            .attr("r", 5)  // 포인트 크기
                                       .attr("fill", "green")  // 포인트 색상
                                       .attr("opacity", 0.5)  // 포인트 색상
                // .attr("stroke", "black")
                                       .attr("stroke-width", 1.5)
                                       .style("display", "none");  // 기본적으로 숨김 처리
            // 세로선 요소 추가
            this.pointerLine = this.chartGroup.append("line")
            .attr("stroke", "black")
                                    .attr("stroke-width", 0.5)
                                    .style("display", "none");  // 기본적으로 숨김 처리
            // Create the tooltip container.
            this.tooltip = this.svg.append("g");

            // 상단 레전드 그룹
            const legend = this.svg.append("g")
            .attr("class", "legend")
                                .attr("transform", `translate(${this.marginLeft}, ${this.marginTop})`);

            // 배경 박스
            const legendBg = legend.append("rect")
                                    .attr("x", -5)
                                    .attr("y", -15)
                                    .attr("rx", 15)   // 둥근 모서리
                                    .attr("ry", 15)
                                    .attr("width", 330)  // 전체 레전드 가로 길이
                                    .attr("height", 30)  // 높이
                                    .attr("fill", "#eee");

            // 레전드 아이템 정의
            const items = [
                { name: "누적강우", color: "lightgreen" },
                { name: "배출유량", color: "orange" },
                { name: "예측유량", color: "steelblue" },
                { name: "강우값", color: "blue" }
            ];

            // 아이템 배치
            items.forEach((d, i) => {
                const g = legend.append("g").attr("transform", `translate(${i * 80}, 0)`);

                g.append("circle")
                  .attr("cx", 20).attr("cy", 0)
                  .attr("r", 6)
                  .attr("fill", d.color)
                  .attr("stroke", d.color === "lightgreen" ? "green" : "none"); // 누적강우만 테두리

                g.append("text")
                  .attr("x", 32).attr("y", 4)
                  .text(d.name)
                  .style("font-size", "12px")
                  .style("fill", "#333");
            });
            // --------- 가운데 정렬 추가 ---------
            const legendBox = legend.node().getBBox();
            const centerX = (this.width - legendBox.width) / 2;
            legend.attr("transform", `translate(${centerX}, ${this.marginTop - 30})`);


            // Add the event listeners that show or hide the tooltip.
            this.bisect = d3.bisector(d => (new Date(d.date))).center;
            this.addZoom(); // 줌 기능 추가
        },
        pointerMoved(event) {
            // 줌 변환된 스케일이 있으면 사용, 없으면 기본 x 사용
            const xScale = this.currentX || this.x;
            // 👉 마우스 좌표 가져오기 (marginLeft 보정)
            const [mouseXRaw] = d3.pointer(event, this.svg.node());
            const mouseX = d3.pointer(event)[0];
            // 👉 마우스 위치에서 x값 추출
            const x0 = xScale.invert(mouseX);
            // 👉 가까운 데이터 포인트 찾기
            const i = this.bisect(this.zoomAiData, x0);
            const dataPoint = this.zoomAiData[i];
            const xCoord = xScale(new Date(dataPoint.date));
            const yCoord = this.y(dataPoint.flow1);
            const y2Coord = this.y(dataPoint.flow2);
            const y3Coord = this.y2(dataPoint.rain);
            const y4Coord = this.y3(dataPoint.rainAcc);

            // setPointerPosition 뮤테이션을 사용하여 x, y 좌표 전달
            this.$store.commit('setPointerPosition', event);

            // 👉 툴팁 표시
            this.tooltip.style("display", null)
            .attr("transform", `translate(${xCoord}, ${yCoord + 5})`);
            // .attr("transform", `translate(${xScale(new Date(this.zoomAiData[i].date))},${this.y(this.zoomAiData[i].flow1)+5})`);

            const path = this.tooltip.selectAll("path")
            .data([{}])
                              .join("path")
                              .attr("fill", "white")
                              .attr("stroke", "black")
                              .attr("opacity", 0.8);       // 투명도 0~1 사이로 조절

            const tooltipData = [
                { text: this.formatDate(new Date(dataPoint.date)), color: 'black' },       // 날짜
                { text: this.formatValue(dataPoint.flow1), color: '#ff6a00' },            // flow1
                { text: this.formatValue2(dataPoint.flow2), color: '#555' },        // flow2
                { text: this.formatValue3(dataPoint.rain), color: 'DodgerBlue' },                // rain
                { text: this.formatValue4(dataPoint.rainAcc), color: '#129d12' }          // 누적강우
            ];

            const text = this.tooltip.selectAll("text")
            .data([{}])
                              .join("text")
                              .call(text => text.selectAll("tspan")
                                                 .data(tooltipData)
                                                 .join("tspan")
                                                 .attr("x", 0)
                                                 .attr("y", (_, i) => `${i * 1.3}em`)
                                                 .attr("font-weight", (_, i) => i ? null : "bold")
                                                 .attr("fill", d => d.color)  // 각 줄 색상 적용
                                                 .text(d => d.text));

            this.size(text, path);

            // 👉 포인터 동그라미 위치
            this.pointerCircle
                 .style("display", null)
                 .attr("cx", xCoord)
                 .attr("cy", yCoord);
            // 👉 포인터 동그라미 위치
            this.pointerCircle2
                 .style("display", null)
                 .attr("cx", xCoord)
                 .attr("cy", y2Coord)

            this.pointerCircle3
                 .style("display", null)
                 .attr("cx", xCoord)
                 .attr("cy", y3Coord);

            this.pointerCircle4
                 .style("display", null)
                 .attr("cx", xCoord)
                 .attr("cy", y4Coord);

            this.pointerLine
                 .style("display", null)
                 .attr("x1", xCoord)
                 .attr("x2", xCoord)
                 .attr("y1", this.marginTop)
                 .attr("y2", this.height - this.marginBottom);
        },
        pointerLeft() {
            this.tooltip.style("display", "none");
            this.pointerLine.style("display", "none");
            this.pointerCircle.style("display", "none");
            this.$store.commit('setPointerLeft', true);
            setTimeout(() => {
                this.$store.commit('resetPointerLeft', false);
                console.log( this.$store.state.isPointerLeft)
            }, 100);  // 1초 후 상태 초기화

        },
        size(text, path) {
            const {x, y, width: w, height: h} = text.node().getBBox();
            text.attr("transform", `translate(${-w / 2},${15 - y})`);
            path.attr("d", `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
        },
        formatValue(value) {
            return `배출유량 : ${value.toFixed(2)} L/min`;
        },
        formatValue2(value) {
            return `예측유량 : ${value.toFixed(2)} L/min`;
        },
        formatValue3(value) {
            return `강우 : ${value.toFixed(2)} mm`;
        },
        formatValue4(value) {
            return `누적강우 : ${value.toFixed(2)} mm`;
        },
        formatDate(date) {
            // 날짜를 'MM/DD HH:MM' 포맷으로 변환하여 반환합니다.
            return d3.timeFormat("%m/%d %H:%M")(date);
        },
        idled() {
            this.idleTimeout = null;
        },
    },
};

component.template="\r\n    <div>\r\n        <div style=\"position: relative;\">\r\n            <button\r\n                v-if=\"isZoomed\"\r\n                @click=\"resetZoom\"\r\n                class=\"reset-button\"\r\n            >\r\n                zoom reset\r\n            </button>\r\n            <svg width=\"100%\" ref=\"zoomAiData\"></svg>\r\n        </div>\r\n    </div>\r\n";
export default component;
