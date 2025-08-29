// lib/captcha.ts
import { createCanvas, loadImage } from "canvas";
import crypto from "crypto";

export type CaptchaRecord = {
  hash: string;       // sha256 lowercase(answer + pepper)
  expiresAt: number;  // ms epoch
  tries: number;      // attempts guard
};

const PEPPER = process.env.CAPTCHA_PEPPER || "change-me-pepper";
const WIDTH = 180;
const HEIGHT = 64;

// In-memory store for demo; swap for Redis in production.
export const captchaStore = new Map<string, CaptchaRecord>();

export function randomId() {
  return crypto.randomBytes(16).toString("hex");
}

export function randomText(len = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function hashAnswer(ansLower: string) {
  return crypto.createHash("sha256").update(ansLower + PEPPER).digest("hex");
}

export function makeCaptcha(expireMs = 2 * 60 * 1000) {
  const id = randomId();
  const text = randomText(6);
  const png = renderCaptchaPng(text);

  captchaStore.set(id, {
    hash: hashAnswer(text.toLowerCase()),
    expiresAt: Date.now() + expireMs,
    tries: 0,
  });

  return { id, png }; // png is a Buffer
}

export function verifyCaptcha(id: string, value: string) {
  const rec = captchaStore.get(id);
  if (!rec) return { ok: false, reason: "not_found" };

  // single-use / brute-guard
  rec.tries++;
  if (rec.tries > 3) {
    captchaStore.delete(id);
    return { ok: false, reason: "too_many_attempts" };
  }

  if (Date.now() > rec.expiresAt) {
    captchaStore.delete(id);
    return { ok: false, reason: "expired" };
  }

  const ok = rec.hash === hashAnswer((value || "").toLowerCase());
  if (ok) captchaStore.delete(id); // one-time
  return { ok, reason: ok ? "ok" : "mismatch" };
}

/** Draws noisy, distorted PNG with sine warp + random char rotation */
function renderCaptchaPng(text: string): Buffer {
  // Draw text on a temp canvas
  const base = createCanvas(WIDTH, HEIGHT);
  const bctx = base.getContext("2d");

  // Background grain
  bctx.fillStyle = "#f2f4f7";
  bctx.fillRect(0, 0, WIDTH, HEIGHT);
  addGrain(bctx, WIDTH, HEIGHT, 90); // tiny speckles

  // Text settings
  const fonts = ["600 36px 'Arial'", "600 36px 'Verdana'", "600 36px 'Tahoma'"];
  const marginX = 18;
  const charW = (WIDTH - marginX * 2) / text.length;
  const baseY = HEIGHT / 2 + 12;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const angle = (Math.random() - 0.5) * 0.6; // ±~17°
    const x = marginX + i * charW + charW / 2;
    const y = baseY + (Math.random() - 0.5) * 6;

    bctx.save();
    bctx.translate(x, y);
    bctx.rotate(angle);
    bctx.font = fonts[Math.floor(Math.random() * fonts.length)];
    // Off-black + slight alpha jitter
    bctx.fillStyle = `rgba(${20 + Math.floor(Math.random() * 40)},${20 + Math.floor(Math.random() * 40)},${20 + Math.floor(Math.random() * 40)},0.92)`;
    bctx.textAlign = "center";
    bctx.textBaseline = "middle";
    // Shadow-ish jitter
    bctx.translate((Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5);
    bctx.fillText(ch, 0, 0);
    bctx.restore();
  }

  // Noise lines (beziers)
  addNoiseCurves(bctx, WIDTH, HEIGHT, 3 + Math.floor(Math.random() * 3));
  // Dots/shot noise
  addNoiseDots(bctx, WIDTH, HEIGHT, 150);

  // Sine wave warp → draw to final canvas
  const out = createCanvas(WIDTH, HEIGHT);
  const octx = out.getContext("2d");
  const ampX = 4 + Math.random() * 5;                 // horizontal sine amp
  const waveLenX = 40 + Math.random() * 30;
  const phaseX = Math.random() * Math.PI * 2;
  const ampY = 2 + Math.random() * 3;                  // vertical sine amp
  const waveLenY = 25 + Math.random() * 25;
  const phaseY = Math.random() * Math.PI * 2;

  // Efficient line-by-line remap
  for (let y = 0; y < HEIGHT; y++) {
    const dx = Math.sin((y / waveLenX) * 2 * Math.PI + phaseX) * ampX;
    const sy = y + Math.sin((y / waveLenY) * 2 * Math.PI + phaseY) * ampY;
    octx.drawImage(base, 0, Math.max(Math.min(sy, HEIGHT - 1), 0), WIDTH, 1, dx, y, WIDTH, 1);
  }

  // Final extra faint noise on top
  octx.globalAlpha = 0.06;
  addGrain(octx, WIDTH, HEIGHT, 50);
  octx.globalAlpha = 1;

  return out.toBuffer("image/png", { compressionLevel: 9 });
}

function addNoiseCurves(ctx: CanvasRenderingContext2D, w: number, h: number, count: number) {
  for (let i = 0; i < count; i++) {
    ctx.beginPath();
    ctx.moveTo(-10, Math.random() * h);
    const cp1x = Math.random() * w * 0.5;
    const cp1y = Math.random() * h;
    const cp2x = Math.random() * w * 0.8;
    const cp2y = Math.random() * h;
    const endX = w + 10;
    const endY = Math.random() * h;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    ctx.lineWidth = 1 + Math.random() * 1.2;
    ctx.strokeStyle = `rgba(${60 + Math.floor(Math.random() * 80)},${60 + Math.floor(Math.random() * 80)},${60 + Math.floor(Math.random() * 80)},${0.25 + Math.random() * 0.25})`;
    ctx.stroke();
  }
}

function addNoiseDots(ctx: CanvasRenderingContext2D, w: number, h: number, n: number) {
  for (let i = 0; i < n; i++) {
    ctx.beginPath();
    const r = Math.random() * 1.2;
    ctx.arc(Math.random() * w, Math.random() * h, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,0,0,${0.2 + Math.random() * 0.4})`;
    ctx.fill();
  }
}

function addGrain(ctx: CanvasRenderingContext2D, w: number, h: number, n: number) {
  for (let i = 0; i < n; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const alpha = 0.04 + Math.random() * 0.05;
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    ctx.fillRect(x, y, 1, 1);
  }
}
