export class PLCReader {
  public file: JSON;
  public switchLogic: [];
  public crossingLogic: [];
  public redLogic: [];
  public yellowLogic: [];
  public greenLogic: [];
  public authorityLogic: [];
  public line: string;

  constructor(file: JSON, line: string) {
    this.line = line;
    this.file = file;

    this.parse;
  }

  // Parse PLC file into useful logic
  parse() {
    for (const key in this.file) {
      /*
       *  switch logic
       */
      if (this.file[key].command === 'switch') {
        // store arg and logic for switch
        let i = 1;
        let arg = `arg${String(i)}`;
        let op = `op${String(i)}`;
        while (true) {
          if (this.file[key].hasOwnProperty(arg)) {
            this.switchLogic.push(this.file[key][arg]);
          }
          if (this.file[key].hasOwnProperty(op)) {
            this.switchLogic.push(this.file[key][op]);
          } else {
            break;
          }
          i += 1;
          op = `op${String(i)}`;
          arg = `arg${String(i)}`;
        }

        console.log('logic' + switchLogic);
      }
      /*
       *  crossing logic
       */
      if (this.file[key].command === 'cross') {
        let i = 1;
        let arg = `arg${String(i)}`;
        let op = `op${String(i)}`;
        while (true) {
          if (this.file[key].hasOwnProperty(arg)) {
            this.crossingLogic.push(this.file[key][arg]);
          }
          if (this.file[key].hasOwnProperty(op)) {
            this.crossingLogic.push(this.file[key][op]);
          } else {
            break;
          }
          i += 1;
          op = `op${String(i)}`;
          arg = `arg${String(i)}`;
        }
      }
      /*
       *  red transit light
       */
      if (this.file[key].command === 'red') {
        let i = 1;
        let arg = `arg${String(i)}`;
        let op = `op${String(i)}`;
        while (true) {
          if (this.file[key].hasOwnProperty(arg)) {
            this.redLogic.push(this.file[key][arg]);
          }
          if (this.file[key].hasOwnProperty(op)) {
            this.redLogic.push(this.file[key][op]);
          } else {
            break;
          }
          i += 1;
          op = `op${String(i)}`;
          arg = `arg${String(i)}`;
        }
      }
      /*
       *  yellow transit light
       */
      if (this.file[key].command === 'yellow') {
        let i = 1;
        let arg = `arg${String(i)}`;
        let op = `op${String(i)}`;
        while (true) {
          if (this.file[key].hasOwnProperty(arg)) {
            this.yellowLogic.push(this.file[key][arg]);
          }
          if (this.file[key].hasOwnProperty(op)) {
            this.yellowLogic.push(this.file[key][op]);
          } else {
            break;
          }
          i += 1;
          op = `op${String(i)}`;
          arg = `arg${String(i)}`;
        }
      }
      /*
       *  green transit light
       */
      if (this.file[key].command === 'green') {
        let i = 1;
        let arg = `arg${String(i)}`;
        let op = `op${String(i)}`;
        while (true) {
          if (this.file[key].hasOwnProperty(arg)) {
            this.greenLogic.push(this.file[key][arg]);
          }
          if (this.file[key].hasOwnProperty(op)) {
            this.greenLogic.push(this.file[key][op]);
          } else {
            break;
          }
          i += 1;
          op = `op${String(i)}`;
          arg = `arg${String(i)}`;
        }
      }
    }
  }
}
