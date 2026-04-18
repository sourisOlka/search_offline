import { generateId } from '../uuid';

describe('generateId', () => {
  it('должен возвращать строку корректной длины для UUID', () => {
    const id = generateId();
    expect(id).toHaveLength(36);
  });

  it('должен возвращать валидный формат (8-4-4-4-12)', () => {
    const id = generateId();
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(id).toMatch(uuidRegex);
  });

  it('должен генерировать уникальные значения', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('должен содержать корректную версию v4 (символ "4" на 14-й позиции)', () => {
    const id = generateId();
    expect(id.charAt(14)).toBe('4');
  });
});
