//difficulty presets
const difficulties = {
    easy: { rows: 9, cols: 9, mines: 10 },
    medium: { rows: 16, cols: 12, mines: 30 },
    hard: { rows: 16, cols: 30, mines: 99 },
};

let numRows, numCols, numMines;
let board = [];
let gameActive = true;
let firstClick = true;

//take html elements you
const mineCounter = document.getElementById('mineCounter');
const timer = document.getElementById('timer');
const restart = document.getElementById('restart');
const easy = document.getElementById('easy');
const medium = document.getElementById('medium');
const hard = document.getElementById('hard');
const gameGrid = document.getElementById('gameGrid');

restart.onclick = function() {
    gameGrid.innerHTML = ''; //delete previous board
    board = []; //reset board
    gameActive = true; //mark game as active
    firstClick = true; //first click

    gameGrid.style.display = 'grid'; //make board a grid
    gameGrid.style.gridTemplateRows = `repeat(${numRows}, 32px)`; //define number of rows
    gameGrid.style.gridTemplateColumns = `repeat(${numCols}, 32px)`; //define number of columns


    //generate squares
    for (let r = 0; r < numRows; r++) { //for each row
        const row = []; //new row in board
        for (let c = 0; c < numCols; c++){ //for each column
            const square = document.createElement('div'); //create a div for field
            square.classList.add('square'); //add css class
            square.dataset.row = r; //save row number in dataset
            square.dataset.col = c; //save column in dataset
            square.style.width = '32px'; //width of square
            square.style.height = '32px'; //height of square
            square.style.border = '1px solid #808080ff'; //light border for squares
            square.style.display = 'flex'; //flexbox to center
            square.style.alignItems = 'center'; //this shit doesnt
            square.style.justifyContent = 'center'; //fucking work
            square.style.backgroundColor = '#3c3c3cff'; //but its ok. background.
            gameGrid.appendChild(square); //add square to board
//click events 
            square.addEventListener('click', () => revealSquare(r, c)); //left click - reveal field
            square.addEventListener('contextmenu', (e) => { //right click - flag thye field
                e.preventDefault(); 
                toggleFlag(r, c);//sets/deletes the flag
            });
//field metadate
            row.push({
                row: r, //number of  row
                col: c, //number of column
                isMine: false, //does it have a mine
                adjacentMines: 0, //number of mines around it
                isRevealed: false, //was it revealed
                isFlagged: false, //is it flagged
                element: square, //refer to div
            });
        }
        board.push(row); //add row to field
    }

    mineCounter.textContent = "Mines left: " +  (numMines - flagsPlaced); //shit doesnt work update: i think it wokrs 
}
//copy because it generates the board right

//generate the board
function generateBoard() {
    gameGrid.innerHTML = ''; //delete previous board
    board = []; //reset board
    gameActive = true; //mark game as active
    firstClick = true; //first click

    gameGrid.style.display = 'grid'; //make board a grid
    gameGrid.style.gridTemplateRows = `repeat(${numRows}, 32px)`; //define number of rows
    gameGrid.style.gridTemplateColumns = `repeat(${numCols}, 32px)`; //define number of columns


    //generate squares
    for (let r = 0; r < numRows; r++) { //for each row
        const row = []; //new row in board
        for (let c = 0; c < numCols; c++){ //for each column
            const square = document.createElement('div'); //create a div for field
            square.classList.add('square'); //add css class
            square.dataset.row = r; //save row number in dataset
            square.dataset.col = c; //save column in dataset
            square.style.width = '32px'; //width of square
            square.style.height = '32px'; //height of square
            square.style.border = '1px solid #808080ff'; //light border for squares
            square.style.display = 'flex'; //flexbox to center
            square.style.alignItems = 'center'; //this shit doesnt
            square.style.justifyContent = 'center'; //fucking work
            square.style.backgroundColor = '#3c3c3cff'; //but its ok. background.
            gameGrid.appendChild(square); //add square to board
//click events 
            square.addEventListener('click', () => revealSquare(r, c)); //left click - reveal field
            square.addEventListener('contextmenu', (e) => { //right click - flag thye field
                e.preventDefault(); 
                toggleFlag(r, c);//sets/deletes the flag
            });
//field metadate
            row.push({
                row: r, //number of  row
                col: c, //number of column
                isMine: false, //does it have a mine
                adjacentMines: 0, //number of mines around it
                isRevealed: false, //was it revealed
                isFlagged: false, //is it flagged
                element: square, //refer to div
            });
        }
        board.push(row); //add row to field
    }

    mineCounter.textContent = "Mines left: " +  (numMines - flagsPlaced);
}

//first click sets the mines
function placeMines(firstR, firstC) {
    let minesPlaced = 0;
    while (minesPlaced < numMines) {
        const r = Math.floor(Math.random() * numRows); //random row
        const c = Math.floor(Math.random() * numCols); //random column

        // never place a mine with first click and around it
        if (board[r][c].isMine) continue;
        if (Math.abs(r - firstR) <= 1 && Math.abs(c - firstC) <= 1) continue;

        board[r][c].isMine = true; //set mine
        minesPlaced++;
    }

    // count nearby mines
    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
            if (board[r][c].isMine) continue;
            let count = 0;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < numRows && nc >= 0 && nc < numCols) {
                        if (board[nr][nc].isMine) count++;
                    }
                }
            }
            board[r][c].adjacentMines = count;
        }
    }
}

// reveal field function
function revealSquare(r, c) {
    if (!gameActive) return; //if game ended - ignore the click

    const square = board[r][c];
    if (square.isRevealed || square.isFlagged) return; //if its flagged or revealed ignore

    // if first click - positions mines
    if (firstClick) {
        placeMines(r, c); //place mines skipping the first click
        firstClick = false;
    }

    square.isRevealed = true; //sets field as revealed
    square.element.style.backgroundColor = '#5f5f5fff'; //change background color

    if (square.isMine) { //if field is a mine - you cant play
        square.element.textContent = '💣';
        gameOver();
        return;
    }

    if (square.adjacentMines > 0) { //if there r mines nearby show the number
        square.element.textContent = square.adjacentMines;
    } else {
        // if theres no mines nearby reveal free field around 
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < numRows && nc >= 0 && nc < numCols) {
                    if (!board[nr][nc].isRevealed) revealSquare(nr, nc);
                }
            }
        }
    }

    checkWin(); //check if player wins
}

// placing flag
function toggleFlag(r, c) {
    if (!gameActive) return; //if the game ended - ignore

    const square = board[r][c];
    if (square.isRevealed) return; //cant flag the revealed field

    square.isFlagged = !square.isFlagged; //toggle flag
    square.element.textContent = square.isFlagged ? '🚩' : ''; //show or delete the flag
    checkWin(); //check wins duh
    updateMineCounter();
}

// learn how to play
function gameOver() {
    gameActive = false; //you cant do anything
    alert('Game Over!'); //learn how to play idiot
    for (let r = 0; r < numRows; r++) { //reveal all mines
        for (let c = 0; c < numCols; c++) {
            if (board[r][c].isMine) {
                board[r][c].element.textContent = '💣';
            }
        }
    }
}

// check for win
function checkWin() {
    let revealedCount = 0;
    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
            if (board[r][c].isRevealed) revealedCount++; //count the revealed field
        }
    }

    if (revealedCount === numRows * numCols - numMines) { //if you reveal everything without mines then u win
        gameActive = false;
        alert('You Win!'); //YOU WIN!!!!!
    }
}

// difficulty 
function setDifficulty(preset) {
    numRows = preset.rows; //set rows
    numCols = preset.cols; //set columns
    numMines = preset.mines; //set count of mines (doesnt work, why?) now it works, but still - why
    generateBoard(); //make a game
}

// make the buttons function
easy.onclick = () => setDifficulty(difficulties.easy);
medium.onclick = () => setDifficulty(difficulties.medium);
hard.onclick = () => setDifficulty(difficulties.hard);

//esay by default 
setDifficulty(difficulties.easy);



function updateMineCounter() {
    let flagsPlaced = 0;

    //count
    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
            if (board[r][c].isFlagged) flagsPlaced++;
        }
    }

    mineCounter.textContent = "Mines left: " +  (numMines - flagsPlaced);
} 
