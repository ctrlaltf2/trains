import React from 'react';

import { Button, ThemeProvider, createTheme } from '@mui/material';

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
      UIMode: UIState.Main
    };
  }

  renderTest() {
    return (
      <ThemeProvider theme={darkTheme}>
        <div className="testUIContainer">
          <div className="inputContainer">
            <h4 className="containerTitle">From Track Controller (Inputs to module)</h4>
            <div className="testUIRow">Track Controller Selection</div>
            <Button variant="contained">Brake Failure Event</Button>
            <Button variant="contained">Engine Failure Event</Button>
            <Button variant="contained">Broken Rail Event</Button>
          </div>
          <div className="outputContainer">
            <h4 className="containerTitle">To Track Controller (Outputs from module)</h4>
            <div className="grow-divider"></div>
            <Button variant="contained" onClick={() => {
              this.setState({UIMode: UIState.Main});
            }}>
              Return to dashboard
            </Button>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  renderMain() {
    return (
      <ThemeProvider theme={darkTheme}>
        <div className="mainContainer">
          <h1>What would you like to do?</h1>
          <Button variant="contained">Dispatch Train</Button>
          <Button variant="contained">View System Map</Button>
          <Button variant="contained">Load System Schedule</Button>
          <div className="grow-divider"></div>
          <Button variant="contained" onClick={() => {
            this.setState({UIMode: UIState.Test});
          }}>
            Switch to test UI
          </Button>
        </div>
      </ThemeProvider>
    );
  }

  render() {
    const { UIMode } = this.state;

    switch(UIMode) {
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
        console.warn('Unimplemented UI state: ', UIMode);
        return (
          <p>Unimplemented UI state of {UIMode}</p>
        );
    }
  }
};

export default CTCOffice;
