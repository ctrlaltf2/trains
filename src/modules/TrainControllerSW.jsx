import React, { useState } from 'react';
import {
  styled,
  Box,
  Paper,
  Grid,
  FormGroup,
  FormControlLabel,
  FormControl,
  InputLabel,
  MenuItem,
  Switch,
  Button,
  Slider,
  Select,
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

    // Module Communicaiton - Receiving Messages
    window.electronAPI.subscribeTrainControllerMessage( (_event, payload) => {
      console.log('IPC:TrainController: ', payload);

      switch(payload.type) {
        case 'commandedSpeed':
          this.handleCommandedSpeedChange(payload.commandedSpeed);
          break;
        case 'suggestedSpeed':
          this.handleSuggestedSpeedChange(payload.suggestedSpeed);
          break;
        case 'authority':
          this.handleAuthorityChange(payload.authority);
          break;
        case 'currentSpeed':
          this.handleCurrentSpeedChange(payload.currentSpeed);
          break;
        case 'brakeFailure':
          this.brakeFailure(payload.brakeFailure);
          break;
        case 'engineFailure':
          this.engineFailure(payload.engineFailure);
          break;
        case 'signalPickupFailure':
          this.signalPickupFailure(payload.signalPickupFailure);
          break;
        case 'Beacon':
          // Takes the appended character of station name and sets it to station side
          this.stationSide = payload.Beacon.charAt(payload.Beacon.length - 1);

          // Gets all but the last character of the string
          this.stationName = payload.Beacon.slice(0, -1);

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
      announcementsOnOff: false,
      transitLights: '',

      // Service Brake, Emergency Brake, and failure toggles
      emergencyButton: false,
      brakeFailureDisplay: false,
      engineFailureDisplay: false,
      signalPickupFailureDisplay: false,
      automaticMode: true,
      brakeStatus: false,

      commandedSpeedUI: 0,
      commandedSpeedUI_MPH: 0,
      suggestedSpeedUI: 0,
      suggestedSpeedUI_MPH: 0,
      temperatureUI: 70,
      authorityUI: 10,
      stationNameUI: '',
      currentTrain: 1,

      //Power & Velocity Variables
      powerUI: 0, // power is in kilowatts
      k_p_UI: 0, // Proportional Gain
      k_i_UI: 0, // Integral Gain
      setSpeedUI: 0, // Speed set by the driver: the speech you want to approach
      currentSpeedUI: 0, // The current speed of the train, also known as currentVelocity, in meters per second
      currentSpeedUI_MPH: 0, // Current speed, converted to miles per hour

    };

    // Backend variables used for calculations
    this.currentSpeed = 0;
    this.commandedSpeed = 0;
    this.suggestedSpeed = 0;
    this.power = 0;
    this.maxPower = 120000.0; // Max power of the train is 120 kilowatts
    this.cumulative_err = 0; //u_k
    this.k_p = 10000; // Proportional gain
    this.k_i = 0;     // Integral gain
    this.error_k = 0;
    this.error_kprev = 0;
    this.T = 2000;       // Sample period of the train model
    this.setSpeed = 0;
    this.setSpeedkilo = 0.0; // Desired speed converted to km/h for velocity calculation in Train Model


    this.temperature = 70;
    this.authority = 10;
    this.stationName = '';
    this.stationSide = '';
    this.trainID = [];

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
    this.authorityStop = this.authorityStop.bind(this);

    // Failures
    this.brakeFailure = this.brakeFailure.bind(this);
    this.engineFailure = this.engineFailure.bind(this);
    this.signalPickupFailure = this.signalPickupFailure.bind(this);

    // Handling Changes
    this.handleCurrentSpeedChange = this.handleCurrentSpeedChange.bind(this);
    this.handleCommandedSpeedChange = this.handleCommandedSpeedChange.bind(this);
    this.handleSuggestedSpeedChange = this.handleSuggestedSpeedChange.bind(this);
    this.handleAuthorityChange = this.handleAuthorityChange.bind(this);
    this.handleTemperatureChange = this.handleTemperatureChange.bind(this);
    this.handleDropdownChange = this.handleDropdownChange.bind(this);
    this.setKp = this.setKp.bind(this);
    this.setKi = this.setKi.bind(this);
    this.setDesiredSpeed = this.setDesiredSpeed.bind(this);
    this.setStationName = this.setStationName.bind(this);

    //  Conversion functions
    this.meters_to_miles = this.meters_to_miles.bind(this);
    this.miles_to_meters = this.miles_to_meters.bind(this);
  };

  componentDidMount(){ // This acts as the Main program - where the functions are called
    setInterval( () => {

      // Check to make sure train does not exceed maximum power
      if(this.power >= this.maxPower){
        this.setState({powerUI: this.maxPower});
      }
      else{
        this.setState({powerUI: this.power});
      }


      // Setting values for UI display
      this.setState({k_i_UI: this.k_i});
      this.setState({k_p_UI: this.k_p});
      this.setState({authorityUI: this.authority});
      this.setState({stationNameUI: this.stationName});
      this.setState({setSpeedUI: this.setSpeed});
      this.setState({temperatureUI: this.temperature});



      // Automatic Mode
      if(this.state.automaticMode == true){

        // // Train speed should be set to suggested speed in automatic mode
        // this.setState({setSpeedUI: this.state.suggestedSpeedUI_MPH});

        // If there's a brake failure, engine failure, or signal pickup failure, decrease the speed and stop
        if (this.state.brakeFailureDisplay || this.state.engineFailureDisplay || this.state.signalPickupFailureDisplay){
          this.setState({emergencyButton: true});
          this.setSpeed = 0;
          this.setState({setSpeedUI: 0});
        }
        else{
            // Reset the emergency brake
            this.setState({emergencyButton: false});
        }

        // Stop the train when authority reaches 0
        if(this.authority == 0){
          this.authorityStop();
        }

      }

      // Manual Mode
      else{

        // If the service brake is activated while train is moving,
        // set the desired speed to 0 and toggle service brake UI
        if((this.state.brakeStatus == true) && (this.state.currentSpeedUI_MPH != 0)){
          this.setSpeed = 0;
          this.setState({setSpeedUI: 0});
        }

        // If the emergency brake is activated while train is moving,
        // set the desired speed to 0 and toggle emergency brake UI

        if((this.state.emergencyButton == true) && (this.state.currentSpeedUI_MPH != 0)){
          this.setSpeed = 0;
          this.setState({setSpeedUI: 0});
        }

      }
    }, 100)

  }


  handleTemperatureChange(event) {
    if(event.target.value < 60){
      this.temperature = 60;
    }
    else if (event.target.value > 80){
      this.temperature = 80;
    }
    else{
      this.temperature = event.target.value;
      //this.temperature = this.trainID[this.state.currentTrain].temperature
    }

    // Send temperature to train model
    window.electronAPI.sendTrainModelMessage({
      'type': 'temperature',
      'temperature': this.temperature,
    });

  }

  handleDropdownChange(event) {
    this.setState({currentTrain: event.target.value});
  }

  emergencyBrake(){ // Toggles the emergency brake
    this.setState((prevState) => ({
      emergencyButton: !prevState.emergencyButton,
    }));

    // Send emergency brake state to train model
    window.electronAPI.sendTrainModelMessage({
      'type': 'emergencyBrake',
      'emergencyBrake': this.state.emergencyButton,
    });
  }

  toggleServiceBrake(){ // Turns the service brake on/off
    this.setState((prevState) => ({
      brakeStatus: !prevState.brakeStatus,
    }));

    // Send service brake state to train model
    window.electronAPI.sendTrainModelMessage({
      'type': 'serviceBrake',
      'serviceBrake': this.state.brakeStatus,
    });
  }

  setDesiredSpeed(event){

    if(event.target.value < 0){
      this.setSpeed = 0;
    }
    else if (event.target.value > 43){
      this.setSpeed = 43;
    }
    else{
      this.setSpeed = event.target.value;
    }


    // Convert from miles per hour to km/h
    this.setSpeedkilo = this.miles_to_meters(this.setSpeed);

    // Send desired speed  to train model
    window.electronAPI.sendTrainModelMessage({
      'type': 'setSpeed',
      'leftDoor': this.setSpeedkilo,
    });

  }

  // Test UI Functions

  handleCurrentSpeedChange(event){
    if(event.target.value > 70)
    {
      this.currentSpeed = 70;
    }
    else if (event.target.value < 0)
    {
      this.currentSpeed = 0;
    }
    else{
      this.currentSpeed = event.target.value;
    }

    // Update current speed on UI
    this.setState({currentSpeedUI: this.currentSpeed});

    if (this.currentSpeed == 70){
      this.setState({currentSpeedUI_MPH: Math.round(this.meters_to_miles(this.currentSpeed))-1});
    }
    else{
      this.setState({currentSpeedUI_MPH: Math.round(this.meters_to_miles(this.currentSpeed))});
    }
  }

  handleCommandedSpeedChange(event) { // Changes the commanded speed
    // 70 represents top speed of train in km/h
    if(event.target.value > 70)
    {
      this.commandedSpeed = 70;
    }
    else if (event.target.value < 0)
    {
      this.commandedSpeed = 0;
    }
    else{
      this.commandedSpeed = event.target.value;
    }

    // Update commanded speed on UI
    this.setState({commandedSpeedUI: this.commandedSpeed});

    if (this.commandedSpeed == 70){
      this.setState({commandedSpeedUI_MPH: Math.round(this.meters_to_miles(this.commandedSpeed))-1});
    }
    else{
      this.setState({commandedSpeedUI_MPH: Math.round(this.meters_to_miles(this.commandedSpeed))});
    }

  }

  handleSuggestedSpeedChange(event){ // Changes the suggested speed
    if(event.target.value > 70)
    {
      this.suggestedSpeed = 70;
    }
    else if (event.target.value < 0)
    {
      this.suggestedSpeed = 0;
    }
    else{
      this.suggestedSpeed = event.target.value;
    }

    // Update suggested speed on UI
    this.setState({suggestedSpeedUI: this.suggestedSpeed});

    if (this.suggestedSpeed == 70){
      this.setState({suggestedSpeedUI_MPH: Math.round(this.meters_to_miles(this.suggestedSpeed))-1});
    }
    else{
      this.setState({suggestedSpeedUI_MPH: Math.round(this.meters_to_miles(this.suggestedSpeed))});
    }
  }

  handleAuthorityChange(event) { // Changes the authority
    if(event.target.value < 0)
    {
      this.authority = 0;
    }
    else{
      this.authority = event.target.value;
    }
  }

  setStationName(event){ // Sets the station
    this.stationName = event.target.value;
  }

  // Engineer Functions
  setKp(event){
    if(event.target.value < 0){
      this.k_p = 0;
    }
    else{
      this.k_p = event.target.value;
    }
  }

  setKi(event){
    if(event.target.value < 0){
      this.k_i = 0;
    }
    else{
      this.k_i = event.target.value;
    }
  }

  // Conversion and calculation functions
  // Speed comes from Train Model calculation

  meters_to_miles(speed){ // 1 km/h = approx. 1.609 mph
    return (speed / 1.609)
  }

  miles_to_meters(speed){
    return (speed * 1.609)
  }

  calculatePower() { // Function that calculates the current power of the train

    // Convert speeds from km/h to m/s
    // this.setSpeed = this.setSpeed / 3.6;
    // this.currentSpeed = this.currentSpeed / 3.6;
    for (let i = 0; i < 3; i++){
      //todo
    }


    // Calculate error
    this.error_kprev = this.error_k;
    this.error_k = Math.abs(this.setSpeed - this.currentSpeed);

    // If P_cmd < P_max, use this equation
    if (this.power < this.maxPower){
      this.cumulative_err = ((this.T/2000)*(this.error_k + this.error_kprev));
    }

    // If P_cmd >= P_max, use this equation
    else if (this.power >= this.maxPower){
      this.cumulative_err = this.cumulative_err;
    }

    // Final Power Calculation
    this.power = ((this.k_p*this.error_k) + (this.k_i*this.cumulative_err));


    // Send power command to train model
    window.electronAPI.sendTrainModelMessage({
      'type': 'power',
      'power': this.power,
    });

  }

  // Environment functions
  // For automatic mode

  underground() { // Checks if the train is underground, activates lights accordingly
    if(this.under && this.automaticMode){
      this.setState({trainLights: true});
    }
    else{
      this.setState({trainLights: false});
    }
  }

  platformSide(){ // Checks which side the station is on and opens the respective doors
    if(this.automaticMode == true && this.currentSpeed == 0 && this.platformSide == 'r'){
      // true = closed, false = open
      this.setState({rightDoors: false});
    }
    else if (this.automaticMode = true && this.currentSpeed == 0 && this.platformSide == 'l'){
      this.setState({leftDoors: false});
    }
    else if (this.automaticMode = true && this.currentSpeed == 0 && this.platformSide == 'b'){
      this.setState({rightDoors: false});
      this.setState({leftDoors: false});
    }
  }

  announcements(){

  }

  authorityStop(){ // Call this function when authority hits 0
      this.setState({brakeStatus: true});
      this.setSpeed = 0;
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
          <input type="number" value={this.state.k_p_UI} onChange={this.setKp} />
          </label>
        </Grid>
        <Grid item xs={3} md={3}>
          <label>
            Ki:
          <input type="number" value={this.state.k_i_UI} onChange={this.setKi} />
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
          <Grid item xs={4} md={4}>
              <label>
                Commanded Speed:
                <input type="number" value={this.state.commandedSpeedUI} onChange={this.handleCommandedSpeedChange} />
              </label>
          </Grid>
          <Grid item xs={4} md={4}>
              <label>
                Suggested Speed:
                <input type="number" value={this.state.suggestedSpeedUI} onChange={this.handleSuggestedSpeedChange} />
              </label>
          </Grid>
          <Grid item xs={4} md={2}>
              <label>
                Authority:
                <input type="number" value={this.state.authorityUI} onChange={this.handleAuthorityChange} />
              </label>
          </Grid>
          <Grid item xs={4} md={2}>
              <label>
                Current Speed:
                <input type="number" value={this.state.currentSpeedUI} onChange={this.handleCurrentSpeedChange} />
              </label>
          </Grid>
          <Grid item xs={4} md={2}>
              <label>
                Station Name:
                <input type="text" value={this.state.stationNameUI} onChange={this.setStationName} />
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
    // Calculate power
    this.calculatePower();

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
              <Grid item xs={8} md={6}>
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
              <Grid item xs={8} md={6}>
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
              <Grid item xs={8} md={6}>
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
              <Grid item xs={8} md={6}>
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
            <Grid item xs={6} md={6}>
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
            <Grid item xs={6} md={6}>
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
            <Grid item xs={2} md={3}>
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
            <Grid item xs={4} md={4}>
              <Item>Power: {this.state.powerUI / 1000} Kilowatts</Item>
            </Grid>
            <Grid item xs={4} md={4}>
              <Item>Current Speed: {this.state.currentSpeedUI_MPH} MPH</Item>
            </Grid>
            <Grid item xs={4} md={2}>
              <label>
                Set Speed (MPH):
                <input type="number" value={this.state.setSpeedUI} onChange={this.setDesiredSpeed} />
              </label>
            </Grid>
            <Grid item xs={4} md={2}>
              <Item>Commanded Speed: {this.state.commandedSpeedUI_MPH} MPH</Item>
            </Grid>
            <Grid item xs={4} md={2}>
              <Item>Suggested Speed: {this.state.suggestedSpeedUI_MPH} MPH</Item>
            </Grid>
            <Grid item xs={4} md={2}>
              <Item>Authority: {this.state.authorityUI} Blocks</Item>
            </Grid>
            <Grid item xs={5} md={2}>
              <Item>Next Stop: {this.state.stationNameUI} </Item>
            </Grid>
            <Grid item xs={3} md={2}>
                <label>
                  Temperature (F):
                  <input type="number" value={this.state.temperatureUI} onChange={this.handleTemperatureChange} />
                </label>
            </Grid>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={6}>
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
            <Stack spacing={2} direction="row" >
              <Button variant="contained" onClick={this.toggle} style={{margin: '1rem'}}>
                Toggle Test UI
              </Button>
              <Button variant="contained" onClick={this.toggleEngineer} style={{margin: '1rem'}}>
                Toggle Engineer Panel
              </Button>
            </Stack>
            <FormControl sx={{ m: 1, width: 300 }}>
              <InputLabel id="demo-simple-select-label">Train ID</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={this.trainID[this.state.currentTrain]}
                label="Train ID"
                onChange={this.handleDropdownChange}
              >
                <MenuItem value={1}>Train 1</MenuItem>
                <MenuItem value={2}>Train 2</MenuItem>
                <MenuItem value={3}>Train 3</MenuItem>
                <MenuItem value={4}>Train 4</MenuItem>
                <MenuItem value={5}>Train 5</MenuItem>
                <MenuItem value={6}>Train 6</MenuItem>
                <MenuItem value={7}>Train 7</MenuItem>
                <MenuItem value={8}>Train 8</MenuItem>
                <MenuItem value={9}>Train 9</MenuItem>
                <MenuItem value={10}>Train 10</MenuItem>
                <MenuItem value={11}>Train 11</MenuItem>
                <MenuItem value={12}>Train 12</MenuItem>
                <MenuItem value={13}>Train 13</MenuItem>
                <MenuItem value={14}>Train 14</MenuItem>
                <MenuItem value={15}>Train 15</MenuItem>
                <MenuItem value={16}>Train 16</MenuItem>
                <MenuItem value={17}>Train 17</MenuItem>
                <MenuItem value={18}>Train 18</MenuItem>
                <MenuItem value={19}>Train 19</MenuItem>
              </Select>
            </FormControl>
        </Grid>
      </Box>
      </ThemeProvider>
    );
  }
}

export default TrainControllerSW;
