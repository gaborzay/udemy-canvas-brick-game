let framesPerSecond = 60;

let ballX = 75;
let ballY = 75;
let ballSpeedX = 0;
let ballSpeedY = 5;

const BRICK_W = 80;
const BRICK_H = 20;
const BRICK_COLS = 10;
const BRICK_ROWS = 10;
const BRICK_GAP = 2;
let brickGrid = new Array(BRICK_COLS * BRICK_COLS);
let bricksLeft = 0;

const PADDLE_WIDTH = 100;
const PADDLE_THICKNESS = 10;
const PADDLE_DIST_FROM_EDGE = 60;
let paddleX = 400;

let mouseX;
let mouseY;

let canvas, canvasContext;

window.onload = function (ev) {
	canvas = document.getElementById('gameCanvas');
	canvasContext = canvas.getContext('2d');

	setInterval(updateAll, 1000 / framesPerSecond);

	canvas.addEventListener('mousemove', updateMousePos);

	brickReset();
	ballReset();
};

function updateMousePos(ev) {
	let rect = canvas.getBoundingClientRect();
	let root = document.documentElement;

	mouseX = ev.clientX - rect.left - root.scrollLeft;
	mouseY = ev.clientY - rect.top - root.scrollTop;

	paddleX = mouseX - PADDLE_WIDTH / 2;

	// cheat / hack to test ball in any position
	// ballX = mouseX;
	// ballY = mouseY;
	// ballSpeedX = 4;
	// ballSpeedY = -4;
}

function updateAll() {
	moveAll();
	drawAll();
}

function ballReset() {
	ballX = canvas.width / 2;
	ballY = canvas.height / 2;
	ballSpeedX = 0;
	ballSpeedY = 5;
}

function brickReset() {
	bricksLeft = 0;

	for (let i = 0; i < BRICK_ROWS * BRICK_COLS * 3; i++) {
		brickGrid[i] = false;
	}

	for (let i = 3 * BRICK_COLS; i < BRICK_ROWS * BRICK_COLS; i++) {
		brickGrid[i] = true;
		bricksLeft++;
	} // end of for each brick
} // end of brickReset func

function rowColToArrayIndex(col, row) {
	return BRICK_COLS * row + col;
}

function drawBricks() {
	for (let row = 0; row < BRICK_ROWS; row++) {
		for (let col = 0; col < BRICK_COLS; col++) {

			const arrayIndex = rowColToArrayIndex(col, row);

			if (brickGrid[arrayIndex]) {
				colorRect(BRICK_W * col, BRICK_H * row, BRICK_W - BRICK_GAP, BRICK_H - BRICK_GAP, 'blue');
			} // end of is this brick here
		} // end of for each brick row
	} // end of for each brick column
} // end of drawBricks func

function ballMove() {
	ballX += ballSpeedX;
	ballY += ballSpeedY;

	if (ballX < 0 && ballSpeedX < 0.0) { // left
		ballSpeedX *= -1;
	}
	if (ballX > canvas.width && ballSpeedX > 0.0) { // right
		ballSpeedX *= -1;
	}
	if (ballY < 0 && ballSpeedY < 0.0) { // top
		ballSpeedY *= -1;
	}
	if (ballY > canvas.height) { // bottom
		ballReset();
		brickReset();
	}
}

function isBrickAtColRow(col, row) {
	if (col >= 0 && col < BRICK_COLS && row >= 0 && row < BRICK_ROWS) {
		let brickIndexUnderCoord = rowColToArrayIndex(col, row);
		return brickGrid[brickIndexUnderCoord];
	} else {
		return false;
	}
}

function ballBrickHandling() {
	let ballBrickCol = Math.floor(ballX / BRICK_W);
	let ballBrickRow = Math.floor(ballY / BRICK_H);
	let brickIndexUnderBall = rowColToArrayIndex(ballBrickCol, ballBrickRow);

	if (ballBrickCol >= 0 && ballBrickCol < BRICK_COLS &&
		ballBrickRow >= 0 && ballBrickRow < BRICK_ROWS) {

		if (isBrickAtColRow(ballBrickCol, ballBrickRow)) {
			brickGrid[brickIndexUnderBall] = false;
			bricksLeft--;

			let prevBallX = ballX - ballSpeedX;
			let prevBallY = ballY - ballSpeedY;
			let prevBrickCol = Math.floor(prevBallX / BRICK_W);
			let prevBrickRow = Math.floor(prevBallY / BRICK_H);

			let bothTestsFailed = true;

			if (prevBrickCol !== ballBrickCol) {
				if (isBrickAtColRow(prevBrickCol, ballBrickRow) === false) {
					ballSpeedX *= -1;
					bothTestsFailed = false;
				}
			}
			if (prevBrickRow !== ballBrickRow) {
				if (isBrickAtColRow(ballBrickCol, prevBrickRow) === false) {
					ballSpeedY *= -1;
					bothTestsFailed = false;
				}
			}

			if (bothTestsFailed) { // armpit case, prevents ball from going right through
				ballSpeedX *= -1;
				ballSpeedY *= -1;
			}
		} // end of brick found
	} // end of valid col and row
} // end of ballBrickHandling func

function ballPaddleHandling() {
	let paddleTopEdgeY = canvas.height - PADDLE_DIST_FROM_EDGE;
	let paddleBottomEdgeY = paddleTopEdgeY + PADDLE_THICKNESS;
	let paddleLeftEdgeX = paddleX;
	let paddleRightEdgeX = paddleLeftEdgeX + PADDLE_WIDTH;

	if (ballY >= paddleTopEdgeY && // below the top of paddle
		ballY <= paddleBottomEdgeY && // above bottom of paddle
		ballX >= paddleLeftEdgeX && // right of the left side of paddle
		ballX <= paddleRightEdgeX) { // left of the right side of the paddle

		ballSpeedY *= -1;

		let centerOfPaddleX = paddleX + PADDLE_WIDTH / 2;
		let ballDistFromPaddleCenterX = ballX - centerOfPaddleX;
		ballSpeedX = ballDistFromPaddleCenterX * 0.35;

		if (bricksLeft === 0) {
			brickReset();
		} // out of bricks
	} // ball center inside paddle
} // end of ballPaddleHandling func

function moveAll() {
	ballMove();
	ballBrickHandling();
	ballPaddleHandling();
}

function drawAll() {
	colorRect(0, 0, canvas.width, canvas.height, 'black'); // clear screen

	colorCircle(ballX, ballY, 10, 'white'); // draw ball

	colorRect(paddleX, canvas.height - PADDLE_DIST_FROM_EDGE, PADDLE_WIDTH, PADDLE_THICKNESS, 'white');

	drawBricks();
}

function colorRect(topLeftX, topLeftY, boxWidth, boxHeight, fillColor) {
	canvasContext.fillStyle = fillColor;
	canvasContext.fillRect(topLeftX, topLeftY, boxWidth, boxHeight);
}

function colorCircle(centerX, centerY, radius, fillColor) {
	canvasContext.fillStyle = fillColor;
	canvasContext.beginPath();
	canvasContext.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
	canvasContext.fill();
}

function colorText(showWords, textX, textY, fillColor) {
	canvasContext.fillStyle = fillColor;
	canvasContext.fillText(showWords, textX, textY);
}