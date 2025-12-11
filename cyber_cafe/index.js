import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const appSettings = {
    databaseURL: "https://cyber-cafe-dc8d1-default-rtdb.europe-west1.firebasedatabase.app/"
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const dataRef = ref(database);

document.addEventListener('DOMContentLoaded', () => {
    // Realtime status updates for each PC card
    onValue(dataRef, snapshot => {
        if (!snapshot.exists()) return;

        const raw = snapshot.val();
        const entries = Object.values(raw); // each is a stat object

        // Group latest stat per pc_id
        const latestPerPc = {};
        entries.forEach(stat => {
            if (!stat || stat.pc_id == null) return;
            const pcId = String(stat.pc_id);
            const current = latestPerPc[pcId];
            // Use timestamp if available, otherwise overwrite
            if (!current || (stat.timestamp && current.timestamp && stat.timestamp > current.timestamp)) {
                latestPerPc[pcId] = stat;
            } else if (!current) {
                latestPerPc[pcId] = stat;
            }
        });

        // Update each card's status text and dot
        for (let id = 1; id <= 8; id++) {
            const card = document.querySelector(`.card[id="${id}"]`);
            if (!card) continue;
            const statusText = card.querySelector('.status-text');
            const statusDot = card.querySelector('.status-dot');
            const stat = latestPerPc[String(id)];

            if (!statusText || !statusDot) continue;

            if (!stat) {
                statusText.textContent = 'Unknown';
                statusDot.style.backgroundColor = '#888';
                continue;
            }

            const temperature = stat.temp;
            const internetSpeed = stat.internet;
            const hasAlert = (typeof temperature === 'number' && temperature > 70) ||
                             (typeof internetSpeed === 'number' && internetSpeed < 5);

            if (hasAlert) {
                statusText.textContent = 'Alert';
                statusDot.style.backgroundColor = '#ff4d4f';
            } else {
                statusText.textContent = 'No problem';
                statusDot.style.backgroundColor = '#4caf50';
            }
        }
    });

    // Keep navigation from cards to the PC page
    const pcButtons = document.querySelectorAll('.pc');
    pcButtons.forEach(e => {
        e.addEventListener('click', () => {
            const id = e.getAttribute('id');
            window.location.href = `pc.html?id=${id}`;
        });
    });
});