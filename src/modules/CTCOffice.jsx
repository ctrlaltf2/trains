import React from 'react';
import {
  Button,
  ThemeProvider,
  createTheme,
  Modal,
  TextField
} from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

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
          const throughput = _.cloneDeep(this.state.throughput);
          throughput[payload.line] = payload.value;

          this.setState({
            throughput: throughput
          });
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
      UIMode: UIState.Test,
      throughput: {
        'red': 0,
        'green': 1,
        'blue': 2,
      },
      testUI: {
        lineSelection: undefined,
        trainSelection: undefined,
        blockSelection: undefined,
        throughputValue: undefined,
      },
      occupancy: { // occupancy[line][block_id] = is_occupied: bool
        'red': {},
        'green': {},
        'blue': {},
      },
      activeTrainIDs: {
        'red': [],
        'green': [],
        'blue': [
          'A',
          'B',
          'C',
        ],
      },
    };

    this.nextTrainID = 1;
    this.trains = [];
    this.switches = {
      'blue': [
        new Switch(undefined, '5', ['6', '11'])
      ]
    };
    this.systemMapRef = React.createRef();
  }

  updateBlockOccupancy(line, block_id, is_occupied) {
    const occupancy = _.cloneDeep(this.state.occupancy);
    occupancy[line][block_id] = !!is_occupied;

    this.setState({
      occupancy: occupancy,
    });
  }

  handleLineSelect(self, ev, elem) {
    self.setState({
      testUI: {
        ...this.state.testUI,
        lineSelection: ev.target.value
      }
    });
  }

  handleTrainSelect(self, ev, elem) {
    self.setState({
      testUI: {
        ...this.state.testUI,
        trainSelection: ev.target.value
      }
    });
  }

  renderTest() {
    const { lineSelection, trainSelection, throughputValue } = this.state.testUI;
    const { activeTrainIDs } = this.state;

    return (
      <ThemeProvider theme={darkTheme}>
        <div className="testUIContainer">
          <div className="inputContainer">
            <h4 className="containerTitle">From Track Controller (Inputs to module)</h4>
            <div className="testUIConfig">
              <FormControl className="testUIConfigDropdown">
                <InputLabel id="line-select-label">Line</InputLabel>
                <Select
                  labelId="line-select-label"
                  value={lineSelection}
                  label="Line"
                  onChange={(ev, elem) => { this.handleLineSelect(this, ev, elem)}}
                >
                  <MenuItem value={'blue'}>Blue</MenuItem>
                  <MenuItem value={'red'}>Red</MenuItem>
                  <MenuItem value={'green'}>Green</MenuItem>
                </Select>
              </FormControl>
              <FormControl className="testUIConfigDropdown">
                <InputLabel id="train-select-label">Train</InputLabel>
                <Select
                  labelId="train-select-label"
                  value={trainSelection}
                  label="Train"
                  onChange={(ev, elem) => { this.handleTrainSelect(this, ev, elem)}}
                >
                  {
                    lineSelection ?
                      activeTrainIDs[lineSelection].map((train_id) => {
                        return <MenuItem value={train_id}>{train_id}</MenuItem>;
                      })
                    :
                      []
                  }
                </Select>
              </FormControl>
            </div>
            <div className="horiz-div"/>
            <div className="testUIRow row-title">
              <TextField margin="none" size="small" label="Throughput" variant="standard" onChange={(ev) => {
                const testUI = _.cloneDeep(this.state.testUI);
                testUI['throughputValue'] = ev.target.value;

                this.setState({
                  testUI: testUI
                });
              }}/>
              <Button variant="container" onClick={() => {
                if(lineSelection && throughputValue) {
                  const throughput = _.cloneDeep(this.state.throughput);
                  throughput[lineSelection] = throughputValue;

                  this.setState({
                    throughput: throughput
                  });
                }
              }}>
                Commit
              </Button>
            </div>
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
    const { occupancy, throughput } = this.state;

    const redLineThroughput = throughput['red'];
    const greenLineThroughput = throughput['green'];
    const blueLineThroughput = throughput['blue'];

    setTimeout(() => console.log(this.systemMapRef.current), 2000);

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
            ref={this.systemMapRef}
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
