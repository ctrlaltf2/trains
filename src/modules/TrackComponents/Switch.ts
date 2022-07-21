export class Switch {
  private _position: number;

  constructor(
    public swBlock: number,
    public outBlockLow: number,
    public outBlockHigh: number
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
  }

  setPosition(to_block: number) {
    if (to_block == this.outBlockHigh) {
      this._position = this.outBlockHigh;
    } else if (to_block == this.outBlockLow) {
      this._position = this.outBlockLow;
    }
  }

  get position() {
    return this._position;
  }
}
