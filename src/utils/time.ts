export const wait = async (ts: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, ts);
  });
};
