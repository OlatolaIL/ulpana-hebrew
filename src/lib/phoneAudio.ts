/**
 * Звуковой синтезатор на Web Audio API для симулятора телефонных звонков.
 * Работает без внешних mp3 файлов, мгновенная загрузка, совместимо с iOS/Android Safari и Chrome.
 */

class PhoneAudioEngine {
  private ctx: AudioContext | null = null;
  private ringingInterval: any = null;
  private hangupInterval: any = null;
  private activeOscillators: OscillatorNode[] = [];

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Воспроизведение телефонных гудков вызова (Ringing tone: 425Hz / 400+450Hz)
   * Цикл: 1 сек гудок, 2.5 сек тишина
   */
  public startRingingTone() {
    this.stopAll();
    const ctx = this.getContext();
    if (!ctx) return;

    const playBeep = () => {
      if (!this.ctx) return;
      try {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(400, this.ctx.currentTime);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(450, this.ctx.currentTime);

        // Плавное нарастание и затухание для мягкого телефонного звука
        gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime + 0.95);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.0);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(this.ctx.currentTime);
        osc2.start(this.ctx.currentTime);
        osc1.stop(this.ctx.currentTime + 1.0);
        osc2.stop(this.ctx.currentTime + 1.0);

        this.activeOscillators.push(osc1, osc2);
      } catch (e) {
        console.warn('AudioContext ringing error:', e);
      }
    };

    // Первый гудок сразу
    playBeep();
    this.ringingInterval = setInterval(playBeep, 3500);
  }

  /**
   * Звук поднятия трубки (мягкий клик / соединение)
   */
  public playPickupSound(): Promise<void> {
    this.stopAll();
    return new Promise((resolve) => {
      const ctx = this.getContext();
      if (!ctx) {
        resolve();
        return;
      }
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);

        setTimeout(() => resolve(), 120);
      } catch (e) {
        resolve();
      }
    });
  }

  /**
   * Короткие гудки отбоя (Busy / Hangup tone: 425Hz, 0.3s on, 0.3s off)
   */
  public playHangupTone(bursts: number = 3): Promise<void> {
    this.stopAll();
    return new Promise((resolve) => {
      const ctx = this.getContext();
      if (!ctx) {
        resolve();
        return;
      }

      let count = 0;
      const playBeep = () => {
        if (!this.ctx || count >= bursts) {
          clearInterval(this.hangupInterval);
          this.hangupInterval = null;
          resolve();
          return;
        }
        count++;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(425, this.ctx.currentTime);

          gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(this.ctx.currentTime);
          osc.stop(this.ctx.currentTime + 0.28);
        } catch (e) {}
      };

      playBeep();
      this.hangupInterval = setInterval(playBeep, 600);
    });
  }

  /**
   * Остановка всех звуков
   */
  public stopAll() {
    if (this.ringingInterval) {
      clearInterval(this.ringingInterval);
      this.ringingInterval = null;
    }
    if (this.hangupInterval) {
      clearInterval(this.hangupInterval);
      this.hangupInterval = null;
    }
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.activeOscillators = [];
  }
}

export const phoneAudio = new PhoneAudioEngine();
