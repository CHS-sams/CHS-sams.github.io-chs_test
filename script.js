const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const textCanvas = document.createElement("canvas");
const tctx = textCanvas.getContext("2d");

let blocks = [];
let mouseActive = false;

const mouse = {
  x: 0,
  y: 0,
  radius: 600
};

let lastClickTime = 0;
const DOUBLE_CLICK_TIME = 300;

// =========================
// ポインター操作
// =========================
canvas.addEventListener("pointerdown", e => {
  canvas.setPointerCapture(e.pointerId);

  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouseActive = true;

  const now = performance.now();
  if (e.isPrimary && now - lastClickTime < DOUBLE_CLICK_TIME) {
    explode();
  }
  lastClickTime = now;
});

canvas.addEventListener("pointermove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

canvas.addEventListener("pointerup", e => {
  canvas.releasePointerCapture(e.pointerId);
  mouseActive = false;
});

canvas.addEventListener("pointercancel", () => {
  mouseActive = false;
});

// =========================
// リサイズ
// =========================
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  textCanvas.width = canvas.width;
  textCanvas.height = canvas.height;

  makeBlocks();
}
window.addEventListener("resize", resize);
resize();

// =========================
// 文字 → ブロック生成
// =========================
function makeBlocks() {
  tctx.clearRect(0, 0, textCanvas.width, textCanvas.height);

  const fontSize = Math.min(canvas.width, canvas.height) * 0.3;
  tctx.fillStyle = "black";
  tctx.font = `bold ${fontSize}px sans-serif`;
  tctx.textAlign = "center";
  tctx.textBaseline = "middle";
  tctx.fillText("CHS株式会社", textCanvas.width / 2, textCanvas.height / 2);

  const imageData = tctx.getImageData(0, 0, textCanvas.width, textCanvas.height);
  const data = imageData.data;

  const step = Math.max(6, Math.floor(Math.min(canvas.width, canvas.height) / 150));
  blocks = [];

  for (let y = 0; y < textCanvas.height; y += step) {
    for (let x = 0; x < textCanvas.width; x += step) {
      const i = (y * textCanvas.width + x) * 4;
      if (data[i + 3] > 0) {
        blocks.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: 0,
          vy: 0,
          tx: x,
          ty: y,
          size: step * 0.6
        });
      }
    }
  }
}

// =========================
// 爆散
// =========================
function explode() {
  for (const b of blocks) {
    const a = Math.random() * Math.PI * 2;
    const p = Math.random() * 600 + 200;
    b.vx += Math.cos(a) * p;
    b.vy += Math.sin(a) * p;
  }
}

// =========================
// メインループ
// =========================
ctx.fillStyle = "white";

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const b of blocks) {
    if (mouseActive) {
      const dx = b.x - mouse.x;
      const dy = b.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mouse.radius && dist > 0.001) {
        const f = (mouse.radius - dist) / mouse.radius;
        b.vx += (dx / dist) * f * 6;
        b.vy += (dy / dist) * f * 6;
      }
    } else {
      // 修復
      b.vx += (b.tx - b.x) * 0.01;
      b.vy += (b.ty - b.y) * 0.01;
    }

    // 摩擦
    b.vx *= 0.85;
    b.vy *= 0.85;

    b.x += b.vx;
    b.y += b.vy;

    ctx.fillRect(b.x, b.y, b.size, b.size);
  }

  requestAnimationFrame(loop);
}

loop();
