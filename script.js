const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.addEventListener("mousedown", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouseActive = true;
});

canvas.addEventListener("mouseup", () => {
  mouseActive = false;
});

// 画面外にマウス出た時も解除（地味に大事）
canvas.addEventListener("mouseleave", () => {
  mouseActive = false;
});
canvas.addEventListener("mousedown", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouseActive = true;

  const now = performance.now();
  if (now - lastClickTime < DOUBLE_CLICK_TIME) {
    explode();
  }
  lastClickTime = now;
});



const textCanvas = document.createElement("canvas");
const tctx = textCanvas.getContext("2d");

let targets = [];
let blocks = [];
let mouseActive = false;


let mouse = {
  x: 0,
  y: 0,
  radius: 120
};

let lastClickTime = 0;
const DOUBLE_CLICK_TIME = 300; // ms


window.addEventListener("mousemove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});



function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  textCanvas.width = canvas.width;
  textCanvas.height = canvas.height;

  makeTargets();
}

window.addEventListener("resize", resize);
resize();

function makeTargets() {
  tctx.clearRect(0, 0, textCanvas.width, textCanvas.height);

  tctx.fillStyle = "black";
  tctx.font = `bold ${Math.min(canvas.width, canvas.height) * 0.3}px sans-serif`;
  tctx.textAlign = "center";
  tctx.textBaseline = "middle";
  tctx.fillText("CHS株式会社", textCanvas.width / 2, textCanvas.height / 2);

  const imageData = tctx.getImageData(0, 0, textCanvas.width, textCanvas.height);
  const data = imageData.data;

  targets = [];
  for (let y = 0; y < textCanvas.height; y += 6) {
    for (let x = 0; x < textCanvas.width; x += 6) {
      const i = (y * textCanvas.width + x) * 4;
      if (data[i + 3] > 0) {
        targets.push({ x, y });
      }
    }
  }

blocks = targets.map(t => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  vx: 0,
  vy: 0,
  tx: t.x,
  ty: t.y
}));
}

function explode() {
  for (const b of blocks) {
    const angle = Math.random() * Math.PI * 2;
    const power = Math.random() * 500 + 10;
    b.vx += Math.cos(angle) * power;
    b.vy += Math.sin(angle) * power;
  }
}


ctx.fillStyle = "white";

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const b of blocks) {
    if (mouseActive) {
  const dx = b.x - mouse.x;
  const dy = b.y - mouse.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < mouse.radius && dist > 0.001) {
    const force = (mouse.radius - dist) / mouse.radius;
    b.vx += (dx / dist) * force * 5;
    b.vy += (dy / dist) * force * 5;
  }
}


    // 修復：元の位置に戻ろうとする
    b.vx += (b.tx - b.x) * 0.01;
    b.vy += (b.ty - b.y) * 0.01;

    // 摩擦（これがないと永久機関）
    b.vx *= 0.85;
    b.vy *= 0.85;

    b.x += b.vx;
    b.y += b.vy;

    ctx.fillRect(b.x, b.y, 3, 3);
  }

  requestAnimationFrame(loop);
}

loop();

