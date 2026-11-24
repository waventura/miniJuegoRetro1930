// Voz latina natural usando el plugin nativo Android RetroTts (Capacitor)
// con respaldo automático en Web Speech API para navegadores.

export class RetroVoice {
  constructor() {
    this.enabled = true;
    this.webVoice = null;
    this.lastSpoken = '';
    this.lastTime = 0;
    this._initWebVoices();
  }

  _getNativePlugin() {
    return window.Capacitor && window.Capacitor.Plugins
      ? window.Capacitor.Plugins.RetroTts
      : null;
  }

  _initWebVoices() {
    if (!('speechSynthesis' in window)) return;
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices() || [];
      const prefs = ['es-MX', 'es-419', 'es-US', 'es-CO', 'es-AR', 'es-ES', 'es'];
      for (const lang of prefs) {
        const match = voices.find((v) =>
          v.lang && v.lang.toLowerCase().startsWith(lang.toLowerCase())
        );
        if (match) {
          this.webVoice = match;
          return;
        }
      }
    };
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) this.stop();
  }

  speak(text, force = false) {
    if (!this.enabled || !text) return;
    const now = Date.now();
    if (!force && text === this.lastSpoken && now - this.lastTime < 2200) return;
    this.lastSpoken = text;
    this.lastTime = now;

    const native = this._getNativePlugin();
    if (native && typeof native.speak === 'function') {
      native.speak({ text, rate: 0.96, pitch: 1.06 }).catch(() => {});
      return;
    }

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = this.webVoice ? this.webVoice.lang : 'es-MX';
        if (this.webVoice) utter.voice = this.webVoice;
        utter.rate = 0.96;
        utter.pitch = 1.08;
        window.speechSynthesis.speak(utter);
      } catch {
        // Silencioso si el navegador bloquea TTS
      }
    }
  }

  stop() {
    const native = this._getNativePlugin();
    if (native && typeof native.stop === 'function') {
      native.stop().catch(() => {});
    }
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }
}
