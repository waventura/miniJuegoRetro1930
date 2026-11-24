// Generador procedural de fondos con textura de acuarela vintage 1930 (Silly Symphonies)
import { WORLD_W, WORLD_H } from './config.js';

function seededRand(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export class WatercolorRenderer {
  constructor() {
    this.cache = new Map();
    this.paperPattern = null;
  }

  _getPaperPattern(ctx) {
    if (this.paperPattern) return this.paperPattern;
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 160;
    pCanvas.height = 160;
    const pCtx = pCanvas.getContext('2d');
    const rand = seededRand(1930);

    // Fibra sutil de papel acuarela prensado en frío
    pCtx.fillStyle = 'rgba(246, 236, 214, 0.04)';
    pCtx.fillRect(0, 0, 160, 160);
    for (let i = 0; i < 650; i++) {
      const x = rand() * 160;
      const y = rand() * 160;
      const r = 0.6 + rand() * 1.6;
      pCtx.fillStyle = rand() > 0.5 ? 'rgba(90, 68, 45, 0.045)' : 'rgba(255, 250, 238, 0.06)';
      pCtx.beginPath();
      pCtx.arc(x, y, r, 0, Math.PI * 2);
      pCtx.fill();
    }
    for (let i = 0; i < 45; i++) {
      pCtx.strokeStyle = 'rgba(110, 85, 58, 0.035)';
      pCtx.lineWidth = 1;
      pCtx.beginPath();
      const x = rand() * 160;
      const y = rand() * 160;
      pCtx.moveTo(x, y);
      pCtx.lineTo(x + (rand() - 0.5) * 28, y + (rand() - 0.5) * 10);
      pCtx.stroke();
    }

    this.paperPattern = ctx.createPattern(pCanvas, 'repeat');
    return this.paperPattern;
  }

  getWorldCanvas(worldDef) {
    if (this.cache.has(worldDef.id)) {
      return this.cache.get(worldDef.id);
    }

    // Usamos resolución 0.5x para textura suave de acuarela y mínimo consumo de RAM en tablet
    const scale = 0.5;
    const cw = Math.floor(WORLD_W * scale);
    const ch = Math.floor(WORLD_H * scale);
    const canvas = document.createElement('canvas');
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    const p = worldDef.palette;
    const seedMap = { bosque: 1931, desierto: 1934, pirata: 1937, montana: 1939 };
    const rand = seededRand(seedMap[worldDef.id] || 1930);

    // 1. Base cálida de papel acuarela
    ctx.fillStyle = p.base;
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);

    // 2. Grandes pinceladas húmedas de acuarela (radial washes)
    const washColors = [p.wash1, p.wash2, p.wash3];
    for (let i = 0; i < 65; i++) {
      const x = rand() * WORLD_W;
      const y = rand() * WORLD_H;
      const rad = 160 + rand() * 320;
      const col = washColors[Math.floor(rand() * washColors.length)];
      const grad = ctx.createRadialGradient(x, y, rad * 0.1, x, y, rad);
      grad.addColorStop(0, col + '55');
      grad.addColorStop(0.65, col + '28');
      grad.addColorStop(1, col + '00');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(x, y, rad, rad * (0.65 + rand() * 0.45), rand() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Elementos escénicos propios de cada mundo
    this._drawWorldLandmarks(ctx, worldDef, rand);

    // 4. Sendero pintado a mano desde el campamento (izquierda) hasta la arena del jefe (derecha)
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = p.path;
    ctx.lineWidth = 128;
    ctx.globalAlpha = 0.72;
    ctx.beginPath();
    ctx.moveTo(260, 740);
    ctx.bezierCurveTo(650, 520, 960, 960, 1340, 720);
    ctx.bezierCurveTo(1600, 550, 1780, 680, 1960, 710);
    ctx.stroke();

    // Borde sutil entintado estilo caricatura 1930 en el camino
    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = '#3a2b1f';
    ctx.lineWidth = 5;
    ctx.setLineDash([22, 16]);
    ctx.stroke();
    ctx.restore();

    // 5. Arena circular del Jefe Cómico (este del mapa)
    ctx.save();
    const bx = 1960;
    const by = 710;
    const arenaGrad = ctx.createRadialGradient(bx, by, 40, bx, by, 265);
    arenaGrad.addColorStop(0, p.wash3 + 'cc');
    arenaGrad.addColorStop(0.82, p.path + '99');
    arenaGrad.addColorStop(1, p.path + '00');
    ctx.fillStyle = arenaGrad;
    ctx.beginPath();
    ctx.arc(bx, by, 265, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(42, 28, 19, 0.35)';
    ctx.lineWidth = 6;
    ctx.setLineDash([18, 12]);
    ctx.beginPath();
    ctx.arc(bx, by, 228, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 6. Zona acogedora de campamento / Mesa de Crafteo (oeste)
    ctx.save();
    ctx.fillStyle = p.wash3 + 'bb';
    ctx.strokeStyle = 'rgba(42, 28, 19, 0.28)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(320, 740, 185, 135, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 7. Detalles florales / piedritas / hierba entintada
    for (let i = 0; i < 120; i++) {
      const x = 90 + rand() * (WORLD_W - 180);
      const y = 90 + rand() * (WORLD_H - 180);
      ctx.save();
      ctx.translate(x, y);
      ctx.strokeStyle = 'rgba(40, 30, 22, 0.28)';
      ctx.lineWidth = 2.5;
      if (worldDef.id === 'bosque') {
        ctx.beginPath();
        ctx.moveTo(-7, 4);
        ctx.quadraticCurveTo(-5, -8, -1, 4);
        ctx.moveTo(0, 4);
        ctx.quadraticCurveTo(4, -10, 8, 4);
        ctx.stroke();
      } else if (worldDef.id === 'desierto') {
        ctx.beginPath();
        ctx.arc(0, 0, 5 + rand() * 5, Math.PI, 0);
        ctx.stroke();
      } else if (worldDef.id === 'pirata') {
        ctx.fillStyle = 'rgba(255, 245, 225, 0.55)';
        ctx.beginPath();
        ctx.arc(0, 0, 4 + rand() * 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Copito vintage
        ctx.beginPath();
        ctx.moveTo(-6, 0); ctx.lineTo(6, 0);
        ctx.moveTo(0, -6); ctx.lineTo(0, 6);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 8. Textura de papel acuarela sobre todo el lienzo
    const pat = this._getPaperPattern(ctx);
    if (pat) {
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, WORLD_W, WORLD_H);
    }

    // 9. Marco suave de borde del mapa
    ctx.strokeStyle = 'rgba(38, 28, 20, 0.35)';
    ctx.lineWidth = 18;
    ctx.strokeRect(24, 24, WORLD_W - 48, WORLD_H - 48);

    this.cache.set(worldDef.id, canvas);
    return canvas;
  }

  _drawWorldLandmarks(ctx, worldDef, rand) {
    const p = worldDef.palette;
    if (worldDef.id === 'bosque') {
      // Riachuelo serpenteante en acuarela azul
      ctx.save();
      ctx.strokeStyle = p.water + 'aa';
      ctx.lineWidth = 72;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(920, -20);
      ctx.bezierCurveTo(1060, 320, 780, 520, 960, 860);
      ctx.bezierCurveTo(1120, 1140, 880, 1280, 980, WORLD_H + 30);
      ctx.stroke();
      // Puente de madera sobre el río en el camino
      ctx.fillStyle = '#9c683c';
      ctx.strokeStyle = '#2a1d14';
      ctx.lineWidth = 5;
      ctx.fillRect(855, 650, 155, 130);
      ctx.strokeRect(855, 650, 155, 130);
      for (let x = 875; x < 1005; x += 22) {
        ctx.beginPath();
        ctx.moveTo(x, 650);
        ctx.lineTo(x, 780);
        ctx.stroke();
      }
      ctx.restore();
    } else if (worldDef.id === 'desierto') {
      // Oasis turquesa + pirámides vintage decorativas al fondo norte
      ctx.save();
      ctx.fillStyle = p.water + 'bb';
      ctx.strokeStyle = '#2a1d14';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(1060, 360, 175, 92, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Pirámide dibujada estilo 1930 en la esquina superior
      const drawPy = (px, py, s) => {
        ctx.fillStyle = '#dfa957';
        ctx.beginPath();
        ctx.moveTo(px, py - s);
        ctx.lineTo(px + s, py + s * 0.5);
        ctx.lineTo(px - s, py + s * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'rgba(120, 72, 28, 0.25)';
        ctx.beginPath();
        ctx.moveTo(px, py - s);
        ctx.lineTo(px + s, py + s * 0.5);
        ctx.lineTo(px + s * 0.15, py + s * 0.5);
        ctx.closePath();
        ctx.fill();
      };
      drawPy(1650, 210, 110);
      drawPy(1810, 235, 78);
      ctx.restore();
    } else if (worldDef.id === 'pirata') {
      // Mar turquesa bordeando el sur y norte, con muelle de madera
      ctx.save();
      ctx.fillStyle = p.water + 'cc';
      ctx.beginPath();
      ctx.moveTo(0, 1220);
      for (let x = 0; x <= WORLD_W; x += 120) {
        ctx.quadraticCurveTo(x + 60, 1170 + (rand() - 0.5) * 40, x + 120, 1220);
      }
      ctx.lineTo(WORLD_W, WORLD_H);
      ctx.lineTo(0, WORLD_H);
      ctx.closePath();
      ctx.fill();
      // Muelle pirata
      ctx.fillStyle = '#9c6b3f';
      ctx.strokeStyle = '#2a1d14';
      ctx.lineWidth = 5;
      ctx.fillRect(1100, 1080, 140, 240);
      ctx.strokeRect(1100, 1080, 140, 240);
      for (let y = 1105; y < 1310; y += 26) {
        ctx.beginPath();
        ctx.moveTo(1100, y);
        ctx.lineTo(1240, y);
        ctx.stroke();
      }
      ctx.restore();
    } else if (worldDef.id === 'montana') {
      // Lago helado brillante en el centro-sur
      ctx.save();
      ctx.fillStyle = '#a8d6eb';
      ctx.strokeStyle = '#2d4559';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(1120, 1080, 210, 110, 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Brillos diagonales de hielo
      ctx.strokeStyle = 'rgba(255,255,255,0.65)';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(1010, 1045); ctx.lineTo(1080, 1015);
      ctx.moveTo(1085, 1100); ctx.lineTo(1195, 1055);
      ctx.stroke();
      ctx.restore();
    }
  }
}
