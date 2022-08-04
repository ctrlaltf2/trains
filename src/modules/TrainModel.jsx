import { type } from 'os';
import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import {
  ButtonGroup,
  Button,
  Label,
  FormLabel,
  Typography,
  FormGroup,
  FormControlLabel,
  Switch,
  Stack,
  AppBar,
  Toolbar,
  TextField,
  Input,
  useEventCallback,
} from '@mui/material';
import { createTheme } from '@mui/material/styles';
import SelectInput from '@mui/material/Select/SelectInput';
import { FlashOnRounded } from '@mui/icons-material';

const theme = createTheme({
  palette: {
    primary: {
      light: '#757ce8',
      main: '#3f50b5',
      dark: '#002884',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff7961',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#000',
    },
  },
});

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'left',
  color: theme.palette.text.secondary,
}));

const BoxLabel = styled(FormLabel)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.subtitle1,
  padding: theme.spacing(1),
  textAlign: 'left',
  color: theme.palette.text.primary,
}));

class TrainModel extends React.Component {
  constructor(props, name) {
    super(props);
    this.name = name;

    window.electronAPI.subscribeTrainModelMessage((_event, payload) => {
      // Filter out power messages
      switch(payload.type) {
        case 'power':
          break;
        default:
          console.log('IPC:TrainModel: ', payload);
      }

      switch(payload.type) {

        case 'Stop':
          this.pointlessVariable = payload.trainIDArray[0];
          this.emergencyBrake = true;
          console.log('Need to stop the train on the line');
        break;
        case 'Go':
          this.pointlessVariable = payload.trainIDArray[0];
          this.emergencyBrake = false;
          console.log('Let the train on the line run again');
        break;

        case 'CurrentCommandedSpeed':
          this.commandedSpeed = payload.CommandedSpeed; // MUST MERGE FIRST TO GET NEW CODE FROM CALEB
          window.electronAPI.sendTrainControllerMessage({
            'type': 'currentCommandedSpeed',
            'currentCommandedSpeed': this.commandedSpeed ,
          });
        break;

        case 'CurrentBlockLength':
          this.trainID = payload.TrainID;
          this.currBlockLength = payload.CurrentBlockLength;
        break;

        case 'NextBlockLength':
          this.trainID = payload.TrainID;
          this.nextBlockLengthSignal = payload.NextBlockLength;
        break;

        case 'Beacon':
          this.trainID = payload.TrainID;
          this.beacon = payload.Beacon;
          console.log('Beacon: ', this.beacon);
          window.electronAPI.sendTrainControllerMessage({
            'type': 'beacon',
            'beacon': this.beacon ,
          });
        break;

        case 'Underground':
          this.trainID = payload.TrainID;
          this.underground = payload.Underground;
          window.electronAPI.sendTrainControllerMessage({
            'type': 'underground',
            'underground': this.underground ,
          });
        break;

        case 'Grade':
          this.trainID = payload.TrainID;
          this.grade = payload.Grade;
        break;

        case 'suggestedSpeed':
          this.block_ID = payload.block_ID;
          this.suggestedSpeed = payload.suggestedSpeed;
          console.log('Suggested Speed is ', this.suggestedSpeed);
          console.log('for block  ', this.block_ID);
        break;


        // CHECK WITH CAM
        case 'Authority':
          this.trainID = payload.TrainID;
          this.authority = payload.Authority;
          window.electronAPI.sendTrainControllerMessage({
            'type': 'authority',
            'authority': this.authority ,
          });
        break;


        // FROM TRAIN CONTROLLER
        case 'temperature':
          this.setState({ temperature: payload.temperature });
          break;
        case 'serviceBrake':
          this.setState({serviceBrake: payload.serviceBrake});
          break;
        case 'emergencyBrake':
          this.setState({emergencyBrake: payload.emergencyBrake});
          break;
        case 'power':
          this.powerCommand = payload.power;
          break;
        case 'leftDoor':
          this.setState({leftDoors: payload.leftDoor});
          break;
        case 'rightDoor':
          this.setState({rightDoors: payload.rightDoor});
          break;
        case 'trainLights':
          // this.setState({exteriorTrainLights: payload.trainLights});
          this.toggleExteriorTrainLights();
          break;
        case 'cabinLights':
          // this.setState({interiorTrainLights: payload.cabinLights});
          this.toggleInteriorTrainLights();
          break;
        default:
          console.warn('Unknown payload type received: ', payload.type);
      }
    });




    this.state = {
      trainEngineStatus: true,
      signalPickupStatus: true,
      brakeStatus: true,
      testSystem: false,
      emergencyBrake: false,
      beaconReceived: true,
      beacon: '',
      internalTemp: 70,
      temperature: 80, // for testing
      crewCount: 2,
      passengerCount: 0,
      exteriorTrainLights: true,
      interiorTrainLights: true,
      leftDoors: false,
      rightDoors: false,
      numCars: 2, // max # is 5
      carLength: 105.6,
      length: 0,
      height: 11.2,
      width: 8.7,
      totalMass: 0,
      carMass: 40.9, // units: tons
      personMass: 0.088, // units: tons
      currentSpeed: 20, // units: m/s
      authority: 25,
      commandedSpeed: 0, // block speed limit, units: km/hr
      suggestedSpeed: 0, // from CTC, units: km/hr
      T: 1000,
      maintenenceMode: 0,
      serviceBrake: false,
      underground: false,
      grade: 0,
      currentSpeedMPH: 0,

      // UI VARIABLES
      currentSpeedUI: 0,
      powerCommandUI: 0,
      positionUI: 0,
      accelerationUI: 0,
      forceUI: 0,
      positionUI: 0,
      totalMassUI: 0,
      positionInBlockUI: 0,
      intermediatePositionUI: 0,
      caboosePositionInBlockUI: 0,
      passengerUI: false,

    };

    this.power = 0;
    this.acceleration = 0; // units: mss
    this.powerCommand = 50; // units: kw
    this.setSpeed = 40; // units: km/hr
    this.force = 0; // units: N
    this.position = 0;
    this.currentSpeed = 10; // m/s
    this.totalMass = 0;
    this.intermediatePosition = 0;
    this.currBlockLength = 100;
    this.prevBlockLength = 100;
    this.nextBlockLength = 150;
    this.positionInBlock = 0;
    this.exitedBlock = false;
    this.enteredNewBlock = false;
    this.caboosePositionInBlock = 0;
    this.isTrainMoving = true;  // will likely need to be set to false later
    this.accelerationLimit = 0.5;
    this.serviceDecelLimit = -1.2;
    this.eDecelLimit = -2.73;
    this.nextBlockLengthSignal = 0;
    this.block_ID = 0;
    this.pointlessVariable = 0;
    this.trainID = 0;
    this.brakeStatusTest = true;
    this.trainEngineStatusTest = true;
    this.signalPickupStatusTest = true;
    this.emergencyBrakeTest = false;

    // bind funcs on change
    this.toggle = this.toggle.bind(this);
    this.toggleTrainEngineStatus = this.toggleTrainEngineStatus.bind(this);
    this.toggleBrakeStatus = this.toggleBrakeStatus.bind(this);
    this.toggleSignalPickupStatus = this.toggleSignalPickupStatus.bind(this);
    this.toggleExteriorTrainLights = this.toggleExteriorTrainLights.bind(this);
    this.toggleInteriorTrainLights = this.toggleInteriorTrainLights.bind(this);
    this.toggleRightDoors = this.toggleRightDoors.bind(this);
    this.toggleLeftDoors = this.toggleLeftDoors.bind(this);
    this.resetAll = this.resetAll.bind(this);
    this.handlePowerCommandChange = this.handlePowerCommandChange.bind(this);
    this.handleTemperatureChange = this.handleTemperatureChange.bind(this);
    this.toggleEmergencyBrake = this.toggleEmergencyBrake.bind(this);
    this.togglePassengerUI = this.togglePassengerUI.bind(this);

    // timer
    this.previous_time = 0;

    window.electronAPI.subscribeTimerMessage((_event, payload) => {
      const time_elapsed_ms = payload.timestamp - this.previous_time;
      console.log(time_elapsed_ms);

      // ...
      // Do some physics updates shit here w/ elapsed time
      // this.calculate();
      // ...

      this.previous_time = payload.timestamp;

    })

  };


  // update all info my calling functions
  componentDidMount() {
    setInterval(() => {
      this.setState({forceUI: this.force});
      this.setState({accelerationUI: this.acceleration});
      this.setState({currentSpeedUI: this.currentSpeed});
      this.setState({positionUI: this.position});
      this.setState({powerCommandUI: this.powerCommand});
      this.setState({totalMassUI: this.totalMass});
      this.setState({intermediatePositionUI: this.intermediatePosition});
      this.setState({positionInBlockUI: this.positionInBlock});
      this.setState({caboosePositionInBlockUI: this.caboosePositionInBlock});

      this.calculateLength();
      this.calculateMass();
      this.changeTemp();
      this.convertToMPH();
      this.calculate();
      this.determineBlockOccupancy();
      this.sendAuthority();
    }, 1000); // update every second
  }

  // test UI powerCommand
  handlePowerCommandChange(event) {
    this.powerCommand = event.target.value;
  }

  // test UI temperature
  handleTemperatureChange(event) {
    this.setState({ temperature: event.target.value });
  }

  // instantiate new train
  /* dispatchTrain() {

    // define a new train
    const newTrain = new TrainModel();
    newTrain.trainID = 0;

    // ...

    trains[newTrain.trainID] = newTrain;
  } */

  // convert to mph, multiply by 2.23694
  convertToMPH() {
    this.setState({ currentSpeedMPH: this.state.currentSpeedUI * 2.23694});
  }

  // convert to km/hr, multiply by 3.6
  convertToKMH() {
    this.currentSpeedKMH = this.currentSpeed * 3.6;
  }

  // calculate
  calculate() {
    // calculate force
    // this.setState( prevState => ({ force: this.powerCommand * 1000 / this.currentSpeed })); // conversion of kW to W
    this.force = this.powerCommand * 1000 / this.currentSpeed;


    // if acceleration is above accelerationLimit
    if(this.acceleration > this.accelerationLimit && !this.state.emergencyBrake && !this.state.serviceBrake) {
      this.acceleration = this.state.accelerationLimit;
    }

    // if serviceBrake is true
    else if(!this.state.emergencyBrake && this.state.serviceBrake) {
      this.acceleration = this.serviceDecelLimit;
    }

    // if eBrake is true
    else if(this.state.emergencyBrake && !this.state.serviceBrake) {
      this.acceleration = this.eDecelLimit;
    }

    // if serviceBrake and eBrake is true, cancel out serviceBrake
    else if(this.state.emergencyBrake && this.state.serviceBrake) {
      this.acceleration = this.eDecelLimit;
    }

    else {
      // calculate acceleration Acceleration Limit: 0.5 m/s^2     Deceleration Limit(service brake): -1.2 m/s^2    Deceleration Limit(e brake): -2.73 m/s^2
      this.acceleration = this.force / (this.totalMass * 907.185); // conversion of tons to kg
    }

    // calculate velocity, replace 0.1 with this.T
    if(this.currentSpeed < 0) {
      this.currentSpeed = 0;
      this.acceleration = 0;
      this.powerCommand = 0;
    }
    if(this.currentSpeed > (this.setSpeed * 0.277778)) { // convert set speed to m/s
      this.currentSpeed = (this.setSpeed * 0.277778);
      this.acceleration = 0;
      this.powerCommand = 0;
    }
    else this.currentSpeed = this.currentSpeed + (0.5 / 2) * (this.acceleration + this.acceleration);


    this.convertToKMH();
    // Send signal pickup failure to train controller
    window.electronAPI.sendTrainControllerMessage({
      'type': 'currentSpeed',
      'currentSpeed': this.currentSpeedKMH,
    });


    if(this.position === 0) this.caboosePositionInBlock -= this.state.length;

    // calculate position, replace 0.1 with this.T
    this.intermediatePosition = this.currentSpeed * 0.5;
    this.position += this.intermediatePosition;

    if(this.currentSpeed > 0) {
      // Send isTrainMoving to track model
    window.electronAPI.sendTrackModelMessage({
      'type': 'isTrainMoving',
      'isTrainMoving': this.isTrainMoving,
    });
    }
  }

  // determine block occupancy
  determineBlockOccupancy() {

    if(this.positionInBlock >= this.currBlockLength) {
      this.positionInBlock -= this.currBlockLength;
      this.prevBlockLength = this.currBlockLength;
      this.currBlockLength = this.nextBlockLength;
      // need next block here too to set next block length
      // this.nextBlockLength = this.nextBlockLengthSignal;
      this.enteredNewBlock = true;
    }
    else this.enteredNewBlock = false;

    if(this.caboosePositionInBlock >= this.prevBlockLength) {
      this.caboosePositionInBlock -= this.prevBlockLength;
      this.exitedBlock = true;
    }
    else this.exitedBlock = false;

    this.positionInBlock += this.intermediatePosition;
    this.caboosePositionInBlock += this.intermediatePosition;

    // Send enteredNewBlock to track model
    window.electronAPI.sendTrackModelMessage({
      'type': 'enteredNewBlock',
      'enteredNewBlock': this.enteredNewBlock,
    });

    // Send exitedBlock to track model
    window.electronAPI.sendTrackModelMessage({
      'type': 'exitedBlock',
      'exitedBlock': this.exitedBlock,
    });
  }

  // update temp at interval
  updateTemp() {
    const interval = setInterval(() => {
      if (this.state.internalTemp !== this.state.temperature) {
        this.changeTemp();
        clearInterval(interval);
      }
    }, 5000); // update every second
  }

  // change temperature
  changeTemp() {
    setTimeout(() => {
      if (this.state.internalTemp < this.state.temperature) {
        this.setState((prevState) => ({
          internalTemp: prevState.internalTemp + 1,
        }));
      } else if (this.state.internalTemp > this.state.temperature) {
        this.setState((prevState) => ({
          internalTemp: prevState.internalTemp - 1,
        }));
      }
    }, 5000);
  }

  // length of train
  calculateLength() {
    this.setState((prevState) => ({
      length: prevState.carLength * prevState.numCars,
    }));
  }

  // calculate mass
  calculateMass() {
      this.totalMass =
        this.state.numCars * this.state.carMass +
        this.state.passengerCount * this.state.personMass +
        this.state.crewCount * this.state.personMass;
  }

  // send train controller authority
  sendAuthority() {
    window.electronAPI.sendTrainControllerMessage({
      'type': 'authority',
      'authority': this.state.authority,
    });
  }

  // toggle functions including failure and brake statuses, and test UI
  toggleTrainEngineStatus() {
    this.setState((prevState) => ({
      trainEngineStatus: !prevState.trainEngineStatus,
    }));

    this.trainEngineStatusTest = !this.trainEngineStatusTest;

    // Send engine failure to train controller
    window.electronAPI.sendTrainControllerMessage({
      'type': 'engineFailure',
      'engineFailure': this.state.trainEngineStatus,
    });
  }

  toggleBrakeStatus() {
    this.setState((prevState) => ({
      brakeStatus: !prevState.brakeStatus,
    }));

    this.brakeStatusTest = !this.brakeStatusTest;

    // Send brake failure to train controller
    window.electronAPI.sendTrainControllerMessage({
      'type': 'brakeFailure',
      'brakeFailure': this.state.brakeStatus,
    });
  }

  toggleSignalPickupStatus() {
    this.setState((prevState) => ({
      signalPickupStatus: !prevState.signalPickupStatus,
    }));

    this.signalPickupStatusTest = !this.signalPickupStatusTest;

    // Send signal pickup failure to train controller
    window.electronAPI.sendTrainControllerMessage({
      'type': 'signalPickupFailure',
      'signalPickupFailure': this.state.signalPickupStatus,
    });

    // Send signal pickup failure to track model
    window.electronAPI.sendTrackModelMessage({
      'type': 'signalPickupFailure',
      'signalPickupFailure': this.state.signalPickupStatus,
    });
  }

  toggleEmergencyBrake() {
    this.setState((prevState) => ({
      emergencyBrake: !prevState.emergencyBrake,
    }));

    this.emergencyBrakeTest = !this.emergencyBrakeTest;

    // Send brake failure to train controller
    window.electronAPI.sendTrainControllerMessage({
      'type': 'emergencyBrake',
      'emergencyBrake': this.state.emergencyBrake,
    });
  }

  resetAll() {

    this.setState({trainEngineStatus: true, brakeStatus: true, signalPickupStatus: true});
    this.signalPickupStatusTest = true;
    this.trainEngineStatusTest = true;
    this.brakeStatusTest = true;

    // Send engine failure to train controller
    window.electronAPI.sendTrainControllerMessage({
      'type': 'engineFailure',
      'engineFailure': this.state.trainEngineStatus,
    });

    // Send brake failure to train controller
    window.electronAPI.sendTrainControllerMessage({
      'type': 'brakeFailure',
      'brakeFailure': this.state.brakeStatus,
    });

    // Send signal pickup failure to train controller
    window.electronAPI.sendTrainControllerMessage({
      'type': 'signalPickupFailure',
      'signalPickupFailure': this.state.signalPickupStatus,
    });

    // Send signal pickup failure to train controller
    window.electronAPI.sendTrackModelMessage({
      'type': 'signalPickupFailure',
      'signalPickupFailure': this.state.signalPickupStatus,
    });
  }

  toggleInteriorTrainLights() {
    this.setState((prevState) => ({
      interiorTrainLights: !prevState.interiorTrainLights,
    }));
  }

  toggleExteriorTrainLights() {
    this.setState((prevState) => ({
      exteriorTrainLights: !prevState.exteriorTrainLights,
    }));
  }

  toggleRightDoors() {
    this.setState((prevState) => ({
      rightDoors: !prevState.rightDoors,
    }));
  }

  toggleLeftDoors() {
    this.setState((prevState) => ({
      leftDoors: !prevState.leftDoors,
    }));
  }

  toggle() {
    this.setState((prevState) => ({
      testSystem: !prevState.testSystem,
    }));
  }

  togglePassengerUI() {
    this.setState((prevState) => ({
      passengerUI: !prevState.passengerUI,
    }));
  }

  testUI() {
    return (
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Item>
            Power Command:
            <Input
              defaultValue="kW"
              type="number"
              onChange={this.handlePowerCommandChange}
            />
            kW
          </Item>
        </Grid>

        <Grid item xs={6}>
          <Item>
            Set Temperature:
            <Input
              defaultValue="F"
              type="number"
              onChange={this.handleTemperatureChange}
            />
            F
          </Item>
        </Grid>

        <Grid item xs={6}>
          <Item>
            Force: {this.state.forceUI.toFixed(0)} N
          </Item>
        </Grid>

        <Grid item xs={6}>
          <Item>
            Acceleration: {this.state.accelerationUI.toFixed(4)} m/s/s
          </Item>
        </Grid>

        <Grid item xs={6}>
          <Item>
            Current Speed: {this.state.currentSpeedUI.toFixed(2)} m/s
          </Item>
        </Grid>

        <Grid item xs={6}>
          <Item>
            Current Speed: {this.state.currentSpeedMPH.toFixed(2)} mph
          </Item>
        </Grid>

        <Grid item xs={6}>
          <Item>
            Position: {this.state.positionUI.toFixed(1)} m
          </Item>
        </Grid>

        <Grid item xs={6}>
          <Item>
            Intermediate Position: {this.state.intermediatePositionUI.toFixed(1)} m
          </Item>
        </Grid>

        <Grid item xs={6}>
          <Item>
            Position in Block: {this.state.positionInBlockUI.toFixed(1)} m
          </Item>
        </Grid>

        <Grid item xs={6}>
          <Item>
            Caboose Position in Block: {this.state.caboosePositionInBlockUI.toFixed(1)} m
          </Item>
        </Grid>

        <Grid item xs={6}>
          <Item>
            Entered New Block: {this.enteredNewBlock ? (<Item> true </Item>) : (<Item> false </Item>)}
          </Item>
        </Grid>

        <Grid item xs={6}>
          <Item>
            Exited Block: {this.exitedBlock ? (<Item> true </Item>) : (<Item> false </Item>)}
          </Item>
        </Grid>

        <Grid button xs={6} sx={{ mt: 2 }}>
          <Button variant="contained" onClick={this.toggle}>
            Train Model
          </Button>
        </Grid>
      </Grid>
    );
  }

    // passenger UI
    renderPassengerUI() {
      return (
         <Grid container spacing={2}>
            <Grid item xs={6}>
              <Item>
              {this.state.emergencyBrake ? (
                      <Button
                        sx={{ fontSize: 14, fontWeight: 'bold' }}
                        variant="contained"
                        color="error"
                        onClick={this.toggleEmergencyBrake}
                      >
                        Emergency Brake
                      </Button>
                    ) : (
                      <Button
                        sx={{ fontSize: 14, fontWeight: 'bold' }}
                        variant="contained"
                        color="inherit"
                        onClick={this.toggleEmergencyBrake}
                      >
                        Emergency Brake
                      </Button>
                    )}
              </Item>
            </Grid>

            <Grid button xs={6} sx={{ mt: 2 }}>
              <Button variant="contained" onClick={this.togglePassengerUI}>
                Train Model
              </Button>
            </Grid>
          </Grid>
      );
     }


    render() {
      if (this.state.testSystem) return this.testUI();
      if (this.state.passengerUI) return this.renderPassengerUI();

      this.updateTemp();


      // the "0.621371" means converting km/hr --> mph

      return (
        <Grid>
          <Grid container spacing={2}>
            <Grid item2 xs={12}>
              <BoxLabel sx={{ mx: 2, my: 0 }}>Train Information</BoxLabel>
            </Grid>

            <Grid item xs={12} container sx={{ border: 1, mx: 3, p: 2 }}>
              <Grid item xs={4}>
                <Item sx={{ m: 2 }}>
                  Current Speed: {(this.state.currentSpeedMPH).toFixed(2)} mph
                </Item>
              </Grid>
              <Grid item xs={4}>
                <Item sx={{ m: 2 }}>
                  Power Command: {this.state.powerCommandUI} kW
                </Item>
              </Grid>
              <Grid item xs={4}>
                <Item sx={{ m: 2 }}>
                  Train Acceleration: {(this.state.accelerationUI * 3.28084).toFixed(3)} ft/s/s
                </Item>
              </Grid>

              <Grid item xs={4}>
                {this.state.emergencyBrake ? (
                  <Item sx={{ m: 2 }} style={{ backgroundColor: 'yellow' }}>
                    Emergency Brake: Enabled
                  </Item>
                ) : (
                  <Item sx={{ m: 2 }}>Emergency Brake: Disabled</Item>
                )}
              </Grid>

              <Grid item xs={4}>
                {this.state.brakeStatus ? (
                  <Item sx={{ m: 2 }}>Brake Status: Working</Item>
                ) : (
                  <Item sx={{ m: 2 }} style={{ backgroundColor: 'yellow' }}>
                    Brake Status: Failing
                  </Item>
                )}
              </Grid>
              <Grid item xs={4}>
                {this.state.trainEngineStatus ? (
                  <Item sx={{ m: 2 }}>Train Engine Status: Working</Item>
                ) : (
                  <Item sx={{ m: 2 }} style={{ backgroundColor: 'yellow' }}>
                    Train Engine Status: Failing
                  </Item>
                )}
              </Grid>

              <Grid item xs={4}>
                {this.state.signalPickupStatus ? (
                  <Item sx={{ m: 2 }}>Signal Pickup Status: Working</Item>
                ) : (
                  <Item sx={{ m: 2 }} style={{ backgroundColor: 'yellow' }}>
                    Signal Pickup Status: Failing
                  </Item>
                )}
              </Grid>
              <Grid item xs={4}>
                <Item sx={{ m: 2 }}>Authority: {this.state.authority} blocks</Item>
              </Grid>
              <Grid item xs={4}>
                {this.state.beaconReceived ? (
                  <Item sx={{ m: 2 }}>Beacon: Received</Item>
                ) : (
                  <Item sx={{ m: 2 }} style={{ backgroundColor: 'yellow' }}>
                    Beacon: Not Received
                  </Item>
                )
                }
              </Grid>

              <Grid item xs={6}>
                { this.state.serviceBrake ?
                    ( <Item sx={{ m: 2 }} style={{ backgroundColor: 'yellow'}}>
                      Service Brake: Enabled
                    </Item>
                    ) : (
                      <Item sx={{ m: 2 }}>
                        Service Brake: Disabled
                      </Item>
                    )
                }
              </Grid>
              <Grid item xs={6}>
                <Item sx={{ m: 2 }}>Speed Limit: {(this.state.commandedSpeed * 0.621371).toFixed(2)} mph</Item>
              </Grid>
            </Grid>

            <Grid item2 xs={12}>
              <BoxLabel sx={{ mx: 2, my: 0 }}>Other Information</BoxLabel>
            </Grid>

            <Grid item xs={12} container sx={{ border: 1, mx: 3, p: 2 }}>
              <Grid item xs={4}>
                <Item sx={{ m: 2 }}>
                  Internal Temperature: {this.state.internalTemp} F
                </Item>
              </Grid>
              <Grid item xs={4}>
                <Item sx={{ m: 2 }}>Crew Count: {this.state.crewCount}</Item>
              </Grid>
              <Grid item xs={4}>
                <Item sx={{ m: 2 }}>
                  Passenger Count: {this.state.passengerCount}
                </Item>
              </Grid>

              <Grid item xs={4}>
                <Item sx={{ m: 2 }}>
                  Exterior Train Lights: {this.state.exteriorTrainLights ? 'On' : 'Off'}
                </Item>
              </Grid>
              <Grid item xs={4}>
                <Item sx={{ m: 2 }}>
                  Interior Train Lights: {this.state.interiorTrainLights ? 'On' : 'Off'}
                </Item>
              </Grid>
              <Grid item xs={4}>
                <Item sx={{ m: 2 }}>
                  Left Train Doors: {this.state.leftDoors ? 'Open' : 'Closed'}
                </Item>
              </Grid>

              <Grid item xs={4}>
                <Item sx={{ m: 2 }}>
                  Right Train Doors: {this.state.rightDoors ? 'Open' : 'Closed'}
                </Item>
              </Grid>
              <Grid item xs={4}>
                <Item sx={{ m: 2 }}>
                  {' '}
                  Train Length: {this.state.length.toFixed(1)} ft
                </Item>
              </Grid>
              <Grid item xs={4}>
                <Item sx={{ m: 2 }}>
                  Train Height: {this.state.height.toFixed(1)} ft
                </Item>
              </Grid>

              <Grid item xs={4}>
                <Item sx={{ m: 2 }}>
                  Train Width: {this.state.width.toFixed(1)} ft
                </Item>
              </Grid>
              <Grid item xs={4}>
                <Item sx={{ m: 2 }}>
                  Train Mass: {this.state.totalMassUI.toFixed(1)} tons
                </Item>
              </Grid>
              <Grid item xs={4}>
                <Item sx={{ m: 2 }}>Train Cars: {this.state.numCars} </Item>
              </Grid>
            </Grid>

            <Grid item2 xs={12}>
              <BoxLabel sx={{ mx: 2, my: 0 }}>System Status</BoxLabel>
            </Grid>

            <Grid item xs={12} container sx={{ border: 1, mx: 3, p: 2 }}>
              <Grid item xs={3}>
                <Item sx={{ margin: 1 }}>
                  {this.state.trainEngineStatus ? (
                    <Button
                      sx={{ fontSize: 14, fontWeight: 'bold' }}
                      variant="contained"
                      color="error"
                      onClick={this.toggleTrainEngineStatus}
                    >
                      Break Train Engine
                    </Button>
                  ) : (
                    <Button
                      sx={{ fontSize: 14, fontWeight: 'bold' }}
                      variant="contained"
                      color="inherit"
                    >
                      Break Train Engine
                    </Button>
                  )}
                </Item>
              </Grid>
              <Grid item xs={3}>
                <Item sx={{ margin: 1 }}>
                  {this.state.trainEngineStatus ? (
                    <Button
                      sx={{ fontSize: 14, fontWeight: 'bold' }}
                      variant="contained"
                      color="inherit"
                    >
                      Reset Train Engine
                    </Button>
                  ) : (
                    <Button
                      sx={{ fontSize: 14, fontWeight: 'bold' }}
                      variant="contained"
                      color="inherit"
                      onClick={this.toggleTrainEngineStatus}
                    >
                      Reset Train Engine
                    </Button>
                  )}
                </Item>
              </Grid>

              <Grid item xs={3}>
                <Item sx={{ margin: 1 }}>
                  {this.state.brakeStatus ? (
                    <Button
                      sx={{ fontSize: 14, fontWeight: 'bold' }}
                      variant="contained"
                      color="error"
                      onClick={this.toggleBrakeStatus}
                    >
                      Break Brakes
                    </Button>
                  ) : (
                    <Button
                      sx={{ fontSize: 14, fontWeight: 'bold' }}
                      variant="contained"
                      color="inherit"
                    >
                      Break Brakes
                    </Button>
                  )}
                </Item>
              </Grid>
              <Grid item xs={3}>
                <Item sx={{ margin: 1 }}>
                  {this.state.brakeStatus ? (
                    <Button
                      sx={{ fontSize: 14, fontWeight: 'bold' }}
                      variant="contained"
                      color="inherit"
                    >
                      Reset Brakes
                    </Button>
                  ) : (
                    <Button
                      sx={{ fontSize: 14, fontWeight: 'bold' }}
                      variant="contained"
                      color="inherit"
                      onClick={this.toggleBrakeStatus}
                    >
                      Reset Brakes
                    </Button>
                  )}
                </Item>
              </Grid>

              <Grid item xs={3}>
                <Item sx={{ margin: 1 }}>
                  {this.state.signalPickupStatus ? (
                    <Button
                      sx={{ fontSize: 14, fontWeight: 'bold' }}
                      variant="contained"
                      color="error"
                      onClick={this.toggleSignalPickupStatus}
                    >
                      Break Signal Pickup
                    </Button>
                  ) : (
                    <Button
                      sx={{ fontSize: 14, fontWeight: 'bold' }}
                      variant="contained"
                      color="inherit"
                    >
                      Break Signal Pickup
                    </Button>
                  )}
                </Item>
              </Grid>
              <Grid item xs={3}>
                <Item sx={{ margin: 1 }}>
                  {this.state.signalPickupStatus ? (
                    <Button
                      sx={{ fontSize: 14, fontWeight: 'bold' }}
                      variant="contained"
                      color="inherit"
                    >
                      Reset Signal Pickup
                    </Button>
                  ) : (
                    <Button
                      sx={{ fontSize: 14, fontWeight: 'bold' }}
                      variant="contained"
                      color="inherit"
                      onClick={this.toggleSignalPickupStatus}
                    >
                      Reset Signal Pickup
                    </Button>
                  )}
                </Item>
              </Grid>

              <Grid item xs={2}>
                <Item sx={{ margin: 1 }}>
                  <Button
                    sx={{ fontSize: 14, fontWeight: 'bold' }}
                    variant="contained"
                    color="success"
                    onClick={this.resetAll}
                  >
                    Reset All
                  </Button>
                </Item>
              </Grid>

              <Grid item xs={2}>
                <Item sx={{ margin: 1 }}>
                  <Button
                    sx={{ fontSize: 14, fontWeight: 'bold', margin: 0 }}
                    variant="contained"
                    color="primary"
                    onClick={this.toggle}
                  >
                    Test System
                  </Button>
                </Item>
              </Grid>

              <Grid item xs={2}>
                <Item sx={{ margin: 1 }}>
                  <Button
                    sx={{ fontSize: 14, fontWeight: 'bold', margin: 0 }}
                    variant="contained"
                    color="primary"
                    onClick={this.togglePassengerUI}
                  >
                    Passenger UI
                  </Button>
                </Item>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      );
    }
  }

  export default TrainModel;
