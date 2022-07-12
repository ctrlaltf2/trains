export class PLCReader {
  public file: JSON;

  public line: string;

  constructor(file: JSON, line: string) {
    this.line = line;
    this.file = file;

    this.parse;
  }

  // Parse PLC file into useful logic
  parse() {
    for (const key in this.file) {
      if (this.file[key].command === 'switch') {
        console.log('yes');
        // store arg and logic for switch
        let i = 1;
        let arg = `arg${String(i)}`;
        let op = `op${String(i)}`;
        const switchLogic = [];
        while (true) {
          if (this.file[key].hasOwnProperty(arg)) {
            switchLogic.push(this.file[key][arg]);
          } if (this.file[key].hasOwnProperty(op)) {
            switchLogic.push(this.file[key][op]);
          } else {
            break;
          }
          i += 1;
          op = `op${String(i)}`;
          arg = `arg${String(i)}`;
        }

        console.log('logic' + switchLogic);
      }
      // if (file[key].command === 'cross') {
      //   if f
      // }
    }
  }
}
