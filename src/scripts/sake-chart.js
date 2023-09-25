import { Chart } from 'chart.js/auto';

const storeList = document.querySelectorAll('.store-item');
// console.log(storeList);
const dataSakeList = [];
const dataPointList = [];

// データポイントの大きさ取得
const innerWidth = window.innerWidth;
let evenNumber;
if (innerWidth >= 1060) {
    evenNumber = 22;
} else if (innerWidth >= 390) {
    evenNumber = Math.floor(((innerWidth - 390) / (1060 - 390)) * (22 - 14) + 14);
    if (evenNumber % 2 !== 0) {
        evenNumber -= 1;
    }  } else {
    evenNumber = 14;
}

const duplicates = new Map();

storeList.forEach((store,index) => {

    // データポイントの重複調べて配列へ保存
    const key = `${store.dataset.taste}-${store.dataset.flavor}`;
    if (duplicates.has(key)) {
        duplicates.get(key).push(index);
    } else {
        duplicates.set(key, [index]);
    }
    const storeLink = store.querySelector('.store-link');
    // const canceled = storeLink.dataset.canceled;
    // if(canceled === 'true') {return false}

    // データポイントを作成
    const sake = {
        x: Number(store.dataset.taste) || 0,
        y: Number(store.dataset.flavor) || 0,
        label: store.dataset.title,
        slug: storeLink.href,
    }
    // console.log(sake);
    dataSakeList.push(sake);

    // 店番号のCanvas要素を生成
    const canvas = document.createElement('canvas');
    const size = evenNumber;
    // const size = 16;
    canvas.width = size;
    canvas.height = size;
    const centerX = canvas.width / 2;
    const context = canvas.getContext("2d");
    context.fillStyle = "#1D2A82";
    context.arc(centerX,canvas.height / 2, size / 2, 0, Math.PI * 2);
    context.fill();

    const text = store.dataset.number;
    context.fillStyle = "#FFFFFF";
    context.font = (evenNumber / 2 + 2) + "px Arial";
    const textWidth = context.measureText(text).width;
    const textX = centerX - textWidth / 2;
    const textY = centerX + ((evenNumber / 2 + 2) / 3);
    context.fillText(text, textX, textY);

    dataPointList.push(canvas);
});

// 重複のあったデータポイントをずらす
const randomNumberY = evenNumber > 23 ? 0.2 : 0.3;
const randomNumberX = evenNumber > 20 ? 0.2 : 0.3;

// console.log(duplicates);
duplicates.forEach((duplicate,index)=>{
    if(duplicate.length > 1) {
        // console.log(duplicate,index);
        duplicate.forEach((key, index) => {
            // console.log(dataSakeList[key],index);
            switch (index) {
                case 0:
                    if(dataSakeList[key].x !== -10) dataSakeList[key].x -= randomNumberX;
                    if(dataSakeList[key].y !== -10) dataSakeList[key].y -= randomNumberY;
                    break;
                case 1:
                    if(dataSakeList[key].x !== 10) dataSakeList[key].x += randomNumberX;
                    if(dataSakeList[key].y !== 10) dataSakeList[key].y += randomNumberY;
                    break;
                case 2:
                    if(dataSakeList[key].x !== 10) dataSakeList[key].x += randomNumberX;
                    if(dataSakeList[key].y !== -10) dataSakeList[key].y -= randomNumberY;
                    break;
                case 3:
                    if(dataSakeList[key].x !== -10) dataSakeList[key].x -= randomNumberX;
                    if(dataSakeList[key].y !== 10) dataSakeList[key].y += randomNumberY;
                    break;
                default:
                    break;
            }
            console.log(dataSakeList[key]);
        })
    }
});

// ツールチップカスタマイズ
const getOrCreateTooltip = (chart) => {
    let tooltipEl = chart.canvas.parentNode.querySelector('.tooltip');

    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.classList.add('tooltip');
        tooltipEl.style.background = '#1D2A82';
        tooltipEl.style.borderRadius = '5px';
        tooltipEl.style.color = 'white';
        tooltipEl.style.opacity = 1;
        tooltipEl.style.width = 'fit-content';
        tooltipEl.style.position = 'absolute';
        tooltipEl.style.fontSize = '12px';
        tooltipEl.style.whiteSpace = 'nowrap';
        tooltipEl.style.visibility = 'visible';
        tooltipEl.style.transform = 'translate(-50%, 0)';
        tooltipEl.style.transition = 'all .1s ease';

        chart.canvas.parentNode.appendChild(tooltipEl);
    }

    return tooltipEl;
};

const externalTooltipHandler = (context) => {
    // Tooltip Element
    const {chart, tooltip} = context;
    const tooltipEl = getOrCreateTooltip(chart);

    // Hide if no tooltip
    if (tooltip.opacity === 0) {
        tooltipEl.style.opacity = 0;
        tooltipEl.style.visibility = 'hidden';
        return;
    }

    // Set Text
    if (tooltip.body) {
        tooltipEl.innerHTML = `<a href="${tooltip.dataPoints[0]['raw']['slug']}" style="color:white;text-decoration:none;">${tooltip.dataPoints[0]['raw']['label']}</a>`;
    }
    const {offsetLeft: positionX, offsetTop: positionY} = chart.canvas;

    // Display, position, and set styles for font
    tooltipEl.style.opacity = 1;
    tooltipEl.style.visibility = 'visible';
    tooltipEl.style.left = positionX + tooltip.caretX + 'px';
    tooltipEl.style.top = positionY + tooltip.caretY + 'px';
    tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';
};

const sakeChartElement = document.getElementById('sake-chart');
const sakeChartModalElement = document.getElementById('modal-chart-canvas');
const chartConfig = {
    type: "scatter",
    data: {
        datasets: [{
            label: '振る舞い酒分布図',
            data: dataSakeList,
            pointStyle: dataPointList,
            pointRadius: evenNumber,
        }],
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                suggestedMin: -10,
                suggestedMax: 10,
                position: 'center',
                ticks: {
                    display: false
                },
                grid: {
                    color: function(context) {
                        if (context.tick.value === 0) {
                            return '#aaaaaa';
                        } else {
                            return '#eeeeee';
                        }
                    },
                },
            },
            x: {
                suggestedMin: -10,
                suggestedMax: 10,
                position: 'center',
                ticks: {
                    display: false
                },
                grid: {
                    color: function(context) {
                        if (context.tick.value === 0) {
                            return '#aaaaaa';
                        } else {
                            return '#eeeeee';
                        }
                    },
                },
            },
        },
        title: {
            display: false,
        },
        ticks: {
            stepSize: 1,
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: false,
                position: 'nearest',
                external: externalTooltipHandler
            },
        },
    },
}
const sakeChart = new Chart(sakeChartElement, chartConfig);
if(sakeChartModalElement !== null) {
    console.log('モーダル有り');
    const sakeChartModal = new Chart(sakeChartModalElement, chartConfig);
}