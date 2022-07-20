import React, { useState } from 'react';
import {
  styled,
  Box,
  Paper,
  Grid,
  FormGroup,
  FormControlLabel,
  Switch,
  Button,
  Slider,
  Stack,
  AppBar,
  Typography,
  Toolbar,
  TextField,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import { type } from 'os';
import './TrainControllerSW.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

// max train speed: 70 km/h ~= 43 MPH
// service brake deceleration 1.2m/s^2
// emergency brake deceleration 2.73 m/s^2
class TrainControllerSW extends React.Component {
  constructor(props, name) {
    super(props);
    this.name = name;

    // Module Communicaiton - Receiving Messages
    window.electronAPI.subscribeTrainControllerMessage( (_event, payload) => {
      console.log('IPC:TrainController: ', payload);

      switch(payload.type) {
        case 'commandedSpeed':
          this.setState({commandedSpeed: commandedSpeed});
          break;
        case 'suggestedSpeed':
          this.setState({suggestedSpeed: suggestedSpeed});
          break;
        case 'authority':
          this.setState({authority: authority});
          break;
        case 'currentSpeed':
          this.setState({currentSpeed: currentSpeed});
          break;
        case 'brakeFailure':
          this.setState({brakeFailureDisplay: brakeFailure});
          break;
        case 'engineFailure':
          this.setState({engineFailureDisplay: engineFailure});
          break;
        case 'signalPickupFailure':
          this.setState({signalPickupFailureDisplay: signalPickupFailure});
          break;
        default:
          console.warn('Unknown payload type received: ', payload.type);
      }
    });

    this.state = {
      // UIs
      testMode: false,
      engineerMode: false,

      // Doors and Lights, as well as environment variables affecting them
      leftDoors: true,
      rightDoors: true,
      trainLights: true,
      cabinLights: true,
      under: false, // Variable for if the train is underground
      rightPlatform: false, // Used to check if right doors should open
      leftPlatform: false, // Used to check if left doors should open

      // Service Brake, Emergency Brake, and failure toggles
      emergencyButton: false,
      brakeFailureDisplay: false,
      engineFailureDisplay: false,
      signalPickupFailureDisplay: false,
      automaticMode: true,
      brakeStatus: false,

      commandedSpeed: 0,
      suggestedSpeed: 0,
      temperature: 70,
      authority: 10,
      stationName: '',

      //Power & Velocity Variables
      power: 0, // power is in kilowatts
      maxPower: 120, // Max power of the train is 120 kilowatts
      totalMass: 0,
      passengers: 8,
      cumulative_err: 0, // also known as u_k
      error_k: 0,
      error_kprev: 0,
      k_p: 10000, // Proportional Gain
      k_i: 0, // Integral Gain
      T: 2000, // Represents the sample period of the train model
      setSpeed: 0, // Speed set by the driver: the speech you want to approach
      currentSpeed: 0, // The current speed of the train, also known as currentVelocity, in meters per second
      currentSpeedMPH: 0, // The current speed of the train in miles per hour

    };

    // Toggling buttons
    this.toggle = this.toggle.bind(this);
    this.toggleEngineer = this.toggleEngineer.bind(this);
    this.toggleAutomatic = this.toggleAutomatic.bind(this);
    this.emergencyBrake = this.emergencyBrake.bind(this);
    this.toggleServiceBrake = this.toggleServiceBrake.bind(this);
    this.openLeftDoors = this.openLeftDoors.bind(this);
    this.openRightDoors = this.openRightDoors.bind(this);
    this.trainLightsOnOff = this.trainLightsOnOff.bind(this);
    this.cabinLightsOnOff = this.cabinLightsOnOff.bind(this);

    // Environment funcitons
    this.underground = this.underground.bind(this);
    this.platformSide = this.platformSide.bind(this);
    this.announcements = this.announcements.bind(this);

    // Failures
    this.brakeFailure = this.brakeFailure.bind(this);
    this.engineFailure = this.engineFailure.bind(this);
    this.signalPickupFailure = this.signalPickupFailure.bind(this);

    // Handling Changes
    this.handleCurrentSpeedChange = this.handleCurrentSpeedChange.bind(this);
    this.handleCommandedSpeedChange = this.handleCommandedSpeedChange.bind(this);
    this.handleAuthorityChange = this.handleAuthorityChange.bind(this);
    this.handleTemperatureChange = this.handleTemperatureChange.bind(this);
    this.setKp = this.setKp.bind(this);
    this.setKi = this.setKi.bind(this);
    this.setSpeed = this.setSpeed.bind(this);
    this.setStationName = this.setStationName.bind(this);

    //  Conversion functions
    this.meters_to_miles = this.meters_to_miles.bind(this);
    this.miles_to_meters = this.miles_to_meters.bind(this);
  };

  componentDidMount(){ // This acts as the Main program - where the functions are called
    const interval = setInterval(() => {


      // Automatic Mode
      if(this.state.automaticMode){

        // If there's a brake failure, decrease the speed and stop
        if (this.state.brakeFailureDisplay){
          this.setState({emergencyButton: true});
          this.setState({setSpeed: 0});
        }

        // If there's an engine failure, decrease the speed and stop
        else if (this.state.engineFailureDisplay){
          this.setState({emergencyButton: true});
          this.setState({setSpeed: 0});
        }

        // If there's a signal pickup failure, decrease the speed and stop
        else if (this.state.signalPickupFailureDisplay){
          this.setState({emergencyButton: true});
          this.setState({setSpeed: 0});
        }
        else{
          if(!this.state.brakeFailureDisplay){
            this.setState({setSpeed: this.state.commandedSpeed});
          }
          if(!this.state.engineFailureDisplay){
            this.setState({setSpeed: this.state.commandedSpeed});
          }
          if(!this.state.signalPickupFailureDisplay){
            this.setState({setSpeed: this.state.commandedSpeed});
          }
        }
      }

      // Manual Mode
      else{
        if((this.state.brakeStatus == true) && (this.state.currentSpeed != 0)){
          this.setState({brakeStatus: true});
          this.setState({setSpeed: 0});
        }
        else if(this.state.emergencyButton && (this.state.currentSpeed != 0)){
          this.setState({emergencyButton: true});
          this.setState({setSpeed: 0});
        }

        // If there is a failure and the driver has activated the service brake, decrease the speed
        else if((this.state.brakeStatus == true) && (this.state.brakeFailureDisplay || this.state.engineFailureDisplay || this.state.signalPickupFailureDisplay)){
          this.setState({setSpeed: 0});
        }
      }
    },1000);
  }


  handleTemperatureChange(event) {
    if(event.target.value < 60){
      this.setState({temperature: 60});
    }
    else if (event.target.value > 80){
      this.setState({temperature: 80});
    }
    else{
      this.setState({temperature: event.target.value});
    }

    // // Send temperature to train model
    // window.electronAPI.sendTrainModelMessage({
    //   'type': 'temperature',
    //   'temperature': this.state.temperature,
    // });

  }

  emergencyBrake(){ // Toggles the emergency brake
    this.setState((prevState) => ({
      emergencyButton: !prevState.emergencyButton,
    }));
  }

  toggleServiceBrake(){ // Turns the service brake on/off
    this.setState((prevState) => ({
      brakeStatus: !prevState.brakeStatus,
    }));

    // // Send service brake state to train model
    // window.electronAPI.sendTrainModelMessage({
    //   'type': 'serviceBrake',
    //   'serviceBrake': this.state.brakeStatus,
    // });
  }

  setSpeed(event){
    if(this.state.automaticMode == true){
      this.setState({setSpeed: this.state.commandedSpeed});
    }
    else if (this.state.automaticMode = false){
      if(event.target.value < 0){
        this.setState({setSpeed: 0});
      }
      else if (event.target.value > 70){
        this.setState({setSpeed: 70});
      }
      else if (event.target.value <= this.state.commandedSpeed){
        this.setState({setSpeed: this.state.setSpeed});
      }
      else{
        // Nothing here
      }
    }
    this.calculatePower();
    // Send speed set by the driver to train model
    // window.electronAPI.sendTrainModelMessage({
    //   'type': 'setSpeed',
    //   'setSpeed': this.state.setSpeed,
    // });

  }

  // Test UI Functions

  handleCurrentSpeedChange(event){
    if(event.target.value > 70)
    {
      this.setState({currentSpeed: 70});
    }
    else if (event.target.value < 0)
    {
      this.setState({currentSpeed: 0});
    }
    else{
      this.setState({currentSpeed: event.target.value});
    }
  }

  handleCommandedSpeedChange(event) { // Changes the commanded speed
    // 70 represents top speed of train in km/h
    if(event.target.value > 70)
    {
      this.setState({commandedSpeed: 70});
    }
    else if (event.target.value < 0)
    {
      this.setState({commandedSpeed: 0});
    }
    else{
      this.setState({commandedSpeed: event.target.value});
    }
  }

  handleSuggestedSpeedChange(event){ // Changes the suggested speed
    if(event.target.value > 70)
    {
      this.setState({suggestedSpeed: 70});
    }
    else if (event.target.value < 0)
    {
      this.setState({suggestedSpeed: 0});
    }
    else{
      this.setState({suggestedSpeed: event.target.value});
    }
  }

  handleAuthorityChange(event) { // Changes the authority
    if(event.target.value < 0)
    {
      this.setState({authority: 0});
    }
    else{
      this.setState({authority: event.target.value});
    }
  }

  setStationName(event){ // Sets the station
    this.setState({stationName: event.target.value});
  }

  // Engineer Functions
  setKp(event){
    if(event.target.value < 0){
      this.setState({k_p: 0});
    }
    else{
      this.setState({k_p: event.target.value});
    }
  }

  setKi(event){
    if(event.target.value < 0){
      this.setState({k_i: 0});
    }
    else{
      this.setState({k_i: event.target.value});
    }
  }

  // Conversion and calculation functions
  // Speed comes from Train Model calculation

  meters_to_miles(speed){ // 1 m/s = approx. 2.2369 mph
    return (speed * 2.2369)
  }

  miles_to_meters(speed){
    return (speed / 2.2369)
  }

  calculatePower(){ // Function that calculates the current power of the train

    // Calculate error
    this.setState({error_kprev: this.state.error_k});
    this.setState({error_k: Math.abs(this.state.setSpeed - this.state.currentSpeed)});

    // If P_cmd < P_max, use this equation
    if (this.state.power < this.state.maxPower){
      this.setState({
        cumulative_err: ((this.state.T/2000)*(this.state.error_k + this.state.error_kprev)),
      });
    }

    // If P_cmd >= P_max, use this equation
    else if (this.state.power >= this.state.maxPower){
      this.setState({
        cumulative_err: this.state.cumulative_err,
      });
    }

    // Final Power Calculation
    this.setState({power: ((this.state.k_p*this.state.error_k)+(this.state.k_i*this.state.cumulative_err))});

    // Send power command to train model
    // window.electronAPI.sendTrainModelMessage({
    //   'type': 'power',
    //   'power': this.state.power,
    // });

  }

  // Environment functions
  // For automatic mode

  underground(){ // Checks if the train is underground, activates lights accordingly
    if(this.under && this.automaticMode){
      this.setState({trainLights: true});
    }
    else{
      this.setState({trainLights: false});
    }
  }

  platformSide(){ // Checks which side the station is on and opens the respective doors
    if(this.automaticMode == true && this.currentSpeed == 0 && this.rightPlatform == true){
      this.setState({rightDoors: true});
      this.setState({leftDoors: false});
    }
    else if (this.automaticMode = true && this.currentSpeed == 0 && this.leftPlatform == true){
      this.setState({leftDoors: true});
      this.setState({rightDoors: false});
    }
  }

  announcements(){

  }

  toggleAutomatic(){ // Toggles between automatic mode and manual mode
    this.setState((prevState) => ({
      automaticMode: !prevState.automaticMode,
    }));
  }

  toggle() { // Toggles between regular UI and Test UI
    this.setState((prevState) => ({
      testMode: !prevState.testMode,
    }));
  }

  toggleEngineer(){ // Toggles between UI/Test UI and Engineer UI
    this.setState((prevState) => ({
      engineerMode: !prevState.engineerMode,
    }));
  }

  openLeftDoors(){ // Toggles the left doors
    this.setState((prevState) => ({
      leftDoors: !prevState.leftDoors,
    }));

    // Send left door state to train model
    window.electronAPI.sendTrainModelMessage({
      'type': 'leftDoor',
      'leftDoor': this.state.leftDoors,
    });
  }

  openRightDoors(){ // Toggles the right doors
    this.setState((prevState) => ({
      rightDoors: !prevState.rightDoors,
    }));

    // Send right door state to train model
    window.electronAPI.sendTrainModelMessage({
      'type': 'rightDoor',
      'rightDoor': this.state.rightDoors,
    });
  }

  trainLightsOnOff(){ // Toggles the exterior train lights on/off
    this.setState((prevState) => ({
      trainLights: !prevState.trainLights,
    }));

    // Send train light state to train model
    window.electronAPI.sendTrainModelMessage({
      'type': 'trainLights',
      'trainLights': this.state.trainLights,
    });
  }

  cabinLightsOnOff(){ // Toggles the interior train lights on/off
    this.setState((prevState) => ({
      cabinLights: !prevState.cabinLights,
    }));

    // Send train light state to train model
    window.electronAPI.sendTrainModelMessage({
      'type': 'cabinLights',
      'cabinLights': this.state.cabinLights,
    });
  }


  brakeFailure(){ // Toggles the break failure display in the Test UI
    this.setState((prevState) => ({
      brakeFailureDisplay: !prevState.brakeFailureDisplay,
    }));
  }

  engineFailure(){ // Toggles the engine failure display in the Test UI
    this.setState((prevState) => ({
      engineFailureDisplay: !prevState.engineFailureDisplay,
    }));
  }

  signalPickupFailure(){ // Toggles the signal pickup failure display in the Test UI
    this.setState((prevState) => ({
      signalPickupFailureDisplay: !prevState.signalPickupFailureDisplay,
    }));
  }

  engineerPanel(){
    return (
      <ThemeProvider theme={darkTheme}>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar variant="dense">
            <Typography variant="h6" color="white" component="div">
              Engineer Panel
            </Typography>
          </Toolbar>
        </AppBar>
        <Grid item xs={4} md={2}>
          <label>
            Kp:
          <input type="number" value={this.state.k_p} onChange={this.setKp} />
          </label>
        </Grid>
        <Grid item xs={3} md={3}>
          <label>
            Ki:
          <input type="number" value={this.state.k_i} onChange={this.setKi} />
          </label>
        </Grid>
        <Button variant="contained" onClick={this.toggleEngineer}>
          Toggle Engineer Panel
        </Button>
      </Box>
      </ThemeProvider>
    );
  }

  testUI() {
    if (this.state.engineerMode) return this.engineerPanel();

    return (
      <ThemeProvider theme={darkTheme}>
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar variant="dense">
              <Typography variant="h6" color="white" component="div">
                Train Controller Test UI
              </Typography>
            </Toolbar>
          </AppBar>
        </Box>
        <Grid container spacing={4}>
          <Grid item xs={5} md={5}>
            <Item>
              {this.state.brakeStatus ? (
              <Button variant="contained" color="error" onClick={this.toggleServiceBrake}>
                Service Brake Activated
              </Button>
              ) : (
              <Button variant="outlined" color="error" onClick={this.toggleServiceBrake}>
                Service Brake Deactivated
              </Button>
              )}
            </Item>
          </Grid>
          <Grid item xs={6} md={4}>
            <Item>
              {this.state.emergencyButton ? (
              <Button variant="contained" color="error" onClick={this.emergencyBrake}>
                Emergency Brake Activated
              </Button>
              ) : (
              <Button variant="outlined" color="error" onClick={this.emergencyBrake}>
                Emergency Brake Deactivated
              </Button>
              )}
            </Item>
          </Grid>
          <Grid item xs={4} md={4}>
              <label>
                Commanded Speed:
                <input type="number" value={this.state.commandedSpeed} onChange={this.handleCommandedSpeedChange} />
              </label>
          </Grid>
          <Grid item xs={4} md={2}>
              <label>
                Authority:
                <input type="number" value={this.state.authority} onChange={this.handleAuthorityChange} />
              </label>
          </Grid>
          <Grid item xs={4} md={2}>
              <label>
                Current Speed:
                <input type="number" value={this.state.currentSpeed} onChange={this.handleCurrentSpeedChange} />
              </label>
          </Grid>
          <Grid item xs={4} md={2}>
              <label>
                Station Name:
                <input type="text" value={this.state.stationName} onChange={this.setStationName} />
              </label>
          </Grid>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.5}>
            {this.state.brakeFailureDisplay ? (
              <Button variant="contained" color="error" onClick={this.brakeFailure}>
                Brake Status: Failing
              </Button>
              ) : (
              <Button variant="contained" color="success" onClick={this.brakeFailure}>
                Brake Status: Working
              </Button>
              )}
            {this.state.engineFailureDisplay ? (
              <Button variant="contained" color="error" onClick={this.engineFailure}>
                Engine Status: Failing
              </Button>
              ) : (
              <Button variant="contained" color="success" onClick={this.engineFailure}>
                Engine Status: Working
              </Button>
              )}
            {this.state.signalPickupFailureDisplay ? (
              <Button variant="contained" color="error" onClick={this.signalPickupFailure}>
                Signal Pickup Status: Broken
              </Button>
              ) : (
              <Button variant="contained" color="success" onClick={this.signalPickupFailure}>
                Signal Pickup Status: Connected
              </Button>
              )}
          </Stack>
          <Stack spacing={2} direction="row">
            <Button variant="contained" onClick={this.toggle}>
              Toggle Test UI
            </Button>
            <Button variant="contained" onClick={this.toggleEngineer}>
              Toggle Engineer Panel
            </Button>
          </Stack>
        </Grid>
      </Box>
      </ThemeProvider>
    );
  }

  render() {
    if (this.state.testMode) return this.testUI();
    if (this.state.engineerMode) return this.engineerPanel();

    return (
      <ThemeProvider theme={darkTheme}>
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar variant="dense">
              <Typography variant="h6" color="inherit" component="div">
                Train Controller UI
              </Typography>
            </Toolbar>
          </AppBar>
        </Box>
        <Grid container spacing={2}>
          <div className="left">
              <Grid item xs={8} md={8}>
                <Item>
                  <FormGroup>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      onClick={this.openLeftDoors}
                      label={this.state.leftDoors ? "Left Doors: Closed" : "Left Doors: Open"}
                    />
                  </FormGroup>
                </Item>
              </Grid>
            </div>
            <div className="left">
              <Grid item xs={8} md={4}>
                <Item>
                  <FormGroup>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      onClick={this.openRightDoors}
                      label={this.state.rightDoors ? "Right Doors: Closed" : "Right Doors: Open"}
                    />
                  </FormGroup>
                </Item>
              </Grid>
            </div>
            <div className="left">
              <Grid item xs={8} md={4}>
                <Item>
                  <FormGroup>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      onClick={this.trainLightsOnOff}
                      label={this.state.trainLights ? "Train Lights: On" : "Train Lights: Off"}
                    />
                  </FormGroup>
                </Item>
              </Grid>
            </div>
            <div className="left">
              <Grid item xs={8} md={8}>
                <Item>
                  <FormGroup>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      onClick={this.cabinLightsOnOff}
                      label={this.state.cabinLights ? "Cabin Lights: On" : "Cabin Lights: Off"}
                    />
                  </FormGroup>
                </Item>
              </Grid>
            </div>
            <Grid item xs={5} md={5}>
              <Item>
                <FormGroup>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    onClick={this.toggleAutomatic}
                    label={this.state.automaticMode ? "Automatic Mode" : "Manual Mode"}
                  />
                </FormGroup>
              </Item>
            </Grid>
            <Grid item xs={6} md={8}>
              <Item>
                {this.state.emergencyButton ? (
                <Button variant="contained" color="error" onClick={this.emergencyBrake}>
                  Emergency Brake Activated
                </Button>
                ) : (
                <Button variant="outlined" color="error" onClick={this.emergencyBrake}>
                  Emergency Brake Deactivated
                </Button>
                )}
              </Item>
            </Grid>
            <Grid item xs={6} md={8}>
              <Item>
                {this.state.brakeStatus ? (
                <Button variant="contained" color="error" onClick={this.toggleServiceBrake}>
                  Service Brake Activated
                </Button>
                ) : (
                <Button variant="outlined" color="error" onClick={this.toggleServiceBrake}>
                  Service Brake Deactivated
                </Button>
                )}
              </Item>
            </Grid>
            <Grid item xs={4} md={2}>
              <Item>Power: {this.state.power} Kilowatts</Item>
            </Grid>
            <Grid item xs={3} md={3}>
                <label>
                  Temperature:
                  <input type="number" value={this.state.temperature} onChange={this.handleTemperatureChange} />
                </label>
            </Grid>
            <Grid item xs={4} md={2}>
              <Item>Current Speed: {this.state.currentSpeed} MPH</Item>
            </Grid>
            <Grid item xs={4} md={2}>
              <label>
                Set Desired Speed:
                <input type="number" value={this.state.setSpeed} onChange={this.setSpeed} />
              </label>
            </Grid>
            <Grid item xs={4} md={2}>
              <Item>Commanded Speed: {this.state.commandedSpeed} MPH</Item>
            </Grid>
            <Grid item xs={4} md={2}>
              <Item>Suggested Speed: {this.state.suggestedSpeed} MPH</Item>
            </Grid>
            <Grid item xs={4} md={2}>
              <Item>Authority: {this.state.authority} Miles</Item>
            </Grid>
            <Grid item xs={5} md={2}>
              <Item>Next Stop: {this.state.stationName} </Item>
            </Grid>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.5}>
              {this.state.brakeFailureDisplay ? (
                <Button variant="contained" color="error">
                  Brake Status: Failing
                </Button>
                ) : (
                <Button variant="contained" color="success">
                  Brake Status: Working
                </Button>
                )}
              {this.state.engineFailureDisplay ? (
                <Button variant="contained" color="error">
                  Engine Status: Failing
                </Button>
                ) : (
                <Button variant="contained" color="success">
                  Engine Status: Working
                </Button>
                )}
              {this.state.signalPickupFailureDisplay ? (
                <Button variant="contained" color="error">
                  Signal Pickup Status: Broken
                </Button>
                ) : (
                <Button variant="contained" color="success">
                  Signal Pickup Status: Connected
                </Button>
                )}
            </Stack>
            <Stack spacing={2} direction="row">
              <Button variant="contained" onClick={this.toggle}>
                Toggle Test UI
              </Button>
              <Button variant="contained" onClick={this.toggleEngineer}>
                Toggle Engineer Panel
              </Button>
            </Stack>
        </Grid>
      </Box>
      </ThemeProvider>
    );
  }
}

export default TrainControllerSW;
