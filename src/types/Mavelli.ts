export type MavelliConfig = {
  /**
   * if maxOrder = 0
   * - disabled buying
   * - selling won't be impacted
   */
  maxOrder: number;

  /**
   * ignoreIndividualConfig
   */
  ignoreIndividualConfig: boolean;

  /**
   * priorityList
   */
  priorityList: string;
};
