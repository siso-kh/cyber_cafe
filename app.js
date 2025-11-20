import {initializeApp } from  "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js"
import {getDatabase ,ref } from  "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js"

import {
    remove_all,
    get_stats,
    get_last_stat,
    Activity,
    extract_array,
    courbe,
    updateThermometer,
    gauge,
    checkAlerts
} from './functions.js'

const appSettings = {
    databaseURL: "https://cyber-cafe-dc8d1-default-rtdb.europe-west1.firebasedatabase.app/" 
}

const app = initializeApp(appSettings);
const database = getDatabase(app);
const data = ref(database);

document.addEventListener('DOMContentLoaded', async () => {
    let returne = document.querySelector(".return");
    if (returne) {
        returne.addEventListener("click", () => {
            window.location.href = '/index.html';
        });
    } else {
        console.warn('Return button element not found');
    }

    try {
        const stats = await get_stats(data);

        const div_id = document.querySelector('.poste_id');
        let id = window.location.search.split('=')[1];
        div_id.innerHTML = `Poste ID: ${id ?? 'N/A'}`;

        let post = stats.findLast( e=> e[1].pc_id == id);

        if (post && post[1]) {
            Activity(post[1].activity, div_id);

            let id_array = extract_array(stats, 5, id);
            courbe(id_array);

            updateThermometer(post[1].temp)

            gauge(post[1].internet)
            checkAlerts(post[1].internet, post[1].temp);
        } else {
            console.log('No data found for PC ID:', id);
            div_id.innerHTML += '<br>No data available for this PC';
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }

});

