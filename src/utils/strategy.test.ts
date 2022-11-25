import { mergeStrategies } from './strategy';
import { based } from '../strategies';

jest.mock('../strategies', () => ({
  ...jest.requireActual('../strategies'),
  based: {
    symbol: 'SSI',
    interval: 1,

    buyLvPrc1: 1,
    buyLvQty1: 100,
    buyLvQty2: 100,

    takeProfit: 2.25,
    allocation: 5,
  },
}));

describe('mergeStrategies', () => {
  test('it should be accept new strategy', () => {
    const t = mergeStrategies([], [{ symbol: 'SSI' }]);

    expect(t).toHaveLength(1);
    expect(t[0].symbol).toBe('SSI');
    expect(t[0].allocation).toBe(5);
  });

  test('symbols should be merged', () => {
    const t = mergeStrategies(
      [{ ...based }],
      [{ symbol: 'SSI', allocation: 6 }],
    );

    expect(t).toHaveLength(1);
    expect(t[0].symbol).toBe('SSI');
    expect(t[0].allocation).toBe(6);
  });

  test('symbols should be merged 02', () => {
    const t = mergeStrategies(
      [{ ...based }],
      [{ symbol: 'VHC', allocation: 6 }],
    );

    expect(t).toHaveLength(2);
    expect(t.map((i) => i.symbol).join(', ')).toBe('SSI, VHC');
  });
});
