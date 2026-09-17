/**
 * Standards-compliant PCM WAV Encoder for MelodyForgeX
 */

export function sanitizeFilename(name: string, fallback = 'melodyforge_audio'): string {
  if (!name || typeof name !== 'string') return `${fallback}.wav`;
  // Replace illegal filename characters
  const clean = name.replace(/[/\\?%*:|"<>]/g, '_').trim();
  const baseName = clean || fallback;
  return baseName.endsWith('.wav') ? baseName : `${baseName}.wav`;
}

export function encodePcmWav(channels: Float32Array[], sampleRate: number): ArrayBuffer {
  const numChannels = Math.min(2, Math.max(1, channels.length));
  const numSamples = channels[0] ? channels[0].length : 0;
  const bytesPerSample = 2; // 16-bit PCM
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const bufferLength = 44 + dataSize;

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  /* RIFF chunk descriptor */
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true); // ChunkSize
  writeString(8, 'WAVE');

  /* fmt sub-chunk */
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample (16 bits)

  /* data sub-chunk */
  writeString(36, 'data');
  view.setUint32(40, dataSize, true); // Subchunk2Size

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let c = 0; c < numChannels; c++) {
      const sample = Math.max(-1, Math.min(1, channels[c][i]));
      // Scale Float32 (-1.0 .. +1.0) to 16-bit signed Int (-32768 .. +32767)
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return arrayBuffer;
}

export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = Math.min(2, Math.max(1, buffer.numberOfChannels));
  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(buffer.getChannelData(c));
  }
  const arrayBuffer = encodePcmWav(channels, buffer.sampleRate);
  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

export function triggerWavDownload(blob: Blob, filename = 'MelodyForgeX_Render.wav'): void {
  const cleanName = sanitizeFilename(filename);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = cleanName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
