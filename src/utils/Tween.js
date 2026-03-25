export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

export function easeIn(t) {
  return t * t * t;
}

export function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export class Tween {
  constructor(obj, target, duration, easing = easeOut) {
    this.obj = obj;
    this.start = { ...obj };
    this.target = target;
    this.duration = duration;
    this.easing = easing;
    this.elapsed = 0;
    this.done = false;
    this.onComplete = null;
  }

  update(dt) {
    if (this.done) return;
    this.elapsed += dt;
    const t = this.easing(Math.min(this.elapsed / this.duration, 1));
    for (const key of Object.keys(this.target)) {
      this.obj[key] = lerp(this.start[key], this.target[key], t);
    }
    if (this.elapsed >= this.duration) {
      this.done = true;
      if (this.onComplete) this.onComplete();
    }
  }
}
