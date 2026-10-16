import * as THREE from 'three';

export function createSoldier(scene) {
  const root = new THREE.Group();
  root.name = 'Arena soldier';
  root.scale.setScalar(1.55);
  root.position.y = -1.2;
  root.visible = false;
  scene.add(root);
  let emergeProgress = 0;
  let portalProgress = 0;
  let movement = 'hidden';
  const portal = new THREE.Group();
  portal.position.y = -0.002;
  portal.visible = false;
  scene.add(portal);

  const portalMaterials = [
    new THREE.MeshBasicMaterial({ color: 0x42eaff, transparent: true, opacity: 0, toneMapped: false }),
    new THREE.MeshBasicMaterial({ color: 0x388eff, transparent: true, opacity: 0, toneMapped: false }),
    new THREE.MeshBasicMaterial({ color: 0x9bf5ff, transparent: true, opacity: 0, toneMapped: false })
  ];
  const outerRing = new THREE.Mesh(new THREE.TorusGeometry(1.12, 0.05, 10, 96), portalMaterials[0]);
  outerRing.rotation.x = Math.PI / 2;
  portal.add(outerRing);
  const innerRing = new THREE.Mesh(new THREE.TorusGeometry(0.67, 0.028, 8, 72), portalMaterials[1]);
  innerRing.rotation.x = Math.PI / 2;
  portal.add(innerRing);
  for (let i = 0; i < 3; i++) {
    const arc = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.024, 8, 56, Math.PI * 0.44), portalMaterials[2]);
    arc.rotation.set(Math.PI / 2, 0, i * Math.PI * 2 / 3);
    portal.add(arc);
  }
  const portalDisk = new THREE.Mesh(
    new THREE.CircleGeometry(0.66, 64),
    new THREE.MeshBasicMaterial({ color: 0x27b9e9, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })
  );
  portalDisk.rotation.x = -Math.PI / 2;
  portalDisk.position.y = 0.006;
  portal.add(portalDisk);
  const portalLight = new THREE.PointLight(0x3bdcf5, 0, 4, 2);
  portalLight.position.set(0, 0.18, 0);
  portal.add(portalLight);

  const materials = {
    uniform: new THREE.MeshStandardMaterial({ color: 0x526b3e, roughness: 0.84 }),
    uniformLight: new THREE.MeshStandardMaterial({ color: 0x718952, roughness: 0.82 }),
    vest: new THREE.MeshStandardMaterial({ color: 0x303b32, roughness: 0.78 }),
    vestEdge: new THREE.MeshStandardMaterial({ color: 0x89956e, roughness: 0.65 }),
    helmet: new THREE.MeshStandardMaterial({ color: 0x455b35, roughness: 0.73 }),
    skin: new THREE.MeshStandardMaterial({ color: 0xc9946e, roughness: 0.8 }),
    mask: new THREE.MeshStandardMaterial({ color: 0x414a3b, roughness: 0.9 }),
    boot: new THREE.MeshStandardMaterial({ color: 0x252c28, roughness: 0.82 }),
    rifle: new THREE.MeshStandardMaterial({ color: 0x202a2d, metalness: 0.42, roughness: 0.52 }),
    metal: new THREE.MeshStandardMaterial({ color: 0x65757b, metalness: 0.72, roughness: 0.31 }),
    eye: new THREE.MeshBasicMaterial({ color: 0x171b18 })
  };

  const flashMaterial = new THREE.MeshBasicMaterial({
    color: 0xffd18a,
    transparent: true,
    opacity: 0,
    toneMapped: false
  });
  const muzzleLight = new THREE.PointLight(0xffa34a, 0, 4, 2);
  const rifle = new THREE.Group();
  rifle.position.set(0, 0.88, -0.58);
  root.add(rifle);

  function addMesh(parent, geometry, material, position, rotation) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position[0], position[1], position[2]);
    if (rotation) mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function box(parent, material, position, size, rotation) {
    return addMesh(parent, new THREE.BoxGeometry(size[0], size[1], size[2]), material, position, rotation);
  }

  function capsule(parent, material, position, radius, length, rotation) {
    return addMesh(parent, new THREE.CapsuleGeometry(radius, length, 4, 8), material, position, rotation);
  }

  const torso = capsule(root, materials.uniform, [0, 0.76, 0], 0.28, 0.43);
  torso.scale.set(1, 1, 0.76);
  addMesh(root, new THREE.CylinderGeometry(0.14, 0.17, 0.16, 12), materials.uniform, [0, 1.13, 0], null);

  const vest = box(root, materials.vest, [0, 0.78, -0.178], [0.48, 0.48, 0.16]);
  vest.rotation.x = -0.04;
  box(root, materials.vestEdge, [0, 0.78, -0.264], [0.32, 0.32, 0.025]);
  box(root, materials.vest, [-0.19, 0.62, -0.276], [0.12, 0.19, 0.08]);
  box(root, materials.vest, [0.19, 0.62, -0.276], [0.12, 0.19, 0.08]);
  box(root, materials.vestEdge, [0, 0.49, -0.02], [0.55, 0.09, 0.34]);
  box(root, materials.vest, [0.24, 0.89, 0.02], [0.12, 0.19, 0.16]);
  box(root, materials.vestEdge, [0.24, 0.92, -0.07], [0.08, 0.035, 0.025]);

  const backpack = box(root, materials.vest, [0, 0.83, 0.23], [0.39, 0.48, 0.22]);
  backpack.rotation.x = -0.08;
  box(root, materials.uniformLight, [0, 0.84, 0.35], [0.22, 0.15, 0.035]);
  box(root, materials.vestEdge, [-0.115, 0.83, 0.36], [0.045, 0.42, 0.025]);
  box(root, materials.vestEdge, [0.115, 0.83, 0.36], [0.045, 0.42, 0.025]);
  box(root, materials.vest, [-0.27, 1.01, 0.15], [0.12, 0.2, 0.13]);
  addMesh(root, new THREE.CylinderGeometry(0.012, 0.012, 0.25, 6), materials.metal, [-0.28, 1.235, 0.17]);

  for (const side of [-1, 1]) {
    const leg = capsule(root, materials.uniform, [side * 0.15, 0.29, 0.015], 0.105, 0.34, [0, 0, side * -0.035]);
    leg.scale.set(1, 1, 0.92);
    box(root, materials.vest, [side * 0.15, 0.3, -0.087], [0.19, 0.13, 0.055]);
    box(root, materials.boot, [side * 0.15, 0.075, -0.075], [0.2, 0.13, 0.34]);
    box(root, materials.vestEdge, [side * 0.15, 0.13, -0.2], [0.2, 0.035, 0.08]);

    const shoulder = addMesh(root, new THREE.SphereGeometry(0.17, 12, 10), materials.uniformLight, [side * 0.34, 0.96, -0.02]);
    shoulder.scale.set(1, 0.84, 0.82);
    capsule(root, materials.uniform, [side * 0.34, 0.76, -0.16], 0.095, 0.27, [-0.62, 0, side * -0.2]);
    addMesh(root, new THREE.SphereGeometry(0.095, 10, 8), materials.uniformLight, [side * 0.27, 0.61, -0.35]);
  }

  const head = addMesh(root, new THREE.SphereGeometry(0.205, 18, 14), materials.skin, [0, 1.28, 0]);
  head.scale.set(0.94, 1, 0.88);
  addMesh(root, new THREE.SphereGeometry(0.222, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), materials.helmet, [0, 1.37, 0.005]);
  addMesh(root, new THREE.SphereGeometry(0.22, 16, 8, 0, Math.PI), materials.helmet, [0, 1.385, -0.015]);
  box(root, materials.helmet, [0, 1.345, -0.194], [0.39, 0.045, 0.16]);

  for (const side of [-1, 1]) {
    addMesh(root, new THREE.SphereGeometry(0.058, 10, 8), materials.vestEdge, [side * 0.2, 1.31, 0.005]);
    addMesh(root, new THREE.SphereGeometry(0.024, 8, 6), materials.vest, [side * 0.2, 1.31, -0.045]);
    addMesh(root, new THREE.SphereGeometry(0.028, 8, 6), materials.eye, [side * 0.068, 1.302, -0.177]);
  }
  box(root, materials.mask, [0, 1.205, -0.175], [0.25, 0.12, 0.055]);
  box(root, materials.vestEdge, [0, 1.405, -0.224], [0.18, 0.035, 0.025]);

  box(rifle, materials.rifle, [0, 0, 0], [0.12, 0.15, 0.57]);
  box(rifle, materials.rifle, [0, 0.015, -0.38], [0.075, 0.09, 0.47]);
  box(rifle, materials.rifle, [0, -0.035, 0.32], [0.09, 0.12, 0.36], [0.25, 0, 0]);
  box(rifle, materials.rifle, [0, -0.11, 0.01], [0.075, 0.17, 0.1], [-0.22, 0, 0]);
  box(rifle, materials.metal, [0, 0.105, -0.12], [0.12, 0.035, 0.18]);
  box(rifle, materials.metal, [0, 0.155, -0.39], [0.035, 0.08, 0.08]);
  const muzzle = addMesh(rifle, new THREE.CylinderGeometry(0.046, 0.036, 0.16, 10), materials.metal, [0, 0.015, -0.66], [Math.PI / 2, 0, 0]);
  muzzle.add(addMesh(muzzle, new THREE.SphereGeometry(0.08, 10, 8), flashMaterial, [0, 0.08, 0]));
  muzzleLight.position.set(0, 0.04, -0.72);
  rifle.add(muzzleLight);

  return {
    root,
    rifle,
    flashMaterial,
    muzzleLight,
    emerge() {
      if (movement !== 'hidden') return;
      emergeProgress = 0;
      portalProgress = 0;
      movement = 'opening';
      root.visible = false;
      root.position.y = -1.2;
      portal.visible = true;
    },
    beginHide() {
      if (movement === 'hidden' || movement === 'sinking') return;
      movement = 'sinking';
    },
    hide() {
      movement = 'hidden';
      root.visible = false;
      root.position.y = -1.2;
      emergeProgress = 0;
      portal.visible = false;
      portalLight.intensity = 0;
      portal.scale.setScalar(0.45);
      portalProgress = 0;
      portalMaterials.forEach((material) => { material.opacity = 0; });
      portalDisk.material.opacity = 0;
    },
    aimAt(target) {
      const dx = target.x - root.position.x;
      const dz = target.z - root.position.z;
      root.userData.targetYaw = Math.atan2(-dx, -dz);
    },
    fire() {
      flashMaterial.opacity = 1;
      muzzleLight.intensity = 4.4;
      rifle.position.z = -0.48;
    },
    getMuzzleWorld() {
      const point = new THREE.Vector3(0, 0.04, -0.79);
      rifle.localToWorld(point);
      return point;
    },
    update(delta, time, active) {
      const targetYaw = root.userData.targetYaw ?? 0;
      const difference = Math.atan2(Math.sin(targetYaw - root.rotation.y), Math.cos(targetYaw - root.rotation.y));
      root.rotation.y += difference * Math.min(1, delta * 8);
      if (movement === 'opening') {
        portalProgress = Math.min(1, portalProgress + delta * 3.5);
        if (portalProgress === 1) {
          movement = 'rising';
          root.visible = true;
        }
      } else if (movement === 'rising') {
        emergeProgress = Math.min(1, emergeProgress + delta * 1.5);
        if (emergeProgress === 1) movement = 'standing';
      } else if (movement === 'sinking') {
        emergeProgress = Math.max(0, emergeProgress - delta * 1.5);
        portalProgress = THREE.MathUtils.smoothstep(emergeProgress, 0, 1);
        if (emergeProgress === 0) {
          movement = 'hidden';
          root.visible = false;
          portal.visible = false;
          portalProgress = 0;
        }
      }
      if (root.visible) {
        const rise = THREE.MathUtils.smoothstep(emergeProgress, 0, 1);
        const bob = emergeProgress >= 1 ? Math.sin(time * (active ? 4.5 : 1.8)) * (active ? 0.018 : 0.008) : 0;
        root.position.y = -1.2 * (1 - rise) + bob;
      }
      if (portal.visible) {
        const progress = portalProgress;
        portal.scale.setScalar(0.45 + progress * 0.55);
        portal.rotation.y += delta * (movement === 'sinking' ? -2.8 : 2.8);
        portalMaterials[0].opacity = progress * 0.92;
        portalMaterials[1].opacity = progress * 0.7;
        portalMaterials[2].opacity = progress * 0.88;
        portalDisk.material.opacity = progress * 0.17;
        portalLight.intensity = progress * (8 + Math.sin(time * 8) * 1.5);
      }
      flashMaterial.opacity = Math.max(0, flashMaterial.opacity - delta * 8);
      muzzleLight.intensity = Math.max(0, muzzleLight.intensity - delta * 24);
      rifle.position.z = THREE.MathUtils.lerp(rifle.position.z, -0.58, Math.min(1, delta * 18));
    }
  };
}
