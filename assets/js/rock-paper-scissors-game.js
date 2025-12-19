
        // --- LOGIKA UTAMA ---
        function determineWinner(playerChoice, computerChoice) {
            // Logika menentukan pemenang
            if (playerChoice === computerChoice) {
                return "Seri! (It's a tie!)";
            }
            if (
                (playerChoice === "rock" && computerChoice === "scissors") ||
                (playerChoice === "paper" && computerChoice === "rock") ||
                (playerChoice === "scissors" && computerChoice === "paper")
            ) {
                return "Kamu Menang! (You win!)";
            }
            return "Komputer Menang! (Computer wins!)";
        }

        // --- INTERAKSI UI ---
        function startGame() {
            // 1. Input Nama pemain
            let playerName = prompt("Ketik nama Anda:", "Player 1");
            if (!playerName) playerName = "Player 1"; // Default jika kosong

            // 2. Input Pilihan
            let inputRaw = prompt(`Halo ${playerName}! \nSilakan ketik pilihanmu:\n(Batu / Gunting / Kertas)`);
            
            if (!inputRaw) return; // Batal jika cancel

            // Mapping Bahasa Indonesia ke Inggris untuk logic
            const mapInput = {
                'batu': 'rock', 'rock': 'rock',
                'kertas': 'paper', 'paper': 'paper',
                'gunting': 'scissors', 'scissors': 'scissors'
            };

            const playerChoice = mapInput[inputRaw.toLowerCase()];

            // Validasi Input
            if (!playerChoice) {
                alert("Input tidak valid! Silakan ketik: Batu, Gunting, atau Kertas.");
                return;
            }

            // 3. Logika Komputer (Random)
            const choices = ["rock", "paper", "scissors"];
            const computerChoice = choices[Math.floor(Math.random() * 3)];

            // 4. Tentukan Pemenang
            const resultMessage = determineWinner(playerChoice, computerChoice);

            // 5. Update UI
            updateUI(playerName, playerChoice, computerChoice, resultMessage);
        }

        function updateUI(name, pChoice, cChoice, result) {
            // Mapping icon emoji
            const icons = { 'rock': '✊', 'paper': '✋', 'scissors': '✌️' };

            // Update Nama
            document.getElementById('playerNameDisplay').textContent = name;

            // Update Icon & Text Player
            document.getElementById('playerChoiceIcon').textContent = icons[pChoice];
            document.getElementById('playerChoiceText').textContent = pChoice.toUpperCase();

            // Update Icon & Text Komputer
            document.getElementById('computerChoiceIcon').textContent = icons[cChoice];
            document.getElementById('computerChoiceText').textContent = cChoice.toUpperCase();

            // Tampilkan Hasil
            const resultDiv = document.getElementById('resultArea');
            const resultText = document.getElementById('resultText');
            
            resultDiv.classList.remove('hidden');
            
            // Ubah warna text berdasarkan hasil
            if (result.includes("You win")) {
                resultText.className = "text-xl font-bold text-green-400";
            } else if (result.includes("Computer wins")) {
                resultText.className = "text-xl font-bold text-red-400";
            } else {
                resultText.className = "text-xl font-bold text-yellow-400";
            }
            
            resultText.textContent = result;
        }