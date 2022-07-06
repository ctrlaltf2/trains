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

  set position(sw: number) {
    this._position = sw;
  }

  get position() {
    return this._position;
  }
}
