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
      UIMode: UIState.Main,
      //trainSelection: undefined,
      //blockSelection: undefined,
      //trackControllerSelection: undefined,
    };
  }

  renderTest() {
    return (
      <ThemeProvider theme={darkTheme}>
        <div className="testUIContainer">
          <div className="inputContainer">
            <h4 className="containerTitle">From Track Controller (Inputs to module)</h4>
            <div className="horiz-div"/>
            <div className="testUIRow row-title">Track Controller Selection</div>
            <div className="testUIRow">Throughput</div>
            <div className="horiz-div"/>
            <div className="testUIRow row-title">Train Selection</div>
            <Button variant="contained">Brake Failure Event</Button>
            <Button variant="contained">Engine Failure Event</Button>
            <Button variant="contained">Broken Rail Event</Button>
            <div className="horiz-div"/>
            <div className="testUIRow row-title">Block Selection</div>
            <div className="horiz-div"/>


          </div>
          <div className="outputContainer">
            <h4 className="containerTitle">To Track Controller (Outputs from module)</h4>
            <div className="grow-divider"/>
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

  // TODO: integrate this into dashboard
  renderDispatch() {
    return (
      <ThemeProvider theme={darkTheme}>
        <Button className="backButton" variant="contained" onClick={() => {
          this.setState({UIMode: UIState.Main});
        }}>
          Return to dashboard
        </Button>
        <div className="dispatchContainer">
          <h1>Manual Dispatch</h1>
        </div>
      </ThemeProvider>
    );
  }

  // TODO: integrate this into dashboard
  renderMap() {
    return (
      <ThemeProvider theme={darkTheme}>
        <Button className="backButton" variant="contained" onClick={() => {
          this.setState({UIMode: UIState.Main});
        }}>
          Return to dashboard
        </Button>
        <div className="mapContainer"/>
      </ThemeProvider>
    );
  }

  // TODO: integrate this into dashboard
  renderScheduler() {
    return (
      <ThemeProvider theme={darkTheme}>
        <Button className="backButton" variant="contained" onClick={() => {
          this.setState({UIMode: UIState.Main});
        }}>
          Return to dashboard
        </Button>
        <div className="schedulerContainer"/>
      </ThemeProvider>
    );
  }

  renderMain() {
    return (
      <ThemeProvider theme={darkTheme}>
        <div className="mainContainer">
          <h1>What would you like to do?</h1>
          <Button variant="contained" onClick={() => {
              this.setState({UIMode: UIState.Dispatching});
          }}>
            Manually Dispatch Train
          </Button>
          <Button variant="contained" onClick={() => {
              this.setState({UIMode: UIState.Map});
          }}>
            View System Map
          </Button>
          <Button variant="contained" onClick={() => {
              this.setState({UIMode: UIState.Scheduling});
          }}>
            Load System Schedule
          </Button>
          <div className="grow-divider"/>
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
        return this.renderDispatch();
      case UIState.Scheduling:
        return this.renderScheduler();
      case UIState.Map:
        return this.renderMap();
      case UIState.Viewing.Train:
      case UIState.Viewing.BlueLine:
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
