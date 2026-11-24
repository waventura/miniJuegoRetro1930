// Soporte listo para Sprite Sheets PNG 512x512 (cuadrícula 4x4 de 128x128 px a 12 fps)
// Si existe el PNG en www/assets/sprites/<id>.png, se dibuja automáticamente;
// de lo contrario, el juego usa el motor procedural Rubber Hose 1930.

export class SpriteSheetManager {
  constructor() {
    this.sheets = new Map();
    this.manifest = null;
    this.frameSize = 128;
    this.cols = 4;
    this.rows = 4;
  }

  async init() {
    try {
      const res = await fetch('assets/sprites/manifest.json');
      if (!res.ok) return;
      this.manifest = await res.json();
      this.frameSize = this.manifest.frameSize || 128;
      this.cols = this.manifest.cols || 4;
      this.rows = this.manifest.rows || 4;

      const entries = Object.entries(this.manifest.sprites || {});
      await Promise.all(entries.map(([key, url]) => this.tryLoadSheet(key, url)));
    } catch {
      // Sin manifiesto o sin archivos PNG: usar renderizado Rubber Hose vectorial
    }
  }

  tryLoadSheet(key, url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth >= 128 && img.naturalHeight >= 128) {
          this.sheets.set(key, img);
        }
        resolve();
      };
      img.onerror = () => resolve();
      img.src = url;
    });
  }

  has(key) {
    return this.sheets.has(key);
  }

  // state: 'idle' (fila 0), 'walk' (fila 1), 'attack' (fila 2), 'hurt' / 'cheer' (fila 3)
  draw(ctx, key, state, frame12, x, y, drawSize, flipX = false) {
    const img = this.sheets.get(key);
    if (!img) return false;

    const rowMap = { idle: 0, walk: 1, attack: 2, hurt: 3, cheer: 3 };
    const row = rowMap[state] ?? 0;
    const col = Math.abs(frame12) % this.cols;
    const fw = img.naturalWidth / this.cols;
    const fh = img.naturalHeight / this.rows;

    ctx.save();
    ctx.translate(x, y);
    if (flipX) ctx.scale(-1, 1);
    ctx.drawImage(
      img,
      col * fw,
      row * fh,
      fw,
      fh,
      -drawSize * 0.5,
      -drawSize * 0.85,
      drawSize,
      drawSize
    );
    ctx.restore();
    return true;
  }
}
