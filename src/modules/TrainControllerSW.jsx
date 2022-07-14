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

      //Power & Velocity Variables
      power: 70, // power is in kilowatts
      maxPower: 120, // Max power of the train is 120 kilowatts
      force: 0,
      acceleration: 0,
      prevAcceleration: 0, // previous acceleration of the train
      //calVelocity: 0, // the calculated velocity in m/s
      friction: 0,
      totalMass: 0,
      passengers: 8,
      blockSlope: 0,
      cumulative_err: 0, // also known as u_k
      error_k: 0,
      error_kprev: 0,
      k_p: 10000, // Proportional Gain
      k_i: 0, // Integral Gain
      T: 1000, // Represents the sample period of the train model
      setSpeed: 0, // Speed set by the driver: the speech you want to approach
      currentSpeed: 0, // The current speed of the train, also known as currentVelocity, in meters per second
      currentSpeedMPH: 0, // The current speed of the train in miles per hour

    };

    // Initializing constant variables
    this.accelerationLim = 0.5; // medium acceleration of the train
    this.decelerationEBrake = -2.73; // deceleration of the emergency brake
    this.decelerationSBrake = -1.2; // deceleration of the service brake

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
    this.handleSpeedChange = this.handleSpeedChange.bind(this);
    this.handleCommandedSpeedChange = this.handleCommandedSpeedChange.bind(this);
    this.handleAuthorityChange = this.handleAuthorityChange.bind(this);
    this.handleTemperatureChange = this.handleTemperatureChange.bind(this);
    this.handleSuggestedSpeedChange = this.handleSuggestedSpeedChange.bind(this);
    this.setKp = this.setKp.bind(this);
    this.setKi = this.setKi.bind(this);
    this.setDesiredSpeed = this.setDesiredSpeed.bind(this);

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
          if(this.state.currentSpeed == 0){
            this.setState({currentSpeed: 0});
          }
          else{
            this.setState((prevState) => ({
              currentSpeed: prevState.currentSpeed - 1,
            }));
          }
        }

        // If there's an engine failure, decrease the speed and stop
        else if (this.state.engineFailureDisplay){
          if(this.state.currentSpeed == 0){
            this.setState({currentSpeed: 0});
          }
          else{
            this.setState((prevState) => ({
              currentSpeed: prevState.currentSpeed - 1,
            }));
          }
        }

        // If there's a signal pickup failure, decrease the speed and stop
        else if (this.state.signalPickupFailureDisplay){
          if(this.state.currentSpeed == 0){
            this.setState({currentSpeed: 0});
          }
          else{
            this.setState((prevState) => ({
              currentSpeed: prevState.currentSpeed - 1,
            }));
          }
        }
        else{
          if(!this.state.brakeFailureDisplay){
            this.setState({currentSpeed: this.state.commandedSpeed});
          }
          if(!this.state.engineFailureDisplay){
            this.setState({currentSpeed: this.state.commandedSpeed});
          }
          if(!this.state.signalPickupFailureDisplay){
            this.setState({currentSpeed: this.state.commandedSpeed});
          }
        }
      }

      // Manual Mode
      else{
        if(this.state.brakeStatus && this.state.currentSpeed != 0){
          this.setState((prevState) => ({
            currentSpeed: prevState.currentSpeed - 1,
          }));
        }
        else if(this.state.emergencyButton && (this.state.currentSpeed != 0)){
          this.setState((prevState) => ({
            currentSpeed: prevState.currentSpeed - 1,
          }));
        }
      }
    },1000);
  }
  handleSpeedChange(event) {
    if(event.target.value < 0){
      this.setState({currentSpeed: 0})
    }
    else if (event.target.value > 43){
      this.setState({currentSpeed: 43})
    }
    else{
      this.setState({currentSpeed: event.target.value});
    }
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
  }

  setDesiredSpeed(event){
    if(event.target.value < 0){
      this.setState({setSpeed: 0});
    }
    else if (event.target.value > 43){
      this.setState({setSpeed: 43});
    }
    else if (event.target.value >= this.state.commandedSpeed){
      this.setState({setSpeed: this.state.commandedSpeed});
    }
    else{
      this.setState({setSpeed: event.target.value})
    }
  }


  // Test UI Functions

  handleCommandedSpeedChange(event) { // Changes the commanded speed
    // 43 represents top speed of train in MPH
    if(event.target.value > 43)
    {
      this.setState({commandedSpeed: 43});
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
    if(event.target.value > 43)
    {
      this.setState({suggestedSpeed: 43});
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
      this.setState((prevState) => ({
        cumulative_err: (prevState.cumulative_err + (this.state.T/2)*(this.state.error_k + this.state.error_kprev)),
      }));
    }

    // If P_cmd >= P_max, use this equation
    else if (this.state.power >= this.state.maxPower){
      this.setState((prevState) => ({
        cumulative_err: prevState.cumulative_err,
      }));
    }

    // Final Power Calculation
    this.setState({power: ((this.state.k_p*this.state.error_k)+(this.state.k_i*this.state.cumulative_err))});
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
  }

  openRightDoors(){ // Toggles the right doors
    this.setState((prevState) => ({
      rightDoors: !prevState.rightDoors,
    }));
  }

  trainLightsOnOff(){ // Toggles the exterior train lights on/off
    this.setState((prevState) => ({
      trainLights: !prevState.trainLights,
    }));
  }

  cabinLightsOnOff(){ // Toggles the interior train lights on/off
    this.setState((prevState) => ({
      cabinLights: !prevState.cabinLights,
    }));
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
          <Grid item xs={4} md={2}>
            <Item>Power: {this.state.power} kilowatts</Item>
          </Grid>
          <Grid item xs={4} md={2}>
              <label>
                Current Speed:
                <input type="number" value={this.state.currentSpeed} onChange={this.handleSpeedChange} />
              </label>
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
                Suggested Speed:
                <input type="number" value={this.state.suggestedSpeed} onChange={this.handleSuggestedSpeedChange} />
              </label>
          </Grid>
          <Grid item xs={4} md={2}>
              <label>
                Set Desired Speed:
                <input type="number" value={this.state.setSpeed} onChange={this.setDesiredSpeed} />
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
        <Grid container spacing={4}>
          <Grid item xs={3} md={8}>
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
          <Grid item xs={3} md={4}>
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
          <Grid item xs={3} md={4}>
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
          <Grid item xs={3} md={8}>
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
            <Item>Commanded Speed: {this.state.commandedSpeed} MPH</Item>
          </Grid>
          <Grid item xs={4} md={2}>
            <Item>Suggested Speed: {this.state.suggestedSpeed} MPH</Item>
          </Grid>
          <Grid item xs={4} md={2}>
            <Item>Authority: {this.state.authority} Miles</Item>
          </Grid>
          <Grid item xs={5} md={2}>
            <Item>Next Stop: _</Item>
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
}

export default TrainControllerSW;
