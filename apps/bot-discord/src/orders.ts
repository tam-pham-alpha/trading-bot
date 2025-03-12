type Order = {
  ticker: string;
  qty: number; // usd_qty
  ls: number;
  tp: number;
};

export const placeOrder = async (order: Order): Promise<boolean> => {
  return true;
};
