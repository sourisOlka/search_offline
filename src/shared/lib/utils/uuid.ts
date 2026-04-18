export function generateId(): string {
  if (typeof self.crypto?.randomUUID === 'function') {
    return self.crypto.randomUUID();
  }

  const bytes = self.crypto.getRandomValues(new Uint8Array(16));

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return [...bytes].reduce((acc, byte, index) => {
    const hex = byte.toString(16).padStart(2, '0');
    if ([4, 6, 8, 10].includes(index)) return acc + '-' + hex;
    return acc + hex;
  }, '');
}
