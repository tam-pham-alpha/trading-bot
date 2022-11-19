import { roundByTickSize, getNumberByPercentage, roundByDp } from './number';

describe('number', () => {
  it('round 1', () => {
    expect(roundByTickSize(11, 1)).toBe(10);
    expect(roundByTickSize(12, 1)).toBe(10);
    expect(roundByTickSize(16, 1)).toBe(10);
    expect(roundByTickSize(18, 1)).toBe(10);

    expect(roundByTickSize(111, 1)).toBe(110);
    expect(roundByTickSize(112, 1)).toBe(110);
    expect(roundByTickSize(116, 1)).toBe(110);
    expect(roundByTickSize(118, 1)).toBe(110);

    expect(roundByTickSize(1361, 2)).toBe(1300);
    expect(roundByTickSize(1462, 2)).toBe(1400);
    expect(roundByTickSize(1566, 2)).toBe(1500);
    expect(roundByTickSize(1668, 2)).toBe(1600);
  });

  it('getNumberByPercentage', () => {
    expect(getNumberByPercentage(100, -1)).toBe(99);
    expect(getNumberByPercentage(1234, -1.5)).toBe(1215);
    expect(getNumberByPercentage(15000, -2.5)).toBe(14625);

    expect(getNumberByPercentage(100, -1, 1)).toBe(90);
    expect(getNumberByPercentage(1234, -1.5, 1)).toBe(1210);
    expect(getNumberByPercentage(15000, -2.5, 2)).toBe(14600);
  });
});

describe('roundByDp', () => {
  it('true', () => {
    expect(roundByDp(12.345, 2)).toBe(12.34);
    expect(roundByDp(12.35, 2)).toBe(12.35);
    expect(roundByDp(12.5, 2)).toBe(12.5);
  });
});
