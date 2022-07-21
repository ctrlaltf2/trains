import { Switch } from './Switch';

export class Block {
  // Failures (default to false)
  public brokenRailFailure: boolean;
  public signalFailure: boolean;
  public engineFailure: boolean;

  // Fields set by setter functions
  public switch?: Switch;

  public occupancy: boolean= false;
  public maintenanceMode: boolean = false;
  public transitLight: string = '';
  public authority: number = 0;

  /*
   * TODO: other classes? beacon  and station
   * Could be its own class - not sure how it will be implemented
   */
  // beacon: string;
  // station: string;

  constructor(
    public id: number,
    public section: string,
    public line: string,
    public length: number,
    public grade: number,
    public spdLimit: number,
    public elevation: string,
    public cumElevation: number,
    public infrastructure: string = '',
    public direction: boolean = false,
    public underground: boolean = false,
    public crossing: boolean = false
  ) {
    this.id = id;
    this.length = length;
    this.grade = grade;
    this.spdLimit = spdLimit;
    this.section = section;
    this.line = line;
    this.elevation = elevation;
    this.direction = direction;
    this.cumElevation = cumElevation;
    this.underground = underground;
    this.crossing = crossing;

    // Failures
    this.brokenRailFailure = false;
    this.signalFailure = false;
    this.engineFailure = false;
  }

  createSwitch(swBlock: number, outBlockLow: number, outBlockHigh: number) {
    this.switch = new Switch(swBlock, outBlockLow, outBlockHigh);
  }
}
