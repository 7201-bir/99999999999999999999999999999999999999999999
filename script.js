class Minesweeper {
    constructor(rows = 10, cols = 10, mines = 10) {
        this.rows = rows;
        this.cols = cols;
        this.mines = mines;
        this.board = [];
        this.revealed = [];
        this.flagged = [];
        this.gameOver = false;
        this.isFirstClick = true;
        this.minesLeft = mines;
        this.timer = 0;
        this.timerInterval = null;
        
        this.initializeBoard();
        this.setupEventListeners();
    }

    initializeBoard() {
        // 初始化空板
        for (let i = 0; i < this.rows; i++) {
            this.board[i] = Array(this.cols).fill(0);
            this.revealed[i] = Array(this.cols).fill(false);
            this.flagged[i] = Array(this.cols).fill(false);
        }
        
        document.getElementById('mineCount').textContent = this.mines;
        this.renderBoard();
    }

    setupEventListeners() {
        const board = document.getElementById('board');
        board.innerHTML = '';
        
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                cell.addEventListener('click', (e) => this.handleClick(i, j));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.toggleFlag(i, j);
                });
                
                board.appendChild(cell);
            }
        }

        document.getElementById('startBtn').addEventListener('click', () => this.reset());
        document.getElementById('autoPlayBtn').addEventListener('click', () => this.autoPlay());
    }

    placeMines(firstRow, firstCol) {
        let minesPlaced = 0;
        while (minesPlaced < this.mines) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            // 確保不會在第一次點擊的位置及其周圍放置地雷
            if (Math.abs(row - firstRow) <= 1 && Math.abs(col - firstCol) <= 1) {
                continue;
            }
            
            if (this.board[row][col] !== -1) {
                this.board[row][col] = -1;
                minesPlaced++;
                
                // 更新周圍數字
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (i === 0 && j === 0) continue;
                        const newRow = row + i;
                        const newCol = col + j;
                        if (this.isValidCell(newRow, newCol) && this.board[newRow][newCol] !== -1) {
                            this.board[newRow][newCol]++;
                        }
                    }
                }
            }
        }
    }

    isValidCell(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    handleClick(row, col) {
        if (this.gameOver || this.flagged[row][col]) return;
        
        if (this.isFirstClick) {
            this.isFirstClick = false;
            this.placeMines(row, col);
            this.startTimer();
        }
        
        this.reveal(row, col);
        this.renderBoard();
        
        if (this.checkWin()) {
            this.gameOver = true;
            clearInterval(this.timerInterval);
            setTimeout(() => alert('恭喜獲勝！'), 100);
        }
    }

    reveal(row, col) {
        if (!this.isValidCell(row, col) || this.revealed[row][col] || this.flagged[row][col]) return;
        
        this.revealed[row][col] = true;
        
        if (this.board[row][col] === -1) {
            this.gameOver = true;
            clearInterval(this.timerInterval);
            this.revealAll();
            setTimeout(() => alert('遊戲結束！'), 100);
            return;
        }
        
        if (this.board[row][col] === 0) {
            // 如果是空格，遞迴揭開周圍的格子
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (i === 0 && j === 0) continue;
                    this.reveal(row + i, col + j);
                }
            }
        }
    }

    toggleFlag(row, col) {
        if (this.gameOver || this.revealed[row][col]) return;
        
        this.flagged[row][col] = !this.flagged[row][col];
        this.minesLeft += this.flagged[row][col] ? -1 : 1;
        document.getElementById('mineCount').textContent = this.minesLeft;
        this.renderBoard();
    }

    renderBoard() {
        const cells = document.getElementsByClassName('cell');
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const index = i * this.cols + j;
                const cell = cells[index];
                
                cell.className = 'cell';
                if (this.revealed[i][j]) {
                    cell.classList.add('revealed');
                    if (this.board[i][j] === -1) {
                        cell.classList.add('mine');
                        cell.textContent = '💣';
                    } else if (this.board[i][j] > 0) {
                        cell.textContent = this.board[i][j];
                    } else {
                        cell.textContent = '';
                    }
                } else if (this.flagged[i][j]) {
                    cell.classList.add('flagged');
                    cell.textContent = '🚩';
                } else {
                    cell.textContent = '';
                }
            }
        }
    }

    revealAll() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                this.revealed[i][j] = true;
            }
        }
        this.renderBoard();
    }

    checkWin() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.board[i][j] !== -1 && !this.revealed[i][j]) return false;
            }
        }
        return true;
    }

    reset() {
        this.board = [];
        this.revealed = [];
        this.flagged = [];
        this.gameOver = false;
        this.isFirstClick = true;
        this.minesLeft = this.mines;
        clearInterval(this.timerInterval);
        this.timer = 0;
        document.getElementById('timer').textContent = '0';
        this.initializeBoard();
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            document.getElementById('timer').textContent = this.timer;
        }, 1000);
    }

    // 自動遊玩邏輯
    autoPlay() {
        if (this.gameOver) return;
        
        if (this.isFirstClick) {
            // 第一次點擊選擇角落位置
            this.handleClick(0, 0);
            return;
        }

        // 使用概率計算來決定下一步
        const move = this.findBestMove();
        if (move) {
            this.handleClick(move.row, move.col);
        } else {
            // 如果找不到安全的移動，隨機選擇一個未揭開的格子
            const unrevealed = this.getUnrevealedCells();
            if (unrevealed.length > 0) {
                const randomCell = unrevealed[Math.floor(Math.random() * unrevealed.length)];
                this.handleClick(randomCell.row, randomCell.col);
            }
        }

        // 如果遊戲沒有結束，繼續自動遊玩
        if (!this.gameOver) {
            setTimeout(() => this.autoPlay(), 100);
        }
    }

    findBestMove() {
        // 找出所有已揭開的格子的周圍未揭開格子
        const safeMove = this.findSafeMove();
        if (safeMove) return safeMove;

        // 如果沒有找到安全的移動，使用概率計算
        return this.calculateProbabilityMove();
    }

    findSafeMove() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.revealed[i][j] && this.board[i][j] > 0) {
                    const surroundingCells = this.getSurroundingCells(i, j);
                    const unrevealedCount = surroundingCells.filter(cell => !this.revealed[cell.row][cell.col]).length;
                    const flaggedCount = surroundingCells.filter(cell => this.flagged[cell.row][cell.col]).length;
                    
                    if (this.board[i][j] === flaggedCount) {
                        // 所有地雷都已標記，可以安全揭開其他格子
                        const safeCells = surroundingCells.filter(cell => 
                            !this.revealed[cell.row][cell.col] && !this.flagged[cell.row][cell.col]
                        );
                        if (safeCells.length > 0) {
                            return safeCells[0];
                        }
                    }
                }
            }
        }
        return null;
    }

    calculateProbabilityMove() {
        const unrevealedCells = this.getUnrevealedCells();
        if (unrevealedCells.length === 0) return null;

        // 計算每個未揭開格子的地雷概率
        const probabilities = new Map();
        for (const cell of unrevealedCells) {
            const prob = this.calculateMineProbability(cell.row, cell.col);
            probabilities.set(`${cell.row},${cell.col}`, prob);
        }

        // 選擇概率最低的格子
        let minProb = 1;
        let bestMove = null;
        for (const [key, prob] of probabilities) {
            if (prob < minProb) {
                minProb = prob;
                const [row, col] = key.split(',').map(Number);
                bestMove = { row, col };
            }
        }

        return bestMove;
    }

    calculateMineProbability(row, col) {
        if (this.flagged[row][col]) return 1;
        if (this.revealed[row][col]) return 0;

        const surroundingCells = this.getSurroundingCells(row, col);
        const revealedNeighbors = surroundingCells.filter(cell => this.revealed[cell.row][cell.col]);
        
        if (revealedNeighbors.length === 0) return 0.5;

        let totalProbability = 0;
        for (const neighbor of revealedNeighbors) {
            const neighborNumber = this.board[neighbor.row][neighbor.col];
            if (neighborNumber > 0) {
                const neighborSurrounding = this.getSurroundingCells(neighbor.row, neighbor.col);
                const unrevealedCount = neighborSurrounding.filter(cell => !this.revealed[cell.row][cell.col]).length;
                const flaggedCount = neighborSurrounding.filter(cell => this.flagged[cell.row][cell.col]).length;
                const remainingMines = neighborNumber - flaggedCount;
                
                totalProbability += remainingMines / (unrevealedCount || 1);
            }
        }

        return totalProbability / revealedNeighbors.length;
    }

    getSurroundingCells(row, col) {
        const cells = [];
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const newRow = row + i;
                const newCol = col + j;
                if (this.isValidCell(newRow, newCol)) {
                    cells.push({ row: newRow, col: newCol });
                }
            }
        }
        return cells;
    }

    getUnrevealedCells() {
        const cells = [];
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (!this.revealed[i][j] && !this.flagged[i][j]) {
                    cells.push({ row: i, col: j });
                }
            }
        }
        return cells;
    }
}

// 初始化遊戲
const game = new Minesweeper(10, 10, 10);
