// --- LOCALIZATION DATA ---
const i18n = {
    id: {
        homeBtn: "Beranda", gameTitle: "SUIT JEPANG", gameSubtitle: "Batu • Kertas • Gunting",
        chooseWeapon: "Pilih Senjatamu!", scoreLabel: "SKOR", roundLabel: "RONDE",
        namePrompt: "Masukkan Nama Panggilan Anda:", defaultName: "Pemain 1",
        win: "🎉 KAMU MENANG!", lose: "💀 KAMU KALAH!", draw: "⚖️ SERI!",
        rock: "BATU", paper: "KERTAS", scissors: "GUNTING",
        historyTitle: "RIWAYAT", resetBtn: "Reset Game & Skor", noHistory: "Belum ada pertandingan.",
        resWin: "Menang", resLose: "Kalah", resDraw: "Seri",
        round: "Ronde", 
        // Label CPU tetap perlu jika ingin dilocalize, tapi Player pakai Nickname
        cpuLabel: "CPU",
        scoreLevel: "Skor Seimbang", leadMsg: "unggul", pointMsg: "poin"
    },
    en: {
        homeBtn: "Home", gameTitle: "R P S", gameSubtitle: "Rock • Paper • Scissors",
        chooseWeapon: "Choose Your Weapon!", scoreLabel: "SCORE", roundLabel: "ROUND",
        namePrompt: "Enter your Nickname:", defaultName: "Player 1",
        win: "🎉 YOU WIN!", lose: "💀 YOU LOSE!", draw: "⚖️ DRAW!",
        rock: "ROCK", paper: "PAPER", scissors: "SCISSORS",
        historyTitle: "HISTORY", resetBtn: "Reset Game & Score", noHistory: "No matches yet.",
        resWin: "Win", resLose: "Lose", resDraw: "Draw",
        round: "Round", 
        cpuLabel: "CPU",
        scoreLevel: "Scores Level", leadMsg: "leads by", pointMsg: "point(s)"
    }
};

// --- STATE VARIABLES ---
let currentLang = 'id';
const icons = { rock: '✊', paper: '✋', scissors: '✌️' };

let gameHistory = JSON.parse(localStorage.getItem('rpsHistory')) || [];
let scores = JSON.parse(localStorage.getItem('rpsScores')) || { player: 0, cpu: 0 };
let playerName = localStorage.getItem('rpsNickname');
let totalRounds = parseInt(localStorage.getItem('rpsTotalRounds')) || gameHistory.length || 0;

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark'); document.getElementById('themeIcon').textContent = '☀️';
    } else {
        document.documentElement.classList.remove('dark'); document.getElementById('themeIcon').textContent = '🌙';
    }

    if (!playerName) setTimeout(() => changeNickname(true), 100);
    else document.getElementById('playerNameDisplay').textContent = playerName;

    updateHistoryUI();
    updateScoreUI();
});

// --- FEATURES ---
function changeNickname(isFirstTime = false) {
    let input = prompt(i18n[currentLang].namePrompt, playerName || i18n[currentLang].defaultName);
    if (input && input.trim() !== "") {
        playerName = input.trim().substring(0, 10);
        localStorage.setItem('rpsNickname', playerName);
        document.getElementById('playerNameDisplay').textContent = playerName;
        // Update history UI juga supaya nama di list history berubah realtime
        updateHistoryUI(); 
        updateScoreUI();
    } else if (isFirstTime) {
        playerName = i18n[currentLang].defaultName;
        localStorage.setItem('rpsNickname', playerName);
        document.getElementById('playerNameDisplay').textContent = playerName;
    }
}

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
    updateHistoryUI();
    updateScoreUI();
}

// --- GAME LOGIC ---
function play(playerChoice) {
    const choices = ['rock', 'paper', 'scissors'];
    
    // Animation
    const pIcon = document.getElementById('playerIcon');
    const cIcon = document.getElementById('cpuIcon');
    pIcon.style.transform = "scale(0.8)"; cIcon.style.transform = "scale(0.8)";
    setTimeout(() => { pIcon.style.transform = "scale(1)"; cIcon.style.transform = "scale(1)"; }, 150);

    const cpuChoice = choices[Math.floor(Math.random() * 3)];
    pIcon.textContent = icons[playerChoice];
    cIcon.textContent = icons[cpuChoice];

    let resultKey = ''; 
    if (playerChoice === cpuChoice) {
        resultKey = 'draw';
    } else if (
        (playerChoice === 'rock' && cpuChoice === 'scissors') ||
        (playerChoice === 'paper' && cpuChoice === 'rock') ||
        (playerChoice === 'scissors' && cpuChoice === 'paper')
    ) {
        resultKey = 'win';
        scores.player++;
    } else {
        resultKey = 'lose';
        scores.cpu++;
    }

    totalRounds++;
    localStorage.setItem('rpsScores', JSON.stringify(scores));
    localStorage.setItem('rpsTotalRounds', totalRounds);
    
    addToHistory(playerChoice, cpuChoice, resultKey, totalRounds);
    updateScoreUI();

    const resultBox = document.querySelector('#resultBox p');
    resultBox.textContent = i18n[currentLang][resultKey];
    resultBox.className = "text-2xl font-black fade-in transition-colors duration-300";
    if (resultKey === 'win') resultBox.classList.add('text-green-500');
    else if (resultKey === 'lose') resultBox.classList.add('text-red-500');
    else resultBox.classList.add('text-yellow-500');

    setTimeout(() => { resultBox.classList.remove('fade-in'); }, 500);
}

// --- SCORE & DIFF LOGIC ---
function updateScoreUI() {
    document.getElementById('playerScoreDisplay').textContent = scores.player;
    document.getElementById('cpuScoreDisplay').textContent = scores.cpu;
    document.getElementById('roundDisplay').textContent = totalRounds;

    const diff = scores.player - scores.cpu;
    const diffEl = document.getElementById('scoreDiffDisplay');
    diffEl.className = "text-xs font-bold transition-all duration-300";

    if (diff === 0) {
        diffEl.textContent = i18n[currentLang].scoreLevel;
        diffEl.classList.add('text-slate-400', 'dark:text-slate-500');
    } else if (diff > 0) {
        diffEl.textContent = `${playerName} ${i18n[currentLang].leadMsg} ${diff} ${i18n[currentLang].pointMsg}`;
        diffEl.classList.add('text-indigo-500');
    } else {
        diffEl.textContent = `CPU ${i18n[currentLang].leadMsg} ${Math.abs(diff)} ${i18n[currentLang].pointMsg}`;
        diffEl.classList.add('text-red-500');
    }
}

// --- HISTORY LOGIC ---
function addToHistory(pChoice, cChoice, resultKey, roundNum) {
    gameHistory.unshift({ p: pChoice, c: cChoice, r: resultKey, round: roundNum });
    if(gameHistory.length > 20) gameHistory.pop();
    localStorage.setItem('rpsHistory', JSON.stringify(gameHistory));
    updateHistoryUI();
}

function updateHistoryUI() {
    const list = document.getElementById('historyList');
    if (!list) return;
    list.innerHTML = "";

    if (gameHistory.length === 0) {
        list.innerHTML = `<p class="text-center text-xs text-slate-400 italic mt-4">${i18n[currentLang].noHistory}</p>`;
        return;
    }

    gameHistory.forEach((item, index) => {
        let bgClass = "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600"; 
        let resultTextKey = "resDraw";

        if (item.r === 'win') {
            bgClass = "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800";
            resultTextKey = "resWin";
        } else if (item.r === 'lose') {
            bgClass = "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800";
            resultTextKey = "resLose";
        }

        const row = document.createElement('div');
        const animClass = index === 0 ? "fade-in" : "";
        
        row.className = `flex justify-between items-center p-3 rounded-lg text-sm border ${bgClass} ${animClass} mb-2 shadow-sm`;
        
        // MODIFIKASI: Menampilkan Nickname Player dan Label CPU
        row.innerHTML = `
            <div class="flex items-center gap-2 w-full">
                <div class="flex flex-col items-center justify-center min-w-[40px] border-r border-slate-300 dark:border-slate-600 pr-2 mr-1">
                    <span class="text-[9px] uppercase font-bold text-slate-400 leading-tight">${i18n[currentLang].round}</span>
                    <span class="text-lg font-mono font-black leading-none opacity-80">${item.round}</span>
                </div>

                <div class="flex flex-grow justify-center items-center gap-4">
                    <div class="flex flex-col items-center w-1/3">
                        <span class="text-[8px] font-bold uppercase text-indigo-500 mb-0.5 truncate max-w-[80px] text-center" title="${playerName}">${playerName}</span>
                        <span class="text-xl leading-none">${icons[item.p]}</span>
                    </div>
                    
                    <span class="text-[10px] font-bold opacity-40 mt-3">VS</span>
                    
                    <div class="flex flex-col items-center w-1/3">
                        <span class="text-[8px] font-bold uppercase text-red-500 mb-0.5">CPU</span>
                        <span class="text-xl leading-none">${icons[item.c]}</span>
                    </div>
                </div>

                <div class="min-w-[60px] text-right pl-2 border-l border-slate-300 dark:border-slate-600">
                    <span class="font-bold uppercase text-[10px] sm:text-xs tracking-wider block">
                        ${i18n[currentLang][resultTextKey]}
                    </span>
                </div>
            </div>
        `;
        list.appendChild(row);
    });
}

// --- RESET ---
function resetGame() {
    if(confirm(currentLang === 'id' ? "Hapus skor dan riwayat?" : "Reset score and history?")) {
        gameHistory = [];
        scores = { player: 0, cpu: 0 };
        totalRounds = 0;
        localStorage.removeItem('rpsHistory');
        localStorage.removeItem('rpsScores');
        localStorage.removeItem('rpsTotalRounds');
        
        updateHistoryUI();
        updateScoreUI();
        document.querySelector('#resultBox p').textContent = i18n[currentLang].chooseWeapon;
        document.querySelector('#resultBox p').className = "text-lg font-bold text-slate-400";
    }
}