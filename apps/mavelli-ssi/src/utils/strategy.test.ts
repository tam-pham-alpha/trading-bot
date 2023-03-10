import { mergeStrategies } from './strategy';
import { based } from '../strategies';

jest.mock('../strategies', () => ({
  ...jest.requireActual('../strategies'),
  based: {
    symbol: 'SSI',
    interval: 1,

    buyPrice: 1,
    buyQty1: 100,
    buyQty2: 100,

    takeProfit: 2.25,
    allocation: 5,
    active: true,
    tickSize: 2,
  },
}));

describe('mergeStrategies', () => {
  test('it should be accept new strategy', () => {
    const t = mergeStrategies([{ symbol: 'SSI' }], based);

    expect(t).toHaveLength(1);
    expect(t[0].symbol).toBe('SSI');
    expect(t[0].allocation).toBe(5);
  });

  test('symbols should be merged', () => {
    const t = mergeStrategies([{ symbol: 'SSI', allocation: 6 }], based);

    expect(t).toHaveLength(1);
    expect(t[0].symbol).toBe('SSI');
    expect(t[0].allocation).toBe(6);
  });

  test('fallback should not be use', () => {
    const t = mergeStrategies(
      [{ symbol: 'SSI', allocation: 6, buyPrice: 2.45 }],
      {
        ...based,
        buyPrice: 2.55,
      },
    );

    expect(t[0].buyPrice).toBe(2.45);
  });

  test('fallback should not be use', () => {
    const t = mergeStrategies([{ symbol: 'SSI', allocation: 6 }], {
      ...based,
      buyPrice: 2.55,
    });

    expect(t[0].buyPrice).toBe(2.55);
  });

  test('fallback should be use', () => {
    const t = mergeStrategies([{ symbol: 'SSI', allocation: 6 }], {
      ...based,
      buyPrice: 2.55,
    });

    expect(t).toHaveLength(1);
    expect(t[0].symbol).toBe('SSI');
    expect(t[0].allocation).toBe(6);
    expect(t[0].buyPrice).toBe(2.55);
  });
});
