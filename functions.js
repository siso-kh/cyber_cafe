import {ref, remove, onValue } from  "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js"

// Keep references to current Chart.js instances so we can destroy them on update
let courbeChartInstance = null;
let gaugeChartInstance = null;

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
    // Destroy previous chart instance if it exists to avoid Chart.js canvas reuse errors
    if (courbeChartInstance) {
        courbeChartInstance.destroy();
    }

    courbeChartInstance = new Chart(ctx, {
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
    const courbeContainer = document.querySelector('.courbe');
    if (courbeContainer) {
        const existingTotal = courbeContainer.querySelector('.total-cost');
        if (existingTotal) existingTotal.remove();

        const total = document.createElement('h2');
        total.className = 'total-cost';
        total.innerText = 'Total: ' + costs[costs.length - 1];
        courbeContainer.appendChild(total);
    }
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

    const gaugeCanvas = document.getElementById('myChart');
    if (!gaugeCanvas) return;

    // Destroy previous gauge chart instance if it exists
    if (gaugeChartInstance) {
        gaugeChartInstance.destroy();
    }

    gaugeChartInstance = new Chart(
      gaugeCanvas,
      config
    );

    const chartVersion = document.getElementById('chartVersion');
    if (chartVersion) {
        chartVersion.innerText = Chart.version;
    }
}

export function checkAlerts(internetSpeed, temperature) {

    let alertZone = document.getElementById("alertZone");
    if (!alertZone) {
        alertZone = document.createElement("div");
        alertZone.id = "alertZone";
        alertZone.style.position = "fixed";
        alertZone.style.top = "20px";
        alertZone.style.right = "20px";
        alertZone.style.zIndex = "9999";
        alertZone.style.display = "flex";
        alertZone.style.flexDirection = "column";
        alertZone.style.gap = "10px";
        document.body.appendChild(alertZone);
    }

    alertZone.innerHTML = ""; 

    let alerts = [];

    if (temperature > 70) {
        alerts.push({
            type: "danger",
            message: `High Temperature: ${temperature}°C`
        });
    }

    if (internetSpeed < 5) {
        alerts.push({
            type: "warning",
            message: `Slow Internet: ${internetSpeed} Mb/s`
        });
    }

    alerts.forEach(alert => {
        const box = document.createElement("div");

        box.style.padding = "15px 20px";
        box.style.borderRadius = "8px";
        box.style.fontSize = "18px";
        box.style.fontWeight = "bold";
        box.style.color = "white";
        box.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
        box.style.opacity = "0";
        box.style.transition = "opacity 0.4s ease";

        if (alert.type === "danger") {
            box.style.background = "linear-gradient(#ff2e2e, #b30000)";
        } 
        else if (alert.type === "warning") {
            box.style.background = "linear-gradient(#ffcc00, #b38f00)";
        }

        box.textContent = alert.message;

        alertZone.appendChild(box);

        setTimeout(() => {
            box.style.opacity = "1";
        }, 10);

        setTimeout(() => {
            box.style.opacity = "0";
            setTimeout(() => box.remove(), 500);
        }, 6000);
    });
}

export function history(arr){
    let history = document.getElementById("history");
    if (!history) {
        history = document.createElement("div");
        history.id = "history";
        history.style.position = "fixed";
        history.style.top = "20px";
        history.style.right = "20px";
        history.style.zIndex = "9999";
        history.style.display = "flex";
        history.style.flexDirection = "column";
        history.style.gap = "10px";
        document.body.appendChild(history);
    }

    history.innerHTML = "";

    if (!Array.isArray(arr) || arr.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.textContent = 'No history available.';
        history.appendChild(emptyMsg);
        return;
    }

    // Sort by timestamp in descending order (most recent first)
    const sortedArr = [...arr].sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeB - timeA;
    });

    const table = document.createElement('table');
    table.style.borderCollapse = "collapse";

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['Internet', 'Temperature', 'Activity', 'Timestamp'].forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        th.style.padding = "10px";
        th.style.border = "1px solid black";
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    sortedArr.forEach(row => {
        if (!row) return;
        const tr = document.createElement('tr');
        ['internet', 'temp', 'activity', 'timestamp'].forEach(key => {
            const td = document.createElement('td');
            td.textContent = row[key] ?? '';
            td.style.padding = "10px";
            td.style.border = "1px solid black";
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    history.appendChild(table);
}