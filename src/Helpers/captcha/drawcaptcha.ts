import { rand, randInt } from "./captchaUtils";

export function drawCaptcha(canvas : any, code : any) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  drawBackground(ctx, W, H);
  drawNoiseDots(ctx, W, H);
  drawInterferenceLines(ctx, W, H);
  drawCharacters(ctx, code, W, H);
  drawScanLines(ctx, W, H);
}

function drawBackground(ctx : any, W : any, H : any) {
  ctx.fillStyle = "#0d0d14";
  ctx.fillRect(0, 0, W, H);
}

function drawNoiseDots(ctx : any, W : any, H : any) {
  for (let i = 0; i < 120; i++) {
    ctx.beginPath();
    ctx.arc(rand(0, W), rand(0, H), rand(0.5, 1.5), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(1,150,254,${rand(0.1, 0.35)})`;
    ctx.fill();
  }
}

function drawInterferenceLines(ctx : any, W : any, H : any) {
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(rand(0, W), rand(0, H));
    ctx.bezierCurveTo(
      rand(0, W), rand(0, H),
      rand(0, W), rand(0, H),
      rand(0, W), rand(0, H)
    );
    ctx.strokeStyle = `rgba(1,150,254,${rand(0.08, 0.2)})`;
    ctx.lineWidth = rand(0.5, 1.5);
    ctx.stroke();
  }
}

function drawCharacters(ctx : any, code : any, W : any, H : any) {
  const fonts = ["monospace", "serif", "cursive"];
  const colors = ["#fff", "#e0f0ff", "#a8d8ff", "#0196fe", "#38b6ff"];
  const charW = W / (code.length + 1);

  code.split("").forEach((char : any, i : any) => {
    ctx.save();

    const x = charW * (i + 0.8) + rand(-4, 4);
    const y = H / 2 + rand(-6, 6);
    const angle = rand(-0.3, 0.3);
    const size = randInt(22, 30);
    const font = fonts[i % fonts.length];

    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.shadowColor = "#0196fe";
    ctx.shadowBlur = randInt(4, 10);
    ctx.fillStyle = colors[randInt(0, colors.length)];
    ctx.font = `bold ${size}px ${font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(char, 0, 0);

    ctx.restore();
  });
}

function drawScanLines(ctx : any, W : any, H : any) {
  for (let y = 0; y < H; y += 3) {
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fillRect(0, y, W, 1);
  }
}