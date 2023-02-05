export type MavelliConfig = {
  /**
   * if maxOrder = 0
   * - disabled buying
   * - selling won't be impacted
   */
  maxOrder: number;

  /**
   * priorityList
   */
  priorityList: string;
};
