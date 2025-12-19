// --- DATA BAHASA (Localization) ---
const i18n = {
    id: {
        homeBtn: "Beranda",
        gameTitle: "KLIK KILAT",
        gameSubtitle: "Uji kecepatan jari Anda!",
        nicknameLabel: "NAMA PEMAIN",
        leaderboardTitle: "PAPAN SKOR TERTINGGI",
        instructionShort: "Klik tombol merah sebanyak mungkin dalam 10 detik!",
        startBtn: "MULAI MAIN",
        tapHint: "TEKAN SECEPAT MUNGKIN!",
        timeUp: "WAKTU HABIS!",
        finalScoreLabel: "SKOR AKHIR",
        playAgainBtn: "MAIN LAGI",
        menuBtn: "KEMBALI KE MENU",
        newRecord: "🔥 REKOR BARU! 🔥"
    },
    en: {
        homeBtn: "Home",
        gameTitle: "SPEED CLICKER",
        gameSubtitle: "Test your finger speed!",
        nicknameLabel: "PLAYER NAME",
        leaderboardTitle: "LEADERBOARD",
        instructionShort: "Click the button as many times as you can in 10s!",
        startBtn: "START GAME",
        tapHint: "TAP AS FAST AS YOU CAN!",
        timeUp: "TIME IS UP!",
        finalScoreLabel: "FINAL SCORE",
        playAgainBtn: "PLAY AGAIN",
        menuBtn: "BACK TO MENU",
        newRecord: "🔥 NEW RECORD! 🔥"
    }
};

// --- STATE VARIABLES ---
let currentLang = 'id';
let score = 0;
let timeLeft = 10;
let timerInterval;
let gameActive = false;

// --- INIT & THEME SETUP ---
document.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard();
    
    // Cek LocalStorage untuk tema
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        document.getElementById('themeIcon').textContent = '☀️';
    } else {
        document.documentElement.classList.remove('dark');
        document.getElementById('themeIcon').textContent = '🌙';
    }
});

// --- THEME & LANGUAGE SWITCHER ---
function toggleTheme() {
    const html = document.documentElement;
    const icon = document.getElementById('themeIcon');
    
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        localStorage.theme = 'light';
        icon.textContent = '🌙';
    } else {
        html.classList.add('dark');
        localStorage.theme = 'dark';
        icon.textContent = '☀️';
    }
}

function toggleLanguage() {
    currentLang = currentLang === 'id' ? 'en' : 'id';
    document.getElementById('langDisplay').textContent = currentLang.toUpperCase();
    
    // Update semua elemen yang punya atribut data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[currentLang][key]) {
            el.textContent = i18n[currentLang][key];
        }
    });
    loadLeaderboard(); // Refresh teks leaderboard
}

// --- GAME LOGIC ---
function switchScreen(screenName) {
    ['screen-menu', 'screen-game', 'screen-result'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    document.getElementById(screenName).classList.remove('hidden');
    document.getElementById(screenName).classList.add('fade-in');
}

function startGame() {
    const nameInput = document.getElementById('nicknameInput').value.trim();
    if(!nameInput) {
        alert(currentLang === 'id' ? "Mohon isi nama dulu!" : "Please enter your name!");
        return;
    }

    score = 0;
    timeLeft = 10; // Durasi permainan (detik)
    gameActive = true;
    
    document.getElementById('scoreDisplay').textContent = score;
    document.getElementById('timerDisplay').textContent = timeLeft;
    
    switchScreen('screen-game');

    // Timer Loop
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timerDisplay').textContent = timeLeft;
        
        // Efek visual jika waktu mau habis (merah)
        if(timeLeft <= 3) {
            document.getElementById('timerDisplay').parentElement.classList.add('text-red-500', 'animate-pulse');
        } else {
            document.getElementById('timerDisplay').parentElement.classList.remove('text-red-500', 'animate-pulse');
        }

        if(timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function registerClick(e) {
    if(!gameActive) return;

    score++;
    document.getElementById('scoreDisplay').textContent = score;

    // Efek Partikel Angka Melayang
    createParticle(e.clientX, e.clientY);
    
    // Efek visual tombol (JS trigger scale animation reset)
    const btn = document.getElementById('clickBtn');
    btn.classList.remove('scale-95');
    void btn.offsetWidth; // trigger reflow
    btn.classList.add('scale-95');
}

function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.classList.add('click-particle');
    particle.textContent = "+1";
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    document.body.appendChild(particle);

    setTimeout(() => particle.remove(), 800);
}

function endGame() {
    clearInterval(timerInterval);
    gameActive = false;
    
    document.getElementById('finalScoreDisplay').textContent = score;
    
    // Cek & Simpan High Score
    const name = document.getElementById('nicknameInput').value || "Anonymous";
    const isNewRecord = saveScore(name, score);
    
    const recordMsg = document.getElementById('newRecordMsg');
    if(isNewRecord) {
        recordMsg.textContent = i18n[currentLang].newRecord;
        recordMsg.className = "text-sm mt-2 font-bold text-orange-500 animate-bounce";
    } else {
        recordMsg.textContent = "";
    }

    switchScreen('screen-result');
}

function resetGame() {
    startGame();
}

function backToMenu() {
    loadLeaderboard();
    switchScreen('screen-menu');
}

// --- LEADERBOARD & STORAGE ---
function saveScore(name, newScore) {
    let highScores = JSON.parse(localStorage.getItem('clickerHighScores')) || [];
    
    // Tambah skor baru
    highScores.push({ name: name, score: newScore });
    
    // Urutkan dari terbesar ke terkecil
    highScores.sort((a, b) => b.score - a.score);
    
    // Ambil top 5 saja
    highScores = highScores.slice(0, 5);
    
    localStorage.setItem('clickerHighScores', JSON.stringify(highScores));

    // Cek apakah skor ini masuk top 1
    return highScores.length > 0 && highScores[0].score === newScore && highScores[0].name === name;
}

function loadLeaderboard() {
    const list = document.getElementById('leaderboardList');
    const highScores = JSON.parse(localStorage.getItem('clickerHighScores')) || [];
    
    list.innerHTML = "";
    
    if (highScores.length === 0) {
        list.innerHTML = `<li class="text-center italic opacity-50 text-xs">${currentLang === 'id' ? 'Belum ada data' : 'No records yet'}</li>`;
        return;
    }

    highScores.forEach((entry, index) => {
        const isTop = index === 0 ? 'text-yellow-500 font-bold' : '';
        const icon = index === 0 ? '👑' : `#${index + 1}`;
        
        const item = document.createElement('li');
        item.className = `flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-600 ${isTop}`;
        item.innerHTML = `
            <span class="flex items-center gap-2">
                <span class="text-xs opacity-70 w-6">${icon}</span>
                <span>${entry.name}</span>
            </span>
            <span class="font-mono font-bold">${entry.score}</span>
        `;
        list.appendChild(item);
    });
}