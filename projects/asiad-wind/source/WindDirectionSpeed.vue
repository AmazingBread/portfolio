<template>
    <div class="windDirectionSpeedTooltip">
        <!-- Vue 인스턴스의 템플릿에 D3 그래프를 렌더링할 요소 추가 -->
        <svg width="100%" ref="windDirectionSpeed"></svg>
    </div>
</template>

<script>
import * as d3 from 'd3';
// const csvFilePath = 'assets/test.csv';

export default {
    name: 'windDirectionSpeed',
    components: {},
    props: {
        windDirectionSpeed: Array,
    },
    data() {
        return {
            items: [],
        };
    },
    mounted() {
        // CSV 파일 로드 후 그래프 그리기
        // d3.csv(csvFilePath).then((data) => {
        this.drawWindVectorPlot();
        // });
    },
    created() {},
    beforeDestroy() {},
    methods: {
        drawWindVectorPlot() {
            const svg = d3.select(this.$refs.windDirectionSpeed);
            const width = this.$refs.windDirectionSpeed.clientWidth;
            const height = 130;
            const margin = { top: 30, right: 70, bottom: 10, left: 100 };
            // x 좌표 시간 설정
            const x = d3.scaleUtc(d3.extent(this.windDirectionSpeed, d => new Date(d.date)), [margin.left, width - margin.right]);
            // const x = d3.scaleTime()
            //     .domain(d3.extent(this.windDirectionSpeed, d => new Date(d.date)))
            //     .range([margin.left, width - margin.right])
            //     .nice();
            // 20240204 배포됨

            const xScale = d3.scaleTime()
                .domain(d3.extent(this.windDirectionSpeed, (d) => new Date(d.date)))
                .range([margin.left, width - margin.right])
                // .nice();

            const tooltip = d3.select('.windDirectionSpeedTooltip').append('div')
                .attr('class', 'tooltip')
                .style('opacity', 0)
                .style('position', 'absolute')
                .style('padding', '5px')
                .style('background', 'white')
                .style('border', '1px solid black')
                .style('font-size', '10px')
                .style('pointer-events', 'none');

            // 마우스 따라다닐 세로선을 그리기 위한 요소를 추가합니다.
            const verticalLine = svg.append('line')
                .attr('stroke', 'black')
                .attr('stroke-width',0.5 )
                // .attr('stroke-dasharray', '4 4')
                .style('pointer-events', 'none')
                .style('opacity', 0); // 초기에는 보이지 않도록 설정합니다.

            svg.append('g')
                .attr('transform', `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
                .selectAll('.tick text')
                .call(function(tick) {
                    tick.each(function(d) {
                        const date = new Date(d);
                        const dateText = d3.timeFormat("%Y/%m/%d")(date);
                        const timeText = d3.timeFormat("%H:%M")(date);
                        const text = d3.select(this);
                        text.text('') // 기존 텍스트를 지웁니다.
                             .append('tspan') // 첫 번째 줄 (월/일)
                             .attr('x', 0)
                             .attr('dy', '0.8em') // 첫 번째 줄을 약간 위로 이동
                             .text(dateText);
                        text.append('tspan') // 두 번째 줄 (시:분)
                             .attr('x', 0)
                             .attr('dy', '1.2em') // 두 번째 줄을 아래로 이동
                             .text(timeText);
                    });
            });

            const colorScale = d3.scaleSequential()
                .domain([0, this.windDirectionSpeed.length - 1])
                // .interpolator(d3.interpolateViridis);
                .interpolator(d3.interpolateHcl("DarkTurquoise", "DodgerBlue"));
            // 데이터를 위한 최대 풍속 값 찾기
            const maxSpeedValue = d3.max(this.windDirectionSpeed, d => d.speed);
            // 차트 높이의 절반을 최대 라인 길이로 사용
            const maxLineLength = height / 1.5 - margin.top - margin.bottom;
            // 라인 길이를 위한 스케일 함수 설정
            const lineScale = d3.scaleLinear()
                                 .domain([0, maxSpeedValue]) // 데이터의 최소값과 최대값
                                 .range([0, maxLineLength]); // 라인이 그려질 물리적 범위


            this.windDirectionSpeed.forEach((d, i) => {

                const angle = (d.direction - 90) * (Math.PI / 180);
                const lineLength = lineScale(d.speed); // Adjust for visual preference
                const x1 = xScale(new Date(d.date));
                const yBase = height / 2;
                const x2 = x1 + Math.cos(angle) * lineLength;
                const y2 = yBase + Math.sin(angle) * lineLength;

                // 캔버스 요소의 좌표를 얻습니다.
                const canvas = svg.node();
                const canvasRect = canvas.getBoundingClientRect();
                // 풍속이 0인 경우 점을 그립니다.
                if (d.speed === 0) {
                    svg.append('circle')
                        .attr('cx', xScale(new Date(d.date)))
                        .attr('cy', height / 2) // y축의 중앙 위치
                        .attr('r', 0.5) // 원의 반지름 크기
                        .attr('fill', colorScale(i)); // 원의 색깔
                } else {
                    svg.append('line')
                        .attr('x1', x1)
                        .attr('y1', yBase)
                        .attr('x2', x2)
                        .attr('y2', y2)
                        .attr('stroke', colorScale(i))
                        .attr('stroke-width', 1)
                }
                // 캔버스에 마우스 이벤트 리스너를 추가합니다.
                let self = this

                svg.on('mousemove', function(event) {
                    // 마우스 위치를 캔버스 좌표 공간에서의 위치로 변환합니다.
                    const xCanvas = event.clientX - canvasRect.left;
                    const yCanvas = event.clientY - canvasRect.top;

                    // 마우스 위치가 그래프 바 영역 내에 있는지 확인합니다.
                    if (xCanvas >= margin.left && xCanvas <= width - margin.right &&
                        yCanvas >= margin.top && yCanvas <= height - margin.bottom) {
                        // 마우스 위치에서 x 축의 날짜 값을 찾습니다.
                        const x0 = xScale.invert(xCanvas);

                        // 데이터 배열에서 마우스 위치에 가장 가까운 데이터 포인트를 찾습니다.
                        const bisectDate = d3.bisector(d => new Date(d.date)).left;
                        const idx = bisectDate(self.windDirectionSpeed, x0, 1);
                        const d0 = self.windDirectionSpeed[idx - 1];
                        const d1 = self.windDirectionSpeed[idx];
                        const d = x0 - d0.date > d1.date - x0 ? d1 : d0;


                        // 툴팁을 업데이트하고 위치를 조정합니다.
                        tooltip.style('opacity', 1)
                            .html(`${formatDate( new Date(d.date))} <br>Speed: ${d.speed.toFixed(2)} m/s<br>Direction: ${d.direction}°`)
                            // .html(`${formattedDate} <br>Speed: ${d.speed} m/s<br>Direction: ${d.direction}°`)
                            .style('left', (event.pageX + 5) + 'px')
                            .style('top', (event.pageY - 28) + 'px');

                        // 세로선의 위치를 업데이트합니다.
                        verticalLine.attr('x1', xCanvas).attr('x2', xCanvas)
                                    .attr('y1', 15)
                                    .attr('y2', height -15)
                                    .style('opacity', 1);
                    } else {
                        // 마우스 위치가 그래프 바 영역 밖이면 툴팁을 숨깁니다.
                        tooltip.style('opacity', 0);
                        verticalLine.style('opacity', 0);
                    }
                }).on('mouseout', function() {
                    // 마우스가 캔버스 밖으로 이동하면 툴팁을 숨깁니다.
                    tooltip.style('opacity', 0);
                    verticalLine.style('opacity', 0);
                });
            });
            // 원형 눈금과 레이블을 추가하는 부분
            const levels = 2; // 눈금의 수를 정의합니다.
            const drawingWidth = width - margin.left - margin.right;
            const drawingHeight = height - margin.top - margin.bottom;
            const radius = Math.min(drawingWidth, drawingHeight) / 2;
            const maxValue = Math.max(10, d3.max(this.windDirectionSpeed, d => d.speed)); // 최대 속도 값
            svg.append('g')
                .attr('transform', `translate(${drawingWidth / 2 - radius}, ${drawingHeight / 2 - radius})`);

            for (let level = 1; level <= levels; level++) { // Start at 1 to avoid a circle with radius 0
                const factor = radius * (level / levels); // Calculate the radius for the current level
                // svg.append('circle')
                //     .attr('class', 'g-circle')
                //     .attr('r', factor)
                //     .style('fill', 'none')
                //     .style('stroke', 'grey')
                //     .style('stroke-dasharray', '1,2')
                //     .attr('cx', 100)
                //     .attr('cy', 65)

                svg.append('text')
                    .attr('class', 'grid-label')
                    .attr('x', 92)
                    .attr('y', -factor + 70)
                    .text((maxValue * (level / levels)).toFixed(2));
            }
            // 원형 눈금 위에 반원을 추가하는 부분
            const halfCircleArc = d3.arc()
                .innerRadius(0) // 내부 반지름은 0으로 시작
                .outerRadius(radius) // 외부 반지름은 원형 눈금의 반지름과 동일
                .startAngle(Math.PI) // 시작 각도는 -90도 (위쪽)
                .endAngle(0); // 끝 각도는 90도 (아래쪽)
            const halfCircleArc2 = d3.arc()
                .innerRadius(0) // 내부 반지름은 0으로 시작
                .outerRadius(radius/2) // 외부 반지름은 원형 눈금의 반지름과 동일
                .startAngle(Math.PI) // 시작 각도는 -90도 (위쪽)
                .endAngle(0); // 끝 각도는 90도 (아래쪽)

            // 반원을 그리기 위한 경로를 추가합니다.
            svg.append('path')
                .attr('d', halfCircleArc)
                .attr('transform', `translate(${55 + radius}, ${height / 2}) rotate(180)`) // 반원을 180도 회전
                .attr('fill', 'none')
                .attr('stroke', 'grey')
                .attr('stroke-dasharray', '2,2')
            svg.append('path')
                .attr('d', halfCircleArc2)
                .attr('transform', `translate(${55 + radius}, ${height / 2}) rotate(180)`) // 반원을 180도 회전
                .attr('fill', 'none')
                .attr('stroke', 'grey')
                .attr('stroke-dasharray', '2,2')
                .attr('opacity', 0.5)

            const directions = ['S', 'W', 'N', 'E']; // Direction labels
            const angleOffset = Math.PI / 2; // Offset for starting angle (to start from North)

            // 방위 표시 그리기
            directions.forEach((d, i) => {
                const angleRadians = (i * Math.PI / 2) + angleOffset;
                const labelFactor = 1.25; // Adjust as needed to position labels outside the grid circles
                const labelX = (radius * labelFactor) * Math.cos(angleRadians);
                const labelY = (radius * labelFactor) * Math.sin(angleRadians);
                if(d === 'N' || d === 'W' || d === 'S'){
                    svg.append('line')
                        .attr('x1', 100)
                        .attr('y1', 65)
                        .attr('x2', radius * Math.cos(angleRadians)+100)
                        .attr('y2', radius * Math.sin(angleRadians)+65)
                        .style('stroke', 'grey')
                        .style('stroke-width', '.5px')
                        .style('stroke-dasharray', '1,2');
                }
                if(d === 'N' || d === 'W'){
                    svg.append('text')
                        .attr('x', labelX+100) // 반지름보다 10px 더 바깥에 표시
                        .attr('y', labelY+70)
                        .attr('text-anchor', 'middle')
                        .text(d);
                }
            });
            function formatDate(date) {
                // '월/일 시:분' 형식으로 날짜를 포맷하여 반환합니다.
                return d3.timeFormat("%m/%d %H:%M")(date);
            }
            // 최대 풍속 값과 해당 데이터 포인트 찾기
            const maxSpeedDataPoint = this.windDirectionSpeed.reduce((a, b) => a.speed > b.speed ? a : b);

            // xScale과 yScale을 사용하여 SVG 내부의 위치 계산
            const maxSpeedX = xScale(new Date(maxSpeedDataPoint.date));
            // const maxSpeedY = height / 2; // yBase는 차트의 중앙 높이

            // 최대 풍속 값의 각도 계산
            const maxAngle = (maxSpeedDataPoint.direction - 90) * (Math.PI / 180);

            // // 최대 풍속 값을 가리키는 라인의 끝점 계산
            // const maxLineEndX = (width / 2) + Math.cos(maxAngle) * maxLineLength;
            // const maxLineEndY = (height / 2) + Math.sin(maxAngle) * maxLineLength;

            const dateText = formatDate(new Date(maxSpeedDataPoint.date));

            // 텍스트 테두리 박스를 추가합니다.
            svg.append('rect')
                .attr('x', maxSpeedX - 60)
                .attr('y', 0)
                .attr('width', 120)
                .attr('height', 30)
                .attr('fill', 'white')
                .attr('stroke', 'black')
                .attr('stroke-width', 1);

            // 날짜를 표시하는 텍스트
            svg.append('text')
                .attr('x', maxSpeedX)
                .attr('y', 13) // 박스 내부에 위치 조정
                // .attr('y', 93) // 박스 내부에 위치 조정
                .attr('text-anchor', 'middle')
                .text(dateText)
                .attr('fill', 'black')
                .style('font-size', '10px')

            // 최대 풍속의 풍향 텍스트
            svg.append('text')
                .attr('x', maxSpeedX)
                .attr('y', 25) // 최대값이 선 위에 오도록 약간 위로 조정
                // .attr('y', 105) // 최대값이 선 위에 오도록 약간 위로 조정
                .attr('text-anchor', 'middle')
                .attr('alignment-baseline', 'baseline')
                .text(`최대풍속의 풍향: ${maxSpeedDataPoint.direction} °`)
                .style('font-size', '10px')


            // 최대 풍속 데이터 포인트 찾기

            // 최대 풍속 값에 대한 라인 그리기
            const maxLineX1 = xScale(new Date(maxSpeedDataPoint.date));
            const maxLineY1 = height / 2;
            const maxLineX2 = maxLineX1 + Math.cos(maxAngle) * maxLineLength;
            const maxLineY2 = maxLineY1 + Math.sin(maxAngle) * maxLineLength;


            svg.append('line')
                .attr('x1', maxLineX1)
                .attr('y1', maxLineY1)
                .attr('x2', maxLineX2)
                .attr('y2', maxLineY2)
                .attr('stroke', 'red')
                .attr('stroke-width', 2);
        },
    },
};
</script>

<style lang="scss">
.tooltip {
    position: absolute;
    padding: 10px;
    background: white;
    border: 1px solid black;
    pointer-events: none;
    left: 868px;
    top: 579px;
}
.grid-label{
    font-size:10px;
}
</style>