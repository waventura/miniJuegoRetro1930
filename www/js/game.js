// Motor principal de ¡Aventura Retro 1930! para Carlos, Mateo y Ariel
import {
  APP_VERSION,
  STAGE_W,
  STAGE_H,
  WORLD_W,
  WORLD_H,
  CARTOON_FPS,
  CHARACTERS,
  RECIPES,
  WORLDS
} from './config.js';
import { SpriteSheetManager } from './sprites.js';
import { RetroAudio } from './audio.js';
import { RetroVoice } from './tts.js';
import { RetroUpdater } from './updater.js';
import { WatercolorRenderer } from './watercolor.js';
import {
  drawHero1930,
  drawResourceNode,
  drawWorkbench,
  drawChest,
  drawMinion1930,
  drawBoss1930,
  drawStarShape,
  drawVintageFilmOverlay
} from './rubberhose.js';

const SAVE_KEY = 'aventura_retro_1930_save_v1';

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function dist(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

class RetroGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = STAGE_W;
    this.canvas.height = STAGE_H;

    this.sprites = new SpriteSheetManager();
    this.audio = new RetroAudio();
    this.voice = new RetroVoice();
    this.updater = new RetroUpdater();
    this.watercolor = new WatercolorRenderer();

    this.state = this._loadSave();
    this.running = false;
    this.paused = false;
    this.time = 0;
    this.lastTs = 0;

    // Input state
    this.keys = {};
    this.joy = { active: false, id: null, originX: 0, originY: 0, dx: 0, dy: 0 };

    // Entidades del mundo activo
    this.currentWorldDef = WORLDS[0];
    this.workbenchPos = { x: 320, y: 690 };
    this.nodes = [];
    this.chests = [];
    this.minions = [];
    this.boss = null;
    this.drops = [];
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.camera = { x: 0, y: 0 };

    this.hero = {
      x: 320,
      y: 780,
      vx: 0,
      vy: 0,
      facingX: 1,
      facingY: 0,
      moving: false,
      hearts: 5,
      maxHearts: 5,
      attackTimer: 0,
      attackCooldown: 0,
      specialCooldown: 0,
      shieldActive: false,
      shieldTimer: 0,
      hurtTimer: 0,
      weapon: this.state.equippedWeapon
    };

    this._initUI();
    this._bindInputs();
    this._renderCharacterPreviews();
    this.sprites.init();
    this._checkUpdateQuietly();

    requestAnimationFrame((ts) => this._loop(ts));
  }

  _defaultSave() {
    return {
      characterId: 'carlos',
      worldId: 'bosque',
      resources: { wood: 2, stone: 1, crystal: 0 },
      crafted: [],
      equippedWeapon: null,
      hasShield: false,
      potions: 1,
      openedChests: {},
      defeatedBosses: {},
      sfxEnabled: true,
      musicEnabled: true,
      voiceEnabled: true
    };
  }

  _loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        return Object.assign(this._defaultSave(), JSON.parse(raw));
      }
    } catch {}
    return this._defaultSave();
  }

  _save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
    } catch {}
  }

  _initUI() {
    this.el = {
      titleModal: document.getElementById('titleModal'),
      craftModal: document.getElementById('craftModal'),
      mapModal: document.getElementById('mapModal'),
      updateModal: document.getElementById('updateModal'),
      victoryBanner: document.getElementById('victoryBanner'),
      victoryText: document.getElementById('victoryText'),
      hudPortraitName: document.getElementById('hudCharName'),
      hudWorldName: document.getElementById('hudWorldName'),
      hudHearts: document.getElementById('hudHearts'),
      hudWood: document.getElementById('hudWood'),
      hudStone: document.getElementById('hudStone'),
      hudCrystal: document.getElementById('hudCrystal'),
      hudMedals: document.getElementById('hudMedals'),
      hudWeaponBadge: document.getElementById('hudWeaponBadge'),
      potionCount: document.getElementById('potionCount'),
      bossBarWrap: document.getElementById('bossBarWrap'),
      bossBarName: document.getElementById('bossBarName'),
      bossBarFill: document.getElementById('bossBarFill'),
      craftGrid: document.getElementById('craftGrid'),
      craftResSummary: document.getElementById('craftResSummary'),
      mapGrid: document.getElementById('mapGrid'),
      versionLabel: document.getElementById('versionLabel'),
      btnUpdateBadge: document.getElementById('updateDot'),
      updateStatus: document.getElementById('updateStatus'),
      updateNotes: document.getElementById('updateNotes'),
      updateProgressWrap: document.getElementById('updateProgressWrap'),
      updateProgressFill: document.getElementById('updateProgressFill'),
      btnDownloadUpdate: document.getElementById('btnDownloadUpdate'),
      joyZone: document.getElementById('joystickZone'),
      joyKnob: document.getElementById('joystickKnob'),
      btnSound: document.getElementById('btnSound'),
      btnVoice: document.getElementById('btnVoice')
    };

    this.el.versionLabel.textContent = `v${APP_VERSION}`;
    this.audio.setSfxEnabled(this.state.sfxEnabled);
    this.audio.setMusicEnabled(this.state.musicEnabled);
    this.voice.setEnabled(this.state.voiceEnabled);
    this._refreshAudioButtons();

    // Selección de personaje en pantalla de título
    document.querySelectorAll('.char-card').forEach((card) => {
      card.addEventListener('click', () => {
        this.audio.unlock();
        this.audio.play('ui');
        const id = card.dataset.char;
        this.selectCharacter(id, true);
      });
    });

    document.getElementById('btnPlayStart').addEventListener('click', () => {
      this.audio.unlock();
      this.audio.play('victory');
      this.el.titleModal.classList.add('hidden');
      if (!this.running) {
        this.running = true;
        this.loadWorld(this.state.worldId, true);
      } else {
        this.paused = false;
      }
      this._updateHUD();
    });

    // Botones del HUD superior
    document.getElementById('btnOpenMap').addEventListener('click', () => {
      this.audio.play('ui');
      this._openMapModal();
    });
    document.getElementById('btnOpenCraft').addEventListener('click', () => {
      this.audio.play('ui');
      this._openCraftModal();
    });
    document.getElementById('btnOpenChars').addEventListener('click', () => {
      this.audio.play('ui');
      this.paused = true;
      this.el.titleModal.classList.remove('hidden');
    });
    this.el.btnSound.addEventListener('click', () => {
      this.audio.unlock();
      this.state.musicEnabled = !this.state.musicEnabled;
      this.state.sfxEnabled = this.state.musicEnabled;
      this.audio.setMusicEnabled(this.state.musicEnabled);
      this.audio.setSfxEnabled(this.state.sfxEnabled);
      this._refreshAudioButtons();
      this._save();
    });
    this.el.btnVoice.addEventListener('click', () => {
      this.state.voiceEnabled = !this.state.voiceEnabled;
      this.voice.setEnabled(this.state.voiceEnabled);
      this._refreshAudioButtons();
      this._save();
      if (this.state.voiceEnabled) {
        this.voice.speak('¡Voz activada!', true);
      }
    });
    document.getElementById('btnOpenUpdate').addEventListener('click', () => {
      this.audio.play('ui');
      this._openUpdateModal();
    });

    // Cerrar modales
    document.getElementById('btnCloseCraft').addEventListener('click', () => this._closeAllModals());
    document.getElementById('btnCloseMap').addEventListener('click', () => this._closeAllModals());
    document.getElementById('btnCloseUpdate').addEventListener('click', () => this._closeAllModals());
    document.getElementById('btnCloseVictory').addEventListener('click', () => {
      this.el.victoryBanner.classList.add('hidden');
      this.paused = false;
    });

    document.getElementById('btnCheckNow').addEventListener('click', () => this._runManualUpdateCheck());
    this.el.btnDownloadUpdate.addEventListener('click', () => this._startUpdateDownload());

    // Botones táctiles grandes (lado derecho)
    this._bindTouchBtn('btnAttack', () => this.doAttack());
    this._bindTouchBtn('btnSpecial', () => this.doSpecial());
    this._bindTouchBtn('btnShield', () => this.doShield());
    this._bindTouchBtn('btnPotion', () => this.doPotion());

    this.selectCharacter(this.state.characterId, false);
  }

  _bindTouchBtn(id, fn) {
    const btn = document.getElementById(id);
    if (!btn) return;
    const trigger = (e) => {
      e.preventDefault();
      this.audio.unlock();
      btn.classList.add('pressed');
      fn();
      setTimeout(() => btn.classList.remove('pressed'), 120);
    };
    btn.addEventListener('pointerdown', trigger);
  }

  _refreshAudioButtons() {
    this.el.btnSound.textContent = this.state.musicEnabled ? '🔊' : '🔇';
    this.el.btnVoice.textContent = this.state.voiceEnabled ? '🗣️' : '🤫';
  }

  _bindInputs() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (!this.running || this.paused) return;
      if (e.code === 'Space' || e.code === 'KeyJ') {
        e.preventDefault();
        this.doAttack();
      } else if (e.code === 'KeyK') {
        this.doSpecial();
      } else if (e.code === 'KeyL' || e.code === 'ShiftLeft') {
        this.doShield();
      } else if (e.code === 'KeyH') {
        this.doPotion();
      } else if (e.code === 'KeyC') {
        this._openCraftModal();
      } else if (e.code === 'KeyM') {
        this._openMapModal();
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Joystick virtual multitouch en zona izquierda
    const zone = this.el.joyZone;
    const knob = this.el.joyKnob;
    const maxR = 54;

    const updateKnob = (clientX, clientY) => {
      const dx = clientX - this.joy.originX;
      const dy = clientY - this.joy.originY;
      const d = Math.hypot(dx, dy);
      const clamped = Math.min(d, maxR);
      const ang = Math.atan2(dy, dx);
      const kx = Math.cos(ang) * clamped;
      const ky = Math.sin(ang) * clamped;
      knob.style.transform = `translate(${kx}px, ${ky}px)`;
      this.joy.dx = d > 8 ? kx / maxR : 0;
      this.joy.dy = d > 8 ? ky / maxR : 0;
    };

    zone.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.audio.unlock();
      zone.setPointerCapture(e.pointerId);
      const rect = zone.getBoundingClientRect();
      this.joy.active = true;
      this.joy.id = e.pointerId;
      this.joy.originX = rect.left + rect.width / 2;
      this.joy.originY = rect.top + rect.height / 2;
      updateKnob(e.clientX, e.clientY);
    });

    zone.addEventListener('pointermove', (e) => {
      if (!this.joy.active || e.pointerId !== this.joy.id) return;
      updateKnob(e.clientX, e.clientY);
    });

    const endJoy = (e) => {
      if (e.pointerId !== this.joy.id) return;
      this.joy.active = false;
      this.joy.id = null;
      this.joy.dx = 0;
      this.joy.dy = 0;
      knob.style.transform = 'translate(0px, 0px)';
    };
    zone.addEventListener('pointerup', endJoy);
    zone.addEventListener('pointercancel', endJoy);

    // Tocar directamente sobre la mesa de crafteo en el canvas
    this.canvas.addEventListener('pointerdown', (e) => {
      if (!this.running || this.paused) return;
      this.audio.unlock();
      const rect = this.canvas.getBoundingClientRect();
      const sx = ((e.clientX - rect.left) / rect.width) * STAGE_W;
      const sy = ((e.clientY - rect.top) / rect.height) * STAGE_H;
      const wx = sx + this.camera.x;
      const wy = sy + this.camera.y;
      if (dist(wx, wy, this.workbenchPos.x, this.workbenchPos.y) < 76) {
        this._openCraftModal();
      }
    });
  }

  _renderCharacterPreviews() {
    this.previewCanvases = [
      { id: 'carlos', canvas: document.getElementById('prevCarlos') },
      { id: 'mateo', canvas: document.getElementById('prevMateo') },
      { id: 'ariel', canvas: document.getElementById('prevAriel') }
    ];
  }

  selectCharacter(charId, speakGreeting = false) {
    const def = CHARACTERS[charId] || CHARACTERS.carlos;
    this.state.characterId = def.id;
    this.hero.maxHearts = def.maxHearts;
    this.hero.hearts = Math.min(this.hero.hearts || def.maxHearts, def.maxHearts);
    if (this.hero.hearts < def.maxHearts) this.hero.hearts = def.maxHearts;

    document.querySelectorAll('.char-card').forEach((c) => {
      c.classList.toggle('selected', c.dataset.char === def.id);
    });
    this._save();
    this._updateHUD();
    if (speakGreeting) {
      this.voice.speak(def.greeting, true);
    }
  }

  loadWorld(worldId, speakIntro = false) {
    const def = WORLDS.find((w) => w.id === worldId) || WORLDS[0];
    this.currentWorldDef = def;
    this.state.worldId = def.id;
    this._save();

    // Posición inicial en el campamento
    this.hero.x = 320;
    this.hero.y = 785;
    this.hero.vx = 0;
    this.hero.vy = 0;
    this.hero.weapon = this.state.equippedWeapon;
    this.hero.hearts = CHARACTERS[this.state.characterId].maxHearts;

    this.drops = [];
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.nodes = [];
    this.chests = [];
    this.minions = [];

    // Generar nodos de recursos bien distribuidos (evitando campamento y arena del jefe)
    const addNodes = (type, count, seedOffset) => {
      let placed = 0;
      let tries = 0;
      while (placed < count && tries < 400) {
        tries++;
        const nx = 180 + ((placed * 317 + tries * 97 + seedOffset) % (WORLD_W - 420));
        const ny = 150 + ((placed * 211 + tries * 131 + seedOffset * 3) % (WORLD_H - 300));
        if (dist(nx, ny, 320, 740) < 220) continue;
        if (dist(nx, ny, 1960, 710) < 290) continue;
        if (this.nodes.some((o) => dist(o.x, o.y, nx, ny) < 105)) continue;
        const maxHp = type === 'wood' ? 3 : type === 'stone' ? 4 : 4;
        this.nodes.push({
          x: nx,
          y: ny,
          type,
          hp: maxHp,
          maxHp,
          shake: 0,
          respawnTimer: 0,
          seed: placed * 13 + seedOffset
        });
        placed++;
      }
    };
    addNodes('wood', def.resources.wood, 11);
    addNodes('stone', def.resources.stone, 47);
    addNodes('crystal', def.resources.crystal, 89);

    // 3 Cofres Secretos por mundo
    const chestCoords = [
      { x: 640, y: 240 },
      { x: 1260, y: 1210 },
      { x: 1620, y: 250 }
    ];
    chestCoords.forEach((pos, idx) => {
      const key = `${def.id}_chest_${idx}`;
      this.chests.push({
        key,
        x: pos.x,
        y: pos.y,
        opened: !!this.state.openedChests[key],
        seed: idx * 7 + 3
      });
    });

    // 6 Villanos menores patrullando el mundo
    const minionSpots = [
      { x: 760, y: 520 },
      { x: 1020, y: 880 },
      { x: 1240, y: 420 },
      { x: 1460, y: 950 },
      { x: 1580, y: 580 },
      { x: 920, y: 300 }
    ];
    minionSpots.forEach((pos, idx) => {
      this.minions.push({
        x: pos.x,
        y: pos.y,
        homeX: pos.x,
        homeY: pos.y,
        type: def.minionType,
        hp: 45,
        maxHp: 45,
        speed: 74,
        hurtTimer: 0,
        hitCooldown: 0,
        seed: idx * 11
      });
    });

    // Jefe Cómico del mundo en la arena este
    const alreadyDefeated = !!this.state.defeatedBosses[def.id];
    this.boss = {
      ...def.boss,
      x: 1960,
      y: 710,
      homeX: 1960,
      homeY: 710,
      maxHp: def.boss.hp,
      hp: def.boss.hp,
      facingX: -1,
      state: 'idle',
      stateTimer: 1.5,
      hurtTimer: 0,
      taunted: false,
      defeated: alreadyDefeated
    };

    this._updateHUD();
    if (speakIntro) {
      this.voice.speak(def.intro, true);
    }
  }

  _getWeaponStats() {
    const charDef = CHARACTERS[this.state.characterId];
    const w = RECIPES.find((r) => r.id === this.state.equippedWeapon);
    if (!w) {
      return {
        id: null,
        damage: Math.round(14 * charDef.meleeBonus),
        range: 84,
        ranged: false,
        woodBonus: 1,
        stoneBonus: 1,
        crystalBonus: 1
      };
    }
    const mult = w.ranged ? charDef.magicBonus : charDef.meleeBonus;
    return {
      ...w,
      damage: Math.round(w.damage * mult)
    };
  }

  doAttack() {
    if (!this.running || this.paused || this.hero.attackCooldown > 0) return;

    // Si está junto a la mesa de crafteo sin enemigos muy cerca, abrir crafteo
    if (
      dist(this.hero.x, this.hero.y, this.workbenchPos.x, this.workbenchPos.y) < 88 &&
      !this.minions.some((m) => dist(m.x, m.y, this.hero.x, this.hero.y) < 120)
    ) {
      this._openCraftModal();
      return;
    }

    const stats = this._getWeaponStats();
    this.hero.attackTimer = 0.28;
    this.hero.attackCooldown = stats.ranged ? 0.34 : 0.28;

    // 1. Abrir cofres cercanos
    for (const chest of this.chests) {
      if (!chest.opened && dist(this.hero.x, this.hero.y, chest.x, chest.y) < 92) {
        this._openChest(chest);
        return;
      }
    }

    // 2. Si lleva Varita Estelar, disparar estrella mágica a distancia
    if (stats.ranged) {
      this.audio.play('star');
      this._spawnPlayerStar(stats.damage, 0);
    } else {
      this.audio.play('swing');
    }

    // 3. Recolectar nodos de recursos cercanos
    const charDef = CHARACTERS[this.state.characterId];
    for (const node of this.nodes) {
      if (node.respawnTimer > 0) continue;
      if (dist(this.hero.x, this.hero.y, node.x, node.y) < Math.max(92, stats.range)) {
        const toolHit =
          node.type === 'wood'
            ? stats.woodBonus
            : node.type === 'stone'
            ? stats.stoneBonus
            : stats.crystalBonus;
        const dmg = Math.max(1, Math.round(toolHit * charDef.gatherBonus));
        node.hp -= dmg;
        node.shake = 0.25;
        this.audio.play(node.type === 'wood' ? 'chop' : node.type === 'stone' ? 'stone' : 'crystal');
        this._spawnBurst(node.x, node.y - 24, node.type === 'crystal' ? '#5cd6e6' : '#f2c144', 6);

        if (node.hp <= 0) {
          node.respawnTimer = 24;
          const amount = toolHit >= 2 ? 2 : 1;
          for (let i = 0; i < amount; i++) {
            this.drops.push({
              x: node.x + (Math.random() - 0.5) * 32,
              y: node.y + (Math.random() - 0.5) * 20,
              type: node.type,
              life: 25
            });
          }
          this._addFloatText(node.x, node.y - 44, `+${amount} ${this._resIcon(node.type)}`, '#fff7d6');
        }
      }
    }

    // 4. Golpear villanos y jefe cuerpo a cuerpo (incluso si tiene varita cerca)
    const meleeRange = stats.ranged ? 76 : stats.range;
    for (const m of this.minions) {
      if (m.hp <= 0) continue;
      if (dist(this.hero.x, this.hero.y, m.x, m.y) < meleeRange) {
        this._damageMinion(m, stats.damage);
      }
    }

    if (this.boss && !this.boss.defeated) {
      if (dist(this.hero.x, this.hero.y, this.boss.x, this.boss.y) < meleeRange + 42) {
        this._damageBoss(stats.damage);
      }
    }
  }

  doSpecial() {
    if (!this.running || this.paused || this.hero.specialCooldown > 0) return;
    const charDef = CHARACTERS[this.state.characterId];
    const hasWand = this.state.crafted.includes('varita');

    this.hero.attackTimer = 0.32;
    this.hero.specialCooldown = 1.6;

    if (hasWand) {
      // Triple ráfaga estelar mágica
      this.audio.play('star');
      const dmg = Math.round(24 * charDef.magicBonus);
      this._spawnPlayerStar(dmg, -0.22);
      this._spawnPlayerStar(dmg, 0);
      this._spawnPlayerStar(dmg, 0.22);
      this._addFloatText(this.hero.x, this.hero.y - 74, '✨ ¡Estrellas!', '#ffe052');
    } else {
      // Giro cómico 1930 que empuja y golpea en área
      this.audio.play('swing');
      const dmg = Math.round(22 * charDef.meleeBonus);
      this._spawnBurst(this.hero.x, this.hero.y - 24, '#ffd447', 12);
      for (const m of this.minions) {
        if (m.hp > 0 && dist(this.hero.x, this.hero.y, m.x, m.y) < 135) {
          this._damageMinion(m, dmg);
        }
      }
      if (this.boss && !this.boss.defeated && dist(this.hero.x, this.hero.y, this.boss.x, this.boss.y) < 165) {
        this._damageBoss(dmg);
      }
      this._addFloatText(this.hero.x, this.hero.y - 74, '💫 ¡Giro Retro!', '#ffd447');
    }
  }

  doShield() {
    if (!this.running || this.paused) return;
    this.hero.shieldActive = true;
    this.hero.shieldTimer = this.state.hasShield ? 2.4 : 1.1;
    this.audio.play('shield');
    this._addFloatText(
      this.hero.x,
      this.hero.y - 74,
      this.state.hasShield ? '🛡️ ¡Escudo Dorado!' : '🛡️ ¡Guardia!',
      '#ffe066'
    );
  }

  doPotion() {
    if (!this.running || this.paused) return;
    if (this.state.potions <= 0) {
      this._addFloatText(this.hero.x, this.hero.y - 70, '¡Fabrica pociones en la mesa!', '#ffdfba');
      this.audio.play('ui');
      return;
    }
    if (this.hero.hearts >= this.hero.maxHearts) {
      this._addFloatText(this.hero.x, this.hero.y - 70, '❤️ ¡Corazones llenos!', '#ff9eb5');
      return;
    }
    this.state.potions--;
    this.hero.hearts = Math.min(this.hero.maxHearts, this.hero.hearts + 3);
    this.audio.play('potion');
    this._spawnBurst(this.hero.x, this.hero.y - 30, '#ff6b8b', 14);
    this._addFloatText(this.hero.x, this.hero.y - 78, '+3 ❤️ ¡Qué rico!', '#ff9eb5');
    this._save();
    this._updateHUD();
  }

  _spawnPlayerStar(damage, angleOffset) {
    // Apunta al enemigo más cercano si hay uno a la vista
    let targetAngle = Math.atan2(this.hero.facingY || 0, this.hero.facingX || 1);
    let bestD = 460;
    const candidates = [...this.minions.filter((m) => m.hp > 0)];
    if (this.boss && !this.boss.defeated) candidates.push(this.boss);

    for (const c of candidates) {
      const d = dist(this.hero.x, this.hero.y, c.x, c.y);
      if (d < bestD) {
        bestD = d;
        targetAngle = Math.atan2(c.y - this.hero.y, c.x - this.hero.x);
      }
    }
    const a = targetAngle + angleOffset;
    this.projectiles.push({
      fromPlayer: true,
      x: this.hero.x,
      y: this.hero.y - 34,
      vx: Math.cos(a) * 520,
      vy: Math.sin(a) * 520,
      damage,
      color: '#ffe052',
      life: 1.1
    });
  }

  _openChest(chest) {
    chest.opened = true;
    this.state.openedChests[chest.key] = true;
    this.state.resources.wood += 3;
    this.state.resources.stone += 3;
    this.state.resources.crystal += 3;
    this.hero.hearts = Math.min(this.hero.maxHearts, this.hero.hearts + 1);
    this.audio.play('chest');
    this.voice.speak('¡Encontraste un cofre secreto! ¡Muchos recursos para crear!');
    this._spawnBurst(chest.x, chest.y - 20, '#ffd447', 18);
    this._addFloatText(chest.x, chest.y - 54, '🎁 +3 🪵 +3 🪨 +3 💎', '#ffe66d');
    this._save();
    this._updateHUD();
  }

  _damageMinion(m, dmg) {
    m.hp -= dmg;
    m.hurtTimer = 0.25;
    this.audio.play('hit');
    this._spawnBurst(m.x, m.y - 20, '#ffdf6b', 8);
    this._addFloatText(m.x, m.y - 46, `-${dmg}`, '#ffe66d');

    // Empujón cómico
    const a = Math.atan2(m.y - this.hero.y, m.x - this.hero.x);
    m.x += Math.cos(a) * 28;
    m.y += Math.sin(a) * 28;

    if (m.hp <= 0) {
      this._spawnBurst(m.x, m.y - 20, '#fff5dc', 14);
      const dropType = Math.random() < 0.35 ? 'heart' : Math.random() < 0.5 ? 'crystal' : 'stone';
      this.drops.push({ x: m.x, y: m.y, type: dropType, life: 25 });
    }
  }

  _damageBoss(dmg) {
    if (!this.boss || this.boss.defeated) return;
    const bonus = this.boss.state === 'dizzy' ? 1.35 : 1.0;
    const finalDmg = Math.round(dmg * bonus);
    this.boss.hp = Math.max(0, this.boss.hp - finalDmg);
    this.boss.hurtTimer = 0.25;
    this.audio.play('hit');
    this._spawnBurst(this.boss.x, this.boss.y - 48, '#ffd447', 10);
    this._addFloatText(this.boss.x, this.boss.y - 110, `-${finalDmg}!`, '#ffe052');

    if (this.boss.hp <= 0) {
      this.boss.defeated = true;
      this.state.defeatedBosses[this.currentWorldDef.id] = true;
      this.state.resources.crystal += 4;
      this.state.resources.wood += 4;
      this.state.resources.stone += 4;
      this._save();
      this._updateHUD();
      this.audio.play('victory');
      this.voice.speak(this.boss.defeatLine, true);
      this._spawnBurst(this.boss.x, this.boss.y - 50, '#ffe052', 30);

      const totalMedals = Object.keys(this.state.defeatedBosses).length;
      const charName = CHARACTERS[this.state.characterId].name;
      this.el.victoryText.textContent =
        totalMedals >= 4
          ? `¡${charName} venció a ${this.boss.name} y completó las 4 Medallas Retro 1930! ¡Campeón total!`
          : `¡${charName} venció a ${this.boss.name}! Ganaste la ${this.currentWorldDef.medalName} (+4 de cada recurso).`;
      this.el.victoryBanner.classList.remove('hidden');
    }
  }

  _hurtHero(amount = 1) {
    if (this.hero.hurtTimer > 0) return;
    if (this.hero.shieldActive) {
      this.audio.play('shield');
      this._spawnBurst(this.hero.x, this.hero.y - 32, '#ffe052', 10);
      this._addFloatText(this.hero.x, this.hero.y - 74, '🛡️ ¡Bloqueado!', '#ffe052');
      this.hero.hurtTimer = 0.45;
      return;
    }
    this.hero.hearts = Math.max(0, this.hero.hearts - amount);
    this.hero.hurtTimer = 1.1;
    this.audio.play('hurt');
    this._addFloatText(this.hero.x, this.hero.y - 74, '¡Ay!', '#ff8a80');
    this._updateHUD();

    if (this.hero.hearts <= 0) {
      // Reaparición amigable en el campamento sin perder ningún objeto
      this.hero.x = 320;
      this.hero.y = 785;
      this.hero.hearts = this.hero.maxHearts;
      this.voice.speak('¡Uy, qué cosquillas! ¡De vuelta al campamento con toda la energía!');
      this._addFloatText(this.hero.x, this.hero.y - 80, '✨ ¡Energía restaurada!', '#ffe66d');
      this._updateHUD();
    }
  }

  _resIcon(type) {
    return type === 'wood' ? '🪵' : type === 'stone' ? '🪨' : type === 'crystal' ? '💎' : '❤️';
  }

  _spawnBurst(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 50 + Math.random() * 140;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 30,
        color,
        r: 4 + Math.random() * 5,
        life: 0.45 + Math.random() * 0.35
      });
    }
  }

  _addFloatText(x, y, text, color = '#fff9eb') {
    this.floatingTexts.push({ x, y, text, color, life: 1.15 });
  }

  // --- MODALES DE CRAFTEO, MAPA Y ACTUALIZADOR ---
  _closeAllModals() {
    this.el.craftModal.classList.add('hidden');
    this.el.mapModal.classList.add('hidden');
    this.el.updateModal.classList.add('hidden');
    this.paused = false;
  }

  _openCraftModal() {
    this.paused = true;
    this.el.craftModal.classList.remove('hidden');
    this._renderCraftModal();
  }

  _renderCraftModal() {
    const r = this.state.resources;
    this.el.craftResSummary.innerHTML =
      `<span>🪵 Madera: <b>${r.wood}</b></span>` +
      `<span>🪨 Piedra: <b>${r.stone}</b></span>` +
      `<span>💎 Cristales: <b>${r.crystal}</b></span>`;

    this.el.craftGrid.innerHTML = '';
    for (const item of RECIPES) {
      const owned =
        item.slot === 'shield'
          ? this.state.hasShield
          : item.slot === 'weapon'
          ? this.state.crafted.includes(item.id)
          : false;
      const equipped = item.slot === 'weapon' && this.state.equippedWeapon === item.id;
      const canAfford =
        r.wood >= item.cost.wood && r.stone >= item.cost.stone && r.crystal >= item.cost.crystal;

      const card = document.createElement('div');
      card.className = 'craft-card' + (equipped ? ' equipped' : '');

      const costs = [];
      if (item.cost.wood) costs.push(`🪵 ${item.cost.wood}`);
      if (item.cost.stone) costs.push(`🪨 ${item.cost.stone}`);
      if (item.cost.crystal) costs.push(`💎 ${item.cost.crystal}`);

      let btnLabel = 'FABRICAR';
      let btnClass = 'retro-btn small';
      let disabled = false;

      if (item.slot === 'consumable') {
        btnLabel = `FABRICAR (Tienes ${this.state.potions})`;
        disabled = !canAfford;
      } else if (item.slot === 'shield' && owned) {
        btnLabel = 'EQUIPADO ✓';
        btnClass += ' ok';
        disabled = true;
      } else if (owned) {
        btnLabel = equipped ? 'EQUIPADO ✓' : 'EQUIPAR';
        btnClass += equipped ? ' ok' : ' alt';
      } else {
        disabled = !canAfford;
      }

      card.innerHTML = `
        <div class="craft-head">
          <span class="craft-icon">${item.icon}</span>
          <div>
            <h3>${item.name}</h3>
            <div class="craft-costs">${costs.join(' · ')}</div>
          </div>
        </div>
        <p>${item.desc}</p>
        <button class="${btnClass}" ${disabled ? 'disabled' : ''}>${btnLabel}</button>
      `;

      card.querySelector('button').addEventListener('click', () => {
        if (owned && item.slot === 'weapon') {
          this.state.equippedWeapon = item.id;
          this.hero.weapon = item.id;
          this.audio.play('ui');
          this.voice.speak(`¡Equipaste ${item.name}!`);
        } else if (canAfford) {
          this.state.resources.wood -= item.cost.wood;
          this.state.resources.stone -= item.cost.stone;
          this.state.resources.crystal -= item.cost.crystal;
          if (item.slot === 'consumable') {
            this.state.potions++;
          } else if (item.slot === 'shield') {
            this.state.hasShield = true;
          } else {
            this.state.crafted.push(item.id);
            this.state.equippedWeapon = item.id;
            this.hero.weapon = item.id;
          }
          this.audio.play('craft');
          this.voice.speak(`¡Increíble! Fabricaste ${item.name}.`, true);
        }
        this._save();
        this._updateHUD();
        this._renderCraftModal();
      });

      this.el.craftGrid.appendChild(card);
    }
  }

  _openMapModal() {
    this.paused = true;
    this.el.mapModal.classList.remove('hidden');
    this.el.mapGrid.innerHTML = '';

    for (const w of WORLDS) {
      const defeated = !!this.state.defeatedBosses[w.id];
      const active = this.currentWorldDef.id === w.id;
      const card = document.createElement('div');
      card.className = 'map-card' + (active ? ' active' : '');
      card.innerHTML = `
        <div class="map-icon">${w.icon}</div>
        <h3>${w.name}</h3>
        <p>${w.subtitle}</p>
        <div class="map-boss">Jefe: <b>${w.boss.name}</b> ${defeated ? '🏅' : '⚡'}</div>
        <button class="retro-btn small ${active ? 'alt' : ''}">${active ? 'AQUÍ ESTÁS' : 'VIAJAR'}</button>
      `;
      card.querySelector('button').addEventListener('click', () => {
        this.audio.play('ui');
        this._closeAllModals();
        this.loadWorld(w.id, true);
      });
      this.el.mapGrid.appendChild(card);
    }
  }

  async _checkUpdateQuietly() {
    try {
      const info = await this.updater.checkForUpdates();
      if (info && info.hasUpdate) {
        this.el.btnUpdateBadge.classList.remove('hidden');
      }
    } catch {}
  }

  _openUpdateModal() {
    this.paused = true;
    this.el.updateModal.classList.remove('hidden');
    this._runManualUpdateCheck();
  }

  async _runManualUpdateCheck() {
    this.el.updateStatus.textContent = 'Buscando nueva edición en GitHub Releases...';
    this.el.updateNotes.textContent = '';
    this.el.btnDownloadUpdate.classList.add('hidden');
    this.el.updateProgressWrap.classList.add('hidden');
    try {
      const info = await this.updater.checkForUpdates();
      if (info.hasUpdate) {
        this.el.btnUpdateBadge.classList.remove('hidden');
        this.el.updateStatus.textContent = `¡Nueva versión v${info.latestVersion} disponible! (Actual: v${info.currentVersion})`;
        this.el.updateNotes.textContent = info.notes;
        this.el.btnDownloadUpdate.classList.remove('hidden');
      } else {
        this.el.updateStatus.textContent = `¡Tu juego está al día! (Versión v${info.currentVersion})`;
        this.el.updateNotes.textContent = 'Ya tienes la última edición de ¡Aventura Retro 1930!.';
      }
    } catch {
      this.el.updateStatus.textContent = `Versión instalada: v${APP_VERSION}`;
      this.el.updateNotes.textContent = 'No se pudo conectar a GitHub ahora (revisa tu Wi-Fi o intenta luego).';
    }
  }

  async _startUpdateDownload() {
    this.el.btnDownloadUpdate.disabled = true;
    this.el.updateProgressWrap.classList.remove('hidden');
    this.el.updateStatus.textContent = 'Descargando APK de actualización...';
    try {
      await this.updater.downloadAndInstall((pct) => {
        this.el.updateProgressFill.style.width = `${pct}%`;
        this.el.updateStatus.textContent = `Descargando actualización: ${pct}%`;
      });
      this.el.updateStatus.textContent = '¡Listo! Acepta la instalación en Android.';
    } catch {
      this.el.updateStatus.textContent = 'Abriendo descarga en el navegador...';
    } finally {
      this.el.btnDownloadUpdate.disabled = false;
    }
  }

  _updateHUD() {
    const charDef = CHARACTERS[this.state.characterId];
    this.el.hudPortraitName.textContent = charDef.name;
    this.el.hudWorldName.textContent = `${this.currentWorldDef.icon} ${this.currentWorldDef.name}`;
    this.el.hudWood.textContent = this.state.resources.wood;
    this.el.hudStone.textContent = this.state.resources.stone;
    this.el.hudCrystal.textContent = this.state.resources.crystal;
    this.el.hudMedals.textContent = `${Object.keys(this.state.defeatedBosses).length}/4`;
    this.el.potionCount.textContent = this.state.potions;

    const wDef = RECIPES.find((r) => r.id === this.state.equippedWeapon);
    this.el.hudWeaponBadge.textContent = wDef ? `${wDef.icon} ${wDef.name}` : '🥊 Guantes Retro';

    let heartsHtml = '';
    for (let i = 0; i < this.hero.maxHearts; i++) {
      heartsHtml += i < this.hero.hearts ? '❤️' : '🤍';
    }
    this.el.hudHearts.textContent = heartsHtml;
  }

  // --- BUCLE PRINCIPAL ---
  _loop(ts) {
    const dt = Math.min(0.05, (ts - (this.lastTs || ts)) / 1000);
    this.lastTs = ts;
    this.time += dt;

    const frame12 = Math.floor(this.time * CARTOON_FPS);

    // Animar vistas previas de Carlos, Mateo y Ariel si la pantalla de título está abierta
    if (!this.el.titleModal.classList.contains('hidden')) {
      this._drawPreviewCanvases(frame12);
    }

    if (this.running && !this.paused) {
      this._update(dt);
    }

    if (this.running) {
      this._render(frame12);
    }

    requestAnimationFrame((t) => this._loop(t));
  }

  _drawPreviewCanvases(frame12) {
    for (const item of this.previewCanvases) {
      if (!item.canvas) continue;
      const pctx = item.canvas.getContext('2d');
      pctx.clearRect(0, 0, item.canvas.width, item.canvas.height);
      const def = CHARACTERS[item.id];
      drawHero1930(
        pctx,
        {
          x: item.canvas.width / 2,
          y: item.canvas.height - 20,
          facingX: 1,
          moving: false,
          attackTimer: 0,
          shieldActive: false,
          hurtTimer: 0,
          weapon: item.id === 'carlos' ? 'espada' : item.id === 'mateo' ? 'pico' : 'varita'
        },
        def,
        frame12,
        this.sprites
      );
    }
  }

  _update(dt) {
    const charDef = CHARACTERS[this.state.characterId];

    // Movimiento por teclado + joystick táctil
    let ix = this.joy.dx;
    let iy = this.joy.dy;
    if (this.keys.ArrowLeft || this.keys.KeyA) ix -= 1;
    if (this.keys.ArrowRight || this.keys.KeyD) ix += 1;
    if (this.keys.ArrowUp || this.keys.KeyW) iy -= 1;
    if (this.keys.ArrowDown || this.keys.KeyS) iy += 1;

    const mag = Math.hypot(ix, iy);
    if (mag > 1) {
      ix /= mag;
      iy /= mag;
    }

    this.hero.moving = mag > 0.12;
    if (this.hero.moving) {
      this.hero.facingX = Math.abs(ix) > 0.1 ? (ix > 0 ? 1 : -1) : this.hero.facingX;
      this.hero.facingY = iy;
      this.hero.x = clamp(this.hero.x + ix * charDef.speed * dt, 75, WORLD_W - 75);
      this.hero.y = clamp(this.hero.y + iy * charDef.speed * dt, 95, WORLD_H - 75);
    }

    // Temporizadores del héroe
    this.hero.attackTimer = Math.max(0, this.hero.attackTimer - dt);
    this.hero.attackCooldown = Math.max(0, this.hero.attackCooldown - dt);
    this.hero.specialCooldown = Math.max(0, this.hero.specialCooldown - dt);
    this.hero.hurtTimer = Math.max(0, this.hero.hurtTimer - dt);
    if (this.hero.shieldActive) {
      this.hero.shieldTimer -= dt;
      if (this.hero.shieldTimer <= 0) this.hero.shieldActive = false;
    }

    // Cámara suave siguiendo al personaje
    const targetCamX = clamp(this.hero.x - STAGE_W / 2, 0, WORLD_W - STAGE_W);
    const targetCamY = clamp(this.hero.y - STAGE_H / 2, 0, WORLD_H - STAGE_H);
    this.camera.x += (targetCamX - this.camera.x) * Math.min(1, dt * 8);
    this.camera.y += (targetCamY - this.camera.y) * Math.min(1, dt * 8);

    // Nodos de recursos (respawn y vibración)
    for (const node of this.nodes) {
      if (node.shake > 0) node.shake = Math.max(0, node.shake - dt);
      if (node.respawnTimer > 0) {
        node.respawnTimer -= dt;
        if (node.respawnTimer <= 0) {
          node.hp = node.maxHp;
        }
      }
    }

    // Objetos recolectables con imán amigable
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const d = this.drops[i];
      d.life -= dt;
      const dd = dist(d.x, d.y, this.hero.x, this.hero.y);
      if (dd < 155) {
        d.x += ((this.hero.x - d.x) / Math.max(1, dd)) * 340 * dt;
        d.y += ((this.hero.y - d.y) / Math.max(1, dd)) * 340 * dt;
      }
      if (dd < 36) {
        if (d.type === 'heart') {
          this.hero.hearts = Math.min(this.hero.maxHearts, this.hero.hearts + 1);
        } else {
          this.state.resources[d.type]++;
        }
        this.audio.play('pickup');
        this._save();
        this._updateHUD();
        this.drops.splice(i, 1);
      } else if (d.life <= 0) {
        this.drops.splice(i, 1);
      }
    }

    // Villanos menores
    for (const m of this.minions) {
      if (m.hp <= 0) continue;
      m.hurtTimer = Math.max(0, m.hurtTimer - dt);
      m.hitCooldown = Math.max(0, m.hitCooldown - dt);
      const dHero = dist(m.x, m.y, this.hero.x, this.hero.y);
      if (dHero < 260) {
        const a = Math.atan2(this.hero.y - m.y, this.hero.x - m.x);
        m.x += Math.cos(a) * m.speed * dt;
        m.y += Math.sin(a) * m.speed * dt;
        if (dHero < 42 && m.hitCooldown <= 0) {
          this._hurtHero(1);
          m.hitCooldown = 1.25;
        }
      } else {
        // Patrulla suave alrededor de su hogar
        const dHome = dist(m.x, m.y, m.homeX, m.homeY);
        if (dHome > 35) {
          const a = Math.atan2(m.homeY - m.y, m.homeX - m.x);
          m.x += Math.cos(a) * m.speed * 0.6 * dt;
          m.y += Math.sin(a) * m.speed * 0.6 * dt;
        }
      }
    }

    // Jefe Cómico del Mundo
    this._updateBoss(dt);

    // Proyectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;

      let hit = false;
      if (p.fromPlayer) {
        for (const m of this.minions) {
          if (m.hp > 0 && dist(p.x, p.y, m.x, m.y - 20) < 34) {
            this._damageMinion(m, p.damage);
            hit = true;
            break;
          }
        }
        if (!hit && this.boss && !this.boss.defeated && dist(p.x, p.y, this.boss.x, this.boss.y - 45) < 60) {
          this._damageBoss(p.damage);
          hit = true;
        }
      } else {
        if (dist(p.x, p.y, this.hero.x, this.hero.y - 28) < 34) {
          this._hurtHero(1);
          hit = true;
        }
      }

      if (hit || p.life <= 0) {
        this.projectiles.splice(i, 1);
      }
    }

    // Partículas y textos flotantes
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vy += 180 * dt;
      pt.life -= dt;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 36 * dt;
      ft.life -= dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }
  }

  _updateBoss(dt) {
    const b = this.boss;
    if (!b || b.defeated) {
      this.el.bossBarWrap.classList.add('hidden');
      return;
    }

    b.hurtTimer = Math.max(0, b.hurtTimer - dt);
    const dHero = dist(b.x, b.y, this.hero.x, this.hero.y);
    const inArena = dHero < 470;

    if (inArena) {
      this.el.bossBarWrap.classList.remove('hidden');
      this.el.bossBarName.textContent = `👑 ${b.name}`;
      this.el.bossBarFill.style.width = `${(b.hp / b.maxHp) * 100}%`;
      if (!b.taunted) {
        b.taunted = true;
        this.voice.speak(b.taunt, true);
      }
    } else {
      this.el.bossBarWrap.classList.add('hidden');
      return;
    }

    b.facingX = this.hero.x < b.x ? -1 : 1;
    b.stateTimer -= dt;

    if (b.state === 'idle' || b.state === 'chase') {
      // Se acerca con ritmo cartoon
      const a = Math.atan2(this.hero.y - b.y, this.hero.x - b.x);
      b.x = clamp(b.x + Math.cos(a) * b.speed * dt, 1650, 2240);
      b.y = clamp(b.y + Math.sin(a) * b.speed * dt, 440, 990);
      if (dHero < 64) {
        this._hurtHero(1);
      }
      if (b.stateTimer <= 0) {
        b.state = 'telegraph';
        b.stateTimer = 0.85;
      }
    } else if (b.state === 'telegraph') {
      if (b.stateTimer <= 0) {
        // Lanza 3 proyectiles cómicos en abanico
        this.audio.play('boss_stomp');
        const baseA = Math.atan2(this.hero.y - b.y, this.hero.x - b.x);
        for (const off of [-0.35, 0, 0.35]) {
          this.projectiles.push({
            fromPlayer: false,
            x: b.x,
            y: b.y - 46,
            vx: Math.cos(baseA + off) * 265,
            vy: Math.sin(baseA + off) * 265,
            color: b.projectileColor,
            life: 2.3
          });
        }
        b.state = 'dizzy';
        b.stateTimer = 2.6; // ¡Mareado para que los niños puedan golpearlo!
      }
    } else if (b.state === 'dizzy') {
      if (b.stateTimer <= 0) {
        b.state = 'chase';
        b.stateTimer = 2.5;
      }
    }
  }

  _render(frame12) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, STAGE_W, STAGE_H);

    // 1. Fondo en acuarela vintage 1930 cacheado
    const bgCanvas = this.watercolor.getWorldCanvas(this.currentWorldDef);
    ctx.drawImage(
      bgCanvas,
      this.camera.x * 0.5,
      this.camera.y * 0.5,
      STAGE_W * 0.5,
      STAGE_H * 0.5,
      0,
      0,
      STAGE_W,
      STAGE_H
    );

    ctx.save();
    ctx.translate(-this.camera.x, -this.camera.y);

    // 2. Mesa de Creación en el campamento
    const nearBench = dist(this.hero.x, this.hero.y, this.workbenchPos.x, this.workbenchPos.y) < 110;
    drawWorkbench(ctx, this.workbenchPos.x, this.workbenchPos.y, frame12, nearBench);

    // 3. Ordenar entidades por eje Y para profundidad 2.5D natural
    const drawList = [];
    for (const node of this.nodes) {
      if (node.respawnTimer <= 0) {
        drawList.push({ y: node.y, fn: () => drawResourceNode(ctx, node, frame12) });
      }
    }
    for (const chest of this.chests) {
      drawList.push({ y: chest.y, fn: () => drawChest(ctx, chest, frame12) });
    }
    for (const m of this.minions) {
      if (m.hp > 0) drawList.push({ y: m.y, fn: () => drawMinion1930(ctx, m, frame12) });
    }
    if (this.boss && !this.boss.defeated) {
      drawList.push({ y: this.boss.y, fn: () => drawBoss1930(ctx, this.boss, frame12, this.sprites) });
    }
    drawList.push({
      y: this.hero.y,
      fn: () => drawHero1930(ctx, this.hero, CHARACTERS[this.state.characterId], frame12, this.sprites)
    });

    drawList.sort((a, b) => a.y - b.y);
    for (const item of drawList) item.fn();

    // 4. Objetos recolectables brillantes
    for (const d of this.drops) {
      const bob = Math.sin(frame12 * 0.6 + d.x) * 4;
      ctx.save();
      ctx.fillStyle = '#fff7df';
      ctx.strokeStyle = '#1d1714';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(d.x, d.y - 12 + bob, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this._resIcon(d.type), d.x, d.y - 11 + bob);
      ctx.restore();
    }

    // 5. Proyectiles (Estrellas mágicas o proyectiles cómicos del jefe)
    for (const p of this.projectiles) {
      if (p.fromPlayer) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(frame12 * 0.45);
        drawStarShape(ctx, 0, 0, 16, 7, 5, p.color);
        ctx.restore();
      } else {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#1d1714';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    // 6. Partículas estilo tinta y estrellitas
    for (const pt of this.particles) {
      ctx.save();
      ctx.fillStyle = pt.color;
      ctx.strokeStyle = '#1d1714';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 7. Textos flotantes cómicos
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, ft.life * 1.4);
      ctx.font = '900 22px "Fredoka", "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#1d1714';
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    ctx.restore();

    // 8. Brújula sutil hacia el Jefe si aún no fue derrotado y está fuera de pantalla
    if (this.boss && !this.boss.defeated && dist(this.hero.x, this.hero.y, this.boss.x, this.boss.y) > 520) {
      const ang = Math.atan2(this.boss.y - this.hero.y, this.boss.x - this.hero.x);
      const px = STAGE_W / 2 + Math.cos(ang) * 320;
      const py = STAGE_H / 2 + Math.sin(ang) * 210;
      ctx.save();
      ctx.translate(px, py);
      ctx.fillStyle = '#fff5dc';
      ctx.strokeStyle = '#1d1714';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-64, -18, 128, 34, 17);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#b5312a';
      ctx.font = 'bold 14px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👑 Jefe aquí →', 0, 5);
      ctx.restore();
    }

    // 9. Viñeta y celuloide vintage 1930
    drawVintageFilmOverlay(ctx, STAGE_W, STAGE_H, frame12);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.retroGame = new RetroGame();
});
