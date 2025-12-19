// Game state variables
let targetNumber;
let attemptsLeft;
let gameActive;
let previousGuesses;

// DOM elements
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

/**
 * Initialize a new game
 * Sets up all game variables and resets the UI
 */
function initGame() {
  // Generate random number between 1 and 100
  targetNumber = Math.floor(Math.random() * 100) + 1;
  attemptsLeft = 10;
  gameActive = true;
  previousGuesses = [];

  // Reset UI elements
  guessInput.value = "";
  guessInput.disabled = false;
  submitBtn.disabled = false;
  attemptsLeftSpan.textContent = attemptsLeft;

  // Hide/show appropriate containers
  gameContainer.classList.remove("hidden");
  gameOverContainer.classList.add("hidden");
  feedback.classList.add("hidden");
  previousGuessesContainer.classList.add("hidden");

  // Clear previous guesses display
  previousGuessesList.innerHTML = "";

  // Focus on input for better UX
  guessInput.focus();

  // For debugging (Anda bisa menghapus ini saat production)
  //console.log("New game started! Target number:", targetNumber); 
}

/**
 * Validate user input
 * @param {string} input - The user's input
 * @returns {object} - Validation result with isValid boolean and message
 */
function validateInput(input) {
  // 1. Cek apakah kosong
  if (!input || input.trim() === "") {
    return { isValid: false, message: "Please enter a number!" };
  }

  // Konversi ke angka
  const number = Number(input);

  // 2. Cek apakah input adalah angka valid (bukan huruf/simbol) dan integer
  if (isNaN(number) || !Number.isInteger(number)) {
    return { isValid: false, message: "Please enter a valid number!" };
  }

  // 3. Cek range (1-100)
  if (number < 1 || number > 100) {
    return { isValid: false, message: "Please enter a number between 1 and 100!" };
  }

  // 4. Cek duplikat (apakah sudah pernah ditebak?)
  if (previousGuesses.includes(number)) {
    return { isValid: false, message: "You already guessed that number!" };
  }

  // Jika lolos semua validasi
  return { isValid: true, number: number };
}

/**
 * Display feedback message to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of message (success, error, info, high, low)
 */
function showFeedback(message, type = "info") {
  feedback.textContent = message;
  
  // Reset classes first
  feedback.classList.remove(
    "hidden",
    "bg-green-100", "text-green-800",
    "bg-red-100", "text-red-800",
    "bg-blue-100", "text-blue-800",
    "bg-yellow-100", "text-yellow-800"
  );

  // Apply appropriate styling based on message type
  switch (type) {
    case "success":
      feedback.classList.add("bg-green-100", "text-green-800");
      break;
    case "error":
      feedback.classList.add("bg-red-100", "text-red-800");
      break;
    case "high":
      feedback.classList.add("bg-yellow-100", "text-yellow-800");
      break;
    case "low":
      feedback.classList.add("bg-blue-100", "text-blue-800");
      break;
    default:
      feedback.classList.add("bg-blue-100", "text-blue-800");
  }
}

/**
 * Add a guess to the previous guesses display
 * @param {number} guess - The number that was guessed
 */
function addToPreviousGuesses(guess) {
  previousGuesses.push(guess);

  // Create a span element for the guess
  const guessSpan = document.createElement("span");
  guessSpan.textContent = guess;

  // Logika pewarnaan berdasarkan perbandingan dengan targetNumber
  if (guess > targetNumber) {
    // Jika tebakan terlalu TINGGI -> Warna MERAH
    guessSpan.className = "px-2 py-1 bg-red-100 text-red-700 border border-red-200 rounded text-sm font-bold";
    guessSpan.title = "Too High"; // Tooltip saat mouse hover
  } else if (guess < targetNumber) {
    // Jika tebakan terlalu RENDAH -> Warna BIRU
    guessSpan.className = "px-2 py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded text-sm font-bold";
    guessSpan.title = "Too Low"; // Tooltip saat mouse hover
  } else {
    // Jika tebakan BENAR -> Warna HIJAU
    guessSpan.className = "px-2 py-1 bg-green-100 text-green-700 border border-green-200 rounded text-sm font-bold";
  }

  previousGuessesList.appendChild(guessSpan);
  previousGuessesContainer.classList.remove("hidden");
}

/**
 * Process the user's guess
 * @param {number} guess - The user's guess
 */
function processGuess(guess) {
  // 1. Rekam tebakan dan kurangi kesempatan
  addToPreviousGuesses(guess);
  attemptsLeft--;
  attemptsLeftSpan.textContent = attemptsLeft;
  
  // Reset input field agar siap untuk tebakan berikutnya
  guessInput.value = "";
  guessInput.focus();

  // 2. Cek Menang (Win Condition)
  if (guess === targetNumber) {
    showFeedback("🎉 Congratulations! You guessed it!", "success");
    endGame(true);
    return;
  }

  // 3. Cek Kalah (Lose Condition - Kesempatan habis)
  if (attemptsLeft === 0) {
    showFeedback(`😞 Game Over! The number was ${targetNumber}.`, "error");
    endGame(false);
    return;
  }

  // 4. Berikan Hint (High/Low) jika permainan belum selesai
  if (guess > targetNumber) {
    showFeedback("📉 Too high! Try a lower number.", "high");
  } else {
    showFeedback("📈 Too low! Try a higher number.", "low");
  }
}

/**
 * End the current game
 * @param {boolean} won - Whether the player won or lost
 */
function endGame(won) {
  gameActive = false;
  guessInput.disabled = true;
  submitBtn.disabled = true;

  // Show game over container
  gameContainer.classList.add("hidden");
  gameOverContainer.classList.remove("hidden");

  // Set appropriate game over message
  if (won) {
    const attemptsUsed = 10 - attemptsLeft;
    gameOverMessage.innerHTML = `
            <h2 class="text-2xl font-bold text-green-600 mb-2">🏆 You Won!</h2>
            <p class="text-gray-700">You guessed the number <strong>${targetNumber}</strong> in <strong>${attemptsUsed}</strong> attempt${
      attemptsUsed === 1 ? "" : "s"
    }!</p>
        `;
  } else {
    gameOverMessage.innerHTML = `
            <h2 class="text-2xl font-bold text-red-600 mb-2">💔 Game Over</h2>
            <p class="text-gray-700">The number was <strong>${targetNumber}</strong>. Don't give up!</p>
        `;
  }
}

/**
 * Handle the submit button click or Enter key press
 */
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

// --- Event Listeners ---

// 1. Listener untuk tombol Submit
submitBtn.addEventListener("click", handleSubmit);

// 2. Listener untuk tombol Enter pada keyboard
guessInput.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    handleSubmit();
  }
});

// 3. Listener untuk tombol Play Again (Reset)
resetBtn.addEventListener("click", initGame);

// Initialize the game when page loads
initGame();