import React from 'react';
import { Button, ThemeProvider, createTheme } from '@mui/material';
import _ from 'lodash';

import SystemMap from './CTCOffice/SystemMap';

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
    super(props);

    window.electronAPI.subscribeCTCMessage( (_event, payload) => {
      console.log('IPC:CTCOffice: ', payload);

      switch(payload.type) {
        case 'throughput':
          // TODO: message validation
          switch(payload.line) {
            case 'red':
              this.setState({
                redLineThroughput: payload.value,
              });
              break;
            case 'green':
              this.setState({
                greenLineThroughput: payload.value,
              });
              break;
            case 'blue':
              this.setState({
                blueLineThroughput: payload.value,
              });
              break;
            default:
              console.warn(`Got throughput for an unknown line ${payload.line}`);
          }
          break;
        case 'occupancy':
          // TODO: message validation
          this.updateBlockOccupancy(payload.line, payload.block_id, payload.value);
          break;
        default:
          console.warn('Unknown payload type received: ', payload.type);
      }
    });

    this.state = {
      UIMode: UIState.Main,
      redLineThroughput: 0,
      greenLineThroughput: 1,
      blueLineThroughput: 2,
      // trainSelection: undefined,
      // blockSelection: undefined,
      // trackControllerSelection: undefined,
      occupancy: { // occupancy[line][block_id] = is_occupied: bool
        'red': {},
        'green': {},
        'blue': {},
      },
    };
  }

  updateBlockOccupancy(line, block_id, is_occupied) {
    const occupancy = _.cloneDeep(this.state.occupancy);

    occupancy[line][block_id] = !!is_occupied;

    this.setState({
      occupancy: occupancy,
    });
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
        <div className="dispatchContainer">
          <Button className="backButton" variant="contained" onClick={() => {
            this.setState({UIMode: UIState.Main});
          }}>
            Return to dashboard
          </Button>
          <div className="dispatchContainer">
            <h1>Manual Dispatch</h1>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // TODO: integrate this into dashboard
  renderMap() {
    const { occupancy } = this.state;

    return (
      <div data-theme="dark">
        <ThemeProvider theme={darkTheme}>
          <Button className="backButton" variant="contained" onClick={() => {
            this.setState({UIMode: UIState.Main});
          }}>
            Return to dashboard
          </Button>
        <SystemMap
          occupancy={occupancy}
        />
        </ThemeProvider>
      </div>
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
    const { redLineThroughput, greenLineThroughput, blueLineThroughput } = this.state;

    return (
      <div>
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
            <div className="throughputContainer">
              <h4 className="throughputTitle">Throughput Statistics</h4>
              <div className="throughputGrid">
                <div className="throughputLabel" id="blueLineLabel">Blue Line Throughput</div>
                <div className="throughputValue" id="blueLineValue">{blueLineThroughput} trains/hr</div>
                <div className="throughputLabel" id="redLineLabel">Red Line Throughput</div>
                <div className="throughputValue" id="redLineValue">{redLineThroughput} trains/hr</div>
                <div className="throughputLabel" id="greenLineLabel">Green Line Throughput</div>
                <div className="throughputValue" id="greenLineValue">{greenLineThroughput} trains/hr</div>
              </div>
            </div>
            <div className="grow-divider"/>
            <Button variant="contained" onClick={() => {
              this.setState({UIMode: UIState.Test});
            }}>
              Switch to test UI
            </Button>
          </div>
        </ThemeProvider>
      </div>
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
