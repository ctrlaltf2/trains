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

//  sending track circuits
let greenSendingTrackCircuit = "enabled";
let redSendingTrackCircuit = "enabled";

// let enviornmentTemp = 0;
// let trackHeaterStatus = 'disabled';
// let trainOccupancy = 25;
// let personsAtStation = 10;

let redCurrBlock = 1; let greenCurrBlock = 1; //  Block that the train model is currently entering // default to 1


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
      beacon: 'No beacon',
      directionOfTravel: 'forwards',
      trackHeaterStatus: 'disabled',
      trainOccupancy: 25,
      blockOccupancy: 'false',
      peopleAtStation: 10,
      peopleLeavingTrain: 0,
      peopleEnteringTrain: 0,
      TransitLightStatus: 'Green',
      crossing: false,
      peopleAtStation: 0,

      // beacon
      beacon: 'defaultBeacon',

      // if information has problem might need blocks: blocks
      //  is an array of blocks, one block has block info for the track
      blocks: [],
      currBlock: 1, //  Block that the train model is currently entering // default to 1

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
          let LINE = payload.line;
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
        case 'lights':
          // eslint-disable-next-line no-case-declarations
          const LINE2 = payload.line;
          if(LINE2 === 'Green')
          {
            if(!(payload.value.isNUll))
            {
              console.log('payload.value: ', payload.value);
              greenBlocks[payload.id].transitLightStatus = payload.value;
            }
            
          }
          if(LINE2 === 'Red')
          {
            if(!(payload.value.isNull))
            {
              redBlocks[payload.id].transitLightStatus = payload.value;
            }
            
          }
        break;

        case 'suggestedSpeed':
          //  block_id, suggestedSpeed, 
          window.electronAPI.sendTrainModelMessage({
            type: 'suggestedSpeed',
            payload: payload.payload,
          });
          break;

        case 'crossing':
          //  line, id, and status
          if(payload.line === "Green")
          {
            greenBlocks[payload.id].crossing = payload.status;
            // console.log('Crossing from message: ', greenBlocks[payload.id].crossing);
          }
          if(payload.line === 'Red')
          {
            redBlocks[payload.id].crossing = payload.status;
          }
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
    // this.sendGreenMessages = this.sendGreenMessages.bind(this);
    // this.sendRedMessages = this.sendRedMessages.bind(this);
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
    redBlocks.forEach((a) => {a.occupancy = false});
    greenBlocks.forEach((b) => {b.occupancy = false});

    //  check for a track station and generate a random number of people at the station
    redBlocks.forEach((block) => {
      if(!(block.stationSide === ""))
      {
        //  generate a random amount
        block.peopleAtStation = Math.floor(Math.random() * 20) + 1;
      }
      else
      {
        block.peopleAtStation = "null";
      }
    });

    greenBlocks.forEach((block) => {
      if(!(block.stationSide === ""))
      {
        //  generate a random amount
        block.peopleAtStation = Math.floor(Math.random() * 20) + 1;
      }
      else
      {
        block.peopleAtStation = "null";
      }
    });

    //  send the track controller an empty set of arrays (block unoccupied)
    window.electronAPI.sendTrackControllerMessage({
      type: 'GreenBlockOccupancy',
      GreenBlocks: greenBlocks,
    });

    window.electronAPI.sendTrackControllerMessage({
      type: 'RedBlockOccupancy',
      RedBlocks: redBlocks,
    });

    //  start checking for track errors
    this.checkTrackFailures();
  }

  //  Load Track Block Info -- Display
  loadNewTrackModel = (trackFile) => {
    //  instantiate new track object
    console.log('Track File contents: ', trackFile);

    //  assign the line to the state lineName property
    this.state.lineName = trackFile[1].Line;

    if(this.state.lineName === 'Red')
      {this.state.blocks = redBlocks;}
    else if(this.state.lineName === 'Green')
      {this.state.blocks = greenBlocks;}
    //  load the first block by default
    this.setState({blockIndex : 1});
    this.loadBlockInfo();
    
  
  };

  //  Load's blocks information from the Track Model File - alpha = blockIndex
  loadBlockInfo = () => {
    const interval = setInterval(() => {
    // const alpha = this.state.blockIndex;
    //  convert to imperials for display only
    // eslint-disable-next-line react/no-access-state-in-setstate
    const curBlock = this.state.blocks[this.state.blockIndex]; //  get the block selected
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
   
    this.state.blockOccupancy = curBlock.occupancy.toString();
    // console.log(this.state.blockOccupancy.toString());
    this.setState({
      beacon: curBlock.beacon,
    });
    //  check the status of the line name
    if(curBlock.line === "Green")
    {
      this.setState({enviornmentTemp : greenEVTemp});
      this.setState({trackHeaterStatus : greenTHStatus});
    }
    else if (curBlock.line === "Red")
    {
      this.setState({enviornmentTemp : redEVTemp});
      this.setState({trackHeaterStatus : redTHStatus});
    }
    this.setState({
      crossing: curBlock.crossing,
    });
    this.setState({
      TransitLightStatus: curBlock.transitLightStatus,
    });
    this.setState({
      peopleAtStation : curBlock.peopleAtStation
    });
    if(this.state.peopleAtStation === 'null')
    {
      this.setState({
        peopleEnteringTrain : 0,
        peopleLeavingTrain : 0,
      });
    }
    else
    {
      this.setState({
        peopleEnteringTrain : this.state.peopleAtStation,
        peopleLeavingTrain : this.state.peopleAtStation,
      });
    }
    
    this.setState({
      switchPos : curBlock.next,
    })
  }, 1000);
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

      //  check the trackLine and if green, update green, else if red, update red
      if(this.state.lineName === "Green")
      {
        greenSendingTrackCircuit = "disabled";
      }
      else{
        redSendingTrackCircuit = "disabled";
      }
    } else {
      this.setState({ sendingTrackCircuit: 'functional' });
      //  check the trackLine and if green, update green, else if red, update red
      if(this.state.lineName === "Green")
      {
        greenSendingTrackCircuit = "enabled";
      }
      else{
        redSendingTrackCircuit = "enabled";
      }
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
    this.setState({blockIndex : event.target.value});
    // this.state.blockIndex = event.target.value;
    // this.loadBlockInfo(event.target.value);
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
    //  check the status of the sendingCircuits
    if(trackLine === "Green"){
      if(greenSendingTrackCircuit === 'enabled')
      {
        window.electronAPI.sendTrainModelMessage({
          type: 'exitYard',
          // trainID: trainDispatchArr[]
          trainID,
          trackLine
        });
      }
    }
    else if(trackLine === "Red"){
      if(redSendingTrackCircuit === 'enabled')
      {
        window.electronAPI.sendTrainModelMessage({
          type: 'exitYard',
          // trainID: trainDispatchArr[]
          trainID,
          trackLine
        });
      }
    }
    
  };

  //  GETS TRIGGERED IN CONSTRUCTOR, CHECKS FOR TRACK FAILURES
  checkTrackFailures = () =>
  {
    const interval = setInterval(() => {
      let trainIDs = [];

      //  CHECK THE RED LINE
      if(redTrackPowerStatus === 'broken' || redTrackSignalPickup === 'broken' || redRailStatus === 'broken')
      {
        //  check if the red rail is broken
        if(redRailStatus === 'broken')
        {
          //  Track rail Status RedLine
          window.electronAPI.sendTrackControllerMessage({
            type: 'RedlineRailStatus',
            RailStatus: redRailStatus,
          });
        }
        
        //  check for the trains that need to stop
        for( let t = 0; t < trainDispatchArr.length; t++)
        {
          if(trainDispatchArr[t].trackLine === 'Red')
          {
            //  add the train IDs to be stopped
            trainIDs.push(trainDispatchArr[t].TrainID);
          }
        }
        //  send train model message to stop
        //  check if the circuit is sending
          if(redSendingTrackCircuit === "enabled")
          {
            window.electronAPI.sendTrainModelMessage({
              type: 'Stop',
              'trainIDArray' : trainIDs,
            });
          }
        //  after message is sent, clear the array
        trainIDs.length = 0;    //  fasted way to clear array; better performance
      }
      else if (redTrackPowerStatus === 'functional' && redTrackSignalPickup === 'functional' && redRailStatus === 'functional')
      {
        //  check for the trains that need to started
        for( let t = 0; t < trainDispatchArr.length; t++)
        {
          if(trainDispatchArr[t].trackLine === 'Red')
          {
            //  add the train IDs to be started
            trainIDs.push(trainDispatchArr[t].TrainID);
          }
        }

        //  check if the circuit is sending
          if(redSendingTrackCircuit === "enabled")
          {
            window.electronAPI.sendTrainModelMessage({
              type: 'Go',
              'trainIDArray' : trainIDs,
            });
          }
        //  after message is sent, clear the array
        trainIDs.length = 0;    //  fasted way to clear array; better performance
      }

      //  GREEN LINE
      if(greenTrackPowerStatus === 'broken' || greenTrackSignalPickup === 'broken' || greenRailStatus === 'broken')
      {
        if(greenRailStatus === 'broken')
        {
          //  Track rail Status GreenLine
          window.electronAPI.sendTrackControllerMessage({
            type: 'GreenlineRailStatus',
            RailStatus: greenRailStatus,
          });
        }

        //  check for the trains that need to stop
        for( let t = 0; t < trainDispatchArr.length; t++)
        {
          if(trainDispatchArr[t].trackLine === 'Green')
          {
            //  add the train IDs to be stopped
            trainIDs.push(trainDispatchArr[t].TrainID);
          }
        }

        //  check if the track circuit is sending
          if(greenSendingTrackCircuit === "enabled")
          {
            //  send train model message to stop
            window.electronAPI.sendTrainModelMessage({
              type: 'Stop',
              'trainIDArray' : trainIDs,
            });
          }
        //  after message is sent, clear the array
        trainIDs.length = 0;    //  fasted way to clear array; better performance
      }
      else if (greenTrackPowerStatus === 'functional' && greenTrackSignalPickup === 'functional' && greenRailStatus === 'functional')
      {
        //  check for the trains that need to started
        for( let t = 0; t < trainDispatchArr.length; t++)
        {
          if(trainDispatchArr[t].trackLine === 'Green')
          {
            //  add the train IDs to be started
            trainIDs.push(trainDispatchArr[t].TrainID);
          }
        }
        //  check if the track circuit is sending
          if(greenSendingTrackCircuit === "enabled")
          {
            //  send train model message to stop
            window.electronAPI.sendTrainModelMessage({
              type: 'Go',
              'trainIDArray' : trainIDs,
            });
          }
        //  after message is sent, clear the array
        trainIDs.length = 0;    //  fasted way to clear array; better performance
      }
    }, 1000);
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

    //  find the train ID to update
    const ind = trainDispatchArr.findIndex(
      (TrainID) => TrainID === TRAIN_ID
    );

    //  find the line that the train is on
    const trackLine = trainDispatchArr[ind].trackLine

    if(trackLine === 'Red')
    {
      blocks = redBlocks;
      currBlock = redCurrBlock;
    }
    else if(trackLine === 'Green')
    {
      blocks = greenLine;
      currBlock = greenCurrBlock;
    }

    //  expect a message from train that it is moving/entering a new block
    while (currBlock < blocks[blocks.length]) {
      //  check if the train is moving
      if (IS_TRAIN_MOVING) {
        //  occupy the current block
        blocks[currBlock].occupancy = true;

        //  send the track model a message about the blocks being updated
        //  Tracks block occupancy
        if(trackLine === 'Green' && greenSendingTrackCircuit === "enabled")
        {
          window.electronAPI.sendTrackControllerMessage({
            type: 'GreenBlockOccupancy',
            GreenBlocks: blocks,
          });
        }
        else if (trackLine === 'Red' && redSendingTrackCircuit === "enabled")
        {
          //  Tracks block occupancy
          window.electronAPI.sendTrackControllerMessage({
            type: 'RedBlockOccupancy',
            RedBlocks: blocks,
          });
        }
        
        if(trackLine === "Green" && greenSendingTrackCircuit === "enabled")
        {
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
        else if(trackLine === "Red" && redSendingTrackCircuit === "enabled")
        {
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
      }
      //  Train progresses to next block
      if (ENTERED_BLOCK) {
        //  update the next block
        currBlock++;
        //  check if the old block has been vacatted
        if (EXITED_BLOCK) {
          //  loop through blocks, first occupied block becomes unoccupied
          const searchInd = blocks.occupancy.indexOf.true;
          //  set occupancy to false
          blocks[searchInd].occupancy = false;
          //  send the track model a message about the blocks being updated
        //  Tracks block occupancy
          if(trackLine === 'Green' && greenSendingTrackCircuit === "enabled")
          {
            window.electronAPI.sendTrackControllerMessage({
              type: 'GreenBlockOccupancy',
              GreenBlocks: blocks,
            });
          }
          else if(trackLine === 'Red' && greenSendingTrackCircuit === "enabled")
          {
            //  Tracks block occupancy
            window.electronAPI.sendTrackControllerMessage({
              type: 'RedBlockOccupancy',
              RedBlocks: blocks,
            });
          }
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
    // this.state.lineName = lineName;
    this.state.enviornmentTemp = enviornmentTemp;
    this.state.trackHeaterStatus = trackHeaterStatus;
    this.state.trainOccupancy = trainOccupancy;
    // this.state.personsAtStation = personsAtStation;
    // this.state.currBlock = currBlock;
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
            <Grid item xs={12} justifySelf="center">
              <div className="HeaderText">Test UI</div>
            </Grid>
            <Grid item xs={6}>
              <div> People at stations</div>
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
                  <div className="label">Next Block</div>
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
                  <div className="label">{this.state.blockOccupancy}</div>
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
                  <div className="label">{this.state.peopleAtStation}</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">Railroad Crossing</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">{String(this.state.crossing)}</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">People At Station</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">{this.state.peopleAtStation}</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">People leaving train</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">{this.state.peopleLeavingTrain}</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">People entering train</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">{this.state.peopleEnteringTrain}</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">Beacon</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">{this.state.beacon}</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">TransitLightStatus</div>
                </Grid>
                <Grid item xs={6}>
                  <div className="label">{this.state.TransitLightStatus}</div>
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
