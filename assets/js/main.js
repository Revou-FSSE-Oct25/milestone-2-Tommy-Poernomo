const i18n = {
    id: {
        heroTitle: "Mainkan Keseruan.",
        heroDesc: "Platform game browser sederhana untuk mengisi waktu luangmu. Tanpa download, langsung main!",
        game1Title: "Speed Clicker", game1Desc: "Uji kecepatan jarimu dalam 10 detik!",
        game2Title: "Tebak Angka", game2Desc: "Asah instingmu menebak angka misterius.",
        game3Title: "Suit Jepang", game3Desc: "Batu, Gunting, Kertas klasik melawan CPU."
    },
    en: {
        heroTitle: "Play the Fun.",
        heroDesc: "Simple browser game platform to fill your free time. No download, just play!",
        game1Title: "Speed Clicker", game1Desc: "Test your finger speed in 10 seconds!",
        game2Title: "Number Guess", game2Desc: "Sharpen your instinct to guess the mystery number.",
        game3Title: "Rock Paper Scissors", game3Desc: "Classic RPS battle against the CPU."
    }
};

let currentLang = 'id';

document.addEventListener('DOMContentLoaded', () => {
    // Cek Tema
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
    if (html.classList.contains('dark')) {
        html.classList.remove('dark'); localStorage.theme = 'light'; document.getElementById('themeIcon').textContent = '🌙';
    } else {
        html.classList.add('dark'); localStorage.theme = 'dark'; document.getElementById('themeIcon').textContent = '☀️';
    }
}

function toggleLanguage() {
    currentLang = currentLang === 'id' ? 'en' : 'id';
    document.getElementById('langDisplay').textContent = currentLang.toUpperCase();
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[currentLang][key]) el.textContent = i18n[currentLang][key];
    });
}