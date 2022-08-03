/* eslint-disable prefer-destructuring */
/* eslint-disable react/sort-comp */
/* eslint-disable no-plusplus */
/* eslint-disable react/destructuring-assignment */

//  -----IMPORT STATEMENTS----- //
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
  AutoFixHighRounded,
  ContactPageSharp,
  ContactSupportOutlined,
  FastForward,
  PortableWifiOffRounded,
} from '@mui/icons-material';
import { array } from 'prop-types';
import { Block } from './TrackComponents/Block';
import { Switch } from './TrackComponents/Switch';
import { Track } from './TrackComponents/Track';

//  needed for the track model class to recieve and send signals
import redLine from './TrackComponents/TrackJSON/VF2/TrackModel_JSON/red_line.json';
import greenLine from './TrackComponents/TrackJSON/VF2/TrackModel_JSON/green_line.json';

import { isGeneratorFunction } from 'util/types';

// -----VARIABLES----- //

const darkMode = createTheme({
  palette: {
    mode: 'dark',
  },
});

let greenBlocks = [];
let redBlocks = [];
let greenEVTemp;
let redEVTemp;
let greenTHStatus;
let redTHStatus;

// variables for the two tracks failures
let redTrackSignalPickup; let greenTrackSignalPickup;
let redRailStatus; let greenRailStatus;
let redTrackPowerStatus; let greenTrackPowerStatus;

let trainDispatchArr = [];

let isTrainMoving = false;
let enteredBlock = false;
let exitedBlock = false;

let lineName = '';
// let enviornmentTemp = 0;
// let trackHeaterStatus = 'disabled';
// let trainOccupancy = 25;
// let personsAtStation = 10;

let redCurrBlock = 1; let greenCurrBlock = 1; //  Block that the train model is currently entering // default to 1

let Authority = 0; //  will be given via track controller

//  -----TRACK MODEL CLASS----- //

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
      TransitLightStatus: 'Red',

      // beacon
      beacon: 'defaultBeacon',

      // if information has problem might need blocks: blocks
      //  is an array of blocks, one block has block info for the track
      blocks: [],
      currBlock: 1, //  Block that the train model is currently entering // default to 1

      Authority: 0, //  will be given via track controller

      testUISpeedLimit: 30,
      testUIEnvtemp: 80,
      testUITrackHeaterStatus: 'enabled',
    };

    //  function to load in new files
    window.electronAPI.subscribeFileMessage((_event, payload) => {
      try {
        this.loadNewTrackModel(JSON.parse(payload.payload));
      } catch (error) {
        console.log(error);
      }
    });

    //  Function to recieve messages from other modules via IPC communication
    window.electronAPI.subscribeTrackModelMessage((_event, payload) => {
      console.log('IPC:Track Model: ', payload);
      let trainID; let trackLine;
      switch (payload.type) {
        //  signals from Track Controller
        case 'dispatch':
          trainID = payload.trainID;
          trackLine = payload.line;
          trainDispatchArr.push({
            trainID, trackLine
          });
          this.sendYardExitInfo(trainID, trackLine);
          break;
        case 'switch':
          //  only set up for green line rn
          // eslint-disable-next-line no-case-declarations
          const LINE = payload.line;
          if(LINE === 'Green')
          {
            greenBlocks[payload.root].next = payload.pointing_to;
            greenBlocks[payload.pointing_to].prev = payload.root;
          }
          if(LINE === 'Red')
          {
            redBlocks[payload.root].next = payload.pointing_to;
            redBlocks[payload.pointing_to].prev = payload.root;
          }
          break;
        case 'light':
          this.state.TransitLightStatus = payload.payload;
        break;
        case 'authority':
          Authority = payload.payload;
        break;

        //  signals from Train Model
        case 'signalPickupFailure':
          this.state.TrackSignalPickup = payload.payload;
        break;
        
        case 'updateBlockOccupancy':
          // eslint-disable-next-line no-case-declarations
          const blockOccInfo = payload.payload;
          this.trainModelHandshake(blockOccInfo);
          break;
        default:
      }
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
    this.checkTrackHeaters = this.checkTrackHeaters.bind(this);
    this.loadFile = this.loadFile.bind(this);
    this.testUISpeedLimitFun = this.testUISpeedLimitFun.bind(this);
    this.testUIEnvtempFun = this.testUIEnvtempFun.bind(this);
    this.testUITrackHeaterStatusFun =
      this.testUITrackHeaterStatusFun.bind(this);

    this.trainModelHandshake = this.trainModelHandshake.bind(this);
    this.sendYardExitInfo = this.sendYardExitInfo.bind(this);
    this.sendGreenMessages = this.sendGreenMessages.bind(this);
    this.sendRedMessages = this.sendRedMessages.bind(this);
    this.checkTrackFailures = this.checkTrackFailures.bind(this);
    this.getTrackModelArrays = this.getTrackModelArrays.bind(this);


    //  Create multiple track model instances (one for each line)
    const redLineObject = new Track();
    const greenLineObject = new Track();

    //  load tracks
    redLineObject.loadTrack(redLine);
    greenLineObject.loadTrack(greenLine);

    //  set infrastructure
    redLineObject.setInfrastructure();
    greenLineObject.setInfrastructure();

    //   load the Track Objects' blocks arrays into the Track Model Class blocks' arrays
    greenBlocks = greenLineObject.blocks;
    redBlocks = redLineObject.blocks;

    //  set the enviornemnt temps for both lines
    const tr = redLineObject.generateTrackModelEVtemp();
    redEVTemp = tr;
    const tg = greenLineObject.generateTrackModelEVtemp();
    greenEVTemp = tg;

    //  check the track heater status
    this.checkTrackHeaters(redEVTemp, greenEVTemp);

    //  make the default block occupancy unoccupied
    redBlocks.forEach((a) => {a.Occupied = 'Unoccupied'});
    greenBlocks.forEach((b) => {b.Occupied = 'Unoccupied'});

    //  send messages to the other modules based on the information in the Track Classes
    this.sendGreenMessages(greenLineObject);
    this.sendRedMessages(redLineObject);

    //  start checking for track errors
    this.checkTrackFailures();
  }

  //  Load Track Block Info -- Display
  loadNewTrackModel = (trackFile) => {
    //  instantiate new track object
    console.log('Track File contents: ', trackFile);

    //  assign the line to the lineName property
    this.state.lineName = trackFile[1].Line;

    if(this.state.lineName === 'Red')
      this.state.blocks = redBlocks;
    else if(this.state.lineName === 'Green')
      this.state.blocks = greenBlocks;
    //  load the first block by default
    this.loadBlockInfo(1);
  
  };

  //  Load's blocks information from the Track Model File - alpha = blockIndex
  loadBlockInfo = (alpha) => {
    //  convert to imperials for display only
    const curBlock = this.state.blocks[alpha]; //  get the block selected
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
    this.state.blockOccupancy = this.state.blocks[this.state.blockIndex].Occupied;
  };

  loadFile = (event) => {
    window.electronAPI.openFileDialog('TrackModel');
  };

  //  -----STATE VARIABLE FUNCTIONS-----  //
  //  TODO -- Might not need
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
      //  check the line and assign the variables
      if(this.state.lineName === 'Green')
      {
        greenTrackPowerStatus = 'broken';
      }
      else if (this.state.lineName === 'Red')
      {
        redTrackPowerStatus = 'broken';
      }
    } else {
      this.setState({ trackPower: 'functional' });
      if(this.state.lineName === 'Green')
      {
        greenTrackPowerStatus = 'functional';
      }
      else if (this.state.lineName === 'Red')
      {
        redTrackPowerStatus = 'functional';
      }
    }
  };

  breakRail = (event) => {
    if (this.state.railStatus === 'functional') {
      this.setState({ railStatus: 'broken' });
      //  check for the line, then make a failure
      if(this.state.lineName === 'Green')
      {
        greenRailStatus = 'broken';
      }
      else if (this.state.lineName === 'Red')
      {
        redRailStatus = 'broken';
      }
    } else {
      this.setState({ railStatus: 'functional' });
      //  check for the line, then make a failure
      if(this.state.lineName === 'Green')
      {
        greenRailStatus = 'functional';
      }
      else if (this.state.lineName === 'Red')
      {
        redRailStatus = 'functional';
      }
    
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
      //  change the state of the red/green track signal pickup
      if(this.state.lineName ==='Green')
        {greenTrackSignalPickup = 'broken';}
      else if (this.state.lineName === 'Red')
        {redTrackSignalPickup = 'broken';}
    } else {
      this.setState({ recievingTrackCircuit: 'functional' });
      if(this.state.lineName ==='Green')
        {greenTrackSignalPickup = 'functional';}
      else if (this.state.lineName === 'Red')
        {redTrackSignalPickup = 'functional';}
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

  //  check if the track heaters should turn on
  checkTrackHeaters = (r, g) => {
    if (r < 32) {
      redTHStatus = 'enabled';
    } else if (!(r < 32)) {
      redTHStatus = 'disabled';
    }

    if (g < 32) {
      greenTHStatus = 'enabled';
    } else if (!(g < 32)) {
      greenTHStatus = 'disabled';
    }
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

  //  -----TRACK MODEL FUNCTIONALITY----- //

  // On loading the Track Model Program, load in the Red and Green lines

  //  send leaving yard info
  sendYardExitInfo = (trainID, trackLine) => {
    //  send message to train model about leaving the yard
    window.electronAPI.sendTrackModelMessage({
      type: 'exitYard',
      // trainID: trainDispatchArr[]
      trainID,
      trackLine
    });
  };

  //  ----MIGHT NOT NEED-----//
  //  update block occupancy
  // updateBlockOccupancy = (payload) => {
  //   //  need to get the payload message and upate the block occupancy
  //   const interval = setInterval(() => {
  //     // if (payload.Enter !== null) blocks[currBlock].Occupied = true;
  //     // if (payload.Leave !== null) blocks[currBlock].Occupied = false;
  //   }, 10000);
  // };

  //  need to send messages based on block info that train is entering
  sendGreenMessages = (greenObj) => {
    const interval = setInterval(() => {
      //  Track rail Status GreenLine
      window.electronAPI.sendTrackControllerMessage({
        type: 'GreenlineRailStatus',
        RailStatus: greenRailStatus,
      });

      //  Tracks block occupancy
      window.electronAPI.sendTrackControllerMessage({
        type: 'GreenBlockOccupancy',
        GreenBlocks: greenBlocks,
      });

    }, 1000);
  };

  sendRedMessages = (redObj) => {
    const interval = setInterval(() => {
      //  Track rail Status RedLine
      window.electronAPI.sendTrackControllerMessage({
        type: 'RedlineRailStatus',
        RailStatus: redRailStatus,
      });

      //  Tracks block occupancy
      window.electronAPI.sendTrackControllerMessage({
        type: 'RedBlockOccupancy',
        RedBlocks: redBlocks,
      });
    }, 1000);
  };

  //  GETS TRIGGERED IN CONSTRUCTOR, CHECKS FOR TRACK FAILURES
  checkTrackFailures = () =>
  {
    //  check the red line
    if(redTrackPowerStatus === 'broken' || redTrackSignalPickup === 'broken' || redRailStatus === 'broken')
    {
      //  send train model message to stop
      window.electronAPI.sendTrainModelMessage({
        type: 'Stop'
      });
    }
    else if (redTrackPowerStatus === 'functional' && redTrackSignalPickup === 'functional' && redRailStatus === 'functional')
    {
      window.electronAPI.sendTrainModelMessage({
        type: 'Go'
      });
    }

  };

  //  function for updating block occupancy and exchanging information with train model
  //  GETS TRIGGERED FROM TRAIN MODEL MESSAGE
  trainModelHandshake = (blockOccInfo) => {

    //  dissect the blockOccInfo object into its parts
    const TRAIN_ID = blockOccInfo.trainID;
    const IS_TRAIN_MOVING =  blockOccInfo.isTrainMoving;
    const ENTERED_BLOCK =  blockOccInfo.enteredBlock;
    const EXITED_BLOCK = blockOccInfo.exitedBlock;
    
    let blocks;
    let currBlock;
    //  decide whick track is getting updated

    //  find the train ID to update authority
    const ind = trainDispatchArr.findIndex(
      (TrainID) => TrainID === TRAIN_ID
    );

    //  find the line that the train is on
    const trackLine = trainDispatchArr[ind].trackLine

    if(trackLine === 'red line')
    {
      blocks = redBlocks;
      currBlock = redCurrBlock;
    }
    else if(trackLine === 'green line')
    {
      blocks = greenLine;
      currBlock = greenCurrBlock;
    }

    //  expect a message from train that it is moving/entering a new block
    while (currBlock < blocks[blocks.length]) {
      //  check if the train is moving
      if (IS_TRAIN_MOVING) {
        //  occupy the current block
        blocks[currBlock].Occupied = true;
        //  send the train model a message about the length of the current block and speed
        window.electronAPI.sendTrainModelMessage({
          type: 'CurrentCommandedSpeed',
          CommandedSpeed: blocks[currBlock].spdLimit,
          TrainID: TRAIN_ID,
        });
        window.electronAPI.sendTrainModelMessage({
          type: 'CurrentBlockLength',
          BlockLength: blocks[currBlock].length,
          TrainID: TRAIN_ID,
        });
        if(currBlock < blocks.length)
        {
          window.electronAPI.sendTrainModelMessage({
            type: 'NextBlockLength',
            BlockLength: blocks[currBlock + 1].length,
            TrainID: TRAIN_ID,
          });
        }

        //  SEND TRAIN MODEL OTHER VARIABLES
        //  authority, beacon, underground, grade
        // window.electronAPI.sendTrainModelMessage({
        //   type: 'Authority',
        //   Authority = trainDispatchArr[ind].Authority,
        // });

        window.electronAPI.sendTrainModelMessage({
          type: 'Beacon',
          Beacon : blocks[currBlock].beacon,
          TrainID: TRAIN_ID,
        });

        window.electronAPI.sendTrainModelMessage({
          type: 'Underground',
          Underground : blocks[currBlock].underground,
          TrainID: TRAIN_ID,
        });

        window.electronAPI.sendTrainModelMessage({
          type: 'Grade',
          Grade : blocks[currBlock].grade,
          TrainID: TRAIN_ID,
        });
      }
      //  Train progresses to next block
      if (ENTERED_BLOCK) {
        //  update the next block
        currBlock++;
        //  check if the old block has been vacatted
        if (EXITED_BLOCK) {
          //  loop through blocks, first occupied block becomes unoccupied
          const searchInd = blocks.Occupied.indexOf.true;
          //  set occupancy to false
          blocks[searchInd].Occupied = false;
        }
      }
    }
  };

  //  function to assign all UI state variables based on the system variables
  setUIStateVars = () => {
    //  commented out variables arent present in UI (most likely)
    // this.state.blocks = blocks;
    // let isTrainMoving = ;
    // let trainInNextBlock = ;
    // let trainExitedBlock = ;
    this.state.lineName = lineName;
    this.state.enviornmentTemp = enviornmentTemp;
    this.state.trackHeaterStatus = trackHeaterStatus;
    this.state.trainOccupancy = trainOccupancy;
    this.state.personsAtStation = personsAtStation;
    // this.state.currBlock = currBlock;
    this.state.Authority = Authority;
  };

  //  Function to get the arrays in the track model
  getTrackModelArrays = () => {
    return ({'redBlocks': redBlocks, 'greenBlocks': greenBlocks});
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
                      value={this.state.switchPos}
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
