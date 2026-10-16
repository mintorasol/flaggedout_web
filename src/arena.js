import * as THREE from 'three';

const ARENA_RADIUS = 5.95;
const ARENA_ROTATION_SPEED = 0.095;

export function createArena(scene) {
  const rotating = new THREE.Group();
  scene.add(rotating);

  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x16365e,
    metalness: 0.14,
    roughness: 0.58,
    emissive: 0x092653,
    emissiveIntensity: 0.62
  });
  const floor = new THREE.Mesh(
    new THREE.CylinderGeometry(6.22, 6.22, 0.3, 128),
    new THREE.MeshStandardMaterial({ color: 0x101c2d, metalness: 0.72, roughness: 0.38 })
  );
  floor.position.y = -0.2;
  floor.receiveShadow = true;
  rotating.add(floor);

  const playingSurface = new THREE.Mesh(
    new THREE.CylinderGeometry(5.98, 5.98, 0.035, 128),
    floorMaterial
  );
  playingSurface.position.y = -0.035;
  playingSurface.receiveShadow = true;
  rotating.add(playingSurface);

  const floorLines = new THREE.Group();
  const markingMaterial = new THREE.MeshBasicMaterial({
    color: 0x89ceff,
    transparent: true,
    opacity: 0.24
  });
  const outerTrack = new THREE.Mesh(
    new THREE.TorusGeometry(5.48, 0.014, 6, 128),
    markingMaterial
  );
  outerTrack.rotation.x = Math.PI / 2;
  outerTrack.position.y = -0.006;
  floorLines.add(outerTrack);

  const centerRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.35, 0.018, 8, 96),
    new THREE.MeshBasicMaterial({ color: 0x76dfff, transparent: true, opacity: 0.34 })
  );
  centerRing.rotation.x = Math.PI / 2;
  centerRing.position.y = -0.004;
  floorLines.add(centerRing);

  const centerDisc = new THREE.Mesh(
    new THREE.CircleGeometry(1.16, 64),
    new THREE.MeshBasicMaterial({ color: 0x1b4e82, transparent: true, opacity: 0.3 })
  );
  centerDisc.rotation.x = -Math.PI / 2;
  centerDisc.position.y = -0.014;
  floorLines.add(centerDisc);

  const tickGeometry = new THREE.BoxGeometry(0.045, 0.012, 0.28);
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const tick = new THREE.Mesh(tickGeometry, markingMaterial);
    tick.position.set(Math.sin(angle) * 5.18, -0.006, Math.cos(angle) * 5.18);
    tick.rotation.y = angle;
    floorLines.add(tick);
  }
  rotating.add(floorLines);

  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(5.91, 5.91, 1.35, 128, 1, true),
    new THREE.MeshPhysicalMaterial({
      color: 0x8db4d8,
      metalness: 0.18,
      roughness: 0.24,
      transmission: 0.42,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  );
  wall.position.y = 0.64;
  wall.renderOrder = 1;
  rotating.add(wall);

  const railMaterial = new THREE.MeshBasicMaterial({
    color: 0x35dff5,
    toneMapped: false
  });
  const upperRail = new THREE.Mesh(
    new THREE.TorusGeometry(5.96, 0.085, 12, 160),
    railMaterial
  );
  upperRail.rotation.x = Math.PI / 2;
  upperRail.position.y = 1.32;
  upperRail.castShadow = true;
  rotating.add(upperRail);

  const lowerRail = new THREE.Mesh(
    new THREE.TorusGeometry(5.96, 0.068, 10, 160),
    new THREE.MeshStandardMaterial({
      color: 0x43aaff,
      metalness: 0.46,
      roughness: 0.24,
      emissive: 0x1168ff,
      emissiveIntensity: 1.4
    })
  );
  lowerRail.rotation.x = Math.PI / 2;
  lowerRail.position.y = 0.02;
  rotating.add(lowerRail);

  const supports = new THREE.Group();
  const supportMaterial = new THREE.MeshStandardMaterial({
    color: 0x708ba9,
    metalness: 0.72,
    roughness: 0.28,
    emissive: 0x173454,
    emissiveIntensity: 0.35
  });
  const supportGeometry = new THREE.BoxGeometry(0.095, 1.12, 0.095);
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const support = new THREE.Mesh(supportGeometry, supportMaterial);
    support.position.set(Math.sin(angle) * 6.08, 0.65, Math.cos(angle) * 6.08);
    support.castShadow = true;
    supports.add(support);
  }
  rotating.add(supports);

  const outsideRing = new THREE.Mesh(
    new THREE.TorusGeometry(6.42, 0.025, 8, 160),
    new THREE.MeshBasicMaterial({ color: 0x4789ba, transparent: true, opacity: 0.45 })
  );
  outsideRing.rotation.x = Math.PI / 2;
  outsideRing.position.y = -0.32;
  scene.add(outsideRing);

  const blueLight = new THREE.PointLight(0x387dff, 34, 9, 1.8);
  blueLight.position.set(-4.2, 2.3, -3.2);
  scene.add(blueLight);
  const warmLight = new THREE.PointLight(0xff934f, 17, 7, 2);
  warmLight.position.set(4.2, 1.5, 2.4);
  scene.add(warmLight);

  return {
    group: rotating,
    update(delta, paused) {
      if (!paused) rotating.rotation.y += delta * ARENA_ROTATION_SPEED;
      blueLight.intensity = 31 * (0.94 + Math.sin(performance.now() * 0.0016) * 0.06);
    },
    get angularSpeed() { return ARENA_ROTATION_SPEED; },
    get radius() { return ARENA_RADIUS; }
  };
}
