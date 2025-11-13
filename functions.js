import {ref, remove, onValue } from  "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js"

export function remove_all(data){
    onValue(data, (snapshot) => {
        if (snapshot.exists()) {
            remove(data);
        }
    });
}

export function get_stats(data) {
    return new Promise((resolve, reject) => {
        onValue(data, (snapshot) => {
            if (snapshot.exists()) {
                const firebaseData = snapshot.val();
                const stats = Object.entries(firebaseData);
                resolve(stats);
            } else {
                resolve([]);
            }
        }, (error) => {
            reject(error);
        });
    });
}

export function get_last_stat(stats) {
    if (!stats || stats.length === 0) return null;
    return stats[stats.length - 1][1];
}

export function Activity(act, div){
    let path = "";
    switch(act){
        case "anime":
            path = "./images/megumi.png";
            break;
        case "gaming":
            path = "./images/gaming.png";
            break;
        case "web":
            path = "./images/web.png";
            break;
        case "film":
            path = "./images/movie.png";
            break;
        default:
            path = "./images/tangirou.png";
    }
    let img = document.createElement("img");
    let span = document.createElement("span");
    span.innerText = `Activity: ${act ?? 'N/A'}`;
    img.src = path;
    div.appendChild(img);
    div.appendChild(span);
}

export function extract_array(arr, n, id){
    let result = [];
    let i = arr.length - 1;
    let j = 0;
    while(j < n && i > 0){
        if(arr[i][1].pc_id == id){
            result.unshift(arr[i][1]);
            j += 1;
        }
        i -= 1;
    }
    return result;
}

export function accumelate(arr){
    for(let i = 0; i < arr.length - 1; i++){
        arr[i + 1] = parseInt(arr[i + 1] + arr[i]);
    }
    return arr;
}

export function courbe(arr){
    let canvas = document.querySelector('#courbeCanvas');
    let ctx = canvas.getContext('2d');
    let costs = arr.map(e => e.cost);
    let times = arr.map(e => e.temp);
    costs = accumelate(costs);
    times = accumelate(times);
    let myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: times,
            datasets: [{
                label: 'Cumulative Cost Over Time',
                data: costs,
                fill: true,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

export function updateThermometer(value) {
    const fluid = document.getElementById('thermometerFluid');
    const valueDisplay = document.getElementById('thermometerValue');

    const clampedValue = Math.max(0, Math.min(100, value));
    const heightPercentage = clampedValue + '%';

    let color;
    if (clampedValue < 60) {
        color = '#3498db';
    } else if (clampedValue < 70) {
        color = '#2ecc71';
    } else {
        color = '#e74c3c'; 
    }

    fluid.style.height = heightPercentage;
    fluid.style.backgroundColor = color;
    valueDisplay.textContent = clampedValue + '°C'; 
}

// Function to create a gauge chart
export function gauge(input){
    const data = {
      datasets: [{
        label: 'Weekly Sales',
        data: [25,25,25,25,25,25,25],
        backgroundColor: [
          'rgba(255, 0  , 0  , 0.2)',
          'rgba(255, 127, 0  , 0.2)',
          'rgba(255, 255, 0  , 0.2)',
          'rgba(0  , 255, 0  , 0.2)',
          'rgba(0  , 0  , 255, 0.2)',
          'rgba(75 , 0  , 130, 0.2)',
          'rgba(148, 0  , 211, 0.2)'
        ],
        borderColor: [
          'rgba(255, 0  , 0  , 1)',
          'rgba(255, 127, 0  , 1)',
          'rgba(255, 255, 0  , 1)',
          'rgba(0  , 255, 0  , 1)',
          'rgba(0  , 0  , 255, 1)',
          'rgba(75 , 0  , 130, 1)',
          'rgba(148, 0  , 211, 1)'
        ],
        borderWidth: 1,
        cutout:'80%',
        circumference:180,
        rotation:270,
        needleValue : input
      }]
    };

    const gaugeNeedle = {
        id: 'gaugeNeedle',
        afterDatasetsDraw(chart,args,plugins){
            const{ ctx,data } = chart;
            
            ctx.save();
            const xcenter = chart.getDatasetMeta(0).data[0].x;
            const ycenter = chart.getDatasetMeta(0).data[0].y;
            const outerRadius = chart.getDatasetMeta(0).data[0].outerRadius;
            const innerRadius = chart.getDatasetMeta(0).data[0].innerRadius;
            const widthSlice = (outerRadius - innerRadius)/2
            const radius = 15;
            const angle = Math.PI / 180;
            const needleValue = data.datasets[0].needleValue;
            const dataTotal = data.datasets[0].data.reduce((a,b) => 
                a + b , 0);
            const circumference = ((chart.getDatasetMeta(0).data[0].circumference / Math.PI )/data.datasets[0].data[0])*needleValue;

            ctx.translate(xcenter,ycenter)
            ctx.rotate(Math.PI * (circumference + 1.5))

            ctx.beginPath();
            ctx.strokeStyle = 'white';
            ctx.fillStyle = 'white';
            ctx.lineWidth = 3;
            ctx.moveTo(0 - radius, 0);
            ctx.lineTo(0,0-innerRadius - widthSlice);
            ctx.lineTo(0 + radius,0);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();

            ctx.beginPath();
            ctx.arc(0,0,radius,0,angle * 360 ,false);
            ctx.fill();
            ctx.restore();
        }
    }

    const gaugeFlowMeter = {
        id : 'gaugeFlowMeter',
        afterDatasetsDraw(chart,args,plugins){
            const {ctx,data} = chart;
            ctx.save();
            const needleValue = data.datasets[0].needleValue;
            const xcenter = chart.getDatasetMeta(0).data[0].x;
            const ycenter = chart.getDatasetMeta(0).data[0].y;
            const circumference = ((chart.getDatasetMeta(0).data[0].circumference / Math.PI )/data.datasets[0].data[0])*needleValue;

            ctx.font = "bold 30px sans-serif";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(Math.round(circumference.toFixed(3)*100) + "Mb/s",xcenter,ycenter + 40);
            ctx.restore();
        }
    }

    const config = {
      type: 'doughnut',
      data,
      options: {
        aspectRatio:1,
        plugins:{
            legend:{
                display:false
            },
            tooltip:{
                enabled:false
            }
        }},
        plugins:[gaugeNeedle,gaugeFlowMeter]
    };

    const myChart = new Chart(
      document.getElementById('myChart'),
      config
    );

    const chartVersion = document.getElementById('chartVersion');
    if (chartVersion) {
        chartVersion.innerText = Chart.version;
    }
}