// Motor gráfico Caricatura Clásica 1930 (Rubber Hose a color a 12 fps)
// Extremidades flexibles curvas, guantes blancos de 3 dedos, ojos pie-cut y rebote rítmico.

const INK = '#1d1714';

// Dibuja un ojo "pie-cut" clásico de los años 1930
export function drawPieCutEye(ctx, x, y, rx, ry, lookX = 0, lookY = 0, blinking = false) {
  ctx.save();
  ctx.translate(x, y);
  if (blinking) {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-rx, 0);
    ctx.quadraticCurveTo(0, -ry * 0.45, rx, 0);
    ctx.stroke();
    ctx.restore();
    return;
  }

  // Esclera crema vintage
  ctx.fillStyle = '#fff9eb';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pupila pie-cut (óvalo negro con cuña triangular recortada)
  const px = Math.max(-rx * 0.28, Math.min(rx * 0.28, lookX * rx * 0.35));
  const py = Math.max(-ry * 0.22, Math.min(ry * 0.22, lookY * ry * 0.28));
  const prx = rx * 0.56;
  const pry = ry * 0.64;

  ctx.save();
  ctx.translate(px, py);
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  // Recorte pie-cut en la esquina superior derecha
  ctx.ellipse(0, 0, prx, pry, 0, -0.15, Math.PI * 2 - 0.85);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

// Dibuja un guante blanco clásico de caricatura 1930 con 3 rayitas en el dorso
export function drawCartoonGlove(ctx, x, y, angle = 0, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);

  ctx.fillStyle = '#fffcf5';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.8;

  // Palma redondeada + dedos cartoon
  ctx.beginPath();
  ctx.ellipse(0, 0, 10, 8.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pulgar
  ctx.beginPath();
  ctx.ellipse(-6, -6, 4.5, 3.6, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Puño del guante
  ctx.fillStyle = '#f5ecd7';
  ctx.beginPath();
  ctx.roundRect(-11, -4, 5, 8, 2);
  ctx.fill();
  ctx.stroke();

  // 3 líneas características en el dorso del guante
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-2, -3.5); ctx.lineTo(3, -3.5);
  ctx.moveTo(-2, 0); ctx.lineTo(4, 0);
  ctx.moveTo(-2, 3.5); ctx.lineTo(3, 3.5);
  ctx.stroke();

  ctx.restore();
}

// Dibuja una extremidad Rubber Hose (manguera curva flexible)
export function drawRubberLimb(ctx, x1, y1, cx, cy, x2, y2, thickness = 7.5) {
  ctx.save();
  ctx.strokeStyle = INK;
  ctx.lineWidth = thickness;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(cx, cy, x2, y2);
  ctx.stroke();
  ctx.restore();
}

// Dibuja el arma o herramienta equipada en la mano del personaje
export function drawEquippedTool(ctx, weaponId, x, y, angle) {
  if (!weaponId) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';

  if (weaponId === 'hacha') {
    // Mango de madera
    ctx.fillStyle = '#9c6334';
    ctx.beginPath();
    ctx.roundRect(-3, -34, 7, 42, 3);
    ctx.fill();
    ctx.stroke();
    // Hoja de hacha vintage
    ctx.fillStyle = '#cfd8dc';
    ctx.beginPath();
    ctx.moveTo(2, -32);
    ctx.quadraticCurveTo(22, -36, 20, -16);
    ctx.quadraticCurveTo(10, -12, 2, -18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (weaponId === 'espada') {
    // Empuñadura dorada
    ctx.fillStyle = '#e5a93c';
    ctx.beginPath();
    ctx.roundRect(-10, -8, 20, 6, 3);
    ctx.fill();
    ctx.stroke();
    // Hoja brillante
    ctx.fillStyle = '#e3edf2';
    ctx.beginPath();
    ctx.moveTo(-5, -8);
    ctx.lineTo(-4, -44);
    ctx.lineTo(0, -54);
    ctx.lineTo(4, -44);
    ctx.lineTo(5, -8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (weaponId === 'pico') {
    ctx.fillStyle = '#8c562b';
    ctx.beginPath();
    ctx.roundRect(-3, -32, 6, 38, 3);
    ctx.fill();
    ctx.stroke();
    // Cabeza de cristal turquesa
    ctx.fillStyle = '#5cd6e6';
    ctx.beginPath();
    ctx.moveTo(-22, -24);
    ctx.quadraticCurveTo(0, -40, 22, -24);
    ctx.quadraticCurveTo(0, -28, -22, -24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (weaponId === 'varita') {
    ctx.fillStyle = '#6c4996';
    ctx.beginPath();
    ctx.roundRect(-2.5, -34, 5, 40, 2.5);
    ctx.fill();
    ctx.stroke();
    // Estrella dorada en la punta
    drawStarShape(ctx, 0, -39, 13, 6, 5, '#ffd447');
  }
  ctx.restore();
}

export function drawStarShape(ctx, cx, cy, outerR, innerR, points, fillColor) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (i * Math.PI) / points - Math.PI / 2;
    if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// Personajes jugables: Carlos, Mateo y Ariel (estilo Rubber Hose 1930)
export function drawHero1930(ctx, hero, charDef, frame12, spriteManager) {
  const { x, y, facingX, moving, attackTimer, shieldActive, hurtTimer, weapon } = hero;
  const flipX = facingX < 0;

  // Sombra suave en el suelo
  ctx.save();
  ctx.fillStyle = 'rgba(30, 22, 16, 0.26)';
  ctx.beginPath();
  ctx.ellipse(x, y + 6, 28, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Si hay Sprite Sheet PNG 512x512 cargado para este personaje, úsalo automáticamente
  const state = hurtTimer > 0 ? 'hurt' : attackTimer > 0 ? 'attack' : moving ? 'walk' : 'idle';
  if (spriteManager && spriteManager.has(charDef.id)) {
    spriteManager.draw(ctx, charDef.id, state, frame12, x, y + 10, 120, flipX);
    if (shieldActive) drawGoldenShieldAura(ctx, x, y - 34, frame12);
    return;
  }

  // Fase rítmica a 12 fps (rebote clásico tipo Cuphead / Mickey 1930)
  const phase = (frame12 % 12) / 12 * Math.PI * 2;
  const idleBounce = Math.abs(Math.sin(phase)) * (moving ? 7 : 4.5);
  const squashX = 1 + Math.sin(phase * 2) * 0.045;
  const squashY = 1 - Math.sin(phase * 2) * 0.045;
  const walkSwing = moving ? Math.sin(phase * 2) * 16 : Math.sin(phase) * 3;
  const blinking = (frame12 % 48) === 46 || (frame12 % 48) === 47;
  const c = charDef.colors;

  ctx.save();
  ctx.translate(x, y);
  if (hurtTimer > 0 && Math.floor(frame12) % 2 === 0) {
    ctx.globalAlpha = 0.55;
  }
  if (flipX) ctx.scale(-1, 1);

  // Piernas Rubber Hose + zapatos grandes caricaturescos
  const leftFootX = -10 + walkSwing * 0.7;
  const leftFootY = -2 - Math.max(0, Math.sin(phase * 2)) * (moving ? 9 : 0);
  const rightFootX = 10 - walkSwing * 0.7;
  const rightFootY = -2 - Math.max(0, -Math.sin(phase * 2)) * (moving ? 9 : 0);

  drawRubberLimb(ctx, -8, -28 - idleBounce, -15, -14, leftFootX, leftFootY, 7);
  drawRubberLimb(ctx, 8, -28 - idleBounce, 15, -14, rightFootX, rightFootY, 7);

  // Zapatos grandes 1930
  const drawShoe = (sx, sy) => {
    ctx.fillStyle = c.shoes;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(sx + 4, sy, 13, 7.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.ellipse(sx + 7, sy - 2, 4, 2, -0.2, 0, Math.PI * 2);
    ctx.fill();
  };
  drawShoe(leftFootX, leftFootY);
  drawShoe(rightFootX, rightFootY);

  // Torso con squash & stretch
  ctx.save();
  ctx.translate(0, -34 - idleBounce);
  ctx.scale(squashX, squashY);

  // Brazo trasero Rubber Hose
  const backHandX = -24 - walkSwing * 0.5;
  const backHandY = -2 + Math.cos(phase) * 5;
  drawRubberLimb(ctx, -14, -10, -24, -4, backHandX, backHandY, 6.8);
  drawCartoonGlove(ctx, backHandX, backHandY, -0.4, 0.92);

  // Cuerpo / vestimenta según personaje
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.2;
  if (charDef.id === 'ariel') {
    // Vestido plisado estilo caricatura 1930 con estrella
    ctx.fillStyle = c.primary;
    ctx.beginPath();
    ctx.moveTo(-14, -18);
    ctx.lineTo(14, -18);
    ctx.lineTo(22, 12);
    ctx.quadraticCurveTo(0, 17, -22, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Cuello marinero azul
    ctx.fillStyle = c.accent;
    ctx.beginPath();
    ctx.moveTo(-14, -18);
    ctx.lineTo(14, -18);
    ctx.lineTo(0, -4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    drawStarShape(ctx, 0, 3, 7, 3.2, 5, c.secondary);
  } else if (charDef.id === 'carlos') {
    // Overol clásico 1930 con botones dorados y corbatín rojo
    ctx.fillStyle = '#fff5dc';
    ctx.beginPath();
    ctx.ellipse(0, -4, 17, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = c.secondary;
    ctx.beginPath();
    ctx.roundRect(-15, -4, 30, 17, 7);
    ctx.fill();
    ctx.stroke();
    // Botones dorados
    ctx.fillStyle = c.accent;
    ctx.beginPath();
    ctx.arc(-7, 2, 3.2, 0, Math.PI * 2);
    ctx.arc(7, 2, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Corbatín rojo
    ctx.fillStyle = c.primary;
    ctx.beginPath();
    ctx.moveTo(0, -14); ctx.lineTo(-9, -19); ctx.lineTo(-9, -9); ctx.closePath();
    ctx.moveTo(0, -14); ctx.lineTo(9, -19); ctx.lineTo(9, -9); ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    // Mateo: Chaleco verde inventor + tirantes dorados
    ctx.fillStyle = '#fff5dc';
    ctx.beginPath();
    ctx.ellipse(0, -4, 17, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = c.primary;
    ctx.beginPath();
    ctx.roundRect(-15, -15, 30, 26, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = c.secondary;
    ctx.fillRect(-10, -15, 5, 25);
    ctx.fillRect(5, -15, 5, 25);
    // Pañuelo coral
    ctx.fillStyle = c.accent;
    ctx.beginPath();
    ctx.moveTo(-10, -16); ctx.lineTo(10, -16); ctx.lineTo(0, -6); ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Cabeza expresiva 1930
  ctx.save();
  ctx.translate(0, -34);

  // Orejitas cartoon
  ctx.fillStyle = c.skin;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.arc(-20, 0, 6, 0, Math.PI * 2);
  ctx.arc(20, 0, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cabello base
  ctx.fillStyle = c.hair;
  ctx.beginPath();
  ctx.arc(0, -4, 23, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Rostro crema/durazno
  ctx.fillStyle = c.skin;
  ctx.beginPath();
  ctx.ellipse(2, 2, 19.5, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Ojos pie-cut clásicos
  drawPieCutEye(ctx, -4, -2, 6.2, 8.8, 0.35, 0, blinking);
  drawPieCutEye(ctx, 10, -2, 6.2, 8.8, 0.35, 0, blinking);

  // Nariz botón y sonrisa alegre 1930
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.ellipse(4, 5, 3.2, 2.3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(3, 7, 8, 0.2, Math.PI - 0.35);
  ctx.stroke();

  // Mejillas rosadas
  ctx.fillStyle = 'rgba(225, 100, 95, 0.35)';
  ctx.beginPath();
  ctx.ellipse(-9, 7, 4.5, 2.6, 0, 0, Math.PI * 2);
  ctx.ellipse(15, 7, 4.5, 2.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Accesorios característicos en la cabeza
  if (charDef.id === 'carlos') {
    // Gorra clásica de explorador/repartidor 1930
    ctx.fillStyle = c.primary;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(-1, -18, 22, 11, -0.08, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Visera
    ctx.fillStyle = '#9c2d26';
    ctx.beginPath();
    ctx.ellipse(13, -16, 15, 5, 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (charDef.id === 'mateo') {
    // Gafas de aviador vintage en la frente
    ctx.fillStyle = '#754c24';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.fillRect(-20, -20, 40, 6);
    ctx.strokeRect(-20, -20, 40, 6);
    for (const gx of [-6, 10]) {
      ctx.fillStyle = c.secondary;
      ctx.beginPath();
      ctx.arc(gx, -18, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#b9eaf5';
      ctx.beginPath();
      ctx.arc(gx, -18, 4.8, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (charDef.id === 'ariel') {
    // Coletas rizadas + gran moño retro con lunares
    ctx.fillStyle = c.hair;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(-22, -8, 10, 0, Math.PI * 2);
    ctx.arc(20, -10, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Moño amarillo/coral 1930
    ctx.fillStyle = c.secondary;
    ctx.beginPath();
    ctx.ellipse(-10, -24, 12, 7.5, -0.35, 0, Math.PI * 2);
    ctx.ellipse(10, -24, 12, 7.5, 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = c.primary;
    ctx.beginPath();
    ctx.arc(0, -23, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore(); // fin cabeza

  // Brazo delantero + ataque Rubber Hose + herramienta
  const swingProg = attackTimer > 0 ? Math.sin((attackTimer / 0.28) * Math.PI) : 0;
  const frontHandX = 24 + walkSwing * 0.4 + swingProg * 22;
  const frontHandY = -4 - swingProg * 14 + Math.sin(phase) * 4;
  drawRubberLimb(ctx, 13, -10, 22, 0 - swingProg * 10, frontHandX, frontHandY, 6.8);

  const toolAngle = attackTimer > 0 ? 0.3 + swingProg * 1.45 : 0.45 + Math.sin(phase) * 0.12;
  drawEquippedTool(ctx, weapon, frontHandX, frontHandY, toolAngle);
  drawCartoonGlove(ctx, frontHandX, frontHandY, 0.25 + swingProg * 0.6, 0.96);

  ctx.restore(); // fin torso
  ctx.restore(); // fin personaje

  // Escudo Dorado activo
  if (shieldActive) {
    drawGoldenShieldAura(ctx, x, y - 34, frame12);
  }
}

export function drawGoldenShieldAura(ctx, x, y, frame12) {
  ctx.save();
  const pulse = 1 + Math.sin(frame12 * 0.8) * 0.06;
  ctx.translate(x, y);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = 'rgba(255, 214, 79, 0.24)';
  ctx.strokeStyle = '#e5a93c';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.arc(0, 0, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.setLineDash([12, 8]);
  ctx.beginPath();
  ctx.arc(0, 0, 56, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

// Dibuja nodos de recursos (Árboles sonrientes, Rocas musgosas, Cristales brillantes)
export function drawResourceNode(ctx, node, frame12) {
  const { x, y, type, shake, hp, maxHp } = node;
  const wobble = shake > 0 ? Math.sin(shake * 42) * 8 : Math.sin((frame12 + node.seed) * 0.35) * 1.8;

  ctx.save();
  ctx.translate(x + wobble, y);

  // Sombra
  ctx.fillStyle = 'rgba(30, 22, 16, 0.22)';
  ctx.beginPath();
  ctx.ellipse(0, 8, 32, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.2;

  if (type === 'wood') {
    // Tronco curvo 1930
    ctx.fillStyle = '#8a552f';
    ctx.beginPath();
    ctx.moveTo(-12, 8);
    ctx.quadraticCurveTo(-8, -18, -10, -34);
    ctx.lineTo(10, -34);
    ctx.quadraticCurveTo(8, -18, 13, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Copa frondosa estilo Silly Symphonies
    ctx.fillStyle = '#53914e';
    ctx.beginPath();
    ctx.arc(-18, -42, 22, 0, Math.PI * 2);
    ctx.arc(18, -42, 22, 0, Math.PI * 2);
    ctx.arc(0, -60, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Ojos pie-cut sonrientes en el árbol
    drawPieCutEye(ctx, -7, -50, 4.5, 6.2, 0, 0, false);
    drawPieCutEye(ctx, 7, -50, 4.5, 6.2, 0, 0, false);
    ctx.beginPath();
    ctx.arc(0, -42, 6, 0.15, Math.PI - 0.15);
    ctx.stroke();
  } else if (type === 'stone') {
    ctx.fillStyle = '#9aa3a8';
    ctx.beginPath();
    ctx.moveTo(-30, 8);
    ctx.quadraticCurveTo(-34, -24, -10, -32);
    ctx.quadraticCurveTo(18, -36, 32, -8);
    ctx.quadraticCurveTo(34, 8, 22, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Brillo piedra
    ctx.fillStyle = '#c8d1d6';
    ctx.beginPath();
    ctx.ellipse(-8, -18, 12, 6, -0.25, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Cristales brillantes retro
    const pulse = 1 + Math.sin((frame12 + node.seed) * 0.5) * 0.05;
    ctx.scale(pulse, pulse);
    const drawShard = (ox, oy, w, h, rot, col) => {
      ctx.save();
      ctx.translate(ox, oy);
      ctx.rotate(rot);
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(0, -h);
      ctx.lineTo(w, -h * 0.3);
      ctx.lineTo(w * 0.7, 0);
      ctx.lineTo(-w * 0.7, 0);
      ctx.lineTo(-w, -h * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };
    drawShard(-13, 6, 11, 34, -0.3, '#58c4d9');
    drawShard(14, 6, 10, 30, 0.32, '#86e3f0');
    drawShard(0, 8, 13, 46, 0, '#44b3cf');
  }

  // Barra de golpes si ya fue golpeado
  if (hp < maxHp) {
    ctx.fillStyle = '#2b211b';
    ctx.fillRect(-24, 16, 48, 8);
    ctx.fillStyle = '#f2c144';
    ctx.fillRect(-22, 18, 44 * (hp / maxHp), 4);
  }
  ctx.restore();
}

// Dibuja la Mesa de Creación (Workbench) en el campamento
export function drawWorkbench(ctx, x, y, frame12, highlight) {
  ctx.save();
  ctx.translate(x, y);

  // Halo interactivo si el jugador está cerca
  if (highlight) {
    ctx.fillStyle = 'rgba(245, 200, 76, 0.28)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 68 + Math.sin(frame12 * 0.6) * 5, 40, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.2;

  // Patas
  ctx.fillStyle = '#7d4d27';
  ctx.fillRect(-38, -10, 12, 26); ctx.strokeRect(-38, -10, 12, 26);
  ctx.fillRect(26, -10, 12, 26); ctx.strokeRect(26, -10, 12, 26);

  // Tablero de madera
  ctx.fillStyle = '#b5743c';
  ctx.beginPath();
  ctx.roundRect(-48, -28, 96, 24, 6);
  ctx.fill();
  ctx.stroke();

  // Martillo y planos dibujados encima
  ctx.fillStyle = '#fff5dc';
  ctx.fillRect(-30, -24, 24, 14);
  ctx.strokeRect(-30, -24, 24, 14);

  ctx.fillStyle = '#c94038';
  ctx.beginPath();
  ctx.arc(18, -18, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Letrero flotante
  ctx.fillStyle = '#fff6df';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.roundRect(-54, -64 + Math.sin(frame12 * 0.5) * 3, 108, 26, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.font = 'bold 14px "Fredoka", "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🔨 CRAFTEAR', 0, -46 + Math.sin(frame12 * 0.5) * 3);

  ctx.restore();
}

// Dibuja un Cofre Secreto 1930
export function drawChest(ctx, chest, frame12) {
  const { x, y, opened } = chest;
  const bounce = opened ? 0 : Math.abs(Math.sin((frame12 + chest.seed) * 0.45)) * 4;

  ctx.save();
  ctx.translate(x, y - bounce);
  ctx.fillStyle = 'rgba(30, 22, 16, 0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 10 + bounce, 28, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.2;

  // Base del cofre
  ctx.fillStyle = '#9c5928';
  ctx.beginPath();
  ctx.roundRect(-24, -14, 48, 26, 5);
  ctx.fill();
  ctx.stroke();

  // Tapa
  ctx.fillStyle = opened ? '#633716' : '#c97936';
  ctx.beginPath();
  ctx.roundRect(-26, opened ? -34 : -26, 52, 15, 6);
  ctx.fill();
  ctx.stroke();

  // Bandas doradas y cerradura
  ctx.fillStyle = '#f2c144';
  ctx.fillRect(-16, -14, 6, 26);
  ctx.fillRect(10, -14, 6, 26);
  ctx.beginPath();
  ctx.arc(0, -8, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (!opened) {
    // Destello dorado sobre el cofre cerrado
    const s = 6 + Math.sin(frame12 * 0.8) * 3;
    drawStarShape(ctx, 18, -32, s, s * 0.45, 4, '#ffe66d');
  }
  ctx.restore();
}

// Dibuja villanos menores cómicos (Honguito, Cactus, Cangrejo, Muñeco)
export function drawMinion1930(ctx, m, frame12) {
  const phase = ((frame12 + m.seed) % 12) / 12 * Math.PI * 2;
  const hop = Math.abs(Math.sin(phase * 2)) * 9;

  ctx.save();
  ctx.translate(m.x, m.y);

  // Sombra
  ctx.fillStyle = 'rgba(30, 22, 16, 0.24)';
  ctx.beginPath();
  ctx.ellipse(0, 6, 22, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(0, -hop);
  if (m.hurtTimer > 0 && frame12 % 2 === 0) ctx.globalAlpha = 0.55;

  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;

  if (m.type === 'honguito') {
    // Tallo crema
    ctx.fillStyle = '#fae8c8';
    ctx.beginPath();
    ctx.roundRect(-13, -24, 26, 26, 10);
    ctx.fill();
    ctx.stroke();
    // Sombrero rojo con lunares
    ctx.fillStyle = '#d14338';
    ctx.beginPath();
    ctx.ellipse(0, -26, 26, 17, 0, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff9eb';
    ctx.beginPath();
    ctx.arc(-11, -33, 5, 0, Math.PI * 2);
    ctx.arc(9, -35, 4.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (m.type === 'cactus') {
    ctx.fillStyle = '#4e9654';
    ctx.beginPath();
    ctx.roundRect(-15, -44, 30, 46, 14);
    ctx.fill();
    ctx.stroke();
    // Brazos cactus rubber-hose
    drawRubberLimb(ctx, -15, -24, -28, -24, -26, -38, 7);
    drawRubberLimb(ctx, 15, -20, 28, -20, 26, -34, 7);
    // Sombrerito amarillo
    ctx.fillStyle = '#e8b343';
    ctx.beginPath();
    ctx.ellipse(0, -44, 22, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (m.type === 'cangrejo') {
    ctx.fillStyle = '#d94c3d';
    ctx.beginPath();
    ctx.ellipse(0, -16, 24, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Pinzas cómicas
    drawRubberLimb(ctx, -20, -20, -32, -32, -24, -40, 6);
    drawRubberLimb(ctx, 20, -20, 32, -32, 24, -40, 6);
    ctx.fillStyle = '#d94c3d';
    ctx.beginPath();
    ctx.arc(-24, -40, 8, 0.4, Math.PI * 2 - 0.4);
    ctx.arc(24, -40, 8, 0.4, Math.PI * 2 - 0.4);
    ctx.fill();
    ctx.stroke();
  } else {
    // Muñeco de nieve travieso
    ctx.fillStyle = '#f2f7fa';
    ctx.beginPath();
    ctx.arc(0, -12, 18, 0, Math.PI * 2);
    ctx.arc(0, -34, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Bufanda roja
    ctx.fillStyle = '#cf3e3e';
    ctx.fillRect(-13, -25, 26, 6);
    ctx.strokeRect(-13, -25, 26, 6);
  }

  // Ojos pie-cut traviesos
  drawPieCutEye(ctx, -6, -18, 4.5, 6, 0, 0, false);
  drawPieCutEye(ctx, 6, -18, 4.5, 6, 0, 0, false);

  // Barra de vida
  if (m.hp < m.maxHp) {
    ctx.fillStyle = '#2b211b';
    ctx.fillRect(-20, 10, 40, 6);
    ctx.fillStyle = '#e05248';
    ctx.fillRect(-19, 11, 38 * (m.hp / m.maxHp), 4);
  }
  ctx.restore();
}

// Dibuja los 4 Jefes Cómicos de 1930
export function drawBoss1930(ctx, boss, frame12, spriteManager) {
  if (!boss || boss.defeated) return;
  const phase = (frame12 % 12) / 12 * Math.PI * 2;
  const bounce = Math.abs(Math.sin(phase)) * 8;
  const dizzy = boss.state === 'dizzy';
  const telegraph = boss.state === 'telegraph';

  ctx.save();
  ctx.translate(boss.x, boss.y);

  // Sombra grande
  ctx.fillStyle = 'rgba(30, 22, 16, 0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 12, 58, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sprite Sheet 512x512 si existe
  if (spriteManager && spriteManager.has(boss.id)) {
    const st = dizzy ? 'hurt' : telegraph ? 'attack' : 'walk';
    spriteManager.draw(ctx, boss.id, st, frame12, 0, 14, 185, boss.facingX < 0);
    ctx.restore();
    return;
  }

  ctx.translate(0, -bounce);
  if (boss.hurtTimer > 0 && frame12 % 2 === 0) ctx.globalAlpha = 0.6;
  const scale = telegraph ? 1.09 : 1;
  ctx.scale(scale, scale);

  // Brazos Rubber Hose largos + guantes blancos enormes
  const armWave = Math.sin(phase * 2) * 18;
  drawRubberLimb(ctx, -38, -48, -68, -65 + armWave, -74, -30 - armWave, 11);
  drawRubberLimb(ctx, 38, -48, 68, -65 - armWave, 74, -30 + armWave, 11);
  drawCartoonGlove(ctx, -74, -30 - armWave, -0.5, 1.45);
  drawCartoonGlove(ctx, 74, -30 + armWave, 0.5, 1.45);

  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;

  if (boss.id === 'boss_bosque') {
    // Don Tronco Gruñón
    ctx.fillStyle = boss.color;
    ctx.beginPath();
    ctx.moveTo(-46, 6);
    ctx.quadraticCurveTo(-40, -45, -36, -92);
    ctx.lineTo(36, -92);
    ctx.quadraticCurveTo(40, -45, 48, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Corona de hojas
    ctx.fillStyle = boss.accent;
    ctx.beginPath();
    ctx.arc(-28, -96, 26, 0, Math.PI * 2);
    ctx.arc(0, -108, 32, 0, Math.PI * 2);
    ctx.arc(28, -96, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (boss.id === 'boss_desierto') {
    // Rey Tut-Tón (Faraón chistoso)
    ctx.fillStyle = '#f5ecd4';
    ctx.beginPath();
    ctx.roundRect(-38, -88, 76, 94, 24);
    ctx.fill();
    ctx.stroke();
    // Tocador rayado dorado y azul
    ctx.fillStyle = boss.color;
    ctx.beginPath();
    ctx.moveTo(-54, -46);
    ctx.lineTo(-42, -106);
    ctx.lineTo(42, -106);
    ctx.lineTo(54, -46);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = boss.accent;
    ctx.fillRect(-44, -92, 88, 12);
    ctx.fillRect(-48, -70, 96, 12);
  } else if (boss.id === 'boss_pirata') {
    // Capitán Pulpo Bigotes
    ctx.fillStyle = boss.color;
    ctx.beginPath();
    ctx.arc(0, -54, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Sombrero pirata gigante
    ctx.fillStyle = '#292226';
    ctx.beginPath();
    ctx.moveTo(-58, -82);
    ctx.quadraticCurveTo(0, -126, 58, -82);
    ctx.quadraticCurveTo(0, -70, -58, -82);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    drawStarShape(ctx, 0, -96, 11, 5, 5, boss.accent);
  } else {
    // Yeti Helado Señor Brrr
    ctx.fillStyle = boss.color;
    ctx.beginPath();
    ctx.ellipse(0, -48, 50, 56, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Bufanda a rayas roja
    ctx.fillStyle = boss.accent;
    ctx.beginPath();
    ctx.roundRect(-42, -32, 84, 15, 7);
    ctx.fill();
    ctx.stroke();
  }

  // Ojos pie-cut grandes + bigote cómico
  drawPieCutEye(ctx, -16, -64, 10, 14, 0, 0.2, false);
  drawPieCutEye(ctx, 16, -64, 10, 14, 0, 0.2, false);

  // Cejas expresivas
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-28, -82); ctx.lineTo(-6, -75);
  ctx.moveTo(28, -82); ctx.lineTo(6, -75);
  ctx.stroke();

  // Bigote rizado 1930
  ctx.fillStyle = '#3b2416';
  ctx.beginPath();
  ctx.ellipse(-14, -44, 16, 6, -0.2, 0, Math.PI * 2);
  ctx.ellipse(14, -44, 16, 6, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Signo "!" si está preparando ataque
  if (telegraph) {
    ctx.fillStyle = '#ffdf4d';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -135, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#c92e2e';
    ctx.font = '900 26px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', 0, -126);
  }

  // Estrellitas girando si está mareado (vulnerable)
  if (dizzy) {
    for (let i = 0; i < 3; i++) {
      const a = phase * 2 + (i * Math.PI * 2) / 3;
      drawStarShape(ctx, Math.cos(a) * 38, -118 + Math.sin(a) * 10, 10, 4.5, 5, '#ffe052');
    }
  }

  ctx.restore();
}

// Overlay suave de película clásica 1930 (viñeta cálida + motitas sutiles)
export function drawVintageFilmOverlay(ctx, w, h, frame12) {
  ctx.save();
  const grad = ctx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.36, w * 0.5, h * 0.5, Math.max(w, h) * 0.65);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(34, 22, 12, 0.26)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // 2 motitas sutiles de celuloide que cambian a 12 fps
  const s = (frame12 * 9301 + 49297) % 233280;
  const x1 = (s % w);
  const y1 = ((s * 7) % h);
  ctx.fillStyle = 'rgba(255, 248, 230, 0.16)';
  ctx.beginPath();
  ctx.arc(x1, y1, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
