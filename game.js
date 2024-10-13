const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 400;

// Mario 캐릭터 설정
const mario = {
  x: 50,
  y: 350,
  width: 40,
  height: 50,
  speed: 5,
  gravity: 0.6,
  jumpPower: 12,
  velocityY: 0,
  jumping: false,
};

// 장애물(플랫폼)과 코인을 저장하는 배열
let platforms = [
  { x: 100, y: 300, width: 200, height: 20 },
  { x: 400, y: 250, width: 150, height: 20 },
  { x: 700, y: 200, width: 150, height: 20 }
];

let coins = [
  { x: 150, y: 270, radius: 10, collected: false },
  { x: 450, y: 220, radius: 10, collected: false },
  { x: 750, y: 170, radius: 10, collected: false }
];

// 카메라 설정
let cameraX = 0;  // 카메라의 X 위치
let cameraSpeed = 0;  // 카메라 속도

// 점수 설정
let score = 0;  // 게임 점수
let lastPlatformX = 700;  // 마지막 플랫폼의 X 좌표 저장 (장애물 반복 생성에 사용)

// 키 입력 상태
let keys = {};

window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
});

window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

// Mario 그리기
function drawMario() {
  ctx.fillStyle = 'red';
  ctx.fillRect(mario.x - cameraX, mario.y, mario.width, mario.height);
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

// 충돌 감지
function checkCollision() {
  platforms.forEach(platform => {
    if (
      mario.x < platform.x + platform.width &&
      mario.x + mario.width > platform.x &&
      mario.y + mario.height > platform.y &&
      mario.y + mario.height <= platform.y + mario.height
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

// Mario 동작 업데이트
function updateMario() {
  // 좌우 이동
  if (keys['ArrowRight']) {
    mario.x += mario.speed;
    cameraSpeed = mario.speed;  // 오른쪽으로 갈 때 카메라 움직임
  } else if (keys['ArrowLeft']) {
    mario.x -= mario.speed;
    cameraSpeed = -mario.speed;  // 왼쪽으로 갈 때 카메라 움직임
  } else {
    cameraSpeed = 0;  // 이동하지 않을 때 카메라 속도 0
  }

  // 점프
  if (keys['ArrowUp'] && !mario.jumping) {
    mario.jumping = true;
    mario.velocityY = -mario.jumpPower;
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

  checkCollision();  // 플랫폼 충돌 감지
  checkCoinCollision();  // 코인 충돌 감지
}

// 카메라 업데이트
function updateCamera() {
  // Mario가 화면의 중앙 근처에 있을 때만 카메라가 움직이도록 설정
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
  ctx.fillText(`Score: ${score}`, canvas.width - 150, 30);  // 화면 우측 상단에 점수 표시
}

// 장애물 및 코인 반복 생성
function generatePlatformsAndCoins() {
  // Mario가 마지막 생성된 플랫폼을 넘으면 새로운 플랫폼과 코인을 생성
  if (mario.x > lastPlatformX - 400) {
    // 새로운 플랫폼 추가
    const newPlatformX = lastPlatformX + Math.random() * 200 + 200;
    const newPlatformY = Math.random() * 150 + 150;  // Y 좌표 랜덤
    platforms.push({ x: newPlatformX, y: newPlatformY, width: 150, height: 20 });

    // 새로운 코인 추가
    coins.push({
      x: newPlatformX + Math.random() * 100,
      y: newPlatformY - 30,
      radius: 10,
      collected: false
    });

    // 마지막 플랫폼의 위치 업데이트
    lastPlatformX = newPlatformX;
  }
}

// 게임 루프
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);  // 이전 프레임 지우기
  drawMario();  // Mario 그리기
  drawPlatforms();  // 플랫폼 그리기
  drawCoins();  // 코인 그리기
  drawScore();  // 점수 그리기
  updateMario();  // Mario 동작 업데이트
  updateCamera();  // 카메라 업데이트
  generatePlatformsAndCoins();  // 새로운 플랫폼과 코인 생성

  requestAnimationFrame(gameLoop);  // 루프 계속 실행
}

gameLoop();
