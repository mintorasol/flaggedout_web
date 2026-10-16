import * as THREE from 'three';
import { createFlagTexture } from './flags.js';
import { PORTAL_KEEP_OUT_RADIUS } from './constants.js';

export const BALL_RADIUS = 0.4;
const sphereGeometry = new THREE.SphereGeometry(BALL_RADIUS, 40, 28);

export class CountryBall {
  constructor(scene, physics, country, index, position, velocity) {
    this.name = country.name;
    this.code = country.code;
    this.radius = BALL_RADIUS;
    this.active = true;
    this.eliminating = false;
    this.eliminationTime = 0;
    this.group = new THREE.Group();
    this.group.position.copy(position);
    this.group.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    const flag = createFlagTexture(THREE, country.code, index);
    this.texture = flag.texture;
    this.material = new THREE.MeshPhysicalMaterial({
      map: flag.texture,
      roughness: 0.32,
      metalness: 0.04,
      clearcoat: 0.7,
      clearcoatRoughness: 0.25
    });
    this.mesh = new THREE.Mesh(sphereGeometry, this.material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.group.add(this.mesh);
    this.rimGeometry = new THREE.SphereGeometry(BALL_RADIUS * 1.012, 32, 24);
    this.rimMaterial = new THREE.MeshBasicMaterial({ color: 0xe9faff, side: THREE.BackSide, transparent: true, opacity: 0.14 });
    const rim = new THREE.Mesh(this.rimGeometry, this.rimMaterial);
    this.group.add(rim);
    scene.add(this.group);
    this.physics = physics.addBall(position, velocity, BALL_RADIUS);
    this.phase = Math.random() * Math.PI * 2;
    this.driftTimer = Math.random() * 1.5;
    this.lastPos = new THREE.Vector3(position.x, position.y, position.z);
  }

  sync(position) {
    this.group.position.set(position.x, position.y, position.z);
  }

  nudge(body, elapsed, delta) {
    if (!this.active || this.eliminating) return;
    this.driftTimer -= delta;
    if (this.driftTimer <= 0) {
      this.driftTimer = 1.2 + Math.random() * 2.1;
      const angle = Math.random() * Math.PI * 2;
      body.applyImpulse({ x: Math.cos(angle) * 0.16, y: Math.sin(elapsed * 1.4 + this.phase) * 0.045, z: Math.sin(angle) * 0.16 }, true);
    }
    const v = body.linvel();
    const horizontal = Math.hypot(v.x, v.z);
    if (horizontal > 3.7) body.setLinvel({ x: v.x * 3.7 / horizontal, y: v.y, z: v.z * 3.7 / horizontal }, true);
    else if (horizontal < 0.65) {
      const angle = this.phase + elapsed * 0.4;
      body.applyImpulse({ x: Math.cos(angle) * 0.035, y: 0, z: Math.sin(angle) * 0.035 }, true);
    }
    const displacement = this.group.position.clone().sub(this.lastPos);
    if (displacement.lengthSq() > 0.00001) {
      const axis = new THREE.Vector3(-displacement.z, 0, displacement.x).normalize();
      this.mesh.rotateOnWorldAxis(axis, displacement.length() / this.radius);
    }
    this.lastPos.copy(this.group.position);
  }

  eliminate() {
    this.eliminating = true;
    this.eliminationTime = 0;
    if (this.physics?.body) {
      this.physics.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      this.physics.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
      this.physics.collider.setEnabled(false);
      this.physics.body.setBodyType(1, true);
    }
  }

  updateElimination(delta) {
    if (!this.eliminating) return false;
    this.eliminationTime += delta;
    const t = Math.min(this.eliminationTime / 0.48, 1);
    this.group.scale.setScalar(Math.max(0.001, 1 - t));
    this.material.opacity = 1 - t;
    this.material.transparent = true;
    return t >= 1;
  }

  dispose(scene, physics) {
    this.active = false;
    scene.remove(this.group);
    physics.removeBall(this.physics);
    this.texture.dispose();
    this.material.dispose();
    this.rimGeometry.dispose();
    this.rimMaterial.dispose();
  }
}

export function randomSpawn(index, count) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const innerRadius = PORTAL_KEEP_OUT_RADIUS + BALL_RADIUS + 0.05;
  const spread = Math.sqrt((index + 0.5) / count);
  const radius = innerRadius + (4.65 - innerRadius) * spread * (0.92 + Math.random() * 0.08);
  const angle = index * golden + Math.random() * 0.4;
  const speed = 0.8 + Math.random() * 1.4;
  const direction = Math.random() * Math.PI * 2;
  return {
    position: { x: Math.cos(angle) * radius, y: BALL_RADIUS + 0.015, z: Math.sin(angle) * radius },
    velocity: { x: Math.cos(direction) * speed, y: 0, z: Math.sin(direction) * speed }
  };
}
