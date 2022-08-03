// @ts-nocheck
export class Switch {
  public _position: number;
  public _positionBool: boolean;
  public override: boolean = false;

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
    this._positionBool = b;
  }

  setPosition(to_block: number) {
    if (to_block == this.outBlockHigh) {
      this._position = this.outBlockHigh;
    } else if (to_block == this.outBlockLow) {
      this._position = this.outBlockLow;
    }
  }

  getPosition(){
    return this._position;
  }

  get position() {
    return this._position;
  }

  get positionBool() {
    return this._positionBool;
  }
}

export default Switch;
