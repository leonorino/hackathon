const ctx = document.getElementById('cell').getContext('2d');

// параметры
const anodes = [
  {x: 190, y: 85}, {x: 300, y: 85}, {x: 410, y: 85}
];
const cathodeY = 330;
let bubbles = [];
let alLayer = 0; // текущий уровень алюминия
let anomaly = false;

function spawnCO2() {
  anodes.forEach(a => {
    bubbles.push({
      x: a.x,
      y: a.y + 45 + Math.random() * 10,
      r: 6 + Math.random() * 4,
      vy: 1 + Math.random(),
      alpha: 1
    });
  });
}

// анимация движения ионов
function drawIons() {
  // Al3+ от электролита вниз к катоду
  for (let i = 0; i < 10; ++i) {
    let frac = i / 9;
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(44,100,255,0.8)';
    ctx.moveTo(300 + Math.sin(frac*3)*80, 110 + frac * (cathodeY-110));
    ctx.lineTo(300 + Math.sin(frac*3)*80, 110 + (frac+0.08) * (cathodeY-110));
    ctx.stroke();
  }
  // O2- от электролита вверх к анодам
  anodes.forEach(a => {
    for (let i = 0; i < 7; ++i) {
      let frac = i / 6;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(100,255,180,0.7)';
      ctx.moveTo(a.x-20, 220 - frac * 110);
      ctx.lineTo(a.x-20, 220 - (frac+0.13) * 110);
      ctx.stroke();
    }
  });
}

// рисуем электролизёр (упрощённо)
function drawCell() {
  // Корпус
  ctx.fillStyle = '#547cb7';
  ctx.fillRect(80,80,440,270);
  // Ванна/электролит
  ctx.fillStyle = anomaly ? '#ffd7d7' : '#aee0fb';
  ctx.fillRect(110,110,380,180);
  // Слой алюминия
  ctx.fillStyle = '#c8a562';
  ctx.fillRect(110, 300-alLayer, 380, alLayer);
  // Катод
  ctx.fillStyle = '#606060';
  ctx.fillRect(110,330,380,15);
  // Аноды
  anodes.forEach(a => {
    ctx.fillStyle = anomaly ? '#db2828' : '#bcbcbc';
    ctx.fillRect(a.x-30,75,60,65);
    ctx.font = "bold 30px sans-serif";
    ctx.fillStyle = "#fff";
    ctx.fillText("+", a.x-10, 110);
  });
}

// анимация пузырьков CO₂
function stepBubbles() {
  bubbles.forEach(b => {
    ctx.globalAlpha = b.alpha;
    ctx.fillStyle = "#87d3f8";
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
    ctx.fill();
    b.y -= b.vy;
    b.alpha -= 0.009;
  });
  ctx.globalAlpha = 1;
  // удаляем исчезнувшие пузырьки
  bubbles = bubbles.filter(b => b.alpha > 0);
}

// аварийный эффект
function drawAnomaly() {
  if (anomaly) {
    for (let i = 0; i < 25; ++i) {
      ctx.fillStyle = `rgba(255,${75+Math.random()*180},0,${Math.random()})`;
      ctx.beginPath();
      let ax = anodes[Math.floor(Math.random()*3)].x + Math.random()*40-20;
      let ay = 85 + Math.random()*25;
      ctx.arc(ax, ay, 3+Math.random()*3, 0, Math.PI*2);
      ctx.fill();
    }
  }
}

// главный цикл
function draw() {
  ctx.clearRect(0,0,600,400);
  drawCell();
  drawIons();
  stepBubbles();
  drawAnomaly();
  requestAnimationFrame(draw);
}

// тест накопления алюминия и генерации пузырьков
setInterval(() => {
  spawnCO2();
  if (alLayer < 40) alLayer += 2;
}, 1000);

// сценарий сбоя: переключение аварии мышью
document.getElementById('cell').onclick = () => anomaly = !anomaly;

draw();
