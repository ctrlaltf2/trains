/* eslint-disable radix */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable import/prefer-default-export */
import { Block } from './Block';

export class Track {
  public blocks: Block[] = [];

  public sections = [];

  constructor(public line: string, public id: number) {
    this.line = line;
    this.id = id;
  }

  loadTrack(file: JSON) {
    for (const key in file) {
      if (
        this.sections.filter((section) => section === file[key].Section)
          .length === 0
      ) {
        this.sections.push(String(file[key].Section));
      }
      this.blocks.push(
        new Block(
          file[key]['Block Number'],
          file[key].Section,
          file[key].Line,
          file[key]['Block Length (m)'],
          file[key]['Block Grade (%)'],
          file[key]['Speed Limit (Km/Hr)'],
          file[key]['ELEVATION (M)'],
          file[key]['CUMALTIVE ELEVATION(M)'],
          file[key].Infrastructure,
          file[key].Oneway,
          'no underground data',
          file[key]['Station Side'],
          'no crossing data',
          file[key].Prev,
          file[key].Next
        )
      );

      // console.log(this.sections);
    }
    // console.log(this.blocks);
  }

  /*
   * Base function
   * TODO:
   */
  setInfrastructure() {
    for (let i = 0; i < this.blocks.length; i++) {
      //  include underground tag
      if (this.blocks[i].infrastructure.includes('UNDERGROUND')) {
        this.blocks[i].underground = true;
      }

      //  create beacon message
      if (this.blocks[i].infrastructure.includes('STATION')) {
        const beaconMessage = this.blocks[i].infrastructure;

        const firstInd = beaconMessage.indexOf(';');

        const mess = beaconMessage.substring(firstInd + 1);
        this.blocks[i].beacon = mess;
        //  CHECK if the string includes other information and reduce
        if (mess.includes(';')) {
          const mess2 = mess.substring(0, mess.indexOf(';'));
          this.blocks[i].beacon = mess2;
        }

        //  If station is included, tell if left or right of track
        let dir;
        const stationSide = this.blocks[i]['Station Side'];
        switch (stationSide) {
          case 'Left/Right':
            dir = 'b';
            break;
          case 'Left':
            dir = 'l';
            break;
          case 'Right':
            dir = 'r';
            break;
          default:
            break;
        }
        //  append the beacon with the l/r/both indicator
        let beac = this.blocks[i].beacon;
        beac += `-${dir}`;
        this.blocks[i].beacon = beac;
      } else {
        this.blocks[i].beacon = 'No Station';
      }

      if (this.blocks[i].infrastructure.includes('SWITCH')) {
        if (this.blocks[i].infrastructure.includes('YARD')) {
          this.blocks[i].createSwitch(this.blocks[i].id, 0, 0);
        } else {
          // low and high switch positions
          const low = parseInt(
            this.blocks[i].infrastructure
              .split('(')[1]
              .split(';')[0]
              .split('-')[1],
            10
          );
          const high = parseInt(
            this.blocks[i].infrastructure
              .split('(')[1]
              .split(';')[1]
              .split('-')[1]
          );

          // Set block to switch block
          this.blocks[i].createSwitch(this.blocks[i].id, low, high);
        }
      }
      if (this.blocks[i].infrastructure.includes('CROSSING')) {
        this.blocks[i].crossing = false;
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  generateTrackModelEVtemp() {
    const minTemp = 0;
    const maxTemp = 110;
    const temperature =
      Math.floor(Math.random() * (maxTemp - minTemp + 1)) + minTemp;
    return temperature;
  }

  getBlocks() {
    return this.blocks;
  }
}
