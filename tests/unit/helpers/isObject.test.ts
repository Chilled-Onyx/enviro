import { isObject } from '../../../src/lib/helpers';

describe('Helpers::isObject', () => {
  it('detects object properly', () => {
    expect(isObject({})).toBe(true);
    expect(isObject(1)).toBe(false);
    expect(isObject('')).toBe(false);
    expect(isObject([])).toBe(false);
    expect(isObject(true)).toBe(false);
  });
});