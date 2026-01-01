// --- LOCALIZATION DATA ---
const i18n = {
    id: {
        homeBtn: "Beranda",
        gameTitle: "SUIT JEPANG",
        gameSubtitle: "Rock • Paper • Scissors",
        chooseWeapon: "Pilih Senjatamu!",
        // Hasil Game
        win: "🎉 KAMU MENANG!",
        lose: "💀 KAMU KALAH!",
        draw: "⚖️ SERI!",
        // Nama Senjata
        rock: "BATU",
        paper: "KERTAS",
        scissors: "GUNTING",
        // Bagian History
        historyTitle: "RIWAYAT PERTANDINGAN",
        clearBtn: "HAPUS",
        noHistory: "Belum ada pertandingan.",
        resWin: "Menang",
        resLose: "Kalah",
        resDraw: "Seri"
    },
    en: {
        homeBtn: "Home",
        gameTitle: "R P S",
        gameSubtitle: "Rock • Paper • Scissors",
        chooseWeapon: "Choose Your Weapon!",
        // Game Results
        win: "🎉 YOU WIN!",
        lose: "💀 YOU LOSE!",
        draw: "⚖️ DRAW!",
        // Weapon Names
        rock: "ROCK",
        paper: "PAPER",
        scissors: "SCISSORS",
        // History Section
        historyTitle: "MATCH HISTORY",
        clearBtn: "CLEAR",
        noHistory: "No matches yet.",
        resWin: "Win",
        resLose: "Lose",
        resDraw: "Draw"
    }
};

// --- STATE VARIABLES ---
let currentLang = 'id';
const icons = { rock: '✊', paper: '✋', scissors: '✌️' };

// Ambil history dari LocalStorage saat awal load (agar tidak hilang saat refresh)
let gameHistory = JSON.parse(localStorage.getItem('rpsHistory')) || [];

// --- INIT & SETUP ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Cek Dark Mode
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        document.getElementById('themeIcon').textContent = '☀️';
    } else {
        document.documentElement.classList.remove('dark');
        document.getElementById('themeIcon').textContent = '🌙';
    }

    // 2. Load History Awal
    updateHistoryUI();
});

// --- TOGGLE THEME ---
function toggleTheme() {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        localStorage.theme = 'light';
        document.getElementById('themeIcon').textContent = '🌙';
    } else {
        html.classList.add('dark');
        localStorage.theme = 'dark';
        document.getElementById('themeIcon').textContent = '☀️';
    }
}

// --- TOGGLE LANGUAGE ---
function toggleLanguage() {
    currentLang = currentLang === 'id' ? 'en' : 'id';
    document.getElementById('langDisplay').textContent = currentLang.toUpperCase();
    
    // Update Teks Statis di HTML
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[currentLang][key]) {
            el.textContent = i18n[currentLang][key];
        }
    });

    // Update Teks Dinamis (History List) agar ikut berubah bahasa
    updateHistoryUI();
}

// --- GAME LOGIC ---
function play(playerChoice) {
    const choices = ['rock', 'paper', 'scissors'];
    
    // Animasi Icon Sedikit (Feedback Visual)
    const pIcon = document.getElementById('playerIcon');
    const cIcon = document.getElementById('cpuIcon');
    pIcon.style.transform = "scale(0.8)";
    cIcon.style.transform = "scale(0.8)";
    
    setTimeout(() => { 
        pIcon.style.transform = "scale(1)"; 
        cIcon.style.transform = "scale(1)"; 
    }, 150);

    // Random CPU Choice
    const cpuChoice = choices[Math.floor(Math.random() * 3)];
    
    // Tampilkan Icon
    pIcon.textContent = icons[playerChoice];
    cIcon.textContent = icons[cpuChoice];

    // Tentukan Pemenang
    let resultKey = ''; // 'win', 'lose', 'draw'

    if (playerChoice === cpuChoice) {
        resultKey = 'draw';
    } else if (
        (playerChoice === 'rock' && cpuChoice === 'scissors') ||
        (playerChoice === 'paper' && cpuChoice === 'rock') ||
        (playerChoice === 'scissors' && cpuChoice === 'paper')
    ) {
        resultKey = 'win';
    } else {
        resultKey = 'lose';
    }

    // Tampilkan Hasil Utama (Teks Besar)
    const resultBox = document.querySelector('#resultBox p');
    resultBox.textContent = i18n[currentLang][resultKey];

    // Ganti Warna Hasil
    resultBox.className = "text-2xl font-black fade-in transition-colors duration-300";
    if (resultKey === 'win') resultBox.classList.add('text-green-500');
    else if (resultKey === 'lose') resultBox.classList.add('text-red-500');
    else resultBox.classList.add('text-yellow-500');

    // Reset animasi fade-in agar bisa diputar lagi nanti
    setTimeout(() => { resultBox.classList.remove('fade-in'); }, 500);

    // Simpan ke History
    addToHistory(playerChoice, cpuChoice, resultKey);
}

// --- HISTORY LOGIC ---

function addToHistory(pChoice, cChoice, resultKey) {
    // Masukkan data baru ke ATAS array (unshift)
    gameHistory.unshift({
        p: pChoice, // Pilihan Player
        c: cChoice, // Pilihan CPU
        r: resultKey // Hasil ('win'/'lose'/'draw')
    });

    // Batasi histori max 20 item agar tidak terlalu panjang
    if(gameHistory.length > 20) gameHistory.pop();

    // SIMPAN KE LOCALSTORAGE (PENTING)
    localStorage.setItem('rpsHistory', JSON.stringify(gameHistory));

    // Update Tampilan
    updateHistoryUI();
}

function updateHistoryUI() {
    const list = document.getElementById('historyList');
    
    // Cek jika elemen list ada (mencegah error)
    if (!list) return;

    list.innerHTML = ""; // Bersihkan list lama

    if (gameHistory.length === 0) {
        list.innerHTML = `<p class="text-center text-xs text-slate-400 italic mt-4">${i18n[currentLang].noHistory}</p>`;
        return;
    }

    // Loop data history untuk membuat elemen HTML
    gameHistory.forEach((item, index) => {
        // Tentukan styling berdasarkan hasil
        let bgClass = "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600"; 
        let resultTextKey = "resDraw";

        if (item.r === 'win') {
            bgClass = "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800";
            resultTextKey = "resWin";
        } else if (item.r === 'lose') {
            bgClass = "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800";
            resultTextKey = "resLose";
        }

        // Buat elemen baris history
        const row = document.createElement('div');
        // Tambahkan animasi fade-in hanya untuk item terbaru (index 0)
        const animClass = index === 0 ? "fade-in" : "";
        
        row.className = `flex justify-between items-center p-3 rounded-lg text-sm border ${bgClass} ${animClass} mb-2`;
        row.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="flex flex-col items-center">
                    <span class="text-xl leading-none">${icons[item.p]}</span>
                    <span class="text-[10px] font-bold opacity-60">YOU</span>
                </div>
                <span class="text-xs font-bold opacity-40">VS</span>
                <div class="flex flex-col items-center">
                    <span class="text-xl leading-none">${icons[item.c]}</span>
                    <span class="text-[10px] font-bold opacity-60">CPU</span>
                </div>
            </div>
            <span class="font-bold uppercase text-xs tracking-wider border px-2 py-1 rounded bg-white/20">
                ${i18n[currentLang][resultTextKey]}
            </span>
        `;
        list.appendChild(row);
    });
}

function clearHistory() {
    gameHistory = [];
    localStorage.removeItem('rpsHistory'); // Hapus dari memori browser
    updateHistoryUI(); // Update tampilan jadi kosong
}