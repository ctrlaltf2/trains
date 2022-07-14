
import { Track } from './TrackComponents/Track';
import { PLCReader } from './PLCReader';

export class Wayside {
  public track: Track;
  public plc: [];

  constructor(file: JSON) {
    // Load track into controller
    this.track = new Track(file[0].Line);
    this.track.loadTrack(file);
    this.track.setInfrastructure();

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

