import Switch from './Switch';
import Block from './Block';

class Train {
  /** Train identifier */
  readonly id: string;

  /** Line that the train is on */
  readonly line: string;

  /** Destination block (station | graph edge) */
  destination_block: Block;

  /** Speed the train should move forward at. */
  command_speed: number;

  /** Number of blocks that the train can travel */
  authority: number;

  /** List of switch positions */
  route: Switch[];

  constructor(id: string, line: string, destination_block: Block, command_speed: number, authority: number, route: Block[]) {
    this.id = id;
    this.line = line;
    this.destination_block = destination_block;
    this.command_speed = command_speed;
    this.authority = authority;
    this.route = route;
  }
};

export default Train;
