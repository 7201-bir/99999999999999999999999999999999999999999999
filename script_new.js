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

    autoPlay() {
        if (this.gameOver) return;
        
        if (this.isFirstClick) {
            // 在地獄模式下，選擇左上角開始是最保守的選擇
            this.handleClick(0, 0);
            setTimeout(() => this.autoPlay(), 300);
            return;
        }

        // 1. 掃描整個棋盤，尋找確定安全或確定是地雷的格子
        let foundAction = false;
        for (let i = 0; i < this.rows && !foundAction; i++) {
            for (let j = 0; j < this.cols && !foundAction; j++) {
                if (this.revealed[i][j] && this.board[i][j] > 0) {
                    const surroundingCells = this.getSurroundingCells(i, j);
                    const unrevealedCells = surroundingCells.filter(cell => 
                        !this.revealed[cell.row][cell.col] && !this.flagged[cell.row][cell.col]
                    );
                    const flaggedCells = surroundingCells.filter(cell => 
                        this.flagged[cell.row][cell.col]
                    );
                    
                    if (unrevealedCells.length > 0) {
                        // 如果未標記的格子數等於剩餘地雷數，全部都是地雷
                        if (this.board[i][j] - flaggedCells.length === unrevealedCells.length) {
                            unrevealedCells.forEach(cell => {
                                this.toggleFlag(cell.row, cell.col);
                                foundAction = true;
                            });
                        }
                        // 如果已標記的旗子數等於數字，其他格子就是安全的
                        else if (flaggedCells.length === this.board[i][j]) {
                            this.handleClick(unrevealedCells[0].row, unrevealedCells[0].col);
                            foundAction = true;
                        }
                    }
                }
            }
        }

        // 2. 如果沒有找到確定的移動，計算每個格子的地雷機率
        if (!foundAction) {
            const unrevealedCells = this.getUnrevealedCells();
            if (unrevealedCells.length > 0) {
                // 在地獄模式下，我們需要更激進的策略
                // 選擇離已知安全區域最近的格子
                let bestCell = null;
                let minDistance = Infinity;
                
                for (const cell of unrevealedCells) {
                    const distance = this.getMinDistanceToRevealedCell(cell);
                    if (distance < minDistance) {
                        minDistance = distance;
                        bestCell = cell;
                    }
                }
                
                if (bestCell) {
                    this.handleClick(bestCell.row, bestCell.col);
                }
            }
        }

        // 如果遊戲沒有結束，持續遊玩
        if (!this.gameOver) {
            setTimeout(() => this.autoPlay(), 300);
        }
    }

    getMinDistanceToRevealedCell(cell) {
        let minDistance = Infinity;
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.revealed[i][j] && this.board[i][j] !== -1) {
                    const distance = Math.abs(cell.row - i) + Math.abs(cell.col - j);
                    minDistance = Math.min(minDistance, distance);
                }
            }
        }
        return minDistance;
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

// 初始化遊戲，90顆地雷（終極地獄模式 - 90%的格子都是地雷！）
const game = new Minesweeper(10, 10, 90);
