import Block from './Block';

class Switch {
  /** Where the switch currently points */
  _going_to: Block;

  /** Where the switch points from. NOTE: for bidirectional tracks this is */
  readonly coming_from: Block;

  /** Where the switch could point, if it felt like it */
  readonly going_to_options: Block[];

  constructor(going_to: Block, coming_from: Block, going_to_options: Block[]) {
    this._going_to = going_to;
    this.coming_from = coming_from;
    this.going_to_options = going_to_options;
  }

  public set point_to(where: Block) {
    if(this.going_to_options.indexOf(where) === -1)
      throw `Tried to point switch to block it's not connected to.`;

    this._going_to = where;
  }

  public get pointing_to(): Block {
    return this._going_to;
  }
};

export default Switch;
