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
      testMode: false,
      engineerMode: false,
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
      u_k: 0,
      k_p: 10000, // Proportional Gain
      k_i: 0, // Integral Gain
      T: 0, // Represents the sample period of the train model
      setSpeed: 0, // Speed set by the driver: the speech you want to approach
      currentSpeed: 0, // The current speed of the train, also known as currentVelocity
    };

    // Initializing constant variables
    this.accelerationLim = 0.5; // medium acceleration of the train
    this.decelerationEBrake = -2.73; // deceleration of the emergency brake
    this.decelerationSBrake = -1.2; // deceleration of the service brake
    this.gravity = -9.8;
    this.trainMass = 40900; // mass of train in kilograms (40.9 tons)
    this.passengerMass = 80; // mass of 1 passenger in kilograms (per Profeta's words)

    // Toggling buttons
    this.toggle = this.toggle.bind(this);
    this.toggleEngineer = this.toggleEngineer.bind(this);
    this.toggleAutomatic = this.toggleAutomatic.bind(this);
    this.emergencyBrake = this.emergencyBrake.bind(this);
    this.toggleServiceBrake = this.toggleServiceBrake.bind(this);

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
  };

  componentDidMount(){
    const interval = setInterval(() => {

      // Automatic Mode
      if(this.state.automaticMode){

        // If there's a brake failure, decrease the speed and stop
        if (this.state.brakeFailureDisplay){
          if(this.state.currentSpeed == 0){
            this.setState({currentSpeed: 0});
          }
          else{
          //  this.handleSpeedChange(this.state.currentSpeed);
          //  this.calculatePower();
          }
        }

        // If there's an engine failure, decrease the speed and stop
        else if (this.state.engineFailureDisplay){
          if(this.state.currentSpeed == 0){
            this.setState({currentSpeed: 0});
          }
          else{
           // this.handleSpeedChange(this.state.currentSpeed);
          //  this.calculatePower();
          }
        }

        // If there's a signal pickup failure, decrease the speed and stop
        else if (this.state.signalPickupFailureDisplay){
          if(this.state.currentSpeed == 0){
            this.setState({currentSpeed: 0});
          }
          else{
            // TODO
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
          // TODO
        }
        else if(this.state.emergencyButton && (this.state.currentSpeed != 0)){
          // TODO
        }
      }
    },1000);
  }
  handleSpeedChange(event) {
    // event.target.value represents the inputted speed
    this.setState({currentSpeed: event.target.value});

    // Calculate mass
    this.setState({totalMass: this.trainMass + (this.passengerMass*this.state.passengers)});

    if(this.state.currentSpeed == 0){
      this.setState({force: 0});
    }
    else{
       // Calculate force of the train
      this.setState({force: (this.state.power / this.state.currentSpeed)});

      //Calculate force in the opposite direction based on slope of the track
      this.setState((prevState) => ({
        force: prevState.force - (this.state.friction*this.state.totalMass*this.gravity*Math.sin(this.state.blockSlope)),
      }));

      this.setState((prevState) => ({
        force: prevState.force - (0.01*this.state.totalMass*this.gravity),
      }));
    }

    // Calculate acceleration of the train
    this.setState({prevAcceleration: this.state.acceleration});
    this.setState({acceleration: this.state.force/this.state.totalMass});
    if(this.state.acceleration > this.accelerationLim){
      this.setState({acceleration: this.accelerationLim});
    }

    // If the emergency brake is activated and there isn't a
    // brake failure, set the deceleration rate to -2.73
    else if(this.state.emergencyButton && !this.state.brakeFailureDisplay){
      this.setState({acceleration: this.state.decelerationEBrake});
    }

    // If the service brake is activated and there isn't a
    // brake failure, set the deceleration rate to -1.2
    else if(this.state.brakeStatus && !this.state.brakeFailureDisplay){
      this.setState({acceleration: this.state.decelerationSBrake});
    }

    // Calculate Velocity in meters per sec
    this.setState({setSpeed: this.state.currentSpeed + (this.state.T/2000)*(this.state.acceleration+this.state.prevAcceleration)})

    // Check if speed is higher than speed limit, then set speed to speed limit
    if(this.state.setSpeed > this.state.commandedSpeed){
      this.setState({currentSpeed: this.state.commandedSpeed});
    }
    else{
      this.setState({currentSpeed: this.state.setSpeed});
    }

    if(this.state.currentSpeed < 0){
      this.setState({currentSpeed: 0});
    }
    if(this.state.currentSpeed == 0 && this.state.acceleration < 0){
      this.setState({acceleration: 0});
    }
  }

  handleCommandedSpeedChange(event) {
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

  handleSuggestedSpeedChange(event){
    if(event.target.value > 43)
    {
      this.setState({suggestedSpeed: 43});
    }
    else if (event.target.value < 0)
    {
      this.setState({suggestedSpeed: 0});
    }
    else if (event.target.value > this.state.commandedSpeed){
      this.setState({suggestedSpeed: this.state.commandedSpeed});
    }
    else{
      this.setState({suggestedSpeed: event.target.value});
    }
  }

  handleAuthorityChange(event) {
    if(event.target.value < 0)
    {
      this.setState({authority: 0});
    }
    else{
      this.setState({authority: event.target.value});
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

  toggleAutomatic(){ // Toggles between automatic mode and manual mode
    this.setState((prevState) => ({
      automaticMode: !prevState.automaticMode,
    }));
  }

  toggleServiceBrake(){ // Turns the service brake on/off
    this.setState((prevState) => ({
      brakeStatus: !prevState.brakeStatus,
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

  emergencyBrake(){ // Toggles the emergency brake in the Test UI
    this.setState((prevState) => ({
      emergencyButton: !prevState.emergencyButton,
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

  calculatePower(){ // Function that calculates the current power of the train

    // If P_cmd < P_max, use this equation
    if (this.state.power < this.state.maxPower){
      this.setState((prevState) => ({
        u_k: (prevState.u_k + (this.state.T/2000)*(this.state.setSpeed + this.state.currentSpeed)),
      }));
    }

    // If P_cmd >= P_max, use this equation
    else if (this.state.power >= this.state.maxPower){
      this.setState((prevState) => ({
        u_k: prevState.u_k,
      }));
    }

    // Final Power Calculation
    this.setState({power: ((this.state.k_p*this.state.setSpeed)+(this.state.k_i*this.state.u_k))});
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
              <FormGroup>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  onClick={this.toggleAutomatic}
                  label={this.state.automaticMode ? "Automatic Mode" : "Manual Mode"}
                />
              </FormGroup>
            </Item>
          </Grid>
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
          <Grid item xs={3} md={3}>
              <label>
                Temperature:
                <input type="number" value={this.state.temperature} onChange={this.handleTemperatureChange} />
              </label>
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
                  label="Left Train Doors"
                />
              </FormGroup>
            </Item>
          </Grid>
          <Grid item xs={3} md={4}>
            <Item>
              <FormGroup>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Right Train Doors"
                />
              </FormGroup>
            </Item>
          </Grid>
          <Grid item xs={3} md={4}>
            <Item>
              <FormGroup>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Cabin Lights"
                />
              </FormGroup>
            </Item>
          </Grid>
          <Grid item xs={3} md={8}>
            <Item>
              <FormGroup>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Train Lights"
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
            <Item>Power: _ Watts</Item>
          </Grid>
          <Grid item xs={6} md={8}>
            <Item>Temperature</Item>
          </Grid>
          <Grid item xs={4} md={2}>
            <Item>Current Speed: _ MPH</Item>
          </Grid>
          <Grid item xs={4} md={2}>
            <Item>Commanded Speed: _ MPH</Item>
          </Grid>
          <Grid item xs={4} md={2}>
            <Item>Suggested Speed: _ MPH</Item>
          </Grid>
          <Grid item xs={4} md={2}>
            <Item>Authority: _ Miles</Item>
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
