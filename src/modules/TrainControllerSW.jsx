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
} from '@mui/material';
import { type } from 'os';


const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));
function preventHorizontalKeyboardNavigation(event) {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
  }
}
// max train speed: 70 km/h ~= 43 MPH
// service brake deceleration 1.2m/s^2
// emergency brake deceleration 2.73 m/s^2
class TrainControllerSW extends React.Component {
  constructor(props, name) {
    super(props);
    this.name = name;

    this.state = {
      testMode: false,
      emergencyButton: false,
      brakeFailureDisplay: false,
      engineFailureDisplay: false,
      signalPickupFailureDisplay: false,
      automaticMode: true,
      brakeStatus: false,
      speed: 0,
      commandedSpeed: 0,
      speedLimit: 0,
      cabinTemperature: 70,
      authority: 10,

      //Power & Velocity Variables
      power: 0,
      powerCMD: 0, // Power command
      maxPower: 120, // Max power of the train is 120 kilowatts
      force: 0,
      acceleration: 0,
      velocity: 0,
      friction: 0,
      totalMass: 0,
      trainMass: 0,
      passengerMass: 0,
      graivty: -9.8,
      blockSlope: 0,
      u_k: 0,
      k_p: 10000, // Proportional Gain
      k_i: 0, // Integral Gain
      T: 0, // Represents the sample period of the train model
      setSpeed: 0, // Speed set by the driver
      currentSpeed: 0, // The current speed of the train
    };

    // Initializing all needed variables to 0 or empty
    this.authority = 0;
    this.power = 0;
    this.stationName = "";

    // Toggling buttons
    this.toggle = this.toggle.bind(this);
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
    this.handlePowerChange = this.handlePowerChange.bind(this);
    this.handleSpeedLimitChange = this.handleSpeedLimitChange.bind(this);

    // Hanlding Submits
    this.handleSpeedSubmit = this.handleSpeedSubmit.bind(this);
    this.handleCommandedSpeedSubmit = this.handleCommandedSpeedSubmit.bind(this);
    this.handleAuthoritySubmit = this.handleAuthoritySubmit.bind(this);
    this.handleTemperatureSubmit = this.handleTemperatureSubmit.bind(this);
    this.handlePowerSubmit = this.handlePowerSubmit.bind(this);
  };

  componentDidMount(){
    const interval = setInterval(() => {

      // Automatic Mode
      if(this.state.automaticMode){

        // If there's a brake failure, decrease the speed and stop
        if (this.state.brakeFailureDisplay){
          if(this.state.speed == 0){
            this.setState({speed: 0});
          }
          else{
          this.setState((prevState) => ({
              speed: prevState.speed - 1,
            }));
          }
        }

        // If there's an engine failure, decrease the speed and stop
        else if (this.state.engineFailureDisplay){
          if(this.state.speed == 0){
            this.setState({speed: 0});
          }
          else{
          this.setState((prevState) => ({
            speed: prevState.speed - 1,
            }));
          }
        }

        // If there's a signal pickup failure, decrease the speed and stop
        else if (this.state.signalPickupFailureDisplay){
          if(this.state.speed == 0){
            this.setState({speed: 0});
          }
          else{
          this.setState((prevState) => ({
            speed: prevState.speed - 1,
            }));
          }
        }
        else{
          if(!this.state.brakeFailureDisplay){
            this.setState({speed: this.state.commandedSpeed});
          }
          if(!this.state.engineFailureDisplay){
            this.setState({speed: this.state.commandedSpeed});
          }
          if(!this.state.signalPickupFailureDisplay){
            this.setState({speed: this.state.commandedSpeed});
          }
          this.setState({cabinTemperature : 70});
          this.setState({authority: 10});
          this.setState({power: 1200});
        }
      }

      // Manual Mode
      else{
        if(this.state.brakeStatus && this.state.speed != 0){
          this.setState((prevState) => ({
            speed: prevState.speed - 1,
          }));
        }
        else if(this.state.emergencyButton && (this.state.speed != 0)){
          this.setState((prevState) => ({
            speed: prevState.speed - 1,
          }));
        }
      }
    },1000);
  }
  handleSpeedChange(event) {
    if(this.state.velocity == 0){
      this.setState({force: 0});
    }
    else{
       // Calculate force of the train
      this.setState({force: (this.state.power / this.state.velocity)});

      //Calculate force in the opposite direction based on slope of the track
      this.setState((prevState) => ({
        force: prevState.force - (this.state.friction*this.state.mass*this.state.gravity*Math.sin(this.state.blockSlope)),
      }));

      this.setState((prevState) => ({
        force: prevState.force - (0.01*this.state.mass*this.state.gravity),
      }));
    }

    // if(event.target.value > this.state.speedLimit)
    // {
    //   this.setState({speed: this.state.speedLimit});
    // }
    // else if (event.target.value < 0)
    // {
    //   this.setState({speed: 0});
    // }
    // else{
    //   this.setState({speed: event.target.value});
    // }
  }

  handleCommandedSpeedChange(event) {
    // 43 represents top speed of train in MPH
    if(event.target.value > 43)
    {
      this.setState({speed: 43});
    }
    else if (event.target.value < 0)
    {
      this.setState({speed: 0});
    }
    else{
      this.setState({commandedSpeed: event.target.value});
    }
  }

  handleSpeedLimitChange(event){
    if(event.target.value > 43)
    {
      this.setState({speedLimit: 43});
    }
    else if (event.target.value < 0)
    {
      this.setState({speedLimit: 0});
    }
    else{
      this.setState({speedLimit: event.target.value});
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
      this.setState({cabinTemperature: 60});
    }
    else if (event.target.value > 77){
      this.setState({cabinTemperature: 77});
    }
    else{
      this.setState({cabinTemperature: event.target.value});
    }
  }

  handlePowerChange(event) {
    this.setState({power: event.target.value});
  }

  handleSpeedSubmit(event) {
    alert('Speed is set: ' + this.state.speed + ' MPH');
    event.preventDefault();
  }

  handleCommandedSpeedSubmit(event) {
    alert('Commanded Speed is set: ' + this.state.commandedSpeed + ' MPH');
    event.preventDefault();
  }

  handleAuthoritySubmit(event) {
    alert('Authority is set: ' + this.state.authority + ' Blocks');
    event.preventDefault();
  }

  handleTemperatureSubmit(event) {
    alert('Temperature is set: ' + this.state.cabinTemperature + ' degrees F');
    event.preventDefault();
  }

  handlePowerSubmit(event) {
    alert('Power is set: ' + this.state.power + ' Kilowatts');
    event.preventDefault();
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
    if (this.state.powerCMD < this.state.maxPower){
      this.setState((prevState) => ({
        power: (prevState.power + (this.state.T/2000)*(this.state.setSpeed + this.state.currentSpeed)),
      }));
    }

    // If P_cmd >= P_max, use this equation
    else if (this.state.powerCMD >= this.state.maxPower){
      this.setState((prevState) => ({
        power: prevState.power,
      }));
    }

    // Final Power Calculation
    this.setState({powerCMD: ((this.state.k_p*this.state.setSpeed)+(this.state.k_i*this.state.u_k))})
  }


  testUI() {

    return (

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
            <form onSubmit={this.handlePowerSubmit}>
              <label>
                Power:
                <input type="number" value={this.state.power} onChange={this.handlePowerChange} />
              </label>
                <input type="submit" value="Submit" />
            </form>
          </Grid>
          <Grid item xs={3} md={3}>
            <form onSubmit={this.handleTemperatureSubmit}>
              <label>
                Cabin Temperature:
                <input type="number" value={this.state.cabinTemperature} onChange={this.handleTemperatureChange} />
              </label>
                <input type="submit" value="Submit" />
            </form>
          </Grid>
          <Grid item xs={4} md={2}>
            <form onSubmit={this.handleSpeedSubmit}>
              <label>
                Speed:
                <input type="number" value={this.state.speed} onChange={this.handleSpeedChange} />
              </label>
                <input type="submit" value="Submit" />
            </form>
          </Grid>
          <Grid item xs={4} md={4}>
            <form onSubmit={this.handleCommandedSpeedSubmit}>
              <label>
                Commanded Speed:
                <input type="number" value={this.state.commandedSpeed} onChange={this.handleCommandedSpeedChange} />
              </label>
                <input type="submit" value="Submit" />
            </form>
          </Grid>
          <Grid item xs={4} md={2}>
            <form onSubmit={this.handleAuthoritySubmit}>
              <label>
                Authority:
                <input type="number" value={this.state.authority} onChange={this.handleAuthorityChange} />
              </label>
                <input type="submit" value="Submit" />
            </form>
          </Grid>
          <Grid item xs={4} md={2}>
              <label>
                Speed Limit:
                <input type="number" value={this.state.speedLimit} onChange={this.handleSpeedLimitChange} />
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
          </Stack>
        </Grid>
      </Box>
    );
  }

  render() {
    if (this.state.testMode) return this.testUI();

    return (
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
          <Grid item xs={5} md={8}>
            <Item>
              <FormGroup>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Automatic/Manual Mode"
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
            <Item>Cabin Temperature</Item>
          </Grid>
          <Grid item xs={4} md={2}>
            <Item>SPEED: _ MPH</Item>
          </Grid>
          <Grid item xs={4} md={2}>
            <Item>Commanded Speed: _ MPH</Item>
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
          </Stack>
        </Grid>
      </Box>
    );
  }
}

export default TrainControllerSW;
