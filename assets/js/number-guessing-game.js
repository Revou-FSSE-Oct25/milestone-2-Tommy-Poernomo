// --- DATA BAHASA (Localization) ---
const i18n = {
    id: {
        homeBtn: "Beranda",
        gameTitle: "TEBAK ANGKA",
        gameSubtitle: "Tebak angka antara 1 dan 100",
        inputLabel: "MASUKKAN TEBAKAN:",
        attemptsLabel: "SISA KESEMPATAN",
        historyLabel: "RIWAYAT TEBAKAN",
        playAgainBtn: "MAIN LAGI",
        // Pesan Feedback
        errEmpty: "Mohon masukkan angka!",
        errInvalid: "Mohon masukkan angka yang valid!",
        errRange: "Mohon masukkan angka antara 1 dan 100!",
        errDuplicate: "Kamu sudah menebak angka itu sebelumnya!",
        msgHigh: "📉 Terlalu TINGGI! Coba lebih rendah.",
        msgLow: "📈 Terlalu RENDAH! Coba lebih tinggi.",
        msgWinTitle: "🏆 KAMU MENANG!",
        msgWinDesc: "Kamu menebak angka",
        msgWinDesc2: "dalam",
        msgWinDesc3: "percobaan!",
        msgLoseTitle: "💔 GAME OVER",
        msgLoseDesc: "Angkanya adalah",
        msgLoseDesc2: "Jangan menyerah!"
    },
    en: {
        homeBtn: "Home",
        gameTitle: "NUMBER GUESSING",
        gameSubtitle: "Guess the number between 1 and 100",
        inputLabel: "ENTER YOUR GUESS:",
        attemptsLabel: "ATTEMPTS REMAINING",
        historyLabel: "GUESS HISTORY",
        playAgainBtn: "PLAY AGAIN",
        // Feedback Messages
        errEmpty: "Please enter a number!",
        errInvalid: "Please enter a valid number!",
        errRange: "Please enter a number between 1 and 100!",
        errDuplicate: "You already guessed that number!",
        msgHigh: "📉 Too high! Try a lower number.",
        msgLow: "📈 Too low! Try a higher number.",
        msgWinTitle: "🏆 YOU WON!",
        msgWinDesc: "You guessed the number",
        msgWinDesc2: "in",
        msgWinDesc3: "attempt(s)!",
        msgLoseTitle: "💔 GAME OVER",
        msgLoseDesc: "The number was",
        msgLoseDesc2: "Don't give up!"
    }
};

// --- STATE VARIABLES ---
let currentLang = 'id';
let targetNumber;
let attemptsLeft;
let gameActive;
let previousGuesses;

// --- DOM ELEMENTS ---
// (Menggunakan ID yang ada di HTML baru)
const guessInput = document.getElementById("guessInput");
const submitBtn = document.getElementById("submitBtn");
const feedback = document.getElementById("feedback");
const attemptsLeftSpan = document.getElementById("attemptsLeft");
const gameContainer = document.getElementById("gameContainer");
const gameOverContainer = document.getElementById("gameOverContainer");
const gameOverMessage = document.getElementById("gameOverMessage");
const resetBtn = document.getElementById("resetBtn");
const previousGuessesList = document.getElementById("guessList");
const previousGuessesContainer = document.getElementById("previousGuesses");

// --- THEME & INIT SETUP ---
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    // Dark Mode Check
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        document.getElementById('themeIcon').textContent = '☀️';
    } else {
        document.documentElement.classList.remove('dark');
        document.getElementById('themeIcon').textContent = '🌙';
    }
});

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
    
    // Update Text UI Statis
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[currentLang][key]) {
            el.textContent = i18n[currentLang][key];
        }
    });
}

// --- GAME LOGIC (MAINTAINED FROM PREVIOUS VERSION) ---

function initGame() {
    // Logic Asli: Random 1-100, 10 Nyawa
    targetNumber = Math.floor(Math.random() * 100) + 1;
    attemptsLeft = 10;
    gameActive = true;
    previousGuesses = [];

    // Reset UI
    guessInput.value = "";
    guessInput.disabled = false;
    submitBtn.disabled = false;
    attemptsLeftSpan.textContent = attemptsLeft;

    // Visibility
    gameContainer.classList.remove("hidden");
    gameOverContainer.classList.add("hidden");
    feedback.classList.add("hidden");
    previousGuessesContainer.classList.add("hidden");
    previousGuessesList.innerHTML = "";

    guessInput.focus();
    // console.log("Target:", targetNumber); // Debugging
}

function validateInput(input) {
    if (!input || input.trim() === "") {
        return { isValid: false, message: i18n[currentLang].errEmpty };
    }
    const number = Number(input);
    if (isNaN(number) || !Number.isInteger(number)) {
        return { isValid: false, message: i18n[currentLang].errInvalid };
    }
    if (number < 1 || number > 100) {
        return { isValid: false, message: i18n[currentLang].errRange };
    }
    if (previousGuesses.includes(number)) {
        return { isValid: false, message: i18n[currentLang].errDuplicate };
    }
    return { isValid: true, number: number };
}

function showFeedback(message, type = "info") {
    feedback.textContent = message;
    
    // Reset Kelas Warna (Support Dark Mode)
    feedback.className = "p-4 rounded-xl text-center font-bold text-sm transition-all duration-300 shadow-sm mb-4 border";

    // Logic Warna sesuai "Settingan Game Sebelumnya" tapi adaptif tema
    switch (type) {
        case "success":
            feedback.classList.add("bg-green-100", "text-green-800", "border-green-200", "dark:bg-green-900/50", "dark:text-green-200", "dark:border-green-800");
            break;
        case "error":
            feedback.classList.add("bg-red-100", "text-red-800", "border-red-200", "dark:bg-red-900/50", "dark:text-red-200", "dark:border-red-800");
            break;
        case "high":
            feedback.classList.add("bg-yellow-100", "text-yellow-800", "border-yellow-200", "dark:bg-yellow-900/50", "dark:text-yellow-200", "dark:border-yellow-800");
            break;
        case "low":
            feedback.classList.add("bg-blue-100", "text-blue-800", "border-blue-200", "dark:bg-blue-900/50", "dark:text-blue-200", "dark:border-blue-800");
            break;
        default:
            feedback.classList.add("bg-slate-100", "text-slate-800", "dark:bg-slate-700", "dark:text-slate-200");
    }
    
    feedback.classList.remove("hidden");
}

function addToPreviousGuesses(guess) {
    previousGuesses.push(guess);

    const guessSpan = document.createElement("span");
    guessSpan.textContent = guess;

    // Logic Pewarnaan History (Merah = Tinggi, Biru = Rendah) - Dipertahankan
    if (guess > targetNumber) {
        // High = Merah
        guessSpan.className = "px-3 py-1 bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800 rounded-lg text-sm font-bold shadow-sm";
        guessSpan.title = "Too High"; 
    } else if (guess < targetNumber) {
        // Low = Biru
        guessSpan.className = "px-3 py-1 bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 rounded-lg text-sm font-bold shadow-sm";
        guessSpan.title = "Too Low"; 
    } else {
        // Benar = Hijau
        guessSpan.className = "px-3 py-1 bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 rounded-lg text-sm font-bold shadow-sm";
    }

    previousGuessesList.appendChild(guessSpan);
    previousGuessesContainer.classList.remove("hidden");
}

function processGuess(guess) {
    addToPreviousGuesses(guess);
    attemptsLeft--;
    attemptsLeftSpan.textContent = attemptsLeft;
    
    guessInput.value = "";
    guessInput.focus();

    // Win Condition
    if (guess === targetNumber) {
        showFeedback("🎉 " + i18n[currentLang].msgWinTitle, "success");
        endGame(true);
        return;
    }

    // Lose Condition
    if (attemptsLeft === 0) {
        showFeedback(i18n[currentLang].msgLoseTitle, "error");
        endGame(false);
        return;
    }

    // Hint Logic (High/Low)
    if (guess > targetNumber) {
        showFeedback(i18n[currentLang].msgHigh, "high");
    } else {
        showFeedback(i18n[currentLang].msgLow, "low");
    }
}

function endGame(won) {
    gameActive = false;
    guessInput.disabled = true;
    submitBtn.disabled = true;

    gameContainer.classList.add("hidden");
    gameOverContainer.classList.remove("hidden");
    gameOverContainer.classList.add("flex"); // Ensure flex display

    const attemptsUsed = 10 - attemptsLeft;
    
    if (won) {
        gameOverMessage.innerHTML = `
            <h2 class="text-3xl font-black text-green-600 dark:text-green-400 mb-2">${i18n[currentLang].msgWinTitle}</h2>
            <p class="text-slate-600 dark:text-slate-300">
                ${i18n[currentLang].msgWinDesc} <strong class="text-indigo-600 dark:text-indigo-400 text-xl">${targetNumber}</strong>
                <br>${i18n[currentLang].msgWinDesc2} <strong>${attemptsUsed}</strong> ${i18n[currentLang].msgWinDesc3}
            </p>
        `;
    } else {
        gameOverMessage.innerHTML = `
            <h2 class="text-3xl font-black text-red-600 dark:text-red-400 mb-2">${i18n[currentLang].msgLoseTitle}</h2>
            <p class="text-slate-600 dark:text-slate-300">
                ${i18n[currentLang].msgLoseDesc} <strong class="text-indigo-600 dark:text-indigo-400 text-xl">${targetNumber}</strong>.
                <br>${i18n[currentLang].msgLoseDesc2}
            </p>
        `;
    }
}

function handleSubmit() {
    if (!gameActive) return;
    const userInput = guessInput.value;
    const validation = validateInput(userInput);

    if (!validation.isValid) {
        showFeedback(validation.message, "error");
        guessInput.focus();
        return;
    }
    processGuess(validation.number);
}

// --- EVENT LISTENERS ---
submitBtn.addEventListener("click", handleSubmit);
guessInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") handleSubmit();
});
resetBtn.addEventListener("click", initGame);