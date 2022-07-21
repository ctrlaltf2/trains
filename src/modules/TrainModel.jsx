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
      console.log('IPC:TrainModel: ', payload);

      switch (payload.type) {
        case 'commandedSpeed':
          // attribute: value
          this.setState({ commandedSpeed: payload.commandedSpeed });
          break;
        case 'authority':
          this.setState({ authority: payload.authority });
          break;
        case 'currentSpeed':
          this.setState({ currentSpeed: payload.currentSpeed });
          break;
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
          this.setState({powerCommand: payload.power});
          break;
        case 'leftDoor':
          this.setState({leftDoors: payload.leftDoor});
          break;
        case 'rightDoor':
          this.setState({rightDoors: payload.rightDoor});
          break;
        case 'trainLights':
          this.setState({exteriorTrainLights: payload.trainLights});
          break;
        case 'cabinLights':
          this.setState({interiorTrainLights: payload.cabinLights});
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
      crewCount: 0,
      passengerCount: 0,
      exteriorTrainLights: true,
      interiorTrainLights: true,
      leftDoors: false,
      rightDoors: false,
      numCars: 2,
      // mToFt: 3.281
      carLength: 105.6,
      length: 0,
      height: 11.2,
      width: 8.7,
      totalMass: 0,
      carMass: 40.9, // tons
      personMass: 0.088, // tons
      // kgToTons: 0.00110231
      currentSpeed: 17.8816, // ms
      authority: 0,
      commandedSpeed: 0, // block speed limit
      suggestedSpeed: 0, // from CTC
      power: 0,
      acceleration: 0, // mss
      powerCommand: 100, // kw
      setSpeed: 50,
      force: 0,
      T: 2000,
      maintenenceMode: 0,
      serviceBrake: false,

      /*
      currentSpeed: 0,
      acceleration: 0,
      beacon: true,
      accelerationLimit: 0,
      decelerationLimit: 0,
      commandedSpeed: 0,
      internalTemp: 70,
      crewCount: 0,
      passengerCount: 0,
      exteriorTrainLights: false,
      interiorTrainLights: true,
      rightDoors: false,
      leftDoors: false,
      tramLength: 32.2m,
      totalLength: 0m,
      height: 3.42m,
      width: 2.65m,
      totalMass: 0 tons,
      trainTramMass: 40.9 tons,
      numTrams: 1,
      passengerMass: 80,
      positionFt: 0 in ft,
      posotionBlock: 0 in blocks,
      maxPassengersPerTram: 148,

      */
    };

    // Toggling buttons
    this.toggle = this.toggle.bind(this);
    this.toggleTrainEngineStatus = this.toggleTrainEngineStatus.bind(this);
    this.toggleBrakeStatus = this.toggleBrakeStatus.bind(this);
    this.toggleSignalPickupStatus = this.toggleSignalPickupStatus.bind(this);
    this.resetAll = this.resetAll.bind(this);
    this.handlePowerCommandChange = this.handlePowerCommandChange.bind(this);

    this.previous_time = 0;

    window.electronAPI.subscribeTimerMessage((_event, payload) => {
      const time_elapsed_ms = payload.timestamp - this.previous_time;
      console.log(time_elapsed_ms);

      // ...
      // Do some physics updates shit here w/ elapsed time

      // ...

      this.previous_time = payload.timestamp;

    })

  };


  // update all info my calling functions
  componentDidMount() {
    setInterval(() => {
      this.calculateLength();
      this.calculateMass();
      this.changeTemp();

      // this.calculate();
    }, 1000); // update every second
  }

  // test UI powerCommand
  handlePowerCommandChange(event) {
    this.setState({ powerCommand: event.target.value });
  }

  // calculate
  /* calculate() {
    // calculate force
    this.setState(prevState => ({force: prevState.powerCommand * 1000 / prevState.currentSpeed}));  // conversion of kW to W


    // calculate acceleration Acceleration Limit: 0.5 m/s^2     Deceleration Limit(service brake): -1.2 m/s^2    Deceleration Limit(e brake): -2.73 m/s^2
    this.setState(prevState => ({acceleration: this.state.force / (prevState.totalMass * 907.185)})); // conversion of tons to kg

    // if acceleration is above accelerationLimit
    if(this.state.acceleration > this.state.accelerationLimit && !this.state.emergencyBrake && !this.state.serviceBrake) {
      this.setState(prevState => ({acceleration: this.state.accelerationLimit}));
    }

    // if serviceBrake is true
    if(!this.state.emergencyBrake && this.state.serviceBrake) {
      this.setState(prevState => ({acceleration: this.state.serviceDecelLimit}));
    }

    // if eBrake is true
    if(this.state.emergencyBrake && !this.state.serviceBrake) {
      this.setState(prevState => ({acceleration: this.state.eDecelLimit}));
    }

    // if serviceBrake and eBrake is true, cancel out serviceBrake
    if(this.state.emergencyBrake && this.state.serviceBrake) {
      this.setState(prevState => ({acceleration: this.state.eDecelLimit}));
    }


    // calculate velocity
    this.setState(prevState => ({ currentSpeed: prevState.currentSpeed +  (time_elapsed_ms / 2) * (this.state.acceleration + prevState.acceleration) }));


    // calculate position
    this.setState(prevState => ({intermediatePosition: this.state.currentSpeed * time_elapsed_ms}));
    this.setState(prevState => ({position: prevState.position + this.state.intermediatePosition}));

  } */

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
    this.setState((prevState) => ({
      totalMass:
        prevState.numCars * prevState.carMass +
        prevState.passengerCount * prevState.personMass +
        prevState.crewCount * prevState.personMass,
    }));
  }


  // toggle functions including failure and brake statuses, and test UI
  toggleTrainEngineStatus() {
    this.setState((prevState) => ({
      trainEngineStatus: !prevState.trainEngineStatus,
    }));

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

    // Send signal pickup failure to train controller
    window.electronAPI.sendTrainControllerMessage({
      'type': 'signalPickupFailure',
      'signalPickupFailure': this.state.signalPickupStatus,
    });
  }

  resetAll() {

    this.setState({trainEngineStatus: true, brakeStatus: true, signalPickupStatus: true});

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
  }

  toggle() {
    this.setState((prevState) => ({
      testSystem: !prevState.testSystem,
    }));
  }

  testUI() {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
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

        <Grid button xs={12} sx={{ mt: 6 }}>
          <Button variant="contained" onClick={this.toggle}>
            Train Model
          </Button>
        </Grid>
      </Grid>
    );
  }

  render() {
    if (this.state.testSystem) return this.testUI();

    // this.updateInfo();
    this.updateTemp();

    return (
      <Grid container spacing={2}>
        <Grid item2 xs={12}>
          <BoxLabel sx={{ mx: 2, my: 0 }}>Train Information</BoxLabel>
        </Grid>

        <Grid item xs={12} container sx={{ border: 1, mx: 3, p: 2 }}>
          <Grid item xs={4}>
            <Item sx={{ m: 2 }}>
              Current Speed: {this.state.currentSpeed.toFixed(2)} ms
            </Item>
          </Grid>
          <Grid item xs={4}>
            <Item sx={{ m: 2 }}>
              Engine Power: {this.state.power.toFixed(1)} kW
            </Item>
          </Grid>
          <Grid item xs={4}>
            <Item sx={{ m: 2 }}>
              Train Acceleration: {this.state.acceleration.toFixed(2)} mss
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

        <Grid item xs={4}>
          <Item sx={{ m: 2 }}>Power Command: {this.state.powerCommand} kW</Item>
        </Grid>
        <Grid item xs={4}>
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
        <Grid item xs={4}>
          <Item sx={{ m: 2 }}>Speed Limit: {this.state.commandedSpeed.toFixed(2)} mph</Item>
          </Grid>

          <Grid item xs={4}>
            <Item sx={{ m: 2 }}>
              Power Command: {this.state.powerCommand} kW
            </Item>
          </Grid>
          <Grid item xs={4}>
            <Item sx={{ m: 2 }}>
              Set Speed: {this.state.setSpeed.toFixed(2)} mph
            </Item>
          </Grid>
          <Grid item xs={4}>
            <Item sx={{ m: 2 }}>
              Speed Limit: {this.state.commandedSpeed.toFixed(2)} mph
            </Item>
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
              Exterior Train Lights:{' '}
              {this.state.exteriorTrainLights ? 'On' : 'Off'}
            </Item>
          </Grid>
          <Grid item xs={4}>
            <Item sx={{ m: 2 }}>
              Interior Train Lights:{' '}
              {this.state.interiorTrainLights ? 'On' : 'Off'}
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
              Train Mass: {this.state.totalMass.toFixed(1)} tons
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

          <Grid item xs={3}>
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

          <Grid item xs={3}>
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
        </Grid>
      </Grid>
    );
  }
}

export default TrainModel;
