
// import { Block } from './TrackComponents/Block';
// import { plc } from './plc';
// @ts-nocheck
import { PLCReader } from './PLCReader';

export class Wayside {
  public plc = new PLCReader();
  public blocks = [];
  public swBlock;
  public id;

// @ts-ignore
  constructor(id, blocks, swBlock, line) {
    // Load track into controller
    this.id = id;
    this.blocks = blocks;
    this.swBlock = swBlock;
    // @ts-ignore
    this.line = line;
  }

  // Parse plc file when changed or uploaded
  setPLC(file: JSON) {
    this.plc.parse(file);
  }

  // Execute plc instructions
  // runPLC() {
    // var status = [];

    // }
  // }

  // reset() {
  //   for (let i = 0; i < this.track.blocks.length; i++) {
  //     this.track.blocks[i].occupancy = false;
  //   }
  // }

  /*
  * Functions for transmitting to other modules
  */

  /*
  * Functions for transmitting to other modules
  */

  // To track model
  // sendTransitLights(block, color: string) {

  // }
  // sendSwitchPosition(block, position: number) {

  // }
  // sendCrossingStatus(block, status: boolean) {

  // }
  // sendMaintenanceMode(block, status: boolean) {

  // }

  // // Verify authority and send to track model
  // sendAuth() {

  // }
  // update(){

  // }
}

