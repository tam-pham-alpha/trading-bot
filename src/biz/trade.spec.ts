import { checkTolerantLoss } from './trade';

describe('check tolerant', () => {
  it('should return true', () => {
    expect(checkTolerantLoss(0, 0, 14000)).toBe(false);
    expect(checkTolerantLoss(0, 15000, 14000)).toBe(false);
    expect(checkTolerantLoss(0, 15000, 15000)).toBe(false);
    expect(checkTolerantLoss(0, 15000, 16000)).toBe(true);
    expect(checkTolerantLoss(0, 15000, 13500)).toBe(false);
    expect(checkTolerantLoss(10, 15000, 13500)).toBe(false);
    expect(checkTolerantLoss(10, 15000, 13600)).toBe(true);
  });
});
