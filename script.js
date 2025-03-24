const gameBoard = document.getElementById('gameBoard');
const startButton = document.getElementById('startButton');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const usernameInput = document.getElementById('username');
const scoreList = document.getElementById('scoreList');
const messageDisplay = document.getElementById('message');
const highScoreMessageDisplay = document.getElementById('high-score-message');
const topScorerImageDisplay = document.getElementById('top-scorer-image');

let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let score = 0;
let timeLeft = 100;
let timer;
let scoreboard = JSON.parse(localStorage.getItem('scoreboard')) || [];
let gameActive = true;

const cryptocurrencies = [
    'bitcoin', 'ethereum', 'binance-coin', 'cardano', 'solana', 
    'xrp', 'polkadot', 'dogecoin', 'avalanche', 'chainlink',
    'litecoin', 'stellar', 'tezos', 'cosmos', 'algorand',
    'polygon', 'vechain', 'tron', 'eos', 'monero',
    'iota', 'hedera', 'fantom', 'aave', 'uniswap'
];

const maxCryptoPairs = cryptocurrencies.length;
const superSeedCount = 4;
const minSeedCount = 22;
const maxSeedCount = 30;
const totalPairs = 40;

const maxSeedPairs = Math.min(15, totalPairs - 2 - maxCryptoPairs);
const seedPairs = Math.floor(Math.random() * (maxSeedPairs - 11 + 1)) + 11;
const seedCount = seedPairs * 2;
const cryptoPairs = totalPairs - (seedPairs + (superSeedCount / 2));
const cryptoCount = cryptoPairs * 2;

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createCards() {
    const seedCards = Array(seedCount / 2).fill('Seed').map((name, i) => ({ name, type: 'seed' }));
    const superSeedCards = Array(superSeedCount / 2).fill('SuperSeed').map((name, i) => ({ name, type: 'superseed' }));
    
    let cryptoNames = cryptocurrencies.slice(0, Math.min(cryptoPairs, maxCryptoPairs));
    if (cryptoPairs > maxCryptoPairs) {
        const extra = cryptoPairs - maxCryptoPairs;
        cryptoNames = cryptoNames.concat(cryptocurrencies.slice(0, extra));
    }
    const cryptoCards = cryptoNames.map(name => ({ name, type: 'crypto' }));

    cards = [...seedCards, ...superSeedCards, ...cryptoCards];
    cards = [...cards, ...cards];
    cards = shuffle(cards);

    console.log(`Total cards: ${cards.length}, Seed: ${seedCount}, SuperSeed: ${superSeedCount}, Crypto: ${cryptoCount}`);

    gameBoard.innerHTML = '';
    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.name = card.name;
        cardElement.dataset.type = card.type;

        const front = document.createElement('div');
        front.classList.add('card-front');

        const img = document.createElement('img');
        if (card.type === 'seed') {
            img.src = 'seed.png';
            img.alt = 'Seed Card';
        } else if (card.type === 'superseed') {
            img.src = 'superseed.png';
            img.alt = 'SuperSeed Card';
        } else {
            img.src = `${card.name}.png`;
            img.alt = `${card.name} Logo`;
        }
        front.appendChild(img);

        const back = document.createElement('div');
        back.classList.add('card-back');

        // Calculate the row and column of the card
        const column = index % 10; // 10 columns
        const row = Math.floor(index / 10); // 8 rows

        // Calculate the background position
        // Each card is 80x80px, so we shift the background by 80px for each column and row
        const posX = -(column * 80); // Shift left for each column
        const posY = -(row * 80); // Shift up for each row
        back.style.backgroundPosition = `${posX}px ${posY}px`;

        cardElement.appendChild(front);
        cardElement.appendChild(back);
        cardElement.addEventListener('click', flipCard);
        gameBoard.appendChild(cardElement);
    });
}

function flipCard() {
    if (!gameActive) return;
    if (flippedCards.length < 2 && !this.classList.contains('flipped')) {
        this.classList.add('flipped');
        flippedCards.push(this);

        if (flippedCards.length === 2) {
            checkMatch();
        }
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    if (card1.dataset.name === card2.dataset.name) {
        matchedPairs++;
        updateScore(card1.dataset.type);
        card1.removeEventListener('click', flipCard);
        card2.removeEventListener('click', flipCard);
        flippedCards = [];

        if (matchedPairs === cards.length / 2) {
            endGame(true);
        }
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
        }, 1000);
    }
}

function updateScore(type) {
    if (type === 'seed') {
        score += 3;
        timeLeft += 3;
    } else if (type === 'superseed') {
        score += 10;
        timeLeft += 15;
    } else {
        score += 1;
    }
    scoreDisplay.textContent = `Score: ${score}`;
}

function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `Time: ${timeLeft}s`;
        if (timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
}

function endGame(won) {
    clearInterval(timer);
    gameActive = false;
    gameBoard.classList.add('game-over');
    startButton.disabled = false;
    const username = usernameInput.value.trim() || 'Anonymous';

    if (won) {
        score += timeLeft * 5;
        scoreDisplay.textContent = `Score: ${score}`;
        updateScoreboard(username, score);
        displayMessage(username, won);
    } else {
        updateScoreboard(username, score);
        messageDisplay.textContent = `Time’s up! Game Over. Final Score: ${score}`;
        messageDisplay.classList.add('game-over-message');
        displayMessage(username, false);
    }
}

function updateScoreboard(username, score) {
    scoreboard.push({ username, score });
    scoreboard.sort((a, b) => b.score - a.score);
    scoreboard = scoreboard.slice(0, 10);
    localStorage.setItem('scoreboard', JSON.stringify(scoreboard));
    renderScoreboard();
}

function renderScoreboard() {
    scoreList.innerHTML = '';
    scoreboard.forEach((entry, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${entry.username}: ${entry.score}`;
        scoreList.appendChild(li);
    });
}

function displayMessage(username, won) {
      const isTopScorer = scoreboard.length > 0 && scoreboard[0]?.username === username && scoreboard[0]?.score === score;

   highScoreMessageDisplay.textContent = '';
    highScoreMessageDisplay.classList.remove('high-score', 'game-won', 'top-score-won');
    topScorerImageDisplay.innerHTML = ''; // Clear previous image

    // Display messages in high-score-message based on conditions
    if (won && isTopScorer) {
        highScoreMessageDisplay.textContent = `Incredible, ${username}! You cleared all cards and set a new high score!`;
        highScoreMessageDisplay.classList.add('top-score-won');

        // Add the top scorer image
        const img = document.createElement('img');
        img.src = 'top-scorer-award.png';
        img.alt = 'Top Scorer Award';
        img.classList.add('top-scorer-award');
        topScorerImageDisplay.appendChild(img);
    } else if (won) {
        highScoreMessageDisplay.textContent = `Well done, ${username}! You cleared all cards!`;
        highScoreMessageDisplay.classList.add('game-won');
    } else if (isTopScorer) {
        highScoreMessageDisplay.textContent = `Congratulations, ${username}! You set a new high score!`;
        highScoreMessageDisplay.classList.add('high-score');
    }

    messageDisplay.classList.remove('top-score', 'game-won', 'top-score-won');
}
function startGame() {
    if (!usernameInput.value.trim()) {
        alert('Please enter a username!');
        return;
    }
    startButton.disabled = true;
    score = 0;
    timeLeft = 100;
    matchedPairs = 0;
    flippedCards = [];
    gameActive = true;
    gameBoard.classList.remove('game-over');
    scoreDisplay.textContent = `Score: ${score}`;
    timerDisplay.textContent = `Time: ${timeLeft}s`;
    messageDisplay.textContent = '';
    highScoreMessageDisplay.textContent = ''; // Clear high score message on game start
    highScoreMessageDisplay.classList.remove('high-score', 'game-won', 'top-score-won');
    topScorerImageDisplay.innerHTML = '';
    createCards();
    startTimer();
}

startButton.addEventListener('click', startGame);
renderScoreboard();
