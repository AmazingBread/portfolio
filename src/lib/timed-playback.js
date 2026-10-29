export class TimedPlayback {
  constructor({ duration = 10000, onStop, setTimer = setTimeout, clearTimer = clearTimeout }) {
    this.duration = duration;
    this.onStop = onStop;
    this.setTimer = setTimer;
    this.clearTimer = clearTimer;
    this.timer = null;
  }
  start() {
    this.clear();
    this.timer = this.setTimer(() => {
      this.timer = null;
      this.onStop();
    }, this.duration);
  }
  clear() {
    if (this.timer !== null) this.clearTimer(this.timer);
    this.timer = null;
  }
  destroy() {
    this.clear();
  }
}
