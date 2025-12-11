import { initializeApp } from  "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js"
import { getDatabase, ref, onValue } from  "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js"

import {
    remove_all,
    get_stats,
    get_last_stat,
    Activity,
    extract_array,
    courbe,
    updateThermometer,
    gauge,
    checkAlerts,
    history
} from './functions.js'

const appSettings = {
    databaseURL: "https://cyber-cafe-dc8d1-default-rtdb.europe-west1.firebasedatabase.app/" 
}

const app = initializeApp(appSettings);
const database = getDatabase(app);
const data = ref(database);

// Track last processed timestamp for this PC so we only update when its data changes
let lastPcTimestamp = null;

document.addEventListener('DOMContentLoaded', () => {
    let returne = document.querySelector(".return");
    if (returne) {
        returne.addEventListener("click", () => {
            window.location.href = 'index.html';
        });
    } else {
        console.warn('Return button element not found');
    }

    const div_id = document.querySelector('.poste_id');
    const id = window.location.search.split('=')[1];
    div_id.innerHTML = `Poste ID: ${id ?? 'N/A'}`;

    // Listen to realtime updates and refresh the PC view when *this PC's* data changes
    onValue(data, snapshot => {
        if (!snapshot.exists()) {
            div_id.innerHTML = `Poste ID: ${id ?? 'N/A'}<br>No data available for this PC`;
            return;
        }

        const firebaseData = snapshot.val();
        const stats = Object.entries(firebaseData);

        const post = stats.findLast(e => e[1].pc_id == id);

        if (post && post[1]) {
            const currentTimestamp = post[1].timestamp;

            // If we have already processed this timestamp, it means the change was for another PC
            if (lastPcTimestamp !== null && currentTimestamp === lastPcTimestamp) {
                return;
            }

            lastPcTimestamp = currentTimestamp;

            // Reset activity section so it doesn't duplicate content
            div_id.innerHTML = `Poste ID: ${id ?? 'N/A'}`;
            Activity(post[1].activity, div_id);

            const id_array = extract_array(stats, 5, id);
            courbe(id_array);

            updateThermometer(post[1].temp);
            gauge(post[1].internet);
            history(id_array);
            checkAlerts(post[1].internet, post[1].temp);
        } else {
            div_id.innerHTML = `Poste ID: ${id ?? 'N/A'}<br>No data available for this PC`;
        }
    }, error => {
        console.error('Error loading data:', error);
    });
});
