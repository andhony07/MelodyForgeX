export function formatVolumeDb(db: number): string {
  if (db === -Infinity || db <= -60) return '-Inf dB';
  return `${db >= 0 ? '+' : ''}${db.toFixed(1)} dB`;
}

export function formatPan(pan: number): string {
  if (pan === 0) return 'C';
  return pan < 0 ? `L${Math.abs(pan)}` : `R${pan}`;
}
