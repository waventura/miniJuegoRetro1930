// Controlador principal de ¡Aventura Retro 1930! — Colección de 6 Minijuegos
import {
  APP_VERSION,
  STAGE_W,
  STAGE_H,
  CARTOON_FPS,
  CHARACTERS,
  MINIGAMES
} from './config.js';
import { SpriteSheetManager } from './sprites.js';
import { RetroAudio } from './audio.js';
import { RetroVoice } from './tts.js';
import { RetroUpdater } from './updater.js';
import { drawHero1930 } from './rubberhose.js';
import { createMiniGame } from './minigames.js';

const SAVE_KEY = 'aventura_retro_1930_minigames_v2';

class MiniGameHub {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = STAGE_W;
    this.canvas.height = STAGE_H;

    this.sprites = new SpriteSheetManager();
    this.audio = new RetroAudio();
    this.voice = new RetroVoice();
    this.updater = new RetroUpdater();

    this.state = this._loadSave();
    this.activeGame = null;
    this.activeDef = null;
    this.score = 0;
    this.combo = 0;
    this.timeLeft = 0;
    this.time = 0;
    this.lastTs = 0;
    this.pointerDown = false;

    this._initUI();
    this._bindCanvasInput();
    this.sprites.init();
    this._checkUpdateQuietly();

    requestAnimationFrame((ts) => this._loop(ts));
  }

  _defaultSave() {
    return {
      characterId: 'carlos',
      bestScores: {},
      stars: {},
      sfxEnabled: true,
      musicEnabled: true,
      voiceEnabled: true
    };
  }

  _loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) return Object.assign(this._defaultSave(), JSON.parse(raw));
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
      hubScreen: document.getElementById('hubScreen'),
      playHud: document.getElementById('playHud'),
      gamesGrid: document.getElementById('gamesGrid'),
      totalStars: document.getElementById('totalStars'),
      versionLabel: document.getElementById('versionLabel'),
      hudGameTitle: document.getElementById('hudGameTitle'),
      hudScore: document.getElementById('hudScore'),
      hudCombo: document.getElementById('hudCombo'),
      hudTimer: document.getElementById('hudTimer'),
      resultModal: document.getElementById('resultModal'),
      resultTitle: document.getElementById('resultTitle'),
      resultStars: document.getElementById('resultStars'),
      resultScore: document.getElementById('resultScore'),
      resultBest: document.getElementById('resultBest'),
      updateModal: document.getElementById('updateModal'),
      updateDot: document.getElementById('updateDot'),
      updateStatus: document.getElementById('updateStatus'),
      updateNotes: document.getElementById('updateNotes'),
      btnDownloadUpdate: document.getElementById('btnDownloadUpdate'),
      btnSoundHub: document.getElementById('btnSoundHub'),
      btnVoiceHub: document.getElementById('btnVoiceHub')
    };

    this.el.versionLabel.textContent = `v${APP_VERSION}`;
    this.audio.setMusicEnabled(this.state.musicEnabled);
    this.audio.setSfxEnabled(this.state.sfxEnabled);
    this.voice.setEnabled(this.state.voiceEnabled);
    this._refreshAudioButtons();

    // Selector rápido de Carlos, Mateo y Ariel en el menú principal
    document.querySelectorAll('.hero-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        this.audio.unlock();
        this.audio.play('ui');
        this._selectCharacter(chip.dataset.char, true);
      });
    });

    this.previewCanvases = [
      { id: 'carlos', canvas: document.getElementById('chipCarlos') },
      { id: 'mateo', canvas: document.getElementById('chipMateo') },
      { id: 'ariel', canvas: document.getElementById('chipAriel') }
    ];

    this.el.btnSoundHub.addEventListener('click', () => {
      this.audio.unlock();
      this.state.musicEnabled = !this.state.musicEnabled;
      this.state.sfxEnabled = this.state.musicEnabled;
      this.audio.setMusicEnabled(this.state.musicEnabled);
      this.audio.setSfxEnabled(this.state.sfxEnabled);
      this._refreshAudioButtons();
      this._save();
    });

    this.el.btnVoiceHub.addEventListener('click', () => {
      this.state.voiceEnabled = !this.state.voiceEnabled;
      this.voice.setEnabled(this.state.voiceEnabled);
      this._refreshAudioButtons();
      this._save();
      if (this.state.voiceEnabled) this.voice.speak('¡Voz activada!', true);
    });

    document.getElementById('btnOpenUpdate').addEventListener('click', () => {
      this.audio.play('ui');
      this._openUpdateModal();
    });
    document.getElementById('btnCloseUpdate').addEventListener('click', () => {
      this.el.updateModal.classList.add('hidden');
    });
    document.getElementById('btnCheckNow').addEventListener('click', () => this._runUpdateCheck());
    this.el.btnDownloadUpdate.addEventListener('click', () => {
      this.updater.downloadAndInstall();
    });

    document.getElementById('btnBackHub').addEventListener('click', () => {
      this.audio.play('ui');
      this.returnToHub();
    });
    document.getElementById('btnReplay').addEventListener('click', () => {
      this.audio.play('ui');
      this.el.resultModal.classList.add('hidden');
      if (this.activeDef) this.startMiniGame(this.activeDef.id);
    });
    document.getElementById('btnResultHub').addEventListener('click', () => {
      this.audio.play('ui');
      this.el.resultModal.classList.add('hidden');
      this.returnToHub();
    });

    this._selectCharacter(this.state.characterId, false);
    this._renderHubCards();
  }

  _refreshAudioButtons() {
    this.el.btnSoundHub.textContent = this.state.musicEnabled ? '🔊' : '🔇';
    this.el.btnVoiceHub.textContent = this.state.voiceEnabled ? '🗣️' : '🤫';
  }

  _selectCharacter(charId, speak = false) {
    const def = CHARACTERS[charId] || CHARACTERS.carlos;
    this.state.characterId = def.id;
    document.querySelectorAll('.hero-chip').forEach((c) => {
      c.classList.toggle('selected', c.dataset.char === def.id);
    });
    this._save();
    if (speak) this.voice.speak(def.greeting, true);
  }

  _renderHubCards() {
    this.el.gamesGrid.innerHTML = '';
    let totalEarned = 0;

    for (const g of MINIGAMES) {
      const earned = this.state.stars[g.id] || 0;
      const best = this.state.bestScores[g.id] || 0;
      totalEarned += earned;

      const starsStr = '⭐'.repeat(earned) + '☆'.repeat(3 - earned);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'game-card';
      card.style.setProperty('--card-accent', g.color);
      card.style.setProperty('--card-bg', g.bg);
      card.innerHTML = `
        <div class="game-card-top">
          <span class="game-badge">${g.badge}</span>
          <span class="game-stars">${starsStr}</span>
        </div>
        <div class="game-ico">${g.icon}</div>
        <h2>${g.name}</h2>
        <p>${g.desc}</p>
        <div class="game-card-foot">
          <span>🏆 Récord: <b>${best}</b></span>
          <span class="play-pill">▶ JUGAR</span>
        </div>
      `;
      card.addEventListener('click', () => {
        this.audio.unlock();
        this.audio.play('craft');
        this.startMiniGame(g.id);
      });
      this.el.gamesGrid.appendChild(card);
    }

    this.el.totalStars.textContent = `⭐ ${totalEarned} / ${MINIGAMES.length * 3}`;
  }

  startMiniGame(id) {
    const def = MINIGAMES.find((m) => m.id === id) || MINIGAMES[0];
    this.activeDef = def;
    this.score = 0;
    this.combo = 0;
    this.timeLeft = def.duration;

    const host = {
      charDef: CHARACTERS[this.state.characterId],
      sprites: this.sprites,
      audio: this.audio,
      voice: this.voice,
      addCombo: () => {
        this.combo++;
        this._updatePlayHud();
      },
      resetCombo: () => {
        this.combo = 0;
        this._updatePlayHud();
      },
      addScore: (base) => {
        const mult = base > 0 ? Math.min(3, 1 + Math.floor(this.combo / 5) * 0.5) : 1;
        const delta = Math.round(base * mult);
        this.score = Math.max(0, this.score + delta);
        this._updatePlayHud();
        return delta;
      }
    };

    this.activeGame = createMiniGame(def.id, host);
    this.el.hubScreen.classList.add('hidden');
    this.el.resultModal.classList.add('hidden');
    this.el.playHud.classList.remove('hidden');
    this.el.hudGameTitle.textContent = `${def.icon} ${def.name}`;
    this._updatePlayHud();
    this.voice.speak(def.intro, true);
  }

  returnToHub() {
    this.activeGame = null;
    this.activeDef = null;
    this.el.playHud.classList.add('hidden');
    this.el.resultModal.classList.add('hidden');
    this.el.hubScreen.classList.remove('hidden');
    this._renderHubCards();
  }

  _finishMiniGame() {
    const def = this.activeDef;
    const score = this.score;
    let earnedStars = 0;
    if (score >= def.stars[2]) earnedStars = 3;
    else if (score >= def.stars[1]) earnedStars = 2;
    else if (score >= def.stars[0]) earnedStars = 1;
    else if (score > 0) earnedStars = 1;

    const prevBest = this.state.bestScores[def.id] || 0;
    const isNewBest = score > prevBest;
    if (isNewBest) this.state.bestScores[def.id] = score;
    if (earnedStars > (this.state.stars[def.id] || 0)) {
      this.state.stars[def.id] = earnedStars;
    }
    this._save();

    this.activeGame = null;
    this.audio.play('victory');

    const charName = CHARACTERS[this.state.characterId].name;
    this.el.resultTitle.textContent = isNewBest ? `🏆 ¡Nuevo Récord, ${charName}!` : `🎉 ¡Muy bien, ${charName}!`;
    this.el.resultStars.textContent = '⭐'.repeat(earnedStars) + '☆'.repeat(3 - earnedStars);
    this.el.resultScore.textContent = `${score} puntos`;
    this.el.resultBest.textContent = `Mejor récord: ${this.state.bestScores[def.id] || score} pts`;
    this.el.resultModal.classList.remove('hidden');

    const starWord = earnedStars === 1 ? 'una estrella' : `${earnedStars} estrellas`;
    this.voice.speak(`¡Bravo ${charName}! Lograste ${score} puntos y ganaste ${starWord}.`, true);
  }

  _updatePlayHud() {
    this.el.hudScore.textContent = `⭐ ${this.score}`;
    this.el.hudTimer.textContent = `⏱️ ${Math.ceil(this.timeLeft)}s`;
    if (this.combo >= 3) {
      this.el.hudCombo.textContent = `🔥 x${this.combo}`;
      this.el.hudCombo.classList.remove('hidden');
    } else {
      this.el.hudCombo.classList.add('hidden');
    }
  }

  _bindCanvasInput() {
    const toStageCoords = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * STAGE_W,
        y: ((e.clientY - rect.top) / rect.height) * STAGE_H
      };
    };

    this.canvas.addEventListener('pointerdown', (e) => {
      if (!this.activeGame) return;
      e.preventDefault();
      this.audio.unlock();
      this.pointerDown = true;
      const pt = toStageCoords(e);
      this.activeGame.onPointerDown(pt.x, pt.y);
    });

    this.canvas.addEventListener('pointermove', (e) => {
      if (!this.activeGame || !this.pointerDown) return;
      e.preventDefault();
      const pt = toStageCoords(e);
      this.activeGame.onPointerMove(pt.x, pt.y);
    });

    const up = () => {
      this.pointerDown = false;
      if (this.activeGame) this.activeGame.onPointerUp();
    };
    this.canvas.addEventListener('pointerup', up);
    this.canvas.addEventListener('pointercancel', up);
  }

  async _checkUpdateQuietly() {
    try {
      const info = await this.updater.checkForUpdates();
      if (info && info.hasUpdate) {
        this.el.updateDot.classList.remove('hidden');
      }
    } catch {}
  }

  _openUpdateModal() {
    this.el.updateModal.classList.remove('hidden');
    this._runUpdateCheck();
  }

  async _runUpdateCheck() {
    this.el.updateStatus.textContent = 'Buscando nueva versión en GitHub Releases...';
    this.el.updateNotes.textContent = '';
    this.el.btnDownloadUpdate.classList.add('hidden');
    try {
      const info = await this.updater.checkForUpdates();
      if (info.hasUpdate) {
        this.el.updateDot.classList.remove('hidden');
        this.el.updateStatus.textContent = `¡Nueva versión v${info.latestVersion} disponible! (Actual: v${info.currentVersion})`;
        this.el.updateNotes.textContent = info.notes;
        this.el.btnDownloadUpdate.classList.remove('hidden');
      } else {
        this.el.updateStatus.textContent = `¡Tu app está al día! (v${info.currentVersion})`;
        this.el.updateNotes.textContent = 'Ya tienes la última colección de Minijuegos Retro 1930.';
      }
    } catch {
      this.el.updateStatus.textContent = `Versión instalada: v${APP_VERSION}`;
      this.el.updateNotes.textContent = 'No se pudo conectar con GitHub ahora.';
    }
  }

  _loop(ts) {
    const dt = Math.min(0.05, (ts - (this.lastTs || ts)) / 1000);
    this.lastTs = ts;
    this.time += dt;
    const frame12 = Math.floor(this.time * CARTOON_FPS);

    // Animar retratos Rubber Hose en el menú principal
    if (!this.el.hubScreen.classList.contains('hidden')) {
      for (const item of this.previewCanvases) {
        if (!item.canvas) continue;
        const pctx = item.canvas.getContext('2d');
        pctx.clearRect(0, 0, item.canvas.width, item.canvas.height);
        drawHero1930(
          pctx,
          { x: 56, y: 102, facingX: 1, moving: false, attackTimer: 0, shieldActive: false, hurtTimer: 0, weapon: null },
          CHARACTERS[item.id],
          frame12,
          this.sprites
        );
      }
    }

    if (this.activeGame) {
      this.timeLeft = Math.max(0, this.timeLeft - dt);
      this.activeGame.update(dt);
      this.activeGame.render(this.ctx, frame12);
      this._updatePlayHud();

      if (this.timeLeft <= 0) {
        this._finishMiniGame();
      }
    }

    requestAnimationFrame((t) => this._loop(t));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.retroHub = new MiniGameHub();
});
