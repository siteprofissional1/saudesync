/**
 * SAÚDE SYNC — Sintetizador de Áudio Hospitalar (Web Audio API)
 * Gera o clássico sinal sonoro (chime) de chamada de senha sem necessidade de arquivos externos.
 */

export function playHospitalChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    const playTone = (freq, start, duration, vol = 0.12) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(vol, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + duration);
    };

    // Duas notas harmônicas tipo chamada hospitalar (G4 -> C5)
    playTone(392.00, now, 0.40, 0.10);          // G4
    playTone(523.25, now + 0.28, 0.75, 0.12);   // C5
  } catch (err) {
    // Silencioso se o navegador bloquear autoplay de áudio
  }
}
