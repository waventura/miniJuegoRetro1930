// Auto-actualización in-app conectada a GitHub Releases (waventura/miniJuegoRetro1930)
import { APP_VERSION, GITHUB_REPO } from './config.js';

function parseSemver(v) {
  return String(v || '0.0.0')
    .replace(/^v/i, '')
    .split('.')
    .map((n) => parseInt(n, 10) || 0);
}

export function isNewerVersion(remote, local) {
  const r = parseSemver(remote);
  const l = parseSemver(local);
  for (let i = 0; i < 3; i++) {
    if ((r[i] || 0) > (l[i] || 0)) return true;
    if ((r[i] || 0) < (l[i] || 0)) return false;
  }
  return false;
}

export class RetroUpdater {
  constructor() {
    this.currentVersion = APP_VERSION;
    this.latestRelease = null;
  }

  _getNativePlugin() {
    return window.Capacitor && window.Capacitor.Plugins
      ? window.Capacitor.Plugins.AppUpdater
      : null;
  }

  async getCurrentVersion() {
    const native = this._getNativePlugin();
    if (native && typeof native.getAppVersion === 'function') {
      try {
        const res = await native.getAppVersion();
        if (res && res.versionName) {
          this.currentVersion = res.versionName;
        }
      } catch {}
    }
    return this.currentVersion;
  }

  async checkForUpdates() {
    const localVer = await this.getCurrentVersion();
    const url = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
    const res = await fetch(url, {
      headers: { Accept: 'application/vnd.github+json' }
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    const remoteTag = (data.tag_name || '').replace(/^v/i, '');
    const apkAsset = (data.assets || []).find((a) =>
      a.name && a.name.toLowerCase().endsWith('.apk')
    );

    const hasUpdate = isNewerVersion(remoteTag, localVer);
    this.latestRelease = {
      currentVersion: localVer,
      latestVersion: remoteTag || localVer,
      hasUpdate,
      name: data.name || `Versión ${remoteTag}`,
      notes: data.body || '¡Nuevas mejoras y diversión retro 1930!',
      apkUrl: apkAsset ? apkAsset.browser_download_url : null,
      htmlUrl: data.html_url || `https://github.com/${GITHUB_REPO}/releases`
    };
    return this.latestRelease;
  }

  async downloadAndInstall(onProgress) {
    if (!this.latestRelease) return;
    const native = this._getNativePlugin();

    if (native && typeof native.downloadAndInstall === 'function' && this.latestRelease.apkUrl) {
      let listenerHandle = null;
      if (typeof native.addListener === 'function' && onProgress) {
        listenerHandle = await native.addListener('downloadProgress', (info) => {
          onProgress(info.percent || 0);
        });
      }
      try {
        await native.downloadAndInstall({
          url: this.latestRelease.apkUrl,
          version: this.latestRelease.latestVersion
        });
      } finally {
        if (listenerHandle && typeof listenerHandle.remove === 'function') {
          listenerHandle.remove();
        }
      }
    } else {
      window.open(this.latestRelease.apkUrl || this.latestRelease.htmlUrl, '_blank');
    }
  }
}
