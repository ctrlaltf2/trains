class Timer {
  /** Callback to call when this timer ticks */
  private onClock_cb: (timestamp: number) => void;

  /** Number of ms since midnight */
  private _timestamp: number = 0;

  /** If timer is in paused state or not */
  private _paused: boolean = true;

  /**
  * Multiplier for emitting clock signals faster
  * 1 is realtime, 2 is 2x realtime
  */
  private _timeScalar: number = 1;

  /** Object returned by setInterval */
  private _clockTimer: any = undefined;

  /** Number of ms that a clock signal represents */
  public readonly timestep: number;

  private computeInterval(): number {
    return this.timestep / this._timeScalar;
  }

  /** Called when timer needs to clock */
  private clock(): void {
    // Increment internal time and call cb
    // 86400000 == # ms in a day
    this._timestamp = (this._timestamp + this.timestep) % 86400000;
    this.onClock_cb(this._timestamp);
  }

  private reinitializeTimer(): void {
    // TODO: Logic for remaining time? node api doesn't have this unfortunately so needs estimated

    // Clear clock timer if one exists
    if(this._clockTimer)
      clearInterval(this._clockTimer);

    if(!this._paused) {
      // Set clock timer back up again with new interval
      this._clockTimer = setInterval(() => {
        this.clock();
      }, this.computeInterval());
    }
  }

  constructor(timestep_ms: number, initial_time?: number) {
    this.timestep = timestep_ms;

    if(initial_time)
      this._timestamp = initial_time;
  }

  public onClock(onClock: (timestamp: number) => void): void {
    this.onClock_cb = onClock;
  }

  public setTimeScalar(scalar: number): void {
    // Nothing needs done if no change
    if(scalar === this._timeScalar)
      return;

    this._timeScalar = scalar;
    this.reinitializeTimer();
  }

  public pause(doPause: bool): void {
    if(this._paused === doPause)
      return;

    this._paused = doPause;
    this.reinitializeTimer();
  }

  public start(): void {
    this.reinitializeTimer();
  }
};

export default Timer;
