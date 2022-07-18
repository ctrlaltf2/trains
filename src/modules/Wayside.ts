
import { Block } from './TrackComponents/Block';
import { plc } from './plc';
import { PLCReader } from './PLCReader';

export class Wayside {
  public plc = new PLCReader();
  public blocks = [];
  public swBlock;
  public id;


  constructor(id, blocks, swBlock) {
    // Load track into controller
    this.id = id;
    this.blocks = blocks;
    this.swBlock = swBlock;
  }

  // Parse plc file when changed or uploaded
  setPLC(file: JSON) {
    this.plc.parse(file);
  }

  // Execute plc instructions
  runPLC() {
    var status = [];

    for (let j = 0; j < this.plc.switchLogic.length; j++) {
      // Run 3x for vitality
      status = [true, true, true]
      for (let vitality = 0; vitality < 3; vitality++) {
        for (
          let k = 0;
          k < this.plc.switchLogic[j].logicTrue.length;
          k++
        ) {
          // AND
          if (this.plc.switchLogic[j].logicTrue[k] === '&&') {
          }
          // NOT
          else if (this.plc.switchLogic[j].logicTrue[k].includes('!')) {
            if (
              this.state.blocks[
                parseInt(
                  this.plc.switchLogic[j].logicTrue[k].substring(1)
                ) - 1
              ].occupancy
            ) {
              status[vitality] = false;
            }
          }
          // Regular
          else {
            if (
              !this.state.blocks[
                parseInt(this.plc.switchLogic[j].logicTrue[k]) - 1
              ].occupancy
            ) {
              status[vitality] = false;
            }
          }
        }
      }
      console.log(status);
      // Vitality check before setting switch position
      if (status.every((val) => val === true)) {
        this.state.blocks[
          parseInt(this.plc.switchLogic[j].switchNumber) - 1
        ].switch.position = true;
        console.log(
          this.state.blocks[
            parseInt(this.plc.switchLogic[j].switchNumber) - 1
          ].switch.position
        );
      } else {
        this.state.blocks[
          parseInt(this.plc.switchLogic[j].switchNumber) - 1
        ].switch.position = false;
        console.log(
          this.state.blocks[
            parseInt(this.plc.switchLogic[j].switchNumber) - 1
          ].switch.position
        );
      }
    }
  }

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

