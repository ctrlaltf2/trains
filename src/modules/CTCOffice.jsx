import React from 'react';
import {
  Button,
  ThemeProvider,
  createTheme,
  Modal,
  TextField,
  Switch,
  FormGroup,
  FormControlLabel,
  Box,
  Typography
} from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import cytoscape from 'cytoscape';

import _ from 'lodash';

import SystemMap from './CTCOffice/SystemMap';
import Train from './CTCOffice/Train';
import TrackSwitch from './CTCOffice/Switch';
import TrackModel from '../../data/TrackModel-route.json';

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
      UIMode: UIState.Main,
      isDispatchModalOpen: true,
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
        'blue': [],
      },
      enteredETA: undefined,
      manualMode: false
    };

    this.nextTrainID = 1;
    this.trains = [];
    this.switches = {
      'blue': [
        new TrackSwitch(undefined, '5', ['6', '11'])
      ]
    };
    this.systemMapRef = React.createRef();

    // Off-screen cytoscape element for routing algos and other shenanigans
    // Indexed by line
    this.cy = {
      'blue': undefined,
      'red': undefined,
      'green': undefined,
    };

    this.initCy();
  }

  componentDidMount() { }

  initCy() {
    for(const line in TrackModel.lines) {
      this.cy[line] = cytoscape({
        elements: TrackModel.lines[line]
      });
    }
  }

  getBlocks(line) {
    if(this.cy[line])
      return new Set(this.cy[line].filter('edge[block_id]').map( (elem) => {
        return elem.data('block_id');
      }));
    else
      return new Set([]);
  }

  updateBlockOccupancy(line, block_id, is_occupied) {
    const occupancy = _.cloneDeep(this.state.occupancy);
    occupancy[line][block_id] = !!is_occupied;

    this.setState({
      occupancy: occupancy,
    });
  }

  /**
   * Return cytoscape query that points to the starting block out of the yard
   */
  getStartingBlockQuery(line) {
    switch(line) {
      case 'blue':
        return `node[id = 'y']`;
      default:
        console.warn(`Unimplemented line '${line}' for starting block query detected`);
        return 'oops';
    }
  }

  buildCyBlockQuery(block_id) { return `edge[block_id = '${block_id}']`; }

  // Major TODO: when a block that's part of another train's route changes occupancy state, recalculate route for that other train and relay that to Track Controller
  dispatchTrain(line, destination_block_id, eta, do_circle_back) {
    // TODO: Use ETA

    console.log(line, destination_block_id, eta, do_circle_back);

    // Build route
    // Run A* over the graph complement to route between edges and not nodes
    const routable_graph = this.cy[line];

    // First, yard -> destination_block
    // Do it for all the possible ways to face in a block, take the shortest route
    const goal_edges = routable_graph.filter(this.buildCyBlockQuery(destination_block_id));

    const routes = goal_edges.map( (edge) => {
      const edge_points_to = edge.targets();

      if(edge_points_to.length > 1) {
        console.warning('Warning: router goal edge has multiple targets, code isn\'t expecting this.');
      } else if (edge_points_to.length === 0) {
        console.error('Error: router goal edge doesn\'t point to anything. Not routing.');
        return undefined;
      }

      const goal_node = edge_points_to[0];
      const goal_node_id = goal_node.data('id');
      const to_dst_route = routable_graph.elements().aStar({
        root: this.getStartingBlockQuery(line),
        goal: `node[id = '${goal_node_id}']`,
        weight: (edge) => {
          return edge.data('length') / edge.data('speed_limit'); // Minimize time in blocks
        },
        directed: true
      });

      return to_dst_route;
    });

    // Find minimum cost route
    let min = Infinity;
    let i_best_route = -1;
    for (const i in routes) {
      if(routes[i].distance < min)
        i_best_route = i
    }

    const best_route = routes[i_best_route].path
      .filter( (elem) => {
        return elem.group() === "edges";
      })
      .map( (elem) => {
        return elem.data('block_id');
      });

    if(do_circle_back) {
      // TODO: just reuse this method lmao, for now it doesn't matter
    }

    // Get speed limit coming out of the yard
    // This is spaghetti and I don't care
    const speed_limit = routable_graph.nodes(`node[id = 'y']`)[0].outgoers().edges()[0].data('speed_limit');

    const pain = new Train( // constant pain from trains
      this.nextTrainID,
      line,
      destination_block_id,
      speed_limit,
      best_route.length, // TODO: Settle on a good authority
      best_route
    );

    this.trains.push(pain);

    const activeTrainIDs = _.cloneDeep(this.state.activeTrainIDs);
    activeTrainIDs[line].push(this.nextTrainID);
    this.setState({
      activeTrainIDs: activeTrainIDs
    });

    this.nextTrainID++;

    window.electronAPI.sendTrackControllerMessage({
      type: 'dispatch train',
      value: pain
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

  handleBlockSelect(self, ev, elem) {
    self.setState({
      testUI: {
        ...this.state.testUI,
        blockSelection: ev.target.value
      }
    });
  }

  renderTest() {
    const { lineSelection, trainSelection, blockSelection, throughputValue } = this.state.testUI;
    const { activeTrainIDs, occupancy } = this.state;

    // Parse occupancy from selected stuff
    let selected_block_occupied = false;
    if(lineSelection && blockSelection) {
      if(occupancy[lineSelection] && occupancy[lineSelection][blockSelection])
        selected_block_occupied = occupancy[lineSelection][blockSelection]
    }

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
              <FormControl className="testUIConfigDropdown">
                <InputLabel id="block-select-label">Block</InputLabel>
                <Select
                  labelId="block-select-label"
                  value={blockSelection}
                  label="Block"
                  onChange={(ev, elem) => { this.handleBlockSelect(this, ev, elem)}}
                >
                  {
                    lineSelection ?
                      Array.from(this.getBlocks(lineSelection)).map((block_id) => {
                        return <MenuItem value={block_id}>{block_id}</MenuItem>;
                      })
                    :
                      []
                  }
                </Select>
              </FormControl>
            </div>
            <div className="horiz-div"/>
            <div className="testUIRow row-title">Line-related</div>
            <div className="testUIRow row-title">
            {
              (lineSelection) ?
                <TextField margin="none" size="small" label="Throughput" variant="standard" onChange={(ev) => {
                  const testUI = _.cloneDeep(this.state.testUI);
                  testUI['throughputValue'] = ev.target.value;

                  this.setState({
                    testUI: testUI
                  });
                }}/>
              :

                <TextField disabled margin="none" size="small" label="Throughput" variant="standard"/>
            }
            {
              (lineSelection && throughputValue) ?
                <Button variant="container" onClick={() => {
                  if(lineSelection && throughputValue) {
                    const throughput = _.cloneDeep(this.state.throughput);
                    throughput[lineSelection] = parseInt(throughputValue, 10);

                    this.setState({
                      throughput: throughput
                    });
                  }
                }}>
                  Commit
                </Button>
              :
                <Button disabled variant="container">
                  Commit
                </Button>
            }
            </div>
            <div className="testUIRow row-title">Train-related</div>
            {
              trainSelection ?
                <Button variant="contained">Brake Failure Event</Button>
              :
                <Button disabled variant="contained">Brake Failure Event</Button>
            }
            {
              trainSelection ?
                <Button variant="contained">Engine Failure Event</Button>
              :
                <Button disabled variant="contained">Engine Failure Event</Button>
            }

            <div className="testUIRow row-title">Block-related</div>
            <FormGroup>
              {
                blockSelection ?
                  <FormControlLabel control={<Switch/>} label="Broken Rail"/>
                :
                  <FormControlLabel disabled control={<Switch/>} label="Broken Rail"/>

              }
            </FormGroup>
            <FormGroup>
              {
                blockSelection ?
                  <FormControlLabel checked={selected_block_occupied} control={<Switch onChange={(ev) => {
                    this.updateBlockOccupancy(lineSelection, blockSelection, ev.target.checked);
                  }}/>} label="Block Occupied"/>
                :
                  <FormControlLabel disabled control={<Switch/>} label="Block Occupied"/>

              }
            </FormGroup>
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
    const { occupancy, throughput, isDispatchModalOpen, enteredETA, manualMode } = this.state;
    const { lineSelection, blockSelection } = this.state.testUI;

    const redLineThroughput = throughput['red'];
    const greenLineThroughput = throughput['green'];
    const blueLineThroughput = throughput['blue'];

    return (
      <ThemeProvider theme={darkTheme}>
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
          <div id="bottomLeftButtonGroup" className="floating">
            <FormGroup id="manualModeGroup">
              <FormControlLabel checked={manualMode} control={<Switch onChange={(ev) => {
                this.setState({
                  manualMode: ev.target.checked
                });
              }}/>} label="Manual Mode"/>
            </FormGroup>
            {
              manualMode ?
                <Button variant="contained" id="dispatchButton" onClick={() => {
                  this.setState({
                    isDispatchModalOpen: !isDispatchModalOpen
                  });
                }}>
                  Manually Dispatch Train
                </Button>
              :
                <Button disabled variant="contained" id="dispatchButton">
                  Manually Dispatch Train
                </Button>
            }
          </div>
          <Button variant="contained" className="floating" id="testUIButton" onClick={() => {
            this.setState({UIMode: UIState.Test});
          }}>
            Switch to test UI
          </Button>
          <div id="bottomRightButtonGroup" className="floating">
            <Button variant="contained" id="systemScheduleButton" onClick={() => {
                this.setState({UIMode: UIState.Scheduling});
            }}>
              Load System Schedule
            </Button>
          </div>
          <div id="systemMap" className="floating">
            <SystemMap
              occupancy={occupancy}
              ref={this.systemMapRef}
            />
          </div>
          <Modal
            className="modal"
            open={isDispatchModalOpen}
            onClose={() => {
              const testUI = _.cloneDeep(this.state.testUI);
              testUI.lineSelection = undefined;
              testUI.blockSelection = undefined;

              this.setState({
                isDispatchModalOpen: false,
                testUI: testUI,
              });
            }}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 600,
                bgcolor: 'var(--background-color)',
                color: 'var(--color)',
                border: '2px solid #000',
                boxShadow: 24,
                p: 4
              }}
            >
              <div className="dispatchModalContainer">
                <Typography variant="h6" component="h2">
                  Dispatch Train
                </Typography>
                <div className="dispatchSelectors">
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
                  {
                    lineSelection ?
                      <FormControl className="testUIConfigDropdown">
                        <InputLabel id="block-select-label">Block</InputLabel>
                        <Select
                          labelId="block-select-label"
                          value={blockSelection}
                          label="Block"
                          onChange={(ev, elem) => { this.handleBlockSelect(this, ev, elem)}}
                        >
                          {
                            lineSelection ?
                              Array.from(this.getBlocks(lineSelection)).map((block_id) => {
                                return <MenuItem value={block_id}>{block_id}</MenuItem>;
                              })
                              :
                              []
                          }
                        </Select>
                      </FormControl>
                    :
                      <FormControl disabled className="testUIConfigDropdown">
                        <InputLabel id="block-select-label">Block</InputLabel>
                        <Select
                          labelId="block-select-label"
                          label="Block"
                          onChange={(ev, elem) => { this.handleBlockSelect(this, ev, elem)}}
                        >
                          {
                            lineSelection ?
                              Array.from(this.getBlocks(lineSelection)).map((block_id) => {
                                return <MenuItem value={block_id}>{block_id}</MenuItem>;
                              })
                              :
                              []
                          }
                        </Select>
                      </FormControl>
                  }
                  {
                    (lineSelection && blockSelection) ?
                      <TextField margin="none" size="small" label="ETA" type="time" variant="standard" onChange={(ev) => {
                        this.setState({
                          enteredETA: ev.target.value
                        });
                      }}/>
                      :
                      <TextField disabled margin="none" size="small" label="ETA" type="time" variant="standard"/>
                  }
                </div>
                {
                  (lineSelection && blockSelection && enteredETA) ?
                    <Button id="dispatchCommitBtn" variant="contained" onClick={() => {
                      this.dispatchTrain(lineSelection, blockSelection, enteredETA, false);
                      this.setState({
                        isDispatchModalOpen: !isDispatchModalOpen
                      });
                    }}>
                      Commit
                    </Button>
                  :
                    <Button id="dispatchCommitBtn" disabled variant="contained">
                      Commit
                    </Button>
                }
              </div>
            </Box>
          </Modal>
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
      default:
        console.warn('Unimplemented UI state: ', UIMode);
        return (
          <p>Unimplemented UI state of {UIMode}</p>
        );
    }
  }
};

export default CTCOffice;
