import { Block } from './Block';

export class Track {
  public blocks: Block[] = [];

  constructor(public line: string) {
    this.line = line;
  }

  loadTrack(file: JSON) {
    for (const key in file) {
      this.blocks.push(
        new Block(
          file[key]['Block Number'],
          file[key]['Section'],
          file[key]['Line'],
          file[key]['Block Length (m)'],
          file[key]['Block Grade (%)'],
          file[key]['Speed Limit (Km/Hr)'],
          file[key]['ELEVATION (M)'],
          file[key]['CUMALTIVE ELEVATION(M)'],
          file[key]['Infrastructure']
        )
      );
    }
  }

  /*
   * Base function
   * TODO: add crossings, underground, etc
   */
  setInfrastructure() {
    for (let i = 0; i < this.blocks.length; i++) {
      if (this.blocks[i].infrastructure.includes('Switch')) {
        // low and high switch positions
        let low = parseInt(
          this.blocks[i].infrastructure.split('=')[1].split(',')[0]
        );
        let high = parseInt(
          this.blocks[i].infrastructure.split('=')[1].split(',')[1]
        );

        // Set block to switch block
        this.blocks[i].createSwitch(this.blocks[i].id, low, high);
      }
    }
  }

  getBlocks() {
    return this.blocks;
  }
}
