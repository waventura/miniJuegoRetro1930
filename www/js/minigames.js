// 6 Minijuegos de Acción y Puntería Rápida estilo Caricatura Clásica 1930 (Rubber Hose a 12 fps)
import { STAGE_W, STAGE_H } from './config.js';
import {
  drawHero1930,
  drawPieCutEye,
  drawCartoonGlove,
  drawRubberLimb,
  drawStarShape,
  drawVintageFilmOverlay
} from './rubberhose.js';

const INK = '#1d1714';

// --- Utilidades compartidas de dibujo de escenarios vintage 1930 ---
function drawCarnivalBackdrop(ctx, frame12, skyTop, skyBot, hillColor, groundColor, showCurtains = false) {
  // Cielo acuarela vintage
  const grad = ctx.createLinearGradient(0, 0, 0, STAGE_H);
  grad.addColorStop(0, skyTop);
  grad.addColorStop(0.65, skyBot);
  grad.addColorStop(1, groundColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, STAGE_W, STAGE_H);

  // Sol sonriente 1930 en la esquina
  const sunRot = (frame12 % 24) * 0.06;
  ctx.save();
  ctx.translate(1160, 145);
  ctx.rotate(sunRot);
  ctx.fillStyle = '#ffe066';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  for (let i = 0; i < 10; i++) {
    ctx.rotate((Math.PI * 2) / 10);
    ctx.beginPath();
    ctx.moveTo(46, -8);
    ctx.lineTo(70, 0);
    ctx.lineTo(46, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
  ctx.save();
  ctx.translate(1160, 145);
  ctx.fillStyle = '#ffd447';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(0, 0, 44, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  drawPieCutEye(ctx, -12, -4, 6, 8, 0, 0, false);
  drawPieCutEye(ctx, 12, -4, 6, 8, 0, 0, false);
  ctx.beginPath();
  ctx.arc(0, 8, 12, 0.15, Math.PI - 0.15);
  ctx.stroke();
  ctx.restore();

  // Nubes retro flotantes a 12 fps
  const cloudDrift = (frame12 * 3) % (STAGE_W + 260);
  const drawCloud = (cx, cy, s) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    ctx.fillStyle = '#fff9ec';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-28, 6, 22, 0, Math.PI * 2);
    ctx.arc(0, -6, 30, 0, Math.PI * 2);
    ctx.arc(30, 6, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };
  drawCloud(((240 + cloudDrift) % (STAGE_W + 240)) - 120, 145, 1.05);
  drawCloud(((780 + cloudDrift * 0.7) % (STAGE_W + 240)) - 120, 195, 0.85);

  // Colinas onduladas en acuarela
  ctx.fillStyle = hillColor;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(0, 520);
  ctx.quadraticCurveTo(320, 420, 680, 505);
  ctx.quadraticCurveTo(1040, 585, STAGE_W, 470);
  ctx.lineTo(STAGE_W, STAGE_H);
  ctx.lineTo(0, STAGE_H);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Suelo base
  ctx.fillStyle = groundColor;
  ctx.fillRect(0, 560, STAGE_W, STAGE_H - 560);

  // Banderines de feria 1930 arriba
  const flagColors = ['#d9483b', '#f2c144', '#4d96a8', '#569c5d'];
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 82);
  ctx.quadraticCurveTo(STAGE_W / 2, 128, STAGE_W, 82);
  ctx.stroke();
  for (let i = 0; i < 16; i++) {
    const t = (i + 0.5) / 16;
    const fx = t * STAGE_W;
    const fy = 82 + Math.sin(t * Math.PI) * 23;
    ctx.fillStyle = flagColors[i % flagColors.length];
    ctx.beginPath();
    ctx.moveTo(fx - 18, fy);
    ctx.lineTo(fx + 18, fy);
    ctx.lineTo(fx, fy + 34 + Math.sin(frame12 * 0.5 + i) * 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Cortinas rojas de teatro/feria a los lados (para Pasteles y Patos)
  if (showCurtains) {
    for (const side of [0, 1]) {
      ctx.save();
      ctx.fillStyle = '#b8322c';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      const sx = side === 0 ? 0 : STAGE_W;
      const dir = side === 0 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx + dir * 95, 0);
      ctx.quadraticCurveTo(sx + dir * 65, STAGE_H * 0.5, sx + dir * 110, STAGE_H);
      ctx.lineTo(sx, STAGE_H);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }
}

function drawComicPopup(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  const scale = 0.85 + Math.min(0.35, (1 - p.life / p.maxLife) * 0.8);
  ctx.scale(scale, scale);
  ctx.globalAlpha = Math.min(1, p.life * 2.2);
  ctx.font = '900 34px "Fredoka", "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.lineWidth = 7;
  ctx.strokeStyle = INK;
  ctx.strokeText(p.text, 0, 0);
  ctx.fillStyle = p.color;
  ctx.fillText(p.text, 0, 0);
  ctx.restore();
}

// Clase base para los 6 minijuegos
class BaseMiniGame {
  constructor(host) {
    this.host = host; // { addScore, addCombo, resetCombo, audio, voice, charDef, sprites }
    this.particles = [];
    this.popups = [];
    this.shake = 0;
    this.heroAttack = 0;
  }

  spawnParticles(x, y, color, count = 12) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 90 + Math.random() * 240;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 70,
        r: 5 + Math.random() * 6,
        color,
        life: 0.45 + Math.random() * 0.35
      });
    }
  }

  spawnPopup(x, y, text, color = '#ffe052') {
    this.popups.push({ x, y, text, color, life: 0.85, maxLife: 0.85 });
  }

  updateCommon(dt) {
    this.shake = Math.max(0, this.shake - dt * 18);
    this.heroAttack = Math.max(0, this.heroAttack - dt);
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 380 * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const pop = this.popups[i];
      pop.y -= 55 * dt;
      pop.life -= dt;
      if (pop.life <= 0) this.popups.splice(i, 1);
    }
  }

  renderCommonFX(ctx, frame12) {
    for (const p of this.particles) {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    for (const pop of this.popups) {
      drawComicPopup(ctx, pop);
    }
    drawVintageFilmOverlay(ctx, STAGE_W, STAGE_H, frame12);
  }

  onPointerDown() {}
  onPointerMove() {}
  onPointerUp() {}
}

// =========================================================================
// 1. ¡APLASTATOPOS 1930! (Whack-a-Villain con mazo Rubber Hose)
// =========================================================================
class ToposMiniGame extends BaseMiniGame {
  constructor(host) {
    super(host);
    this.holes = [];
    const cols = [330, 670, 1010];
    const rows = [345, 515, 685];
    for (const y of rows) {
      for (const x of cols) {
        this.holes.push({
          x,
          y,
          state: 'empty', // empty | up | bonked
          kind: 'topo',   // topo | hongo | dorado | patito
          timer: 0.4 + Math.random() * 1.4,
          popHeight: 0
        });
      }
    }
    this.mallet = { x: 670, y: 400, swing: 0 };
  }

  update(dt) {
    this.updateCommon(dt);
    this.mallet.swing = Math.max(0, this.mallet.swing - dt * 5);

    for (const h of this.holes) {
      h.timer -= dt;
      if (h.state === 'empty') {
        h.popHeight = Math.max(0, h.popHeight - dt * 6);
        if (h.timer <= 0) {
          h.state = 'up';
          const r = Math.random();
          h.kind = r < 0.14 ? 'dorado' : r < 0.28 ? 'patito' : r < 0.64 ? 'topo' : 'hongo';
          h.timer = h.kind === 'dorado' ? 1.15 : 1.55 + Math.random() * 0.7;
        }
      } else if (h.state === 'up') {
        h.popHeight = Math.min(1, h.popHeight + dt * 7);
        if (h.timer <= 0) {
          h.state = 'empty';
          h.timer = 0.45 + Math.random() * 1.25;
        }
      } else if (h.state === 'bonked') {
        h.popHeight = Math.max(0, h.popHeight - dt * 4.5);
        if (h.timer <= 0) {
          h.state = 'empty';
          h.timer = 0.5 + Math.random() * 1.1;
        }
      }
    }
  }

  onPointerDown(x, y) {
    this.mallet = { x, y, swing: 1 };
    this.heroAttack = 0.25;
    let hitAny = false;

    for (const h of this.holes) {
      if (h.state !== 'up') continue;
      if (Math.hypot(x - h.x, y - (h.y - 42)) < 98) {
        hitAny = true;
        h.state = 'bonked';
        h.timer = 0.35;
        if (h.kind === 'patito') {
          this.host.audio.play('hurt');
          this.host.resetCombo();
          this.host.addScore(-15);
          this.spawnPopup(h.x, h.y - 80, '¡CUAC! -15', '#ff8a80');
          this.spawnParticles(h.x, h.y - 40, '#ffe066', 10);
        } else {
          const pts = h.kind === 'dorado' ? 45 : 20;
          this.host.addCombo();
          const gained = this.host.addScore(pts);
          this.host.audio.play(h.kind === 'dorado' ? 'chest' : 'hit');
          this.shake = h.kind === 'dorado' ? 8 : 4;
          this.spawnPopup(
            h.x,
            h.y - 84,
            h.kind === 'dorado' ? `⭐ ¡SUPER +${gained}!` : `¡BONK! +${gained}`,
            h.kind === 'dorado' ? '#ffe052' : '#fff7d6'
          );
          this.spawnParticles(h.x, h.y - 44, h.kind === 'dorado' ? '#ffd447' : '#f28c52', 14);
        }
        break;
      }
    }
    if (!hitAny) {
      this.host.audio.play('swing');
    }
  }

  render(ctx, frame12) {
    ctx.save();
    if (this.shake > 0) {
      ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
    }
    drawCarnivalBackdrop(ctx, frame12, '#cbe6eb', '#e8f0d5', '#9ec482', '#7ba864', false);

    // Héroe animando en la esquina izquierda
    drawHero1930(
      ctx,
      { x: 118, y: 735, facingX: 1, moving: false, attackTimer: this.heroAttack, shieldActive: false, hurtTimer: 0, weapon: 'hacha' },
      this.host.charDef,
      frame12,
      this.host.sprites
    );

    // 9 madrigueras con topos/hongos/patitos
    for (const h of this.holes) {
      // Hueco oscuro
      ctx.fillStyle = '#3b2619';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(h.x, h.y + 8, 82, 28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Personaje asomándose
      if (h.popHeight > 0.04) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(h.x - 95, h.y - 145, 190, 158);
        ctx.clip();

        const rise = h.popHeight * 76;
        const cy = h.y + 38 - rise;
        const squashed = h.state === 'bonked' ? 0.65 : 1;
        ctx.translate(h.x, cy);
        ctx.scale(h.state === 'bonked' ? 1.25 : 1, squashed);

        ctx.strokeStyle = INK;
        ctx.lineWidth = 3.5;
        if (h.kind === 'topo' || h.kind === 'dorado') {
          ctx.fillStyle = h.kind === 'dorado' ? '#f5c542' : '#8c5a37';
          ctx.beginPath();
          ctx.arc(0, -16, 44, Math.PI, 0);
          ctx.lineTo(44, 42);
          ctx.lineTo(-44, 42);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          // Casco vintage
          ctx.fillStyle = h.kind === 'dorado' ? '#fff2a6' : '#d9483b';
          ctx.beginPath();
          ctx.ellipse(0, -48, 38, 16, 0, Math.PI, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          // Nariz rosada
          ctx.fillStyle = '#f28d8d';
          ctx.beginPath();
          ctx.ellipse(0, -8, 11, 7, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else if (h.kind === 'hongo') {
          ctx.fillStyle = '#fae8c8';
          ctx.beginPath();
          ctx.roundRect(-24, -22, 48, 60, 14);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#d14338';
          ctx.beginPath();
          ctx.ellipse(0, -24, 52, 30, 0, Math.PI, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#fff9eb';
          ctx.beginPath();
          ctx.arc(-20, -36, 9, 0, Math.PI * 2);
          ctx.arc(18, -38, 8, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Patito amigable (NO golpear)
          ctx.fillStyle = '#ffe052';
          ctx.beginPath();
          ctx.arc(0, -14, 38, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#f08a2e';
          ctx.beginPath();
          ctx.ellipse(0, -2, 16, 8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        // Ojos pie-cut
        drawPieCutEye(ctx, -14, -20, 7.5, 10, 0, 0, h.state === 'bonked');
        drawPieCutEye(ctx, 14, -20, 7.5, 10, 0, 0, h.state === 'bonked');
        ctx.restore();
      }

      // Borde frontal de tierra de la madriguera
      ctx.fillStyle = '#99673c';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.ellipse(h.x, h.y + 22, 88, 16, 0, 0, Math.PI);
      ctx.fill();
      ctx.stroke();
    }

    // Mazo gigante caricatura 1930 al golpear
    if (this.mallet.swing > 0) {
      ctx.save();
      ctx.translate(this.mallet.x + 35, this.mallet.y + 15);
      ctx.rotate(-0.8 + (1 - this.mallet.swing) * 1.1);
      ctx.fillStyle = '#a86a38';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.roundRect(-8, -10, 16, 88, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#d9483b';
      ctx.beginPath();
      ctx.roundRect(-48, -42, 96, 46, 14);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
    this.renderCommonFX(ctx, frame12);
  }
}

// =========================================================================
// 2. ¡GUERRA DE PASTELES! (Pie Toss Carnival)
// =========================================================================
class PastelesMiniGame extends BaseMiniGame {
  constructor(host) {
    super(host);
    this.targets = [];
    this.pies = [];
    this.splats = [];
    this.spawnTimer = 0.2;
  }

  _spawnTarget() {
    const lane = Math.random() < 0.5 ? 0 : 1;
    const fromLeft = lane === 0;
    const kinds = ['tronco', 'faraon', 'pulpo', 'yeti'];
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    const isGold = Math.random() < 0.16;
    this.targets.push({
      x: fromLeft ? -70 : STAGE_W + 70,
      y: lane === 0 ? 315 : 510,
      vx: (fromLeft ? 1 : -1) * (175 + Math.random() * 145 + (isGold ? 70 : 0)),
      kind,
      isGold,
      hit: false,
      hitTimer: 0,
      seed: Math.floor(Math.random() * 20)
    });
  }

  update(dt) {
    this.updateCommon(dt);
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.targets.length < 7) {
      this._spawnTarget();
      this.spawnTimer = 0.65 + Math.random() * 0.45;
    }

    for (let i = this.targets.length - 1; i >= 0; i--) {
      const t = this.targets[i];
      if (t.hit) {
        t.hitTimer -= dt;
        t.y += 220 * dt;
        if (t.hitTimer <= 0) this.targets.splice(i, 1);
      } else {
        t.x += t.vx * dt;
        if (t.x < -140 || t.x > STAGE_W + 140) this.targets.splice(i, 1);
      }
    }

    // Pasteles volando en arco 3D hacia el punto tocado
    for (let i = this.pies.length - 1; i >= 0; i--) {
      const p = this.pies[i];
      p.t += dt * 4.2;
      if (p.t >= 1) {
        this._resolvePieImpact(p.tx, p.ty);
        this.pies.splice(i, 1);
      }
    }

    for (let i = this.splats.length - 1; i >= 0; i--) {
      this.splats[i].life -= dt;
      if (this.splats[i].life <= 0) this.splats.splice(i, 1);
    }
  }

  _resolvePieImpact(tx, ty) {
    let hitTarget = null;
    for (const t of this.targets) {
      if (!t.hit && Math.hypot(tx - t.x, ty - (t.y - 36)) < 96) {
        hitTarget = t;
        break;
      }
    }

    this.splats.push({ x: tx, y: ty, life: 0.7 });
    this.spawnParticles(tx, ty, '#fff9eb', 14);

    if (hitTarget) {
      hitTarget.hit = true;
      hitTarget.hitTimer = 0.45;
      this.host.addCombo();
      const pts = hitTarget.isGold ? 50 : 25;
      const gained = this.host.addScore(pts);
      this.host.audio.play(hitTarget.isGold ? 'chest' : 'hit');
      this.shake = 5;
      this.spawnPopup(
        hitTarget.x,
        hitTarget.y - 80,
        hitTarget.isGold ? `🥧 ¡PASTELAZO +${gained}!` : `¡SPLAT! +${gained}`,
        hitTarget.isGold ? '#ffe052' : '#fff9eb'
      );
    } else {
      this.host.audio.play('chop');
      this.host.resetCombo();
    }
  }

  onPointerDown(x, y) {
    this.heroAttack = 0.25;
    this.host.audio.play('swing');
    this.pies.push({ sx: STAGE_W / 2, sy: STAGE_H - 40, tx: x, ty: y, t: 0 });
  }

  render(ctx, frame12) {
    ctx.save();
    if (this.shake > 0) {
      ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
    }
    drawCarnivalBackdrop(ctx, frame12, '#f7e3bd', '#edd09c', '#cfa165', '#a67241', true);

    // Dos mostradores de madera de feria
    for (const rowY of [345, 540]) {
      ctx.fillStyle = '#995e30';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.fillRect(80, rowY, STAGE_W - 160, 28);
      ctx.strokeRect(80, rowY, STAGE_W - 160, 28);
    }

    // Villanos cómicos desfilando
    for (const t of this.targets) {
      const bob = Math.abs(Math.sin((frame12 + t.seed) * 0.55)) * 10;
      ctx.save();
      ctx.translate(t.x, t.y - bob);
      const colors = {
        tronco: '#7d4d2c',
        faraon: '#e5c158',
        pulpo: '#9e4770',
        yeti: '#dce9f2'
      };
      ctx.fillStyle = t.isGold ? '#ffd447' : colors[t.kind];
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(-42, -92, 84, 92, 26);
      ctx.fill();
      ctx.stroke();

      // Guantes blancos saludando burlonamente
      drawRubberLimb(ctx, -40, -52, -62, -70, -64, -46 + bob, 8);
      drawRubberLimb(ctx, 40, -52, 62, -70, 64, -46 - bob, 8);
      drawCartoonGlove(ctx, -64, -46 + bob, -0.4, 1.0);
      drawCartoonGlove(ctx, 64, -46 - bob, 0.4, 1.0);

      drawPieCutEye(ctx, -15, -58, 9, 12, 0, 0, t.hit);
      drawPieCutEye(ctx, 15, -58, 9, 12, 0, 0, t.hit);

      // Crema en la cara si recibió pastelazo
      if (t.hit) {
        ctx.fillStyle = '#fffcf5';
        ctx.beginPath();
        ctx.arc(0, -48, 34, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    // Manchas de crema recientes
    for (const s of this.splats) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, s.life * 1.5);
      ctx.fillStyle = '#fffdf7';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 26, 0, Math.PI * 2);
      ctx.arc(s.x - 20, s.y + 10, 12, 0, Math.PI * 2);
      ctx.arc(s.x + 22, s.y - 8, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Héroe lanzando pasteles al frente
    drawHero1930(
      ctx,
      { x: 150, y: 760, facingX: 1, moving: false, attackTimer: this.heroAttack, shieldActive: false, hurtTimer: 0, weapon: null },
      this.host.charDef,
      frame12,
      this.host.sprites
    );

    // Pasteles en vuelo
    for (const p of this.pies) {
      const px = p.sx + (p.tx - p.sx) * p.t;
      const py = p.sy + (p.ty - p.sy) * p.t - Math.sin(p.t * Math.PI) * 140;
      const sc = 1.4 - p.t * 0.65;
      ctx.save();
      ctx.translate(px, py);
      ctx.scale(sc, sc);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3.5;
      // Plato metálico
      ctx.fillStyle = '#cfd8dc';
      ctx.beginPath();
      ctx.ellipse(0, 10, 36, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Crema batida 1930
      ctx.fillStyle = '#fffdf7';
      ctx.beginPath();
      ctx.arc(-14, 0, 16, 0, Math.PI * 2);
      ctx.arc(14, 0, 16, 0, Math.PI * 2);
      ctx.arc(0, -14, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Cereza roja
      ctx.fillStyle = '#d93b3b';
      ctx.beginPath();
      ctx.arc(0, -32, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
    this.renderCommonFX(ctx, frame12);
  }
}

// =========================================================================
// 3. ¡FERIA DE GLOBOS! (Balloon Pop Arcade)
// =========================================================================
class GlobosMiniGame extends BaseMiniGame {
  constructor(host) {
    super(host);
    this.balloons = [];
    this.spawnTimer = 0.1;
  }

  _spawnBalloon(xOverride = null, yOverride = null, mini = false) {
    const palette = ['#e05248', '#4fa3c7', '#62ab67', '#e882a5', '#f2b844'];
    const isGold = !mini && Math.random() < 0.14;
    const isGiant = !mini && !isGold && Math.random() < 0.12;
    this.balloons.push({
      x: xOverride ?? (120 + Math.random() * (STAGE_W - 240)),
      y: yOverride ?? (STAGE_H + 80),
      vy: -(115 + Math.random() * 115 + (isGold ? 85 : 0)),
      r: mini ? 34 : isGiant ? 74 : isGold ? 46 : 48 + Math.random() * 12,
      color: isGold ? '#ffd447' : palette[Math.floor(Math.random() * palette.length)],
      isGold,
      isGiant,
      phase: Math.random() * Math.PI * 2
    });
  }

  update(dt) {
    this.updateCommon(dt);
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.balloons.length < 13) {
      this._spawnBalloon();
      this.spawnTimer = 0.42 + Math.random() * 0.35;
    }

    for (let i = this.balloons.length - 1; i >= 0; i--) {
      const b = this.balloons[i];
      b.y += b.vy * dt;
      b.x += Math.sin(b.y * 0.015 + b.phase) * 55 * dt;
      if (b.y < -120) this.balloons.splice(i, 1);
    }
  }

  onPointerDown(x, y) {
    this.heroAttack = 0.22;
    let popped = false;
    for (let i = this.balloons.length - 1; i >= 0; i--) {
      const b = this.balloons[i];
      if (Math.hypot(x - b.x, y - b.y) < b.r + 28) {
        popped = true;
        this.balloons.splice(i, 1);
        this.host.addCombo();
        const pts = b.isGold ? 45 : b.isGiant ? 35 : 15;
        const gained = this.host.addScore(pts);
        this.host.audio.play(b.isGold ? 'chest' : 'pickup');
        this.spawnParticles(b.x, b.y, b.color, 16);
        this.spawnPopup(
          b.x,
          b.y - 10,
          b.isGold ? `⭐ ¡ORO +${gained}!` : b.isGiant ? `💥 ¡MEGA +${gained}!` : `¡POP! +${gained}`,
          b.isGold ? '#ffe052' : '#fff9eb'
        );
        if (b.isGiant) {
          this.shake = 6;
          for (let k = -1; k <= 1; k++) {
            this._spawnBalloon(b.x + k * 60, b.y + 15, true);
          }
        }
        break;
      }
    }
    if (!popped) {
      this.host.audio.play('swing');
    }
  }

  render(ctx, frame12) {
    ctx.save();
    if (this.shake > 0) {
      ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
    }
    drawCarnivalBackdrop(ctx, frame12, '#a9d6e8', '#e5f3f7', '#a8cc91', '#88b372', false);

    drawHero1930(
      ctx,
      { x: 120, y: 745, facingX: 1, moving: false, attackTimer: this.heroAttack, shieldActive: false, hurtTimer: 0, weapon: 'varita' },
      this.host.charDef,
      frame12,
      this.host.sprites
    );

    for (const b of this.balloons) {
      ctx.save();
      ctx.translate(b.x, b.y);
      // Cuerda ondulada Rubber Hose
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, b.r);
      ctx.quadraticCurveTo(Math.sin(frame12 * 0.6 + b.phase) * 14, b.r + 32, 0, b.r + 64);
      ctx.stroke();

      // Globo
      ctx.fillStyle = b.color;
      ctx.lineWidth = 3.8;
      ctx.beginPath();
      ctx.ellipse(0, 0, b.r * 0.9, b.r * 1.05, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Brillo y carita sonriente 1930
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.beginPath();
      ctx.ellipse(-b.r * 0.32, -b.r * 0.36, b.r * 0.16, b.r * 0.28, -0.35, 0, Math.PI * 2);
      ctx.fill();

      drawPieCutEye(ctx, -b.r * 0.24, -4, 6, 8, 0, 0, false);
      drawPieCutEye(ctx, b.r * 0.24, -4, 6, 8, 0, 0, false);

      if (b.isGold) {
        drawStarShape(ctx, 0, -b.r * 0.55, 14, 6, 5, '#fff5b8');
      }
      ctx.restore();
    }

    ctx.restore();
    this.renderCommonFX(ctx, frame12);
  }
}

// =========================================================================
// 4. ¡TIRO AL PATO RETRO! (Carnival Duck Gallery)
// =========================================================================
class PatosMiniGame extends BaseMiniGame {
  constructor(host) {
    super(host);
    this.ducks = [];
    this.shots = [];
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < 5; i++) {
        this._addDuck(row, 180 + i * 245);
      }
    }
  }

  _addDuck(row, x) {
    const r = Math.random();
    const kind = r < 0.18 ? 'gold' : r < 0.36 ? 'pirate' : 'duck';
    this.ducks.push({
      row,
      x,
      y: row === 0 ? 335 : 535,
      dir: row === 0 ? 1 : -1,
      speed: row === 0 ? 165 : 215,
      kind,
      flipped: 0
    });
  }

  update(dt) {
    this.updateCommon(dt);
    for (const d of this.ducks) {
      d.x += d.dir * d.speed * dt;
      if (d.dir > 0 && d.x > STAGE_W + 90) {
        d.x = -90;
        d.flipped = 0;
      } else if (d.dir < 0 && d.x < -90) {
        d.x = STAGE_W + 90;
        d.flipped = 0;
      }
      if (d.flipped > 0) {
        d.flipped = Math.max(0, d.flipped - dt);
      }
    }
    for (let i = this.shots.length - 1; i >= 0; i--) {
      this.shots[i].life -= dt;
      if (this.shots[i].life <= 0) this.shots.splice(i, 1);
    }
  }

  onPointerDown(x, y) {
    this.heroAttack = 0.22;
    this.shots.push({ x, y, life: 0.25 });
    let hit = false;
    for (const d of this.ducks) {
      if (d.flipped > 0) continue;
      if (Math.hypot(x - d.x, y - (d.y - 36)) < 84) {
        hit = true;
        d.flipped = 2.4;
        this.host.addCombo();
        const pts = d.kind === 'gold' ? 50 : d.kind === 'pirate' ? 30 : 20;
        const gained = this.host.addScore(pts);
        this.host.audio.play(d.kind === 'gold' ? 'chest' : 'star');
        this.shake = 4;
        this.spawnParticles(d.x, d.y - 38, d.kind === 'gold' ? '#ffd447' : '#85d4e8', 14);
        this.spawnPopup(
          d.x,
          d.y - 80,
          d.kind === 'gold' ? `⭐ ¡DIANA +${gained}!` : `¡PUM! +${gained}`,
          d.kind === 'gold' ? '#ffe052' : '#fff9eb'
        );
        break;
      }
    }
    if (!hit) {
      this.host.audio.play('swing');
      this.host.resetCombo();
    }
  }

  render(ctx, frame12) {
    ctx.save();
    if (this.shake > 0) {
      ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
    }
    drawCarnivalBackdrop(ctx, frame12, '#f7ecd0', '#e8d7b0', '#79b4c4', '#4e8ea3', true);

    const drawWaves = (wy, col) => {
      ctx.fillStyle = col;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(80, wy);
      for (let x = 80; x <= STAGE_W - 80; x += 80) {
        const off = Math.sin(frame12 * 0.5 + x * 0.02) * 8;
        ctx.quadraticCurveTo(x + 40, wy - 20 + off, x + 80, wy);
      }
      ctx.lineTo(STAGE_W - 80, wy + 55);
      ctx.lineTo(80, wy + 55);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    for (const row of [0, 1]) {
      const wy = row === 0 ? 355 : 555;
      for (const d of this.ducks.filter((k) => k.row === row)) {
        const bob = Math.sin(frame12 * 0.6 + d.x * 0.02) * 5;
        ctx.save();
        ctx.translate(d.x, d.y + bob);
        if (d.dir < 0) ctx.scale(-1, 1);
        if (d.flipped > 0) ctx.scale(1, 0.25);

        ctx.strokeStyle = INK;
        ctx.lineWidth = 3.5;
        ctx.fillStyle = d.kind === 'gold' ? '#ffd447' : d.kind === 'pirate' ? '#c94a38' : '#ffe66d';
        // Cuerpo patito de hojalata
        ctx.beginPath();
        ctx.ellipse(0, -18, 40, 26, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Cabeza
        ctx.beginPath();
        ctx.arc(24, -48, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Pico naranja
        ctx.fillStyle = '#f08a2e';
        ctx.beginPath();
        ctx.ellipse(46, -45, 14, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Diana en el ala
        ctx.fillStyle = '#fff9eb';
        ctx.beginPath();
        ctx.arc(-4, -18, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#d9483b';
        ctx.beginPath();
        ctx.arc(-4, -18, 7, 0, Math.PI * 2);
        ctx.fill();

        drawPieCutEye(ctx, 26, -52, 5.5, 7.5, 0.3, 0, false);
        ctx.restore();
      }
      drawWaves(wy, row === 0 ? '#69adc2' : '#4a8ea6');
    }

    // Mira de disparo estrella
    for (const s of this.shots) {
      drawStarShape(ctx, s.x, s.y, 26, 12, 5, '#ffe052');
    }

    drawHero1930(
      ctx,
      { x: 165, y: 760, facingX: 1, moving: false, attackTimer: this.heroAttack, shieldActive: false, hurtTimer: 0, weapon: 'varita' },
      this.host.charDef,
      frame12,
      this.host.sprites
    );

    ctx.restore();
    this.renderCommonFX(ctx, frame12);
  }
}

// =========================================================================
// 5. ¡LLUVIA DE TESOROS! (Atrapar estrellas + explotar bombas en el aire)
// =========================================================================
class TesorosMiniGame extends BaseMiniGame {
  constructor(host) {
    super(host);
    this.heroX = STAGE_W / 2;
    this.targetX = STAGE_W / 2;
    this.facingX = 1;
    this.items = [];
    this.spawnTimer = 0.2;
  }

  _spawnItem() {
    const r = Math.random();
    const kind = r < 0.2 ? 'bomb' : r < 0.42 ? 'cupcake' : r < 0.65 ? 'gem' : 'star';
    this.items.push({
      x: 110 + Math.random() * (STAGE_W - 220),
      y: -50,
      vy: 190 + Math.random() * 145,
      kind,
      rot: Math.random() * Math.PI
    });
  }

  update(dt) {
    this.updateCommon(dt);
    const diff = this.targetX - this.heroX;
    if (Math.abs(diff) > 6) {
      this.facingX = diff > 0 ? 1 : -1;
      this.heroX += Math.sign(diff) * Math.min(Math.abs(diff), 680 * dt);
    }

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.items.length < 10) {
      this._spawnItem();
      this.spawnTimer = 0.48 + Math.random() * 0.35;
    }

    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      it.y += it.vy * dt;
      it.rot += dt * 2.5;

      // Atrapar con el héroe
      if (Math.abs(it.x - this.heroX) < 88 && it.y > 610 && it.y < 745) {
        this.items.splice(i, 1);
        if (it.kind === 'bomb') {
          this.host.audio.play('hurt');
          this.host.resetCombo();
          this.host.addScore(-20);
          this.shake = 7;
          this.spawnPopup(this.heroX, 600, '💥 ¡UPS! -20', '#ff8a80');
          this.spawnParticles(this.heroX, 660, '#3a302b', 14);
        } else {
          this.host.addCombo();
          const pts = it.kind === 'gem' ? 35 : 20;
          const gained = this.host.addScore(pts);
          this.host.audio.play('pickup');
          this.spawnPopup(this.heroX, 600, `✨ ¡+${gained}!`, '#ffe052');
          this.spawnParticles(this.heroX, 650, '#ffd447', 10);
        }
        continue;
      }

      if (it.y > STAGE_H + 60) {
        this.items.splice(i, 1);
      }
    }
  }

  onPointerDown(x, y) {
    // Si toca una bomba en el aire, ¡la explota por puntos extra!
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      if (it.kind === 'bomb' && Math.hypot(x - it.x, y - it.y) < 76) {
        this.items.splice(i, 1);
        this.heroAttack = 0.25;
        this.host.addCombo();
        const gained = this.host.addScore(30);
        this.host.audio.play('star');
        this.spawnParticles(it.x, it.y, '#ff9d47', 16);
        this.spawnPopup(it.x, it.y - 20, `💥 ¡ZAP +${gained}!`, '#ffe052');
        return;
      }
    }
    this.targetX = Math.max(90, Math.min(STAGE_W - 90, x));
  }

  onPointerMove(x) {
    this.targetX = Math.max(90, Math.min(STAGE_W - 90, x));
  }

  render(ctx, frame12) {
    ctx.save();
    if (this.shake > 0) {
      ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
    }
    drawCarnivalBackdrop(ctx, frame12, '#f5d6e0', '#faebd2', '#d9a5b5', '#b87f92', false);

    // Objetos cayendo
    for (const it of this.items) {
      ctx.save();
      ctx.translate(it.x, it.y);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3.5;
      if (it.kind === 'star') {
        ctx.rotate(it.rot);
        drawStarShape(ctx, 0, 0, 30, 14, 5, '#ffd447');
      } else if (it.kind === 'gem') {
        ctx.fillStyle = '#5cd6e6';
        ctx.beginPath();
        ctx.moveTo(0, -30);
        ctx.lineTo(24, -6);
        ctx.lineTo(0, 30);
        ctx.lineTo(-24, -6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (it.kind === 'cupcake') {
        ctx.fillStyle = '#d98a4a';
        ctx.beginPath();
        ctx.roundRect(-20, 0, 40, 22, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#f58ea8';
        ctx.beginPath();
        ctx.arc(0, -4, 24, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#d93838';
        ctx.beginPath();
        ctx.arc(0, -28, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        // Bomba gruñona (¡tócala en el aire!)
        ctx.fillStyle = '#332b29';
        ctx.beginPath();
        ctx.arc(0, 4, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        drawPieCutEye(ctx, -9, 2, 5, 7, 0, 0, false);
        drawPieCutEye(ctx, 9, 2, 5, 7, 0, 0, false);
        // Chispa
        drawStarShape(ctx, 14, -28, 12, 5, 5, '#ff9d3b');
      }
      ctx.restore();
    }

    // Canasta gigante + personaje
    drawHero1930(
      ctx,
      {
        x: this.heroX,
        y: 745,
        facingX: this.facingX,
        moving: Math.abs(this.targetX - this.heroX) > 12,
        attackTimer: this.heroAttack,
        shieldActive: false,
        hurtTimer: 0,
        weapon: null
      },
      this.host.charDef,
      frame12,
      this.host.sprites
    );

    ctx.restore();
    this.renderCommonFX(ctx, frame12);
  }
}

// =========================================================================
// 6. ¡FIESTA DE PIÑATA! (Boss Piñata Party)
// =========================================================================
class PinataMiniGame extends BaseMiniGame {
  constructor(host) {
    super(host);
    this.pinata = {
      x: STAGE_W / 2,
      y: 350,
      vx: 250,
      vy: 165,
      scale: 1,
      hits: 0,
      maxHits: 12
    };
    this.candies = [];
  }

  update(dt) {
    this.updateCommon(dt);
    const p = this.pinata;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.scale += (1 - p.scale) * Math.min(1, dt * 10);

    if (p.x < 180 || p.x > STAGE_W - 180) p.vx *= -1;
    if (p.y < 210 || p.y > 540) p.vy *= -1;

    for (let i = this.candies.length - 1; i >= 0; i--) {
      const c = this.candies[i];
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.vy += 260 * dt;
      c.life -= dt;
      if (c.y > STAGE_H + 50 || c.life <= 0) this.candies.splice(i, 1);
    }
  }

  onPointerDown(x, y) {
    this.heroAttack = 0.22;

    // 1. Tocar dulces que caen para puntos rápidos
    for (let i = this.candies.length - 1; i >= 0; i--) {
      const c = this.candies[i];
      if (Math.hypot(x - c.x, y - c.y) < 62) {
        this.candies.splice(i, 1);
        this.host.addCombo();
        const gained = this.host.addScore(20);
        this.host.audio.play('pickup');
        this.spawnPopup(c.x, c.y - 16, `🍬 +${gained}`, '#ffe052');
        this.spawnParticles(c.x, c.y, c.color, 8);
        return;
      }
    }

    // 2. Golpear la Piñata Estelar gigante
    const p = this.pinata;
    if (Math.hypot(x - p.x, y - p.y) < 120) {
      p.hits++;
      p.scale = 1.24;
      p.vx = (Math.random() < 0.5 ? -1 : 1) * (240 + Math.random() * 170);
      p.vy = (Math.random() < 0.5 ? -1 : 1) * (150 + Math.random() * 120);
      this.host.addCombo();
      const gained = this.host.addScore(15);
      this.host.audio.play('hit');
      this.shake = 5;
      this.spawnParticles(p.x, p.y, '#ffd447', 10);
      this.spawnPopup(p.x, p.y - 80, `¡DALE! +${gained}`, '#fff9eb');

      // Suelta dulces al golpearla
      const cols = ['#e05248', '#5cd6e6', '#ffd447', '#f58ea8', '#62ab67'];
      for (let k = 0; k < 2; k++) {
        this.candies.push({
          x: p.x,
          y: p.y,
          vx: (Math.random() - 0.5) * 320,
          vy: -140 - Math.random() * 160,
          color: cols[Math.floor(Math.random() * cols.length)],
          life: 3.4
        });
      }

      if (p.hits >= p.maxHits) {
        p.hits = 0;
        const bonus = this.host.addScore(80);
        this.host.audio.play('victory');
        this.shake = 10;
        this.spawnParticles(p.x, p.y, '#ffe052', 28);
        this.spawnPopup(p.x, p.y - 100, `🪅 ¡EXPLOSIÓN +${bonus}!`, '#ffe052');
        for (let k = 0; k < 6; k++) {
          this.candies.push({
            x: p.x,
            y: p.y,
            vx: (Math.random() - 0.5) * 460,
            vy: -180 - Math.random() * 200,
            color: cols[k % cols.length],
            life: 4.0
          });
        }
      }
    } else {
      this.host.audio.play('swing');
    }
  }

  render(ctx, frame12) {
    ctx.save();
    if (this.shake > 0) {
      ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
    }
    drawCarnivalBackdrop(ctx, frame12, '#e2d1f0', '#f7ebd2', '#b896cc', '#9473ab', false);

    const p = this.pinata;
    // Cuerda colgando del techo
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(STAGE_W / 2, 0);
    ctx.quadraticCurveTo((STAGE_W / 2 + p.x) / 2, p.y * 0.4, p.x, p.y - 70);
    ctx.stroke();

    // Piñata Estelar 1930
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(p.scale, p.scale);
    ctx.rotate(Math.sin(frame12 * 0.5) * 0.14);
    drawStarShape(ctx, 0, 0, 102, 54, 7, '#f26b8a');
    drawStarShape(ctx, 0, 0, 68, 36, 7, '#ffd447');
    drawPieCutEye(ctx, -18, -6, 9, 12, 0, 0, false);
    drawPieCutEye(ctx, 18, -6, 9, 12, 0, 0, false);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, 12, 16, 0.15, Math.PI - 0.15);
    ctx.stroke();
    ctx.restore();

    // Dulces volando
    for (const c of this.candies) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.fillStyle = c.color;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, 22, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-22, 0); ctx.lineTo(-34, -10); ctx.lineTo(-34, 10); ctx.closePath();
      ctx.moveTo(22, 0); ctx.lineTo(34, -10); ctx.lineTo(34, 10); ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    drawHero1930(
      ctx,
      { x: 135, y: 745, facingX: 1, moving: false, attackTimer: this.heroAttack, shieldActive: false, hurtTimer: 0, weapon: 'espada' },
      this.host.charDef,
      frame12,
      this.host.sprites
    );

    ctx.restore();
    this.renderCommonFX(ctx, frame12);
  }
}

export function createMiniGame(id, host) {
  switch (id) {
    case 'topos': return new ToposMiniGame(host);
    case 'pasteles': return new PastelesMiniGame(host);
    case 'globos': return new GlobosMiniGame(host);
    case 'patos': return new PatosMiniGame(host);
    case 'tesoros': return new TesorosMiniGame(host);
    case 'pinata': return new PinataMiniGame(host);
    default: return new ToposMiniGame(host);
  }
}
