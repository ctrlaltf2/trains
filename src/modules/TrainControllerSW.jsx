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
import { array } from 'prop-types';

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

          // If receiving a beacon and authority = 0,
          // this is the station the train is supposed to stop at
          if (this.authority === 0){
            // Stop the train
            this.authorityStop();

            // Open the correct doors
            this.platformSide();
          }

          break;
        case 'newTrain':
          this.handleDropdownChange(payload.newTrain);
          break;
        case 'Underground':
          this.under = payload.Underground;

          this.underground();

        default:
          console.warn('Unknown payload type received: ', payload.type);
      }
    });

    this.state = {
      // UIs
      testMode: false,
      engineerMode: false,

      // Doors and Lights, as well as environment variables affecting them
      leftDoorsUI: true,
      rightDoorsUI: true,
      trainLightsUI: true,
      cabinLightsUI: true,
      under: false, // Variable for if the train is underground

      // Service Brake, Emergency Brake, and failure toggles
      emergencyButtonUI: false,
      brakeStatusUI: false,

      // display = false means the component is working
      brakeFailureDisplay: false,
      engineFailureDisplay: false,
      signalPickupFailureDisplay: false,
      automaticModeUI: true,


      // Values that display on the UI
      temperatureUI: 70,
      authorityUI: 10,
      stationNameUI: '',
      currentTrain: 1,

      //Power & Speed Variables
      powerUI: 0, // power is in kilowatts
      k_p_UI: 0, // Proportional Gain
      k_i_UI: 0, // Integral Gain
      setSpeedUI: 0, // Speed set by the driver: the speech you want to approach
      currentSpeedUI: 0, // The current speed of the train, also known as currentVelocity, in meters per second
      currentSpeedUI_MPH: 0, // Current speed, converted to miles per hour
      commandedSpeedUI: 0,
      commandedSpeedUI_MPH: 0,
      suggestedSpeedUI: 0,
      suggestedSpeedUI_MPH: 0,
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
    this.setSpeedmeters = 0; // Desired speed converted to m/s for power calculation
    this.currentSpeedmeters = 0;
    this.powerCalc_vitality = []; // Array where the power calculations will be stored
    this.bestPower = 0; // The result of taking the mode of the 3 power calculations


    this.temperature = 70;
    this.authority = 10;
    this.stationName = '';
    this.stationSide = '';

    this.automaticMode = true;
    this.rightDoors = true;
    this.leftDoors = true;
    this.trainLights = true;
    this.cabinLights = true;
    this.brakeStatus = false;
    this.emergencyButton = false;

    // For multiple trains
    this.trainAttributes = Array(21);

    for(let i = 0; i < this.trainAttributes.length; ++i) {
      this.trainAttributes[i] = {
        'id': this.state.currentTrain,
        'temperature': 0,
        'currentSpeed': 0,
        'currentSpeedmeters': 0,
        'suggestedSpeed': 0,
        'commandedSpeed': 0,
        'k_p': 0,
        'k_i': 0,
        'authority': 0,
        'setSpeed': 0,
        'setSpeedmeters': 0,
        'setSpeedkilo': 0,
        'stationName': '',
        'power': 0,
        'error_k': 0,
        'error_kprev': 0,
        'cumulative_err': 0,
        'automaticMode': false,
        'brakeStatus': false,
        'emergencyButton': false,
        'engineFailureDisplay': false,
        'brakeFailureDisplay': false,
        'signalPickupFailureDisplay': false,
        'leftDoors': true,
        'rightDoors': true,
        'trainLights': true,
        'cabinLights': true,
        'powerCalc_vitality': Array(3),
        'bestPower': 0,
      };
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

    //  Conversion functions
    this.kilo_to_miles = this.kilo_to_miles.bind(this);
    this.miles_to_kilo = this.miles_to_kilo.bind(this);
    this.miles_to_meters = this.miles_to_meters.bind(this);
    this.meters_to_miles = this.meters_to_miles.bind(this);
  };

  componentDidMount(){ // This acts as the Main program - where the functions are called
    setInterval( () => {

      //UPDATE UI VALUES
      this.setState({temperatureUI: this.trainAttributes[this.state.currentTrain].temperature});
      //this.setState({currentSpeedUI : this.trainAttributes[this.state.currentTrain].currentSpeed});
      //this.setState({commandedSpeedUI: this.trainAttributes[this.state.currentTrain].commandedSpeed});
      this.setState({stationNameUI: this.trainAttributes[this.state.currentTrain].stationName});
      this.setState({setSpeedUI: this.trainAttributes[this.state.currentTrain].setSpeed});
      //this.setState({suggestedSpeedUI: this.trainAttributes[this.state.currentTrain].suggestedSpeed});
      this.setState({currentSpeedUI_MPH: this.trainAttributes[this.state.currentTrain].currentSpeed});
      this.setState({commandedSpeedUI_MPH: this.trainAttributes[this.state.currentTrain].commandedSpeed});
      this.setState({suggestedSpeedUI_MPH: this.trainAttributes[this.state.currentTrain].suggestedSpeed});
      this.setState({powerUI: this.trainAttributes[this.state.currentTrain].power});
      this.setState({automaticModeUI: this.trainAttributes[this.state.currentTrain].automaticMode});
      this.setState({leftDoorsUI: this.trainAttributes[this.state.currentTrain].leftDoors});
      this.setState({rightDoorsUI: this.trainAttributes[this.state.currentTrain].rightDoors});
      this.setState({trainLightsUI: this.trainAttributes[this.state.currentTrain].trainLights});
      this.setState({cabinLightsUI: this.trainAttributes[this.state.currentTrain].cabinLights});
      this.setState({brakeStatusUI: this.trainAttributes[this.state.currentTrain].brakeStatus});
      this.setState({emergencyButtonUI: this.trainAttributes[this.state.currentTrain].emergencyButton});
      // Automatic Mode
      if(this.trainAttributes[this.state.currentTrain].automaticMode === true){


        // Stop the train when authority reaches 0
        if(this.trainAttributes[this.state.currentTrain].authority === 0){
          this.authorityStop();
        }
        else{

          // Speed should be set to the suggested speed
          // and updated on the UI in automatic mode
          this.setSpeed = Math.round(this.kilo_to_miles(this.suggestedSpeed));

          // Convert from miles per hour to km/h
          this.setSpeedkilo = this.miles_to_kilo(this.setSpeed);

          // Send desired speed to train model
          window.electronAPI.sendTrainModelMessage({
            'type': 'setSpeed',
            'setSpeed': this.setSpeedkilo,
          });

          // If there's a brake failure, engine failure,
          // or signal pickup failure, decrease the speed and stop
          if (this.state.brakeFailureDisplay || this.state.engineFailureDisplay || this.state.signalPickupFailureDisplay){
            this.setState({emergencyButton: true});
            this.setSpeed = 0;

            // Send desired speed to train model
            window.electronAPI.sendTrainModelMessage({
              'type': 'setSpeed',
              'setSpeed': this.setSpeed,
            });

            // Send emergency brake state to train model
            window.electronAPI.sendTrainModelMessage({
              'type': 'emergencyBrake',
              'emergencyBrake': this.state.emergencyButton,
            });
          }
          else{
            // Reset the emergency brake
            this.setState({emergencyButton: false});

            // Send emergency brake state to train model
            window.electronAPI.sendTrainModelMessage({
              'type': 'emergencyBrake',
              'emergencyBrake': this.state.emergencyButton,
            });
          }
        }

        // End of automatic mode code

      }

      // Manual Mode
      else{

        // Don't allow driver to start train
        // if authority is 0
        if (this.authority === 0){
          this.authorityStop();
        }
        else{

          if (this.setSpeed >= this.state.commandedSpeedUI_MPH){
            this.setSpeed = this.state.commandedSpeedUI_MPH;
          }

          // Convert from miles per hour to km/h
          this.setSpeedkilo = this.miles_to_kilo(this.setSpeed);

          // Send desired speed to train model
          window.electronAPI.sendTrainModelMessage({
            'type': 'setSpeed',
            'setSpeed': this.setSpeedkilo,
          });

          // If the service brake is activated while train is moving,
          // set the desired speed to 0 and toggle service brake UI
          if((this.state.brakeStatus === true) && (this.state.currentSpeedUI_MPH != 0)){
            this.setSpeed = 0;


            // Send desired speed to train model
            window.electronAPI.sendTrainModelMessage({
              'type': 'setSpeed',
              'setSpeed': this.setSpeed,
            });

            // Send service brake state to train model
            window.electronAPI.sendTrainModelMessage({
              'type': 'serviceBrake',
              'serviceBrake': this.state.brakeStatus,
            });

          }

          // If the emergency brake is activated while train is moving,
          // set the desired speed to 0 and toggle emergency brake UI

          if((this.state.emergencyButton === true) && (this.state.currentSpeedUI_MPH != 0)){
            this.setSpeed = 0;
            this.setState({setSpeedUI: this.setSpeed});

            // Convert from miles per hour to km/h
            this.setSpeedkilo = this.miles_to_kilo(this.setSpeed);

            // Send desired speed to train model
            window.electronAPI.sendTrainModelMessage({
              'type': 'setSpeed',
              'setSpeed': this.setSpeed,
            });

            // Send emergency brake state to train model
            window.electronAPI.sendTrainModelMessage({
              'type': 'emergencyBrake',
              'emergencyBrake': this.state.emergencyButton,
            });

          }
        }
      }

      // End of manual mode code

    }, 100)

  }

  // TRAIN FEATURES //


  handleTemperatureChange(event) {
    if(event.target.value < 60){
      this.trainAttributes[this.state.currentTrain].temperature = 60;
    }
    else if (event.target.value > 80){
      this.trainAttributes[this.state.currentTrain].temperature = 80;
    }
    else{
      this.trainAttributes[this.state.currentTrain].temperature = event.target.value;
    }

    // Send temperature to train model
    window.electronAPI.sendTrainModelMessage({
      'type': 'temperature',
      'temperature':  this.trainAttributes[this.state.currentTrain].temperature,
      'id': this.trainAttriubtes[this.state.currentTrain].id,

    });

  }

  handleDropdownChange(event) {
    console.log('Setting to ', event.target.value, event);
    this.setState({currentTrain: event.target.value});
  }

  emergencyBrake(){ // Toggles the emergency brake (ONLY FOR MANUAL MODE)
    this.trainAttributes[this.state.currentTrain].emergencyButton = !this.trainAttributes[this.state.currentTrain].emergencyButton;

    // Send emergency brake state to train model
    window.electronAPI.sendTrainModelMessage({
      'type': 'emergencyBrake',
      'emergencyBrake': this.trainAttributes[this.state.currentTrain].emergencyButton,
    });
  }

  toggleServiceBrake(){ // Turns the service brake on/off (ONLY FOR MANUAL MODE)
    this.trainAttributes[this.state.currentTrain].brakeStatus = !this.trainAttributes[this.state.currentTrain].brakeStatus

    // Send service brake state to train model
    window.electronAPI.sendTrainModelMessage({
      'type': 'serviceBrake',
      'serviceBrake': this.trainAttributes[this.state.currentTrain].brakeStatus,
    });
  }

  setDesiredSpeed(event){ // Speed of the train set by driver (ONLY FOR MANUAL MODE)

    if(event.target.value < 0){
      this.trainAttributes[this.state.currentTrain].setSpeed = 0;
    }
    else if (event.target.value > 43){
      this.trainAttributes[this.state.currentTrain].setSpeed = 43;
    }
    else{
      this.trainAttributes[this.state.currentTrain].setSpeed = event.target.value;
    }

    // Convert from miles per hour to km/h
    this.trainAttributes[this.state.currentTrain].setSpeedkilo = this.miles_to_kilo(this.trainAttributes[this.state.currentTrain].setSpeed);

    // Send desired speed to train model
    window.electronAPI.sendTrainModelMessage({
      'type': 'setSpeed',
      'setSpeed': this.trainAttributes[this.state.currentTrain].setSpeedkilo,
    });

  }

  // Test UI Functions
  // Or functions where I receieve values

  handleCurrentSpeedChange(event){ // Received from Train model in km/h
    if(event.target.value > 70)
    {
      this.trainAttributes[this.state.currentTrain].currentSpeed = 70;
    }
    else if (event.target.value < 0)
    {
      this.trainAttributes[this.state.currentTrain].currentSpeed = 0;
    }
    else{
      this.trainAttributes[this.state.currentTrain].currentSpeed = event.target.value;
    }

    // Create temporary variable
    const activeTrain_currentSpeed = this.trainAttributes[this.state.currentTrain].currentSpeed;

    if (activeTrain_currentSpeed === 70){
      activeTrain_currentSpeed = Math.round(this.kilo_to_miles(activeTrain_currentSpeed)) - 1;
    }
    else{
      activeTrain_currentSpeed = Math.round(this.kilo_to_miles(activeTrain_currentSpeed));
    }
  }

  handleCommandedSpeedChange(event) { // Comes from track model, received from train model
    // 70 represents top speed of train in km/h
    if(event.target.value > 70)
    {
      this.trainAttributes[this.state.currentTrain].commandedSpeed = 70;
    }
    else if (event.target.value < 0)
    {
      this.trainAttributes[this.state.currentTrain].commandedSpeed = 0;
    }
    else{
      this.trainAttributes[this.state.currentTrain].commandedSpeed = event.target.value;
    }

    const activeTrain_commandedSpeed = this.trainAttributes[this.state.currentTrain].commandedSpeed;

    if (activeTrain_commandedSpeed === 70){
      activeTrain_commandedSpeed = Math.round(this.kilo_to_miles(activeTrain_commandedSpeed)) - 1;
    }
    else{
      activeTrain_commandedSpeed = Math.round(this.kilo_to_miles(activeTrain_commandedSpeed));
    }

  }

  handleSuggestedSpeedChange(event){ // Changes the suggested speed, received from CTC office in km/h
    if(event.target.value > 70)
    {
      this.trainAttributes[this.state.currentTrain].suggestedSpeed = 70;
    }
    else if (event.target.value < 0)
    {
      this.trainAttributes[this.state.currentTrain].suggestedSpeed = 0;
    }
    else{
      this.trainAttributes[this.state.currentTrain].suggestedSpeed = event.target.value;
    }

    const activeTrain_suggestedSpeed = this.trainAttributes[this.state.currentTrain].suggestedSpeed;

    if (activeTrain_suggestedSpeed === 70){
      activeTrain_suggestedSpeed = Math.round(this.kilo_to_miles(activeTrain_suggestedSpeed)) - 1;
    }
    else{
      activeTrain_suggestedSpeed = Math.round(this.kilo_to_miles(activeTrain_suggestedSpeed));
    }
  }

  handleAuthorityChange(event) { // Changes the authority
    if(event.target.value < 0)
    {
      this.trainAttributes[this.state.currentTrain].authority = 0;
    }
    else{
      this.trainAttributes[this.state.currentTrain].authority = event.target.value;
    }

    const activeTrain_authority = this.trainAttributes[this.state.currentTrain].authority;
    // Display to the UI
    this.setState({authorityUI: activeTrain_authority});
  }


  // Engineer Functions
  setKp(event){
    if(event.target.value < 0){
      this.trainAttributes[this.state.currentTrain].k_p = 0;
    }
    else{
      this.trainAttributes[this.state.currentTrain].k_p = event.target.value;
    }

    const activeTrain_kp = this.trainAttributes[this.state.currentTrain].k_p;
    // Display to the UI
    this.setState({k_p_UI: activeTrain_kp});
  }

  setKi(event){
    if(event.target.value < 0){
      this.trainAttributes[this.state.currentTrain].k_i = 0;
    }
    else{
      this.trainAttributes[this.state.currentTrain].k_i = event.target.value;
    }


    const activeTrain_ki = this.trainAttributes[this.state.currentTrain].k_i;

    // Display to the UI
    this.setState({k_i_UI: activeTrain_ki});
  }

  // Conversion and calculation functions
  // Speed comes from Train Model calculation

  kilo_to_miles(speed) { // 1 km/h = approx. 1.609 mph
    return (speed / 1.609)
  }

  miles_to_kilo(speed) {
    return (speed * 1.609)
  }

  miles_to_meters(speed) {
    return (speed / 2.237)
  }

  meters_to_miles(speed) { // 1 m/s = approx. 2.237 mph
    return (speed * 2.237)
  }


  calculatePower() { // Function that calculates the current power of the train


    for (let i = 0; i < 3; i++){

      // Converting from mph to m/s
      this.trainAttributes[this.state.currentTrain].setSpeedmeters = Math.round(this.miles_to_meters(this.trainAttributes[this.state.currentTrain].setSpeed));
      // Converting km/h to m/s
      this.trainAttributes[this.state.currentTrain].currentSpeedmeters = Math.round(this.trainAttributes[this.state.currentTrain].currentSpeed / 3.6);


      // Calculate error
      this.trainAttributes[this.state.currentTrain].error_kprev = this.trainAttributes[this.state.currentTrain].error_k;
      this.trainAttributes[this.state.currentTrain].error_k = this.trainAttributes[this.state.currentTrain].setSpeedmeters - this.trainAttributes[this.state.currentTrain].currentSpeedmeters;

      // If P_cmd < P_max, use this equation
      if (this.trainAttributes[this.state.currentTrain].power < this.maxPower){
        this.trainAttributes[this.state.currentTrain].cumulative_err = ((this.T/2000)*(this.trainAttributes[this.state.currentTrain].error_k + this.trainAttributes[this.state.currentTrain].error_kprev));
      }

      // If P_cmd >= P_max, use this equation
      else if (this.trainAttributes[this.state.currentTrain].power >= this.maxPower){
        this.trainAttributes[this.state.currentTrain].cumulative_err = this.trainAttributes[this.state.currentTrain].cumulative_err;
      }

      // Final Power Calculation
      this.trainAttributes[this.state.currentTrain].powerCalc_vitality[i] = ((this.trainAttributes[this.state.currentTrain].k_p*this.trainAttributes[this.state.currentTrain].error_k) + (this.trainAttributes[this.state.currentTrain].k_i*this.trainAttributes[this.state.currentTrain].cumulative_err));

    }

    // Take the mode of the 3 calculations
    if (this.trainAttributes[this.state.currentTrain].powerCalc_vitality[0] === this.trainAttributes[this.state.currentTrain].powerCalc_vitality[1]){
      this.trainAttributes[this.state.currentTrain].bestPower = this.trainAttributes[this.state.currentTrain].powerCalc_vitality[0];
    }
    else if (this.trainAttributes[this.state.currentTrain].powerCalc_vitality[0] === this.trainAttributes[this.state.currentTrain].powerCalc_vitality[2]){
      this.bestPower = this.powerCalc_vitality[0];
    }
    else if (this.trainAttributes[this.state.currentTrain].powerCalc_vitality[1] === this.trainAttributes[this.state.currentTrain].powerCalc_vitality[2]){
      this.trainAttributes[this.state.currentTrain].bestPower = this.trainAttributes[this.state.currentTrain].powerCalc_vitality[1];
    }

    // If 2 of the 3 do not match, set best power to the minimum value
    else if (this.trainAttributes[this.state.currentTrain].powerCalc_vitality[0] <= this.trainAttributes[this.state.currentTrain].powerCalc_vitality[1] && this.trainAttributes[this.state.currentTrain].powerCalc_vitality[0] <= this.trainAttributes[this.state.currentTrain].powerCalc_vitality[2]){
      this.trainAttributes[this.state.currentTrain].bestPower = this.trainAttributes[this.state.currentTrain].powerCalc_vitality[0];
    }
    else if (this.trainAttributes[this.state.currentTrain].powerCalc_vitality[1] <= this.trainAttributes[this.state.currentTrain].powerCalc_vitality[0] && this.trainAttributes[this.state.currentTrain].powerCalc_vitality[1] <= this.trainAttributes[this.state.currentTrain].powerCalc_vitality[2]){
      this.trainAttributes[this.state.currentTrain].bestPower = this.trainAttributes[this.state.currentTrain].powerCalc_vitality[1];
    }
    else{
      this.trainAttributes[this.state.currentTrain].bestPower = this.trainAttributes[this.state.currentTrain].powerCalc_vitality[2];
    }

    this.trainAttributes[this.state.currentTrain].power = this.trainAttributes[this.state.currentTrain].bestPower;

    if (this.trainAttributes[this.state.currentTrain].power > this.maxPower){
      this.trainAttributes[this.state.currentTrain].power = this.maxPower;
    }
    else if (this.trainAttributes[this.state.currentTrain].power < -(this.maxPower)){
      this.trainAttributes[this.state.currentTrain].power = -(this.maxPower);
    }
    else{
      this.trainAttributes[this.state.currentTrain].power = this.trainAttributes[this.state.currentTrain].power;
    }
    // Send power command to train model
    window.electronAPI.sendTrainModelMessage({
      'type': 'power',
      'power': this.trainAttributes[this.state.currentTrain].power,
    });

  }

  // Environment functions
  // For automatic mode

  underground() { // Checks if the train is underground, activates lights accordingly
    if(this.under === true && this.trainAttributes[this.state.currentTrain].automaticMode === true){
      this.setState({trainLights: true});
    }
    else{
      this.setState({trainLights: false});
    }
  }

  platformSide(){ // Checks which side the station is on and opens the respective doors
    if(this.trainAttributes[this.state.currentTrain].automaticMode === true && this.trainAttributes[this.state.currentTrain].currentSpeed === 0 && this.platformSide == 'r'){
      // true = closed, false = open
      this.setState({rightDoors: false});
      this.trainAttributes[this.state.currentTrain].rightDoors = false;

      //turn on cabin lights
      this.setState({cabinLights: true});
    }
    else if (this.trainAttributes[this.state.currentTrain].automaticMode === true && this.trainAttributes[this.state.currentTrain].currentSpeed === 0 && this.platformSide === 'l'){
      this.setState({leftDoors: false});

      //turn on cabin lights
      this.setState({cabinLights: true});
    }
    else if (this.trainAttributes[this.state.currentTrain].automaticMode === true && this.trainAttributes[this.state.currentTrain].currentSpeed === 0 && this.platformSide === 'b'){
      this.setState({rightDoors: false});
      this.setState({leftDoors: false});

      //turn on cabin lights
      this.setState({cabinLights: true});
    }
  }


  authorityStop(){ // Call this function when authority hits 0
    this.setState({brakeStatus: true});
    this.trainAttributes[this.state.currentTrain].setSpeed = 0;


    // Send desired speed to train model
    window.electronAPI.sendTrainModelMessage({
      'type': 'setSpeed',
      'setSpeed': this.trainAttributes[this.state.currentTrain].setSpeed,
    });
  }

  toggleAutomatic(){ // Toggles between automatic mode and manual mode
    this.trainAttributes[this.state.currentTrain].automaticMode = !this.trainAttributes[this.state.currentTrain].automaticMode;
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
    this.trainAttributes[this.state.currentTrain].leftDoors = !this.trainAttributes[this.state.currentTrain].leftDoors;
    console.log(this.trainAttributes[this.state.currentTrain].leftDoors);
    // Send left door state to train model
    window.electronAPI.sendTrainModelMessage({
      'type': 'leftDoor',
      'leftDoor': this.trainAttributes[this.state.currentTrain].leftDoors,
    });
  }

  openRightDoors(){ // Toggles the right doors

    this.trainAttributes[this.state.currentTrain].rightDoors = !this.trainAttributes[this.state.currentTrain].rightDoors;

    console.log(this.trainAttributes[this.state.currentTrain].rightDoors);

    // Send right door state to train model
    window.electronAPI.sendTrainModelMessage({
      'type': 'rightDoor',
      'rightDoor': this.trainAttributes[this.state.currentTrain].rightDoors,
    });

  }

  trainLightsOnOff(){ // Toggles the exterior train lights on/off

    this.trainAttributes[this.state.currentTrain].trainLights = !this.trainAttributes[this.state.currentTrain].trainLights;

    // Send train light state to train model
    window.electronAPI.sendTrainModelMessage({
      'type': 'trainLights',
      'trainLights': this.trainAttributes[this.state.currentTrain].trainLights,
    });
  }

  cabinLightsOnOff(){ // Toggles the interior train lights on/off
    this.trainAttributes[this.state.currentTrain].cabinLights = !this.trainAttributes[this.state.currentTrain].cabinLights;

    // Send cabin light state to train model
    window.electronAPI.sendTrainModelMessage({
      'type': 'trainLights',
      'trainLights': this.trainAttributes[this.state.currentTrain].cabinLights,
    });
  }


  brakeFailure(status){ // Toggles the break failure display in the Test UI
    if(status === true){
      this.trainAttributes[this.currentTrain].brakeFailureDisplay === true;
    }
    else{
      this.trainAttributes[this.currentTrain].brakeFailureDisplay === false;
    }
  }

  engineFailure(status){ // Toggles the engine failure display in the Test UI
    if(status === true){
      this.trainAttributes[this.currentTrain].engineFailureDisplay === true;
    }
    else{
      this.trainAttributes[this.currentTrain].engineFailureDisplay === false;
    }
  }

  signalPickupFailure(status){ // Toggles the signal pickup failure display in the Test UI
    if(status === true){
      this.trainAttributes[this.currentTrain].signalPickupFailureDisplay === true;
    }
    else{
      this.trainAttributes[this.currentTrain].signalPickupFailureDisplay === false;
    }
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
                      label={this.state.leftDoorsUI ? "Left Doors: Closed" : "Left Doors: Open"}
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
                      label={this.state.rightDoorsUI ? "Right Doors: Closed" : "Right Doors: Open"}
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
                      label={this.state.trainLightsUI ? "Train Lights: On" : "Train Lights: Off"}
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
                      label={this.state.cabinLightsUI ? "Cabin Lights: On" : "Cabin Lights: Off"}
                    />
                  </FormGroup>
                </Item>
              </Grid>
            <Grid item xs={6} md={6}>
              <Item>
                {this.state.emergencyButtonUI ? (
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
                {this.state.brakeStatusUI ? (
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
                    label={this.state.automaticModeUI ? "Automatic Mode" : "Manual Mode"}
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
              {this.trainAttributes[this.state.currentTrain].brakeFailureDisplay ? (
                <Button variant="contained" color="error">
                  Brake Status: Failing
                </Button>
                ) : (
                <Button variant="contained" color="success">
                  Brake Status: Working
                </Button>
                )}
              {this.trainAttributes[this.state.currentTrain].engineFailureDisplay ? (
                <Button variant="contained" color="error">
                  Engine Status: Failing
                </Button>
                ) : (
                <Button variant="contained" color="success">
                  Engine Status: Working
                </Button>
                )}
              {this.trainAttributes[this.state.currentTrain].signalPickupFailureDisplay ? (
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
                value={this.state.currentTrain}
                label="Train ID"
                onChange={this.handleDropdownChange}
              >
                <MenuItem value={0}>Train 0</MenuItem>
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
              </Select>
            </FormControl>
        </Grid>
      </Box>
      </ThemeProvider>
    );
  }
}

export default TrainControllerSW;
