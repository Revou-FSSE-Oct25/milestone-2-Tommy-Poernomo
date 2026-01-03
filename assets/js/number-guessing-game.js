// --- LOCALIZATION DATA ---
const i18n = {
    id: {
        homeBtn: "Beranda", gameTitle: "TEBAK ANGKA", gameSubtitle: "Tebak angka antara 1 dan 100",
        inputLabel: "MASUKKAN TEBAKAN:", attemptsLabel: "SISA KESEMPATAN",
        historyLabel: "RIWAYAT TEBAKAN (URUT)", playAgainBtn: "MAIN LAGI",
        leaderboardTitle: "PAPAN SKOR (SISA NYAWA)", resetDataBtn: "HAPUS DATA", noData: "Belum ada data",
        startBtn: "MULAI GAME", playerLabel: "Pemain:",
        namePrompt: "Masukkan Nama Anda:", defaultName: "Pemain",
        errEmpty: "Mohon masukkan angka!",
        errInvalid: "Mohon masukkan angka yang valid!",
        errRange: "Mohon masukkan angka antara 1 dan 100!",
        errDuplicate: "Kamu sudah menebak angka itu sebelumnya!",
        msgHigh: "📉 Terlalu TINGGI! Coba lebih rendah.",
        msgLow: "📈 Terlalu RENDAH! Coba lebih tinggi.",
        msgWinTitle: "🏆 {0} MENANG!",
        msgWinDesc: "Kamu menebak angka",
        msgWinDesc2: "dalam",
        msgWinDesc3: "percobaan! Sisa nyawa:",
        msgLoseTitle: "💔 {0} KALAH...",
        msgLoseDesc: "Angkanya adalah",
        msgLoseDesc2: "Jangan menyerah!",
        resetConfirm: "Hapus semua data skor?",
        livesWord: "Nyawa"
    },
    en: {
        homeBtn: "Home", gameTitle: "NUMBER GUESSING", gameSubtitle: "Guess the number between 1 and 100",
        inputLabel: "ENTER YOUR GUESS:", attemptsLabel: "ATTEMPTS REMAINING",
        historyLabel: "GUESS HISTORY (SORTED)", playAgainBtn: "PLAY AGAIN",
        leaderboardTitle: "LEADERBOARD (LIVES LEFT)", resetDataBtn: "CLEAR DATA", noData: "No records yet",
        startBtn: "START GAME", playerLabel: "Player:",
        namePrompt: "Enter your Name:", defaultName: "Player",
        errEmpty: "Please enter a number!",
        errInvalid: "Please enter a valid number!",
        errRange: "Please enter a number between 1 and 100!",
        errDuplicate: "You already guessed that number!",
        msgHigh: "📉 Too HIGH! Try a lower number.",
        msgLow: "📈 Too LOW! Try a higher number.",
        msgWinTitle: "🏆 {0} WON!",
        msgWinDesc: "You guessed the number",
        msgWinDesc2: "in",
        msgWinDesc3: "attempt(s)! Lives left:",
        msgLoseTitle: "💔 {0} LOST...",
        msgLoseDesc: "The number was",
        msgLoseDesc2: "Don't give up!",
        resetConfirm: "Clear all score data?",
        livesWord: "Lives"
    }
};

// --- STATE VARIABLES ---
let currentLang = 'id';
let targetNumber;
let attemptsLeft;
let gameActive = false;
let previousGuesses = []; 
let playerName = localStorage.getItem('guessNickname') || "";

// Feedback State
let lastFeedbackKey = null; 
let lastFeedbackType = null; 
let lastGameResult = null; 

// --- INIT & SETUP ---
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark'); document.getElementById('themeIcon').textContent = '☀️';
    } else {
        document.documentElement.classList.remove('dark'); document.getElementById('themeIcon').textContent = '🌙';
    }

    if (playerName) document.getElementById('nicknameInput').value = playerName;
    loadLeaderboard();
});

// --- FLOW MANAGEMENT ---
function startGameFlow() {
    const inputName = document.getElementById('nicknameInput').value.trim();
    playerName = inputName || i18n[currentLang].defaultName;
    localStorage.setItem('guessNickname', playerName);

    document.getElementById('playerDisplay').textContent = playerName;
    document.getElementById('setupScreen').classList.add('hidden');
    document.getElementById('playerDisplayArea').classList.remove('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    
    initGame();
}

// --- LANGUAGE & THEME ---
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

    document.getElementById('nicknameInput').placeholder = i18n[currentLang].defaultName;
    updateDynamicContent();
    loadLeaderboard(); 
}

function updateDynamicContent() {
    if (lastFeedbackKey && lastFeedbackType) {
        const newText = i18n[currentLang][lastFeedbackKey];
        renderFeedbackUI(newText, lastFeedbackType);
    }
    if (!gameActive && lastGameResult) {
        renderGameOverMessage(lastGameResult === 'win');
    }
}

// --- GAME LOGIC ---
function initGame() {
    targetNumber = Math.floor(Math.random() * 100) + 1;
    attemptsLeft = 10;
    gameActive = true;
    previousGuesses = [];
    lastFeedbackKey = null;
    lastFeedbackType = null;
    lastGameResult = null;

    document.getElementById("guessInput").value = "";
    document.getElementById("guessInput").disabled = false;
    document.getElementById("submitBtn").disabled = false;
    document.getElementById("attemptsLeft").textContent = attemptsLeft;

    document.getElementById("inputSection").classList.remove("hidden");
    document.getElementById("statsArea").classList.remove("hidden");
    document.getElementById("gameOverContainer").classList.add("hidden");
    document.getElementById("gameOverContainer").classList.remove("flex");
    document.getElementById("feedback").classList.add("hidden");
    document.getElementById("previousGuesses").classList.add("hidden");
    document.getElementById("guessList").innerHTML = "";

    document.getElementById("guessInput").focus();
}

function validateInput(input) {
    if (!input || input.trim() === "") return { isValid: false, key: 'errEmpty', type: 'error' };
    const number = Number(input);
    if (isNaN(number) || !Number.isInteger(number)) return { isValid: false, key: 'errInvalid', type: 'error' };
    if (number < 1 || number > 100) return { isValid: false, key: 'errRange', type: 'error' };
    if (previousGuesses.includes(number)) return { isValid: false, key: 'errDuplicate', type: 'error' };
    return { isValid: true, number: number };
}

// [PERBAIKAN] Menghapus mb-4 agar jarak diatur oleh gap-6 parent
function renderFeedbackUI(text, type) {
    const feedback = document.getElementById("feedback");
    feedback.textContent = text;
    // HAPUS 'mb-4' dari class list
    feedback.className = "p-4 rounded-xl text-center font-bold text-sm transition-all duration-300 shadow-sm border";

    switch (type) {
        case "success": feedback.classList.add("bg-green-100", "text-green-800", "border-green-200", "dark:bg-green-900/50", "dark:text-green-200", "dark:border-green-800"); break;
        case "error": feedback.classList.add("bg-red-100", "text-red-800", "border-red-200", "dark:bg-red-900/50", "dark:text-red-200", "dark:border-red-800"); break;
        case "high": feedback.classList.add("bg-yellow-100", "text-yellow-800", "border-yellow-200", "dark:bg-yellow-900/50", "dark:text-yellow-200", "dark:border-yellow-800"); break;
        case "low": feedback.classList.add("bg-blue-100", "text-blue-800", "border-blue-200", "dark:bg-blue-900/50", "dark:text-blue-200", "dark:border-blue-800"); break;
    }
    feedback.classList.remove("hidden");
}

function showFeedback(key, type) {
    lastFeedbackKey = key;
    lastFeedbackType = type;
    const text = i18n[currentLang][key];
    renderFeedbackUI(text, type);
}

function updatePreviousGuessesUI() {
    previousGuesses.sort((a, b) => a - b);
    const list = document.getElementById("guessList");
    list.innerHTML = ""; 

    previousGuesses.forEach(guess => {
        const guessSpan = document.createElement("span");
        guessSpan.textContent = guess;
        if (guess > targetNumber) guessSpan.className = "px-3 py-1 bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800 rounded-lg text-sm font-bold shadow-sm";
        else if (guess < targetNumber) guessSpan.className = "px-3 py-1 bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 rounded-lg text-sm font-bold shadow-sm";
        else guessSpan.className = "px-3 py-1 bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 rounded-lg text-sm font-bold shadow-sm";
        list.appendChild(guessSpan);
    });
    document.getElementById("previousGuesses").classList.remove("hidden");
}

function processGuess(guess) {
    previousGuesses.push(guess);
    updatePreviousGuessesUI();

    attemptsLeft--;
    document.getElementById("attemptsLeft").textContent = attemptsLeft;
    
    document.getElementById("guessInput").value = "";
    document.getElementById("guessInput").focus();

    if (guess === targetNumber) {
        endGame(true);
        return;
    }

    if (attemptsLeft === 0) {
        endGame(false);
        return;
    }

    if (guess > targetNumber) showFeedback("msgHigh", "high");
    else showFeedback("msgLow", "low");
}

// [PERBAIKAN] Menambahkan logika hide feedback saat game over
function endGame(won) {
    gameActive = false;
    lastGameResult = won ? 'win' : 'lose';

    document.getElementById("guessInput").disabled = true;
    document.getElementById("submitBtn").disabled = true;

    document.getElementById("inputSection").classList.add("hidden");
    document.getElementById("statsArea").classList.add("hidden");
    
    // HIDE FEEDBACK AGAR TIDAK MUNCUL DI GAME OVER SCREEN
    document.getElementById("feedback").classList.add("hidden");
    
    const gameOverContainer = document.getElementById("gameOverContainer");
    gameOverContainer.classList.remove("hidden");
    gameOverContainer.classList.add("flex");

    renderGameOverMessage(won);

    if (won) {
        saveScore(attemptsLeft);
    } 
}

function renderGameOverMessage(won) {
    const msgDiv = document.getElementById("gameOverMessage");
    const attemptsUsed = 10 - attemptsLeft;
    const nameStyled = `<span class="text-indigo-600 dark:text-indigo-400 font-black uppercase">${playerName}</span>`;

    if (won) {
        const title = i18n[currentLang].msgWinTitle.replace("{0}", nameStyled);
        msgDiv.innerHTML = `
            <h2 class="text-3xl font-black text-green-600 dark:text-green-400 mb-2">${title}</h2>
            <p class="text-slate-600 dark:text-slate-300">
                ${i18n[currentLang].msgWinDesc} <strong class="text-purple-600 dark:text-purple-400 text-xl">${targetNumber}</strong>
                <br>${i18n[currentLang].msgWinDesc2} <strong>${attemptsUsed}</strong> ${i18n[currentLang].msgWinDesc3} <strong>${attemptsLeft}</strong>
            </p>
        `;
    } else {
        const title = i18n[currentLang].msgLoseTitle.replace("{0}", nameStyled);
        msgDiv.innerHTML = `
            <h2 class="text-3xl font-black text-red-600 dark:text-red-400 mb-2">${title}</h2>
            <p class="text-slate-600 dark:text-slate-300">
                ${i18n[currentLang].msgLoseDesc} <strong class="text-purple-600 dark:text-purple-400 text-xl">${targetNumber}</strong>.
                <br>${i18n[currentLang].msgLoseDesc2}
            </p>
        `;
    }
}

function handleSubmit() {
    if (!gameActive) return;
    const input = document.getElementById("guessInput");
    const validation = validateInput(input.value);

    if (!validation.isValid) {
        showFeedback(validation.key, validation.type);
        input.focus();
        return;
    }
    processGuess(validation.number);
}

// --- LEADERBOARD & STORAGE ---
function saveScore(score) {
    let scores = JSON.parse(localStorage.getItem('guessScores')) || [];
    scores.push({ name: playerName, score: score });
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 5); 
    localStorage.setItem('guessScores', JSON.stringify(scores));
    loadLeaderboard();
}

function loadLeaderboard() {
    const list = document.getElementById('leaderboardList');
    const scores = JSON.parse(localStorage.getItem('guessScores')) || [];
    
    list.innerHTML = "";
    
    if (scores.length === 0) {
        list.innerHTML = `<li class="text-center italic text-xs text-slate-400" data-i18n="noData">${i18n[currentLang].noData}</li>`;
        return;
    }

    scores.forEach((entry, index) => {
        const isTop = index === 0 ? 'text-yellow-600 font-bold dark:text-yellow-400' : 'text-slate-600 dark:text-slate-300';
        const icon = index === 0 ? '👑' : `#${index + 1}`;
        const livesText = i18n[currentLang].livesWord; 
        
        const item = document.createElement('li');
        item.className = `flex justify-between items-center bg-slate-50 dark:bg-slate-700/50 p-2 rounded border border-slate-200 dark:border-slate-600 ${isTop}`;
        item.innerHTML = `
            <span class="flex items-center gap-2">
                <span class="text-xs opacity-70 w-6">${icon}</span>
                <span class="truncate max-w-[120px] font-semibold">${entry.name}</span>
            </span>
            <span class="font-mono font-bold text-indigo-600 dark:text-indigo-400">${entry.score} <span class="text-[9px] text-slate-400 uppercase font-normal">${livesText}</span></span>
        `;
        list.appendChild(item);
    });
}

function resetData() {
    if (confirm(i18n[currentLang].resetConfirm)) {
        localStorage.removeItem('guessScores');
        loadLeaderboard();
    }
}

// --- EVENT LISTENERS ---
document.getElementById("submitBtn").addEventListener("click", handleSubmit);
document.getElementById("guessInput").addEventListener("keydown", function(event) {
    if (event.key === "Enter") handleSubmit();
});
document.getElementById("resetBtn").addEventListener("click", initGame);