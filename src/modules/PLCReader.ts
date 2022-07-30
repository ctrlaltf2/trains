export class PLCReader {
  public switchLogic = [];
  public crossingLogic = [];
  public lightLogic = [];
  public authorityLogic = [];

  constructor() {}

  // Parse PLC file into useful logic
  parse(file: JSON) {
    // Set logic to empty
    this.switchLogic = [];
    this.crossingLogic = [];
    this.lightLogic = [];
    this.authorityLogic = [];

    for (const key in file) {
      /*
       *  switch logic
       */
      try {
        if (file[key].command.split(' ')[0] === 'switch') {
          // store arg and logic for switch
          this.switchLogic.push({
            switchNumber: file[key].command.split(' ')[1],
            logicTrue: file[key].True.split(' '),
            logicFalse: file[key].False.split(' '),
          });
        }
      } catch (e) {
        console.log(`error parsing switch logic: ${e}`);
      }

      /*
       *  light logic
       */
      try {
        if (file[key].command.split(' ')[0] === 'light') {
          // store arg and logic for switch
          this.lightLogic.push({
            block: file[key].command.split(' ')[1],
            green: file[key].green.split(' '),
          });
        }
      } catch (e) {
        console.log(`error parsing light logic: ${e}`);
      }

    /*
     *  crossing logic
     */
      try {
        if (file[key].command.split(' ')[0] === 'crossing') {
          // store arg and logic for switch
          this.crossingLogic.push({
            crossNumber: file[key].command.split(' ')[1],
            logicTrue: file[key].True.split(' '),
          });
        }
      } catch (e) {
        console.log(`error parsing crossing logic: ${e}`);
      }
    }


  }
}
