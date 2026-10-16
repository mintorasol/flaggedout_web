import * as THREE from 'three';
import './style.css';
import { createPhysics } from './physics.js';
import { createArena } from './arena.js';
import { CountryBall, randomSpawn } from './countryBall.js';
import { createSoldier } from './soldier.js';
import { Effects } from './effects.js';
import { createUI } from './ui.js';
import { getCountries } from './flags.js';

const canvas = document.getElementById('game-canvas');
const ui = createUI(handleAction);
let soundEnabled = ui.getSoundEnabled();
ui.toggleSound(soundEnabled);
const scene = new THREE.Scene();
scene.background = null;
scene.fog = new THREE.FogExp2(0x080d16, 0.025);

const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
const victoryLookAt = new THREE.Vector3(0, 0.85, 0);
const victoryCameraPosition = new THREE.Vector3(0, 8.2, 13.5);
camera.position.set(0, 11.2, 18.4);
camera.lookAt(0, 0.35, 0);

let renderer;
let physics;
let arena;
let soldier;
let effects;
let balls = [];
let state = 'MENU';
let configuredCountryCount = null;
let elapsed = 0;
let shots = 0;
let hits = 0;
let eliminated = 0;
let completedCycles = 0;
let openingShotsRemaining = 0;
let openingShotsFired = 0;
let shotTimer = 4;
let lastCountdownSecond = null;
let soldierHideTimer = 0;
let aimTarget = null;
let aimTimer = 0;
let quality = 'medium';
let audioContext = null;
const gunshotAudio = new Audio('/audio/shot-sound.mp3');
let uploadedMusicBlob = null;
let uploadedMusicUrl = null;
let uploadedMusicAudio = null;
let uploadedMusicPlaybackWarningShown = false;
let lastFrame = performance.now();
let cameraTarget = new THREE.Vector3(0, 0.35, 0);
let shake = 0;
let arenaImpact = 0;
let victoryStarted = false;
let champion = null;
let victoryTime = 0;
let nextCycleTimer = 0;
let lastNextCycleSecond = 0;
const NEXT_CYCLE_DELAY = 5;
const OPENING_SHOT_AIM_DURATION = 0.32;
const OPENING_SHOT_INTERVAL = 0.18;
function placeSoldierAtArenaCenter() {
  soldier.root.position.set(0, -1.2, 0);
  soldier.root.rotation.set(0, 0, 0);
  soldier.hide();
  soldier.aimAt({ x: 0, z: 0 });
}

const ambient = new THREE.HemisphereLight(0xb8dcff, 0x29384b, 2.15);
scene.add(ambient);
const keyLight = new THREE.DirectionalLight(0xe2f4ff, 4.1);
keyLight.position.set(-5, 12, 7);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
keyLight.shadow.camera.left = -12; keyLight.shadow.camera.right = 12;
keyLight.shadow.camera.top = 12; keyLight.shadow.camera.bottom = -12;
keyLight.shadow.bias = -0.0004;
scene.add(keyLight);
const rimLight = new THREE.PointLight(0x2d9eff, 28, 18, 2);
rimLight.position.set(-7, 5, -5);
scene.add(rimLight);

function createBackdrop() {
  const positions = [];
  for (let i = 0; i < 280; i++) {
    positions.push((Math.random() - 0.5) * 45, Math.random() * 18 - 2, (Math.random() - 0.5) * 42 - 9);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0x8ab5d1, size: 0.025, transparent: true, opacity: 0.6 });
  scene.add(new THREE.Points(geometry, material));
}
createBackdrop();

function createRenderer() {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.32;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  setQuality(ui.getSettings().quality);
  resize();
}

function setQuality(next) {
  quality = next;
  if (!renderer) return;
  const pixelCap = quality === 'high' ? 1.75 : quality === 'low' ? 1 : 1.35;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelCap));
  renderer.shadowMap.enabled = quality !== 'low';
}

function resize() {
  if (!renderer) return;
  const width = canvas.clientWidth, height = canvas.clientHeight;
  if (!width || !height) return;
  const portrait = width / height <= 0.8;
  camera.aspect = width / height;
  camera.fov = portrait ? 54 : 38;
  if (state !== 'VICTORY') applyDefaultFraming(width, height);
  victoryCameraPosition.set(0, portrait ? 12 : 8.2, portrait ? 11 : 13.5);
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

function applyDefaultFraming(width = canvas.clientWidth, height = canvas.clientHeight) {
  const aspect = width / height;
  const portrait = aspect <= 0.8;
  if (portrait) {
    const arenaDiameter = Math.min(width * 0.9, height * 0.85);
    const frameWidth = 14 * (width * 0.9 / arenaDiameter);
    const distance = frameWidth / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * aspect);
    cameraTarget.set(0, -2.15, 0);
    camera.position.set(0, cameraTarget.y + distance * 0.956, cameraTarget.z + distance * 0.293);
    return;
  }
  const verticalFov = THREE.MathUtils.degToRad(camera.fov);
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect);
  const horizontalDistance = 14 / (2 * Math.tan(horizontalFov / 2) * 1);
  const compactLandscape = height <= 560;
  const verticalDistance = 7.2 / (2 * Math.tan(verticalFov / 2) * (compactLandscape ? 0.5 : 0.94));
  const distance = Math.max(horizontalDistance, verticalDistance);
  cameraTarget.set(0, compactLandscape ? 3.75 : 0.55, 0);
  camera.position.set(0, cameraTarget.y + distance * 0.52, cameraTarget.z + distance * 0.855);
}

function restoreCamera() {
  applyDefaultFraming();
  camera.lookAt(cameraTarget);
}

function playTone(frequency, duration, type = 'sine', volume = 0.06) {
  const level = volume * 2 * ui.getSettings().volume;
  if (!soundEnabled || level <= 0) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') audioContext.resume();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gain.gain.setValueAtTime(level, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    console.warn('Procedural audio is unavailable.', error);
  }
}

function playCountdownTick(second) {
  const pitch = second === 1 ? 1040 : 780;
  playTone(pitch, 0.055, 'square', 0.055);
}

function playGoJingle() {
  [392, 587.33, 880].forEach((frequency, index) => {
    setTimeout(() => playTone(frequency, index === 2 ? 0.24 : 0.13, 'triangle', 0.04), index * 85);
  });
}

function stopBackgroundMusic() {
  if (uploadedMusicAudio && !uploadedMusicAudio.paused) uploadedMusicAudio.pause();
}

function updateBackgroundMusic() {
  const settings = ui.getSettings();
  const musicFile = ui.getBackgroundMusicFile();
  if (musicFile !== uploadedMusicBlob) {
    stopBackgroundMusic();
    if (uploadedMusicAudio) uploadedMusicAudio.pause();
    if (uploadedMusicUrl) URL.revokeObjectURL(uploadedMusicUrl);
    uploadedMusicBlob = musicFile;
    uploadedMusicUrl = musicFile ? URL.createObjectURL(musicFile) : null;
    uploadedMusicAudio = uploadedMusicUrl ? new Audio(uploadedMusicUrl) : null;
    if (uploadedMusicAudio) {
      uploadedMusicAudio.loop = true;
      uploadedMusicAudio.preload = 'auto';
      uploadedMusicAudio.addEventListener('error', () => {
        if (uploadedMusicPlaybackWarningShown) return;
        uploadedMusicPlaybackWarningShown = true;
        console.warn('The uploaded background music could not be decoded or played.');
        ui.showToast('This audio file could not be played. Choose another audio file.');
      });
    }
  }
  if (state !== 'PLAYING' || !soundEnabled || !settings.backgroundMusic || settings.musicVolume <= 0) {
    stopBackgroundMusic();
    return;
  }
  if (!uploadedMusicAudio) return;

  uploadedMusicAudio.volume = Math.min(1, settings.musicVolume * 1.5);
  if (uploadedMusicAudio.paused) {
    uploadedMusicAudio.play().then(() => {
      uploadedMusicPlaybackWarningShown = false;
    }).catch((error) => {
      if (!uploadedMusicPlaybackWarningShown) {
        uploadedMusicPlaybackWarningShown = true;
        console.warn('Uploaded background music could not start.', error);
        ui.showToast('Background music could not start. Check the audio format and try again.');
      }
    });
  }
}

function playWinnerJingle() {
  [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
    setTimeout(() => playTone(frequency, 0.28, 'sine', 0.045), index * 135);
  });
  setTimeout(() => playTone(783.99, 0.46, 'triangle', 0.035), 560);
}

function playGunshot() {
  const volume = ui.getSettings().shotVolume;
  if (!soundEnabled || volume <= 0) return;

  const shot = gunshotAudio.cloneNode();
  shot.volume = volume;
  shot.play().catch((error) => {
    console.warn('Gunshot audio could not be played.', error);
  });
}

function startBattle() {
  state = 'STARTING';
  nextCycleTimer = 0;
  ui.showLaunch(false);
  ui.setState(state);
  resetBattle();
  const settings = ui.getSettings();
  if (settings.quality !== quality) setQuality(settings.quality);
  openingShotsRemaining = settings.openingShots;
  openingShotsFired = 0;
  const countries = getCountries();
  configuredCountryCount = settings.count;
  for (let i = 0; i < settings.count; i++) {
    const spawn = randomSpawn(i, settings.count);
    const country = countries[i % countries.length];
    const ball = new CountryBall(scene, physics, country, i, spawn.position, spawn.velocity);
    balls.push(ball);
  }
  elapsed = 0; shots = 0; hits = 0; eliminated = 0;
  ui.updateCycle(completedCycles + 1);
  shotTimer = ui.getSettings().interval; soldierHideTimer = 0;
  lastCountdownSecond = Math.ceil(shotTimer);
  aimTarget = null; aimTimer = 0; victoryStarted = false;
  ui.updateReloadTimer(shotTimer, ui.getSettings().interval);
  ui.feed.textContent = 'Soldier is tracking targets';
  ui.resetEliminations(settings.count);
  ui.updateStats({ remaining: balls.length, eliminated, elapsed, shots, hits, total: settings.count });
  state = 'PLAYING';
  ui.setState(state);
  updateBackgroundMusic();
  playTone(440, 0.12);
  playCountdownTick(lastCountdownSecond);
}

function syncCountryCount(count) {
  const survivors = balls.filter((ball) => ball.active && !ball.eliminating);
  const targetSurvivors = Math.max(1, count - eliminated);
  if (targetSurvivors < survivors.length) {
    let removeCount = survivors.length - targetSurvivors;
    const removable = survivors.filter((ball) => ball !== aimTarget).sort(() => Math.random() - 0.5);
    for (const ball of removable) {
      if (!removeCount) break;
      ball.dispose(scene, physics);
      balls.splice(balls.indexOf(ball), 1);
      removeCount--;
    }
  } else if (targetSurvivors > survivors.length) {
    const countries = getCountries();
    let index = 0;
    while (balls.filter((ball) => ball.active && !ball.eliminating).length < targetSurvivors) {
      const spawn = randomSpawn(balls.length + index, count);
      const country = countries[(balls.length + index) % countries.length];
      balls.push(new CountryBall(scene, physics, country, balls.length + index, spawn.position, spawn.velocity));
      index++;
    }
  }
  configuredCountryCount = count;
  ui.feed.textContent = `Roster updated · ${eliminated + balls.filter((ball) => ball.active && !ball.eliminating).length} countries`;
}

function resetBattle() {
  for (const ball of balls) ball.dispose(scene, physics);
  balls = [];
  effects.clear();
  placeSoldierAtArenaCenter();
  soldier.flashMaterial.opacity = 0;
  soldier.muzzleLight.intensity = 0;
  soldier.rifle.position.z = -0.58;
  soldierHideTimer = 0;
  ui.updateReloadTimer(0, 4, 'hidden');
  champion = null;
  victoryTime = 0;
  restoreCamera();
}

function handleAction(action) {
  if (action === 'start') {
    startBattle();
  } else if (action === 'sound') {
    soundEnabled = !soundEnabled;
    ui.toggleSound(soundEnabled);
    updateBackgroundMusic();
    if (soundEnabled) playTone(660, 0.09);
  } else if (action === 'settings-change') {
    const settings = ui.getSettings();
    const requestedQuality = settings.quality;
    if (requestedQuality !== quality) setQuality(requestedQuality);
    if (state === 'PLAYING' && settings.count !== configuredCountryCount) syncCountryCount(settings.count);
    updateBackgroundMusic();
  }
}

function selectTarget() {
  const survivors = balls.filter((ball) => ball.active && !ball.eliminating);
  if (survivors.length <= 1) { triggerVictory(survivors[0]); return; }
  const target = survivors[Math.floor(Math.random() * survivors.length)];
  aimTarget = target;
  aimTimer = openingShotsRemaining > 0 && openingShotsFired > 0 ? OPENING_SHOT_AIM_DURATION : 1.2;
  soldier.emerge();
  soldier.aimAt(target.group.position);
  ui.feed.textContent = `Tracking ${target.name}`;
  ui.updateReloadTimer(0, ui.getSettings().interval, 'deploying');
  shake = 0.1;
  triggerArenaImpact();
  ui.triggerGoImpact();
  playGoJingle();
}

function fireAtTarget() {
  if (!aimTarget?.active || aimTarget.eliminating || balls.filter((ball) => ball.active && !ball.eliminating).length <= 1) {
    aimTarget = null;
    soldier.hide();
    shotTimer = ui.getSettings().interval;
    lastCountdownSecond = Math.ceil(shotTimer);
    return;
  }
  soldier.aimAt(aimTarget.group.position);
  soldier.fire();
  const start = soldier.getMuzzleWorld();
  const target = aimTarget.group.position.clone();
  target.y += 0.02;
  const miss = Math.random() > ui.getSettings().accuracy;
  effects.spawnBullet(start, target, miss, aimTarget.name);
  shots++;
  const isOpeningShot = openingShotsRemaining > 0;
  if (isOpeningShot) {
    openingShotsRemaining--;
    openingShotsFired++;
  }
  ui.feed.textContent = `Firing on ${aimTarget.name}`;
  playGunshot();
  shotTimer = isOpeningShot && openingShotsRemaining > 0 ? OPENING_SHOT_INTERVAL : ui.getSettings().interval;
  lastCountdownSecond = Math.ceil(shotTimer);
  soldierHideTimer = isOpeningShot && openingShotsRemaining > 0 ? 0 : 0.48;
  ui.updateReloadTimer(shotTimer, ui.getSettings().interval);
  aimTarget = null;
}

function triggerArenaImpact() {
  arenaImpact = 0.34;
}

function eliminateBall(ball, point) {
  if (!ball?.active || ball.eliminating || balls.filter((item) => item.active && !item.eliminating).length <= 1) return;
  ball.eliminate();
  hits++;
  eliminated++;
  shake = 0.12;
  triggerArenaImpact();
  ui.triggerHitImpact();
  effects.burst(point, 22);
  ui.showElimination(ball);
  ui.feed.textContent = `${ball.name} eliminated`;
  playTone(220, 0.22, 'sawtooth', 0.06);
  setTimeout(() => playTone(110, 0.22, 'triangle', 0.04), 55);
}

function triggerVictory(winner) {
  if (!winner || victoryStarted) return;
  victoryStarted = true;
  champion = winner;
  victoryTime = 0;
  aimTarget = null;
  soldier.hide();
  ui.updateReloadTimer(0, ui.getSettings().interval, 'hidden');
  effects.clear();
  for (const ball of balls) if (ball !== winner) ball.dispose(scene, physics);
  balls = [winner];
  state = 'VICTORY';
  updateBackgroundMusic();
  ui.setState(state);
  completedCycles++;
  ui.updateCycle(completedCycles, 'COMPLETE');
  ui.showWinner(winner, { eliminated, elapsed, cycle: completedCycles });
  nextCycleTimer = NEXT_CYCLE_DELAY;
  lastNextCycleSecond = NEXT_CYCLE_DELAY;
  ui.updateNextCycleCountdown(NEXT_CYCLE_DELAY);
  winner.group.scale.setScalar(1);
  winner.group.position.set(0, 1.15, 0);
  winner.mesh.material.emissive = new THREE.Color(0x152d3a);
  winner.mesh.material.emissiveIntensity = 0.5;
  cameraTarget.set(0, 0.9, 0);
  playWinnerJingle();
  for (let i = 0; i < 55; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 4;
    effects.burst(new THREE.Vector3(Math.cos(angle) * radius, 1.5 + Math.random() * 2, Math.sin(angle) * radius), 2);
  }
}

function removeEliminated() {
  for (let i = balls.length - 1; i >= 0; i--) {
    const ball = balls[i];
    if (ball.eliminating && ball.updateElimination(simulationDelta)) {
      ball.dispose(scene, physics);
      balls.splice(i, 1);
    }
  }
}

let deltaTime = 0;
let simulationDelta = 0;
function animate(now) {
  requestAnimationFrame(animate);
  deltaTime = Math.min((now - lastFrame) / 1000, 0.06);
  lastFrame = now;
  const active = state === 'PLAYING';
  const gameSpeed = ui.getSettings().gameSpeed;
  simulationDelta = active ? deltaTime * gameSpeed : deltaTime;
  if (active) {
    elapsed += simulationDelta;
    shotTimer -= simulationDelta;
    if (!aimTarget) {
      ui.updateReloadTimer(shotTimer, ui.getSettings().interval);
      const countdownSecond = Math.ceil(Math.max(0, shotTimer));
      if (countdownSecond < lastCountdownSecond && countdownSecond > 0) {
        lastCountdownSecond = countdownSecond;
        playCountdownTick(countdownSecond);
      }
    }
    if (aimTarget) {
      aimTimer -= simulationDelta;
      soldier.aimAt(aimTarget.group.position);
      if (aimTimer <= 0) fireAtTarget();
    } else if (shotTimer <= 0) selectTarget();
    if (soldierHideTimer > 0) {
      soldierHideTimer -= simulationDelta;
      if (soldierHideTimer <= 0) soldier.beginHide();
    }

    for (const ball of balls) if (ball.active && !ball.eliminating) ball.nudge(ball.physics.body, elapsed, simulationDelta);
    physics.step(simulationDelta, balls);
    effects.updateBullets(simulationDelta, balls, eliminateBall, (bullet) => {
      triggerArenaImpact();
      ui.feed.textContent = bullet.miss ? `${bullet.targetName} evaded the shot` : 'Shot missed';
      playTone(180, 0.12, 'triangle', 0.02);
    });
    removeEliminated();
    const survivors = balls.filter((ball) => ball.active && !ball.eliminating);
    ui.updateStats({ remaining: survivors.length, eliminated, elapsed, shots, hits, total: eliminated + survivors.length });
    if (survivors.length === 1 && !aimTarget && effects.bullets.length === 0) triggerVictory(survivors[0]);
  }

  const animationDelta = active ? simulationDelta : deltaTime;
  arena.update(animationDelta, state !== 'PLAYING' && state !== 'VICTORY');
  if (arenaImpact > 0) {
    arenaImpact = Math.max(0, arenaImpact - deltaTime);
    const strength = (arenaImpact / 0.34) * 0.14;
    const impulse = Math.sin((0.34 - arenaImpact) * 92) * strength;
    arena.wallGroup.position.set(impulse, 0, -impulse * 0.72);
  } else {
    arena.wallGroup.position.set(0, 0, 0);
  }
  soldier.update(animationDelta, elapsed, active);
  effects.update(animationDelta);
  if (state === 'VICTORY') {
    nextCycleTimer = Math.max(0, nextCycleTimer - deltaTime);
    const countdownSecond = Math.ceil(nextCycleTimer);
    if (countdownSecond !== lastNextCycleSecond) {
      lastNextCycleSecond = countdownSecond;
      ui.updateNextCycleCountdown(countdownSecond);
      if (countdownSecond > 0) playCountdownTick(countdownSecond);
    }
    if (nextCycleTimer <= 0) {
      playTone(880, 0.14, 'sine', 0.045);
      startBattle();
    } else {
      victoryTime += deltaTime;
      champion?.group.scale.setScalar(THREE.MathUtils.lerp(1, 2.5, Math.min(1, victoryTime / 0.8)));
      cameraTarget.lerp(victoryLookAt, Math.min(1, deltaTime * 1.8));
      camera.position.lerp(victoryCameraPosition, Math.min(1, deltaTime * 1.1));
    }
  }
  camera.lookAt(cameraTarget);
  if (shake > 0) {
    camera.position.x += (Math.random() - 0.5) * shake;
    camera.position.y += (Math.random() - 0.5) * shake;
    shake = Math.max(0, shake - deltaTime);
  }
  renderer.render(scene, camera);
}

async function init() {
  try {
    try {
      await ui.loadMusicFile();
    } catch (error) {
      console.error('Could not restore the saved background music.', error);
      ui.showToast('Saved background music could not be restored. Choose an audio file in settings.');
    }
    createRenderer();
    physics = await createPhysics();
    arena = createArena(scene);
    soldier = createSoldier(scene);
    placeSoldierAtArenaCenter();
    effects = new Effects(scene, arena.floorGroup);
    ui.setReady();
    ui.showLaunch(true);
    ui.setState('MENU');
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && state === 'PLAYING') {
        state = 'PAUSED';
        ui.setState(state);
        updateBackgroundMusic();
      } else if (!document.hidden && state === 'PAUSED') {
        state = 'PLAYING';
        ui.setState(state);
        lastFrame = performance.now();
        updateBackgroundMusic();
      }
    });
    requestAnimationFrame((time) => { lastFrame = time; animate(time); });
  } catch (error) {
    console.error('Game initialization failed.', error);
    ui.showToast(`Unable to start the game: ${error.message || 'WebGL or physics initialization failed.'}`);
    ui.status.textContent = 'INITIALIZATION ERROR';
  }
}

init();
