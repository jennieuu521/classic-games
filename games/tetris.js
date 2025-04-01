// Tetris Game Implementation
function initTetrisGame() {
    console.log('Starting Tetris Game');
    // 获取DOM元素
    const game = document.getElementById('tetris-game');
    const board = document.getElementById('tetris-board');
    const nextPieceDisplay = document.querySelector('.tetris-next');
    const startButton = document.getElementById('tetris-start-button');
    const pauseButton = document.getElementById('tetris-pause-button');
    const gameOverScreen = document.getElementById('tetris-game-over');
    
    // 初始化游戏状态
    let currentPiece = null;
    let nextPiece = null;
    let gameLoop = null;
    let score = 0;
    let level = 1;
    let lines = 0;
    let grid = Array(20).fill().map(() => Array(10).fill(0));
    let isGameStarted = false;
    let isPaused = false;

    // 初始化游戏板
    board.innerHTML = '';
    for (let i = 0; i < 200; i++) {
        const cell = document.createElement('div');
        cell.className = 'tetris-cell';
        cell.style.left = `${(i % 10) * 30}px`;
        cell.style.top = `${Math.floor(i / 10) * 30}px`;
        board.appendChild(cell);
    }

    // 初始化预览区域
    nextPieceDisplay.innerHTML = '';
    for (let i = 0; i < 16; i++) {
        const cell = document.createElement('div');
        cell.className = 'tetris-cell';
        cell.style.left = `${(i % 4) * 25}px`;
        cell.style.top = `${Math.floor(i / 4) * 25}px`;
        nextPieceDisplay.appendChild(cell);
    }

    // 更新UI显示
    startButton.style.display = 'none';
    pauseButton.style.display = 'flex';
    gameOverScreen.style.display = 'none';
    document.getElementById('tetris-score').textContent = '0';
    document.getElementById('tetris-level').textContent = '1';
    document.getElementById('tetris-lines').textContent = '0';

    // 设置游戏状态
    isGameStarted = true;
    isPaused = false;

    // 定义方块形状
    const PIECES = [
        { shape: [[1,1,1,1]], color: '#00f0f0' },
        { shape: [[1,1,1],[0,1,0]], color: '#f0a000' },
        { shape: [[1,1,1],[1,0,0]], color: '#0000f0' },
        { shape: [[1,1,1],[0,0,1]], color: '#f00000' },
        { shape: [[1,1],[1,1]], color: '#f0f000' },
        { shape: [[0,1,1],[1,1,0]], color: '#00f000' },
        { shape: [[1,1,0],[0,1,1]], color: '#a000f0' }
    ];

    // 创建新方块
    function createNewPiece() {
        if (!nextPiece) {
            nextPiece = {
                ...PIECES[Math.floor(Math.random() * PIECES.length)],
                x: 3,
                y: 0
            };
        }
        currentPiece = nextPiece;
        nextPiece = {
            ...PIECES[Math.floor(Math.random() * PIECES.length)],
            x: 3,
            y: 0
        };
        
        if (checkCollision()) {
            gameOver();
        } else {
            drawBoard();
            drawNextPiece();
        }
    }

    // 检查碰撞
    function checkCollision() {
        return currentPiece.shape.some((row, dy) => {
            return row.some((value, dx) => {
                if (!value) return false;
                const newX = currentPiece.x + dx;
                const newY = currentPiece.y + dy;
                return newX < 0 || newX >= 10 || newY >= 20 || 
                       (newY >= 0 && grid[newY][newX]);
            });
        });
    }

    // 移动方块
    function moveDown() {
        currentPiece.y++;
        if (checkCollision()) {
            currentPiece.y--;
            mergePiece();
            createNewPiece();
        }
        drawBoard();
    }

    function moveLeft() {
        currentPiece.x--;
        if (checkCollision()) {
            currentPiece.x++;
        }
        drawBoard();
    }

    function moveRight() {
        currentPiece.x++;
        if (checkCollision()) {
            currentPiece.x--;
        }
        drawBoard();
    }

    function rotate() {
        const oldShape = currentPiece.shape;
        currentPiece.shape = currentPiece.shape[0].map((_, i) => 
            currentPiece.shape.map(row => row[i]).reverse()
        );
        if (checkCollision()) {
            currentPiece.shape = oldShape;
        }
        drawBoard();
    }

    // 合并方块到网格
    function mergePiece() {
        currentPiece.shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value) {
                    const newY = currentPiece.y + dy;
                    const newX = currentPiece.x + dx;
                    if (newY >= 0) {
                        grid[newY][newX] = currentPiece.color;
                    }
                }
            });
        });
        clearLines();
    }

    // 清除完整行
    function clearLines() {
        let linesCleared = 0;
        for (let y = 19; y >= 0; y--) {
            if (grid[y].every(cell => cell)) {
                grid.splice(y, 1);
                grid.unshift(Array(10).fill(0));
                linesCleared++;
                y++;
            }
        }
        if (linesCleared > 0) {
            lines += linesCleared;
            score += linesCleared * 100 * level;
            level = Math.floor(lines / 10) + 1;
            document.getElementById('tetris-score').textContent = score;
            document.getElementById('tetris-level').textContent = level;
            document.getElementById('tetris-lines').textContent = lines;
            startGameLoop(); // 更新游戏速度
        }
    }

    // 绘制游戏板
    function drawBoard() {
        const cells = board.getElementsByClassName('tetris-cell');
        // 绘制固定方块
        for (let y = 0; y < 20; y++) {
            for (let x = 0; x < 10; x++) {
                cells[y * 10 + x].style.backgroundColor = grid[y][x] || '#111';
            }
        }
        // 绘制当前方块
        if (currentPiece) {
            currentPiece.shape.forEach((row, dy) => {
                row.forEach((value, dx) => {
                    if (value) {
                        const newY = currentPiece.y + dy;
                        const newX = currentPiece.x + dx;
                        if (newY >= 0 && newY < 20 && newX >= 0 && newX < 10) {
                            cells[newY * 10 + newX].style.backgroundColor = currentPiece.color;
                        }
                    }
                });
            });
        }
    }

    // 绘制下一个方块
    function drawNextPiece() {
        const cells = nextPieceDisplay.getElementsByClassName('tetris-cell');
        cells.forEach(cell => cell.style.backgroundColor = '#111');
        if (nextPiece) {
            nextPiece.shape.forEach((row, dy) => {
                row.forEach((value, dx) => {
                    if (value) {
                        const index = dy * 4 + dx;
                        if (index < cells.length) {
                            cells[index].style.backgroundColor = nextPiece.color;
                        }
                    }
                });
            });
        }
    }

    // 游戏结束
    function gameOver() {
        isGameStarted = false;
        if (gameLoop) {
            clearInterval(gameLoop);
            gameLoop = null;
        }
        document.getElementById('tetris-final-score').textContent = score;
        document.getElementById('tetris-final-level').textContent = level;
        gameOverScreen.style.display = 'flex';
        startButton.style.display = 'flex';
        pauseButton.style.display = 'none';
    }

    // 游戏循环
    function startGameLoop() {
        if (gameLoop) {
            clearInterval(gameLoop);
        }
        const dropSpeed = Math.max(100, 1000 - (level * 100));
        gameLoop = setInterval(() => {
            if (!isPaused && isGameStarted) {
                moveDown();
            }
        }, dropSpeed);
    }

    // 键盘控制
    function handleKeyPress(event) {
        if (!isGameStarted || isPaused) return;
        switch(event.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                moveLeft();
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                moveRight();
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                moveDown();
                break;
            case 'ArrowUp':
            case 'w':
            case 'W':
                rotate();
                break;
        }
    }

    // 暂停按钮事件
    pauseButton.onclick = () => {
        isPaused = !isPaused;
        pauseButton.textContent = isPaused ? '▶' : '❚❚';
    };

    // 添加键盘事件监听
    document.addEventListener('keydown', handleKeyPress);

    // 开始游戏
    createNewPiece();
    startGameLoop();
}
