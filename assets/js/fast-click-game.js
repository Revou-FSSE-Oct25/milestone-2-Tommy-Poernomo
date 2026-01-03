// --- LOCALIZATION DATA ---
const i18n = {
    id: {
        homeBtn: "Beranda", gameTitle: "SPEED CLICKER", gameSubtitle: "Seberapa cepat jarimu?",
        nicknameLabel: "NAMA PEMAIN", leaderboardTitle: "PAPAN SKOR",
        instructionShort: "Klik tombol merah/tombol berlogo telunjuk tangan sebanyak mungkin dalam 10 detik!",
        startBtn: "MULAI MAIN", tapHint: "TEKAN SECEPAT MUNGKIN!",
        timeUp: "WAKTU HABIS!", finalScoreLabel: "SKOR AKHIR",
        playAgainBtn: "MAIN LAGI", menuBtn: "KEMBALI KE MENU",
        newRecord: "🔥 REKOR BARU! 🔥",
        resetBtn: "HAPUS",
        resetConfirm: "Hapus semua data Leaderboard?",
        noData: "Belum ada data",
        // Pesan Perbandingan
        compWin: "Selamat! {0} lebih unggul {1} poin dari {2} (Top Score sebelumnya)",
        compLose: "Coba lagi! {0} kalah unggul {1} poin dari {2} (Top Score)",
        compFirst: "Hebat! Kamu adalah pencetak rekor pertama!",
        compTie: "Luar biasa! Skor {0} seimbang dengan {1} (Top Score)"
    },
    en: {
        homeBtn: "Home", gameTitle: "SPEED CLICKER", gameSubtitle: "How fast are your fingers?",
        nicknameLabel: "PLAYER NAME", leaderboardTitle: "LEADERBOARD",
        instructionShort: "Click the red button/index finger logo button as much as possible in 10 seconds!",
        startBtn: "START GAME", tapHint: "TAP AS FAST AS YOU CAN!",
        timeUp: "TIME IS UP!", finalScoreLabel: "FINAL SCORE",
        playAgainBtn: "PLAY AGAIN", menuBtn: "BACK TO MENU",
        newRecord: "🔥 NEW RECORD! 🔥",
        resetBtn: "CLEAR",
        resetConfirm: "Clear all Leaderboard data?",
        noData: "No records yet",
        // Comparison Messages
        compWin: "Congrats! {0} leads by {1} points against {2} (Previous Top Score)",
        compLose: "Try again! {0} trails by {1} points behind {2} (Top Score)",
        compFirst: "Great! You are the first record holder!",
        compTie: "Amazing! {0}'s score is tied with {1} (Top Score)"
    }
};

// --- STATE VARIABLES ---
let currentLang = 'id';
let score = 0;
let timeLeft = 10;
let timerInterval;
let gameActive = false;

// Variabel untuk menyimpan status hasil game terakhir
let lastGameResult = null; 

// --- INIT & THEME SETUP ---
document.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard();
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark'); document.getElementById('themeIcon').textContent = '☀️';
    } else {
        document.documentElement.classList.remove('dark'); document.getElementById('themeIcon').textContent = '🌙';
    }
});

// --- TOGGLE FUNCTIONS ---
function toggleTheme() {
    const html = document.documentElement;
    if (html.classList.contains('dark')) { html.classList.remove('dark'); localStorage.theme = 'light'; document.getElementById('themeIcon').textContent = '🌙'; } 
    else { html.classList.add('dark'); localStorage.theme = 'dark'; document.getElementById('themeIcon').textContent = '☀️'; }
}

function toggleLanguage() {
    currentLang = currentLang === 'id' ? 'en' : 'id';
    document.getElementById('langDisplay').textContent = currentLang.toUpperCase();
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[currentLang][key]) el.textContent = i18n[currentLang][key];
    });

    loadLeaderboard();
    updateDynamicResultText();
}

// --- GAME LOGIC ---
function switchScreen(screenName) {
    ['screen-menu', 'screen-game', 'screen-result'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
        document.getElementById(id).classList.remove('fade-in'); 
    });
    const target = document.getElementById(screenName);
    target.classList.remove('hidden');
    void target.offsetWidth; 
    target.classList.add('fade-in');
}

function startGame() {
    const nameInput = document.getElementById('nicknameInput').value.trim();
    if(!nameInput) {
        alert(currentLang === 'id' ? "Mohon isi nama dulu!" : "Please enter your name!");
        return;
    }

    score = 0;
    timeLeft = 10;
    gameActive = true;
    lastGameResult = null; 
    
    document.getElementById('scoreDisplay').textContent = score;
    document.getElementById('timerDisplay').textContent = timeLeft;
    document.getElementById('newRecordMsg').textContent = "";
    document.getElementById('comparisonMsg').textContent = ""; 
    
    switchScreen('screen-game');

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timerDisplay').textContent = timeLeft;
        const timerEl = document.getElementById('timerDisplay');
        if(timeLeft <= 3) timerEl.classList.add('scale-125', 'text-red-600');
        else timerEl.classList.remove('scale-125', 'text-red-600');

        if(timeLeft <= 0) endGame();
    }, 1000);
}

function registerClick(e) {
    if(!gameActive) return;
    score++;
    document.getElementById('scoreDisplay').textContent = score;
    createParticle(e.clientX, e.clientY);
    const btn = document.getElementById('clickBtn');
    btn.classList.remove('active:scale-95'); 
    btn.style.transform = "scale(0.90)"; 
    setTimeout(() => { btn.style.transform = "scale(1)"; btn.classList.add('active:scale-95'); }, 50);
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
    
    const finalScoreEl = document.getElementById('finalScoreDisplay');
    if(finalScoreEl) finalScoreEl.textContent = score;
    
    const name = document.getElementById('nicknameInput').value || "Anonymous";

    // --- LOGIKA DATA ---
    const oldHighScores = JSON.parse(localStorage.getItem('clickerHighScores')) || [];
    const topScoreData = oldHighScores.length > 0 ? oldHighScores[0] : null;

    lastGameResult = {
        playerName: name,
        playerScore: score,
        isNewRecord: false,
        comparisonType: 'first',
        diff: 0,
        topName: ''
    };

    if (topScoreData) {
        lastGameResult.topName = topScoreData.name;
        lastGameResult.diff = Math.abs(score - topScoreData.score);

        if (score > topScoreData.score) lastGameResult.comparisonType = 'win';
        else if (score < topScoreData.score) lastGameResult.comparisonType = 'lose';
        else lastGameResult.comparisonType = 'tie';
    }

    const isRecord = saveScore(name, score);
    lastGameResult.isNewRecord = isRecord;

    updateDynamicResultText();
    switchScreen('screen-result');
}

// [FUNGSI YANG DIPERBAIKI: Menggunakan innerHTML + Styling]
function updateDynamicResultText() {
    if (!lastGameResult) return;

    // 1. Rekor Baru
    const recordMsg = document.getElementById('newRecordMsg');
    if (lastGameResult.isNewRecord) {
        recordMsg.textContent = i18n[currentLang].newRecord;
        recordMsg.classList.add('animate-bounce');
    } else {
        recordMsg.textContent = "";
        recordMsg.classList.remove('animate-bounce');
    }

    // 2. Pesan Perbandingan
    const msgEl = document.getElementById('comparisonMsg');
    let msgTemplate = "";
    const { comparisonType, playerName, diff, topName } = lastGameResult;

    if (comparisonType === 'first') {
        msgTemplate = i18n[currentLang].compFirst;
    } else if (comparisonType === 'win') {
        msgTemplate = i18n[currentLang].compWin;
    } else if (comparisonType === 'lose') {
        msgTemplate = i18n[currentLang].compLose;
    } else {
        msgTemplate = i18n[currentLang].compTie;
    }

    // === STYLING HTML ===
    // Nama Player (Indigo)
    const pTag = `<span class="font-bold text-indigo-600 dark:text-indigo-400">${playerName}</span>`;
    
    // Nama Top Score Lama (Amber/Emas)
    const tTag = `<span class="font-bold text-amber-500 dark:text-amber-400">${topName}</span>`;

    // Replace placeholder dengan variable yang sudah di-style
    const finalMsg = msgTemplate
        .replace("{0}", pTag)
        .replace("{1}", `<strong>${diff}</strong>`) // Angka diff ditebalkan juga
        .replace("{2}", tTag);

    // Gunakan innerHTML agar tag <span> terbaca
    msgEl.innerHTML = finalMsg;
}

function backToMenu() {
    loadLeaderboard();
    switchScreen('screen-menu');
}

// --- LEADERBOARD & STORAGE ---
function saveScore(name, newScore) {
    let highScores = JSON.parse(localStorage.getItem('clickerHighScores')) || [];
    highScores.push({ name: name, score: newScore });
    highScores.sort((a, b) => b.score - a.score);
    highScores = highScores.slice(0, 5);
    localStorage.setItem('clickerHighScores', JSON.stringify(highScores));
    return highScores.length > 0 && highScores[0].score === newScore && highScores[0].name === name;
}

function loadLeaderboard() {
    const list = document.getElementById('leaderboardList');
    const highScores = JSON.parse(localStorage.getItem('clickerHighScores')) || [];
    
    list.innerHTML = "";
    
    if (highScores.length === 0) {
        list.innerHTML = `<li class="text-center italic opacity-50 text-xs">${i18n[currentLang].noData}</li>`;
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
                <span class="truncate max-w-[120px]">${entry.name}</span>
            </span>
            <span class="font-mono font-bold">${entry.score}</span>
        `;
        list.appendChild(item);
    });
}

function resetLeaderboard() {
    if (confirm(i18n[currentLang].resetConfirm)) {
        localStorage.removeItem('clickerHighScores');
        loadLeaderboard();
    }
}