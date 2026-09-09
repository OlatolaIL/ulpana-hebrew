import fs from 'fs';

// Генерация мягкого фонового Lo-Fi / Ambient трека (WAV 44100Hz, 16-bit, стерео)
export function generateBackgroundMusic(durationSeconds, outputPath) {
  const sampleRate = 44100;
  const numChannels = 2;
  const totalSamples = Math.floor(sampleRate * durationSeconds);
  const dataSize = totalSamples * numChannels * 2; // 16-bit = 2 bytes per sample

  const buffer = Buffer.alloc(44 + dataSize);

  // WAV Header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * 2, 28); // ByteRate
  buffer.writeUInt16LE(numChannels * 2, 32); // BlockAlign
  buffer.writeUInt16LE(16, 34); // BitsPerSample
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Аккордовая прогрессия: Cmaj7 - Am7 - Fmaj7 - G7 (мягкое звучание)
  const chords = [
    [261.63, 329.63, 392.00, 493.88], // Cmaj7 (C4, E4, G4, B4)
    [220.00, 261.63, 329.63, 392.00], // Am7   (A3, C4, E4, G4)
    [174.61, 220.00, 261.63, 329.63], // Fmaj7 (F3, A3, C4, E4)
    [196.00, 246.94, 293.66, 349.23], // G7    (G3, B3, D4, F4)
  ];

  const chordDuration = 4.0; // 4 секунды на аккорд
  let offset = 44;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const chordIndex = Math.floor((t / chordDuration) % chords.length);
    const chord = chords[chordIndex];
    const chordTime = (t % chordDuration) / chordDuration;

    // Мягкая огибающая (fade-in, sustain, gentle fade)
    const envelope = Math.sin(Math.PI * Math.pow(chordTime, 0.7)) * 0.18;

    let sampleL = 0;
    let sampleR = 0;

    // Синтез мягких тонов пианино/пада с легкими обертонами
    for (let f = 0; f < chord.length; f++) {
      const freq = chord[f];
      // Основной тон + мягкий 2-й обертон
      const s = Math.sin(2 * Math.PI * freq * t) * 0.7 + Math.sin(4 * Math.PI * freq * t) * 0.2;
      const pan = (f / (chord.length - 1)) * 0.4 - 0.2; // легкое стерео-расширение
      sampleL += s * (0.5 - pan);
      sampleR += s * (0.5 + pan);
    }

    // Легкий согревающий LFO эффект (тремоло)
    const lfo = 1.0 + 0.15 * Math.sin(2 * Math.PI * 1.5 * t);
    sampleL = sampleL * envelope * lfo * 0.25;
    sampleR = sampleR * envelope * lfo * 0.25;

    // Fade in на старте (1 сек) и fade out в конце (2 сек)
    if (t < 1.0) {
      const fadeIn = t / 1.0;
      sampleL *= fadeIn;
      sampleR *= fadeIn;
    } else if (t > durationSeconds - 2.0) {
      const fadeOut = (durationSeconds - t) / 2.0;
      sampleL *= Math.max(0, fadeOut);
      sampleR *= Math.max(0, fadeOut);
    }

    // Ограничение и запись 16-bit
    const valL = Math.max(-32767, Math.min(32767, Math.floor(sampleL * 32767)));
    const valR = Math.max(-32767, Math.min(32767, Math.floor(sampleR * 32767)));

    buffer.writeInt16LE(valL, offset);
    buffer.writeInt16LE(valR, offset + 2);
    offset += 4;
  }

  fs.writeFileSync(outputPath, buffer);
  console.log(`🎵 Фоновая музыка создана: ${outputPath} (${(buffer.length / 1024 / 1024).toFixed(2)} MB, ${durationSeconds}s)`);
}
