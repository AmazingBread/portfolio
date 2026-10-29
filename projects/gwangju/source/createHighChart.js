let chart01;
let chart02;
let wd, ht;
let container;
let container2;
let color, width = 3, value;


function returnUTCTime(oriTime) {
    let utcTime = moment.utc (oriTime, "YYYY-MM-DD HH:mm").valueOf ();
    return utcTime;
}

function returnMilTime(oriTime) {
    millis = oriTime.toMillis (true);
    return utcTime;
}

function createBigDataChart(container, title, seriesHis, ym, ht, height, interval) {
    ht = Number (ht);
    let tempYaxis;
    let tempSeries;

    tempYaxis = [{
        max          : ym,
        min          : 0,
        tickInterval : interval,
        opposite     : false,
        reversed     : false,
        labels       : {
            style: {
                color: '#C3C3C3'
            }
        },
        visible      : false,
        gridLineColor: '#7B7B7B',
        offset       : 10,
        formatter    : function () {
            return this.y + " 건";
        }
    }];

    tempSeries = [{
        name        : '집계',
        type        : 'bar',
        showInLegend: false,
        data        : seriesHis,
        yAxis       : 0,
        borderWidth : 0,
        color       : {
            linearGradient: {x1: 0, x2: 0, y1: 0, y2: 1},
            stops         : [
                [0, '#fff'],
                [1, '#000']
            ]
        }
    }];

    let timeInterval = interval;
    Highcharts.setOptions ({
        lang: {
            thousandsSep: ','
        }
    })
    chart01 = Highcharts.chart (container, {
        chart      : {
            height         : height,
            marginLeft     : 70,
            marginRight    : 40,
            marginBottom   : 30,
            backgroundColor: 'transparent',
            zoomType       : "x",
            title          : title,
            type           : 'bar',
            options3d      : {
                enabled     : true,
                alpha       : 0,
                beta        : 0,
                depth       : 10,
                viewDistance: 20
            }
        },
        title      : {
            text : title,
            align: 'left',
            style: {
                'color': '#fff'
            },
            // text: null // as an alternative
        },
        legend     : {
            align        : 'center',
            verticalAlign: 'top',
            x            : 0,
            y            : 0,
            itemStyle    : {
                color: '#fff'
            },
        },
        tooltip    : {
            shared     : true,
            xDateFormat: '%Y-%m-%d %H:%M:%S',
        },
        xAxis      : {
            type  : 'category',
            labels: {
                useHTML  : true,
                animate  : true,
                formatter: ctx => {
                    return `${ctx.value}`;
                },
                style    : {
                    textAlign: 'center',
                    color    : '#fff',
                }
            }
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled  : true,
                    align    : 'right',
                    x        : 80,
                    style    : {fontSize: 15},
                    formatter: function () {
                        return Highcharts.numberFormat (this.y, 0) + " 건";
                    }
                }
            }
        },
        yAxis      : tempYaxis,
        series     : tempSeries,
        credits    : {
            enabled: false
        },
        exporting  : {
            showTable: false,
            buttons  : {
                contextButton: {
                    enabled: false
                }
            }
        },
    });

}

function createChart(container, seriesHis, field, ym, ht, height, interval, plotLines, plot01, tempObj) {
    ht = Number (ht);
    let tempYaxis;
    let tempSeries
    if (field === "flvl" || field === "0001" || field === "detailFlvl") {
        tempYaxis = [{
            title       : {
                text    : '침수위(cm)',
                rotation: 270,
                offset  : 15,
                margin  : 0,
                y       : ht,
                x       : -30,
                style   : {
                    color: '#C3C3C3'
                }
            },
            max         : ym,
            min         : 0,
            tickInterval: 1,
            /*opposite: false,
             reversed: false,*/
            plotLines    : plotLines,
            labels       : {
                style: {
                    color: '#C3C3C3'
                }
            },
            gridLineColor: '#7B7B7B',
            offset       : 10,
            height       : '30%'
        }, {
            title    : {
                text    : '빗물받이(%)',
                rotation: 270,
                offset  : 15,
                margin  : 0,
                y       : ht,
                x       : -30,
                style   : {
                    color: '#C3C3C3'
                }
            },
            max      : 100,
            min      : 0,
            plotLines: plot01,
            /*opposite: true,
             reversed: false,*/
            labels       : {
                style: {
                    color: '#C3C3C3'
                }
            },
            gridLineColor: '#7B7B7B',
            offset       : 10,
            top          : '40%',
            height       : '40%'
        }];
        tempSeries = [
            {
                name       : '침수위(cm)',
                type       : 'spline',
                color      : '#3cdddc', // 강우 값 실측 값 chart color 변경 시
                data       : seriesHis[0],
                yAxis      : 0,
                tooltip    : {
                    valueSuffix: ' cm'
                },
                borderWidth: 10,
            }, {
                name       : '빗물받이(%)',
                type       : 'areaspline',
                color      : '#454FFF', // 강우 값 실측 값 chart color 변경 시
                data       : seriesHis[1],
                opacity    : 0.6,
                yAxis      : 1,
                tooltip    : {
                    valueSuffix: ' %'
                },
                borderWidth: 0,
            }];

    } else if (field == "wlvl" || field == "river") {
        tempYaxis = [{
            title        : {
                text    : tempObj && tempObj.code === '23100003' ? '하천수위(m)' : '수위(m)',
                rotation: 270,
                offset  : 0,
                margin  : 0,
                y       : ht,
                x       : -30,
                style   : {
                    color: '#C3C3C3'
                }
            },
            max          : ym,
            min          : 0,
            tickInterval : 1,
            opposite     : false,
            reversed     : false,
            plotLines    : plotLines,
            labels       : {
                style: {
                    color: '#C3C3C3'
                }
            },
            gridLineColor: '#7B7B7B',
            offset       : 10
        }];
        if (seriesHis.length > 1) {
            tempSeries = [{
                name       : '수위ch01(m)',
                type       : 'spline',
                color      : '#3cdddc', // 강우 값 실측 값 chart color 변경 시
                data       : seriesHis[0],
                yAxis      : 0,
                tooltip    : {
                    valueSuffix: ' m'
                },
                borderWidth: 0,
            }, {
                name       : '수위ch02(m)',
                type       : 'spline',
                color      : '#1890FF', // 강우 값 실측 값 chart color 변경 시
                data       : seriesHis[1],
                yAxis      : 0,
                tooltip    : {
                    valueSuffix: ' m'
                },
                borderWidth: 0,
            }];
        } else {
            let riverHeaderName = "";
            if (container === "container") {
                riverHeaderName = setCodePerNm ($ ("#modal-select3").attr ("data-value"));
            } else {
                let detailContainer = '';
                if (container.startsWith ('rivierDetail_container')) {
                    detailContainer = container.replace ('Detail', '');
                    riverHeaderName = setCodePerNm (detailContainer);
                } else {
                    riverHeaderName = setCodePerNm (container);
                }
            }
            tempSeries = [{
                name       : riverHeaderName !== "" ? riverHeaderName + '-수위(m)' : '수위(m)',
                type       : field === "river" ? 'area' : 'spline',
                color      : '#3cdddc', // 강우 값 실측 값 chart color 변경 시
                data       : seriesHis[0],
                yAxis      : 0,
                tooltip    : {
                    valueSuffix: ' m'
                },
                borderWidth: 0,
            }];
        }
    } else if (field === "reservoir") {
        tempYaxis = [{
            title        : {
                text    : '수위(m)',
                rotation: 270,
                offset  : 0,
                margin  : 0,
                y       : ht,
                x       : -30,
                style   : {
                    color: '#C3C3C3'
                }
            },
            max          : 120,
            min          : 80,
            tickInterval : 1,
            opposite     : false,
            reversed     : false,
            plotLines    : plotLines,
            labels       : {
                style: {
                    color: '#C3C3C3'
                }
            },
            gridLineColor: '#7B7B7B',
            offset       : 10
        }, {
            title   : {
                text    : '저수율(%)',
                rotation: 90,
                offset  : 0,
                margin  : 0,
                y       : ht,
                x       : 30,
                style   : {
                    color: '#C3C3C3'
                }
            },
            max     : 100,
            min     : 0,
            opposite: true,
            reversed: false,
            // plotLines: plotLines,
            labels       : {
                style: {
                    color: '#C3C3C3'
                }
            },
            gridLineColor: '#7B7B7B',
            offset       : 10
        }];
        tempSeries = [{
            name       : '수위(m)',
            type       : 'spline',
            color      : '#3cdddc', // 강우 값 실측 값 chart color 변경 시
            data       : seriesHis[0],
            yAxis      : 0,
            tooltip    : {
                valueSuffix: ' m'
            },
            borderWidth: 0,
        }, {
            name       : '저수율(%)',
            type       : 'area',
            color      : '#1890FF', // 강우 값 실측 값 chart color 변경 시
            data       : seriesHis[1],
            yAxis      : 1,
            tooltip    : {
                valueSuffix: ' %'
            },
            borderWidth: 0,
        }];

    } else if (field === "alarm") {
        tempYaxis = [{
            title        : {
                text    : '알람발생 수',
                rotation: 270,
                offset  : 0,
                margin  : 0,
                y       : ht,
                x       : -30,
                style   : {
                    color: '#C3C3C3'
                }
            },
            max          : ym,
            min          : 0,
            tickInterval : 1,
            opposite     : false,
            reversed     : false,
            plotLines    : plotLines,
            labels       : {
                style: {
                    color: '#C3C3C3'
                }
            },
            gridLineColor: '#7B7B7B',
            offset       : 10
        }];

        tempSeries = [{
            name        : '알람',
            type        : 'column',
            showInLegend: false,
            data        : seriesHis,
            yAxis       : 0,
            borderWidth : 0,
        }];
    } else if (field === "rainAll") {
        // console.log('rainAll', seriesHis)
        tempYaxis = [
            {
                title: {
                    text    : '1시간누적강우(mm/1hour)',
                    rotation: 90,
                    offset  : 0,
                    margin  : 0,
                    y       : ht,
                    x       : 30,
                    style   : {
                        color: '#C3C3C3'
                    }
                },
                // max:ym[1],
                // min:0,
                tickInterval : 1,
                opposite     : true,
                reversed     : false,
                labels       : {
                    style: {
                        color: '#C3C3C3'
                    }
                },
                gridLineColor: '#7B7B7B',
                offset       : 10
            }
        ];
        tempSeries = [
            {
                name: '유입구 1시간누적강우(mm/1hour)',
                type: 'areaspline',
//			    	opacity: 0.7,
                fillOpacity: 0.1,
                color      : '#454FFF', // 강우 값 실측 값 chart color 변경 시
                data       : seriesHis[0],
                yAxis      : 0,
                tooltip    : {
                    valueSuffix: '(mm/10min)'
                },
                borderWidth: 0,
            },
            {
                name       : '유출구 수위 No2 1시간누적강우(mm/1hour)',
                type       : 'areaspline',
                color      : '#37e545', // 강우 값 실측 값 chart color 변경 시
                data       : seriesHis[1],
                yAxis      : 0,
                tooltip    : {
                    valueSuffix: ' (mm/1hour)'
                },
                borderWidth: 0,
            },
            {
                name       : '첨단산단 옥상 1시간누적강우(mm/1hour)',
                type       : 'areaspline',
                color      : 'skyblue', // 강우 값 실측 값 chart color 변경 시
                data       : seriesHis[2],
                yAxis      : 0,
                opacity    : 0.5,
                tooltip    : {
                    valueSuffix: ' mm'
                },
                borderWidth: 0,
            }
        ];
    } else if (field === "rain") {
        if (seriesHis.length === 3) {
            tempYaxis = [{
                title        : {
                    text    : '10분누적강우(mm/10min)',
                    rotation: 270,
                    offset  : 0,
                    margin  : 0,
                    y       : ht,
                    x       : -30,
                    style   : {
                        color: '#C3C3C3'
                    }
                },
                max          : ym[0],
                min          : 0,
                tickInterval : 1,
                opposite     : false,
                reversed     : true,
                labels       : {
                    style: {
                        color: '#C3C3C3'
                    }
                },
                gridLineColor: '#7B7B7B',
                offset       : 50
            },
                {
                    title        : {
                        text    : '1시간누적강우(mm/1hour)',
                        rotation: 90,
                        offset  : 0,
                        margin  : 0,
                        y       : ht,
                        x       : 30,
                        style   : {
                            color: '#C3C3C3'
                        }
                    },
                    max          : ym[1],
                    min          : 0,
                    tickInterval : 1,
                    opposite     : true,
                    reversed     : false,
                    labels       : {
                        style: {
                            color: '#C3C3C3'
                        }
                    },
                    gridLineColor: '#7B7B7B',
                    offset       : 10
                }
                , {
                    title        : {
                        text    : '누적강우(mm)',
                        rotation: 90,
                        offset  : 30,
                        margin  : 0,
                        style   : {
                            color: '#C3C3C3'
                        }
                    },
                    max          : ym[2],
                    min          : 0,
                    tickInterval : 1,
                    opposite     : true,
                    reversed     : false,
                    labels       : {
                        style: {
                            color: '#C3C3C3'
                        }
                    },
                    gridLineColor: '#7B7B7B',
                    offset       : 50
                },
            ];
        } else {
            tempYaxis = [{
                title        : {
                    text    : '수위(m)',
                    rotation: 270,
                    offset  : 0,
                    margin  : 0,
                    y       : ht,
                    x       : -30,
                    style   : {
                        color: '#C3C3C3'
                    }
                },
                max          : ym[0],
                min          : 0,
                tickInterval : 1,
                opposite     : false,
                reversed     : false,
                plotLines    : plotLines,
                labels       : {
                    style: {
                        color: '#C3C3C3'
                    }
                },
                gridLineColor: '#7B7B7B',
                offset       : 10
            }, {
                title        : {
                    text    : '10분누적강우(mm/10min)',
                    rotation: 270,
                    offset  : 0,
                    margin  : 0,
                    y       : ht,
                    x       : -30,
                    style   : {
                        color: '#C3C3C3'
                    }
                },
                max          : ym[1],
                min          : 0,
                tickInterval : 1,
                opposite     : false,
                reversed     : true,
                labels       : {
                    style: {
                        color: '#C3C3C3'
                    }
                },
                gridLineColor: '#7B7B7B',
                offset       : 50
            },
                {
                    title        : {
                        text    : '1시간누적강우(mm/1hour)',
                        rotation: 90,
                        offset  : 0,
                        margin  : 0,
                        y       : ht,
                        x       : 30,
                        style   : {
                            color: '#C3C3C3'
                        }
                    },
                    max          : ym[2],
                    min          : 0,
                    tickInterval : 1,
                    opposite     : true,
                    reversed     : false,
                    labels       : {
                        style: {
                            color: '#C3C3C3'
                        }
                    },
                    gridLineColor: '#7B7B7B',
                    offset       : 10
                }
                , {
                    title        : {
                        text    : '누적강우(mm)',
                        rotation: 90,
                        offset  : 30,
                        margin  : 0,
                        style   : {
                            color: '#C3C3C3'
                        }
                    },
                    max          : ym[3],
                    min          : 0,
                    tickInterval : 1,
                    opposite     : true,
                    reversed     : false,
                    labels       : {
                        style: {
                            color: '#C3C3C3'
                        }
                    },
                    gridLineColor: '#7B7B7B',
                    offset       : 50
                },
            ];
        }
        if (seriesHis.length === 5) {
            tempSeries = [{
                name       : '수위ch01(m)',
                type       : 'spline',
                color      : '#3cdddc', // 강우 값 실측 값 chart color 변경 시
                data       : seriesHis[0],
                yAxis      : 0,
                tooltip    : {
                    valueSuffix: ' m'
                },
                borderWidth: 0,
            }, {
                name       : '수위ch02(m)',
                type       : 'spline',
                color      : '#1890FF', // 강우 값 실측 값 chart color 변경 시
                data       : seriesHis[4],
                yAxis      : 0,
                tooltip    : {
                    valueSuffix: ' m'
                },
                borderWidth: 0,
            },
                {
                    name: '강우값(mm/10min)',
                    type: 'column',
//			    	opacity: 0.7,
                    fillOpacity: 0.1,
                    color      : '#454FFF', // 강우 값 실측 값 chart color 변경 시
                    data       : seriesHis[1],
                    yAxis      : 1,
                    tooltip    : {
                        valueSuffix: '(mm/10min)'
                    },
                    borderWidth: 0,
                },
                {
                    name       : '1시간누적강우(mm/1hour)',
                    type       : 'areaspline',
                    color      : '#37e545', // 강우 값 실측 값 chart color 변경 시
                    data       : seriesHis[2],
                    yAxis      : 2,
                    tooltip    : {
                        valueSuffix: ' (mm/1hour)'
                    },
                    borderWidth: 0,
                },
                {
                    name       : '누적강우(mm)',
                    type       : 'areaspline',
                    color      : 'skyblue', // 강우 값 실측 값 chart color 변경 시
                    data       : seriesHis[3],
                    yAxis      : 3,
                    opacity    : 0.5,
                    tooltip    : {
                        valueSuffix: ' mm'
                    },
                    borderWidth: 0,
                },
            ];
        } else if (seriesHis.length === 3) {
            tempSeries = [
                {
                    name: '강우값(mm/10min)',
                    type: 'column',
//			    	opacity: 0.7,
                    fillOpacity: 0.1,
                    color      : '#454FFF', // 강우 값 실측 값 chart color 변경 시
                    data       : seriesHis[0],
                    yAxis      : 0,
                    tooltip    : {
                        valueSuffix: '(mm/10min)'
                    },
                    borderWidth: 0,
                },
                {
                    name       : '1시간누적강우(mm/1hour)',
                    type       : 'areaspline',
                    color      : '#37e545', // 강우 값 실측 값 chart color 변경 시
                    data       : seriesHis[1],
                    yAxis      : 1,
                    tooltip    : {
                        valueSuffix: ' (mm/1hour)'
                    },
                    borderWidth: 0,
                },
                {
                    name       : '누적강우(mm)',
                    type       : 'areaspline',
                    color      : 'skyblue', // 강우 값 실측 값 chart color 변경 시
                    data       : seriesHis[2],
                    yAxis      : 2,
                    opacity    : 0.5,
                    tooltip    : {
                        valueSuffix: ' mm'
                    },
                    borderWidth: 0,
                }
            ];
        } else {
            tempSeries = [
                {
                    name       : '수위(m)',
                    type       : 'spline',
                    color      : '#3cdddc', // 강우 값 실측 값 chart color 변경 시
                    data       : seriesHis[0],
                    yAxis      : 0,
                    tooltip    : {
                        valueSuffix: ' m'
                    },
                    borderWidth: 0,
                },
                {
                    name: '강우값(mm/10min)',
                    type: 'column',
//			    	opacity: 0.7,
                    fillOpacity: 0.1,
                    color      : '#454FFF', // 강우 값 실측 값 chart color 변경 시
                    data       : seriesHis[1],
                    yAxis      : 1,
                    tooltip    : {
                        valueSuffix: '(mm/10min)'
                    },
                    borderWidth: 0,
                },
                {
                    name       : '1시간누적강우(mm/1hour)',
                    type       : 'areaspline',
                    color      : '#37e545', // 강우 값 실측 값 chart color 변경 시
                    data       : seriesHis[2],
                    yAxis      : 2,
                    tooltip    : {
                        valueSuffix: ' (mm/1hour)'
                    },
                    borderWidth: 0,
                },
                {
                    name       : '누적강우(mm)',
                    type       : 'areaspline',
                    color      : 'skyblue', // 강우 값 실측 값 chart color 변경 시
                    data       : seriesHis[3],
                    yAxis      : 3,
                    opacity    : 0.5,
                    tooltip    : {
                        valueSuffix: ' mm'
                    },
                    borderWidth: 0,
                }
            ];
        }
    } else if (field === "rain_risk") {
        tempYaxis = [
            {
                title        : {
                    text    : '10분누적강우<br/>(mm/10min)',
                    rotation: 270,
                    offset  : 0,
                    margin  : 0,
                    y       : ht,
                    x       : -30,
                    style   : {
                        color: '#C3C3C3'
                    }
                },
                max          : ym[0],
                min          : 0,
                tickInterval : 1,
                opposite     : false,
                reversed     : true,
                labels       : {
                    style: {
                        color: '#C3C3C3'
                    }
                },
                gridLineColor: '#7B7B7B',
                offset       : 50
            },
            {
                title        : {
                    text    : '1시간누적강우<br/>(mm/1hour)',
                    rotation: 90,
                    offset  : 0,
                    margin  : 0,
                    y       : ht,
                    x       : 30,
                    style   : {
                        color: '#C3C3C3'
                    }
                },
                max          : ym[1],
                min          : 0,
                tickInterval : 1,
                opposite     : true,
                reversed     : false,
                labels       : {
                    style: {
                        color: '#C3C3C3'
                    }
                },
                gridLineColor: '#7B7B7B',
                offset       : 10
            }
            , {
                title        : {
                    text    : '누적강우(mm)',
                    rotation: 90,
                    offset  : 30,
                    margin  : 0,
                    style   : {
                        color: '#C3C3C3'
                    }
                },
                max          : ym[2],
                min          : 0,
                tickInterval : 1,
                opposite     : true,
                reversed     : false,
                labels       : {
                    style: {
                        color: '#C3C3C3'
                    }
                },
                gridLineColor: '#7B7B7B',
                offset       : 50
            },
        ];

        tempSeries = [
            {
                name: '강우값(mm/10min)',
                type: 'column',
//			    	opacity: 0.7,
                fillOpacity: 0.1,
                color      : '#454FFF', // 강우 값 실측 값 chart color 변경 시
                data       : seriesHis[0],
                yAxis      : 0,
                tooltip    : {
                    valueSuffix: '(mm/10min)'
                },
                borderWidth: 0,
            },
            {
                name       : '1시간누적강우(mm/1hour)',
                type       : 'areaspline',
                color      : '#37e545', // 강우 값 실측 값 chart color 변경 시
                data       : seriesHis[1],
                yAxis      : 1,
                tooltip    : {
                    valueSuffix: ' (mm/1hour)'
                },
                borderWidth: 0,
            },
            {
                name       : '누적강우(mm)',
                type       : 'areaspline',
                color      : 'skyblue', // 강우 값 실측 값 chart color 변경 시
                data       : seriesHis[2],
                yAxis      : 2,
                opacity    : 0.5,
                tooltip    : {
                    valueSuffix: ' mm'
                },
                borderWidth: 0,
            },
        ];
    }
    let timeInterval = interval * (12 * 60) * 1000;
    if (field === "reservoir") {
        timeInterval = container != "container" ? 24 * 60 * 60 * 1000 : 2 * (24 * 60 * 60) * 1000;
    } else if (field === "rain_risk") {
        timeInterval = seriesHis[0].length / 144 > 0 ? 24 * 60 * 60 * 1000 * (seriesHis[0].length / 144 > 0) : 24 * 60 * 60 * 1000;
    } else if (field === "river" && container != "container") {
        timeInterval = seriesHis[0].length / 144 > 0 ? 24 * 60 * 60 * 1000 * (seriesHis[0].length / 144 > 0) : 24 * 60 * 60 * 1000;
    }

    chart01 = Highcharts.chart (container, {
        chart    : {
            height         : height,
            marginLeft     : field === "rain_risk" ? 140 : 105,
            marginRight    : field === "rain_risk" ? 120 : 55,
            marginBottom   : field === "rain_risk" ? 40 : 65,
            backgroundColor: 'transparent',
            zoomType       : "x",
            title          : "",
            type           : 'line',
        },
        title    : {
            text: ''
            // text: null // as an alternative
        },
        legend   : {
            align        : 'center',
            verticalAlign: 'top',
            x            : 0,
            y            : 0,
            itemStyle    : {
                color: '#FFF'
            },
        },
        tooltip  : {
            shared     : true,
            xDateFormat: '%Y-%m-%d %H:%M:%S',
        },
        xAxis    : field === "alarm" ? {
            type  : 'category',
            labels: {
                useHTML  : true,
                animate  : true,
                formatter: ctx => {
                    return `${ctx.value}`;
                },
                style    : {
                    textAlign: 'center'
                }
            }
        } : {
            type                : 'datetime',
            tickInterval        : timeInterval,
            dateTimeLabelFormats: {
                second: '%Y-%m-%d<br/>%H:%M',
                minute: '%Y-%m-%d<br/>%H:%M',
                hour  : '%Y-%m-%d<br/>%H:%M',
                day   : '%Y-%m-%d<br/>%H:%M',
            },
            labels              : {
                style: {
                    color: '#C3C3C3'
                }
            },
            lineColor           : '#FFF',
            lineWidth           : 2

        },
        yAxis    : tempYaxis,
        series   : tempSeries,
        credits  : {
            enabled: false
        },
        exporting: {
            showTable: false,
            buttons  : {
                contextButton: {
                    enabled: false
                }
            }
        },
    });

}

