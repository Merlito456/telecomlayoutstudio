/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class CAD3DAudioSystem {
  private ctx: AudioContext | null = null;
  public soundEnabled = true;

  private getAudioCtx(): AudioContext | null {
    if (!this.soundEnabled) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public playLadderRungSound(isUp: boolean): void {
    const ctx = this.getAudioCtx();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isUp ? 420 : 350, now);
      osc.frequency.exponentialRampToValueAtTime(isUp ? 680 : 260, now + 0.065);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // ignore
    }
  }

  public playFootstepSound(): void {
    const ctx = this.getAudioCtx();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(115, now);
      osc.frequency.exponentialRampToValueAtTime(48, now + 0.055);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.065);
    } catch {
      // ignore
    }
  }

  public playQuestCompleteSound(): void {
    const ctx = this.getAudioCtx();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.1, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.24);
      });
    } catch {
      // ignore
    }
  }

  public playDoorSound(isOpen: boolean): void {
    const ctx = this.getAudioCtx();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      if (isOpen) {
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(1400, now);
        osc1.frequency.exponentialRampToValueAtTime(320, now + 0.05);
        gain1.gain.setValueAtTime(0.12, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.06);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(120, now + 0.03);
        osc2.frequency.linearRampToValueAtTime(85, now + 0.32);
        gain2.gain.setValueAtTime(0.09, now + 0.03);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.03);
        osc2.stop(now + 0.36);
      } else {
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(90, now);
        osc1.frequency.linearRampToValueAtTime(140, now + 0.22);
        gain1.gain.setValueAtTime(0.07, now);
        gain1.gain.linearRampToValueAtTime(0.11, now + 0.22);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.25);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(450, now + 0.22);
        osc2.frequency.exponentialRampToValueAtTime(180, now + 0.29);
        gain2.gain.setValueAtTime(0.15, now + 0.22);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.22);
        osc2.stop(now + 0.31);
      }
    } catch {
      // ignore
    }
  }
}
