import * as THREE from 'three';

export class Effects {
  constructor(scene, arenaGroup) {
    this.scene = scene;
    this.arenaGroup = arenaGroup;
    this.particles = [];
    this.geometry = new THREE.SphereGeometry(0.045, 6, 5);
    this.materials = [
      new THREE.MeshBasicMaterial({ color: 0x65e8ff }),
      new THREE.MeshBasicMaterial({ color: 0xffa14f }),
      new THREE.MeshBasicMaterial({ color: 0xf4f8ff })
    ];
    this.bulletGeometry = new THREE.SphereGeometry(0.075, 10, 8);
    this.bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffb95e });
    this.bullets = [];
    this.shadows = [];
    this.arenaFlashes = [];
    this.arenaFlashGeometry = new THREE.CircleGeometry(5.92, 96);
    this.arenaFlashMaterial = new THREE.MeshBasicMaterial({
      color: 0xcfd2dc,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false
    });
    this.shadowGeometry = new THREE.CircleGeometry(0.72, 40);
    this.shadowMaterial = new THREE.MeshBasicMaterial({
      color: 0x02060b,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide
    });
  }

  spawnArenaShadow(position) {
    const mesh = new THREE.Mesh(this.shadowGeometry, this.shadowMaterial.clone());
    mesh.rotation.x = -Math.PI / 2;
    const localPosition = position.clone();
    localPosition.y = 0;
    this.arenaGroup.worldToLocal(localPosition);
    mesh.position.set(localPosition.x, -0.008, localPosition.z);
    mesh.scale.setScalar(0.45);
    this.arenaGroup.add(mesh);
    this.shadows.push({ mesh, age: 0, duration: 0.34 });
  }

  spawnArenaFlash() {
    const mesh = new THREE.Mesh(this.arenaFlashGeometry, this.arenaFlashMaterial.clone());
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -0.01;
    mesh.renderOrder = 2;
    this.arenaGroup.add(mesh);
    this.arenaFlashes.push({ mesh, age: 0, duration: 0.42 });
  }

  spawnBullet(start, target, miss, targetName, openingShot = false) {
    const mesh = new THREE.Mesh(this.bulletGeometry, this.bulletMaterial);
    mesh.position.copy(start);
    this.scene.add(mesh);
    const end = target.clone();
    if (miss) {
      end.x += (Math.random() < 0.5 ? -1 : 1) * (0.8 + Math.random() * 1.35);
      end.z += (Math.random() < 0.5 ? -1 : 1) * (0.75 + Math.random() * 1.25);
    }
    const delta = end.clone().sub(start);
    const distance = delta.length();
    const direction = delta.normalize();
    const speed = 17;
    const velocity = direction.multiplyScalar(speed);
    const trail = this.makeTrail();
    trail.position.copy(start);
    this.scene.add(trail);
    const bullet = { mesh, trail, velocity, age: 0, maxAge: Math.min(2.4, distance / speed + 0.3), miss, targetName, openingShot, previous: start.clone() };
    this.bullets.push(bullet);
    return bullet;
  }

  makeTrail() {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([0,0,0,0,0,0], 3));
    const material = new THREE.LineBasicMaterial({ color: 0x89edff, transparent: true, opacity: 0.85 });
    return new THREE.Line(geometry, material);
  }

  updateBullets(delta, balls, onHit, onMiss) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.age += delta;
      bullet.previous.copy(bullet.mesh.position);
      bullet.mesh.position.addScaledVector(bullet.velocity, delta);
      const trailPositions = bullet.trail.geometry.attributes.position;
      trailPositions.setXYZ(0, bullet.previous.x, bullet.previous.y, bullet.previous.z);
      trailPositions.setXYZ(1, bullet.mesh.position.x, bullet.mesh.position.y, bullet.mesh.position.z);
      trailPositions.needsUpdate = true;
      let hit = null;
      if (!bullet.miss) {
        for (const ball of balls) {
          if (!ball.active || ball.eliminating) continue;
          const center = ball.group.position;
          const segment = bullet.mesh.position.clone().sub(bullet.previous);
          const lengthSq = segment.lengthSq();
          const t = lengthSq ? THREE.MathUtils.clamp(center.clone().sub(bullet.previous).dot(segment) / lengthSq, 0, 1) : 0;
          const closest = bullet.previous.clone().addScaledVector(segment, t);
          if (closest.distanceToSquared(center) <= (ball.radius + 0.12) ** 2) { hit = ball; break; }
        }
      }
      if (hit) {
        this.burst(bullet.mesh.position, 16);
        this.spawnArenaShadow(bullet.mesh.position);
        this.spawnArenaFlash();
        this.removeBullet(i);
        onHit(hit, bullet.mesh.position, bullet);
      } else if (bullet.age > bullet.maxAge || bullet.mesh.position.y < -0.15) {
        this.burst(bullet.mesh.position, bullet.miss ? 5 : 3);
        this.spawnArenaShadow(bullet.mesh.position);
        this.spawnArenaFlash();
        this.removeBullet(i);
        onMiss(bullet);
      }
    }
  }

  removeBullet(index) {
    const bullet = this.bullets[index];
    this.scene.remove(bullet.mesh, bullet.trail);
    bullet.trail.geometry.dispose();
    bullet.trail.material.dispose();
    this.bullets.splice(index, 1);
  }

  burst(position, count = 12) {
    const available = Math.max(0, 220 - this.particles.length);
    for (let i = 0; i < Math.min(count, available); i++) {
      const particle = new THREE.Mesh(this.geometry, this.materials[Math.floor(Math.random() * this.materials.length)]);
      particle.position.copy(position);
      particle.scale.setScalar(0.6 + Math.random() * 1.5);
      const velocity = new THREE.Vector3((Math.random() - .5) * 4, Math.random() * 3.2, (Math.random() - .5) * 4);
      this.scene.add(particle);
      this.particles.push({ mesh: particle, velocity, life: 0.38 + Math.random() * 0.48 });
    }
  }

  update(delta) {
    for (let i = this.arenaFlashes.length - 1; i >= 0; i--) {
      const flash = this.arenaFlashes[i];
      flash.age += delta;
      const progress = Math.min(1, flash.age / flash.duration);
      flash.mesh.material.opacity = Math.sin(progress * Math.PI) * 0.34;
      if (progress >= 1) {
        this.arenaGroup.remove(flash.mesh);
        flash.mesh.material.dispose();
        this.arenaFlashes.splice(i, 1);
      }
    }
    for (let i = this.shadows.length - 1; i >= 0; i--) {
      const shadow = this.shadows[i];
      shadow.age += delta;
      const progress = Math.min(1, shadow.age / shadow.duration);
      shadow.mesh.scale.setScalar(0.45 + progress * 0.85);
      shadow.mesh.material.opacity = Math.sin(progress * Math.PI) * 0.42;
      if (progress >= 1) {
        this.arenaGroup.remove(shadow.mesh);
        shadow.mesh.material.dispose();
        this.shadows.splice(i, 1);
      }
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.life -= delta;
      particle.mesh.position.addScaledVector(particle.velocity, delta);
      particle.velocity.y -= delta * 2.3;
      particle.mesh.scale.multiplyScalar(Math.max(0, 1 - delta * 1.4));
      if (particle.life <= 0) {
        this.scene.remove(particle.mesh);
        this.particles.splice(i, 1);
      }
    }
  }

  clear() {
    for (const bullet of [...this.bullets]) {
      const index = this.bullets.indexOf(bullet);
      if (index >= 0) this.removeBullet(index);
    }
    for (const particle of this.particles) this.scene.remove(particle.mesh);
    this.particles.length = 0;
    for (const shadow of this.shadows) {
      this.arenaGroup.remove(shadow.mesh);
      shadow.mesh.material.dispose();
    }
    this.shadows.length = 0;
    for (const flash of this.arenaFlashes) {
      this.arenaGroup.remove(flash.mesh);
      flash.mesh.material.dispose();
    }
    this.arenaFlashes.length = 0;
  }
}
