export class PLCReader {
  public switchLogic = [];
  public crossingLogic = [];
  public redLogic = [];
  public yellowLogic = [];
  public greenLogic = [];
  public authorityLogic = [];

  constructor() {
    this.parse;
  }

  // Parse PLC file into useful logic
  parse(file: JSON) {
    // Set logic to empty
    this.switchLogic = [];
    this.crossingLogic = [];
    this.redLogic = [];
    this.yellowLogic = [];
    this.greenLogic = [];
    this.authorityLogic = [];

    for (const key in this.file) {
      /*
       *  switch logic
       */
      if (this.file[key].command.includes('switch')) {
        // store arg and logic for switch
        this.switchLogic.push({
          switchNumber: this.file[key].command.split(' ')[1],
          logicTrue: this.file[key].True.split(' '),
          logicFalse: this.file[key].False.split(' '),
        });
      }
    }
    /*
     *  crossing logic
     */
    // if (this.file[key].command === 'cross') {
    //   let i = 1;
    //   let arg = `arg${String(i)}`;
    //   let op = `op${String(i)}`;
    //   while (true) {
    //     if (this.file[key].hasOwnProperty(arg)) {
    //       this.crossingLogic.push(this.file[key][arg]);
    //     }
    //     if (this.file[key].hasOwnProperty(op)) {
    //       this.crossingLogic.push(this.file[key][op]);
    //     } else {
    //       break;
    //     }
    //     i += 1;
    //     op = `op${String(i)}`;
    //     arg = `arg${String(i)}`;
    //   }
    // }
    // /*
    //  *  red transit light
    //  */
    // if (this.file[key].command === 'red') {
    //   let i = 1;
    //   let arg = `arg${String(i)}`;
    //   let op = `op${String(i)}`;
    //   while (true) {
    //     if (this.file[key].hasOwnProperty(arg)) {
    //       this.redLogic.push(this.file[key][arg]);
    //     }
    //     if (this.file[key].hasOwnProperty(op)) {
    //       this.redLogic.push(this.file[key][op]);
    //     } else {
    //       break;
    //     }
    //     i += 1;
    //     op = `op${String(i)}`;
    //     arg = `arg${String(i)}`;
    //   }
    // }
    // /*
    //  *  yellow transit light
    //  */
    // if (this.file[key].command === 'yellow') {
    //   let i = 1;
    //   let arg = `arg${String(i)}`;
    //   let op = `op${String(i)}`;
    //   while (true) {
    //     if (this.file[key].hasOwnProperty(arg)) {
    //       this.yellowLogic.push(this.file[key][arg]);
    //     }
    //     if (this.file[key].hasOwnProperty(op)) {
    //       this.yellowLogic.push(this.file[key][op]);
    //     } else {
    //       break;
    //     }
    //     i += 1;
    //     op = `op${String(i)}`;
    //     arg = `arg${String(i)}`;
    //   }
    // }
    // /*
    //  *  green transit light
    //  */
    // if (this.file[key].command === 'green') {
    //   let i = 1;
    //   let arg = `arg${String(i)}`;
    //   let op = `op${String(i)}`;
    //   while (true) {
    //     if (this.file[key].hasOwnProperty(arg)) {
    //       this.greenLogic.push(this.file[key][arg]);
    //     }
    //     if (this.file[key].hasOwnProperty(op)) {
    //       this.greenLogic.push(this.file[key][op]);
    //     } else {
    //       break;
    //     }
    //     i += 1;
    //     op = `op${String(i)}`;
    //     arg = `arg${String(i)}`;
    //   }
    // }
  }
}
