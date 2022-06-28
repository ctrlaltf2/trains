import React from 'react';
import { Button, ThemeProvider, createTheme, Modal } from '@mui/material';
import _ from 'lodash';

import SystemMap from './CTCOffice/SystemMap';
import Train from './CTCOffice/Train';
import Switch from './CTCOffice/Switch';

import './CTCOffice.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

// Enum-like structure for all UI states
const UIState = {
  Main:         'Main',
  Viewing: {
    Train:      'ViewingTrain',
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
      activeTrainIDs: {
        'red': [],
        'green': [],
        'blue': [],
      },
    };

    this.nextTrainID = 1;
    this.trains = [];
    this.switches = {
      'blue': [
        new Switch(undefined, '5', ['6', '11'])
      ]
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
    const { trainSelection, blockSelection, trackControllerSelection } = this.state;

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

  renderMain() {
    const { occupancy, redLineThroughput, greenLineThroughput, blueLineThroughput } = this.state;

    return (
      <div id="appContainer">
        <div className="throughputContainer floating">
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
        <Button variant="contained" className="floating" id="testUIButton" onClick={() => {
          this.setState({UIMode: UIState.Test});
        }}>
          Switch to test UI
        </Button>
        <div id="bottomRightButtonGroup" className="floating">
          <Button variant="contained" id="dispatchButton" onClick={() => {
              this.setState({UIMode: UIState.Dispatching});
          }}>
            Manually Dispatch Train
          </Button>
          <Button variant="contained" id="systemScheduleButton" onClick={() => {
              this.setState({UIMode: UIState.Scheduling});
          }}>
            Load System Schedule
          </Button>
        </div>
        <div id="systemMap">
          <SystemMap
            occupancy={occupancy}
          />
        </div>
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
      default:
        console.warn('Unimplemented UI state: ', UIMode);
        return (
          <p>Unimplemented UI state of {UIMode}</p>
        );
    }
  }
};

export default CTCOffice;
