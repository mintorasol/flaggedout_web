import { createFlagTexture } from './flags.js';
import * as THREE from 'three';

export function createUI(onAction) {
  const byId = (id) => document.getElementById(id);
  const settingsStorageKey = 'flaggedout.settings.v1';
  const musicDatabaseName = 'flaggedout.audio.v1';
  const ui = {
    app: byId('app'),
    launch: byId('launch-overlay'), settingsBackdrop: byId('settings-backdrop'),
    gear: byId('settings-gear'), hud: byId('hud'), victoryPanel: byId('victory-panel'), winnerConfetti: byId('winner-confetti'),
    count: byId('count-input'), interval: byId('interval-input'), openingShots: byId('opening-shots-input'), appearanceShots: byId('appearance-shots-input'), accuracy: byId('accuracy-input'),
    volume: byId('volume-input'), shotVolume: byId('shot-volume-input'), voiceVolume: byId('voice-volume-input'), speed: byId('speed-input'), quality: byId('quality-input'),
    musicEnabled: byId('music-enabled-input'), musicVolume: byId('music-volume-input'),
    musicFile: byId('music-file-input'), musicFileName: byId('music-file-name'), removeMusicFile: byId('remove-music-file'),
    reload: byId('shot-reload'), reloadLabel: byId('shot-reload-label'),
    reloadTime: byId('shot-reload-time'), reloadProgress: byId('shot-reload-progress'),
    sound: byId('sound-button'), status: byId('status-label'), toast: byId('toast'),
    countryTotal: byId('country-total-stat'), remaining: byId('remaining-stat'),
    eliminationAlert: byId('elimination-alert'), feed: byId('feed-text'), feedFlag: byId('feed-flag'),
    eliminatedFlags: byId('eliminated-flags'), eliminatedTotal: byId('eliminated-total'),
    eliminationTarget: byId('elimination-target'), eliminationProgress: byId('elimination-progress-bar'),
    winnerName: byId('winner-name'), winnerFlag: byId('winner-flag'),
    finalEliminations: byId('final-eliminations'), finalTime: byId('final-time'),
    cycleLabel: byId('cycle-label'), nextCycleCountdown: byId('next-cycle-countdown')
  };
  let soundEnabled = true;
  let backgroundMusicFile = null;
  try {
    const savedSettings = JSON.parse(localStorage.getItem(settingsStorageKey) || 'null');
    if (savedSettings && typeof savedSettings === 'object' && !Array.isArray(savedSettings)) {
      const inputs = {
        count: ui.count,
        interval: ui.interval,
        openingShots: ui.openingShots,
        appearanceShots: ui.appearanceShots,
        accuracy: ui.accuracy,
        volume: ui.volume,
        shotVolume: ui.shotVolume,
        voiceVolume: ui.voiceVolume,
        musicVolume: ui.musicVolume,
        gameSpeed: ui.speed
      };
      for (const [key, input] of Object.entries(inputs)) {
        const value = savedSettings[key];
        if (typeof value === 'number' && Number.isFinite(value)) {
          input.value = String(Math.min(Number(input.max), Math.max(Number(input.min), value)));
        }
      }
      if (typeof savedSettings.backgroundMusic === 'boolean') ui.musicEnabled.checked = savedSettings.backgroundMusic;
      if (['low', 'medium', 'high'].includes(savedSettings.quality)) ui.quality.value = savedSettings.quality;
      if (typeof savedSettings.soundEnabled === 'boolean') soundEnabled = savedSettings.soundEnabled;
    }
  } catch (error) {
    console.error('Could not load saved game settings.', error);
  }

  function saveSettings() {
    try {
      localStorage.setItem(settingsStorageKey, JSON.stringify({
        count: Number(ui.count.value),
        interval: Number(ui.interval.value),
        openingShots: Number(ui.openingShots.value),
        appearanceShots: Number(ui.appearanceShots.value),
        accuracy: Number(ui.accuracy.value),
        volume: Number(ui.volume.value),
        shotVolume: Number(ui.shotVolume.value),
        voiceVolume: Number(ui.voiceVolume.value),
        backgroundMusic: ui.musicEnabled.checked,
        musicVolume: Number(ui.musicVolume.value),
        gameSpeed: Number(ui.speed.value),
        quality: ui.quality.value,
        soundEnabled
      }));
    } catch (error) {
      console.error('Could not save game settings to this browser.', error);
      showToast('Settings could not be saved in this browser.');
    }
  }

  function openMusicDatabase() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('This browser does not support local audio storage.'));
        return;
      }
      const request = indexedDB.open(musicDatabaseName, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains('tracks')) request.result.createObjectStore('tracks');
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Could not open local audio storage.'));
    });
  }

  async function saveMusicFile(file) {
    const database = await openMusicDatabase();
    try {
      await new Promise((resolve, reject) => {
        const transaction = database.transaction('tracks', 'readwrite');
        transaction.objectStore('tracks').put({ blob: file, name: file.name }, 'background');
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error || new Error('Could not save the audio file.'));
        transaction.onabort = () => reject(transaction.error || new Error('Audio file storage was cancelled.'));
      });
    } finally {
      database.close();
    }
  }

  async function deleteMusicFile() {
    const database = await openMusicDatabase();
    try {
      await new Promise((resolve, reject) => {
        const transaction = database.transaction('tracks', 'readwrite');
        transaction.objectStore('tracks').delete('background');
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error || new Error('Could not remove the audio file.'));
        transaction.onabort = () => reject(transaction.error || new Error('Audio file removal was cancelled.'));
      });
    } finally {
      database.close();
    }
  }

  async function loadMusicFile() {
    const database = await openMusicDatabase();
    try {
      return await new Promise((resolve, reject) => {
        const transaction = database.transaction('tracks', 'readonly');
        const request = transaction.objectStore('tracks').get('background');
        request.onsuccess = () => {
          const savedTrack = request.result;
          if (savedTrack?.blob instanceof Blob && typeof savedTrack.name === 'string') {
            backgroundMusicFile = { blob: savedTrack.blob, name: savedTrack.name };
            updateMusicFileName();
          }
          resolve(backgroundMusicFile);
        };
        request.onerror = () => reject(request.error || new Error('Could not restore the saved audio file.'));
      });
    } finally {
      database.close();
    }
  }

  function updateMusicFileName() {
    ui.musicFileName.textContent = backgroundMusicFile?.name || 'Keep Climbing - The Soundings (default)';
    ui.removeMusicFile.classList.toggle('hidden', !backgroundMusicFile);
  }

  byId('play-button').addEventListener('click', () => onAction('start'));
  ui.gear.addEventListener('click', () => showSettings(true));
  byId('close-settings-button').addEventListener('click', () => showSettings(false));
  ui.settingsBackdrop.addEventListener('click', (event) => {
    if (event.target === ui.settingsBackdrop) showSettings(false);
  });
  ui.sound.addEventListener('click', () => onAction('sound'));
  const qualityButtons = [...document.querySelectorAll('.quality-option')];
  for (const button of qualityButtons) {
    const selected = button.dataset.quality === ui.quality.value;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
    button.addEventListener('click', () => {
      ui.quality.value = button.dataset.quality;
      for (const option of qualityButtons) {
        const isSelected = option === button;
        option.classList.toggle('selected', isSelected);
        option.setAttribute('aria-pressed', String(isSelected));
      }
      ui.quality.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !ui.settingsBackdrop.classList.contains('hidden')) showSettings(false);
  });

  const settingsInputs = [ui.count, ui.interval, ui.openingShots, ui.appearanceShots, ui.accuracy, ui.volume, ui.shotVolume, ui.voiceVolume, ui.musicVolume, ui.speed, ui.quality];
  for (const input of settingsInputs) input.addEventListener('input', () => {
    updateSettingLabels();
    saveSettings();
    onAction('settings-change');
  });
  ui.musicEnabled.addEventListener('change', () => {
    updateSettingLabels();
    saveSettings();
    onAction('settings-change');
  });
  ui.musicFile.addEventListener('change', async () => {
    const file = ui.musicFile.files?.[0];
    if (!file) return;
    if (file.type && !file.type.startsWith('audio/')) {
      showToast('Choose a valid audio file.');
      ui.musicFile.value = '';
      return;
    }
    try {
      await saveMusicFile(file);
      backgroundMusicFile = { blob: file, name: file.name };
      updateMusicFileName();
      onAction('settings-change');
    } catch (error) {
      console.error('Could not save the background music file.', error);
      showToast(error.message || 'The audio file could not be saved in this browser.');
    } finally {
      ui.musicFile.value = '';
    }
  });
  ui.removeMusicFile.addEventListener('click', async () => {
    try {
      await deleteMusicFile();
      backgroundMusicFile = null;
      updateMusicFileName();
      onAction('settings-change');
    } catch (error) {
      console.error('Could not remove the background music file.', error);
      showToast(error.message || 'The audio file could not be removed.');
    }
  });
  ui.quality.addEventListener('change', () => {
    updateSettingLabels();
    for (const button of qualityButtons) {
      const selected = button.dataset.quality === ui.quality.value;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    }
    saveSettings();
    onAction('settings-change');
  });

  let toastTimer;
  let eliminationTimer;
  let goImpactTimer;
  function updateSettingLabels() {
    byId('count-value').textContent = ui.count.value;
    byId('interval-value').textContent = `${Number(ui.interval.value).toFixed(1)}s`;
    byId('opening-shots-value').textContent = ui.openingShots.value;
    byId('appearance-shots-value').textContent = ui.appearanceShots.value;
    byId('accuracy-value').textContent = `${ui.accuracy.value}%`;
    byId('volume-value').textContent = `${ui.volume.value}%`;
    byId('shot-volume-value').textContent = `${ui.shotVolume.value}%`;
    byId('voice-volume-value').textContent = `${ui.voiceVolume.value}%`;
    byId('music-enabled-value').textContent = ui.musicEnabled.checked ? 'ON' : 'OFF';
    byId('music-volume-value').textContent = `${ui.musicVolume.value}%`;
    byId('speed-value').textContent = `${Number(ui.speed.value).toFixed(1)}×`;
  }
  function showToast(message) {
    ui.toast.textContent = message;
    ui.toast.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => ui.toast.classList.add('hidden'), 5000);
  }
  function showSettings(open) {
    ui.settingsBackdrop.classList.toggle('hidden', !open);
    ui.settingsBackdrop.setAttribute('aria-hidden', String(!open));
    ui.gear.setAttribute('aria-expanded', String(open));
    if (open) byId('close-settings-button').focus();
    else ui.gear.focus();
  }
  function showLaunch(open) {
    ui.launch.classList.toggle('hidden', !open);
    ui.launch.setAttribute('aria-hidden', String(!open));
    ui.app.classList.toggle('started', !open);
  }
  function setState(state) {
    ui.victoryPanel.classList.toggle('hidden', state !== 'VICTORY');
    if (state !== 'VICTORY') ui.winnerConfetti.classList.remove('active');
    const labels = { MENU: 'SYSTEM READY', STARTING: 'INITIALIZING', PLAYING: 'LIVE BATTLE', PAUSED: 'BATTLE PAUSED', VICTORY: 'BATTLE COMPLETE' };
    ui.status.textContent = labels[state] || 'SYSTEM READY';
  }
  function updateStats(stats) {
    ui.remaining.textContent = String(stats.remaining).padStart(2, '0');
    ui.countryTotal.textContent = String(stats.total).padStart(2, '0');
    updateEliminationProgress(stats.eliminated, stats.total);
  }
  function updateCycle(cycle = null, status = 'LIVE') {
    ui.cycleLabel.textContent = cycle === null ? 'LIVE BATTLE' : `CYCLE ${cycle}  •  ${status}`;
  }
  function updateReloadTimer(remaining, duration, mode = 'reloading') {
    const safeDuration = Math.max(0, duration);
    const progress = safeDuration > 0 ? Math.min(1, Math.max(0, 1 - remaining / safeDuration)) : 1;
    ui.reload.classList.toggle('hidden', mode === 'hidden');
    ui.reload.dataset.mode = mode;
    ui.reloadLabel.textContent = mode === 'deploying' ? 'FIRE' : 'RELOAD';
    ui.reloadTime.textContent = mode === 'deploying' ? 'GO' : String(Math.ceil(Math.max(0, remaining)));
    ui.reload.style.setProperty('--reload-progress', `${progress * 100}%`);
  }
  function triggerHitImpact() {
    for (const element of [ui.reload, byId('elimination-board')]) {
      element.classList.remove('hit-impact');
      void element.offsetWidth;
      element.classList.add('hit-impact');
      element.addEventListener('animationend', () => element.classList.remove('hit-impact'), { once: true });
    }
  }
  function triggerGoImpact() {
    ui.reload.classList.remove('hit-impact');
    void ui.reload.offsetWidth;
    ui.reload.classList.add('hit-impact');
    ui.reload.addEventListener('animationend', () => ui.reload.classList.remove('hit-impact'), { once: true });
    ui.app.classList.remove('go-impact');
    void ui.app.offsetWidth;
    ui.app.classList.add('go-impact');
    clearTimeout(goImpactTimer);
    goImpactTimer = setTimeout(() => ui.app.classList.remove('go-impact'), 460);
  }
  function updateEliminationProgress(count, total) {
    ui.eliminatedTotal.textContent = String(count).padStart(2, '0');
    ui.eliminationTarget.textContent = String(total).padStart(2, '0');
    ui.eliminationProgress.style.width = `${total ? Math.min(100, count / total * 100) : 0}%`;
  }
  function resetEliminations(total) {
    ui.eliminatedFlags.replaceChildren();
    ui.feedFlag.style.backgroundImage = '';
    ui.feedFlag.classList.remove('visible');
    ui.eliminationAlert.classList.remove('visible');
    clearTimeout(eliminationTimer);
    updateEliminationProgress(0, total);
  }
  function showElimination(ball) {
    ui.feed.textContent = ball.name;
    const flag = createFlagTexture(THREE, ball.code);
    const image = flag.texture.image.toDataURL();
    ui.feedFlag.style.backgroundImage = `url(${image})`;
    ui.feedFlag.classList.add('visible');
    const badge = document.createElement('span');
    badge.className = 'eliminated-flag';
    badge.setAttribute('role', 'listitem');
    badge.setAttribute('aria-label', `${ball.name} eliminated`);
    badge.title = ball.name;
    badge.style.backgroundImage = `url(${image})`;
    ui.eliminatedFlags.prepend(badge);
    flag.texture.dispose();
    ui.eliminationAlert.classList.remove('visible');
    requestAnimationFrame(() => ui.eliminationAlert.classList.add('visible'));
    clearTimeout(eliminationTimer);
    eliminationTimer = setTimeout(() => ui.eliminationAlert.classList.remove('visible'), 3000);
  }
  function showWinner(ball, stats) {
    ui.winnerName.textContent = ball.name.toUpperCase();
    ui.finalEliminations.textContent = String(stats.eliminated);
    ui.finalTime.textContent = formatTime(stats.elapsed);
    byId('winner-cycle').textContent = `CYCLE ${stats.cycle} COMPLETE`;
    const flag = createFlagTexture(THREE, ball.code);
    ui.winnerFlag.style.backgroundImage = `url(${flag.texture.image.toDataURL()})`;
    ui.winnerFlag.style.backgroundSize = 'cover';
    flag.texture.dispose();
    startWinnerConfetti();
  }
  function startWinnerConfetti() {
    const colors = ['#35dff5', '#ff9b54', '#f4f8ff', '#ffd166', '#8b7bff', '#ff6384'];
    const pieces = Array.from({ length: 56 }, () => {
      const piece = document.createElement('span');
      piece.className = 'winner-confetti-piece';
      piece.style.setProperty('--left', `${Math.random() * 100}%`);
      piece.style.setProperty('--drift', `${Math.round((Math.random() - 0.5) * 180)}px`);
      piece.style.setProperty('--duration', `${2.7 + Math.random() * 1.8}s`);
      piece.style.setProperty('--delay', `${Math.random() * 0.65}s`);
      piece.style.setProperty('--spin', `${Math.round(360 + Math.random() * 1080)}deg`);
      piece.style.setProperty('--width', `${4 + Math.random() * 5}px`);
      piece.style.setProperty('--height', `${8 + Math.random() * 8}px`);
      piece.style.setProperty('--color', colors[Math.floor(Math.random() * colors.length)]);
      return piece;
    });
    ui.winnerConfetti.classList.remove('active');
    ui.winnerConfetti.replaceChildren(...pieces);
    ui.winnerConfetti.classList.add('active');
  }
  function updateNextCycleCountdown(seconds) {
    ui.nextCycleCountdown.textContent = seconds > 0 ? `NEXT CYCLE IN ${seconds}` : 'NEXT CYCLE STARTING';
  }
  updateSettingLabels();

  return {
    ...ui, showToast, showSettings, showLaunch, setState, updateStats, updateCycle, updateReloadTimer, updateNextCycleCountdown, triggerHitImpact, triggerGoImpact, resetEliminations, showElimination, showWinner,
    setReady() { byId('play-button').disabled = false; },
    loadMusicFile,
    getBackgroundMusicFile() { return backgroundMusicFile?.blob || null; },
    getSoundEnabled() { return soundEnabled; },
    getSettings() {
      return {
        count: Number(ui.count.value),
        interval: Number(ui.interval.value),
        openingShots: Number(ui.openingShots.value),
        appearanceShots: Number(ui.appearanceShots.value),
        accuracy: Number(ui.accuracy.value) / 100,
        volume: Number(ui.volume.value) / 100,
        shotVolume: Number(ui.shotVolume.value) / 100,
        voiceVolume: Number(ui.voiceVolume.value) / 100,
        backgroundMusic: ui.musicEnabled.checked,
        musicVolume: Number(ui.musicVolume.value) / 100,
        gameSpeed: Number(ui.speed.value),
        quality: ui.quality.value
      };
    },
    toggleSound(enabled) {
      soundEnabled = enabled;
      ui.sound.setAttribute('aria-pressed', String(enabled));
      ui.sound.querySelector('span:last-child').textContent = enabled ? 'SOUND ON' : 'SOUND OFF';
      saveSettings();
    }
  };
}

export function formatTime(seconds) {
  const total = Math.floor(seconds);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
