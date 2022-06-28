import Block from './Block';

class Switch {
  /** Where the switch currently points */
  going_to: Block;

  /** Where the switch points from. NOTE: for bidirectional tracks this is */
  readonly coming_from: Block;

  /** Where the switch could point, if it felt like it */
  readonly going_to_options: Block[];

  constructor(going_to?: Block, coming_from: Block, going_to_options: Block[]) {
    if(going_to)
      this.going_to = going_to;
    else
      this.going_to = undefined;

    this.coming_from = coming_from;
    this.going_to_options = going_to_options;
  }
};

export default Switch;
