<template>
    <div>
        <div>
            <button
                v-if="isZoomed"
                @click="resetZoom"
                style="position: absolute; top: 10px; right: 500px; z-index: 999;"
            >
                🔁 리셋
            </button>
            <svg width="100%" ref="lineChart"></svg>
        </div>
    </div>
</template>

<script>
import * as d3 from 'd3';

// const csvFilePath = 'assets/test.csv';

export default {
    name: 'lineChart',
    components: {},
    props: {
        lineData: Array,
    },
    data() {
        return {
            svg : '',
            width: 0, // 초기값은 0으로 설정
            height : 180,
            marginTop : 20,
            marginRight : 50,
            marginBottom : 40,
            marginLeft : 50,
            bisect: '',
            brush: null,
            idleTimeout : null,
            xAxis : null,
            yAxis : null,
            x:'',
            y:'',

            tooltip: null,
            pointerCircle: null,
            pointerLine: null,
            currentX: null,  // 줌 변환된 x 스케일 저장용
            zoomBehavior: null,
            isZoomed: false,
            line:null,
            chartGroup : null,
            tooltipGroup: null,
        };
    },
    mounted() {
        this.width = this.$refs.lineChart.clientWidth
        this.drawLineChart();
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
                d3.axisBottom(this.x)
                   .ticks(this.width / 80)
                   .tickSizeOuter(0)
            );

            // 라인 다시 그리기
            this.svg.selectAll(".line")
            .attr("d", d3.line()
                          .x(d => this.x(new Date(d.date))) // 원래 x스케일
                          .y(d => this.y(d.value1))
            );

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

            // x축 다시 그리기
            this.xAxis
                 .attr("transform", `translate(0,${this.height - this.marginBottom})`)
                 .call(
                d3.axisBottom(this.currentX)
                   .ticks(this.width / 80)
                   .tickSizeOuter(0)
            )

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
            //     .y(d => this.y(d.value1));

            this.svg.select('.line')
            .attr("d", this.line(this.lineData));
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
        drawLineChart() {
            // 데이터의 최대값을 계산
            const maxValue = d3.max(this.lineData, d => d.value1);
            const yMin = 0; // 최소값은 항상 0
            const yMax = maxValue <= 0 ? 1 : Math.ceil(maxValue * 1.5); // 최대값이 0 이하일 때 yMax는 1, 아니면 최대값 반올림 후 0.1 단위로 조정

            this.x = d3.scaleUtc(
                d3.extent(this.lineData, d => new Date(d.date)),
                [this.marginLeft, this.width - this.marginRight]
            );
            this.currentX = this.x.copy(); // ← 요거 중요! 반드시 추가해야 함, 행님!
            this.y = d3.scaleLinear([yMin, yMax], [this.height - this.marginBottom, this.marginTop]);
            this.line = d3.line()
                .x(d => this.currentX(new Date(d.date)))
                .y(d => this.y(d.value1))

            // refs 설정
            this.svg = d3.select(this.$refs.lineChart)
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

            // 1. 축 그룹을 g로 만들고 this.xAxis에 저장
            this.xAxis = this.svg.append("g")
                .attr("transform", `translate(0,${this.height - this.marginBottom})`)
                .call(d3.axisBottom(this.currentX)
                .ticks(this.width / 80).tickSizeOuter(0))

            // 2. 축 텍스트 두 줄 만들기 (별도 처리)
            this.xAxis.selectAll(".tick text")
                .call(function(tick) {
                tick.each(function(d) {
                    const date = new Date(d);
                    const dateText = d3.timeFormat("%Y/%m/%d")(date);
                    const timeText = d3.timeFormat("%H:%M")(date);
                    const text = d3.select(this);
                    text.text(timeText);
                        text.text('') // 기존 텍스트를 지웁니다.
                        text.append('tspan') // 첫 번째 줄 (날짜)
                        .attr('x', 0)

                        .attr('dy', '1em') // 첫 번째 줄을 위로 조금 이동
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

            // 라인 그리기
            this.chartGroup.append("path")
                .attr("fill", "none")
                .attr("stroke", "DodgerBlue")
                .attr("stroke-width", 1.5)
                .attr("class", "line") // 여기에서 .line 클래스 추가
                .attr("d", this.line(this.lineData));

            // 마우스 포인터 위치에 표시할 포인트(circle) 생성
            this.pointerCircle = this.chartGroup.append("circle")
                .attr("r", 5)  // 포인트 크기
                .attr("fill", "DodgerBlue")  // 포인트 색상
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
            const i = this.bisect(this.lineData, x0);
            const dataPoint = this.lineData[i];
            const xCoord = xScale(new Date(dataPoint.date));
            const yCoord = this.y(dataPoint.value1);

            // setPointerPosition 뮤테이션을 사용하여 x, y 좌표 전달
            this.$store.commit('setPointerPosition', event);

            // 👉 툴팁 표시
            this.tooltip.style("display", null)
                .attr("transform", `translate(${xCoord}, ${yCoord + 5})`);
                // .attr("transform", `translate(${xScale(new Date(this.lineData[i].date))},${this.y(this.lineData[i].value1)+5})`);

            const path = this.tooltip.selectAll("path")
                .data([{}])
                .join("path")
                .attr("fill", "white")
                .attr("stroke", "black");

            const text = this.tooltip.selectAll("text")
                .data([{}])
                .join("text")
                .call(text => text.selectAll("tspan")
                .data([
                    this.formatDate(new Date(dataPoint.date)),
                    this.formatValue(dataPoint.value1)
                ])
                .join("tspan")
                .attr("x", 0)
                .attr("y", (_, i) => `${i * 1.1}em`)
                .attr("font-weight", (_, i) => i ? null : "bold")
                .text(d => d));

            this.size(text, path);

            // 👉 포인터 동그라미 위치
            this.pointerCircle
                .style("display", null)
                .attr("cx", xCoord)
                .attr("cy", yCoord);

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
            return `${value.toFixed(2)} L/min`;
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
</script>
