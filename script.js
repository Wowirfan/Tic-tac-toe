// Game State Management
class TicTacToeGame {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameMode = 'pvp'; // 'pvp' or 'pvc'
        this.gameActive = true;
        this.isComputerTurn = false;
        
        // DOM elements
        this.modeSelection = document.getElementById('modeSelection');
        this.gameContainer = document.getElementById('gameContainer');
        this.gameBoard = document.getElementById('gameBoard');
        this.currentPlayerDisplay = document.getElementById('currentPlayer');
        this.currentModeDisplay = document.getElementById('currentMode');
        this.modalOverlay = document.getElementById('modalOverlay');
        this.resultTitle = document.getElementById('resultTitle');
        this.resultMessage = document.getElementById('resultMessage');
        
        // Winning combinations
        this.winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        // Mode selection buttons
        document.getElementById('pvpMode').addEventListener('click', () => this.selectMode('pvp'));
        document.getElementById('pvcMode').addEventListener('click', () => this.selectMode('pvc'));
        
        // Game board cells
        this.gameBoard.addEventListener('click', (e) => this.handleCellClick(e));
        
        // Control buttons
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('changeModeBtn').addEventListener('click', () => this.showModeSelection());
        
        // Modal buttons
        document.getElementById('playAgainBtn').addEventListener('click', () => this.playAgain());
        document.getElementById('changeModeBtnModal').addEventListener('click', () => this.showModeSelection());
        
        // Close modal on overlay click
        this.modalOverlay.addEventListener('click', (e) => {
            if (e.target === this.modalOverlay) {
                this.closeModal();
            }
        });
    }
    
    selectMode(mode) {
        this.gameMode = mode;
        this.currentModeDisplay.textContent = mode === 'pvp' ? 'PLAYER VS PLAYER' : 'PLAYER VS COMPUTER';
        this.showGame();
        this.resetGame();
    }
    
    showModeSelection() {
        this.modeSelection.style.display = 'block';
        this.gameContainer.style.display = 'none';
        this.closeModal();
    }
    
    showGame() {
        this.modeSelection.style.display = 'none';
        this.gameContainer.style.display = 'block';
    }
    
    handleCellClick(e) {
        if (!e.target.classList.contains('cell') || !this.gameActive || this.isComputerTurn) {
            return;
        }
        
        const cellIndex = parseInt(e.target.dataset.index);
        
        if (this.board[cellIndex] !== '') {
            return;
        }
        
        this.makeMove(cellIndex, this.currentPlayer);
        
        if (this.gameActive && this.gameMode === 'pvc' && this.currentPlayer === 'O') {
            this.isComputerTurn = true;
            setTimeout(() => {
                this.makeComputerMove();
                this.isComputerTurn = false;
            }, 500); // Add delay for better UX
        }
    }
    
    makeMove(index, player) {
        this.board[index] = player;
        const cell = document.querySelector(`[data-index="${index}"]`);
        
        cell.textContent = player;
        cell.classList.add('filled', player.toLowerCase());
        
        // Add animation class
        setTimeout(() => {
            cell.classList.add('placed');
        }, 50);
        
        if (this.checkWin(player)) {
            this.endGame(`Player ${player} Wins!`);
            this.highlightWinningCells();
            return;
        }
        
        if (this.checkDraw()) {
            this.endGame("It's a Draw!");
            return;
        }
        
        this.switchPlayer();
    }
    
    makeComputerMove() {
        if (!this.gameActive) return;
        
        const bestMove = this.getBestMove();
        this.makeMove(bestMove, 'O');
    }
    
    getBestMove() {
        // AI Strategy:
        // 1. Try to win
        // 2. Block player from winning
        // 3. Take center if available
        // 4. Take corners
        // 5. Take any available spot
        
        // Check if computer can win
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                if (this.checkWin('O')) {
                    this.board[i] = ''; // Reset for actual move
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // Check if need to block player
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'X';
                if (this.checkWin('X')) {
                    this.board[i] = ''; // Reset for actual move
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // Take center if available
        if (this.board[4] === '') {
            return 4;
        }
        
        // Take corners
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(corner => this.board[corner] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        // Take any available spot
        const availableSpots = this.board.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
        return availableSpots[Math.floor(Math.random() * availableSpots.length)];
    }
    
    checkWin(player) {
        return this.winPatterns.some(pattern => {
            return pattern.every(index => this.board[index] === player);
        });
    }
    
    checkDraw() {
        return this.board.every(cell => cell !== '');
    }
    
    highlightWinningCells() {
        for (let pattern of this.winPatterns) {
            if (pattern.every(index => this.board[index] === this.board[pattern[0]] && this.board[pattern[0]] !== '')) {
                pattern.forEach(index => {
                    document.querySelector(`[data-index="${index}"]`).classList.add('winning');
                });
                break;
            }
        }
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.currentPlayerDisplay.textContent = this.currentPlayer;
        
        // Add pulse animation to current player indicator
        this.currentPlayerDisplay.style.animation = 'none';
        setTimeout(() => {
            this.currentPlayerDisplay.style.animation = 'pulse 1s ease-in-out infinite';
        }, 50);
    }
    
    endGame(message) {
        this.gameActive = false;
        setTimeout(() => {
            this.showResult(message);
        }, 1000);
    }
    
    showResult(message) {
        this.resultMessage.textContent = message;
        
        if (message.includes('Draw')) {
            this.resultTitle.textContent = 'DRAW GAME';
            this.resultTitle.style.color = 'var(--neon-purple)';
        } else if (message.includes('X')) {
            this.resultTitle.textContent = 'PLAYER X WINS';
            this.resultTitle.style.color = 'var(--neon-cyan)';
        } else {
            this.resultTitle.textContent = this.gameMode === 'pvc' ? 'COMPUTER WINS' : 'PLAYER O WINS';
            this.resultTitle.style.color = 'var(--neon-pink)';
        }
        
        this.modalOverlay.style.display = 'flex';
    }
    
    closeModal() {
        this.modalOverlay.style.display = 'none';
    }
    
    playAgain() {
        this.closeModal();
        this.resetGame();
    }
    
    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.isComputerTurn = false;
        
        // Reset UI
        this.currentPlayerDisplay.textContent = 'X';
        
        // Clear all cells
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
        
        // Reset current player animation
        this.currentPlayerDisplay.style.animation = 'pulse 1s ease-in-out infinite';
    }
}

// Utility Functions
function addGlowEffect(element, color) {
    element.style.boxShadow = `0 0 20px ${color}`;
}

function removeGlowEffect(element) {
    element.style.boxShadow = '';
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new TicTacToeGame();
    
    // Add keyboard support
    document.addEventListener('keydown', (e) => {
        if (e.key >= '1' && e.key <= '9') {
            const cellIndex = parseInt(e.key) - 1;
            const cell = document.querySelector(`[data-index="${cellIndex}"]`);
            if (cell) {
                cell.click();
            }
        }
        
        if (e.key === 'r' || e.key === 'R') {
            document.getElementById('resetBtn').click();
        }
        
        if (e.key === 'Escape') {
            if (game.modalOverlay.style.display === 'flex') {
                game.closeModal();
            } else {
                game.showModeSelection();
            }
        }
    });
    
    // Add visual feedback for button interactions
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
        });
        
        button.addEventListener('mousedown', () => {
            button.style.transform = 'translateY(1px)';
        });
        
        button.addEventListener('mouseup', () => {
            button.style.transform = 'translateY(-2px)';
        });
    });
    
    // Add cell hover effects
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.addEventListener('mouseenter', () => {
            if (!cell.classList.contains('filled') && game.gameActive && !game.isComputerTurn) {
                cell.style.transform = 'scale(1.05)';
                cell.textContent = game.currentPlayer;
                cell.style.opacity = '0.5';
            }
        });
        
        cell.addEventListener('mouseleave', () => {
            if (!cell.classList.contains('filled')) {
                cell.style.transform = 'scale(1)';
                cell.textContent = '';
                cell.style.opacity = '1';
            }
        });
    });
    
    // Performance optimization: Preload animations
    const preloadStyles = document.createElement('style');
    preloadStyles.textContent = `
        .cell { transform: translateZ(0); }
        .mode-btn { transform: translateZ(0); }
        .control-btn { transform: translateZ(0); }
    `;
    document.head.appendChild(preloadStyles);
});

// Game Analytics (Optional - for future enhancements)
class GameAnalytics {
    constructor() {
        this.gamesPlayed = 0;
        this.wins = { X: 0, O: 0, draws: 0 };
        this.gameMode = { pvp: 0, pvc: 0 };
    }
    
    recordGame(winner, mode) {
        this.gamesPlayed++;
        this.gameMode[mode]++;
        
        if (winner === 'draw') {
            this.wins.draws++;
        } else {
            this.wins[winner]++;
        }
        
        // Store in localStorage for persistence
        localStorage.setItem('ticTacToeStats', JSON.stringify({
            gamesPlayed: this.gamesPlayed,
            wins: this.wins,
            gameMode: this.gameMode
        }));
    }
    
    getStats() {
        const stored = localStorage.getItem('ticTacToeStats');
        if (stored) {
            const stats = JSON.parse(stored);
            this.gamesPlayed = stats.gamesPlayed || 0;
            this.wins = stats.wins || { X: 0, O: 0, draws: 0 };
            this.gameMode = stats.gameMode || { pvp: 0, pvc: 0 };
        }
        return {
            gamesPlayed: this.gamesPlayed,
            wins: this.wins,
            gameMode: this.gameMode
        };
    }
}

// Initialize analytics
const analytics = new GameAnalytics();