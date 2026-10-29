const d3 = {
  ...window.d3,
  timeFormat: (format) => (date) =>
    window.d3.utcFormat(format)(new Date(+new Date(date) + 9 * 3600000)),
};

// const csvFilePath = 'assets/test.csv';

const component = {
  name: 'windSpeed',
  components: {},
  props: {
    windSpeed: Array,
  },
  watch: {},
  data() {
    return {};
  },
  mounted() {
    this.drawWindVectorPlot();
  },
  created() {},
  beforeDestroy() {},
  methods: {
    drawWindVectorPlot() {
      // 차트 사이즈 설정
      const width = this.$refs.windSpeed.clientWidth;
      const height = 140;
      const marginTop = 30;
      const marginRight = 50;
      const marginBottom = 30;
      const marginLeft = 50;

      // x 좌표 시간 설정
      const x = d3.scaleUtc(
        d3.extent(this.windSpeed, (d) => new Date(d.date)),
        [marginLeft, width - marginRight]
      );

      // y 좌표 풍속 설정
      const y = d3.scaleLinear(
        [0, d3.max(this.windSpeed, (d) => d.speed)],
        [height - marginBottom, marginTop]
      );

      // 라인 설정
      const line = d3
        .line()
        .x((d) => x(new Date(d.date)))
        .y((d) => y(d.speed));

      // refs 설정
      const svg = d3.select(this.$refs.windSpeed);

      svg
        .attr('viewBox', [0, 0, width, height])
        .attr('width', width)
        .attr('height', height)
        .attr(
          'style',
          'max-width: 100%; height: auto; height: intrinsic; font: 10px sans-serif;'
        )
        .style('overflow', 'visible')
        .on('pointerenter pointermove', pointermoved)
        .on('pointerleave', pointerleft)
        .on('touchstart', (event) => event.preventDefault());

      // x축을 그립니다.
      svg
        .append('g')
        .attr('transform', `translate(0,${height - marginBottom})`)
        .call(
          d3
            .axisBottom(x)
            .ticks(width / 80)
            .tickSizeOuter(0)
        )
        .selectAll('.tick text')
        .call(function (tick) {
          tick.each(function (d) {
            const date = new Date(d);
            const dateText = d3.timeFormat('%Y/%m/%d')(date);
            const timeText = d3.timeFormat('%H:%M')(date);
            const text = d3.select(this);
            text
              .text('') // 기존 텍스트를 지웁니다.
              .append('tspan') // 첫 번째 줄 (날짜)
              .attr('x', 0)
              .attr('dy', '1em') // 첫 번째 줄을 위로 조금 이동
              .text(dateText);
            text
              .append('tspan') // 두 번째 줄 (시간)
              .attr('x', 0)
              .attr('dy', '1.0em') // 두 번째 줄을 아래로 조금 이동
              .text(timeText);
          });
        });

      // Add the y-axis, remove the domain line, add grid lines and a label.
      svg
        .append('g')
        .attr('transform', `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y).ticks(height / 40))
        .call((g) => g.select('.domain').remove())
        .call((g) =>
          g
            .selectAll('.tick line')
            .clone()
            .attr('x2', width - marginLeft - marginRight)
            .attr('stroke-opacity', 0.1)
        );

      // 라인 그리기
      svg
        .append('path')
        .attr('fill', 'none')
        .attr('stroke', 'DodgerBlue')
        .attr('stroke-width', 1.5)
        .attr('d', line(this.windSpeed));

      // Create the tooltip container.
      const tooltip = svg.append('g');

      function formatValue(value) {
        return `${value.toFixed(2)} m/s`;
      }

      function formatDate(date) {
        // 날짜를 'MM/DD HH:MM' 포맷으로 변환하여 반환합니다.
        return d3.timeFormat('%m/%d %H:%M')(date);
      }
      // Add the event listeners that show or hide the tooltip.
      const bisect = d3.bisector((d) => new Date(d.date)).center;

      let self = this;
      function pointermoved(event) {
        const i = bisect(self.windSpeed, x.invert(d3.pointer(event)[0]));
        tooltip.style('display', null);
        tooltip.attr(
          'transform',
          `translate(${x(new Date(self.windSpeed[i].date))},${y(self.windSpeed[i].speed)})`
        );

        const path = tooltip
          .selectAll('path')
          .data([,])
          .join('path')
          .attr('fill', 'white')
          .attr('stroke', 'black');

        const text = tooltip
          .selectAll('text')
          .data([,])
          .join('text')
          .call((text) =>
            text
              .selectAll('tspan')
              // 수정된 formatDate 함수를 사용하여 날짜와 풍속 데이터를 배열로 설정합니다.
              .data([
                formatDate(new Date(self.windSpeed[i].date)),
                formatValue(self.windSpeed[i].speed),
              ])
              .join('tspan')
              .attr('x', 0)
              .attr('y', (_, i) => `${i * 1.1}em`)
              .attr('font-weight', (_, i) => (i ? null : 'bold'))
              .text((d) => d)
          );

        size(text, path);
      }
      function pointerleft() {
        tooltip.style('display', 'none');
      }
      function size(text, path) {
        const { x, y, width: w, height: h } = text.node().getBBox();
        text.attr('transform', `translate(${-w / 2},${15 - y})`);
        path.attr('d', `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
      }

      // 최대 풍속 값을 찾습니다.
      const maxWsValue = d3.max(this.windSpeed, (d) => d.speed);
      // 최대 풍속을 가진 데이터 포인트를 찾습니다.
      const maxWsItem = this.windSpeed.reduce((a, b) => (a.speed > b.speed ? a : b));
      // this.windDirectionSpeed.reduce((a, b) => a.speed > b.speed ? a : b);
      // 최대 풍속 위치에 마커를 추가합니다.
      if (maxWsItem) {
        const maxWindText = `최대풍속: ${maxWsValue.toFixed(2)} m/s`;
        const dateText = formatDate(new Date(maxWsItem.date));

        svg
          .append('circle')
          .attr('cx', x(new Date(maxWsItem.date)))
          .attr('cy', y(maxWsItem.speed))
          .attr('r', 2) // 마커의 반지름
          .attr('fill', 'red'); // 마커의 색상
        // 텍스트 테두리 박스를 추가합니다.
        svg
          .append('rect')
          .attr('x', x(new Date(maxWsItem.date)) - 50)
          .attr('y', y(maxWsItem.speed) - 35)
          .attr('width', 100)
          .attr('height', 30)
          .attr('fill', 'white')
          .attr('stroke', 'black')
          .attr('stroke-width', 1);

        // 날짜를 표시하는 텍스트
        svg
          .append('text')
          .attr('x', x(new Date(maxWsItem.date)))
          .attr('y', y(maxWsItem.speed) - 23) // 박스 내부에 위치 조정
          .attr('text-anchor', 'middle')
          .text(dateText)
          .attr('fill', 'black');

        // 최대 풍속을 표시하는 텍스트
        svg
          .append('text')
          .attr('x', x(new Date(maxWsItem.date)))
          .attr('y', y(maxWsItem.speed) - 10) // 박스 내부에 위치 조정
          .attr('text-anchor', 'middle')
          .text(maxWindText)
          .attr('fill', 'black');
      }
    },
  },
};

component.template =
  '\n<div>\n    <div>\n        <!-- Vue 인스턴스의 템플릿에 D3 그래프를 렌더링할 요소 추가 -->\n        <svg width="100%" ref="windSpeed"></svg>\n    </div>\n</div>\n';
export default component;
