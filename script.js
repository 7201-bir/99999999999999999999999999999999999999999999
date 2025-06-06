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
            // 在地獄模式下，永遠選擇左上角開始（最保守的策略）
            this.handleClick(0, 0);
            setTimeout(() => this.autoPlay(), 300);
            return;
        }

        let foundAction = false;

        // 1. 先確保所有已知的地雷都被標記
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

                    // 在地獄模式中，任何可疑的格子都標記為地雷
                    if (unrevealedCells.length > 0 && 
                        this.board[i][j] - flaggedCells.length > 0) {
                        unrevealedCells.forEach(cell => {
                            this.toggleFlag(cell.row, cell.col);
                            foundAction = true;
                        });
                    }
                }
            }
        }

        // 2. 然後嘗試找到確定安全的格子
        if (!foundAction) {
            for (let i = 0; i < this.rows && !foundAction; i++) {
                for (let j = 0; j < this.cols && !foundAction; j++) {
                    if (this.revealed[i][j] && this.board[i][j] > 0) {
                        const surroundingCells = this.getSurroundingCells(i, j);
                        const flaggedCells = surroundingCells.filter(cell => 
                            this.flagged[cell.row][cell.col]
                        );
                        
                        // 如果周圍的旗子數量等於數字，其他格子就是安全的
                        if (flaggedCells.length === this.board[i][j]) {
                            const safeCells = surroundingCells.filter(cell => 
                                !this.revealed[cell.row][cell.col] && !this.flagged[cell.row][cell.col]
                            );
                            if
