/* eslint-disable no-plusplus */
/* eslint-disable react/destructuring-assignment */
import { Module } from 'module';
import React, { useRef } from 'react';
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
import {
  ContactPageSharp,
  FastForward,
  PortableWifiOffRounded,
} from '@mui/icons-material';
import { array } from 'prop-types';
import blueTrackImg from './BlueTrack.jpg';
import blueTrackJson from './blueLineTrackModel.json';

import { Block } from './TrackComponents/Block';
import { Switch } from './TrackComponents/Switch';
import { Track } from './TrackComponents/Track';

// variables
const darkMode = createTheme({
  palette: {
    mode: 'dark',
  },
});

const blocks = [];

class TrackModel extends React.Component {
  constructor(props, name) {
    super(props);
    this.name = name;

    this.state = {
      //  system variable defaults will go here
      lineName: '',
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
      enviornmentTemp: 0,
      beaconStatus: 'functional',
      directionOfTravel: 'forwards',
      trackHeaterStatus: 'disabled',
      trainOccupancy: 25,
      blockOccupancy: 'false',
      personsAtStation: 10,

      TrackJSON: '',
      TransitLightStatus: 'Red',

      // beacon
      beacon: 'defaultBeacon',

      // if information has problem might need blocks: blocks
      //  is an array of blocks, one block has block info for the track
      blocks,
      currBlock: 1, //  Block that the train model is currently entering

      Authority: 0,

      testUISpeedLimit: 30,
      testUIEnvtemp: 80,
      testUITrackHeaterStatus: 'enabled',
    };

    //  function to load in new files
    window.electronAPI.subscribeFileMessage((_event, payload) => {
      try {
        // this.state.TrackJSON = JSON.parse(payload.payload); //  assigns the value of the JSON data to the JSON var
        // call other function
        this.loadNewTrackModel(JSON.parse(payload.payload));
      } catch (error) {
        console.log(error);
      }

      //  testing
    });

    //  Function to recieve messages from other modules via IPC communication
    window.electronAPI.subscribeTrackModelMessage((_event, payload) => {
      console.log('IPC:Track Model: ', payload);
      switch (payload.type) {
        case 'switch':
          this.state.Authority = payload.payload;
          break;
        case 'light':
          this.state.TransitLightStatus = payload.value;
          break;
        case 'authority':
          break;

        case 'trainModelStatus':
          //  call the update block occupancy function
          this.updateBlockOccupancy(payload.payload);
          break;
        default:
        // console.log('Unknown payload type recieved: ', payload.type);
      }

      // try {
      //   //  store the message payload in the recieved message var
      //   this.state.IPC_Recieved_Message = payload.payload;
      // } catch (error) {
      //   console.log(error);
      // }
    });

    //  function to send message to the Track Controller
    window.electronAPI.sendTrackControllerMessage({
      //  anything inside here is a property of the object you are sending
      //  example 'type': 'closure'
      type: 'trackModelStatus',
      TrackSignalPickup: this.state.recievingTrackCircuit,
      RailStatus: this.state.railStatus,
      TrackPowerStatus: this.state.trackPower,
      SpeedLimit: this.state.speedLimit,
      Throughput: '',
      // TrackBlocks: this.state.blocks,
    });

    //  function to send message to the Train Model
    window.electronAPI.sendTrainModelMessage({
      //  anything here is a property of the object you are sending
      type: 'trackModelStatus',
      TransitLightStatus: this.state.TransitLightStatus,
      CommandedSpeed: 25,
      Authority: '',
      Beacon: this.state.beacon,
      UndergroundBlocks: this.state.blocks.Underground,
    });

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
    // this.generateTrackModelEVtemp = this.generateTrackModelEVtemp.bind(this);
    this.checkTrackHeaters = this.checkTrackHeaters.bind(this);
    this.loadFile = this.loadFile.bind(this);
    this.testUISpeedLimitFun = this.testUISpeedLimitFun.bind(this);
    this.testUIEnvtempFun = this.testUIEnvtempFun.bind(this);
    this.testUITrackHeaterStatusFun =
      this.testUITrackHeaterStatusFun.bind(this);
    // this.isBlockUnderground = this.isBlockUnderground.bind(this);
    // this.generateBeacon = this.generateBeacon.bind(this);
    this.sendYardExitInfo = this.sendYardExitInfo.bind(this);
  }

  //  Load's blocks information from the Track Model File - alpha = blockIndex
  loadBlockInfo = (alpha) => {
    //  generate beacon message
    // this.generateBeacon();

    const curBlock = this.state.blocks[alpha]; //  get the block selected
    console.log('curBlock data', curBlock);
    const blockLengthImperial = (curBlock.length * 0.000621371).toFixed(3);
    const speedLimitImperial = (curBlock.spdLimit * 0.621371).toFixed(3);
    const elevationImperial = (curBlock.elevation * 3.28084).toFixed(3);

    //  Assign values from the Blocks array to State vars
    this.setState({
      blockLength: blockLengthImperial,
    });
    this.setState({
      speedLimit: speedLimitImperial,
    });
    this.setState({
      elevation: elevationImperial,
    });
    this.state.blockOccupancy =
      this.state.blocks[this.state.blockIndex - 1].Occupied;
  };

  //  Load Track Block Info
  loadNewTrackModel = (trackFile) => {
    //  instantiate new track object
    // console.log('track file: ', trackFile);
    const TrackObject = new Track();
    TrackObject.loadTrack(trackFile);

    //  set infrastructure
    TrackObject.setInfrastructure();

    //  clear the track model
    // this.state.blocks = [];
    // //  load the TrackJSON object's properties into the blocks array
    // const tempTrackObj = this.state.TrackJSON.Green;
    this.state.blocks = TrackObject.blocks;
    // for (let i = 0; i < TrackObject.length; i++) {
    //   const temp = TrackObject[i]; // gets the info from object at index i
    //   this.state.blocks.push({
    //     Line: temp.line,
    //     Section: temp.section,
    //     BlockNumber: temp.id,
    //     BlockLength: temp.length,
    //     BlockGrade: temp.grade,
    //     SpeedLimit: temp['Speed Limit (Km/Hr)'],
    //     Infrastructure: temp.Infrastructure,
    //     StationSide: temp['Station Side'],
    //     Elevation: temp['ELEVATION (M)'],
    //     CumElevation: temp['CUMALTIVE ELEVATION (M)'],
    //     PrevBlock: temp.Prev,
    //     NextBlock: temp.Next,
    //     Oneway: temp.Oneway,
    //     Occupied: 'false',
    //   });
    // }
    // eslint-disable-next-line react/no-access-state-in-setstate

    //  set line Name -- any index of the file will work as the line is same throughout
    console.log('line name: ', TrackObject.blocks[0].line);
    this.state.lineName = TrackObject.blocks[0].line;
    //  set envionment temp by calling function
    // this.generateTrackModelEVtemp();
    const t = TrackObject.generateTrackModelEVtemp();
    this.setState({ enviornmentTemp: t });

    //  call the function to check if the heaters are needed
    this.checkTrackHeaters();

    //  check if each block is underground, store in blocks
    // this.isBlockUnderground();
  };

  loadFile = (event) => {
    window.electronAPI.openFileDialog('TrackModel');
  };

  //  TODO
  handleSwitchChange = (event) => {
    let { myValue } = event.currentTarget.dataset;
    let index = this.state.blockIndex;
    if (index === '5') {
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
    //  check the state of track power and change it
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

  // generateTrackModelEVtemp = () => {
  //   const maxTemp = 110;
  //   const minTemp = 0;

  //   //  Generates a ramdom temperature for the track model between the constraints
  //   const temp1 = Math.floor(Math.random() * (maxTemp - minTemp + 1)) + minTemp;

  //   this.setState({ enviornmentTemp: temp1 });
  // };

  //  function shall retrieve beacon information from JSON data in the blocks
  //  should be implemented in the Track Components Track Class
  // generateBeacon = () => {
  //   const beaconMessage =
  //     this.state.blocks[this.state.blockIndex - 1].Infrastructure;

  //   this.state.beacon = 'No Station';
  //   if (beaconMessage.includes('STATION')) {
  //     //  capture the string after station until ';' or end of string
  //     const firstInd = beaconMessage.indexOf(';');
  //     const mess = beaconMessage.substring(firstInd + 1);
  //     this.state.beacon = mess;
  //     //  CHECK if the string includes other information and reduce
  //     if (mess.includes(';')) {
  //       const mess2 = mess.substring(0, mess.indexOf(';'));
  //       this.state.beacon = mess2;
  //     }

  //     //  If station is included, tell if left or right of track
  //     let dir;
  //     switch (this.state.blocks[this.state.blockIndex - 1].StationSide) {
  //       case 'Left/Right':
  //         dir = 'b';
  //         break;
  //       case 'Left':
  //         dir = 'l';
  //         break;
  //       case 'Right':
  //         dir = 'r';
  //         break;
  //       default:
  //         break;
  //     }

  //     //  append the beacon
  //     let beac = this.state.beacon;
  //     beac += `-${dir}`;
  //     this.state.beacon = beac;
  //   }
  // };

  //  function shall check if the blocks are underground
  // isBlockUnderground = () => {
  //   for (let ind = 0; ind < this.state.TrackJSON.Green.length; ind++) {
  //     const infas = this.state.blocks[ind].Infrastructure;
  //     this.state.blocks[ind].Underground = false;
  //     if (infas.includes('UNDERGROUND'))
  //       this.state.blocks[ind].Underground = true;
  //   }
  //   // console.log(this.state.blocks);
  // };

  //  send leaving yard info
  sendYardExitInfo = () => {
    //  send message to train model about leaving the yard
  };

  //  update block occupancy
  updateBlockOccupancy = (payload) => {
    //  need to get the payload message and upate the block occupancy
    const interval = setInterval(() => {
      if (payload.Enter !== null)
        this.state.blocks[this.state.currBlock].Occupied = true;
      if (payload.Leave !== null)
        this.state.blocks[this.state.currBlock].Occupied = false;
    }, 10000);
  };

  //  check if the track heaters should turn on
  checkTrackHeaters = () => {
    if (this.state.enviornmentTemp < 32)
      this.setState({ trackHeaterStatus: 'enabled' });
    else this.setState({ trackHeaterStatus: 'disabled' });
  };

  //  handle the select change
  handleChange = (event) => {
    this.state.blockIndex = event.target.value;
    this.loadBlockInfo(event.target.value);
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
                <input type="file" />
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
                onClick={this.loadFile}
              >
                Load New Track Model
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
                <Grid item xs={12}>
                  <div className="label">Track Block Settings</div>
                </Grid>
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
                  <div className="label" defaultValue="false">
                    {this.state.blockOccupancy}
                  </div>
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
                  <div>Track Line: {this.state.lineName}</div>
                </Grid>
                <Grid item xs={12} />
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
                    <Select
                      size="medium"
                      id="track-Block-Select-Label"
                      fullWidth
                      onChange={this.handleChange}
                      value={this.state.blockIndex}
                    >
                      {this.state.blocks.map((block) => (
                        <MenuItem key={block.id} value={block.id}>
                          {String(block.id)}
                        </MenuItem>
                      ))}
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
              </Grid>
            </Grid>
          </Grid>
        </ThemeProvider>
      </Container>
    );
  }
}

export default TrackModel;
