import { Module } from 'module';
import React from 'react';
import {
  Button,
  Container,
  FormControl,
  createTheme,
  ThemeProvider,
  Grid,
  InputLabel,
  Input,
  OutlinedInput,
  TextField,
  Select,
  SelectChangeEvent,
  MenuItem,
  TextareaAutosize,
  AddIcon,
  Fab,
} from '@mui/material/';

import { blue, grey, red, lightGreen } from '@mui/material/colors';
import { Box, sizing } from '@mui/system';
import './TrackModel.css';
import './TrackBlock.js';
import blueTrackImg from './BlueTrack.jpg';
import blueTrackJson from './blueLineTrackModel.json';

// variables
//const switchPos = 0;
function handleChange() {
  return 0;
}

const darkMode = createTheme({
  palette: {
    mode: 'dark',
  },
});

class TrackModel extends React.Component {
  constructor(props, name) {
    super(props);
    this.name = name;

    this.state = {
      //  system variable defaults will go here -- booleans
      testMode: false,
      trackPower: 'functional',
      railStatus: 'functional',
      recievingTrackCircuit: 'functional',
      sendingTrackCircuit: 'functional',
      speedLimit: 0,
      switchPos: 'disabled',
      blockIndex: 1,
      blockLength: 1,
      elevation: 0,
      beaconStatus: 'functional',
      directionOfTravel: 'forwards',
      trackHeaterStatus: 'disabled',
      trainOccupancy: 25,
      personsAtStation: 10,

      testUISpeedLimit: 30,
      testUIEnvtemp: 80,
      testUITrackHeaterStatus: 'enabled',
    };

    //  function prototypes
    this.toggle = this.toggle.bind(this);
    this.loadNewTrackModel = this.loadNewTrackModel.bind(this);
    this.failTrackPower = this.failTrackPower.bind(this);
    this.breakRail = this.breakRail.bind(this);
    this.changeSendingTrackCircuit = this.changeSendingTrackCircuit.bind(this);
    this.changeRecievingTrackCircuit =
      this.changeRecievingTrackCircuit.bind(this);
    this.changeElevation = this.changeElevation.bind(this);
    this.handleSwitchChange = this.handleSwitchChange.bind(this);
    this.changeBeacon = this.changeBeacon.bind(this);
    this.loadBlockInfo = this.loadBlockInfo.bind(this);
    this.resetAllSettings = this.resetAllSettings.bind(this);
    this.handleChange = this.handleChange.bind(this);

    this.testUISpeedLimitFun = this.testUISpeedLimitFun.bind(this);
    this.testUIEnvtempFun = this.testUIEnvtempFun.bind(this);
    this.testUITrackHeaterStatusFun =
      this.testUITrackHeaterStatusFun.bind(this);
  }

  //  appears to be working so far
  loadBlockInfo = (event) => {
    let { myValue } = event.currentTarget.dataset;
    console.log(myValue);
    console.log(blueTrackJson[myValue - 1]);
    const tempObj = blueTrackJson[myValue - 1];

    //  Assign values from JSON for calculations
    const blockLengthMetric = tempObj['Block Length (m)']; //  convert from meters to miles
    const speedLimitMetric = tempObj['Speed Limit (Km/Hr)']; //   Convert from km/h to mph

    this.setState({
      blockLength: (blockLengthMetric * 0.000621371).toFixed(3),
    });
    this.setState({
      speedLimit: (speedLimitMetric * 0.621371).toFixed(3),
    });
    this.setState({
      switchPos: tempObj.switch,
    });
    this.setState({
      blockIndex: myValue,
    });
    this.setState({
      elevation: tempObj.Elevation,
    });
    this.setState({
      blockOccupancy: tempObj['Block Occupancy'],
    });
    this.setState({
      enviornmentTemp: tempObj['Enviorment Temp'],
    });
  };

  //need to implement this
  loadNewTrackModel = (event) => {
    console.log('load new track has not been yet implemented.');
  };

  handleSwitchChange = (event) => {
    let { myValue } = event.currentTarget.dataset;
    let index = this.state.blockIndex;
    console.log(`switch value: ${myValue}`);
    if (index === '5') {
      console.log(`reacehed if statement: ${index}`);
      if (myValue === '0') {
        //  make engaged
        this.setState({ switchPos: 'engaged' });
      } else {
        //  keep disengaged
        this.setState({ switchPos: 'disengaged' });
      }
    }
  };

  failTrackPower = (event) => {
    //check the state of track power and change it
    if (this.state.trackPower === 'functional') {
      this.setState({ trackPower: 'broken' });
    } else {
      this.setState({ trackPower: 'functional' });
    }
  };

  breakRail = (event) => {
    if (this.state.railStatus === 'functional') {
      this.setState({ railStatus: 'broken' });
    } else {
      this.setState({ railStatus: 'functional' });
    }
  };

  changeSendingTrackCircuit = (event) => {
    if (this.state.sendingTrackCircuit === 'functional') {
      this.setState({ sendingTrackCircuit: 'broken' });
    } else {
      this.setState({ sendingTrackCircuit: 'functional' });
    }
  };

  changeRecievingTrackCircuit = (event) => {
    if (this.state.recievingTrackCircuit === 'functional') {
      this.setState({ recievingTrackCircuit: 'broken' });
    } else {
      this.setState({ recievingTrackCircuit: 'functional' });
    }
  };

  changeElevation = (event) => {
    const myElevation = event.currentTarget.value;
    this.setState({ elevation: myElevation });
  };

  //  should reset elevation to the elevation of the block stat
  resetElevation = (event) => {
    this.setState({ elevation: 0 });
  };

  changeBeacon = (event) => {
    if (this.state.beaconStatus === 'functional') {
      this.setState({ beaconStatus: 'broken' });
    } else {
      this.setState({ beaconStatus: 'functional' });
    }
  };

  //  handle the select change
  handleChange = (event) => {
    // this.state.blockIndex = event.target.value;
    this.setState({ blockIndex: event.target.value });
  };

  resetAllSettings = (event) => {
    this.resetElevation();
    this.setState({ railStatus: 'functional' });
    this.setState({ trackPower: 'functional' });
    this.setState({ recievingTrackCircuit: 'functional' });
    this.setState({ sendingTrackCircuit: 'functional' });
    this.setState({ switchPos: 'disengaged' });
    this.setState({ beaconStatus: 'functional' });
  };

  //  FUNCTIONS FOR TEST UI
  testUIEnvtempFun = (event) => {
    const myValue = event.currentTarget.value;
    this.setState({ testUIEnvtemp: myValue });
  };

  testUISpeedLimitFun = (event) => {
    const myValue = event.currentTarget.value;
    this.setState({ testUISpeedLimit: myValue });
  };

  testUITrackHeaterStatusFun = (event) => {
    const myValue = event.currentTarget.value;
    this.setState({ testUITrackHeaterStatus: myValue });
  };

  toggle() {
    this.setState((prevState) => ({
      testMode: !prevState.testMode,
    }));
  }

  //  Test UI Function
  testUI() {
    return (
      <Container maxWidth="lg">
        <ThemeProvider theme={darkMode}>
          <Grid container spacing={12} direction="row" justifyContent="center">
            <Grid item xs={3} justifySelf="center">
              <div className="HeaderText">Test UI</div>
            </Grid>
          </Grid>
          <Grid
            container
            spacing={1}
            className="topThreeButtons"
            direction="row"
          >
            <Grid item xs={4}>
              <Button
                variant="contained"
                sx={{ fontSize: 14 }}
                className="LoadTrack"
              >
                <AddIcon /> Load New Track Model
                <input type="file" hidden />
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Grid item>
                <Button
                  variant="contained"
                  sx={{ fontSize: 14 }}
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
                className="RestoreDefaults"
                onClick={this.resetAllSettings}
              >
                Reset to Default Settings
              </Button>
            </Grid>
          </Grid>

          <Grid
            container
            spacing={12}
            className="A few settings"
            direction="row"
          >
            <Grid item xs={4}>
              <div>Speed limit</div>
            </Grid>
            <Grid item xs={4}>
              <div>{this.state.testUISpeedLimit}</div>
            </Grid>
            <Grid item xs={4}>
              <TextField
                value={this.state.testUISpeedLimit}
                onChange={this.testUISpeedLimitFun}
              />
            </Grid>
            <Grid item xs={4}>
              <div>Enviornment Temp</div>
            </Grid>
            <Grid item xs={4}>
              <div>{this.state.testUIEnvtemp}</div>
            </Grid>
            <Grid item xs={4}>
              <TextField
                value={this.state.testUIEnvtemp}
                onChange={this.testUIEnvtempFun}
              />
            </Grid>
            <Grid item xs={4}>
              <div>Track Heater Status</div>
            </Grid>
            <Grid item xs={4}>
              <div>{this.state.testUITrackHeaterStatus}</div>
            </Grid>
            <Grid item xs={4}>
              <TextField
                value={this.state.testUITrackHeaterStatus}
                onChange={this.testUITrackHeaterStatusFun}
              />
            </Grid>
          </Grid>
        </ThemeProvider>
      </Container>
    );
  }

  // ----- THE ACTUAL TRACK MODEL UI --------- //

  render() {
    // eslint-disable-next-line react/destructuring-assignment
    if (this.state.testMode) return this.testUI();
    return (
      <Container maxWidth="lg">
        <ThemeProvider theme={darkMode}>
          <Grid container spacing={12} direction="row" justifyContent="center">
            <Grid item xs={3} justifyContent="center">
              <div className="HeaderText">Track Model</div>
            </Grid>
          </Grid>
          <Grid
            container
            spacing={1}
            className="topThreeButtons"
            direction="row"
          >
            <Grid item xs={4}>
              <Button
                variant="contained"
                sx={{ fontSize: 14 }}
                className="LoadTrack"
                // onClick={this.loadNewTrackModel}
              >
                Load New Track Model
                <input type="file" hidden />
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Grid item>
                <Button
                  variant="contained"
                  sx={{ fontSize: 14 }}
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
                className="RestoreDefaults"
                onClick={this.resetAllSettings}
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
                  <div className="label">Track Power</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label"> {this.state.trackPower}</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">Rail Status</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label"> {this.state.railStatus}</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">Track Circuit Sent</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label"> {this.state.sendingTrackCircuit}</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">Track Circuit Recieved</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">
                    {' '}
                    {this.state.recievingTrackCircuit}
                  </div>
                </Grid>

                <Grid item xs={6}>
                  <div className="label">Switch Position</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label"> {this.state.switchPos}</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">Speed Limit (mph)</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label"> {this.state.speedLimit}</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">Block Length (mi)</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label"> {this.state.blockLength}</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">Direction of Travel</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label"> {this.state.directionOfTravel}</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">Train Occupancy</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label"> {this.state.trainOccupancy}</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">Block Occupancy</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label"> {this.state.blockOccupancy}</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">Track Heater Status</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label"> {this.state.trackHeaterStatus}</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">Enviornment Temp (F)</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">{this.state.enviornmentTemp}</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">Persons at Station</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">{this.state.personsAtStation}</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">Beacon Status</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">{this.state.beaconStatus}</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">Railway Crossing (mi)</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">0 miles</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">Elevation (feet)</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">{this.state.elevation}</div>
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
                  <FormControl
                    fullWidth="true"
                    size="small"
                    padding="none"
                    marginTop="none"
                  >
                    <InputLabel sx={{ fontSize: 16 }} id="select-block-label">
                      Select a Block
                    </InputLabel>
                    {/* ISSUE COULD BE THAT i HAVE A FUNCTION ONCHANGE AND ONCLICK COULD BE CONFLICTING */}
                    <Select
                      size="medium"
                      // sx={{ height: 16 }}
                      id="track-Block-Select-Label"
                      // variant="filled"
                      fullWidth
                      // multiline
                      onChange={this.handleChange}
                      value={this.state.blockIndex}
                      // value="Hello"
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
                  </FormControl>
                </Grid>
                <Grid item id="BlockIndexID">
                  <div id="blockIndexDiv">
                    Block index: {this.state.blockIndex}
                  </div>
                </Grid>
              </Grid>
            </Grid>

            {/* Column 3 */}
            <Grid item xs={4}>
              <Grid
                container
                spacing={1}
                direction="row"
                justifyContent="center"
              >
                <Grid item xs={12}>
                  {this.state.trackPower === 'functional' ? (
                    <Button
                      variant="contained"
                      color="error"
                      onClick={this.failTrackPower}
                      sx={{ fontSize: 16 }}
                    >
                      Fail Track Power
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={this.failTrackPower}
                      sx={{ fontSize: 16 }}
                    >
                      Restore Track Power
                    </Button>
                  )}
                </Grid>

                <Grid item xs={12}>
                  {this.state.railStatus === 'functional' ? (
                    <Button
                      variant="contained"
                      color="error"
                      onClick={this.breakRail}
                      sx={{ fontSize: 16 }}
                    >
                      Break Rail
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={this.breakRail}
                      sx={{ fontSize: 16 }}
                    >
                      Restore Rail
                    </Button>
                  )}
                </Grid>

                <Grid item xs={12}>
                  {this.state.sendingTrackCircuit === 'functional' ? (
                    <Button
                      variant="contained"
                      color="error"
                      onClick={this.changeSendingTrackCircuit}
                      sx={{ fontSize: 16 }}
                    >
                      Stop Sending Track Circuit
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={this.changeSendingTrackCircuit}
                      sx={{ fontSize: 16 }}
                    >
                      Start Sending Track Circuit
                    </Button>
                  )}
                </Grid>

                <Grid item xs={12}>
                  {this.state.recievingTrackCircuit === 'functional' ? (
                    <Button
                      variant="contained"
                      color="error"
                      onClick={this.changeRecievingTrackCircuit}
                      sx={{ fontSize: 16 }}
                    >
                      Stop Recieving Track Circuit
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={this.changeRecievingTrackCircuit}
                      sx={{ fontSize: 16 }}
                    >
                      Start Recieving Track Circuit
                    </Button>
                  )}
                </Grid>

                <Grid item xs={6} className="dumbButton">
                  <TextField
                    id="filled-basic"
                    type="number"
                    multiline
                    fullWidth
                    label="Elevation"
                    variant="filled"
                    size="normal"
                    value={this.state.elevation}
                    onChange={this.changeElevation}
                    // defaultValue="Elevation"
                  />
                </Grid>

                <Grid item xs={6}>
                  <Button
                    variant="contained"
                    onClick={this.resetElevation}
                    sx={{ fontSize: 14 }}
                  >
                    Reset Elevation
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth="true" size="small">
                    <InputLabel id="switch-position-select-label">
                      Switch Position
                    </InputLabel>
                    <Select
                      sx={{ fontSize: 8 }}
                      variant="filled"
                      id="switch-position-select-label"
                      value={this.switchPos}
                      label="Switch Position"
                    >
                      <MenuItem
                        data-my-value={0}
                        onClick={this.handleSwitchChange}
                      >
                        Engaged
                      </MenuItem>
                      <MenuItem
                        data-my-value={1}
                        onClick={this.handleSwitchChange}
                      >
                        Disengaged
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* <Grid item xs={6}>
                <Button variant="contained" sx={{ fontSize: 14 }} onClick={this.resetSwitch}>
                  Reset Switch
                </Button>
              </Grid> */}

                {/* Profetta doesnt want to have a change beacon feature */}
                {/* <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={this.changeBeacon}
                    sx={{ fontSize: 16 }}
                  >
                    Stop Beacon
                  </Button>
                </Grid> */}

                {/* <Grid item xs={6}>
                <Button variant="contained" sx={{ fontSize: 14 }}>
                  Reset Beacon
                </Button>
              </Grid> */}
              </Grid>
            </Grid>
          </Grid>
        </ThemeProvider>
      </Container>
    );
  }
}

export default TrackModel;
