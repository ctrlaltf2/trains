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
          file[key].Infrastructure
        )
      );

      // console.log(this.sections);
      // console.log(this.blocks);
    }
  }

  /*
   * Base function
   * TODO: add crossings, underground, etc
   */
  setInfrastructure() {
    for (let i = 0; i < this.blocks.length; i++) {
      if (this.blocks[i].infrastructure.includes('SWITCH')) {
        if (this.blocks[i].infrastructure.includes('YARD')) {
          this.blocks[i].createSwitch(this.blocks[i].id, 0, 0);
        } else {
          // low and high switch positions
          const low = parseInt(
            this.blocks[i].infrastructure
              .split('(')[1]
              .split(';')[0]
              .split('-')[1]
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
        this.blocks[i].crossing = true;
      }
    }
  }

  getBlocks() {
    return this.blocks;
  }
}
