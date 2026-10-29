<template>
    <div>
        <div>
            <!-- Vue 인스턴스의 템플릿에 D3 그래프를 렌더링할 요소 추가 -->
            <svg width="100%" ref="windDirection"></svg>
        </div>
    </div>
</template>

<script>
import * as d3 from 'd3';
// const csvFilePath = 'assets/test.csv';

export default {
    name: 'windDirection',
    components: {},
    props: {
        windDirection: Array,
    },
    data() {
        return {
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

            // SVG 설정
            const width = 300
            const height = 150

            const margin = { top: 15, right: 10, bottom: 15, left: 10 };
            // Calculate the actual drawing area for the chart
            const drawingWidth = width - margin.left - margin.right;
            const drawingHeight = height - margin.top - margin.bottom;
            // Calculate the radius based on the actual drawing area
            const radius = Math.min(drawingWidth, drawingHeight) / 2;

            const svg = d3.select(this.$refs.windDirection)
                .attr('width', width)
                .attr('height', height)
                .append('g')
                .attr('transform', `translate(${margin.left + drawingWidth / 2}, ${margin.top + drawingHeight / 2})`);

            // 풍속을 기반으로 하는 스케일 설정
            const speedScale = d3.scaleLinear()
                .domain([0, d3.max(this.windDirection, d => d.speed)])
                .range([0, radius]);

            const angle = d => (d.direction / 360) * (Math.PI * 2);

            const maxValue = Math.max(10, d3.max(this.windDirection, d => d.speed)); // 최대 속도 값

            // 풍향 포인트를 그립니다.
            svg.selectAll('.wind-point')
                .data(this.windDirection)
                .enter()
                .append('circle')
                .attr('class', 'wind-point')
                .attr('cx', d => speedScale(d.speed) * Math.cos(angle(d) - Math.PI / 2))
                .attr('cy', d => speedScale(d.speed) * Math.sin(angle(d) - Math.PI / 2))
                .attr('r', 1.5)
                .attr('fill', 'DodgerBlue')
                .attr('fill-opacity', 0.35) // 50% 투명도 설정


            // 원형 눈금과 레이블을 추가하는 부분
            const levels = 2; // 눈금의 수를 정의합니다.

            for (let level = 1; level <= levels; level++) { // Start at 1 to avoid a circle with radius 0
                const factor = radius * (level / levels); // Calculate the radius for the current level

                svg.append('circle')
                    .attr('class', 'grid-circle')
                    .attr('r', factor)
                    .style('fill', 'none')
                    .style('stroke', 'grey')
                    .style('stroke-dasharray', '1,2');

                svg.append('text')
                    .attr('class', 'grid-label')
                    .attr('x', 10)
                    .attr('y', -factor + 5)
                    .text((maxValue * (level / levels)).toFixed(2));
            }

            const directions = ['S', 'W', 'N', 'E']; // Direction labels
            const angleOffset = Math.PI / 2; // Offset for starting angle (to start from North)


            directions.forEach((direction, i) => {
                const angleRadians = (i * Math.PI / 2) + angleOffset;

                // Draw the axis lines
                svg.append('line')
                    .attr('x1', 0)
                    .attr('y1', 0)
                    .attr('x2', radius * Math.cos(angleRadians))
                    .attr('y2', radius * Math.sin(angleRadians))
                    .style('stroke', 'grey')
                    .style('stroke-width', '.5px')
                    .style('stroke-dasharray', '1,2');

                // Adjust label positioning to match the image provided
                const labelFactor = 1.15; // Adjust as needed to position labels outside the grid circles
                const labelX = (radius * labelFactor) * Math.cos(angleRadians);
                const labelY = (radius * labelFactor) * Math.sin(angleRadians);

                // Add the direction labels
                svg.append('text')
                    .attr('x', labelX)
                    .attr('y', labelY)
                    .attr('dy', '0.35em')
                    .style('text-anchor', 'middle')
                    .text(direction);
            });
            // 최대 풍속 값과 해당 데이터 포인트 찾기
            const maxSpeedDataPoint = this.windDirection.reduce((a, b) => a.speed > b.speed ? a : b);

            // 최대 풍속 값을 찾습니다.
            // const maxWsValue = d3.max(this.windDirection, d => d.speed);
            // 최대 풍속을 가진 데이터 포인트를 찾습니다.
            const maxWsItem = this.windDirection.reduce((a, b) => a.speed > b.speed ? a : b);

            // 최대 풍속 위치에 마커를 추가합니다.
            if (maxWsItem) {
                const maxWindText = `최대풍속의 풍향: ${maxSpeedDataPoint.direction.toFixed(2)} °`;
                const dateText = formatDate(new Date(maxWsItem.date));

                // 최대 풍속 데이터 포인트를 위한 극좌표계 위치 계산
                const maxPointX = speedScale(maxWsItem.speed) * Math.cos(angle(maxWsItem) - Math.PI / 2);
                const maxPointY = speedScale(maxWsItem.speed) * Math.sin(angle(maxWsItem) - Math.PI / 2);

                svg.append('circle')
                    .attr('cx', maxPointX)
                    .attr('cy', maxPointY)
                    .attr('r', 2) // 마커의 반지름
                    .attr('fill', 'red'); // 마커의 색상

                // 텍스트 테두리 박스를 추가합니다.
                // svg.append('rect')
                //     .attr('x', maxPointX)
                //     .attr('y', y(maxWsItem.speed) - 35)
                //     .attr('width', 100)
                //     .attr('height', 30)
                //     .attr('fill', 'white')
                //     .attr('stroke', 'black')
                //     .attr('stroke-width', 1);

                // 날짜를 표시하는 텍스트
                // svg.append('text')
                //     // .attr('x', maxPointX)
                //     // .attr('y', maxPointY-20) // 박스 내부에 위치 조정
                //     .attr('x', -100)
                //     .attr('y', -62) // 박스 내부에 위치 조정
                //     .attr('text-anchor', 'middle')
                //     .text(dateText)
                //     .attr('fill', 'black')
                //     .style('font-size', '10px')

                // 최대 풍속을 표시하는 텍스트
                // svg.append('text')
                //     // .attr('x', maxPointX)
                //     // .attr('y', maxPointY-10) // 박스 내부에 위치 조정
                //     .attr('x', -100)
                //     .attr('y', -50) // 박스 내부에 위치 조정
                //     .attr('text-anchor', 'middle')
                //     .text(maxWindText)
                //     .attr('fill', 'black')
                //     .style('font-size', '10px')

            }
            function formatDate(date) {
                // 날짜를 'MM/DD HH:MM' 포맷으로 변환하여 반환합니다.
                return d3.timeFormat("%m/%d %H:%M")(date);
            }
        },
    },
};
</script>
<style lang="scss" scoped>
.axis {
    stroke: #000;
    stroke-width: 2px;
}

.point {
    fill: #fff;
    stroke: #000;
    stroke-width: 1.5px;
}
.axis-label,
.grid-label {
    font-size: 10px; /* Adjust the font size as needed */
}
</style>
