import RAPIER from '@dimforge/rapier3d-compat';
import { PORTAL_KEEP_OUT_RADIUS } from './constants.js';

const FIXED_STEP = 1 / 60;
const ARENA_RADIUS = 5.95;

export async function createPhysics() {
  await RAPIER.init();
  const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
  world.timestep = FIXED_STEP;
  const floorBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0, -0.18, 0));
  world.createCollider(RAPIER.ColliderDesc.cuboid(ARENA_RADIUS, 0.18, ARENA_RADIUS).setFriction(0.85).setRestitution(0.22), floorBody);
  let accumulator = 0;

  function addBall(position, velocity, radius) {
    const desc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(position.x, position.y, position.z)
      .setLinearDamping(0.24)
      .setAngularDamping(0.18)
      .setCcdEnabled(true);
    const body = world.createRigidBody(desc);
    const collider = world.createCollider(
      RAPIER.ColliderDesc.ball(radius).setDensity(0.7).setFriction(0.68).setRestitution(0.75),
      body
    );
    body.setLinvel(velocity, true);
    return { body, collider, radius, previous: { ...position } };
  }

  function removeBall(ball) {
    if (ball?.body) world.removeRigidBody(ball.body);
  }

  function keepOutsidePortal(ball, body, position) {
    const distance = Math.hypot(position.x, position.z);
    if (distance >= PORTAL_KEEP_OUT_RADIUS) return;

    const angle = distance > 0.001 ? Math.atan2(position.z, position.x) : (ball.phase || 0);
    const nx = Math.cos(angle);
    const nz = Math.sin(angle);
    const x = nx * PORTAL_KEEP_OUT_RADIUS;
    const z = nz * PORTAL_KEEP_OUT_RADIUS;
    body.setTranslation({ x, y: position.y, z }, true);
    ball.physics.previous.x = x;
    ball.physics.previous.z = z;

    const velocity = body.linvel();
    const inwardSpeed = velocity.x * nx + velocity.z * nz;
    if (inwardSpeed < 0) {
      body.setLinvel({
        x: velocity.x - 1.8 * inwardSpeed * nx,
        y: velocity.y,
        z: velocity.z - 1.8 * inwardSpeed * nz
      }, true);
    }
  }

  function step(delta, balls) {
    accumulator = Math.min(accumulator + Math.min(delta, 0.06), FIXED_STEP * 4);
    while (accumulator >= FIXED_STEP) {
      for (const ball of balls) {
        if (!ball.active || !ball.physics?.body) continue;
        const { body } = ball.physics;
        const p = body.translation();
        ball.physics.previous.x = p.x;
        ball.physics.previous.y = p.y;
        ball.physics.previous.z = p.z;
        keepOutsidePortal(ball, body, p);
        const position = body.translation();
        const velocity = body.linvel();
        const distance = Math.hypot(position.x, position.z);
        const nx = distance > 0.001 ? position.x / distance : 1;
        const nz = distance > 0.001 ? position.z / distance : 0;
        if (distance > ARENA_RADIUS - ball.radius) {
          const corrected = ARENA_RADIUS - ball.radius;
          body.setTranslation({ x: nx * corrected, y: position.y, z: nz * corrected }, true);
          const normalSpeed = velocity.x * nx + velocity.z * nz;
          if (normalSpeed > 0) {
            const inwardSpeed = Math.max(normalSpeed * 0.65, 2);
            body.setLinvel({
              x: velocity.x - (normalSpeed + inwardSpeed) * nx,
              y: velocity.y,
              z: velocity.z - (normalSpeed + inwardSpeed) * nz
            }, true);
          }
        }
      }
      world.step();
      for (const ball of balls) {
        if (!ball.active || !ball.physics?.body) continue;
        const physicsBall = ball.physics;
        keepOutsidePortal(ball, physicsBall.body, physicsBall.body.translation());
      }
      accumulator -= FIXED_STEP;
    }

    const alpha = accumulator / FIXED_STEP;
    for (const ball of balls) {
      if (!ball.active || !ball.physics?.body) continue;
      const p = ball.physics.body.translation();
      ball.sync({
        x: ball.physics.previous.x + (p.x - ball.physics.previous.x) * alpha,
        y: ball.physics.previous.y + (p.y - ball.physics.previous.y) * alpha,
        z: ball.physics.previous.z + (p.z - ball.physics.previous.z) * alpha
      });
    }
  }

  return { world, addBall, removeBall, step, fixedStep: FIXED_STEP };
}
