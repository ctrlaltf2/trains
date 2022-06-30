import { Module } from 'module';
import React from 'react';
import {
  Button,
  Container,
  FormControl,
  createTheme,
  Grid,
  InputLabel,
  OutlinedInput,
  TextField,
  Select,
  MenuItem,
  TextareaAutosize,
} from '@mui/material/';
import { blue, grey, red, lightGreen } from '@mui/material/colors';
import { Box, sizing } from '@mui/system';

import './TrackModel.css';
import './TrackBlock.js';
import blueTrackImg from './BlueTrack.jpg';
import blueTrackJson from './blueLineTrackModel.json';

// variables
const switchPos = 0;
function handleChange() {
  return 0;
}

class TrackModel extends React.Component {
  constructor(props, name) {
    super(props);
    this.name = name;

    this.state = {
      //  system variable defaults will go here -- booleans
      testMode: false,
      trackPower: true,
      railStatus: true,
      recievingTrackCircuit: true,
      sendingTrackCircuit: true,

      // beaconStatus: true,
    };

    //  intialize variables for functions
    this.speedLimit = 0; //  units mph
    this.switchPos = false; //  boolean, for blue line, if the switch != 0 then engaged
    // this.blockLength = 0; //  units miles
    // this.directionOfTravel = "forwards";  //  forwards or backwards
    // this.trainOccupancy = 0;  //  units people integer
    // this.enviornmentTemp = 70;  //  units degree F
    // this.personsAtStation = 1;  //  units people
    // this.distanceFromRailwayCrossing = 1; //  units miles
    this.blockIndex = 1; //  default
    this.blockLength = useState(0);
    this.elevation = 0; //  units feet

    //  function prototypes
    this.toggle = this.toggle.bind(this);
    this.failTrackPower = this.failTrackPower.bind(this);
    this.breakRail = this.breakRail.bind(this);
    this.changeSendingTrackCircuit = this.changeSendingTrackCircuit.bind(this);
    this.changeRecievingTrackCircuit =
      this.changeRecievingTrackCircuit.bind(this);
    this.changeElevation = this.changeElevation.bind(this);
    this.changeSwitchPosition = this.changeSwitchPosition.bind(this);
    this.changeBeacon = this.changeBeacon.bind(this);
    this.loadBlockInfo = this.loadBlockInfo.bind(this);

    // this.resetPower = this.resetPower.bind(this);
    // this.resetRail = this.resetRail.bind(this);
    // this.resetSendingTrackCircuit = this.resetSendingTrackCircuit.bind(this);
    // this.resetRecievingTrackCircuit = this.resetRecievingTrackCircuit.bind(this);
    // this.resetElevation = this.resetElevation.bind(this);
    // this.resetSwitchPosition = this.resetSwitchPosition.bind(this);
    // this.resetBeacon = this.resetBeacon.bind(this);

    // this.resetAllSettings = this.resetAllSettings.bind(this);
    // this.loadNewTM = this.loadNewTM.bind(this);
  }

  //  Create function definitions here
  /*
    Fail Track Power
    Break Rail
    Stop Sending Track Circuit
    Stop Recieveing Track Circuit
    Change Elevation
    Change Switch Position
    Stop Beacon

    Reset Power
    Reset Rail
    Reset Sending Track Circuit
    Reset Recieving Track Circuit
    Reset Elevation
    Reset Switch Postion
    Reset Beacon

    Reset all setting to default
    Load new Track Model
    Toggle Function
  */

  //  appears to be working so far
  loadBlockInfo = (event) => {
    let { myValue } = event.currentTarget.dataset;
    console.log(myValue);
    console.log(blueTrackJson[myValue - 1]);
    const tempObj = blueTrackJson[myValue - 1];

    //  Assign values from JSON
    const blockLengthMetric = tempObj['Block Length (m)']; //  convert from meters to miles
    const speedLimitMetric = tempObj['Speed Limit (Km/Hr)']; //   Convert from km/h to mph

    this.state.blockLength = blockLengthMetric * 0.000621371;
    this.speedLimit = speedLimitMetric * 0.621371;
    this.switchPos = tempObj.switch;
    this.blockIndex = tempObj['Block Number'];
    this.elevation = tempObj.Elevation;

    console.log(`block len: ${this.blockLength} miles`);
    console.log(`speed lim: ${this.speedLimit} mph`);
    console.log(`switch pos: ${this.switchPos}`);
    console.log(`block index: ${this.blockIndex}`);
    console.log(`elevation: ${this.elevation} feet`);
  };

  failTrackPower() {
    this.setState((prevState) => ({
      trackPower: !prevState.trackPower,
    }));
  }

  breakRail() {
    this.setState((prevState) => ({
      railStatus: !prevState.railStatus,
    }));
  }

  changeSendingTrackCircuit() {
    this.setState((prevState) => ({
      sendingTrackCircuit: !prevState.sendingTrackCircuit,
    }));
  }

  changeRecievingTrackCircuit() {
    this.setState((prevState) => ({
      recievingTrackCircuit: !prevState.recievingTrackCircuit,
    }));
  }

  changeElevation() {
    this.setState();
  }

  //  should reset elevation to the elevation of the block stat
  resetElevation() {
    this.elevation = 0;
  }

  changeBeacon() {
    this.setState((prevState) => ({
      beaconStatus: !prevState.beaconStatus,
    }));
  }

  //   //  parse the JSON data for the information associated with the block index
  //   //  const Block = JSON.parse(blueTrackJson);
  //   const Block = blueTrackJson;
  //   console.log(Block);
  // }

  // resetAllSettings()
  // {

  //   //  go through each setting and change it back to the original block
  // }

  changeSwitchPosition() {
    //  run some code
  }

  toggle() {
    this.setState((prevState) => ({
      testMode: !prevState.testMode,
    }));
  }

  //  Test UI Function
  testUI() {
    return (
      <Container maxWidth="lg">
        <Grid container spacing={12} direction="row" justifyContent="center">
          <Grid item xs={3} justifySelf="center">
            <div className="HeaderText">Test UI</div>
          </Grid>
        </Grid>
        <Grid container spacing={1} className="topThreeButtons" direction="row">
          <Grid item xs={4}>
            <Button
              variant="contained"
              sx={{ fontSize: 14 }}
              color="grey"
              className="LoadTrack"
            >
              Load new Track Model
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Grid item>
              <Button
                variant="contained"
                sx={{ fontSize: 14 }}
                color="grey"
                onClick={this.toggle}
              >
                {' '}
                Toggle Track Model UI
              </Button>
            </Grid>
          </Grid>
          <Grid item xs={4} spacing={1}>
            <Button
              variant="contained"
              sx={{ fontSize: 14 }}
              color="grey"
              className="RestoreDefaults"
            >
              Reset to Default Settings
            </Button>
          </Grid>
        </Grid>

        {/* Need three columns, and in the far right column a grid with two columns */}
        <Grid container spacing={12} direction="row" justifyContent="center">
          {/* Column 1 */}
          <Grid item xs={4}>
            {/* within grid want two more columns for label and data flowing in */}
            <Grid container column spacing={1}>
              <Grid item xs={6}>
                <div className="label">Rail Status</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 1</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Track Power</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 2</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Track Circuit Recieved</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 3</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Track Circuit Sent</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 4</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Switch Position</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 5</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Speed Limit</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 6</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Block Length</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 7</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Direction of Travel</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 8</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Train Occupancy</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 9</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Block Occupancy</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 10</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Track Heater Status</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 11</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Enviornment Temp</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 12</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Persons at Station</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 13</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Beacon Status</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 14</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Railway Crossing</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 15</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Elevation</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 16</div>
              </Grid>
            </Grid>
          </Grid>

          {/* Column 2 */}
          <Grid item xs={4}>
            <Grid container spacing={12}>
              <></>
            </Grid>
          </Grid>

          {/* Column 3 */}
          <Grid item xs={4}>
            <Grid container spacing={1} direction="row" justifyContent="center">
              <Grid item xs={6}>
                <Button variant="contained" color="error" sx={{ fontSize: 12 }}>
                  Fail Track Power
                </Button>
              </Grid>

              {/* <Grid item xs={6}>
                <Button variant="contained" sx={{ fontSize: 14 }}>
                  Reset Power
                </Button>
              </Grid> */}

              <Grid item xs={6}>
                <Button variant="contained" color="error" sx={{ fontSize: 14 }}>
                  Break Rail
                </Button>
              </Grid>

              {/* <Grid item xs={6}>
                <Button variant="contained" sx={{ fontSize: 14 }}>
                  Reset Rail
                </Button>
              </Grid> */}

              <Grid item xs={6}>
                <Button variant="contained" color="error" sx={{ fontSize: 14 }}>
                  Stop Sending Track Circuit
                </Button>
              </Grid>

              {/* <Grid item xs={6}>
                <Button variant="contained" sx={{ fontSize: 14 }}>
                  Reset Sending Track Circuit
                </Button>
              </Grid> */}

              <Grid item xs={6}>
                <Button variant="contained" color="error" sx={{ fontSize: 14 }}>
                  Stop Recieving Track Circuit
                </Button>
              </Grid>

              {/* <Grid item xs={6}>
                <Button variant="contained" sx={{ fontSize: 14 }}>
                  Reset Recieving Track Cicuit
                </Button>
              </Grid> */}

              <Grid item xs={6} className="dumbButton">
                <TextField
                  id="filled-basic"
                  type="number"
                  multiline
                  fullWidth
                  label="Elevation"
                  variant="filled"
                  size="normal"
                  // defaultValue="Elevation"
                />
              </Grid>

              {/* <Grid item xs={6} >
            <TextField id="outlined-basic" size="small" color="error" label="Change Elevation" type="number" variant="outlined" sx={{ height: '50%', width: '15ch' }} />
          </Grid> */}

              <Grid item xs={6}>
                <Button variant="contained" sx={{ fontSize: 14 }}>
                  Reset Elevation
                </Button>
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth="true" size="small">
                  <InputLabel id="switch-position-select-label">
                    Switch Position
                  </InputLabel>
                  <Select
                    sx={{ fontSize: 8 }}
                    variant="filled"
                    id="switch-position-select-label"
                    value={switchPos}
                    label="Switch Position"
                    onChange={handleChange}
                  >
                    <MenuItem value={1}>One</MenuItem>
                    <MenuItem value={2}>Two</MenuItem>
                    <MenuItem value={3}>Three</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                <Button variant="contained" sx={{ fontSize: 14 }}>
                  Reset Switch
                </Button>
              </Grid>

              <Grid item xs={6}>
                <Button variant="contained" color="error" sx={{ fontSize: 14 }}>
                  Stop Beacon
                </Button>
              </Grid>

              {/* <Grid item xs={6}>
                <Button variant="contained" sx={{ fontSize: 14 }}>
                  Reset Beacon
                </Button>
              </Grid> */}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    );
  }

  // ----- THE ACTUAL TRACK MODEL UI --------- //

  render() {
    // eslint-disable-next-line react/destructuring-assignment
    if (this.state.testMode) return this.testUI();
    return (
      <Container maxWidth="lg">
        <Grid container spacing={12} direction="row" justifyContent="center">
          <Grid item xs={3} justifyContent="center">
            <div className="HeaderText">Track Model</div>
          </Grid>
        </Grid>
        <Grid container spacing={1} className="topThreeButtons" direction="row">
          <Grid item xs={4}>
            <Button
              variant="contained"
              sx={{ fontSize: 14 }}
              color="grey"
              className="LoadTrack"
            >
              Load new Track Model
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Grid item>
              <Button
                variant="contained"
                sx={{ fontSize: 14 }}
                color="grey"
                onClick={this.toggle}
              >
                {' '}
                Toggle Test UI
              </Button>
            </Grid>
          </Grid>
          <Grid item xs={4} spacing={1}>
            <Button
              variant="contained"
              sx={{ fontSize: 14 }}
              color="grey"
              className="RestoreDefaults"
            >
              Reset to Default Settings
            </Button>
          </Grid>
        </Grid>

        {/* Need three columns, and in the far right column a grid with two columns */}
        <Grid container spacing={12} direction="row" justifyContent="center">
          {/* Column 1 */}
          <Grid item xs={4}>
            {/* within grid want two more columns for label and data flowing in */}
            <Grid container column spacing={1}>
              <Grid item xs={6}>
                <div className="label">Rail Status</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> {this.railStatus}</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Track Power</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> {this.trackPower}</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Track Circuit Recieved</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> {this.recievingTrackCircuit}</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Track Circuit Sent</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> {this.sendingTrackCircuit}</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Switch Position</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> {this.switchPos}</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Speed Limit</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> {this.speedLimit}</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Block Length</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> {this.blockLength}</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Direction of Travel</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> {this.directionOfTravel}</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Train Occupancy</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> {this.trainOccupancy}</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Block Occupancy</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> {this.blockOccupancy}</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Track Heater Status</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> {this.trackHeaterStatus}</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Enviornment Temp</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">{this.enviornmentTemp}</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Persons at Station</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">{this.personsAtStation}</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Beacon Status</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">{this.beaconStatus}</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Railway Crossing</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">0 miles</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Elevation</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">{this.elevation}</div>
              </Grid>
            </Grid>
          </Grid>

          {/* Column 2 */}
          <Grid item xs={4}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <img
                  src={blueTrackImg}
                  sx={{ width: 400, height: 400 }}
                  alt="Blue Track"
                />
              </Grid>
              <Grid item xs={12}>
                <formControl
                  fullWidth="true"
                  size="small"
                  padding="none"
                  marginTop="none"
                >
                  <InputLabel sx={{ fontSize: 16 }} id="select-block-label">
                    Select a Block
                  </InputLabel>
                  <Select
                    size="small"
                    sx={{ height: 16 }}
                    id="track-Block-Select-Label"
                    variant="filled"
                    multiline
                    value={this.blockIndex}
                    label="Block Index"
                  >
                    <MenuItem data-my-value={1} onClick={this.loadBlockInfo}>
                      1
                    </MenuItem>
                    <MenuItem data-my-value={2} onClick={this.loadBlockInfo}>
                      2
                    </MenuItem>
                    <MenuItem data-my-value={3} onClick={this.loadBlockInfo}>
                      3
                    </MenuItem>
                    <MenuItem data-my-value={4} onClick={this.loadBlockInfo}>
                      4
                    </MenuItem>
                    <MenuItem data-my-value={5} onClick={this.loadBlockInfo}>
                      5
                    </MenuItem>
                    <MenuItem data-my-value={6} onClick={this.loadBlockInfo}>
                      6
                    </MenuItem>
                    <MenuItem data-my-value={7} onClick={this.loadBlockInfo}>
                      7
                    </MenuItem>
                    <MenuItem data-my-value={8} onClick={this.loadBlockInfo}>
                      8
                    </MenuItem>
                    <MenuItem data-my-value={9} onClick={this.loadBlockInfo}>
                      9
                    </MenuItem>
                    <MenuItem data-my-value={10} onClick={this.loadBlockInfo}>
                      10
                    </MenuItem>
                    <MenuItem data-my-value={11} onClick={this.loadBlockInfo}>
                      11
                    </MenuItem>
                    <MenuItem data-my-value={12} onClick={this.loadBlockInfo}>
                      12
                    </MenuItem>
                    <MenuItem data-my-value={13} onClick={this.loadBlockInfo}>
                      13
                    </MenuItem>
                    <MenuItem data-my-value={14} onClick={this.loadBlockInfo}>
                      14
                    </MenuItem>
                    <MenuItem data-my-value={15} onClick={this.loadBlockInfo}>
                      15
                    </MenuItem>
                  </Select>
                </formControl>
              </Grid>
            </Grid>
          </Grid>

          {/* Column 3 */}
          <Grid item xs={4}>
            <Grid container spacing={1} direction="row" justifyContent="center">
              <Grid item xs={12}>
                <Button variant="contained" color="error" sx={{ fontSize: 16 }}>
                  Fail Track Power
                </Button>
              </Grid>

              {/* <Grid item xs={6}>
                <Button variant="contained" sx={{ fontSize: 14 }}>
                  Reset Power
                </Button>
              </Grid> */}

              <Grid item xs={12}>
                <Button variant="contained" color="error" sx={{ fontSize: 16 }}>
                  Break Rail
                </Button>
              </Grid>
              {/*
              <Grid item xs={6}>
                <Button variant="contained" sx={{ fontSize: 14 }}>
                  Reset Rail
                </Button>
              </Grid> */}

              <Grid item xs={12}>
                <Button variant="contained" color="error" sx={{ fontSize: 16 }}>
                  Stop Sending Track Circuit
                </Button>
              </Grid>

              {/* <Grid item xs={6}>
                <Button variant="contained" sx={{ fontSize: 14 }}>
                  Reset Sending Track Circuit
                </Button>
              </Grid> */}

              <Grid item xs={12}>
                <Button variant="contained" color="error" sx={{ fontSize: 16 }}>
                  Stop Recieving Track Circuit
                </Button>
              </Grid>

              {/* <Grid item xs={6}>
                <Button variant="contained" sx={{ fontSize: 14 }}>
                  Reset Recieving Track Cicuit
                </Button>
              </Grid> */}

              <Grid item xs={6} className="dumbButton">
                <TextField
                  id="filled-basic"
                  type="number"
                  multiline
                  fullWidth
                  label="Elevation"
                  variant="filled"
                  size="normal"
                  // defaultValue="Elevation"
                />
              </Grid>

              {/* <Grid item xs={6} >
                <TextField id="outlined-basic" size="small" color="error" label="Change Elevation" type="number" variant="outlined" sx={{ height: '50%', width: '15ch' }} />
              </Grid> */}

              <Grid item xs={6}>
                <Button variant="contained" sx={{ fontSize: 14 }}>
                  Reset Elevation
                </Button>
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth="true" size="small">
                  <InputLabel id="switch-position-select-label">
                    Switch Position
                  </InputLabel>
                  <Select
                    sx={{ fontSize: 8 }}
                    variant="filled"
                    id="switch-position-select-label"
                    value={switchPos}
                    label="Switch Position"
                    onChange={handleChange}
                  >
                    <MenuItem value={1}>One</MenuItem>
                    <MenuItem value={2}>Two</MenuItem>
                    <MenuItem value={3}>Three</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                <Button variant="contained" sx={{ fontSize: 14 }}>
                  Reset Switch
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Button variant="contained" color="error" sx={{ fontSize: 16 }}>
                  Stop Beacon
                </Button>
              </Grid>

              {/* <Grid item xs={6}>
                <Button variant="contained" sx={{ fontSize: 14 }}>
                  Reset Beacon
                </Button>
              </Grid> */}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    );
  }
}

export default TrackModel;
