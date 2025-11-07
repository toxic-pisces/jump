import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, push, query, orderByChild, limitToFirst, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

export class SpeedrunManager {
    constructor(game) {
        this.game = game;
        this.setupFirebase();
        this.createUI();
    }

    setupFirebase() {
        const firebaseConfig = {
            apiKey: "AIzaSyDQggmZ0xwC7sLf6BXQ6eE7bWkrxpnzwjI",
            authDomain: "jump-d784a.firebaseapp.com",
            databaseURL: "https://jump-d784a-default-rtdb.europe-west1.firebasedatabase.app",
            projectId: "jump-d784a",
            storageBucket: "jump-d784a.firebasestorage.app",
            messagingSenderId: "1013127547585",
            appId: "1:1013127547585:web:4a5342193ee9c3c26ae240",
            measurementId: "G-BW5V5CP26P"
        };

        this.app = initializeApp(firebaseConfig);
        this.database = getDatabase(this.app);
    }

    createUI() {
        // Name Input Screen
        const nameInputScreen = document.createElement('div');
        nameInputScreen.id = 'speedrun-name-input';
        nameInputScreen.innerHTML = `
            <div class="speedrun-input-content">
                <div class="speedrun-title">SPEEDRUN COMPLETE!</div>
                <div class="speedrun-final-time">
                    TIME: <span id="speedrun-final-time">00:00.00</span>
                </div>
                <div class="speedrun-name-section">
                    <label>ENTER YOUR NAME:</label>
                    <input type="text" id="speedrun-name" maxlength="15" placeholder="PLAYER" />
                </div>
                <button class="speedrun-submit-btn" id="submit-speedrun">SUBMIT</button>
                <div class="speedrun-hint">Press ENTER to submit</div>
            </div>
        `;
        document.getElementById('ui-overlay').appendChild(nameInputScreen);

        // Leaderboard Screen
        const leaderboardScreen = document.createElement('div');
        leaderboardScreen.id = 'speedrun-leaderboard';
        leaderboardScreen.innerHTML = `
            <div class="leaderboard-content">
                <div class="leaderboard-title">TOP 10 SPEEDRUNS</div>
                <div id="leaderboard-list"></div>
                <button class="leaderboard-close-btn" id="close-leaderboard">BACK TO MENU</button>
            </div>
        `;
        document.getElementById('ui-overlay').appendChild(leaderboardScreen);

        // Event Listeners
        document.getElementById('submit-speedrun').addEventListener('click', () => this.submitScore());
        document.getElementById('speedrun-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitScore();
        });
        document.getElementById('close-leaderboard').addEventListener('click', () => this.hideLeaderboard());
    }

    showNameInput(time, leaderboardType = 'world1') {
        this.currentLeaderboardType = leaderboardType;
        this.currentTime = time;
        
        const finalTimeElement = document.getElementById('speedrun-final-time');
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        const milliseconds = Math.floor((time % 1) * 100);
        finalTimeElement.textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;

        // Update title based on challenge type
        const titleMap = {
            'world1': 'WORLD 1 SPEEDRUN COMPLETE!',
            'world2': 'WORLD 2 SPEEDRUN COMPLETE!',
            'ironman': 'IRONMAN MODE COMPLETE!'
        };
        document.querySelector('#speedrun-name-input .speedrun-title').textContent = 
            titleMap[leaderboardType] || 'SPEEDRUN COMPLETE!';

        document.getElementById('speedrun-name-input').classList.add('show');
        document.getElementById('speedrun-name').focus();
    }

    hideNameInput() {
        document.getElementById('speedrun-name-input').classList.remove('show');
        document.getElementById('speedrun-name').value = '';
    }

    async submitScore() {
        const nameInput = document.getElementById('speedrun-name');
        const playerName = nameInput.value.trim() || 'PLAYER';
        
        try {
            const scoresRef = ref(this.database, `speedruns/${this.currentLeaderboardType}`);
            await push(scoresRef, {
                name: playerName,
                time: this.currentTime,
                timestamp: Date.now()
            });

            this.hideNameInput();
            await this.showLeaderboard(this.currentLeaderboardType);
        } catch (error) {
            console.error('Error submitting score:', error);
            alert('Error submitting score: ' + error.message);
        }
    }

    async showLeaderboard(leaderboardType = 'world1') {
        console.log('SpeedrunManager.showLeaderboard called with:', leaderboardType);
        
        // Show the leaderboard UI immediately
        document.getElementById('speedrun-leaderboard').classList.add('show');
        
        const leaderboardList = document.getElementById('leaderboard-list');
        leaderboardList.innerHTML = '<div class="no-scores">Loading...</div>';
        
        try {
            const scoresRef = ref(this.database, `speedruns/${leaderboardType}`);
            const topScoresQuery = query(scoresRef, orderByChild('time'), limitToFirst(10));
            
            console.log('Fetching scores from:', `speedruns/${leaderboardType}`);
            const snapshot = await get(topScoresQuery);
            console.log('Snapshot exists:', snapshot.exists());

            const titleMap = {
                'world1': 'TOP 10 SPEEDRUNS - WORLD 1',
                'world2': 'TOP 10 SPEEDRUNS - WORLD 2',
                'ironman': 'TOP 10 IRONMAN RUNS'
            };
            document.querySelector('#speedrun-leaderboard .leaderboard-title').textContent = 
                titleMap[leaderboardType] || 'TOP 10 SPEEDRUNS';

            leaderboardList.innerHTML = '';

            if (snapshot.exists()) {
                const scores = [];
                snapshot.forEach((childSnapshot) => {
                    scores.push(childSnapshot.val());
                });

                console.log('Found scores:', scores.length);

                scores.forEach((score, index) => {
                    const minutes = Math.floor(score.time / 60);
                    const seconds = Math.floor(score.time % 60);
                    const milliseconds = Math.floor((score.time % 1) * 100);
                    const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;

                    const entry = document.createElement('div');
                    entry.className = 'leaderboard-entry';
                    entry.innerHTML = `
                        <span class="leaderboard-rank">#${index + 1}</span>
                        <span class="leaderboard-name">${score.name}</span>
                        <span class="leaderboard-time">${timeString}</span>
                    `;
                    leaderboardList.appendChild(entry);
                });
            } else {
                console.log('No scores found');
                leaderboardList.innerHTML = '<div class="no-scores">No scores yet! Be the first!</div>';
            }
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            leaderboardList.innerHTML = `<div class="no-scores">Error loading leaderboard<br>${error.message}</div>`;
        }
    }

    hideLeaderboard() {
        document.getElementById('speedrun-leaderboard').classList.remove('show');
        this.game.showLevelSelect();
    }
}
