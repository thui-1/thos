export class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private playTone(freq1: number, freq2: number | null, duration: number, type: OscillatorType = 'sine', volume = 0.1) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = type;
    
    osc.frequency.setValueAtTime(freq1, this.ctx.currentTime);
    if (freq2 !== null) {
        osc.frequency.exponentialRampToValueAtTime(freq2, this.ctx.currentTime + duration * 0.8);
    }

    gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + duration * 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playOpen() {
    this.playTone(300, 600, 0.15, 'sine', 0.05);
  }

  playClose() {
    this.playTone(500, 250, 0.15, 'sine', 0.05);
  }

  playMinimize() {
    this.playTone(400, 200, 0.15, 'triangle', 0.03);
  }

  playMaximize() {
    this.playTone(300, 700, 0.15, 'triangle', 0.03);
  }
}

export const soundManager = new SoundManager();
