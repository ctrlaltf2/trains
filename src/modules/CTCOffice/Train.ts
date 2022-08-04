import Block from './Block';

class Train {
  /** Train identifier */
  readonly id: string;

  /** Line that the train is on */
  readonly line: string;

  /** Speed the train should move forward at. */
  command_speed: number;

  /** Number of blocks that the train can travel */
  authority: number;

  /** List of switch positions */
  route: Block[];

  /** Authority table */
  auth_table: any;

  /** Speed table, map block_str -> speed for that block **/
  speed_table: any;

  constructor(id: string, line: string, command_speed: number, authority: number, route: Block[]) {
    this.id = id;
    this.line = line;
    this.command_speed = command_speed;
    this.authority = authority;
    this.route = route;
  }
};

export default Train;
