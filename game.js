const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 400;

// Mario (플레이 캐릭터) 설정
let mario = {
  x: 50,
  y: 350,
  width: 40,
  height: 50,
  speed: 5,
  gravity: 0.6,
  jumpPower: 13,  // 점프 높이를 절반으로 낮춤 (18에서 9로 감소)
  velocityY: 0,
  jumping: false,
  alive: true  // Mario의 상태
};

// 이미지 로드
const marioImage = new Image();
const obstacleImage = new Image();
const deathImage = new Image();
marioImage.src = 'bocci1.png';  // 플레이 캐릭터 이미지 (bocci1.png)
obstacleImage.src = 'bocci2.png';  // 장애물 이미지 (bocci2.png)
deathImage.src = 'bocci2.png';  // 부딪힌 후 캐릭터 이미지 변경

// 플랫폼, 코인, 장애물 저장
let platforms = [];
let coins = [];
let obstacles = [];

// 카메라 설정
let cameraX = 0;
let cameraSpeed = 0;

// 점수 설정
let score = 0;
let lastPlatformX = 700;
let gameOver = false;  // 게임 종료 상태 저장

// 키 입력 처리
let keys = {};
window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup', (e) => keys[e.code] = false);

// Mario 그리기
function drawMario() {
  ctx.drawImage(marioImage, mario.x - cameraX, mario.y, mario.width, mario.height);
}

// 플랫폼 그리기
function drawPlatforms() {
  ctx.fillStyle = 'brown';
  platforms.forEach(platform => {
    ctx.fillRect(platform.x - cameraX, platform.y, platform.width, platform.height);
  });
}

// 코인 그리기
function drawCoins() {
  ctx.fillStyle = 'gold';
  coins.forEach(coin => {
    if (!coin.collected) {
      ctx.beginPath();
      ctx.arc(coin.x - cameraX, coin.y, coin.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

// 움직이는 장애물 그리기
function drawObstacles() {
  obstacles.forEach(obstacle => {
    ctx.drawImage(obstacleImage, obstacle.x - cameraX, obstacle.y, obstacle.width, obstacle.height);
  });
}

// 플랫폼 충돌 감지
function checkCollision() {
  platforms.forEach(platform => {
    if (
      mario.x < platform.x + platform.width &&
      mario.x + mario.width > platform.x &&
      mario.y + mario.height > platform.y &&
      mario.y + mario.height <= platform.y + platform.height
    ) {
      mario.y = platform.y - mario.height;
      mario.jumping = false;
      mario.velocityY = 0;
    }
  });
}

// 코인 충돌 감지
function checkCoinCollision() {
  coins.forEach(coin => {
    if (!coin.collected && mario.x < coin.x + coin.radius &&
        mario.x + mario.width > coin.x - coin.radius &&
        mario.y < coin.y + coin.radius && mario.y + mario.height > coin.y - coin.radius) {
      coin.collected = true;
      score += 100;  // 코인을 먹으면 100점 증가
    }
  });
}

// 장애물 충돌 감지 및 게임 종료 처리
function checkObstacleCollision() {
  obstacles.forEach(obstacle => {
    if (
      mario.x < obstacle.x + obstacle.width &&
      mario.x + mario.width > obstacle.x &&
      mario.y < obstacle.y + obstacle.height &&
      mario.y + mario.height > obstacle.y
    ) {
      mario.alive = false;  // Mario가 죽음
      marioImage.src = deathImage.src;  // 캐릭터 이미지 bocci2로 변경
      setTimeout(() => {
        gameOver = true;  // 3초 후에 게임 종료
      }, 3000);  // 3초 후에 게임 종료
    }
  });
}

// Mario 업데이트
function updateMario() {
  if (!mario.alive) return;  // Mario가 죽으면 동작 중지

  // 좌우 이동
  if (keys['ArrowRight']) {
    mario.x += mario.speed;
    cameraSpeed = mario.speed;
  } else if (keys['ArrowLeft']) {
    mario.x -= mario.speed;
    cameraSpeed = -mario.speed;
  } else {
    cameraSpeed = 0;
  }

  // 점프
  if (keys['ArrowUp'] && !mario.jumping) {
    mario.jumping = true;
    mario.velocityY = -mario.jumpPower;  // 점프 힘을 줄임 (9로 설정)
  }

  // 중력 적용
  mario.velocityY += mario.gravity;
  mario.y += mario.velocityY;

  // 바닥 충돌 처리
  if (mario.y + mario.height >= canvas.height) {
    mario.y = canvas.height - mario.height;
    mario.jumping = false;
    mario.velocityY = 0;
  }

  checkCollision();  // 플랫폼 충돌 체크
  checkCoinCollision();  // 코인 충돌 체크
  checkObstacleCollision();  // 장애물 충돌 체크
}

// 카메라 업데이트
function updateCamera() {
  if (gameOver) return;  // 게임 종료 시 카메라 멈춤

  const marioCenter = mario.x + mario.width / 2;
  const canvasCenter = canvas.width / 2;

  if (marioCenter > canvasCenter) {
    cameraX += cameraSpeed;
  }
}

// 점수 그리기
function drawScore() {
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, canvas.width - 150, 30);
}

// 장애물 및 코인 반복 생성
function generatePlatformsAndCoins() {
  if (mario.x > lastPlatformX - 400) {
    const newPlatformX = lastPlatformX + Math.random() * 200 + 200;
    const newPlatformY = Math.random() * 150 + 150;
    platforms.push({ x: newPlatformX, y: newPlatformY, width: 150, height: 20 });

    coins.push({
      x: newPlatformX + Math.random() * 100,
      y: newPlatformY - 30,
      radius: 10,
      collected: false
    });

    lastPlatformX = newPlatformX;
  }
}

// 랜덤 장애물 생성
function generateObstacles() {
  if (obstacles.length < 3) {  // 장애물 양을 절반으로 줄임 (기존 5에서 3으로)
    const obstacleX = mario.x + Math.random() * 500 + 300;
    const obstacleY = Math.random() * (canvas.height - 50);
    const obstacleWidth = 40;
    const obstacleHeight = 40;
    const obstacleSpeed = Math.random() * 2 + 1;

    obstacles.push({
      x: obstacleX,
      y: obstacleY,
      width: obstacleWidth,
      height: obstacleHeight,
      speed: obstacleSpeed
    });
  }
}

// 장애물 이동
function updateObstacles() {
  obstacles.forEach(obstacle => {
    obstacle.x -= obstacle.speed;  // 장애물이 왼쪽으로 이동

    // 장애물이 화면 밖으로 나가면 제거
    if (obstacle.x + obstacle.width < cameraX) {
      obstacles.shift();
    }
  });
}

// 게임 재시작
function resetGame() {
  mario = {
    x: 50,
    y: 350,
    width: 40,
    height: 50,
    speed: 5,
    gravity: 0.6,
    jumpPower: 13,  // 점프 높이를 절반으로 낮춤
    velocityY: 0,
    jumping: false,
    alive: true
  };

  marioImage.src = 'bocci1.png';  // 캐릭터 이미지 원래대로 복구

  platforms = [
    { x: 100, y: 300, width: 200, height: 20 },
    { x: 400, y: 250, width: 150, height: 20 },
    { x: 700, y: 200, width: 150, height: 20 }
  ];

  coins = [
    { x: 150, y: 270, radius: 10, collected: false },
    { x: 450, y: 220, radius: 10, collected: false },
    { x: 750, y: 170, radius: 10, collected: false }
  ];

  obstacles = [];
  cameraX = 0;
  cameraSpeed = 0;
  score = 0;
  lastPlatformX = 700;
  gameOver = false;
}

// 스페이스바로 게임 재시작 처리
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && gameOver) {
    resetGame();
    gameLoop();  // 게임 루프 다시 시작
  }
});

// 게임 루프
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);  // 이전 프레임 지우기

  if (gameOver) {
    ctx.fillStyle = 'red';
    ctx.font = '40px Arial';
    ctx.fillText('Game Over - Press Space to Restart', canvas.width / 2 - 200, canvas.height / 2);
    return;  // 게임 종료 상태에서는 동작 중지
  }

  if (mario.alive) {
    drawMario();  // Mario 그리기
  }

  drawPlatforms();  // 플랫폼 그리기
  drawCoins();  // 코인 그리기
  drawObstacles();  // 장애물 그리기
  drawScore();  // 점수 그리기
  updateMario();  // Mario 업데이트
  updateCamera();  // 카메라 업데이트
  generatePlatformsAndCoins();  // 플랫폼 및 코인 생성
  generateObstacles();  // 장애물 생성
  updateObstacles();  // 장애물 이동

  requestAnimationFrame(gameLoop);  // 루프 계속 실행
}

gameLoop();  // 게임 시작 시 호출
