import React, { useState } from 'react';
import ReactDOM from 'react-dom';

import { ThemeProvider, createTheme } from '@mui/material';

import './CTCOffice.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

// Enum-like structure for all UI states
const UIState = {
  Main:         'Main',
  Dispatching:  'Dispatching',
  Scheduling:   'Scheduling',
  Viewing: {
    Train:      'ViewingTrain',
    BlueLine:   'ViewingBlueLine',
    RedLine:    'ViewingRedLine',
    GreenLine:  'ViewingGreenLine',
    Map:        'Map',
  },
  Test:         'Test',
};

class CTCOffice extends React.Component {
  constructor(props) {
    window.electronAPI.subscribeCTCMessage( (_event, payload) => {
      console.log('IPC:CTCOffice: ', payload);

      switch(payload.type) {
        default:
          console.warn('Unknown payload type received: ', payload.type);
      }
    });

    super(props);

    this.state = {
      testMode: true,
      UIState: UIState.Main
    };
  }

  renderTest() {
    return (
      <ThemeProvider theme={darkTheme}>
        <div className="testUIContainer">
          <div className="inputContainer">
            <h4 className="containerTitle">From Track Controller (Inputs to module)</h4>
          </div>
          <div className="outputContainer">
            <h4 className="containerTitle">To Track Controller (Outputs from module)</h4>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  renderMain() {
    return (
      <ThemeProvider theme={darkTheme}>
        <p>Je voudrais pour abandonner d'universite</p>
      </ThemeProvider>
    );
  }

  render() {
    switch(this.state.UIState) {
      case UIState.Main:
        return this.renderMain();
      case UIState.Test:
        return this.renderTest();
      case UIState.Dispatching:
      case UIState.Scheduling:
      case UIState.Viewing.Train:
      case UIState.Viewing.BlueLine:
      case UIState.Map:
      case UIState.Viewing.RedLine:
      case UIState.Viewing.GreenLine:
      default:
        console.warn('Unimplemented UI state: ', this.state.UIState);
        return (
          <p>Unimplemented UI state of {this.state.UIState}</p>
        );
    }
  }
};

export default CTCOffice;
