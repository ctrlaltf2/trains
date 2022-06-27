import React, { useState } from 'react';
import ReactDOM from 'react-dom';

/*
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});*/

import './CTCOffice.css';


class CTCOffice extends React.Component {
  constructor(props) {
    window.electronAPI.subscribeCTCMessage( (_event, payload) => {
      console.log('IPC:CTCOffice: ', payload);

      switch(payload.type) {
        case 'setTestMode':
          this.setState({
            testMode: payload.value
          });

          console.log('Set the test mode to', payload.value);
          break;
        case 'callAFunction':
          this.test();
        default:
          console.warn('Unknown payload type received: ', payload.type);
      }
    });

    super(props);
    this.state = {
      testMode: true,
    };
  }

  test() {
    console.log('abcdef');
  }


  testUI() {
    return (
      <div className="testUIContainer">
        <div className="inputContainer">
          <h4 className="containerTitle">From Track Controller (Inputs to module)</h4>
        </div>
        <div className="outputContainer">
          <h4 className="containerTitle">To Track Controller (Outputs from module)</h4>
        </div>
      </div>
    );
  }

  render() {
    if(this.state.testMode)
      return this.testUI();

    return (
      <p>CTC Office UI</p>
    );
  }
};

export default CTCOffice;
