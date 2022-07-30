export class Switch {
  private _position;
  // private _positionBool: boolean;

  constructor(
    public swBlock,
    public outBlockLow,
    public outBlockHigh
  ) {
    this.swBlock = swBlock;
    this.outBlockLow = outBlockLow;
    this.outBlockHigh = outBlockHigh;

    // Default switch position to lower block number
    this._position = outBlockLow;
  }

  // Setter with boolean -- should reverse later
  set position(b) {
    if (b) {
      this._position = this.outBlockHigh;
    } else {
      this._position = this.outBlockLow;
    }
    // this._positionBool = b;
  }

  setPosition(to_block) {
    if (to_block == this.outBlockHigh) {
      this._position = this.outBlockHigh;
    } else if (to_block == this.outBlockLow) {
      this._position = this.outBlockLow;
    }

    return this._position;
  }

  get position() {
    return this._position;
  }

  // get positionBool() {
  //   return this._positionBool;
  // }
}
export default Switch;