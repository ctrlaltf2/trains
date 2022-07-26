/* eslint-disable import/prefer-default-export */
import { Switch } from './Switch';

export class Block {
  // Failures (default to false)
  public brokenRailFailure: boolean;

  public signalFailure: boolean;

  public engineFailure: boolean;

  // Fields set by setter functions
  public switch?: Switch;

  public occupancy: boolean = false;

  public maintenanceMode: boolean = false;

  public transitLight: string = '';

  public authority: number = 0;

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
    public stationSide: string = '',
    public crossing: boolean = false,
    public previous: number,
    public next: number
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
    this.stationSide = stationSide;
    this.crossing = crossing;
    this.previous = previous;
    this.next = next;

    // Failures
    this.brokenRailFailure = false;
    this.signalFailure = false;
    this.engineFailure = false;
  }

  createSwitch(swBlock: number, outBlockLow: number, outBlockHigh: number) {
    this.switch = new Switch(swBlock, outBlockLow, outBlockHigh);
  }
}
