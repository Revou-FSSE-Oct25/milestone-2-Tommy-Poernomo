// --- DATA BAHASA (Localization) ---
const i18n = {
    id: {
        homeBtn: "Beranda",
        gameTitle: "SPEED CLICKER",
        gameSubtitle: "Seberapa cepat jarimu?",
        nicknameLabel: "NAMA PEMAIN",
        leaderboardTitle: "PAPAN SKOR TERTINGGI",
        // Instruksi spesifik yang diminta
        instructionShort: "Klik tombol merah/tombol berlogo telunjuk tangan sebanyak mungkin dalam 10 detik!",
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
        gameSubtitle: "How fast are your fingers?",
        nicknameLabel: "PLAYER NAME",
        leaderboardTitle: "LEADERBOARD",
        instructionShort: "Click the red button/index finger logo button as much as possible in 10 seconds!",
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
    
    // Logic Dark Mode
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        document.getElementById('themeIcon').textContent = '☀️';
    } else {
        document.documentElement.classList.remove('dark');
        document.getElementById('themeIcon').textContent = '🌙';
    }
});

// --- TOGGLE FUNCTIONS ---
function toggleTheme() {
    const html = document.documentElement;
    const icon = document.getElementById('themeIcon');
    if (html.classList.contains('dark')) {
        html.classList.remove('dark'); localStorage.theme = 'light'; icon.textContent = '🌙';
    } else {
        html.classList.add('dark'); localStorage.theme = 'dark'; icon.textContent = '☀️';
    }
}

function toggleLanguage() {
    currentLang = currentLang === 'id' ? 'en' : 'id';
    document.getElementById('langDisplay').textContent = currentLang.toUpperCase();
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[currentLang][key]) {
            el.textContent = i18n[currentLang][key];
        }
    });
    loadLeaderboard();
}

// --- GAME LOGIC ---

function switchScreen(screenName) {
    // Sembunyikan semua layar
    ['screen-menu', 'screen-game', 'screen-result'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
        document.getElementById(id).classList.remove('fade-in'); // Reset animasi
    });
    
    // Tampilkan layar target
    const target = document.getElementById(screenName);
    target.classList.remove('hidden');
    
    // Trigger Reflow untuk restart animasi CSS
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
    
    // Update UI Awal
    document.getElementById('scoreDisplay').textContent = score;
    document.getElementById('timerDisplay').textContent = timeLeft;
    document.getElementById('newRecordMsg').textContent = "";
    
    switchScreen('screen-game');

    // Mulai Timer
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timerDisplay').textContent = timeLeft;
        
        // Efek visual jika waktu mau habis (<= 3 detik)
        const timerEl = document.getElementById('timerDisplay');
        if(timeLeft <= 3) {
            timerEl.classList.add('scale-125', 'text-red-600');
        } else {
            timerEl.classList.remove('scale-125', 'text-red-600');
        }

        if(timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function registerClick(e) {
    if(!gameActive) return;

    // 1. Tambah Skor
    score++;
    document.getElementById('scoreDisplay').textContent = score;

    // 2. Efek Partikel (+1 Melayang)
    // Menggunakan clientX/Y dari event mouse/touch
    createParticle(e.clientX, e.clientY);
    
    // 3. Efek Visual Tombol (Reset animasi scale)
    const btn = document.getElementById('clickBtn');
    btn.classList.remove('active:scale-95'); // Hapus class tailwind sementara
    btn.style.transform = "scale(0.90)"; // Manual set scale kecil
    
    setTimeout(() => {
        btn.style.transform = "scale(1)"; // Kembalikan ke normal
        btn.classList.add('active:scale-95'); // Kembalikan class tailwind
    }, 50);
}

function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.classList.add('click-particle'); // Pastikan CSS .click-particle ada di style.css
    particle.textContent = "+1";
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    document.body.appendChild(particle);

    setTimeout(() => particle.remove(), 800);
}

function endGame() {
    clearInterval(timerInterval);
    gameActive = false;
    
    // 1. UPDATE SKOR AKHIR SEBELUM GANTI LAYAR
    const finalScoreEl = document.getElementById('finalScoreDisplay');
    if(finalScoreEl) {
        finalScoreEl.textContent = score;
    }
    
    // 2. Simpan High Score
    const name = document.getElementById('nicknameInput').value || "Anonymous";
    const isNewRecord = saveScore(name, score);
    
    const recordMsg = document.getElementById('newRecordMsg');
    if(isNewRecord) {
        recordMsg.textContent = i18n[currentLang].newRecord;
        recordMsg.classList.add('animate-bounce');
    } else {
        recordMsg.textContent = "";
        recordMsg.classList.remove('animate-bounce');
    }

    // 3. Pindah Layar
    switchScreen('screen-result');
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
    highScores = highScores.slice(0, 5); // Keep Top 5
    localStorage.setItem('clickerHighScores', JSON.stringify(highScores));

    // Cek apakah skor ini adalah yang tertinggi saat ini
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